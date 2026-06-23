from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime
from typing import Optional

from domain.value_objects.estado_cita import EstadoReserva


@dataclass
class ReservaWeb:
    reserva_id: Optional[int]
    paciente_id: Optional[int]
    nombre_solicitante: str
    dni_solicitante: str
    email_solicitante: str
    telefono_solicitante: Optional[str]
    especialidad_id: int
    medico_id: Optional[int]
    fecha_hora_deseada: datetime
    motivo_consulta: Optional[str]
    direccion_solicitante: Optional[str] = None
    fecha_nacimiento_solicitante: Optional[date] = None
    genero_solicitante: Optional[str] = None
    estado: str = EstadoReserva.PENDIENTE.value
    acepta_terminos: bool = False
    fecha_solicitud: Optional[datetime] = None
    fecha_respuesta: Optional[datetime] = None
    observacion_admin: Optional[str] = None
    cita_id: Optional[int] = None

    def validar_terminos(self) -> None:
        if not self.acepta_terminos:
            raise ValueError("Debe aceptar los términos y condiciones")

    def cambiar_estado(self, nuevo_estado: str) -> None:
        actual = EstadoReserva(self.estado)
        nuevo = EstadoReserva(nuevo_estado)
        if not actual.puede_transicionar_a(nuevo):
            raise ValueError(
                f"No se puede cambiar de {self.estado} a {nuevo_estado}"
            )
        self.estado = nuevo_estado
        self.fecha_respuesta = datetime.now()

    def convertir_a_cita(self) -> None:
        if self.estado != EstadoReserva.PENDIENTE.value:
            raise ValueError("Solo reservas pendientes pueden ser convertidas")
        if not self.medico_id:
            raise ValueError("La reserva debe tener un médico asignado")
        self.cambiar_estado(EstadoReserva.CONVERTIDA.value)
