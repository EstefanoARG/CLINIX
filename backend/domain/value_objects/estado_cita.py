from __future__ import annotations

from enum import Enum


class EstadoCita(str, Enum):
    PROGRAMADA = "Programada"
    CONFIRMADA = "Confirmada"
    EN_CURSO = "En curso"
    COMPLETADA = "Completada"
    CANCELADA = "Cancelada"
    NO_ASISTIO = "No asistió"

    _transiciones: dict[EstadoCita, set[EstadoCita]] = {
        PROGRAMADA: {CONFIRMADA, CANCELADA},
        CONFIRMADA: {EN_CURSO, CANCELADA, NO_ASISTIO},
        EN_CURSO: {COMPLETADA, CANCELADA},
        COMPLETADA: set(),
        CANCELADA: set(),
        NO_ASISTIO: set(),
    }

    def puede_transicionar_a(self, nuevo: EstadoCita) -> bool:
        return nuevo in self._transiciones.get(self, set())


class EstadoReserva(str, Enum):
    PENDIENTE = "Pendiente"
    CONFIRMADA = "Confirmada"
    RECHAZADA = "Rechazada"
    CONVERTIDA = "Convertida"
    CANCELADA = "Cancelada"

    _transiciones: dict[EstadoReserva, set[EstadoReserva]] = {
        PENDIENTE: {CONFIRMADA, RECHAZADA, CONVERTIDA, CANCELADA},
        CONFIRMADA: {CONVERTIDA, CANCELADA},
        RECHAZADA: set(),
        CONVERTIDA: set(),
        CANCELADA: set(),
    }

    def puede_transicionar_a(self, nuevo: EstadoReserva) -> bool:
        return nuevo in self._transiciones.get(self, set())


class EstadoAdmision(str, Enum):
    ACTIVA = "Activa"
    ALTA = "Alta"
    TRASLADADO = "Trasladado"

    _transiciones: dict[EstadoAdmision, set[EstadoAdmision]] = {
        ACTIVA: {ALTA, TRASLADADO},
        ALTA: set(),
        TRASLADADO: set(),
    }

    def puede_transicionar_a(self, nuevo: EstadoAdmision) -> bool:
        return nuevo in self._transiciones.get(self, set())


class EstadoHabitacion(str, Enum):
    DISPONIBLE = "Disponible"
    OCUPADA = "Ocupada"
    MANTENIMIENTO = "Mantenimiento"
    RESERVADA = "Reservada"

    _transiciones: dict[EstadoHabitacion, set[EstadoHabitacion]] = {
        DISPONIBLE: {OCUPADA, RESERVADA, MANTENIMIENTO},
        OCUPADA: {DISPONIBLE},
        MANTENIMIENTO: {DISPONIBLE},
        RESERVADA: {OCUPADA, DISPONIBLE},
    }

    def puede_transicionar_a(self, nuevo: EstadoHabitacion) -> bool:
        return nuevo in self._transiciones.get(self, set())
