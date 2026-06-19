from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from domain.value_objects.estado_cita import EstadoHabitacion


@dataclass
class Habitacion:
    habitacion_id: Optional[int]
    departamento_id: int
    numero: str
    piso: Optional[str]
    tipo: str
    capacidad: int = 1
    estado: str = EstadoHabitacion.DISPONIBLE.value
    departamento_nombre: Optional[str] = None

    def ocupar(self) -> None:
        actual = EstadoHabitacion(self.estado)
        nuevo = EstadoHabitacion.OCUPADA
        if not actual.puede_transicionar_a(nuevo):
            raise ValueError(f"No se puede ocupar una habitación en estado {self.estado}")
        self.estado = nuevo.value

    def liberar(self) -> None:
        actual = EstadoHabitacion(self.estado)
        nuevo = EstadoHabitacion.DISPONIBLE
        if not actual.puede_transicionar_a(nuevo):
            raise ValueError(f"No se puede liberar una habitación en estado {self.estado}")
        self.estado = nuevo.value

    def poner_en_mantenimiento(self) -> None:
        actual = EstadoHabitacion(self.estado)
        nuevo = EstadoHabitacion.MANTENIMIENTO
        if not actual.puede_transicionar_a(nuevo):
            raise ValueError(
                f"No se puede poner en mantenimiento una habitación en estado {self.estado}"
            )
        self.estado = nuevo.value
