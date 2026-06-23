from __future__ import annotations

from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date

from app.models import (
    Medico, Enfermero, Paciente, Habitacion, Cita, Admision, ReservaWeb, Usuario,
)
from app.modules.dashboard.schemas import (
    DashboardMetricas, ActividadReciente, DashboardResponse,
    DashboardTablas, DoctorHoyItem, PacienteNuevoItem,
)
from infrastructure.uow import UnitOfWork


class DashboardService:
    def __init__(self, db: Session, uow: UnitOfWork | None = None):
        self.db = db
        self.uow = uow or UnitOfWork(db)

    def _get_date_range(self, periodo: str) -> tuple[date, date]:
        hoy = date.today()
        if periodo == "semana":
            inicio = hoy - timedelta(days=hoy.weekday())
            fin = inicio + timedelta(days=6)
            return inicio, fin
        elif periodo == "mes":
            inicio = hoy.replace(day=1)
            if hoy.month == 12:
                fin = hoy.replace(year=hoy.year + 1, month=1, day=1) - timedelta(days=1)
            else:
                fin = hoy.replace(month=hoy.month + 1, day=1) - timedelta(days=1)
            return inicio, fin
        return hoy, hoy

    def get_metricas(self, periodo: str = "hoy") -> DashboardMetricas:
        desde, hasta = self._get_date_range(periodo)

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
            cast(Cita.FechaHora, Date) >= desde,
            cast(Cita.FechaHora, Date) <= hasta,
            Cita.EstadoCita.in_(["Programada", "Confirmada", "En curso"]),
        ).scalar() or 0
        admisiones_activas = self.db.query(func.count(Admision.AdmisionID)).filter(
            Admision.Estado == "Activa"
        ).scalar() or 0
        reservas_pendientes = self.db.query(func.count(ReservaWeb.ReservaID)).filter(
            ReservaWeb.Estado == "Pendiente"
        ).scalar() or 0
        pacientes_recientes = self.db.query(func.count(Paciente.PacienteID)).filter(
            cast(Paciente.FechaRegistro, Date) >= desde,
            cast(Paciente.FechaRegistro, Date) <= hasta,
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
            cast(Cita.FechaHora, Date) >= datetime.now().date()
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

    def get_doctores_hoy(self, periodo: str = "hoy") -> list[DoctorHoyItem]:
        desde, hasta = self._get_date_range(periodo)
        doctores = (
            self.db.query(Medico)
            .join(Usuario)
            .filter(Medico.Activo == True, Usuario.Activo == True)
            .all()
        )
        items = []
        for doc in doctores:
            citas = self.db.query(Cita).filter(
                Cita.MedicoID == doc.MedicoID,
                cast(Cita.FechaHora, Date) >= desde,
                cast(Cita.FechaHora, Date) <= hasta,
            ).all()
            programadas = sum(1 for c in citas if c.EstadoCita in ("Programada", "Confirmada", "En curso"))
            completadas = sum(1 for c in citas if c.EstadoCita == "Completada")
            nombre_completo = f"{doc.usuario.Nombre} {doc.usuario.Apellido}" if doc.usuario else ""
            items.append(DoctorHoyItem(
                medico_id=doc.MedicoID,
                nombre=nombre_completo,
                especialidad=doc.especialidad.NombreEspecialidad if doc.especialidad else "",
                citas_programadas=programadas,
                citas_completadas=completadas,
            ))
        return items

    def get_pacientes_nuevos(self, periodo: str = "hoy") -> list[PacienteNuevoItem]:
        desde, hasta = self._get_date_range(periodo)
        pacientes = (
            self.db.query(Paciente)
            .filter(
                cast(Paciente.FechaRegistro, Date) >= desde,
                cast(Paciente.FechaRegistro, Date) <= hasta,
                Paciente.Activo == True,
            )
            .order_by(Paciente.FechaRegistro.desc())
            .limit(20)
            .all()
        )
        items = []
        for p in pacientes:
            tiene_cita = self.db.query(Cita).filter(
                Cita.PacienteID == p.PacienteID,
                cast(Cita.FechaHora, Date) >= desde,
                cast(Cita.FechaHora, Date) <= hasta,
            ).first() is not None
            items.append(PacienteNuevoItem(
                paciente_id=p.PacienteID,
                nombre=f"{p.Nombre} {p.Apellido}",
                dni=p.DNI,
                fecha_registro=p.FechaRegistro.strftime("%Y-%m-%d %H:%M") if p.FechaRegistro else "",
                tiene_cita=tiene_cita,
            ))
        return items

    def get_dashboard(self, periodo: str = "hoy") -> DashboardResponse:
        return DashboardResponse(
            metricas=self.get_metricas(periodo),
            actividades=self.get_actividades(),
            tablas=DashboardTablas(
                doctores_hoy=self.get_doctores_hoy(periodo),
                pacientes_nuevos=self.get_pacientes_nuevos(periodo),
            ),
        )
