from app.models import Cita as CitaORM
from domain.entities.cita import Cita


class CitaMapper:

    @staticmethod
    def to_domain(o: CitaORM) -> Cita:
        return Cita(
            cita_id=o.CitaID,
            paciente_id=o.PacienteID,
            medico_id=o.MedicoID,
            especialidad_id=o.EspecialidadID,
            ubicacion_id=o.UbicacionID,
            reserva_id=o.ReservaID,
            fecha_hora=o.FechaHora,
            duracion_minutos=o.DuracionMinutos,
            estado_cita=o.EstadoCita,
            motivo_consulta=o.MotivoConsulta,
            observaciones=o.Observaciones,
            fecha_creacion=o.FechaCreacion,
            creado_por_usuario_id=o.CreadoPorUsuarioID,
        )

    @staticmethod
    def to_orm(d: Cita) -> CitaORM:
        return CitaORM(
            CitaID=d.cita_id,
            PacienteID=d.paciente_id,
            MedicoID=d.medico_id,
            EspecialidadID=d.especialidad_id,
            UbicacionID=d.ubicacion_id,
            ReservaID=d.reserva_id,
            FechaHora=d.fecha_hora,
            DuracionMinutos=d.duracion_minutos,
            EstadoCita=d.estado_cita,
            MotivoConsulta=d.motivo_consulta,
            Observaciones=d.observaciones,
            FechaCreacion=d.fecha_creacion,
            CreadoPorUsuarioID=d.creado_por_usuario_id,
        )

    @staticmethod
    def update_orm(d: Cita, o: CitaORM) -> None:
        o.PacienteID = d.paciente_id
        o.MedicoID = d.medico_id
        o.EspecialidadID = d.especialidad_id
        o.UbicacionID = d.ubicacion_id
        o.ReservaID = d.reserva_id
        o.FechaHora = d.fecha_hora
        o.DuracionMinutos = d.duracion_minutos
        o.EstadoCita = d.estado_cita
        o.MotivoConsulta = d.motivo_consulta
        o.Observaciones = d.observaciones
        o.CreadoPorUsuarioID = d.creado_por_usuario_id
