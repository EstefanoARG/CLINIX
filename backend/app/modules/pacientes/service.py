from __future__ import annotations

import os
import math
from uuid import uuid4
from datetime import datetime

from fastapi import UploadFile
from sqlalchemy.orm import Session, joinedload

from app.core.config import settings
from app.core.audit import registrar_auditoria
from app.core.exceptions import NotFoundError, ConflictError
from app.models import Paciente, HistoriaClinica, DocumentoAdjunto, Medico
from app.modules.pacientes.schemas import (
    PacienteCreate, PacienteUpdate,
    HistoriaClinicaCreate, HistoriaClinicaUpdate,
    DocumentoAdjuntoCreate,
)
from domain.entities.paciente import Paciente as PacienteDomain
from domain.value_objects.dni import DNI
from domain.repositories import PacienteRepository
from infrastructure.uow import UnitOfWork
from infrastructure.mappers.paciente_mapper import PacienteMapper


def _paciente_to_dict(p: Paciente) -> dict:
    return {
        "paciente_id": p.PacienteID,
        "clinical_id": p.ClinicalID,
        "dni": p.DNI,
        "nombre": p.Nombre,
        "apellido": p.Apellido,
        "fecha_nacimiento": p.FechaNacimiento,
        "genero": p.Genero,
        "direccion": p.Direccion,
        "telefono": p.Telefono,
        "email": p.Email,
        "grupo_sanguineo": p.GrupoSanguineo,
        "alergias": p.Alergias,
        "activo": p.Activo,
        "fecha_registro": p.FechaRegistro,
    }


def _historia_to_dict(h: HistoriaClinica) -> dict:
    d = {
        "historial_id": h.HistorialID,
        "paciente_id": h.PacienteID,
        "medico_id": h.MedicoID,
        "cita_id": h.CitaID,
        "admision_id": h.AdmisionID,
        "anamnesis": h.Anamnesis,
        "diagnostico": h.Diagnostico,
        "tratamiento": h.Tratamiento,
        "prescripcion": h.Prescripcion,
        "observaciones": h.Observaciones,
        "fecha_registro": h.FechaRegistro,
    }
    medico = getattr(h, "medico", None)
    if medico is not None:
        d["medico"] = {
            "medico_id": medico.MedicoID,
            "nombre": medico.usuario.Nombre if medico.usuario else None,
            "apellido": medico.usuario.Apellido if medico.usuario else None,
            "especialidad": medico.especialidad.NombreEspecialidad if medico.especialidad else None,
        }
    documentos = getattr(h, "documentos", None)
    if documentos is not None:
        d["documentos"] = [_documento_to_dict(doc) for doc in documentos]
    return d


def _documento_to_dict(d: DocumentoAdjunto) -> dict:
    return {
        "documento_id": d.DocumentoID,
        "historial_id": d.HistorialID,
        "blob_url": d.BlobURL,
        "nombre_archivo": d.NombreArchivo,
        "tipo_archivo": d.TipoArchivo,
        "tamano_kb": d.TamanoKB,
        "descripcion": d.Descripcion,
        "fecha_subida": d.FechaSubida,
    }


