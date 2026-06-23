import os
from fastapi import APIRouter, Query, UploadFile, File, Depends
from fastapi.responses import FileResponse

from app.core.exceptions import NotFoundError

from app.core.dependencies import DbSession, require_role, get_current_user
from app.modules.pacientes.schemas import (
    PacienteCreate, PacienteUpdate, PacienteResponse, PacienteListResponse,
    HistoriaClinicaCreate, HistoriaClinicaUpdate, HistoriaClinicaResponse,
    DocumentoAdjuntoCreate, DocumentoAdjuntoResponse,
)
from app.modules.pacientes.service import PacienteService
from app.models import Medico

router = APIRouter(prefix="/api/v1/pacientes", tags=["Pacientes"])
AdminOrMedico = require_role(["Administrador", "Médico", "Recepcionista"])


@router.get("", response_model=PacienteListResponse)
def list_pacientes(
    db: DbSession,
    _ = AdminOrMedico,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    activo: bool | None = None,
):
    service = PacienteService(db)
    return service.list(skip=skip, limit=limit, activo=activo)


@router.get("/buscar", response_model=PacienteListResponse)
def search_pacientes(
    db: DbSession,
    _ = AdminOrMedico,
    q: str = Query(..., min_length=1),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    service = PacienteService(db)
    return service.search(q, skip=skip, limit=limit)


@router.get("/{paciente_id}", response_model=PacienteResponse)
def get_paciente(paciente_id: int, db: DbSession, _ = AdminOrMedico):
    service = PacienteService(db)
    return service.get(paciente_id)


@router.post("", response_model=PacienteResponse, status_code=201)
def create_paciente(data: PacienteCreate, db: DbSession, _ = AdminOrMedico):
    service = PacienteService(db)
    return service.create(data)


@router.put("/{paciente_id}", response_model=PacienteResponse)
def update_paciente(paciente_id: int, data: PacienteUpdate, db: DbSession, _ = require_role(["Administrador", "Recepcionista"])):
    service = PacienteService(db)
    return service.update(paciente_id, data)


@router.delete("/{paciente_id}", status_code=204)
def delete_paciente(paciente_id: int, db: DbSession, _ = require_role(["Administrador"])):
    service = PacienteService(db)
    service.delete(paciente_id)


@router.get("/{paciente_id}/historias", response_model=list[HistoriaClinicaResponse])
def list_historias(paciente_id: int, db: DbSession, _ = AdminOrMedico):
    service = PacienteService(db)
    return service.get_historias(paciente_id)


@router.post("/{paciente_id}/historias", response_model=HistoriaClinicaResponse, status_code=201)
def create_historia(
    paciente_id: int,
    data: HistoriaClinicaCreate,
    db: DbSession,
    current_user = require_role(["Administrador", "Médico"]),
):
    if data.medico_id == 0 and current_user.role.NombreRole == "Médico":
        medico = db.query(Medico).filter(Medico.UsuarioID == current_user.UsuarioID).first()
        if medico:
            data.medico_id = medico.MedicoID
    service = PacienteService(db)
    return service.create_historia(paciente_id, data)


@router.get("/{paciente_id}/historias/{historial_id}", response_model=HistoriaClinicaResponse)
def get_historia(paciente_id: int, historial_id: int, db: DbSession, _ = AdminOrMedico):
    service = PacienteService(db)
    return service.get_historia(paciente_id, historial_id)


@router.put("/{paciente_id}/historias/{historial_id}", response_model=HistoriaClinicaResponse)
def update_historia(paciente_id: int, historial_id: int, data: HistoriaClinicaUpdate, db: DbSession, _ = require_role(["Administrador", "Médico"])):
    service = PacienteService(db)
    return service.update_historia(paciente_id, historial_id, data)


@router.post("/{paciente_id}/historias/{historial_id}/documentos", response_model=DocumentoAdjuntoResponse, status_code=201)
def create_documento(paciente_id: int, historial_id: int, data: DocumentoAdjuntoCreate, db: DbSession, _ = require_role(["Administrador", "Médico"])):
    service = PacienteService(db)
    return service.create_documento(paciente_id, historial_id, data)


@router.post("/{paciente_id}/historias/{historial_id}/documentos/upload", response_model=DocumentoAdjuntoResponse, status_code=201)
def upload_documento(
    paciente_id: int,
    historial_id: int,
    db: DbSession,
    file: UploadFile = File(...),
    descripcion: str | None = None,
    current_user = require_role(["Administrador", "Médico"]),
):
    service = PacienteService(db)
    return service.upload_documento(paciente_id, historial_id, file, descripcion, current_user.UsuarioID)


@router.get("/{paciente_id}/historias/{historial_id}/documentos", response_model=list[DocumentoAdjuntoResponse])
def list_documentos(paciente_id: int, historial_id: int, db: DbSession, _ = AdminOrMedico):
    service = PacienteService(db)
    return service.get_documentos(paciente_id, historial_id)


@router.delete("/{paciente_id}/historias/{historial_id}/documentos/{documento_id}", status_code=204)
def delete_documento(paciente_id: int, historial_id: int, documento_id: int, db: DbSession, _ = require_role(["Administrador"])):
    service = PacienteService(db)
    service.delete_documento(paciente_id, historial_id, documento_id)


@router.get("/{paciente_id}/historias/{historial_id}/documentos/{documento_id}/download")
def download_documento(paciente_id: int, historial_id: int, documento_id: int, db: DbSession, _ = AdminOrMedico):
    service = PacienteService(db)
    filepath, filename = service.get_documento_path(paciente_id, historial_id, documento_id)
    return FileResponse(filepath, filename=filename)
