from __future__ import annotations

from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models import (
    Medico, Enfermero, Paciente, Habitacion, Cita, Admision, ReservaWeb,
)
from app.modules.dashboard.schemas import DashboardMetricas, ActividadReciente, DashboardResponse
from infrastructure.uow import UnitOfWork


class DashboardService:
    def __init__(self, db: Session, uow: UnitOfWork | None = None):
        self.db = db
        self.uow = uow or UnitOfWork(db)

    def get_metricas(self) -> DashboardMetricas:
        hoy = date.today()

        total_doctores = self.db.query(func.count(Medico.MedicoID)).filter(Medico.Activo == True).scalar() or 0
        total_enfermeros = self.db.query(func.count(Enfermero.EnfermeroID)).filter(Enfermero.Activo == True).scalar() or 0
        total_pacientes = self.db.query(func.count(Paciente.PacienteID)).filter(Paciente.Activo == True).scalar() or 0
        total_habitaciones = self.db.query(func.count(Habitacion.HabitacionID)).scalar() or 0
        habitaciones_disponibles = self.db.query(func.count(Habitacion.HabitacionID)).filter(
            Habitacion.Estado == "Disponible"
        ).scalar() or 0
        habitaciones_ocupadas = self.db.query(func.count(Habitacion.HabitacionID)).filter(
            Habitacion.Estado == "Ocupada"
        ).scalar() or 0
        citas_hoy = self.db.query(func.count(Cita.CitaID)).filter(
            func.date(Cita.FechaHora) == hoy,
            Cita.EstadoCita.in_(["Programada", "Confirmada", "En curso"]),
        ).scalar() or 0
        admisiones_activas = self.db.query(func.count(Admision.AdmisionID)).filter(
            Admision.Estado == "Activa"
        ).scalar() or 0
        reservas_pendientes = self.db.query(func.count(ReservaWeb.ReservaID)).filter(
            ReservaWeb.Estado == "Pendiente"
        ).scalar() or 0
        pacientes_recientes = self.db.query(func.count(Paciente.PacienteID)).filter(
            func.date(Paciente.FechaRegistro) == hoy
        ).scalar() or 0

        return DashboardMetricas(
            total_doctores=total_doctores,
            total_enfermeros=total_enfermeros,
            total_pacientes=total_pacientes,
            total_habitaciones=total_habitaciones,
            habitaciones_disponibles=habitaciones_disponibles,
            habitaciones_ocupadas=habitaciones_ocupadas,
            citas_hoy=citas_hoy,
            admisiones_activas=admisiones_activas,
            reservas_pendientes=reservas_pendientes,
            pacientes_recientes=pacientes_recientes,
        )

    def get_actividades(self, limite: int = 10) -> list[ActividadReciente]:
        actividades = []

        admisiones = self.db.query(Admision).filter(
            Admision.Estado == "Activa"
        ).order_by(Admision.FechaIngreso.desc()).limit(5).all()
        for a in admisiones:
            actividades.append(ActividadReciente(
                tipo="admision",
                descripcion=f"Paciente admitido (ID: {a.PacienteID}) - {(a.MotivoIngreso or '')[:50]}",
                fecha=a.FechaIngreso.strftime("%Y-%m-%d %H:%M") if a.FechaIngreso else "",
            ))

        citas = self.db.query(Cita).filter(
            func.date(Cita.FechaHora) >= datetime.now().date()
        ).order_by(Cita.FechaHora).limit(5).all()
        for c in citas:
            actividades.append(ActividadReciente(
                tipo="cita",
                descripcion=f"Cita programada - Paciente ID: {c.PacienteID} con Médico ID: {c.MedicoID}",
                fecha=c.FechaHora.strftime("%Y-%m-%d %H:%M"),
            ))

        altas = self.db.query(Admision).filter(
            Admision.Estado == "Alta"
        ).order_by(Admision.FechaAlta.desc()).limit(5).all()
        for a in altas:
            if a.FechaAlta:
                actividades.append(ActividadReciente(
                    tipo="alta",
                    descripcion=f"Alta médica - Paciente ID: {a.PacienteID} ({a.TipoAlta or 'N/A'})",
                    fecha=a.FechaAlta.strftime("%Y-%m-%d %H:%M"),
                ))

        actividades.sort(key=lambda x: x.fecha, reverse=True)
        return actividades[:limite]

    def get_dashboard(self) -> DashboardResponse:
        return DashboardResponse(
            metricas=self.get_metricas(),
            actividades=self.get_actividades(),
        )
