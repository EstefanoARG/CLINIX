from __future__ import annotations

from enum import Enum


class EstadoCita(str, Enum):
    PROGRAMADA = "Programada"
    CONFIRMADA = "Confirmada"
    EN_CURSO = "En curso"
    COMPLETADA = "Completada"
    CANCELADA = "Cancelada"
    NO_ASISTIO = "No asistió"

    def puede_transicionar_a(self, nuevo: EstadoCita) -> bool:
        return nuevo in _CITA_TRANS.get(self, set())


class EstadoReserva(str, Enum):
    PENDIENTE = "Pendiente"
    CONFIRMADA = "Confirmada"
    RECHAZADA = "Rechazada"
    CONVERTIDA = "Convertida"
    CANCELADA = "Cancelada"

    def puede_transicionar_a(self, nuevo: EstadoReserva) -> bool:
        return nuevo in _RESERVA_TRANS.get(self, set())


class EstadoAdmision(str, Enum):
    ACTIVA = "Activa"
    ALTA = "Alta"
    TRASLADADO = "Trasladado"

    def puede_transicionar_a(self, nuevo: EstadoAdmision) -> bool:
        return nuevo in _ADMISION_TRANS.get(self, set())


class EstadoHabitacion(str, Enum):
    DISPONIBLE = "Disponible"
    OCUPADA = "Ocupada"
    MANTENIMIENTO = "Mantenimiento"
    RESERVADA = "Reservada"

    def puede_transicionar_a(self, nuevo: EstadoHabitacion) -> bool:
        return nuevo in _HABITACION_TRANS.get(self, set())


_CITA_TRANS: dict[EstadoCita, set[EstadoCita]] = {
    EstadoCita.PROGRAMADA: {EstadoCita.CONFIRMADA, EstadoCita.COMPLETADA, EstadoCita.CANCELADA},
    EstadoCita.CONFIRMADA: {EstadoCita.EN_CURSO, EstadoCita.COMPLETADA, EstadoCita.CANCELADA, EstadoCita.NO_ASISTIO},
    EstadoCita.EN_CURSO: {EstadoCita.COMPLETADA, EstadoCita.CANCELADA},
    EstadoCita.COMPLETADA: set(),
    EstadoCita.CANCELADA: set(),
    EstadoCita.NO_ASISTIO: set(),
}

_RESERVA_TRANS: dict[EstadoReserva, set[EstadoReserva]] = {
    EstadoReserva.PENDIENTE: {EstadoReserva.CONFIRMADA, EstadoReserva.RECHAZADA, EstadoReserva.CONVERTIDA, EstadoReserva.CANCELADA},
    EstadoReserva.CONFIRMADA: {EstadoReserva.CONVERTIDA, EstadoReserva.CANCELADA},
    EstadoReserva.RECHAZADA: set(),
    EstadoReserva.CONVERTIDA: set(),
    EstadoReserva.CANCELADA: set(),
}

_ADMISION_TRANS: dict[EstadoAdmision, set[EstadoAdmision]] = {
    EstadoAdmision.ACTIVA: {EstadoAdmision.ALTA, EstadoAdmision.TRASLADADO},
    EstadoAdmision.ALTA: set(),
    EstadoAdmision.TRASLADADO: set(),
}

_HABITACION_TRANS: dict[EstadoHabitacion, set[EstadoHabitacion]] = {
    EstadoHabitacion.DISPONIBLE: {EstadoHabitacion.OCUPADA, EstadoHabitacion.RESERVADA, EstadoHabitacion.MANTENIMIENTO},
    EstadoHabitacion.OCUPADA: {EstadoHabitacion.DISPONIBLE},
    EstadoHabitacion.MANTENIMIENTO: {EstadoHabitacion.DISPONIBLE},
    EstadoHabitacion.RESERVADA: {EstadoHabitacion.OCUPADA, EstadoHabitacion.DISPONIBLE},
}
