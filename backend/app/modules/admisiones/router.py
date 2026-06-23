from fastapi import APIRouter, Query, HTTPException

from app.core.dependencies import DbSession, require_role
from app.modules.admisiones.schemas import (
    HabitacionCreate, HabitacionUpdate, HabitacionResponse,
    AdmisionCreate, AdmisionUpdate, AdmisionResponse, AltaRequest,
)
from app.modules.admisiones.service import HabitacionService, AdmisionService

router = APIRouter(prefix="/api/v1", tags=["Admisiones"])
AdminOrMedico = require_role(["Administrador", "Médico", "Recepcionista", "Enfermero"])

# --- Habitaciones ---

@router.get("/habitaciones", response_model=list[HabitacionResponse])
def list_habitaciones(
    db: DbSession,
    _ = AdminOrMedico,
    departamento_id: int | None = None,
    estado: str | None = None,
    tipo: str | None = None,
):
    return HabitacionService(db).list(departamento_id=departamento_id, estado=estado, tipo=tipo)

@router.get("/habitaciones/{habitacion_id}", response_model=HabitacionResponse)
def get_habitacion(habitacion_id: int, db: DbSession, _ = AdminOrMedico):
    return HabitacionService(db).get(habitacion_id)

@router.post("/habitaciones", response_model=HabitacionResponse, status_code=201)
def create_habitacion(data: HabitacionCreate, db: DbSession, _ = require_role(["Administrador"])):
    return HabitacionService(db).create(data)

@router.put("/habitaciones/{habitacion_id}", response_model=HabitacionResponse)
def update_habitacion(habitacion_id: int, data: HabitacionUpdate, db: DbSession, _ = require_role(["Administrador"])):
    return HabitacionService(db).update(habitacion_id, data)

@router.delete("/habitaciones/{habitacion_id}", status_code=204)
def delete_habitacion(habitacion_id: int, db: DbSession, _ = require_role(["Administrador"])):
    HabitacionService(db).delete(habitacion_id)

# --- Admisiones ---

@router.get("/admisiones", response_model=dict)
def list_admisiones(
    db: DbSession,
    _ = AdminOrMedico,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    estado: str | None = None,
    paciente_id: int | None = None,
):
    return AdmisionService(db).list(skip=skip, limit=limit, estado=estado, paciente_id=paciente_id)

@router.get("/admisiones/{admision_id}", response_model=AdmisionResponse)
def get_admision(admision_id: int, db: DbSession, _ = AdminOrMedico):
    return AdmisionService(db).get(admision_id)

@router.post("/admisiones", response_model=AdmisionResponse, status_code=201)
def create_admision(data: AdmisionCreate, db: DbSession, current_user = require_role(["Administrador", "Médico", "Recepcionista"])):
    return AdmisionService(db).create(data, created_by=current_user.UsuarioID)

@router.put("/admisiones/{admision_id}", response_model=AdmisionResponse)
def update_admision(admision_id: int, data: AdmisionUpdate, db: DbSession, _ = require_role(["Administrador", "Médico", "Enfermero"])):
    return AdmisionService(db).update(admision_id, data)

@router.get("/enfermero/mis-pacientes", response_model=list[AdmisionResponse])
def mis_pacientes_enfermero(db: DbSession, current_user = require_role(["Enfermero", "Administrador"])):
    from app.models import Enfermero
    enfermero = db.query(Enfermero).filter(Enfermero.UsuarioID == current_user.UsuarioID).first()
    if not enfermero:
        raise HTTPException(status_code=404, detail="Enfermero profile not found")
    return AdmisionService(db).list_by_enfermero(enfermero.EnfermeroID)


@router.get("/medico/mis-admisiones", response_model=dict)
def mis_admisiones_medico(
    db: DbSession,
    current_user=require_role(["Médico"]),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    estado: str | None = "Activa",
):
    from app.models import Medico
    medico = db.query(Medico).filter(Medico.UsuarioID == current_user.UsuarioID).first()
    if not medico:
        raise HTTPException(status_code=404, detail="Medico profile not found")
    return AdmisionService(db).list(
        skip=skip,
        limit=limit,
        estado=estado,
        medico_id=medico.MedicoID,
    )


@router.post("/admisiones/{admision_id}/alta", response_model=AdmisionResponse)
def dar_alta(admision_id: int, data: AltaRequest, db: DbSession, _ = require_role(["Administrador", "Médico"])):
    return AdmisionService(db).dar_alta(admision_id, data)
