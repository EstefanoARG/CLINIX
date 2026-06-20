from fastapi import APIRouter, Query

from app.core.dependencies import DbSession, require_role
from app.modules.personal.schemas import (
    EspecialidadCreate, EspecialidadUpdate, EspecialidadResponse,
    DepartamentoCreate, DepartamentoUpdate, DepartamentoResponse,
    UbicacionFisicaCreate, UbicacionFisicaUpdate, UbicacionFisicaResponse,
    MedicoCreate, MedicoUpdate, MedicoResponse,
    EnfermeroCreate, EnfermeroUpdate, EnfermeroResponse,
    HorarioMedicoCreate, HorarioMedicoUpdate, HorarioMedicoResponse,
)
from app.modules.personal.service import (
    EspecialidadService, DepartamentoService, UbicacionService,
    MedicoService, EnfermeroService, HorarioMedicoService,
)

router = APIRouter(prefix="/api/v1", tags=["Personal"])
AdminOrMedico = require_role(["Administrador", "Médico", "Recepcionista", "Enfermero"])

# --- Especialidades ---

@router.get("/especialidades", response_model=list[EspecialidadResponse])
def list_especialidades(db: DbSession, _ = AdminOrMedico):
    return EspecialidadService(db).list()

@router.get("/especialidades/{especialidad_id}", response_model=EspecialidadResponse)
def get_especialidad(especialidad_id: int, db: DbSession, _ = AdminOrMedico):
    return EspecialidadService(db).get(especialidad_id)

@router.post("/especialidades", response_model=EspecialidadResponse, status_code=201)
def create_especialidad(data: EspecialidadCreate, db: DbSession, _ = require_role(["Administrador"])):
    return EspecialidadService(db).create(data)

@router.put("/especialidades/{especialidad_id}", response_model=EspecialidadResponse)
def update_especialidad(especialidad_id: int, data: EspecialidadUpdate, db: DbSession, _ = require_role(["Administrador"])):
    return EspecialidadService(db).update(especialidad_id, data)

@router.delete("/especialidades/{especialidad_id}", status_code=204)
def delete_especialidad(especialidad_id: int, db: DbSession, _ = require_role(["Administrador"])):
    EspecialidadService(db).delete(especialidad_id)

# --- Departamentos ---

@router.get("/departamentos", response_model=list[DepartamentoResponse])
def list_departamentos(db: DbSession, _ = AdminOrMedico, activo: bool | None = None):
    return DepartamentoService(db).list(activo=activo)

@router.get("/departamentos/{departamento_id}", response_model=DepartamentoResponse)
def get_departamento(departamento_id: int, db: DbSession, _ = AdminOrMedico):
    return DepartamentoService(db).get(departamento_id)

@router.post("/departamentos", response_model=DepartamentoResponse, status_code=201)
def create_departamento(data: DepartamentoCreate, db: DbSession, _ = require_role(["Administrador"])):
    return DepartamentoService(db).create(data)

@router.put("/departamentos/{departamento_id}", response_model=DepartamentoResponse)
def update_departamento(departamento_id: int, data: DepartamentoUpdate, db: DbSession, _ = require_role(["Administrador"])):
    return DepartamentoService(db).update(departamento_id, data)

@router.delete("/departamentos/{departamento_id}", status_code=204)
def delete_departamento(departamento_id: int, db: DbSession, _ = require_role(["Administrador"])):
    DepartamentoService(db).delete(departamento_id)

# --- Ubicaciones Físicas ---

@router.get("/ubicaciones", response_model=list[UbicacionFisicaResponse])
def list_ubicaciones(db: DbSession, _ = AdminOrMedico, departamento_id: int | None = None):
    return UbicacionService(db).list(departamento_id=departamento_id)

@router.get("/ubicaciones/{ubicacion_id}", response_model=UbicacionFisicaResponse)
def get_ubicacion(ubicacion_id: int, db: DbSession, _ = AdminOrMedico):
    return UbicacionService(db).get(ubicacion_id)

@router.post("/ubicaciones", response_model=UbicacionFisicaResponse, status_code=201)
def create_ubicacion(data: UbicacionFisicaCreate, db: DbSession, _ = require_role(["Administrador"])):
    return UbicacionService(db).create(data)

@router.put("/ubicaciones/{ubicacion_id}", response_model=UbicacionFisicaResponse)
def update_ubicacion(ubicacion_id: int, data: UbicacionFisicaUpdate, db: DbSession, _ = require_role(["Administrador"])):
    return UbicacionService(db).update(ubicacion_id, data)

