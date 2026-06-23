from __future__ import annotations

from datetime import datetime
from sqlalchemy.orm import Session, joinedload

from app.core.exceptions import NotFoundError, ConflictError
from app.core.audit import registrar_auditoria
from app.core.email_sender import send_admission_notification
from app.core.events import PacienteAdmitido, AltaMedica, publish
from app.models import (
    Habitacion, Admision, Paciente, Medico, Enfermero, Usuario,
)
from app.modules.admisiones.schemas import (
    HabitacionCreate, HabitacionUpdate,
    AdmisionCreate, AdmisionUpdate, AltaRequest,
)
from domain.entities.habitacion import Habitacion as HabitacionDomain
from domain.entities.admision import Admision as AdmisionDomain
from infrastructure.uow import UnitOfWork
from infrastructure.mappers.habitacion_mapper import HabitacionMapper
from infrastructure.mappers.admision_mapper import AdmisionMapper


def _habitacion_to_dict(h: Habitacion) -> dict:
    d = {
        "habitacion_id": h.HabitacionID,
        "departamento_id": h.DepartamentoID,
        "numero": h.Numero,
        "piso": h.Piso,
        "tipo": h.Tipo,
        "capacidad": h.Capacidad,
        "estado": h.Estado,
    }
    if h.departamento:
        d["departamento_nombre"] = h.departamento.Nombre
    return d


def _admision_to_dict(a: Admision) -> dict:
    d = {
        "admision_id": a.AdmisionID,
        "paciente_id": a.PacienteID,
        "medico_id": a.MedicoID,
        "enfermero_id": a.EnfermeroID,
        "habitacion_id": a.HabitacionID,
        "cita_id": a.CitaID,
        "fecha_ingreso": a.FechaIngreso,
        "motivo_ingreso": a.MotivoIngreso,
        "diagnostico_ingreso": a.DiagnosticoIngreso,
        "fecha_alta": a.FechaAlta,
        "diagnostico_alta": a.DiagnosticoAlta,
        "tipo_alta": a.TipoAlta,
        "estado": a.Estado,
        "observaciones": a.Observaciones,
        "fecha_creacion": a.FechaCreacion,
    }
    if a.paciente:
        d["paciente_nombre"] = f"{a.paciente.Nombre} {a.paciente.Apellido}"
    if a.medico and a.medico.usuario:
        d["medico_nombre"] = f"{a.medico.usuario.Nombre} {a.medico.usuario.Apellido}"
    if a.enfermero and a.enfermero.usuario:
        d["enfermero_nombre"] = f"{a.enfermero.usuario.Nombre} {a.enfermero.usuario.Apellido}"
    if a.habitacion:
        d["habitacion_numero"] = a.habitacion.Numero
    return d


