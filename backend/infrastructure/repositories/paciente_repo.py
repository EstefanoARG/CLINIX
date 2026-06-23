from __future__ import annotations

from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date

from app.models import Paciente as PacienteORM
from domain.entities.paciente import Paciente
from domain.repositories import PacienteRepository
from infrastructure.mappers.paciente_mapper import PacienteMapper


class SQLAlchemyPacienteRepository(PacienteRepository):
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, paciente_id: int) -> Optional[Paciente]:
        o = self.session.query(PacienteORM).filter(PacienteORM.PacienteID == paciente_id).first()
        return PacienteMapper.to_domain(o) if o else None

    def get_by_dni(self, clinical_id: int, dni: str) -> Optional[Paciente]:
        o = self.session.query(PacienteORM).filter(
            PacienteORM.ClinicalID == clinical_id,
            PacienteORM.DNI == dni,
        ).first()
        return PacienteMapper.to_domain(o) if o else None

    def get_by_email(self, email: str) -> Optional[Paciente]:
        o = self.session.query(PacienteORM).filter(PacienteORM.Email == email).first()
        return PacienteMapper.to_domain(o) if o else None

    def search(self, q: str, skip: int, limit: int) -> tuple[list[Paciente], int]:
        pattern = f"%{q}%"
        query = self.session.query(PacienteORM).filter(
            PacienteORM.DNI.ilike(pattern)
            | PacienteORM.Nombre.ilike(pattern)
            | PacienteORM.Apellido.ilike(pattern)
            | PacienteORM.Email.ilike(pattern)
        )
        total = query.count()
        items = query.offset(skip).limit(limit).all()
        return [PacienteMapper.to_domain(o) for o in items], total

    def list(self, skip: int, limit: int, activo: Optional[bool]) -> tuple[list[Paciente], int]:
        query = self.session.query(PacienteORM)
        if activo is not None:
            query = query.filter(PacienteORM.Activo == activo)
        total = query.count()
        items = query.order_by(PacienteORM.Apellido, PacienteORM.Nombre).offset(skip).limit(limit).all()
        return [PacienteMapper.to_domain(o) for o in items], total

    def save(self, paciente: Paciente) -> Paciente:
        if paciente.paciente_id:
            o = self.session.query(PacienteORM).get(paciente.paciente_id)
            PacienteMapper.update_orm(paciente, o)
        else:
            o = PacienteMapper.to_orm(paciente)
            self.session.add(o)
        self.session.flush()
        return PacienteMapper.to_domain(o)

    def count_activos(self) -> int:
        return self.session.query(func.count(PacienteORM.PacienteID)).filter(
            PacienteORM.Activo == True
        ).scalar() or 0

    def count_registrados_hoy(self) -> int:
        from datetime import date
        return self.session.query(func.count(PacienteORM.PacienteID)).filter(
            cast(PacienteORM.FechaRegistro, Date) == date.today()
        ).scalar() or 0
