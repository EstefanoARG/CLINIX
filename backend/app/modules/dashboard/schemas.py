from pydantic import BaseModel


class DashboardMetricas(BaseModel):
    total_doctores: int = 0
    total_enfermeros: int = 0
    total_pacientes: int = 0
    total_habitaciones: int = 0
    habitaciones_disponibles: int = 0
    habitaciones_ocupadas: int = 0
    citas_hoy: int = 0
    admisiones_activas: int = 0
    reservas_pendientes: int = 0
    pacientes_recientes: int = 0


class ActividadReciente(BaseModel):
    tipo: str
    descripcion: str
    fecha: str


class DashboardResponse(BaseModel):
    metricas: DashboardMetricas
    actividades: list[ActividadReciente] = []
