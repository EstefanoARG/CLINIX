from __future__ import annotations

from typing import Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.models import Admision as AdmisionORM, Medico as MedicoORM, Enfermero as EnfermeroORM, Habitacion as HabitacionORM
from domain.entities.admision import Admision
from domain.repositories import AdmisionRepository
from infrastructure.mappers.admision_mapper import AdmisionMapper


class SQLAlchemyAdmisionRepository(AdmisionRepository):
    def __init__(self, session: Session):
        self.session = session

    def _base_query(self):
        return self.session.query(AdmisionORM).options(
            joinedload(AdmisionORM.paciente),
            joinedload(AdmisionORM.medico).joinedload(MedicoORM.usuario),
            joinedload(AdmisionORM.enfermero).joinedload(EnfermeroORM.usuario),
            joinedload(AdmisionORM.habitacion).joinedload(HabitacionORM.departamento),
        )

    def get_by_id(self, admision_id: int) -> Optional[Admision]:
        o = self._base_query().filter(AdmisionORM.AdmisionID == admision_id).first()
        return AdmisionMapper.to_domain(o) if o else None

    def list(
        self,
        skip: int,
        limit: int,
        estado: Optional[str],
        paciente_id: Optional[int],
    ) -> tuple[list[Admision], int]:
        query = self._base_query()
        if estado:
            query = query.filter(AdmisionORM.Estado == estado)
        if paciente_id:
            query = query.filter(AdmisionORM.PacienteID == paciente_id)
        total = query.count()
        items = query.order_by(AdmisionORM.FechaIngreso.desc()).offset(skip).limit(limit).all()
        return [AdmisionMapper.to_domain(o) for o in items], total

    def list_by_enfermero(self, enfermero_id: int) -> list[Admision]:
        items = self._base_query().filter(
            AdmisionORM.EnfermeroID == enfermero_id,
            AdmisionORM.Estado == "Activa",
        ).order_by(AdmisionORM.FechaIngreso.desc()).all()
        return [AdmisionMapper.to_domain(o) for o in items]

    def list_recent(self, limit: int) -> list[Admision]:
        items = self._base_query().filter(
            AdmisionORM.Estado == "Activa"
        ).order_by(AdmisionORM.FechaIngreso.desc()).limit(limit).all()
        return [AdmisionMapper.to_domain(o) for o in items]

    def list_recent_alta(self, limit: int) -> list[Admision]:
        items = self._base_query().filter(
            AdmisionORM.Estado == "Alta"
        ).order_by(AdmisionORM.FechaAlta.desc()).limit(limit).all()
        return [AdmisionMapper.to_domain(o) for o in items]

    def save(self, admision: Admision) -> Admision:
        if admision.admision_id:
            o = self.session.query(AdmisionORM).get(admision.admision_id)
            AdmisionMapper.update_orm(admision, o)
        else:
            o = AdmisionMapper.to_orm(admision)
            self.session.add(o)
        self.session.flush()
        return AdmisionMapper.to_domain(o)

    def count_activas(self) -> int:
        return self.session.query(func.count(AdmisionORM.AdmisionID)).filter(
            AdmisionORM.Estado == "Activa"
        ).scalar() or 0
