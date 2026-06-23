from datetime import date
from fastapi import APIRouter, Depends, Query, HTTPException

from app.core.dependencies import DbSession, require_role, get_current_paciente
from app.modules.citas.schemas import (
    ReservaWebCreate, ReservaWebUpdate, ReservaWebResponse,
    CitaCreate, CitaUpdate, CitaResponse,
    ConvertirPayload, RechazarPayload,
    DisponibilidadResponse,
)
from app.modules.citas.service import ReservaService, CitaService
from app.models import Medico

router = APIRouter(prefix="/api/v1", tags=["Citas"])
AdminOrMedico = require_role(["Administrador", "Médico", "Recepcionista"])

# --- Reservas Web (Público + Admin) ---

@router.post("/public/reservas", response_model=ReservaWebResponse, status_code=201)
def create_reserva_publica(data: ReservaWebCreate, db: DbSession):
    return ReservaService(db).create(data)

@router.get("/reservas/pendientes", response_model=dict)
def list_reservas_pendientes(
    db: DbSession,
    _ = AdminOrMedico,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    return ReservaService(db).list(skip=skip, limit=limit, estado="Pendiente")

@router.get("/reservas", response_model=dict)
def list_reservas(
    db: DbSession,
    _ = AdminOrMedico,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    estado: str | None = None,
):
    return ReservaService(db).list(skip=skip, limit=limit, estado=estado)

@router.get("/reservas/{reserva_id}", response_model=ReservaWebResponse)
def get_reserva(reserva_id: int, db: DbSession, _ = AdminOrMedico):
    return ReservaService(db).get(reserva_id)

@router.put("/reservas/{reserva_id}", response_model=ReservaWebResponse)
def update_reserva(reserva_id: int, data: ReservaWebUpdate, db: DbSession, _ = require_role(["Administrador", "Recepcionista"])):
    return ReservaService(db).update(reserva_id, data)

@router.delete("/reservas/{reserva_id}", status_code=204)
def delete_reserva(reserva_id: int, db: DbSession, _ = require_role(["Administrador"])):
    ReservaService(db).delete(reserva_id)

@router.post("/reservas/{reserva_id}/convertir", response_model=CitaResponse, status_code=201)
def convertir_reserva(
    reserva_id: int,
    payload: ConvertirPayload,
    db: DbSession,
    _ = require_role(["Administrador", "Recepcionista"]),
):
    return ReservaService(db).convert_to_cita(
        reserva_id, payload.ubicacion_id, payload.observaciones,
    )

@router.post("/reservas/{reserva_id}/rechazar", response_model=ReservaWebResponse)
def rechazar_reserva(
    reserva_id: int,
    payload: RechazarPayload,
    db: DbSession,
    _ = require_role(["Administrador", "Recepcionista"]),
):
    try:
        return ReservaService(db).rechazar(reserva_id, payload.motivo_rechazo)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- Citas ---

@router.get("/citas", response_model=dict)
def list_citas(
    db: DbSession,
    _ = AdminOrMedico,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    estado: str | None = None,
    medico_id: int | None = None,
    paciente_id: int | None = None,
    fecha_desde: date | None = None,
    fecha_hasta: date | None = None,
):
    return CitaService(db).list(
        skip=skip, limit=limit, estado=estado,
        medico_id=medico_id, paciente_id=paciente_id,
        fecha_desde=fecha_desde, fecha_hasta=fecha_hasta,
    )

@router.get("/citas/{cita_id}", response_model=CitaResponse)
def get_cita(cita_id: int, db: DbSession, _ = AdminOrMedico):
    return CitaService(db).get(cita_id)

@router.post("/citas", response_model=CitaResponse, status_code=201)
def create_cita(data: CitaCreate, db: DbSession, current_user = require_role(["Administrador", "Recepcionista", "Médico"])):
    return CitaService(db).create(data, created_by=current_user.UsuarioID)

@router.put("/citas/{cita_id}", response_model=CitaResponse)
def update_cita(cita_id: int, data: CitaUpdate, db: DbSession, _ = require_role(["Administrador", "Recepcionista", "Médico"])):
    return CitaService(db).update(cita_id, data)

@router.delete("/citas/{cita_id}", status_code=204)
def cancel_cita(cita_id: int, db: DbSession, _ = require_role(["Administrador", "Recepcionista"])):
    CitaService(db).delete(cita_id)


@router.get("/medico/mis-citas", response_model=dict)
def mis_citas_medico(
    db: DbSession,
    current_user=require_role(["Médico"]),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    estado: str | None = None,
    fecha_desde: date | None = None,
    fecha_hasta: date | None = None,
):
    medico = db.query(Medico).filter(Medico.UsuarioID == current_user.UsuarioID).first()
    if not medico:
        raise HTTPException(status_code=404, detail="Medico profile not found")
    return CitaService(db).list(
        skip=skip,
        limit=limit,
        estado=estado,
        medico_id=medico.MedicoID,
        fecha_desde=fecha_desde,
        fecha_hasta=fecha_hasta,
    )

# --- Disponibilidad ---

@router.get("/disponibilidad/{medico_id}", response_model=DisponibilidadResponse)
def get_disponibilidad(medico_id: int, fecha: date, db: DbSession):
    return CitaService(db).get_disponibilidad(medico_id, fecha)


# --- Public: Paciente autenticado ve sus reservas ---

@router.get("/public/mis-reservas", response_model=list[ReservaWebResponse])
def mis_reservas(db: DbSession, paciente_id: int = Depends(get_current_paciente)):
    return ReservaService(db).list_by_paciente(paciente_id)
