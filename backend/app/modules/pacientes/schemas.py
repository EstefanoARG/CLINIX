from datetime import date, datetime
from pydantic import BaseModel, Field


class PacienteCreate(BaseModel):
    clinical_id: int = 1
    dni: str = Field(..., min_length=8, max_length=20)
    nombre: str = Field(..., min_length=2, max_length=100)
    apellido: str = Field(..., min_length=2, max_length=100)
    fecha_nacimiento: date | None = None
    genero: str | None = None
    direccion: str | None = None
    telefono: str | None = None
    email: str | None = None
    grupo_sanguineo: str | None = None
    alergias: str | None = None


class PacienteUpdate(BaseModel):
    dni: str | None = None
    nombre: str | None = None
    apellido: str | None = None
    fecha_nacimiento: date | None = None
    genero: str | None = None
    direccion: str | None = None
    telefono: str | None = None
    email: str | None = None
    grupo_sanguineo: str | None = None
    alergias: str | None = None
    activo: bool | None = None


class PacienteResponse(BaseModel):
    paciente_id: int
    clinical_id: int
    dni: str
    nombre: str
    apellido: str
    fecha_nacimiento: date | None = None
    genero: str | None = None
    direccion: str | None = None
    telefono: str | None = None
    email: str | None = None
    grupo_sanguineo: str | None = None
    alergias: str | None = None
    activo: bool
    fecha_registro: datetime

    class Config:
        from_attributes = True


class PacienteListResponse(BaseModel):
    items: list[PacienteResponse]
    total: int


class HistoriaClinicaCreate(BaseModel):
    medico_id: int
    cita_id: int | None = None
    admision_id: int | None = None
    anamnesis: str | None = None
    diagnostico: str = Field(..., min_length=1)
    tratamiento: str = Field(..., min_length=1)
    prescripcion: str | None = None
    observaciones: str | None = None


class HistoriaClinicaUpdate(BaseModel):
    anamnesis: str | None = None
    diagnostico: str | None = None
    tratamiento: str | None = None
    prescripcion: str | None = None
    observaciones: str | None = None


class HistoriaClinicaMedico(BaseModel):
    medico_id: int
    nombre: str | None = None
    apellido: str | None = None
    especialidad: str | None = None


class DocumentoAdjuntoCreate(BaseModel):
    blob_url: str = Field(..., max_length=500)
    nombre_archivo: str = Field(..., max_length=200)
    tipo_archivo: str = Field(..., max_length=50)
    tamano_kb: int | None = None
    descripcion: str | None = None
    subido_por_usuario_id: int | None = None


class DocumentoAdjuntoResponse(BaseModel):
    documento_id: int
    historial_id: int
    blob_url: str
    nombre_archivo: str
    tipo_archivo: str
    tamano_kb: int | None = None
    descripcion: str | None = None
    fecha_subida: datetime

    class Config:
        from_attributes = True


class HistoriaClinicaResponse(BaseModel):
    historial_id: int
    paciente_id: int
    medico_id: int
    cita_id: int | None = None
    admision_id: int | None = None
    anamnesis: str | None = None
    diagnostico: str
    tratamiento: str
    prescripcion: str | None = None
    observaciones: str | None = None
    fecha_registro: datetime
    medico: HistoriaClinicaMedico | None = None
    documentos: list[DocumentoAdjuntoResponse] | None = None

    class Config:
        from_attributes = True
