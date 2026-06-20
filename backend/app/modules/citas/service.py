from __future__ import annotations

from datetime import datetime, date, time, timedelta
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func as sa_func

from app.core.audit import registrar_auditoria
from app.core.email_sender import send_appointment_confirmation
from app.core.exceptions import NotFoundError, ConflictError
from app.core.events import ReservaCreada, CitaConfirmada, publish
from app.core.cache import cache
from app.models import (
    ReservaWeb, Cita, HorarioMedico, Medico, Paciente,
)
from app.modules.citas.schemas import (
    ReservaWebCreate, ReservaWebUpdate,
    CitaCreate, CitaUpdate,
)
from domain.entities.reserva import ReservaWeb as ReservaWebDomain
from domain.entities.cita import Cita as CitaDomain
from domain.repositories import ReservaRepository, CitaRepository, PacienteRepository
from infrastructure.uow import UnitOfWork
from infrastructure.mappers.reserva_mapper import ReservaMapper
from infrastructure.mappers.cita_mapper import CitaMapper


def _reserva_to_dict(r: ReservaWeb) -> dict:
    d = {
        "reserva_id": r.ReservaID,
        "paciente_id": r.PacienteID,
        "cita_id": r.CitaID,
        "nombre_solicitante": r.NombreSolicitante,
        "dni_solicitante": r.DNISolicitante,
        "email_solicitante": r.EmailSolicitante,
        "telefono_solicitante": r.TelefonoSolicitante,
        "direccion_solicitante": r.DireccionSolicitante,
        "fecha_nacimiento_solicitante": r.FechaNacimientoSolicitante,
        "genero_solicitante": r.GeneroSolicitante,
        "especialidad_id": r.EspecialidadID,
        "medico_id": r.MedicoID,
        "fecha_hora_deseada": r.FechaHoraDeseada,
        "motivo_consulta": r.MotivoConsulta,
        "estado": r.Estado,
        "acepta_terminos": r.AceptaTerminos,
        "fecha_solicitud": r.FechaSolicitud,
        "fecha_respuesta": r.FechaRespuesta,
        "observacion_admin": r.ObservacionAdmin,
    }
    if r.especialidad is not None:
        d["especialidad_nombre"] = r.especialidad.NombreEspecialidad
    if r.medico is not None and r.medico.usuario is not None:
        d["medico_nombre"] = f"{r.medico.usuario.Nombre} {r.medico.usuario.Apellido}"
    if r.paciente is not None:
        d["paciente_nombre"] = f"{r.paciente.Nombre} {r.paciente.Apellido}"
    return d


def _cita_to_dict(c: Cita) -> dict:
    d = {
        "cita_id": c.CitaID,
        "paciente_id": c.PacienteID,
        "medico_id": c.MedicoID,
        "especialidad_id": c.EspecialidadID,
        "ubicacion_id": c.UbicacionID,
        "reserva_id": c.ReservaID,
        "fecha_hora": c.FechaHora,
        "duracion_minutos": c.DuracionMinutos,
        "estado_cita": c.EstadoCita,
        "motivo_consulta": c.MotivoConsulta,
        "observaciones": c.Observaciones,
        "fecha_creacion": c.FechaCreacion,
    }
    if c.paciente is not None:
        d["paciente_nombre"] = f"{c.paciente.Nombre} {c.paciente.Apellido}"
    if c.medico is not None and c.medico.usuario is not None:
        d["medico_nombre"] = f"{c.medico.usuario.Nombre} {c.medico.usuario.Apellido}"
    if c.especialidad is not None:
        d["especialidad_nombre"] = c.especialidad.NombreEspecialidad
    return d


