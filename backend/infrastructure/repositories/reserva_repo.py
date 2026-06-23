from __future__ import annotations

from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models import ReservaWeb as ReservaORM
from domain.entities.reserva import ReservaWeb
from domain.repositories import ReservaRepository
from infrastructure.mappers.reserva_mapper import ReservaMapper


class SQLAlchemyReservaRepository(ReservaRepository):
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, reserva_id: int) -> Optional[ReservaWeb]:
        o = self.session.query(ReservaORM).filter(ReservaORM.ReservaID == reserva_id).first()
        return ReservaMapper.to_domain(o) if o else None

    def list(self, skip: int, limit: int, estado: Optional[str]) -> tuple[list[ReservaWeb], int]:
        query = self.session.query(ReservaORM)
        if estado:
            query = query.filter(ReservaORM.Estado == estado)
        total = query.count()
        items = query.order_by(ReservaORM.FechaSolicitud.desc()).offset(skip).limit(limit).all()
        return [ReservaMapper.to_domain(o) for o in items], total

    def list_by_paciente(self, paciente_id: int) -> list[ReservaWeb]:
        items = self.session.query(ReservaORM).filter(
            ReservaORM.PacienteID == paciente_id
        ).order_by(ReservaORM.FechaSolicitud.desc()).all()
        return [ReservaMapper.to_domain(o) for o in items]

    def save(self, reserva: ReservaWeb) -> ReservaWeb:
        if reserva.reserva_id:
            o = self.session.query(ReservaORM).get(reserva.reserva_id)
            ReservaMapper.update_orm(reserva, o)
        else:
            o = ReservaMapper.to_orm(reserva)
            self.session.add(o)
        self.session.flush()
        return ReservaMapper.to_domain(o)

    def count_pendientes(self) -> int:
        return self.session.query(func.count(ReservaORM.ReservaID)).filter(
            ReservaORM.Estado == "Pendiente"
        ).scalar() or 0
