from app.models import Paciente as PacienteORM
from domain.entities.paciente import Paciente
from domain.value_objects.dni import DNI


class PacienteMapper:

    @staticmethod
    def to_domain(o: PacienteORM) -> Paciente:
        return Paciente(
            paciente_id=o.PacienteID,
            clinical_id=o.ClinicalID,
            dni=DNI(o.DNI),
            nombre=o.Nombre,
            apellido=o.Apellido,
            fecha_nacimiento=o.FechaNacimiento,
            genero=o.Genero,
            direccion=o.Direccion,
            telefono=o.Telefono,
            email=o.Email,
            grupo_sanguineo=o.GrupoSanguineo,
            alergias=o.Alergias,
            activo=o.Activo,
            fecha_registro=o.FechaRegistro,
        )

    @staticmethod
    def to_orm(d: Paciente) -> PacienteORM:
        return PacienteORM(
            PacienteID=d.paciente_id,
            ClinicalID=d.clinical_id,
            DNI=d.dni.value,
            Nombre=d.nombre,
            Apellido=d.apellido,
            FechaNacimiento=d.fecha_nacimiento,
            Genero=d.genero,
            Direccion=d.direccion,
            Telefono=d.telefono,
            Email=d.email,
            GrupoSanguineo=d.grupo_sanguineo,
            Alergias=d.alergias,
            Activo=d.activo,
            FechaRegistro=d.fecha_registro,
        )

    @staticmethod
    def update_orm(d: Paciente, o: PacienteORM) -> None:
        o.DNI = d.dni.value
        o.Nombre = d.nombre
        o.Apellido = d.apellido
        o.FechaNacimiento = d.fecha_nacimiento
        o.Genero = d.genero
        o.Direccion = d.direccion
        o.Telefono = d.telefono
        o.Email = d.email
        o.GrupoSanguineo = d.grupo_sanguineo
        o.Alergias = d.alergias
        o.Activo = d.activo
