from __future__ import annotations

from sqlalchemy.orm import Session, joinedload

from app.core.audit import registrar_auditoria
from app.core.exceptions import NotFoundError, ConflictError
from app.core.security import hash_password
from app.models import (
    Especialidad, Departamento, UbicacionFisica,
    Medico, Enfermero, HorarioMedico, Usuario, Role,
)
from app.modules.personal.schemas import (
    EspecialidadCreate, EspecialidadUpdate,
    DepartamentoCreate, DepartamentoUpdate,
    UbicacionFisicaCreate, UbicacionFisicaUpdate,
    MedicoCreate, MedicoUpdate,
    EnfermeroCreate, EnfermeroUpdate,
    HorarioMedicoCreate, HorarioMedicoUpdate,
)
from infrastructure.uow import UnitOfWork


def _ensure_role(db: Session, nombre: str) -> Role:
    role = db.query(Role).filter(Role.NombreRole == nombre).first()
    if not role:
        role = Role(NombreRole=nombre)
        db.add(role)
        db.flush()
    return role


def _especialidad_to_dict(e: Especialidad) -> dict:
    return {
        "especialidad_id": e.EspecialidadID,
        "nombre_especialidad": e.NombreEspecialidad,
        "descripcion": e.Descripcion,
    }


def _departamento_to_dict(d: Departamento) -> dict:
    return {
        "departamento_id": d.DepartamentoID,
        "clinical_id": d.ClinicalID,
        "nombre": d.Nombre,
        "descripcion": d.Descripcion,
        "activo": d.Activo,
    }


def _ubicacion_to_dict(u: UbicacionFisica) -> dict:
    return {
        "ubicacion_id": u.UbicacionID,
        "departamento_id": u.DepartamentoID,
        "nombre": u.Nombre,
        "tipo": u.Tipo,
        "piso": u.Piso,
        "activo": u.Activo,
    }


def _medico_to_dict(m: Medico) -> dict:
    return {
        "medico_id": m.MedicoID,
        "usuario_id": m.UsuarioID,
        "especialidad_id": m.EspecialidadID,
        "departamento_id": m.DepartamentoID,
        "numero_colegiatura": m.NumeroColegiatura,
        "activo": m.Activo,
        "nombre": m.usuario.Nombre if m.usuario else None,
        "apellido": m.usuario.Apellido if m.usuario else None,
        "email": m.usuario.Email if m.usuario else None,
        "telefono": m.usuario.Telefono if m.usuario else None,
        "especialidad": m.especialidad.NombreEspecialidad if m.especialidad else None,
        "departamento": m.departamento.Nombre if m.departamento else None,
    }


def _enfermero_to_dict(e: Enfermero) -> dict:
    return {
        "enfermero_id": e.EnfermeroID,
        "usuario_id": e.UsuarioID,
        "departamento_id": e.DepartamentoID,
        "numero_licencia": e.NumeroLicencia,
        "turno": e.Turno,
        "activo": e.Activo,
        "nombre": e.usuario.Nombre if e.usuario else None,
        "apellido": e.usuario.Apellido if e.usuario else None,
        "email": e.usuario.Email if e.usuario else None,
    }


def _horario_to_dict(h: HorarioMedico) -> dict:
    return {
        "horario_id": h.HorarioID,
        "medico_id": h.MedicoID,
        "dia_semana": h.DiaSemana,
        "hora_inicio": h.HoraInicio,
        "hora_fin": h.HoraFin,
        "intervalo_citas": h.IntervaloCitas,
        "activo": h.Activo,
    }


class EspecialidadService:
    def __init__(self, db: Session, uow: UnitOfWork | None = None):
        self.db = db
        self.uow = uow or UnitOfWork(db)

    def list(self) -> list[dict]:
        return [_especialidad_to_dict(e) for e in self.db.query(Especialidad).order_by(Especialidad.NombreEspecialidad).all()]

    def get(self, especialidad_id: int) -> dict:
        item = self.db.query(Especialidad).filter(Especialidad.EspecialidadID == especialidad_id).first()
        if not item:
            raise NotFoundError("Especialidad not found")
        return _especialidad_to_dict(item)

    def create(self, data: EspecialidadCreate) -> dict:
        existing = self.db.query(Especialidad).filter(Especialidad.NombreEspecialidad == data.nombre_especialidad).first()
        if existing:
            raise ConflictError("Especialidad already exists")
        item = Especialidad(NombreEspecialidad=data.nombre_especialidad, Descripcion=data.descripcion)
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return _especialidad_to_dict(item)

    def update(self, especialidad_id: int, data: EspecialidadUpdate) -> dict:
        item = self.db.query(Especialidad).filter(Especialidad.EspecialidadID == especialidad_id).first()
        if not item:
            raise NotFoundError("Especialidad not found")
        if data.nombre_especialidad is not None:
            item.NombreEspecialidad = data.nombre_especialidad
        if data.descripcion is not None:
            item.Descripcion = data.descripcion
        self.db.commit()
        self.db.refresh(item)
        return _especialidad_to_dict(item)

    def delete(self, especialidad_id: int) -> None:
        item = self.db.query(Especialidad).filter(Especialidad.EspecialidadID == especialidad_id).first()
        if not item:
            raise NotFoundError("Especialidad not found")
        self.db.delete(item)
        self.db.commit()


