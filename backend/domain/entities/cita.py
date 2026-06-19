from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Optional

from domain.value_objects.estado_cita import EstadoCita


@dataclass
class Cita:
    cita_id: Optional[int]
    paciente_id: int
    medico_id: int
    especialidad_id: int
    fecha_hora: datetime
    duracion_minutos: int = 30
    estado_cita: str = EstadoCita.PROGRAMADA.value
    ubicacion_id: Optional[int] = None
    reserva_id: Optional[int] = None
    motivo_consulta: Optional[str] = None
    observaciones: Optional[str] = None
    fecha_creacion: Optional[datetime] = None
    creado_por_usuario_id: Optional[int] = None

    @property
    def fecha_hora_fin(self) -> datetime:
        return self.fecha_hora + timedelta(minutes=self.duracion_minutos)

    def overlaps_with(self, other: Cita) -> bool:
        return self.medico_id == other.medico_id and (
            self.fecha_hora < other.fecha_hora_fin
            and other.fecha_hora < self.fecha_hora_fin
        )

    def cambiar_estado(self, nuevo_estado: str) -> None:
        actual = EstadoCita(self.estado_cita)
        nuevo = EstadoCita(nuevo_estado)
        if not actual.puede_transicionar_a(nuevo):
            raise ValueError(
                f"No se puede cambiar de {self.estado_cita} a {nuevo_estado}"
            )
        self.estado_cita = nuevo_estado

    def cancelar(self) -> None:
        self.cambiar_estado(EstadoCita.CANCELADA.value)
