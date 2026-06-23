from pydantic import BaseModel, Field


class DashboardMetricas(BaseModel):
    total_doctores: int = 0
    total_enfermeros: int = 0
    total_pacientes: int = 0
    total_habitaciones: int = 0
    habitaciones_disponibles: int = 0
    habitaciones_ocupadas: int = 0
    habitaciones_mantenimiento: int = 0
    citas_hoy: int = 0
    total_citas_periodo: int = 0
    citas_completadas: int = 0
    citas_canceladas: int = 0
    admisiones_activas: int = 0
    reservas_pendientes: int = 0
    total_reservas_periodo: int = 0
    reservas_convertidas: int = 0
    pacientes_recientes: int = 0


class DashboardIndicadores(BaseModel):
    ocupacion_hospitalaria: float = 0
    tasa_completitud_citas: float = 0
    tasa_cancelacion_citas: float = 0
    conversion_reservas: float = 0
    promedio_citas_por_medico: float = 0


class SerieTemporalItem(BaseModel):
    fecha: str
    etiqueta: str
    citas: int = 0
    completadas: int = 0
    canceladas: int = 0
    reservas: int = 0


class DistribucionItem(BaseModel):
    nombre: str
    valor: int = 0


class EspecialidadDemandaItem(BaseModel):
    especialidad: str
    citas: int = 0
    reservas: int = 0
    total: int = 0


class DashboardGraficos(BaseModel):
    tendencia: list[SerieTemporalItem] = Field(default_factory=list)
    estados_citas: list[DistribucionItem] = Field(default_factory=list)
    ocupacion_habitaciones: list[DistribucionItem] = Field(default_factory=list)
    estados_reservas: list[DistribucionItem] = Field(default_factory=list)
    demanda_especialidades: list[EspecialidadDemandaItem] = Field(default_factory=list)


class ActividadReciente(BaseModel):
    tipo: str
    descripcion: str
    fecha: str


class DoctorHoyItem(BaseModel):
    medico_id: int
    nombre: str
    especialidad: str
    citas_programadas: int = 0
    citas_completadas: int = 0


class PacienteNuevoItem(BaseModel):
    paciente_id: int
    nombre: str
    dni: str
    fecha_registro: str
    tiene_cita: bool = False


class DashboardTablas(BaseModel):
    doctores_hoy: list[DoctorHoyItem] = Field(default_factory=list)
    pacientes_nuevos: list[PacienteNuevoItem] = Field(default_factory=list)


class DashboardResponse(BaseModel):
    metricas: DashboardMetricas
    indicadores: DashboardIndicadores
    graficos: DashboardGraficos
    actividades: list[ActividadReciente] = Field(default_factory=list)
    tablas: DashboardTablas = Field(default_factory=DashboardTablas)
    periodo_desde: str
    periodo_hasta: str
    tendencia_desde: str
    tendencia_hasta: str