class ReservaService:
    def __init__(self, db: Session, uow: UnitOfWork | None = None):
        self.db = db
        self.uow = uow or UnitOfWork(db)

    def _get_reserva_orm(self, reserva_id: int) -> ReservaWeb:
        item = self.db.query(ReservaWeb).options(
            joinedload(ReservaWeb.especialidad),
            joinedload(ReservaWeb.medico).joinedload(Medico.usuario),
            joinedload(ReservaWeb.paciente),
        ).filter(ReservaWeb.ReservaID == reserva_id).first()
        if not item:
            raise NotFoundError("Reserva not found")
        return item

    def list_by_paciente(self, paciente_id: int) -> list[dict]:
        items = self.db.query(ReservaWeb).options(
            joinedload(ReservaWeb.especialidad),
            joinedload(ReservaWeb.medico).joinedload(Medico.usuario),
        ).filter(ReservaWeb.PacienteID == paciente_id).order_by(
            ReservaWeb.FechaSolicitud.desc()
        ).all()
        return [_reserva_to_dict(r) for r in items]

    def list(self, skip: int = 0, limit: int = 100, estado: str | None = None) -> dict:
        query = self.db.query(ReservaWeb).options(
            joinedload(ReservaWeb.especialidad),
            joinedload(ReservaWeb.medico).joinedload(Medico.usuario),
            joinedload(ReservaWeb.paciente),
        )
        if estado:
            query = query.filter(ReservaWeb.Estado == estado)
        total = query.count()
        items = query.order_by(ReservaWeb.FechaSolicitud.desc()).offset(skip).limit(limit).all()
        return {"items": [_reserva_to_dict(r) for r in items], "total": total}

    def get(self, reserva_id: int) -> dict:
        return _reserva_to_dict(self._get_reserva_orm(reserva_id))

    def create(self, data: ReservaWebCreate) -> dict:
        nombre_completo = data.nombre_solicitante
        if data.apellidos_solicitante:
            nombre_completo = f"{data.nombre_solicitante} {data.apellidos_solicitante}"

        domain = ReservaWebDomain(
            reserva_id=None,
            paciente_id=data.paciente_id,
            nombre_solicitante=nombre_completo,
            dni_solicitante=data.dni_solicitante,
            email_solicitante=data.email_solicitante,
            telefono_solicitante=data.telefono_solicitante,
            direccion_solicitante=data.direccion_solicitante,
            fecha_nacimiento_solicitante=data.fecha_nacimiento_solicitante,
            genero_solicitante=data.genero_solicitante,
            especialidad_id=data.especialidad_id,
            medico_id=data.medico_id,
            fecha_hora_deseada=data.fecha_hora_deseada,
            motivo_consulta=data.motivo_consulta,
            acepta_terminos=data.acepta_terminos,
        )
        domain.validar_terminos()
        saved = self.uow.reservas.save(domain)
        self.uow.session.commit()
        try:
            registrar_auditoria(self.db, None, "CREAR_RESERVA",
                                f"Reserva web creada para {saved.nombre_solicitante}",
                                "RESERVA_WEB", saved.reserva_id)
        except Exception:
            pass
        try:
            publish(ReservaCreada(saved.reserva_id, {
                "nombre": saved.nombre_solicitante,
                "email": saved.email_solicitante,
                "especialidad_id": saved.especialidad_id,
                "fecha": str(saved.fecha_hora_deseada),
            }))
        except Exception:
            pass
        return self.get(saved.reserva_id)

    def update(self, reserva_id: int, data: ReservaWebUpdate) -> dict:
        orm = self._get_reserva_orm(reserva_id)
        if data.estado is not None:
            domain = ReservaMapper.to_domain(orm)
            domain.cambiar_estado(data.estado)
            ReservaMapper.update_orm(domain, orm)
        if data.observacion_admin is not None:
            orm.ObservacionAdmin = data.observacion_admin
        if data.estado is not None:
            orm.FechaRespuesta = datetime.now()
        try:
            self.db.commit()
            self.db.refresh(orm)
        except Exception:
            self.db.rollback()
            raise
        registrar_auditoria(self.db, None, "ACTUALIZAR_RESERVA",
                            f"Reserva {reserva_id} actualizada a estado {orm.Estado}",
                            "RESERVA_WEB", reserva_id)
        return self.get(reserva_id)

    def delete(self, reserva_id: int) -> None:
        item = self._get_reserva_orm(reserva_id)
        self.db.delete(item)
        self.db.commit()
        registrar_auditoria(self.db, None, "ELIMINAR_RESERVA",
                            f"Reserva {reserva_id} eliminada",
                            "RESERVA_WEB", reserva_id)

    def rechazar(self, reserva_id: int, motivo_rechazo: str) -> dict:
        try:
            return self.update(reserva_id, ReservaWebUpdate(
                estado="Rechazada",
                observacion_admin=motivo_rechazo,
            ))
        except Exception:
            self.db.rollback()
            raise

    def convert_to_cita(self, reserva_id: int, ubicacion_id: int | None = None,
                        observaciones: str | None = None, clinical_id: int = 1) -> dict:
        reserva = self._get_reserva_orm(reserva_id)
        if reserva.Estado != "Pendiente":
            raise ConflictError("Only pending reservations can be converted")
        if not reserva.MedicoID:
            raise ConflictError("Reservation must have a doctor assigned")

        try:
            if not reserva.PacienteID:
                paciente = self.db.query(Paciente).filter(
                    Paciente.DNI == reserva.DNISolicitante,
                ).first()
                if not paciente:
                    nombre_partes = reserva.NombreSolicitante.split(" ", 1)
                    paciente = Paciente(
                        ClinicalID=clinical_id,
                        DNI=reserva.DNISolicitante,
                        Nombre=nombre_partes[0],
                        Apellido=nombre_partes[1] if len(nombre_partes) > 1 else "",
                        Email=reserva.EmailSolicitante,
                        Telefono=reserva.TelefonoSolicitante,
                        Direccion=reserva.DireccionSolicitante,
                        FechaNacimiento=reserva.FechaNacimientoSolicitante,
                        Genero=reserva.GeneroSolicitante,
                    )
                    self.db.add(paciente)
                    self.db.flush()
                reserva.PacienteID = paciente.PacienteID

            cita = Cita(
                PacienteID=reserva.PacienteID,
                MedicoID=reserva.MedicoID,
                EspecialidadID=reserva.EspecialidadID,
                UbicacionID=ubicacion_id,
                ReservaID=reserva.ReservaID,
                FechaHora=reserva.FechaHoraDeseada,
                MotivoConsulta=reserva.MotivoConsulta,
                Observaciones=observaciones,
            )
            self.db.add(cita)
            self.db.flush()

            reserva.CitaID = cita.CitaID
            reserva.Estado = "Convertida"
            reserva.FechaRespuesta = datetime.now()
            self.db.commit()
            self.db.refresh(cita)
        except Exception:
            self.db.rollback()
            raise

        registrar_auditoria(self.db, None, "CONVERTIR_RESERVA",
                            f"Reserva {reserva_id} convertida a cita {cita.CitaID}",
                            "RESERVA_WEB", reserva_id)

        publish(CitaConfirmada(cita.CitaID, {
            "reserva_id": reserva_id,
            "paciente_id": reserva.PacienteID,
            "medico_id": reserva.MedicoID,
            "fecha": str(reserva.FechaHoraDeseada),
        }))

        if reserva.EmailSolicitante:
            paciente_nombre = reserva.NombreSolicitante
            medico_nombre = reserva.medico.usuario.Nombre + " " + reserva.medico.usuario.Apellido if reserva.medico and reserva.medico.usuario else "Asignado"
            especialidad = reserva.especialidad.NombreEspecialidad if reserva.especialidad else ""
            send_appointment_confirmation(
                reserva.EmailSolicitante, paciente_nombre, medico_nombre,
                reserva.FechaHoraDeseada.strftime("%d/%m/%Y %H:%M"), especialidad,
            )
        return _cita_to_dict(cita)


