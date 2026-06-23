from __future__ import annotations

from typing import Optional
from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models import Cita as CitaORM
from domain.entities.cita import Cita
from domain.repositories import CitaRepository
from infrastructure.mappers.cita_mapper import CitaMapper


class SQLAlchemyCitaRepository(CitaRepository):
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, cita_id: int) -> Optional[Cita]:
        o = self.session.query(CitaORM).filter(CitaORM.CitaID == cita_id).first()
        return CitaMapper.to_domain(o) if o else None

    def list(
        self,
        skip: int,
        limit: int,
        estado: Optional[str],
        medico_id: Optional[int],
        paciente_id: Optional[int],
        fecha_desde: Optional[date],
        fecha_hasta: Optional[date],
    ) -> tuple[list[Cita], int]:
        query = self.session.query(CitaORM)
        if estado:
            query = query.filter(CitaORM.EstadoCita == estado)
        if medico_id:
            query = query.filter(CitaORM.MedicoID == medico_id)
        if paciente_id:
            query = query.filter(CitaORM.PacienteID == paciente_id)
        if fecha_desde:
            query = query.filter(CitaORM.FechaHora >= datetime.combine(fecha_desde, datetime.min.time()))
        if fecha_hasta:
            query = query.filter(CitaORM.FechaHora <= datetime.combine(fecha_hasta, datetime.max.time()))
        total = query.count()
        items = query.order_by(CitaORM.FechaHora).offset(skip).limit(limit).all()
        return [CitaMapper.to_domain(o) for o in items], total

    def find_conflicts(
        self, medico_id: int, fecha_hora: datetime, duracion_minutos: int, exclude_id: Optional[int]
    ) -> list[Cita]:
        new_start = fecha_hora
        new_end = fecha_hora + timedelta(minutes=duracion_minutos)
        query = self.session.query(CitaORM).filter(
            CitaORM.MedicoID == medico_id,
            CitaORM.EstadoCita.in_(["Programada", "Confirmada", "En curso"]),
            CitaORM.FechaHora < new_end,
        )
        if exclude_id:
            query = query.filter(CitaORM.CitaID != exclude_id)
        items = [
            item for item in query.all()
            if item.FechaHora + timedelta(minutes=item.DuracionMinutos) > new_start
        ]
        return [CitaMapper.to_domain(o) for o in items]

    def find_by_medico_fecha(self, medico_id: int, fecha: date) -> list[Cita]:
        items = self.session.query(CitaORM).filter(
            CitaORM.MedicoID == medico_id,
            CitaORM.FechaHora >= datetime.combine(fecha, datetime.min.time()),
            CitaORM.FechaHora <= datetime.combine(fecha, datetime.max.time()),
            CitaORM.EstadoCita.in_(["Programada", "Confirmada", "En curso"]),
        ).all()
        return [CitaMapper.to_domain(o) for o in items]

    def save(self, cita: Cita) -> Cita:
        if cita.cita_id:
            o = self.session.query(CitaORM).get(cita.cita_id)
            CitaMapper.update_orm(cita, o)
        else:
            o = CitaMapper.to_orm(cita)
            self.session.add(o)
        self.session.flush()
        return CitaMapper.to_domain(o)

    def count_hoy(self) -> int:
        return self.session.query(func.count(CitaORM.CitaID)).filter(
            func.date(CitaORM.FechaHora) == date.today(),
            CitaORM.EstadoCita.in_(["Programada", "Confirmada", "En curso"]),
        ).scalar() or 0