class DepartamentoService:
    def __init__(self, db: Session, uow: UnitOfWork | None = None):
        self.db = db
        self.uow = uow or UnitOfWork(db)

    def list(self, activo: bool | None = None) -> list[dict]:
        query = self.db.query(Departamento)
        if activo is not None:
            query = query.filter(Departamento.Activo == activo)
        return [_departamento_to_dict(d) for d in query.order_by(Departamento.Nombre).all()]

    def get(self, departamento_id: int) -> dict:
        item = self.db.query(Departamento).filter(Departamento.DepartamentoID == departamento_id).first()
        if not item:
            raise NotFoundError("Departamento not found")
        return _departamento_to_dict(item)

    def create(self, data: DepartamentoCreate) -> dict:
        item = Departamento(
            ClinicalID=data.clinical_id,
            Nombre=data.nombre,
            Descripcion=data.descripcion,
        )
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return _departamento_to_dict(item)

    def update(self, departamento_id: int, data: DepartamentoUpdate) -> dict:
        item = self.db.query(Departamento).filter(Departamento.DepartamentoID == departamento_id).first()
        if not item:
            raise NotFoundError("Departamento not found")
        if data.nombre is not None:
            item.Nombre = data.nombre
        if data.descripcion is not None:
            item.Descripcion = data.descripcion
        if data.activo is not None:
            item.Activo = data.activo
        self.db.commit()
        self.db.refresh(item)
        return _departamento_to_dict(item)

    def delete(self, departamento_id: int) -> None:
        item = self.db.query(Departamento).filter(Departamento.DepartamentoID == departamento_id).first()
        if not item:
            raise NotFoundError("Departamento not found")
        item.Activo = False
        self.db.commit()


class UbicacionService:
    def __init__(self, db: Session, uow: UnitOfWork | None = None):
        self.db = db
        self.uow = uow or UnitOfWork(db)

    def list(self, departamento_id: int | None = None) -> list[dict]:
        query = self.db.query(UbicacionFisica)
        if departamento_id is not None:
            query = query.filter(UbicacionFisica.DepartamentoID == departamento_id)
        return [_ubicacion_to_dict(u) for u in query.order_by(UbicacionFisica.Nombre).all()]

    def get(self, ubicacion_id: int) -> dict:
        item = self.db.query(UbicacionFisica).filter(UbicacionFisica.UbicacionID == ubicacion_id).first()
        if not item:
            raise NotFoundError("Ubicacion not found")
        return _ubicacion_to_dict(item)

    def create(self, data: UbicacionFisicaCreate) -> dict:
        item = UbicacionFisica(
            DepartamentoID=data.departamento_id,
            Nombre=data.nombre,
            Tipo=data.tipo,
            Piso=data.piso,
        )
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return _ubicacion_to_dict(item)

    def update(self, ubicacion_id: int, data: UbicacionFisicaUpdate) -> dict:
        item = self.db.query(UbicacionFisica).filter(UbicacionFisica.UbicacionID == ubicacion_id).first()
        if not item:
            raise NotFoundError("Ubicacion not found")
        if data.nombre is not None:
            item.Nombre = data.nombre
        if data.tipo is not None:
            item.Tipo = data.tipo
        if data.piso is not None:
            item.Piso = data.piso
        if data.activo is not None:
            item.Activo = data.activo
        self.db.commit()
        self.db.refresh(item)
        return _ubicacion_to_dict(item)

    def delete(self, ubicacion_id: int) -> None:
        item = self.db.query(UbicacionFisica).filter(UbicacionFisica.UbicacionID == ubicacion_id).first()
        if not item:
            raise NotFoundError("Ubicacion not found")
        item.Activo = False
        self.db.commit()