class PacienteService:
    def __init__(self, db: Session, uow: UnitOfWork | None = None):
        self.db = db
        self.uow = uow or UnitOfWork(db)

    def _get_paciente_orm(self, paciente_id: int) -> Paciente:
        paciente = self.db.query(Paciente).filter(Paciente.PacienteID == paciente_id).first()
        if not paciente:
            raise NotFoundError("Paciente not found")
        return paciente

    def list(self, skip: int = 0, limit: int = 100, activo: bool | None = None) -> dict:
        query = self.db.query(Paciente)
        if activo is not None:
            query = query.filter(Paciente.Activo == activo)
        total = query.count()
        items = query.order_by(Paciente.Apellido, Paciente.Nombre).offset(skip).limit(limit).all()
        return {"items": [_paciente_to_dict(p) for p in items], "total": total}

    def search(self, q: str, skip: int = 0, limit: int = 100) -> dict:
        pattern = f"%{q}%"
        query = self.db.query(Paciente).filter(
            Paciente.DNI.ilike(pattern)
            | Paciente.Nombre.ilike(pattern)
            | Paciente.Apellido.ilike(pattern)
            | Paciente.Email.ilike(pattern)
        )
        total = query.count()
        items = query.offset(skip).limit(limit).all()
        return {"items": [_paciente_to_dict(p) for p in items], "total": total}

    def get(self, paciente_id: int) -> dict:
        paciente = self._get_paciente_orm(paciente_id)
        return _paciente_to_dict(paciente)

    def create(self, data: PacienteCreate) -> dict:
        existing = self.db.query(Paciente).filter(
            Paciente.ClinicalID == data.clinical_id,
            Paciente.DNI == data.dni,
        ).first()
        if existing:
            raise ConflictError("Paciente with this DNI already exists in this clinic")

        domain = PacienteDomain(
            paciente_id=None,
            clinical_id=data.clinical_id,
            dni=DNI(data.dni),
            nombre=data.nombre,
            apellido=data.apellido,
            fecha_nacimiento=data.fecha_nacimiento,
            genero=data.genero,
            direccion=data.direccion,
            telefono=data.telefono,
            email=data.email,
            grupo_sanguineo=data.grupo_sanguineo,
            alergias=data.alergias,
        )
        saved = self.uow.pacientes.save(domain)
        self.uow.session.commit()
        self.uow.session.refresh(
            self.db.query(Paciente).filter(Paciente.PacienteID == saved.paciente_id).first()
        )
        registrar_auditoria(self.db, None, "CREAR_PACIENTE",
                            f"Paciente creado: {saved.nombre} {saved.apellido}",
                            "PACIENTE", saved.paciente_id)
        return self.get(saved.paciente_id)

    def update(self, paciente_id: int, data: PacienteUpdate) -> dict:
        paciente = self._get_paciente_orm(paciente_id)
        domain = PacienteMapper.to_domain(paciente)
        update_data = data.model_dump(exclude_unset=True)
        if "dni" in update_data:
            domain.dni = DNI(update_data.pop("dni"))
        if "fecha_nacimiento" in update_data:
            domain.fecha_nacimiento = update_data.pop("fecha_nacimiento")
        if "grupo_sanguineo" in update_data:
            domain.grupo_sanguineo = update_data.pop("grupo_sanguineo")
        if "activo" in update_data:
            domain.activo = update_data.pop("activo")
        for key, value in update_data.items():
            setattr(domain, key, value)
        PacienteMapper.update_orm(domain, paciente)
        self.db.commit()
        self.db.refresh(paciente)
        registrar_auditoria(self.db, None, "ACTUALIZAR_PACIENTE",
                            f"Paciente actualizado: {paciente.Nombre} {paciente.Apellido}",
                            "PACIENTE", paciente.PacienteID)
        return _paciente_to_dict(paciente)

    def delete(self, paciente_id: int) -> None:
        paciente = self._get_paciente_orm(paciente_id)
        domain = PacienteMapper.to_domain(paciente)
        domain.desactivar()
        PacienteMapper.update_orm(domain, paciente)
        self.db.commit()
        registrar_auditoria(self.db, None, "DESACTIVAR_PACIENTE",
                            f"Paciente desactivado: {paciente.Nombre} {paciente.Apellido}",
                            "PACIENTE", paciente.PacienteID)

    def get_historias(self, paciente_id: int) -> list[dict]:
        self._get_paciente_orm(paciente_id)
        historias = self.db.query(HistoriaClinica).options(
            joinedload(HistoriaClinica.medico).joinedload(Medico.usuario),
            joinedload(HistoriaClinica.medico).joinedload(Medico.especialidad),
        ).filter(HistoriaClinica.PacienteID == paciente_id).order_by(
            HistoriaClinica.FechaRegistro.desc()
        ).all()
        return [_historia_to_dict(h) for h in historias]

    def create_historia(self, paciente_id: int, data: HistoriaClinicaCreate) -> dict:
        self._get_paciente_orm(paciente_id)
        historia = HistoriaClinica(
            PacienteID=paciente_id,
            MedicoID=data.medico_id,
            CitaID=data.cita_id,
            AdmisionID=data.admision_id,
            Anamnesis=data.anamnesis,
            Diagnostico=data.diagnostico,
            Tratamiento=data.tratamiento,
            Prescripcion=data.prescripcion,
            Observaciones=data.observaciones,
        )
        self.db.add(historia)
        self.db.commit()
        self.db.refresh(historia)
        registrar_auditoria(self.db, None, "CREAR_HISTORIA",
                            f"Historia clínica creada para paciente {paciente_id}",
                            "HISTORIA_CLINICA", historia.HistorialID)
        return _historia_to_dict(historia)

    def get_historia(self, paciente_id: int, historial_id: int) -> dict:
        self._get_paciente_orm(paciente_id)
        historia = self.db.query(HistoriaClinica).options(
            joinedload(HistoriaClinica.medico).joinedload(Medico.usuario),
            joinedload(HistoriaClinica.medico).joinedload(Medico.especialidad),
            joinedload(HistoriaClinica.documentos),
        ).filter(
            HistoriaClinica.HistorialID == historial_id,
            HistoriaClinica.PacienteID == paciente_id,
        ).first()
        if not historia:
            raise NotFoundError("Historia clinica not found")
        return _historia_to_dict(historia)

    def update_historia(self, paciente_id: int, historial_id: int, data: HistoriaClinicaUpdate) -> dict:
        historia_orm = self._get_historia_orm(paciente_id, historial_id)
        update_data = data.model_dump(exclude_unset=True)
        attr_map = {
            "diagnostico": "Diagnostico",
            "tratamiento": "Tratamiento",
            "prescripcion": "Prescripcion",
            "observaciones": "Observaciones",
            "anamnesis": "Anamnesis",
        }
        for key, value in update_data.items():
            col_name = attr_map.get(key)
            if col_name and value is not None:
                setattr(historia_orm, col_name, value)
        self.db.commit()
        self.db.refresh(historia_orm)
        return _historia_to_dict(historia_orm)

    def _get_historia_orm(self, paciente_id: int, historial_id: int) -> HistoriaClinica:
        self._get_paciente_orm(paciente_id)
        historia = self.db.query(HistoriaClinica).options(
            joinedload(HistoriaClinica.medico).joinedload(Medico.usuario),
            joinedload(HistoriaClinica.medico).joinedload(Medico.especialidad),
            joinedload(HistoriaClinica.documentos),
        ).filter(
            HistoriaClinica.HistorialID == historial_id,
            HistoriaClinica.PacienteID == paciente_id,
        ).first()
        if not historia:
            raise NotFoundError("Historia clinica not found")
        return historia

    def create_documento(self, paciente_id: int, historial_id: int, data: DocumentoAdjuntoCreate) -> dict:
        self._get_historia_orm(paciente_id, historial_id)
        doc = DocumentoAdjunto(
            HistorialID=historial_id,
            BlobURL=data.blob_url,
            NombreArchivo=data.nombre_archivo,
            TipoArchivo=data.tipo_archivo,
            TamanoKB=data.tamano_kb,
            Descripcion=data.descripcion,
            SubidoPorUsuarioID=data.subido_por_usuario_id,
        )
        self.db.add(doc)
        self.db.commit()
        self.db.refresh(doc)
        registrar_auditoria(self.db, None, "CREAR_DOCUMENTO",
                            f"Documento adjunto a historia {historial_id}: {doc.NombreArchivo}",
                            "DOCUMENTO_ADJUNTO", doc.DocumentoID)
        return _documento_to_dict(doc)

    def get_documentos(self, paciente_id: int, historial_id: int) -> list[dict]:
        self._get_historia_orm(paciente_id, historial_id)
        docs = self.db.query(DocumentoAdjunto).filter(
            DocumentoAdjunto.HistorialID == historial_id
        ).all()
        return [_documento_to_dict(d) for d in docs]

    def upload_documento(self, paciente_id: int, historial_id: int, file: UploadFile,
                         descripcion: str | None = None, usuario_id: int | None = None) -> dict:
        self._get_historia_orm(paciente_id, historial_id)

        ext = os.path.splitext(file.filename or "file")[1].lower() if file.filename else ""
        allowed = {".pdf", ".jpg", ".jpeg", ".png", ".dcm", ".doc", ".docx", ".xlsx"}
        if ext not in allowed:
            raise ConflictError(f"File type {ext} not allowed")

        upload_dir = os.path.join(settings.UPLOAD_DIR, str(historial_id))
        os.makedirs(upload_dir, exist_ok=True)

        filename = f"{uuid4().hex}{ext}"
        filepath = os.path.join(upload_dir, filename)

        content = file.file.read()
        size_kb = math.ceil(len(content) / 1024)

        with open(filepath, "wb") as f:
            f.write(content)

        tipo_map = {
            ".pdf": "PDF", ".jpg": "JPEG", ".jpeg": "JPEG",
            ".png": "PNG", ".dcm": "DICOM", ".doc": "DOC",
            ".docx": "DOC", ".xlsx": "XLSX",
        }
        tipo = tipo_map.get(ext, "Otro")

        doc = DocumentoAdjunto(
            HistorialID=historial_id,
            BlobURL=filepath,
            NombreArchivo=file.filename or filename,
            TipoArchivo=tipo,
            TamanoKB=size_kb,
            Descripcion=descripcion,
            SubidoPorUsuarioID=usuario_id,
        )
        self.db.add(doc)
        self.db.commit()
        self.db.refresh(doc)
        registrar_auditoria(self.db, None, "SUBIR_DOCUMENTO",
                            f"Archivo subido: {doc.NombreArchivo}",
                            "DOCUMENTO_ADJUNTO", doc.DocumentoID)
        return _documento_to_dict(doc)

    def get_documento_path(self, paciente_id: int, historial_id: int, documento_id: int) -> tuple[str, str]:
        self._get_historia_orm(paciente_id, historial_id)
        doc = self.db.query(DocumentoAdjunto).filter(
            DocumentoAdjunto.DocumentoID == documento_id,
            DocumentoAdjunto.HistorialID == historial_id,
        ).first()
        if not doc:
            raise NotFoundError("Documento not found")
        if not doc.BlobURL or not os.path.exists(doc.BlobURL):
            raise NotFoundError("File not found on disk")
        return doc.BlobURL, doc.NombreArchivo

    def delete_documento(self, paciente_id: int, historial_id: int, documento_id: int) -> None:
        self._get_historia_orm(paciente_id, historial_id)
        doc = self.db.query(DocumentoAdjunto).filter(
            DocumentoAdjunto.DocumentoID == documento_id,
            DocumentoAdjunto.HistorialID == historial_id,
        ).first()
        if not doc:
            raise NotFoundError("Documento not found")
        if doc.BlobURL and os.path.exists(doc.BlobURL):
            try:
                os.remove(doc.BlobURL)
            except OSError:
                pass
        self.db.delete(doc)
        self.db.commit()
        registrar_auditoria(self.db, None, "ELIMINAR_DOCUMENTO",
                            f"Documento eliminado: {doc.NombreArchivo}",
                            "DOCUMENTO_ADJUNTO", documento_id)
