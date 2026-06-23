from datetime import date, datetime, time
from pydantic import BaseModel, ConfigDict, Field


class ReservaWebCreate(BaseModel):
    paciente_id: int | None = None
    nombre_solicitante: str = Field(..., min_length=2, max_length=250)
    apellidos_solicitante: str | None = Field(None, max_length=250)
    dni_solicitante: str = Field(..., min_length=8, max_length=20)
    email_solicitante: str
    telefono_solicitante: str | None = None
    direccion_solicitante: str | None = Field(None, max_length=250)
    fecha_nacimiento_solicitante: date | None = None
    genero_solicitante: str | None = None
    especialidad_id: int
    medico_id: int | None = None
    fecha_hora_deseada: datetime
    motivo_consulta: str | None = None
    acepta_terminos: bool = False


class ReservaWebUpdate(BaseModel):
    estado: str | None = None
    observacion_admin: str | None = None
    medico_id: int | None = None
    fecha_hora_deseada: datetime | None = None


class ReservaWebResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    reserva_id: int
    paciente_id: int | None = None
    nombre_solicitante: str
    dni_solicitante: str
    email_solicitante: str
    telefono_solicitante: str | None = None
    direccion_solicitante: str | None = None
    fecha_nacimiento_solicitante: date | None = None
    genero_solicitante: str | None = None
    especialidad_id: int
    medico_id: int | None = None
    fecha_hora_deseada: datetime
    motivo_consulta: str | None = None
    estado: str
    acepta_terminos: bool
    cita_id: int | None = None
    fecha_solicitud: datetime
    fecha_respuesta: datetime | None = None
    observacion_admin: str | None = None
    especialidad_nombre: str | None = None
    medico_nombre: str | None = None
    paciente_nombre: str | None = None



class CitaCreate(BaseModel):
    paciente_id: int
    medico_id: int
    especialidad_id: int
    ubicacion_id: int | None = None
    reserva_id: int | None = None
    fecha_hora: datetime
    duracion_minutos: int = 30
    motivo_consulta: str | None = None
    observaciones: str | None = None


class CitaUpdate(BaseModel):
    fecha_hora: datetime | None = None
    duracion_minutos: int | None = None
    estado_cita: str | None = None
    observaciones: str | None = None
    ubicacion_id: int | None = None


class CitaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    cita_id: int
    paciente_id: int
    medico_id: int
    especialidad_id: int
    ubicacion_id: int | None = None
    reserva_id: int | None = None
    fecha_hora: datetime
    duracion_minutos: int
    estado_cita: str
    motivo_consulta: str | None = None
    observaciones: str | None = None
    fecha_creacion: datetime
    paciente_nombre: str | None = None
    medico_nombre: str | None = None
    especialidad_nombre: str | None = None



class ConvertirPayload(BaseModel):
    ubicacion_id: int
    observaciones: str | None = None


class RechazarPayload(BaseModel):
    motivo_rechazo: str = Field(..., min_length=1, max_length=500)


class AgendaCitaItem(BaseModel):
    cita_id: int
    paciente_id: int
    paciente_nombre: str
    paciente_dni: str
    fecha_hora: datetime
    duracion_minutos: int
    estado_cita: str
    motivo_consulta: str | None = None
    ubicacion_nombre: str | None = None
    especialidad_nombre: str | None = None
    tiene_historia: bool = False


class AgendaResponse(BaseModel):
    medico_id: int
    medico_nombre: str
    fecha: str
    citas: list[AgendaCitaItem]


class DisponibilidadRequest(BaseModel):
    medico_id: int
    fecha: str


class DisponibilidadSlot(BaseModel):
    hora_inicio: time
    hora_fin: time
    disponible: bool


class DisponibilidadResponse(BaseModel):
    medico_id: int
    fecha: str
    slots: list[DisponibilidadSlot]
    dias_atencion: list[str] = []
    mensaje: str = ""


class PacienteMinResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    paciente_id: int
    dni: str
    nombre: str
    apellido: str
    telefono: str | None = None
    email: str | None = None
    fecha_registro: datetime | None = None
