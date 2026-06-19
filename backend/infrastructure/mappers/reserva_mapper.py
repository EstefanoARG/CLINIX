from app.models import ReservaWeb as ReservaORM
from domain.entities.reserva import ReservaWeb


class ReservaMapper:

    @staticmethod
    def to_domain(o: ReservaORM) -> ReservaWeb:
        return ReservaWeb(
            reserva_id=o.ReservaID,
            paciente_id=o.PacienteID,
            nombre_solicitante=o.NombreSolicitante,
            dni_solicitante=o.DNISolicitante,
            email_solicitante=o.EmailSolicitante,
            telefono_solicitante=o.TelefonoSolicitante,
            especialidad_id=o.EspecialidadID,
            medico_id=o.MedicoID,
            fecha_hora_deseada=o.FechaHoraDeseada,
            motivo_consulta=o.MotivoConsulta,
            estado=o.Estado,
            acepta_terminos=o.AceptaTerminos,
            fecha_solicitud=o.FechaSolicitud,
            fecha_respuesta=o.FechaRespuesta,
            observacion_admin=o.ObservacionAdmin,
            cita_id=o.CitaID,
        )

    @staticmethod
    def to_orm(d: ReservaWeb) -> ReservaORM:
        return ReservaORM(
            ReservaID=d.reserva_id,
            PacienteID=d.paciente_id,
            NombreSolicitante=d.nombre_solicitante,
            DNISolicitante=d.dni_solicitante,
            EmailSolicitante=d.email_solicitante,
            TelefonoSolicitante=d.telefono_solicitante,
            EspecialidadID=d.especialidad_id,
            MedicoID=d.medico_id,
            FechaHoraDeseada=d.fecha_hora_deseada,
            MotivoConsulta=d.motivo_consulta,
            Estado=d.estado,
            AceptaTerminos=d.acepta_terminos,
            FechaSolicitud=d.fecha_solicitud,
            FechaRespuesta=d.fecha_respuesta,
            ObservacionAdmin=d.observacion_admin,
            CitaID=d.cita_id,
        )

    @staticmethod
    def update_orm(d: ReservaWeb, o: ReservaORM) -> None:
        o.PacienteID = d.paciente_id
        o.NombreSolicitante = d.nombre_solicitante
        o.DNISolicitante = d.dni_solicitante
        o.EmailSolicitante = d.email_solicitante
        o.TelefonoSolicitante = d.telefono_solicitante
        o.EspecialidadID = d.especialidad_id
        o.MedicoID = d.medico_id
        o.FechaHoraDeseada = d.fecha_hora_deseada
        o.MotivoConsulta = d.motivo_consulta
        o.Estado = d.estado
        o.FechaRespuesta = d.fecha_respuesta
        o.ObservacionAdmin = d.observacion_admin
        o.CitaID = d.cita_id
