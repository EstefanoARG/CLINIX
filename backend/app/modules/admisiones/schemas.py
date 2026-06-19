from datetime import datetime, date
from pydantic import BaseModel, Field


class HabitacionCreate(BaseModel):
    departamento_id: int
    numero: str = Field(..., max_length=20)
    piso: str | None = None
    tipo: str = Field(..., max_length=50)
    capacidad: int = Field(..., ge=1)


class HabitacionUpdate(BaseModel):
    piso: str | None = None
    tipo: str | None = None
    capacidad: int | None = None
    estado: str | None = None


class HabitacionResponse(BaseModel):
    habitacion_id: int
    departamento_id: int
    numero: str
    piso: str | None = None
    tipo: str
    capacidad: int
    estado: str
    departamento_nombre: str | None = None

    class Config:
        from_attributes = True


class AdmisionCreate(BaseModel):
    paciente_id: int
    medico_id: int
    enfermero_id: int | None = None
    habitacion_id: int
    cita_id: int | None = None
    motivo_ingreso: str = Field(..., min_length=1)
    diagnostico_ingreso: str | None = None
    observaciones: str | None = None


class AdmisionUpdate(BaseModel):
    enfermero_id: int | None = None
    habitacion_id: int | None = None
    observaciones: str | None = None


class AltaRequest(BaseModel):
    diagnostico_alta: str | None = None
    tipo_alta: str = Field(default="Médica", max_length=50)
    observaciones: str | None = None


class AdmisionResponse(BaseModel):
    admision_id: int
    paciente_id: int
    medico_id: int
    enfermero_id: int | None = None
    habitacion_id: int
    cita_id: int | None = None
    fecha_ingreso: datetime
    motivo_ingreso: str
    diagnostico_ingreso: str | None = None
    fecha_alta: datetime | None = None
    diagnostico_alta: str | None = None
    tipo_alta: str | None = None
    estado: str
    observaciones: str | None = None
    fecha_creacion: datetime
    paciente_nombre: str | None = None
    medico_nombre: str | None = None
    enfermero_nombre: str | None = None
    habitacion_numero: str | None = None

    class Config:
        from_attributes = True
