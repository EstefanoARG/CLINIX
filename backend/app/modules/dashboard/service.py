from __future__ import annotations

from collections import Counter, defaultdict
from datetime import date, datetime, time, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.models import (
    Admision,
    Cita,
    Enfermero,
    Habitacion,
    Medico,
    Paciente,
    ReservaWeb,
    Usuario,
)
from app.modules.dashboard.schemas import (
    ActividadReciente,
    DashboardGraficos,
    DashboardIndicadores,
    DashboardMetricas,
    DashboardResponse,
    DashboardTablas,
    DistribucionItem,
    DoctorHoyItem,
    EspecialidadDemandaItem,
    PacienteNuevoItem,
    SerieTemporalItem,
)
from infrastructure.uow import UnitOfWork


class DashboardService:
    def __init__(self, db: Session, uow: UnitOfWork | None = None):
        self.db = db
        self.uow = uow or UnitOfWork(db)

    @staticmethod
    def _get_date_range(periodo: str) -> tuple[date, date]:
        hoy = date.today()
        if periodo == "semana":
            inicio = hoy - timedelta(days=hoy.weekday())
            return inicio, inicio + timedelta(days=6)
        if periodo == "mes":
            inicio = hoy.replace(day=1)
            if hoy.month == 12:
                siguiente_mes = hoy.replace(year=hoy.year + 1, month=1, day=1)
            else:
                siguiente_mes = hoy.replace(month=hoy.month + 1, day=1)
            return inicio, siguiente_mes - timedelta(days=1)
        return hoy, hoy

    @classmethod
    def _get_chart_range(cls, periodo: str) -> tuple[date, date]:
        desde, hasta = cls._get_date_range(periodo)
        if periodo == "hoy":
            return desde - timedelta(days=6), hasta
        return desde, hasta

    @staticmethod
    def _datetime_bounds(desde: date, hasta: date) -> tuple[datetime, datetime]:
        return (
            datetime.combine(desde, time.min),
            datetime.combine(hasta + timedelta(days=1), time.min),
        )

    @staticmethod
    def _percent(parte: int, total: int) -> float:
        return round((parte / total) * 100, 1) if total else 0.0

    def get_metricas(self, periodo: str = "hoy") -> DashboardMetricas:
        desde, hasta = self._get_date_range(periodo)
        inicio, fin = self._datetime_bounds(desde, hasta)

        total_doctores = (
            self.db.query(func.count(Medico.MedicoID))
            .filter(Medico.Activo == True)
            .scalar()
            or 0
        )
        total_enfermeros = (
            self.db.query(func.count(Enfermero.EnfermeroID))
            .filter(Enfermero.Activo == True)
            .scalar()
            or 0
        )
        total_pacientes = (
            self.db.query(func.count(Paciente.PacienteID))
            .filter(Paciente.Activo == True)
            .scalar()
            or 0
        )

        habitaciones = self.db.query(Habitacion.Estado).all()
        estados_habitacion = Counter(estado for (estado,) in habitaciones)

        citas_periodo = (
            self.db.query(Cita)
            .filter(Cita.FechaHora >= inicio, Cita.FechaHora < fin)
            .all()
        )
        estados_citas = Counter(cita.EstadoCita for cita in citas_periodo)
        citas_activas = sum(
            estados_citas[estado]
            for estado in ("Programada", "Confirmada", "En curso")
        )
        citas_canceladas = sum(
            estados_citas[estado] for estado in ("Cancelada", "No asistió", "No asistiÃ³")
        )

        reservas_periodo = (
            self.db.query(ReservaWeb)
            .filter(ReservaWeb.FechaSolicitud >= inicio, ReservaWeb.FechaSolicitud < fin)
            .all()
        )
        estados_reservas = Counter(reserva.Estado for reserva in reservas_periodo)

        admisiones_activas = (
            self.db.query(func.count(Admision.AdmisionID))
            .filter(Admision.Estado == "Activa")
            .scalar()
            or 0
        )
        reservas_pendientes = (
            self.db.query(func.count(ReservaWeb.ReservaID))
            .filter(ReservaWeb.Estado == "Pendiente")
            .scalar()
            or 0
        )
        pacientes_recientes = (
            self.db.query(func.count(Paciente.PacienteID))
            .filter(
                Paciente.FechaRegistro >= inicio,
                Paciente.FechaRegistro < fin,
                Paciente.Activo == True,
            )
            .scalar()
            or 0
        )

        return DashboardMetricas(
            total_doctores=total_doctores,
            total_enfermeros=total_enfermeros,
            total_pacientes=total_pacientes,
            total_habitaciones=len(habitaciones),
            habitaciones_disponibles=estados_habitacion["Disponible"],
            habitaciones_ocupadas=estados_habitacion["Ocupada"],
            habitaciones_mantenimiento=estados_habitacion["Mantenimiento"],
            citas_hoy=citas_activas,
            total_citas_periodo=len(citas_periodo),
            citas_completadas=estados_citas["Completada"],
            citas_canceladas=citas_canceladas,
            admisiones_activas=admisiones_activas,
            reservas_pendientes=reservas_pendientes,
            total_reservas_periodo=len(reservas_periodo),
            reservas_convertidas=estados_reservas["Convertida"] + estados_reservas["Confirmada"],
            pacientes_recientes=pacientes_recientes,
        )

    def get_indicadores(self, metricas: DashboardMetricas) -> DashboardIndicadores:
        habitaciones_operativas = (
            metricas.habitaciones_disponibles + metricas.habitaciones_ocupadas
        )
        return DashboardIndicadores(
            ocupacion_hospitalaria=self._percent(
                metricas.habitaciones_ocupadas, habitaciones_operativas
            ),
            tasa_completitud_citas=self._percent(
                metricas.citas_completadas, metricas.total_citas_periodo
            ),
            tasa_cancelacion_citas=self._percent(
                metricas.citas_canceladas, metricas.total_citas_periodo
            ),
            conversion_reservas=self._percent(
                metricas.reservas_convertidas, metricas.total_reservas_periodo
            ),
            promedio_citas_por_medico=round(
                metricas.total_citas_periodo / metricas.total_doctores, 1
            )
            if metricas.total_doctores
            else 0,
        )

    def get_graficos(self, periodo: str = "hoy") -> DashboardGraficos:
        desde, hasta = self._get_date_range(periodo)
        inicio, fin = self._datetime_bounds(desde, hasta)
        tendencia_desde, tendencia_hasta = self._get_chart_range(periodo)
        tendencia_inicio, tendencia_fin = self._datetime_bounds(
            tendencia_desde, tendencia_hasta
        )

        citas_tendencia = (
            self.db.query(Cita)
            .filter(Cita.FechaHora >= tendencia_inicio, Cita.FechaHora < tendencia_fin)
            .all()
        )
        reservas_tendencia = (
            self.db.query(ReservaWeb)
            .filter(
                ReservaWeb.FechaSolicitud >= tendencia_inicio,
                ReservaWeb.FechaSolicitud < tendencia_fin,
            )
            .all()
        )

        serie_por_dia: dict[date, dict[str, int]] = defaultdict(
            lambda: {"citas": 0, "completadas": 0, "canceladas": 0, "reservas": 0}
        )
        for cita in citas_tendencia:
            dia = cita.FechaHora.date()
            serie_por_dia[dia]["citas"] += 1
            if cita.EstadoCita == "Completada":
                serie_por_dia[dia]["completadas"] += 1
            if cita.EstadoCita in ("Cancelada", "No asistió", "No asistiÃ³"):
                serie_por_dia[dia]["canceladas"] += 1
        for reserva in reservas_tendencia:
            serie_por_dia[reserva.FechaSolicitud.date()]["reservas"] += 1

        tendencia: list[SerieTemporalItem] = []
        dia_actual = tendencia_desde
        while dia_actual <= tendencia_hasta:
            valores = serie_por_dia[dia_actual]
            tendencia.append(
                SerieTemporalItem(
                    fecha=dia_actual.isoformat(),
                    etiqueta=dia_actual.strftime("%d/%m"),
                    **valores,
                )
            )
            dia_actual += timedelta(days=1)

        citas_periodo = (
            self.db.query(Cita)
            .options(joinedload(Cita.especialidad))
            .filter(Cita.FechaHora >= inicio, Cita.FechaHora < fin)
            .all()
        )
        reservas_periodo = (
            self.db.query(ReservaWeb)
            .options(joinedload(ReservaWeb.especialidad))
            .filter(
                ReservaWeb.FechaHoraDeseada >= inicio,
                ReservaWeb.FechaHoraDeseada < fin,
            )
            .all()
        )

        estados_citas = Counter(cita.EstadoCita for cita in citas_periodo)
        estados_reservas = Counter(reserva.Estado for reserva in reservas_periodo)
        estados_habitaciones = Counter(
            estado for (estado,) in self.db.query(Habitacion.Estado).all()
        )

        demanda: dict[str, dict[str, int]] = defaultdict(
            lambda: {"citas": 0, "reservas": 0}
        )
        for cita in citas_periodo:
            nombre = (
                cita.especialidad.NombreEspecialidad
                if cita.especialidad
                else "Sin especialidad"
            )
            demanda[nombre]["citas"] += 1
        for reserva in reservas_periodo:
            nombre = (
                reserva.especialidad.NombreEspecialidad
                if reserva.especialidad
                else "Sin especialidad"
            )
            demanda[nombre]["reservas"] += 1

        demanda_especialidades = sorted(
            (
                EspecialidadDemandaItem(
                    especialidad=nombre,
                    citas=valores["citas"],
                    reservas=valores["reservas"],
                    total=valores["citas"] + valores["reservas"],
                )
                for nombre, valores in demanda.items()
            ),
            key=lambda item: item.total,
            reverse=True,
        )[:8]

        return DashboardGraficos(
            tendencia=tendencia,
            estados_citas=[
                DistribucionItem(nombre=nombre, valor=valor)
                for nombre, valor in estados_citas.most_common()
            ],
            ocupacion_habitaciones=[
                DistribucionItem(nombre=nombre, valor=valor)
                for nombre, valor in estados_habitaciones.most_common()
            ],
            estados_reservas=[
                DistribucionItem(nombre=nombre, valor=valor)
                for nombre, valor in estados_reservas.most_common()
            ],
            demanda_especialidades=demanda_especialidades,
        )

    def get_actividades(self, limite: int = 10) -> list[ActividadReciente]:
        actividades: list[ActividadReciente] = []

        admisiones = (
            self.db.query(Admision)
            .options(joinedload(Admision.paciente))
            .filter(Admision.Estado == "Activa")
            .order_by(Admision.FechaIngreso.desc())
            .limit(5)
            .all()
        )
        for admision in admisiones:
            paciente = (
                f"{admision.paciente.Nombre} {admision.paciente.Apellido}"
                if admision.paciente
                else f"Paciente #{admision.PacienteID}"
            )
            actividades.append(
                ActividadReciente(
                    tipo="admision",
                    descripcion=f"Admisión activa de {paciente}: {(admision.MotivoIngreso or '')[:70]}",
                    fecha=admision.FechaIngreso.strftime("%Y-%m-%d %H:%M")
                    if admision.FechaIngreso
                    else "",
                )
            )

        citas = (
            self.db.query(Cita)
            .options(
                joinedload(Cita.paciente),
                joinedload(Cita.medico).joinedload(Medico.usuario),
            )
            .filter(Cita.FechaHora >= datetime.combine(date.today(), time.min))
            .order_by(Cita.FechaHora)
            .limit(5)
            .all()
        )
        for cita in citas:
            paciente = (
                f"{cita.paciente.Nombre} {cita.paciente.Apellido}"
                if cita.paciente
                else f"Paciente #{cita.PacienteID}"
            )
            medico = (
                f"{cita.medico.usuario.Nombre} {cita.medico.usuario.Apellido}"
                if cita.medico and cita.medico.usuario
                else f"Médico #{cita.MedicoID}"
            )
            actividades.append(
                ActividadReciente(
                    tipo="cita",
                    descripcion=f"Cita de {paciente} con {medico} · {cita.EstadoCita}",
                    fecha=cita.FechaHora.strftime("%Y-%m-%d %H:%M"),
                )
            )

        altas = (
            self.db.query(Admision)
            .options(joinedload(Admision.paciente))
            .filter(Admision.Estado == "Alta")
            .order_by(Admision.FechaAlta.desc())
            .limit(5)
            .all()
        )
        for alta in altas:
            if not alta.FechaAlta:
                continue
            paciente = (
                f"{alta.paciente.Nombre} {alta.paciente.Apellido}"
                if alta.paciente
                else f"Paciente #{alta.PacienteID}"
            )
            actividades.append(
                ActividadReciente(
                    tipo="alta",
                    descripcion=f"Alta médica de {paciente} ({alta.TipoAlta or 'sin clasificación'})",
                    fecha=alta.FechaAlta.strftime("%Y-%m-%d %H:%M"),
                )
            )

        actividades.sort(key=lambda item: item.fecha, reverse=True)
        return actividades[:limite]

    def get_doctores_hoy(self, periodo: str = "hoy") -> list[DoctorHoyItem]:
        desde, hasta = self._get_date_range(periodo)
        inicio, fin = self._datetime_bounds(desde, hasta)
        doctores = (
            self.db.query(Medico)
            .options(
                joinedload(Medico.usuario),
                joinedload(Medico.especialidad),
                joinedload(Medico.citas),
            )
            .join(Usuario)
            .filter(Medico.Activo == True, Usuario.Activo == True)
            .all()
        )

        items: list[DoctorHoyItem] = []
        for doctor in doctores:
            citas = [
                cita
                for cita in doctor.citas
                if inicio <= cita.FechaHora < fin
            ]
            programadas = sum(
                cita.EstadoCita in ("Programada", "Confirmada", "En curso")
                for cita in citas
            )
            completadas = sum(cita.EstadoCita == "Completada" for cita in citas)
            if not citas:
                continue
            items.append(
                DoctorHoyItem(
                    medico_id=doctor.MedicoID,
                    nombre=f"{doctor.usuario.Nombre} {doctor.usuario.Apellido}"
                    if doctor.usuario
                    else "",
                    especialidad=doctor.especialidad.NombreEspecialidad
                    if doctor.especialidad
                    else "",
                    citas_programadas=programadas,
                    citas_completadas=completadas,
                )
            )

        return sorted(
            items,
            key=lambda item: item.citas_programadas + item.citas_completadas,
            reverse=True,
        )[:10]

    def get_pacientes_nuevos(self, periodo: str = "hoy") -> list[PacienteNuevoItem]:
        desde, hasta = self._get_date_range(periodo)
        inicio, fin = self._datetime_bounds(desde, hasta)
        pacientes = (
            self.db.query(Paciente)
            .options(joinedload(Paciente.citas))
            .filter(
                Paciente.FechaRegistro >= inicio,
                Paciente.FechaRegistro < fin,
                Paciente.Activo == True,
            )
            .order_by(Paciente.FechaRegistro.desc())
            .limit(20)
            .all()
        )

        return [
            PacienteNuevoItem(
                paciente_id=paciente.PacienteID,
                nombre=f"{paciente.Nombre} {paciente.Apellido}",
                dni=paciente.DNI,
                fecha_registro=paciente.FechaRegistro.strftime("%Y-%m-%d %H:%M")
                if paciente.FechaRegistro
                else "",
                tiene_cita=any(
                    inicio <= cita.FechaHora < fin for cita in paciente.citas
                ),
            )
            for paciente in pacientes
        ]

    def get_dashboard(self, periodo: str = "hoy") -> DashboardResponse:
        desde, hasta = self._get_date_range(periodo)
        tendencia_desde, tendencia_hasta = self._get_chart_range(periodo)
        metricas = self.get_metricas(periodo)
        return DashboardResponse(
            metricas=metricas,
            indicadores=self.get_indicadores(metricas),
            graficos=self.get_graficos(periodo),
            actividades=self.get_actividades(),
            tablas=DashboardTablas(
                doctores_hoy=self.get_doctores_hoy(periodo),
                pacientes_nuevos=self.get_pacientes_nuevos(periodo),
            ),
            periodo_desde=desde.isoformat(),
            periodo_hasta=hasta.isoformat(),
            tendencia_desde=tendencia_desde.isoformat(),
            tendencia_hasta=tendencia_hasta.isoformat(),
        )
