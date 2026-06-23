from datetime import date
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import text

from app.core.dependencies import DbSession, require_role, get_current_paciente
from app.modules.citas.schemas import (
    ReservaWebCreate, ReservaWebUpdate, ReservaWebResponse,
    CitaCreate, CitaUpdate, CitaResponse,
    ConvertirPayload, RechazarPayload,
    DisponibilidadResponse, AgendaResponse,
)
from app.modules.citas.service import ReservaService, CitaService
from app.models import Medico, Paciente, Cita, HistoriaClinica

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


@router.get("/medico/mis-pacientes", response_model=dict)
def mis_pacientes_medico(
    db: DbSession,
    current_user=require_role(["Médico"]),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    medico = db.query(Medico).filter(Medico.UsuarioID == current_user.UsuarioID).first()
    if not medico:
        raise HTTPException(status_code=404, detail="Medico profile not found")
    paciente_ids = [
        r[0] for r in db.query(Cita.PacienteID).filter(
            Cita.MedicoID == medico.MedicoID
        ).distinct().all()
    ]
    query = db.query(Paciente).filter(Paciente.PacienteID.in_(paciente_ids)) if paciente_ids else db.query(Paciente).filter(text("0=1"))
    total = query.count()
    items = query.order_by(Paciente.FechaRegistro.desc()).offset(skip).limit(limit).all()
    result = []
    for p in items:
        ultima_cita = db.query(Cita.CitaID, Cita.FechaHora, Cita.EstadoCita).filter(
            Cita.MedicoID == medico.MedicoID,
            Cita.PacienteID == p.PacienteID,
        ).order_by(Cita.FechaHora.desc()).first()
        tiene_hc = db.query(HistoriaClinica.HistorialID).filter(
            HistoriaClinica.PacienteID == p.PacienteID,
            HistoriaClinica.MedicoID == medico.MedicoID,
        ).first() is not None
        result.append({
            "paciente_id": p.PacienteID,
            "dni": p.DNI,
            "nombre": p.Nombre,
            "apellido": p.Apellido,
            "telefono": p.Telefono,
            "email": p.Email,
            "fecha_registro": p.FechaRegistro,
            "ultima_cita": ultima_cita.FechaHora.isoformat() if ultima_cita else None,
            "ultimo_estado": ultima_cita.EstadoCita if ultima_cita else None,
            "ultima_cita_id": ultima_cita.CitaID if ultima_cita else None,
            "tiene_historia": tiene_hc,
        })
    return {"items": result, "total": total}


# --- Agenda del Médico ---

@router.get("/agenda/{medico_id}", response_model=AgendaResponse)
def get_agenda(
    medico_id: int,
    fecha: date,
    db: DbSession,
    _ = AdminOrMedico,
):
    return CitaService(db).get_agenda(medico_id, fecha)

# --- Disponibilidad ---

@router.get("/disponibilidad/{medico_id}", response_model=DisponibilidadResponse)
def get_disponibilidad(medico_id: int, fecha: date, db: DbSession):
    return CitaService(db).get_disponibilidad(medico_id, fecha)


# --- Public: Paciente autenticado ve sus reservas ---

@router.get("/public/mis-reservas", response_model=list[ReservaWebResponse])
def mis_reservas(db: DbSession, paciente_id: int = Depends(get_current_paciente)):
    return ReservaService(db).list_by_paciente(paciente_id)