class HabitacionService:
    def __init__(self, db: Session, uow: UnitOfWork | None = None):
        self.db = db
        self.uow = uow or UnitOfWork(db)

    def list(self, departamento_id: int | None = None, estado: str | None = None,
             tipo: str | None = None) -> list[dict]:
        query = self.db.query(Habitacion).options(joinedload(Habitacion.departamento))
        if departamento_id is not None:
            query = query.filter(Habitacion.DepartamentoID == departamento_id)
        if estado is not None:
            query = query.filter(Habitacion.Estado == estado)
        if tipo is not None:
            query = query.filter(Habitacion.Tipo == tipo)
        items = query.order_by(Habitacion.Numero).all()
        return [_habitacion_to_dict(h) for h in items]

    def get(self, habitacion_id: int) -> dict:
        item = self.db.query(Habitacion).options(
            joinedload(Habitacion.departamento)
        ).filter(Habitacion.HabitacionID == habitacion_id).first()
        if not item:
            raise NotFoundError("Habitacion not found")
        return _habitacion_to_dict(item)

    def create(self, data: HabitacionCreate) -> dict:
        existing = self.db.query(Habitacion).filter(
            Habitacion.DepartamentoID == data.departamento_id,
            Habitacion.Numero == data.numero,
        ).first()
        if existing:
            raise ConflictError("Room number already exists in this department")

        domain = HabitacionDomain(
            habitacion_id=None,
            departamento_id=data.departamento_id,
            numero=data.numero,
            piso=data.piso,
            tipo=data.tipo,
            capacidad=data.capacidad,
        )
        saved = self.uow.habitaciones.save(domain)
        self.uow.session.commit()
        self.uow.session.refresh(
            self.db.query(Habitacion).filter(Habitacion.HabitacionID == saved.habitacion_id).first()
        )
        registrar_auditoria(self.db, None, "CREAR_HABITACION",
                            f"Habitación {saved.numero} creada",
                            "HABITACION", saved.habitacion_id)
        return self.get(saved.habitacion_id)

    def update(self, habitacion_id: int, data: HabitacionUpdate) -> dict:
        item = self.db.query(Habitacion).options(
            joinedload(Habitacion.departamento)
        ).filter(Habitacion.HabitacionID == habitacion_id).first()
        if not item:
            raise NotFoundError("Habitacion not found")
        if data.piso is not None:
            item.Piso = data.piso
        if data.tipo is not None:
            item.Tipo = data.tipo
        if data.capacidad is not None:
            item.Capacidad = data.capacidad
        if data.estado is not None:
            domain = HabitacionDomain(
                habitacion_id=habitacion_id, departamento_id=item.DepartamentoID,
                numero=item.Numero, piso=item.Piso, tipo=item.Tipo,
                capacidad=item.Capacidad, estado=item.Estado,
            )
            new_state = data.estado
            if new_state == "Ocupada":
                domain.ocupar()
            elif new_state == "Disponible":
                domain.liberar()
            elif new_state == "Mantenimiento":
                domain.poner_en_mantenimiento()
            item.Estado = domain.estado
        self.db.commit()
        self.db.refresh(item)
        registrar_auditoria(self.db, None, "ACTUALIZAR_HABITACION",
                            f"Habitación {habitacion_id} actualizada",
                            "HABITACION", habitacion_id)
        return _habitacion_to_dict(item)

    def delete(self, habitacion_id: int) -> None:
        item = self.db.query(Habitacion).filter(Habitacion.HabitacionID == habitacion_id).first()
        if not item:
            raise NotFoundError("Habitacion not found")
        domain = HabitacionDomain(
            habitacion_id=habitacion_id, departamento_id=item.DepartamentoID,
            numero=item.Numero, piso=item.Piso, tipo=item.Tipo,
            capacidad=item.Capacidad, estado=item.Estado,
        )
        domain.poner_en_mantenimiento()
        item.Estado = domain.estado
        self.db.commit()
        registrar_auditoria(self.db, None, "MANTENIMIENTO_HABITACION",
                            f"Habitación {habitacion_id} en mantenimiento",
                            "HABITACION", habitacion_id)