class MedicoService:
    def __init__(self, db: Session, uow: UnitOfWork | None = None):
        self.db = db
        self.uow = uow or UnitOfWork(db)

    def _query_with_joins(self):
        return self.db.query(Medico).options(
            joinedload(Medico.usuario), joinedload(Medico.especialidad), joinedload(Medico.departamento)
        )

    def list(self, skip: int = 0, limit: int = 100, activo: bool | None = None, especialidad_id: int | None = None) -> dict:
        query = self._query_with_joins()
        if activo is not None:
            query = query.filter(Medico.Activo == activo)
        if especialidad_id is not None:
            query = query.filter(Medico.EspecialidadID == especialidad_id)
        total = query.count()
        items = [item for item in query.order_by(Medico.MedicoID).offset(skip).limit(limit).all()]
        return {"items": [_medico_to_dict(m) for m in items], "total": total}

    def search(self, q: str, skip: int = 0, limit: int = 100) -> dict:
        pattern = f"%{q}%"
        query = self._query_with_joins().join(Usuario).filter(
            Usuario.Nombre.ilike(pattern)
            | Usuario.Apellido.ilike(pattern)
            | Usuario.DNI.ilike(pattern)
            | Medico.NumeroColegiatura.ilike(pattern)
        )
        total = query.count()
        items = query.offset(skip).limit(limit).all()
        return {"items": [_medico_to_dict(m) for m in items], "total": total}

    def get(self, medico_id: int) -> dict:
        item = self._query_with_joins().options(
            joinedload(Medico.horarios),
        ).filter(Medico.MedicoID == medico_id).first()
        if not item:
            raise NotFoundError("Medico not found")
        return _medico_to_dict(item)

    def create(self, data: MedicoCreate) -> dict:
        role = _ensure_role(self.db, "Médico")
        usuario = Usuario(
            ClinicalID=data.clinical_id,
            RoleID=role.RoleID,
            UbicacionID=data.ubicacion_id,
            Nombre=data.nombre,
            Apellido=data.apellido,
            DNI=data.dni,
            Email=data.email,
            Telefono=data.telefono,
            PasswordHash=hash_password(data.password),
        )
        self.db.add(usuario)
        self.db.flush()

        medico = Medico(
            UsuarioID=usuario.UsuarioID,
            EspecialidadID=data.especialidad_id,
            DepartamentoID=data.departamento_id,
            NumeroColegiatura=data.numero_colegiatura,
        )
        self.db.add(medico)
        self.db.commit()
        self.db.refresh(medico)
        registrar_auditoria(self.db, None, "CREAR_MEDICO",
                            f"Médico creado: {data.nombre} {data.apellido}",
                            "MEDICO", medico.MedicoID)
        return _medico_to_dict(self._query_with_joins().filter(Medico.MedicoID == medico.MedicoID).first())

    def update(self, medico_id: int, data: MedicoUpdate) -> dict:
        item = self.db.query(Medico).filter(Medico.MedicoID == medico_id).first()
        if not item:
            raise NotFoundError("Medico not found")
        if data.departamento_id is not None:
            item.DepartamentoID = data.departamento_id
        if data.especialidad_id is not None:
            item.EspecialidadID = data.especialidad_id
        if data.numero_colegiatura is not None:
            item.NumeroColegiatura = data.numero_colegiatura
        if data.activo is not None:
            item.Activo = data.activo
        self.db.commit()
        registrar_auditoria(self.db, None, "ACTUALIZAR_MEDICO",
                            f"Médico {medico_id} actualizado",
                            "MEDICO", medico_id)
        return _medico_to_dict(self._query_with_joins().filter(Medico.MedicoID == medico_id).first())

    def delete(self, medico_id: int) -> None:
        item = self.db.query(Medico).filter(Medico.MedicoID == medico_id).first()
        if not item:
            raise NotFoundError("Medico not found")
        item.Activo = False
        item.usuario.Activo = False
        self.db.commit()
        registrar_auditoria(self.db, None, "DESACTIVAR_MEDICO",
                            f"Médico {medico_id} desactivado",
                            "MEDICO", medico_id)


