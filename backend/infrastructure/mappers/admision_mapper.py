from app.models import Admision as AdmisionORM
from domain.entities.admision import Admision


class AdmisionMapper:

    @staticmethod
    def to_domain(o: AdmisionORM) -> Admision:
        return Admision(
            admision_id=o.AdmisionID,
            paciente_id=o.PacienteID,
            medico_id=o.MedicoID,
            enfermero_id=o.EnfermeroID,
            habitacion_id=o.HabitacionID,
            cita_id=o.CitaID,
            motivo_ingreso=o.MotivoIngreso,
            diagnostico_ingreso=o.DiagnosticoIngreso,
            fecha_ingreso=o.FechaIngreso,
            fecha_alta=o.FechaAlta,
            diagnostico_alta=o.DiagnosticoAlta,
            tipo_alta=o.TipoAlta,
            estado=o.Estado,
            observaciones=o.Observaciones,
            fecha_creacion=o.FechaCreacion,
            creado_por_usuario_id=o.CreadoPorUsuarioID,
        )

    @staticmethod
    def to_orm(d: Admision) -> AdmisionORM:
        return AdmisionORM(
            AdmisionID=d.admision_id,
            PacienteID=d.paciente_id,
            MedicoID=d.medico_id,
            EnfermeroID=d.enfermero_id,
            HabitacionID=d.habitacion_id,
            CitaID=d.cita_id,
            FechaIngreso=d.fecha_ingreso,
            MotivoIngreso=d.motivo_ingreso,
            DiagnosticoIngreso=d.diagnostico_ingreso,
            FechaAlta=d.fecha_alta,
            DiagnosticoAlta=d.diagnostico_alta,
            TipoAlta=d.tipo_alta,
            Estado=d.estado,
            Observaciones=d.observaciones,
            FechaCreacion=d.fecha_creacion,
            CreadoPorUsuarioID=d.creado_por_usuario_id,
        )

    @staticmethod
    def update_orm(d: Admision, o: AdmisionORM) -> None:
        o.EnfermeroID = d.enfermero_id
        o.HabitacionID = d.habitacion_id
        o.MotivoIngreso = d.motivo_ingreso
        o.DiagnosticoIngreso = d.diagnostico_ingreso
        o.FechaAlta = d.fecha_alta
        o.DiagnosticoAlta = d.diagnostico_alta
        o.TipoAlta = d.tipo_alta
        o.Estado = d.estado
        o.Observaciones = d.observaciones
