from typing import Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.models import Habitacion as HabitacionORM
from domain.entities.habitacion import Habitacion
from domain.repositories import HabitacionRepository
from infrastructure.mappers.habitacion_mapper import HabitacionMapper


class SQLAlchemyHabitacionRepository(HabitacionRepository):
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, habitacion_id: int) -> Optional[Habitacion]:
        o = self.session.query(HabitacionORM).options(
            joinedload(HabitacionORM.departamento)
        ).filter(HabitacionORM.HabitacionID == habitacion_id).first()
        return HabitacionMapper.to_domain(o) if o else None

    def list(
        self,
        departamento_id: Optional[int],
        estado: Optional[str],
        tipo: Optional[str],
    ) -> list[Habitacion]:
        query = self.session.query(HabitacionORM).options(joinedload(HabitacionORM.departamento))
        if departamento_id is not None:
            query = query.filter(HabitacionORM.DepartamentoID == departamento_id)
        if estado is not None:
            query = query.filter(HabitacionORM.Estado == estado)
        if tipo is not None:
            query = query.filter(HabitacionORM.Tipo == tipo)
        items = query.order_by(HabitacionORM.Numero).all()
        return [HabitacionMapper.to_domain(o) for o in items]

    def find_by_depto_numero(self, departamento_id: int, numero: str) -> Optional[Habitacion]:
        o = self.session.query(HabitacionORM).filter(
            HabitacionORM.DepartamentoID == departamento_id,
            HabitacionORM.Numero == numero,
        ).first()
        return HabitacionMapper.to_domain(o) if o else None

    def save(self, habitacion: Habitacion) -> Habitacion:
        if habitacion.habitacion_id:
            o = self.session.query(HabitacionORM).get(habitacion.habitacion_id)
            HabitacionMapper.update_orm(habitacion, o)
        else:
            o = HabitacionMapper.to_orm(habitacion)
            self.session.add(o)
        self.session.flush()
        return HabitacionMapper.to_domain(o)

    def count_all(self) -> int:
        return self.session.query(func.count(HabitacionORM.HabitacionID)).scalar() or 0

    def count_by_estado(self, estado: str) -> int:
        return self.session.query(func.count(HabitacionORM.HabitacionID)).filter(
            HabitacionORM.Estado == estado
        ).scalar() or 0
