from __future__ import annotations

from sqlalchemy.orm import Session

from domain.repositories import (
    PacienteRepository,
    ReservaRepository,
    CitaRepository,
    HabitacionRepository,
    AdmisionRepository,
)


class UnitOfWork:
    def __init__(self, session: Session):
        self.session = session
        self._paciente_repo: PacienteRepository | None = None
        self._reserva_repo: ReservaRepository | None = None
        self._cita_repo: CitaRepository | None = None
        self._habitacion_repo: HabitacionRepository | None = None
        self._admision_repo: AdmisionRepository | None = None

    def __enter__(self) -> UnitOfWork:
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        if exc_type is None:
            self.session.commit()
        else:
            self.session.rollback()

    @property
    def pacientes(self) -> PacienteRepository:
        if self._paciente_repo is None:
            from infrastructure.repositories.paciente_repo import SQLAlchemyPacienteRepository
            self._paciente_repo = SQLAlchemyPacienteRepository(self.session)
        return self._paciente_repo

    @property
    def reservas(self) -> ReservaRepository:
        if self._reserva_repo is None:
            from infrastructure.repositories.reserva_repo import SQLAlchemyReservaRepository
            self._reserva_repo = SQLAlchemyReservaRepository(self.session)
        return self._reserva_repo

    @property
    def citas(self) -> CitaRepository:
        if self._cita_repo is None:
            from infrastructure.repositories.cita_repo import SQLAlchemyCitaRepository
            self._cita_repo = SQLAlchemyCitaRepository(self.session)
        return self._cita_repo

    @property
    def habitaciones(self) -> HabitacionRepository:
        if self._habitacion_repo is None:
            from infrastructure.repositories.habitacion_repo import SQLAlchemyHabitacionRepository
            self._habitacion_repo = SQLAlchemyHabitacionRepository(self.session)
        return self._habitacion_repo

    @property
    def admisiones(self) -> AdmisionRepository:
        if self._admision_repo is None:
            from infrastructure.repositories.admision_repo import SQLAlchemyAdmisionRepository
            self._admision_repo = SQLAlchemyAdmisionRepository(self.session)
        return self._admision_repo