class CitaService:
    def __init__(self, db: Session, uow: UnitOfWork | None = None):
        self.db = db
        self.uow = uow or UnitOfWork(db)

    def _get_cita_orm(self, cita_id: int) -> Cita:
        item = self.db.query(Cita).options(
            joinedload(Cita.paciente),
            joinedload(Cita.medico).joinedload(Medico.usuario),
            joinedload(Cita.especialidad),
            joinedload(Cita.ubicacion),
        ).filter(Cita.CitaID == cita_id).first()
        if not item:
            raise NotFoundError("Cita not found")
        return item

    def list(self, skip: int = 0, limit: int = 100, estado: str | None = None,
             medico_id: int | None = None, paciente_id: int | None = None,
             fecha_desde: date | None = None, fecha_hasta: date | None = None) -> dict:
        query = self.db.query(Cita).options(
            joinedload(Cita.paciente),
            joinedload(Cita.medico).joinedload(Medico.usuario),
            joinedload(Cita.especialidad),
            joinedload(Cita.ubicacion),
        )
        if estado:
            query = query.filter(Cita.EstadoCita == estado)
        if medico_id:
            query = query.filter(Cita.MedicoID == medico_id)
        if paciente_id:
            query = query.filter(Cita.PacienteID == paciente_id)
        if fecha_desde:
            query = query.filter(Cita.FechaHora >= datetime.combine(fecha_desde, datetime.min.time()))
        if fecha_hasta:
            query = query.filter(Cita.FechaHora <= datetime.combine(fecha_hasta, datetime.max.time()))
        total = query.count()
        items = query.order_by(Cita.FechaHora).offset(skip).limit(limit).all()
        return {"items": [_cita_to_dict(c) for c in items], "total": total}

    def get(self, cita_id: int) -> dict:
        return _cita_to_dict(self._get_cita_orm(cita_id))

    def create(self, data: CitaCreate, created_by: int | None = None) -> dict:
        new_start = data.fecha_hora
        new_end = data.fecha_hora + timedelta(minutes=data.duracion_minutos)
        conflict = self.db.query(Cita).filter(
            Cita.MedicoID == data.medico_id,
            Cita.EstadoCita.in_(["Programada", "Confirmada", "En curso"]),
            Cita.FechaHora < new_end,
            sa_func.DATEADD(sa_func.MINUTE, Cita.DuracionMinutos, Cita.FechaHora) > new_start,
        ).first()
        if conflict:
            raise ConflictError("Doctor already has an appointment at this time")

        cita = Cita(
            PacienteID=data.paciente_id,
            MedicoID=data.medico_id,
            EspecialidadID=data.especialidad_id,
            UbicacionID=data.ubicacion_id,
            ReservaID=data.reserva_id,
            FechaHora=data.fecha_hora,
            DuracionMinutos=data.duracion_minutos,
            MotivoConsulta=data.motivo_consulta,
            Observaciones=data.observaciones,
            CreadoPorUsuarioID=created_by,
        )
        self.db.add(cita)
        self.db.commit()
        self.db.refresh(cita)
        cache.delete(f"disp:{data.medico_id}:{data.fecha_hora.date().isoformat()}")
        registrar_auditoria(self.db, created_by, "CREAR_CITA",
                            f"Cita creada: paciente {data.paciente_id} con médico {data.medico_id}",
                            "CITA", cita.CitaID)
        return self.get(cita.CitaID)

    def update(self, cita_id: int, data: CitaUpdate) -> dict:
        item = self._get_cita_orm(cita_id)
        if data.fecha_hora is not None:
            item.FechaHora = data.fecha_hora
        if data.duracion_minutos is not None:
            item.DuracionMinutos = data.duracion_minutos
        if data.estado_cita is not None:
            domain = CitaDomain(
                cita_id=cita_id, paciente_id=item.PacienteID,
                medico_id=item.MedicoID, especialidad_id=item.EspecialidadID,
                fecha_hora=item.FechaHora, duracion_minutos=item.DuracionMinutos,
                estado_cita=item.EstadoCita,
            )
            domain.cambiar_estado(data.estado_cita)
            item.EstadoCita = domain.estado_cita
        if data.observaciones is not None:
            item.Observaciones = data.observaciones
        if data.ubicacion_id is not None:
            item.UbicacionID = data.ubicacion_id
        self.db.commit()
        self.db.refresh(item)
        cache.delete(f"disp:{item.MedicoID}:{item.FechaHora.date().isoformat()}")
        registrar_auditoria(self.db, None, "ACTUALIZAR_CITA",
                            f"Cita {cita_id} actualizada", "CITA", cita_id)
        return self.get(cita_id)

    def delete(self, cita_id: int) -> None:
        item = self._get_cita_orm(cita_id)
        cache.delete(f"disp:{item.MedicoID}:{item.FechaHora.date().isoformat()}")
        item.EstadoCita = "Cancelada"
        self.db.commit()
        registrar_auditoria(self.db, None, "CANCELAR_CITA",
                            f"Cita {cita_id} cancelada", "CITA", cita_id)

    def get_disponibilidad(self, medico_id: int, fecha: date) -> dict:
        cache_key = f"disp:{medico_id}:{fecha.isoformat()}"
        cached = cache.get(cache_key)
        if cached is not None:
            return cached

        medico = self.db.query(Medico).filter(Medico.MedicoID == medico_id).first()
        if not medico:
            raise NotFoundError("Medico not found")

        dia_semana = fecha.isoweekday()
        horarios = self.db.query(HorarioMedico).filter(
            HorarioMedico.MedicoID == medico_id,
            HorarioMedico.DiaSemana == dia_semana,
            HorarioMedico.Activo == True,
        ).all()

        if not horarios:
            return {"medico_id": medico_id, "fecha": str(fecha), "slots": []}

        citas_del_dia = self.db.query(Cita).filter(
            Cita.MedicoID == medico_id,
            Cita.FechaHora >= datetime.combine(fecha, datetime.min.time()),
            Cita.FechaHora <= datetime.combine(fecha, datetime.max.time()),
            Cita.EstadoCita.in_(["Programada", "Confirmada", "En curso"]),
        ).all()

        occupied_slots = set()
        for cita in citas_del_dia:
            key = cita.FechaHora.strftime("%H:%M")
            occupied_slots.add(key)

        slots = []
        for horario in horarios:
            current = datetime.combine(fecha, horario.HoraInicio)
            end = datetime.combine(fecha, horario.HoraFin)
            while current + timedelta(minutes=horario.IntervaloCitas) <= end:
                time_key = current.strftime("%H:%M")
                slots.append({
                    "hora_inicio": current.time(),
                    "hora_fin": (current + timedelta(minutes=horario.IntervaloCitas)).time(),
                    "disponible": time_key not in occupied_slots,
                })
                current += timedelta(minutes=horario.IntervaloCitas)

        result = {"medico_id": medico_id, "fecha": str(fecha), "slots": slots}
        cache.set(cache_key, result, ttl_seconds=120)
        return result
