from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import date, datetime
from typing import Optional

from domain.entities.paciente import Paciente
from domain.entities.reserva import ReservaWeb
from domain.entities.cita import Cita
from domain.entities.admision import Admision
from domain.entities.habitacion import Habitacion


class PacienteRepository(ABC):
    @abstractmethod
    def get_by_id(self, paciente_id: int) -> Optional[Paciente]: ...

    @abstractmethod
    def get_by_dni(self, clinical_id: int, dni: str) -> Optional[Paciente]: ...

    @abstractmethod
    def get_by_email(self, email: str) -> Optional[Paciente]: ...

    @abstractmethod
    def search(self, q: str, skip: int, limit: int) -> tuple[list[Paciente], int]: ...

    @abstractmethod
    def list(self, skip: int, limit: int, activo: Optional[bool]) -> tuple[list[Paciente], int]: ...

    @abstractmethod
    def save(self, paciente: Paciente) -> Paciente: ...

    @abstractmethod
    def count_activos(self) -> int: ...

    @abstractmethod
    def count_registrados_hoy(self) -> int: ...


class ReservaRepository(ABC):
    @abstractmethod
    def get_by_id(self, reserva_id: int) -> Optional[ReservaWeb]: ...

    @abstractmethod
    def list(
        self, skip: int, limit: int, estado: Optional[str]
    ) -> tuple[list[ReservaWeb], int]: ...

    @abstractmethod
    def list_by_paciente(self, paciente_id: int) -> list[ReservaWeb]: ...

    @abstractmethod
    def save(self, reserva: ReservaWeb) -> ReservaWeb: ...

    @abstractmethod
    def count_pendientes(self) -> int: ...


class CitaRepository(ABC):
    @abstractmethod
    def get_by_id(self, cita_id: int) -> Optional[Cita]: ...

    @abstractmethod
    def list(
        self,
        skip: int,
        limit: int,
        estado: Optional[str],
        medico_id: Optional[int],
        paciente_id: Optional[int],
        fecha_desde: Optional[date],
        fecha_hasta: Optional[date],
    ) -> tuple[list[Cita], int]: ...

    @abstractmethod
    def find_conflicts(
        self, medico_id: int, fecha_hora: datetime, duracion_minutos: int, exclude_id: Optional[int]
    ) -> list[Cita]: ...

    @abstractmethod
    def find_by_medico_fecha(
        self, medico_id: int, fecha: date
    ) -> list[Cita]: ...

    @abstractmethod
    def save(self, cita: Cita) -> Cita: ...

    @abstractmethod
    def count_hoy(self) -> int: ...


class HabitacionRepository(ABC):
    @abstractmethod
    def get_by_id(self, habitacion_id: int) -> Optional[Habitacion]: ...

    @abstractmethod
    def list(
        self,
        departamento_id: Optional[int],
        estado: Optional[str],
        tipo: Optional[str],
    ) -> list[Habitacion]: ...

    @abstractmethod
    def find_by_depto_numero(self, departamento_id: int, numero: str) -> Optional[Habitacion]: ...

    @abstractmethod
    def save(self, habitacion: Habitacion) -> Habitacion: ...

    @abstractmethod
    def count_all(self) -> int: ...

    @abstractmethod
    def count_by_estado(self, estado: str) -> int: ...


class AdmisionRepository(ABC):
    @abstractmethod
    def get_by_id(self, admision_id: int) -> Optional[Admision]: ...

    @abstractmethod
    def list(
        self,
        skip: int,
        limit: int,
        estado: Optional[str],
        paciente_id: Optional[int],
    ) -> tuple[list[Admision], int]: ...

    @abstractmethod
    def list_by_enfermero(self, enfermero_id: int) -> list[Admision]: ...

    @abstractmethod
    def list_recent(self, limit: int) -> list[Admision]: ...

    @abstractmethod
    def list_recent_alta(self, limit: int) -> list[Admision]: ...

    @abstractmethod
    def save(self, admision: Admision) -> Admision: ...

    @abstractmethod
    def count_activas(self) -> int: ...
