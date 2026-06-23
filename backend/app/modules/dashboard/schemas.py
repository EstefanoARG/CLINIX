from datetime import date, datetime
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
    doctores_hoy: list[DoctorHoyItem] = []
    pacientes_nuevos: list[PacienteNuevoItem] = []


class DashboardResponse(BaseModel):
    metricas: DashboardMetricas
    actividades: list[ActividadReciente] = []
    tablas: DashboardTablas = DashboardTablas()
