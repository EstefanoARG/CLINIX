from datetime import time, datetime
from pydantic import BaseModel, Field


class EspecialidadCreate(BaseModel):
    nombre_especialidad: str = Field(..., min_length=2, max_length=100)
    descripcion: str | None = None


class EspecialidadUpdate(BaseModel):
    nombre_especialidad: str | None = None
    descripcion: str | None = None


class EspecialidadResponse(BaseModel):
    especialidad_id: int
    nombre_especialidad: str
    descripcion: str | None = None

    class Config:
        from_attributes = True


class DepartamentoCreate(BaseModel):
    clinical_id: int = 1
    nombre: str = Field(..., min_length=2, max_length=100)
    descripcion: str | None = None


class DepartamentoUpdate(BaseModel):
    nombre: str | None = None
    descripcion: str | None = None
    activo: bool | None = None


class DepartamentoResponse(BaseModel):
    departamento_id: int
    clinical_id: int
    nombre: str
    descripcion: str | None = None
    activo: bool

    class Config:
        from_attributes = True


class UbicacionFisicaCreate(BaseModel):
    departamento_id: int
    nombre: str = Field(..., min_length=2, max_length=100)
    tipo: str = Field(..., max_length=50)
    piso: str | None = None


class UbicacionFisicaUpdate(BaseModel):
    nombre: str | None = None
    tipo: str | None = None
    piso: str | None = None
    activo: bool | None = None


class UbicacionFisicaResponse(BaseModel):
    ubicacion_id: int
    departamento_id: int
    nombre: str
    tipo: str
    piso: str | None = None
    activo: bool

    class Config:
        from_attributes = True


class MedicoCreate(BaseModel):
    clinical_id: int = 1
    departamento_id: int
    ubicacion_id: int | None = None
    dni: str = Field(..., min_length=8, max_length=20)
    nombre: str = Field(..., min_length=2, max_length=100)
    apellido: str = Field(..., min_length=2, max_length=100)
    email: str
    telefono: str | None = None
    password: str = Field(..., min_length=6)
    numero_colegiatura: str = Field(..., min_length=1, max_length=50)
    especialidad_id: int


class MedicoUpdate(BaseModel):
    departamento_id: int | None = None
    especialidad_id: int | None = None
    numero_colegiatura: str | None = None
    activo: bool | None = None


class MedicoResponse(BaseModel):
    medico_id: int
    usuario_id: int
    especialidad_id: int
    departamento_id: int
    numero_colegiatura: str
    activo: bool
    nombre: str | None = None
    apellido: str | None = None
    email: str | None = None
    telefono: str | None = None
    especialidad: str | None = None
    departamento: str | None = None

    class Config:
        from_attributes = True


class EnfermeroCreate(BaseModel):
    clinical_id: int = 1
    departamento_id: int
    ubicacion_id: int | None = None
    dni: str = Field(..., min_length=8, max_length=20)
    nombre: str = Field(..., min_length=2, max_length=100)
    apellido: str = Field(..., min_length=2, max_length=100)
    email: str
    telefono: str | None = None
    password: str = Field(..., min_length=6)
    numero_licencia: str = Field(..., min_length=1, max_length=50)
    turno: str = Field(..., max_length=30)


class EnfermeroUpdate(BaseModel):
    departamento_id: int | None = None
    numero_licencia: str | None = None
    turno: str | None = None
    activo: bool | None = None


class EnfermeroResponse(BaseModel):
    enfermero_id: int
    usuario_id: int
    departamento_id: int
    numero_licencia: str
    turno: str
    activo: bool
    nombre: str | None = None
    apellido: str | None = None
    email: str | None = None

    class Config:
        from_attributes = True


class HorarioMedicoCreate(BaseModel):
    medico_id: int
    dia_semana: int = Field(..., ge=1, le=7)
    hora_inicio: time
    hora_fin: time
    intervalo_citas: int = 30


class HorarioMedicoUpdate(BaseModel):
    dia_semana: int | None = None
    hora_inicio: time | None = None
    hora_fin: time | None = None
    intervalo_citas: int | None = None
    activo: bool | None = None


class HorarioMedicoResponse(BaseModel):
    horario_id: int
    medico_id: int
    dia_semana: int
    hora_inicio: time
    hora_fin: time
    intervalo_citas: int
    activo: bool

    class Config:
        from_attributes = True