@router.delete("/ubicaciones/{ubicacion_id}", status_code=204)
def delete_ubicacion(ubicacion_id: int, db: DbSession, _ = require_role(["Administrador"])):
    UbicacionService(db).delete(ubicacion_id)

# --- Especialidades (Público) ---

@router.get("/public/especialidades", response_model=list[EspecialidadResponse])
def list_especialidades_publico(db: DbSession):
    return EspecialidadService(db).list()

# --- Médicos (Público) ---

@router.get("/public/medicos", response_model=dict)
def list_medicos_publico(
    db: DbSession,
    especialidad_id: int | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    return MedicoService(db).list(skip=skip, limit=limit, activo=True, especialidad_id=especialidad_id)

# --- Médicos ---

@router.get("/medicos", response_model=dict)
def list_medicos(
    db: DbSession,
    _ = AdminOrMedico,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    activo: bool | None = None,
    especialidad_id: int | None = None,
):
    return MedicoService(db).list(skip=skip, limit=limit, activo=activo, especialidad_id=especialidad_id)

@router.get("/medicos/buscar", response_model=dict)
def search_medicos(
    db: DbSession,
    _ = AdminOrMedico,
    q: str = Query(..., min_length=1),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    return MedicoService(db).search(q, skip=skip, limit=limit)

@router.get("/medicos/{medico_id}", response_model=MedicoResponse)
def get_medico(medico_id: int, db: DbSession, _ = AdminOrMedico):
    return MedicoService(db).get(medico_id)

@router.post("/medicos", response_model=MedicoResponse, status_code=201)
def create_medico(data: MedicoCreate, db: DbSession, _ = require_role(["Administrador"])):
    return MedicoService(db).create(data)

@router.put("/medicos/{medico_id}", response_model=MedicoResponse)
def update_medico(medico_id: int, data: MedicoUpdate, db: DbSession, _ = require_role(["Administrador"])):
    return MedicoService(db).update(medico_id, data)

@router.delete("/medicos/{medico_id}", status_code=204)
def delete_medico(medico_id: int, db: DbSession, _ = require_role(["Administrador"])):
    MedicoService(db).delete(medico_id)

# --- Enfermeros ---

@router.get("/enfermeros", response_model=dict)
def list_enfermeros(
    db: DbSession,
    _ = AdminOrMedico,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    activo: bool | None = None,
):
    return EnfermeroService(db).list(skip=skip, limit=limit, activo=activo)

@router.get("/enfermeros/buscar", response_model=dict)
def search_enfermeros(
    db: DbSession,
    _ = AdminOrMedico,
    q: str = Query(..., min_length=1),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    return EnfermeroService(db).search(q, skip=skip, limit=limit)

@router.get("/enfermeros/{enfermero_id}", response_model=EnfermeroResponse)
def get_enfermero(enfermero_id: int, db: DbSession, _ = AdminOrMedico):
    return EnfermeroService(db).get(enfermero_id)

@router.post("/enfermeros", response_model=EnfermeroResponse, status_code=201)
def create_enfermero(data: EnfermeroCreate, db: DbSession, _ = require_role(["Administrador"])):
    return EnfermeroService(db).create(data)

@router.put("/enfermeros/{enfermero_id}", response_model=EnfermeroResponse)
def update_enfermero(enfermero_id: int, data: EnfermeroUpdate, db: DbSession, _ = require_role(["Administrador"])):
    return EnfermeroService(db).update(enfermero_id, data)

@router.delete("/enfermeros/{enfermero_id}", status_code=204)
def delete_enfermero(enfermero_id: int, db: DbSession, _ = require_role(["Administrador"])):
    EnfermeroService(db).delete(enfermero_id)

# --- Horarios Médicos ---

@router.get("/medicos/{medico_id}/horarios", response_model=list[HorarioMedicoResponse])
def list_horarios(medico_id: int, db: DbSession, _ = AdminOrMedico):
    return HorarioMedicoService(db).list(medico_id)

@router.post("/horarios", response_model=HorarioMedicoResponse, status_code=201)
def create_horario(data: HorarioMedicoCreate, db: DbSession, _ = require_role(["Administrador"])):
    return HorarioMedicoService(db).create(data)

@router.put("/horarios/{horario_id}", response_model=HorarioMedicoResponse)
def update_horario(horario_id: int, data: HorarioMedicoUpdate, db: DbSession, _ = require_role(["Administrador"])):
    return HorarioMedicoService(db).update(horario_id, data)

@router.delete("/horarios/{horario_id}", status_code=204)
def delete_horario(horario_id: int, db: DbSession, _ = require_role(["Administrador"])):
    HorarioMedicoService(db).delete(horario_id)