class EnfermeroService:
    def __init__(self, db: Session, uow: UnitOfWork | None = None):
        self.db = db
        self.uow = uow or UnitOfWork(db)

    def _query_with_joins(self):
        return self.db.query(Enfermero).options(
            joinedload(Enfermero.usuario), joinedload(Enfermero.departamento)
        )

    def list(self, skip: int = 0, limit: int = 100, activo: bool | None = None) -> dict:
        query = self._query_with_joins()
        if activo is not None:
            query = query.filter(Enfermero.Activo == activo)
        total = query.count()
        items = query.offset(skip).limit(limit).all()
        return {"items": [_enfermero_to_dict(e) for e in items], "total": total}

    def search(self, q: str, skip: int = 0, limit: int = 100) -> dict:
        pattern = f"%{q}%"
        query = self._query_with_joins().join(Usuario).filter(
            Usuario.Nombre.ilike(pattern)
            | Usuario.Apellido.ilike(pattern)
            | Usuario.DNI.ilike(pattern)
            | Enfermero.NumeroLicencia.ilike(pattern)
        )
        total = query.count()
        items = query.offset(skip).limit(limit).all()
        return {"items": [_enfermero_to_dict(e) for e in items], "total": total}

    def get(self, enfermero_id: int) -> dict:
        item = self._query_with_joins().filter(Enfermero.EnfermeroID == enfermero_id).first()
        if not item:
            raise NotFoundError("Enfermero not found")
        return _enfermero_to_dict(item)

    def create(self, data: EnfermeroCreate) -> dict:
        role = _ensure_role(self.db, "Enfermero")
        usuario = Usuario(
            ClinicalID=data.clinical_id,
            RoleID=role.RoleID,
            UbicacionID=data.ubicacion_id,
            Nombre=data.nombre,
            Apellido=data.apellido,
            DNI=data.dni,
            Email=data.email,
            Telefono=data.telefono,
            PasswordHash=hash_password(data.password),
        )
        self.db.add(usuario)
        self.db.flush()

        enfermero = Enfermero(
            UsuarioID=usuario.UsuarioID,
            DepartamentoID=data.departamento_id,
            NumeroLicencia=data.numero_licencia,
            Turno=data.turno,
        )
        self.db.add(enfermero)
        self.db.commit()
        self.db.refresh(enfermero)
        registrar_auditoria(self.db, None, "CREAR_ENFERMERO",
                            f"Enfermero creado: {data.nombre} {data.apellido}",
                            "ENFERMERO", enfermero.EnfermeroID)
        return _enfermero_to_dict(self._query_with_joins().filter(Enfermero.EnfermeroID == enfermero.EnfermeroID).first())

    def update(self, enfermero_id: int, data: EnfermeroUpdate) -> dict:
        item = self.db.query(Enfermero).filter(Enfermero.EnfermeroID == enfermero_id).first()
        if not item:
            raise NotFoundError("Enfermero not found")
        if data.departamento_id is not None:
            item.DepartamentoID = data.departamento_id
        if data.numero_licencia is not None:
            item.NumeroLicencia = data.numero_licencia
        if data.turno is not None:
            item.Turno = data.turno
        if data.activo is not None:
            item.Activo = data.activo
        self.db.commit()
        registrar_auditoria(self.db, None, "ACTUALIZAR_ENFERMERO",
                            f"Enfermero {enfermero_id} actualizado",
                            "ENFERMERO", enfermero_id)
        return _enfermero_to_dict(self._query_with_joins().filter(Enfermero.EnfermeroID == enfermero_id).first())

    def delete(self, enfermero_id: int) -> None:
        item = self.db.query(Enfermero).filter(Enfermero.EnfermeroID == enfermero_id).first()
        if not item:
            raise NotFoundError("Enfermero not found")
        item.Activo = False
        item.usuario.Activo = False
        self.db.commit()
        registrar_auditoria(self.db, None, "DESACTIVAR_ENFERMERO",
                            f"Enfermero {enfermero_id} desactivado",
                            "ENFERMERO", enfermero_id)


class HorarioMedicoService:
    def __init__(self, db: Session, uow: UnitOfWork | None = None):
        self.db = db
        self.uow = uow or UnitOfWork(db)

    def list(self, medico_id: int) -> list[dict]:
        items = self.db.query(HorarioMedico).filter(
            HorarioMedico.MedicoID == medico_id
        ).order_by(HorarioMedico.DiaSemana, HorarioMedico.HoraInicio).all()
        return [_horario_to_dict(h) for h in items]

    def get(self, horario_id: int) -> dict:
        item = self.db.query(HorarioMedico).filter(HorarioMedico.HorarioID == horario_id).first()
        if not item:
            raise NotFoundError("Horario not found")
        return _horario_to_dict(item)

    def create(self, data: HorarioMedicoCreate) -> dict:
        item = HorarioMedico(
            MedicoID=data.medico_id,
            DiaSemana=data.dia_semana,
            HoraInicio=data.hora_inicio,
            HoraFin=data.hora_fin,
            IntervaloCitas=data.intervalo_citas,
        )
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return _horario_to_dict(item)

    def update(self, horario_id: int, data: HorarioMedicoUpdate) -> dict:
        item = self.db.query(HorarioMedico).filter(HorarioMedico.HorarioID == horario_id).first()
        if not item:
            raise NotFoundError("Horario not found")
        if data.dia_semana is not None:
            item.DiaSemana = data.dia_semana
        if data.hora_inicio is not None:
            item.HoraInicio = data.hora_inicio
        if data.hora_fin is not None:
            item.HoraFin = data.hora_fin
        if data.intervalo_citas is not None:
            item.IntervaloCitas = data.intervalo_citas
        if data.activo is not None:
            item.Activo = data.activo
        self.db.commit()
        self.db.refresh(item)
        return _horario_to_dict(item)

    def delete(self, horario_id: int) -> None:
        item = self.db.query(HorarioMedico).filter(HorarioMedico.HorarioID == horario_id).first()
        if not item:
            raise NotFoundError("Horario not found")
        self.db.delete(item)
        self.db.commit()
