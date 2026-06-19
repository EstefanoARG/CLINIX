from app.models import Habitacion as HabitacionORM
from domain.entities.habitacion import Habitacion


class HabitacionMapper:

    @staticmethod
    def to_domain(o: HabitacionORM) -> Habitacion:
        return Habitacion(
            habitacion_id=o.HabitacionID,
            departamento_id=o.DepartamentoID,
            numero=o.Numero,
            piso=o.Piso,
            tipo=o.Tipo,
            capacidad=o.Capacidad,
            estado=o.Estado,
            departamento_nombre=o.departamento.Nombre if o.departamento else None,
        )

    @staticmethod
    def to_orm(d: Habitacion) -> HabitacionORM:
        return HabitacionORM(
            HabitacionID=d.habitacion_id,
            DepartamentoID=d.departamento_id,
            Numero=d.numero,
            Piso=d.piso,
            Tipo=d.tipo,
            Capacidad=d.capacidad,
            Estado=d.estado,
        )

    @staticmethod
    def update_orm(d: Habitacion, o: HabitacionORM) -> None:
        o.Piso = d.piso
        o.Tipo = d.tipo
        o.Capacidad = d.capacidad
        o.Estado = d.estado