class AdmisionService:
    def __init__(self, db: Session, uow: UnitOfWork | None = None):
        self.db = db
        self.uow = uow or UnitOfWork(db)

    def _load_admision(self, admision_id: int) -> Admision:
        item = self.db.query(Admision).options(
            joinedload(Admision.paciente),
            joinedload(Admision.medico).joinedload(Medico.usuario),
            joinedload(Admision.enfermero).joinedload(Enfermero.usuario),
            joinedload(Admision.habitacion).joinedload(Habitacion.departamento),
        ).filter(Admision.AdmisionID == admision_id).first()
        if not item:
            raise NotFoundError("Admision not found")
        return item

    def list_by_enfermero(self, enfermero_id: int) -> list[dict]:
        items = self.db.query(Admision).options(
            joinedload(Admision.paciente),
            joinedload(Admision.medico).joinedload(Medico.usuario),
            joinedload(Admision.habitacion),
        ).filter(
            Admision.EnfermeroID == enfermero_id,
            Admision.Estado == "Activa",
        ).order_by(Admision.FechaIngreso.desc()).all()
        return [_admision_to_dict(a) for a in items]

    def list(self, skip: int = 0, limit: int = 100, estado: str | None = None,
             paciente_id: int | None = None, medico_id: int | None = None) -> dict:
        query = self.db.query(Admision).options(
            joinedload(Admision.paciente),
            joinedload(Admision.medico).joinedload(Medico.usuario),
            joinedload(Admision.enfermero).joinedload(Enfermero.usuario),
            joinedload(Admision.habitacion).joinedload(Habitacion.departamento),
        )
        if estado:
            query = query.filter(Admision.Estado == estado)
        if paciente_id:
            query = query.filter(Admision.PacienteID == paciente_id)
        if medico_id:
            query = query.filter(Admision.MedicoID == medico_id)
        total = query.count()
        items = query.order_by(Admision.FechaIngreso.desc()).offset(skip).limit(limit).all()
        return {"items": [_admision_to_dict(a) for a in items], "total": total}

    def get(self, admision_id: int) -> dict:
        item = self._load_admision(admision_id)
        return _admision_to_dict(item)

    def create(self, data: AdmisionCreate, created_by: int | None = None) -> dict:
        habitacion = self.db.query(Habitacion).filter(
            Habitacion.HabitacionID == data.habitacion_id
        ).first()
        if not habitacion:
            raise NotFoundError("Habitacion not found")
        if habitacion.Estado != "Disponible":
            raise ConflictError("Room is not available")

        domain = AdmisionDomain(
            admision_id=None,
            paciente_id=data.paciente_id,
            medico_id=data.medico_id,
            enfermero_id=data.enfermero_id,
            habitacion_id=data.habitacion_id,
            cita_id=data.cita_id,
            motivo_ingreso=data.motivo_ingreso,
            diagnostico_ingreso=data.diagnostico_ingreso,
            observaciones=data.observaciones,
            creado_por_usuario_id=created_by,
        )
        room_domain = HabitacionDomain(
            habitacion_id=habitacion.HabitacionID,
            departamento_id=habitacion.DepartamentoID,
            numero=habitacion.Numero,
            piso=habitacion.Piso,
            tipo=habitacion.Tipo,
            capacidad=habitacion.Capacidad,
            estado=habitacion.Estado,
        )
        room_domain.ocupar()
        habitacion.Estado = room_domain.estado

        saved = self.uow.admisiones.save(domain)
        self.uow.session.commit()
        self.uow.session.refresh(
            self.db.query(Admision).filter(Admision.AdmisionID == saved.admision_id).first()
        )
        registrar_auditoria(self.db, created_by, "CREAR_ADMISION",
                            f"Paciente {data.paciente_id} admitido en habitación {data.habitacion_id}",
                            "ADMISION", saved.admision_id)
        publish(PacienteAdmitido(saved.admision_id, {
            "paciente_id": data.paciente_id,
            "medico_id": data.medico_id,
            "habitacion_id": data.habitacion_id,
        }))

        paciente = self.db.query(Paciente).filter(Paciente.PacienteID == data.paciente_id).first()
        medico = self.db.query(Medico).options(joinedload(Medico.usuario)).filter(Medico.MedicoID == data.medico_id).first()
        room = self.db.query(Habitacion).filter(Habitacion.HabitacionID == data.habitacion_id).first()
        if paciente and paciente.Email:
            medico_nombre = f"{medico.usuario.Nombre} {medico.usuario.Apellido}" if medico and medico.usuario else "Asignado"
            send_admission_notification(
                paciente.Email,
                f"{paciente.Nombre} {paciente.Apellido}",
                medico_nombre,
                f"{room.Numero}" if room else "N/A",
                saved.fecha_ingreso.strftime("%d/%m/%Y %H:%M") if saved.fecha_ingreso else "",
            )

        return _admision_to_dict(self._load_admision(saved.admision_id))

    def update(self, admision_id: int, data: AdmisionUpdate) -> dict:
        item = self._load_admision(admision_id)
        if data.enfermero_id is not None:
            item.EnfermeroID = data.enfermero_id
        if data.habitacion_id is not None:
            old_room = self.db.query(Habitacion).filter(Habitacion.HabitacionID == item.HabitacionID).first()
            if old_room:
                old_domain = HabitacionMapper.to_domain(old_room)
                old_domain.liberar()
                old_room.Estado = old_domain.estado
            new_room = self.db.query(Habitacion).filter(Habitacion.HabitacionID == data.habitacion_id).first()
            if new_room:
                new_domain = HabitacionMapper.to_domain(new_room)
                new_domain.ocupar()
                new_room.Estado = new_domain.estado
            item.HabitacionID = data.habitacion_id
        if data.observaciones is not None:
            item.Observaciones = data.observaciones
        self.db.commit()
        self.db.refresh(item)
        registrar_auditoria(self.db, None, "ACTUALIZAR_ADMISION",
                            f"Admisión {admision_id} actualizada",
                            "ADMISION", admision_id)
        return _admision_to_dict(self._load_admision(admision_id))

    def dar_alta(self, admision_id: int, data: AltaRequest) -> dict:
        item = self._load_admision(admision_id)
        if item.Estado != "Activa":
            raise ConflictError("Admission is not active")

        domain = AdmisionMapper.to_domain(item)
        domain.dar_alta(
            tipo_alta=data.tipo_alta,
            diagnostico_alta=data.diagnostico_alta,
            observaciones=data.observaciones,
        )
        AdmisionMapper.update_orm(domain, item)

        habitacion = self.db.query(Habitacion).filter(
            Habitacion.HabitacionID == item.HabitacionID
        ).first()
        if habitacion:
            room_domain = HabitacionMapper.to_domain(habitacion)
            room_domain.liberar()
            habitacion.Estado = room_domain.estado

        self.db.commit()
        self.db.refresh(item)
        registrar_auditoria(self.db, None, "DAR_ALTA",
                            f"Alta médica para admisión {admision_id}",
                            "ADMISION", admision_id)
        publish(AltaMedica(admision_id, {
            "paciente_id": item.PacienteID,
            "tipo_alta": data.tipo_alta,
        }))
        return _admision_to_dict(self._load_admision(admision_id))
