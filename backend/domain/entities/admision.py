from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional

from domain.value_objects.estado_cita import EstadoAdmision


@dataclass
class Admision:
    admision_id: Optional[int]
    paciente_id: int
    medico_id: int
    habitacion_id: int
    motivo_ingreso: str
    diagnostico_ingreso: Optional[str]
    enfermero_id: Optional[int] = None
    cita_id: Optional[int] = None
    fecha_ingreso: datetime = field(default_factory=datetime.now)
    fecha_alta: Optional[datetime] = None
    diagnostico_alta: Optional[str] = None
    tipo_alta: Optional[str] = None
    estado: str = EstadoAdmision.ACTIVA.value
    observaciones: Optional[str] = None
    fecha_creacion: datetime = field(default_factory=datetime.now)
    creado_por_usuario_id: Optional[int] = None

    def dar_alta(self, tipo_alta: str, diagnostico_alta: str, observaciones: Optional[str] = None) -> None:
        actual = EstadoAdmision(self.estado)
        nuevo = EstadoAdmision.ALTA
        if not actual.puede_transicionar_a(nuevo):
            raise ValueError(f"No se puede dar alta a una admisión en estado {self.estado}")
        self.estado = nuevo.value
        self.fecha_alta = datetime.now()
        self.diagnostico_alta = diagnostico_alta
        self.tipo_alta = tipo_alta
        if observaciones:
            base = self.observaciones or ""
            self.observaciones = f"{base}\n[ALTA] {observaciones}"

    def reasignar_habitacion(self, nueva_habitacion_id: int) -> None:
        if self.estado != EstadoAdmision.ACTIVA.value:
            raise ValueError("Solo admisiones activas pueden reasignar habitación")
        self.habitacion_id = nueva_habitacion_id
