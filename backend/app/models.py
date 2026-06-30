from datetime import date, datetime
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, Date, Time, Boolean, ForeignKey,
    UniqueConstraint, CheckConstraint, Numeric, Unicode, UnicodeText, text
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class Clinica(Base):
    __tablename__ = "CLINICA"

    ClinicalID = Column(Integer, primary_key=True, autoincrement=True)
    Nombre = Column(String(150), nullable=False)
    RUC = Column(String(20), nullable=False, unique=True)
    Direccion = Column(String(250), nullable=False)
    Telefono = Column(String(20), nullable=False)
    Email = Column(String(100), nullable=False)
    PlanSuscripcion = Column(String(50), nullable=False)
    Activo = Column(Boolean, nullable=False, default=True, server_default=text("1"))
    FechaCreacion = Column(DateTime, nullable=False, default=datetime.now, server_default=text("CURRENT_TIMESTAMP"))

    departamentos = relationship("Departamento", back_populates="clinica")
    usuarios = relationship("Usuario", back_populates="clinica")
    pacientes = relationship("Paciente", back_populates="clinica")

    __table_args__ = (
        CheckConstraint("PlanSuscripcion IN ('Basic', 'Standard', 'Premium')", name="CK_CLINICA_PLAN"),
    )


class Especialidad(Base):
    __tablename__ = "ESPECIALIDAD"

    EspecialidadID = Column(Integer, primary_key=True, autoincrement=True)
    NombreEspecialidad = Column(String(100), nullable=False, unique=True)
    Descripcion = Column(String(255), nullable=True)

    medicos = relationship("Medico", back_populates="especialidad")
    reservas = relationship("ReservaWeb", back_populates="especialidad")
    citas = relationship("Cita", back_populates="especialidad")


class Role(Base):
    __tablename__ = "ROLE"

    RoleID = Column(Integer, primary_key=True, autoincrement=True)
    NombreRole = Column(String(50), nullable=False, unique=True)

    usuarios = relationship("Usuario", back_populates="role")


class Departamento(Base):
    __tablename__ = "DEPARTAMENTO"

    DepartamentoID = Column(Integer, primary_key=True, autoincrement=True)
    ClinicalID = Column(Integer, ForeignKey("CLINICA.ClinicalID"), nullable=False)
    Nombre = Column(String(100), nullable=False)
    Descripcion = Column(String(255), nullable=True)
    Activo = Column(Boolean, nullable=False, default=True, server_default=text("1"))

    clinica = relationship("Clinica", back_populates="departamentos")
    ubicaciones = relationship("UbicacionFisica", back_populates="departamento")
    habitaciones = relationship("Habitacion", back_populates="departamento")
    medicos = relationship("Medico", back_populates="departamento")
    enfermeros = relationship("Enfermero", back_populates="departamento")


class UbicacionFisica(Base):
    __tablename__ = "UBICACION_FISICA"

    UbicacionID = Column(Integer, primary_key=True, autoincrement=True)
    DepartamentoID = Column(Integer, ForeignKey("DEPARTAMENTO.DepartamentoID"), nullable=False)
    Nombre = Column(String(100), nullable=False)
    Tipo = Column(String(50), nullable=False)
    Piso = Column(String(10), nullable=True)
    Activo = Column(Boolean, nullable=False, default=True, server_default=text("1"))

    departamento = relationship("Departamento", back_populates="ubicaciones")
    usuarios = relationship("Usuario", back_populates="ubicacion")
    citas = relationship("Cita", back_populates="ubicacion")

    __table_args__ = (
        CheckConstraint("Tipo IN ('Consultorio', 'Operaciones', 'Emergencias', 'Laboratorio', 'Imagenologia', 'Otro')", name="CK_UBICACION_TIPO"),
    )


class Habitacion(Base):
    __tablename__ = "HABITACION"

    HabitacionID = Column(Integer, primary_key=True, autoincrement=True)
    DepartamentoID = Column(Integer, ForeignKey("DEPARTAMENTO.DepartamentoID"), nullable=False)
    Numero = Column(String(20), nullable=False)
    Piso = Column(String(10), nullable=True)
    Tipo = Column(String(50), nullable=False)
    Capacidad = Column(Integer, nullable=False)
    Estado = Column(String(30), nullable=False, default="Disponible", server_default=text("'Disponible'"))

    departamento = relationship("Departamento", back_populates="habitaciones")
    admisiones = relationship("Admision", back_populates="habitacion")

    __table_args__ = (
        CheckConstraint("Tipo IN ('UCI', 'Privado', 'Compartido', 'Post-op', 'Pediatria', 'Neonatal', 'Emergencia', 'Aislamiento')", name="CK_HABITACION_TIPO"),
        CheckConstraint("Capacidad >= 1", name="CK_HABITACION_CAPACIDAD"),
        CheckConstraint("Estado IN ('Disponible', 'Ocupada', 'Mantenimiento', 'Reservada')", name="CK_HABITACION_ESTADO"),
        UniqueConstraint("DepartamentoID", "Numero", name="UQ_HABITACION_NUMERO"),
    )


class Usuario(Base):
    __tablename__ = "USUARIO"

    UsuarioID = Column(Integer, primary_key=True, autoincrement=True)
    ClinicalID = Column(Integer, ForeignKey("CLINICA.ClinicalID"), nullable=False)
    RoleID = Column(Integer, ForeignKey("ROLE.RoleID"), nullable=False)
    UbicacionID = Column(Integer, ForeignKey("UBICACION_FISICA.UbicacionID"), nullable=True)
    Nombre = Column(String(100), nullable=False)
    Apellido = Column(String(100), nullable=False)
    DNI = Column(String(20), nullable=False)
    Email = Column(String(100), nullable=False, unique=True)
    Telefono = Column(String(20), nullable=True)
    PasswordHash = Column(String(255), nullable=False)
    TokenRecuperacion = Column(String(255), nullable=True)
    TokenExpiracion = Column(DateTime, nullable=True)
    Activo = Column(Boolean, nullable=False, default=True, server_default=text("1"))
    FechaCreacion = Column(DateTime, nullable=False, default=datetime.now, server_default=text("CURRENT_TIMESTAMP"))
    UltimoAcceso = Column(DateTime, nullable=True)

    clinica = relationship("Clinica", back_populates="usuarios")
    role = relationship("Role", back_populates="usuarios")
    ubicacion = relationship("UbicacionFisica", back_populates="usuarios")
    medico = relationship("Medico", back_populates="usuario", uselist=False)
    enfermero = relationship("Enfermero", back_populates="usuario", uselist=False)

    __table_args__ = (
        UniqueConstraint("ClinicalID", "DNI", name="UQ_USUARIO_DNI_CLINICA"),
    )


class LogAuditoria(Base):
    __tablename__ = "LOG_AUDITORIA"

    LogID = Column(Integer, primary_key=True, autoincrement=True)
    UsuarioID = Column(Integer, ForeignKey("USUARIO.UsuarioID"), nullable=True)
    Accion = Column(String(100), nullable=False)
    Descripcion = Column(String(500), nullable=True)
    TablaAfectada = Column(String(50), nullable=True)
    RegistroID = Column(Integer, nullable=True)
    IPOrigen = Column(String(45), nullable=True)
    FechaHora = Column(DateTime, nullable=False, default=datetime.now, server_default=text("CURRENT_TIMESTAMP"))

    usuario = relationship("Usuario")


class Medico(Base):
    __tablename__ = "MEDICO"

    MedicoID = Column(Integer, primary_key=True, autoincrement=True)
    UsuarioID = Column(Integer, ForeignKey("USUARIO.UsuarioID"), nullable=False, unique=True)
    EspecialidadID = Column(Integer, ForeignKey("ESPECIALIDAD.EspecialidadID"), nullable=False)
    DepartamentoID = Column(Integer, ForeignKey("DEPARTAMENTO.DepartamentoID"), nullable=False)
    NumeroColegiatura = Column(String(50), nullable=False, unique=True)
    Activo = Column(Boolean, nullable=False, default=True, server_default=text("1"))

    usuario = relationship("Usuario", back_populates="medico")
    especialidad = relationship("Especialidad", back_populates="medicos")
    departamento = relationship("Departamento", back_populates="medicos")
    horarios = relationship("HorarioMedico", back_populates="medico")
    citas = relationship("Cita", back_populates="medico")
    admisiones = relationship("Admision", back_populates="medico")
    historias = relationship("HistoriaClinica", back_populates="medico")
    reservas = relationship("ReservaWeb", back_populates="medico")


class HorarioMedico(Base):
    __tablename__ = "HORARIO_MEDICO"

    HorarioID = Column(Integer, primary_key=True, autoincrement=True)
    MedicoID = Column(Integer, ForeignKey("MEDICO.MedicoID"), nullable=False)
    DiaSemana = Column(Integer, nullable=False)
    HoraInicio = Column(Time, nullable=False)
    HoraFin = Column(Time, nullable=False)
    IntervaloCitas = Column(Integer, nullable=False, default=30, server_default=text("30"))
    Activo = Column(Boolean, nullable=False, default=True, server_default=text("1"))

    medico = relationship("Medico", back_populates="horarios")

    __table_args__ = (
        CheckConstraint("DiaSemana BETWEEN 1 AND 7", name="CK_HORARIO_DIA"),
        CheckConstraint("HoraFin > HoraInicio", name="CK_HORARIO_HORAS"),
    )


class Enfermero(Base):
    __tablename__ = "ENFERMERO"

    EnfermeroID = Column(Integer, primary_key=True, autoincrement=True)
    UsuarioID = Column(Integer, ForeignKey("USUARIO.UsuarioID"), nullable=False, unique=True)
    DepartamentoID = Column(Integer, ForeignKey("DEPARTAMENTO.DepartamentoID"), nullable=False)
    NumeroLicencia = Column(String(50), nullable=False, unique=True)
    Turno = Column(String(30), nullable=False)
    Activo = Column(Boolean, nullable=False, default=True, server_default=text("1"))

    usuario = relationship("Usuario", back_populates="enfermero")
    departamento = relationship("Departamento", back_populates="enfermeros")

    __table_args__ = (
        CheckConstraint("Turno IN ('Mañana', 'Tarde', 'Noche', 'Rotativo')", name="CK_ENFERMERO_TURNO"),
    )


class Paciente(Base):
    __tablename__ = "PACIENTE"

    PacienteID = Column(Integer, primary_key=True, autoincrement=True)
    ClinicalID = Column(Integer, ForeignKey("CLINICA.ClinicalID"), nullable=False)
    DNI = Column(String(20), nullable=False)
    Nombre = Column(String(100), nullable=False)
    Apellido = Column(String(100), nullable=False)
    FechaNacimiento = Column(Date, nullable=True)
    Genero = Column(String(20), nullable=True)
    Direccion = Column(String(250), nullable=True)
    Telefono = Column(String(20), nullable=True)
    Email = Column(String(100), nullable=True)
    GrupoSanguineo = Column(String(10), nullable=True)
    Alergias = Column(Text, nullable=True)
    Activo = Column(Boolean, nullable=False, default=True, server_default=text("1"))
    FechaRegistro = Column(DateTime, nullable=False, default=datetime.now, server_default=text("CURRENT_TIMESTAMP"))

    clinica = relationship("Clinica", back_populates="pacientes")
    auth = relationship("PacienteAuth", back_populates="paciente", uselist=False)
    reservas = relationship("ReservaWeb", back_populates="paciente")
    citas = relationship("Cita", back_populates="paciente")
    admisiones = relationship("Admision", back_populates="paciente")
    historias = relationship("HistoriaClinica", back_populates="paciente")

    __table_args__ = (
        UniqueConstraint("ClinicalID", "DNI", name="UQ_PACIENTE_DNI_CLINICA"),
        CheckConstraint("Genero IN ('Masculino', 'Femenino', 'Otro')", name="CK_PACIENTE_GENERO"),
        CheckConstraint("GrupoSanguineo IN ('A+','A-','B+','B-','O+','O-','AB+','AB-')", name="CK_PACIENTE_SANGRE"),
    )


class PacienteAuth(Base):
    __tablename__ = "PACIENTE_AUTH"

    AuthID = Column(Integer, primary_key=True, autoincrement=True)
    PacienteID = Column(Integer, ForeignKey("PACIENTE.PacienteID"), nullable=False, unique=True)
    Email = Column(String(100), nullable=False, unique=True)
    PasswordHash = Column(String(255), nullable=False)
    TokenRecuperacion = Column(String(255), nullable=True)
    TokenExpiracion = Column(DateTime, nullable=True)
    Activo = Column(Boolean, nullable=False, default=True, server_default=text("1"))
    FechaCreacion = Column(DateTime, nullable=False, default=datetime.now, server_default=text("CURRENT_TIMESTAMP"))
    UltimoAcceso = Column(DateTime, nullable=True)

    paciente = relationship("Paciente", back_populates="auth")


class ReservaWeb(Base):
    __tablename__ = "RESERVA_WEB"

    ReservaID = Column(Integer, primary_key=True, autoincrement=True)
    PacienteID = Column(Integer, ForeignKey("PACIENTE.PacienteID"), nullable=True)
    CitaID = Column(Integer, ForeignKey("CITA.CitaID"), nullable=True)
    NombreSolicitante = Column(String(250), nullable=False)
    DNISolicitante = Column(String(20), nullable=False)
    EmailSolicitante = Column(String(100), nullable=False)
    TelefonoSolicitante = Column(String(20), nullable=True)
    DireccionSolicitante = Column(String(250), nullable=True)
    FechaNacimientoSolicitante = Column(Date, nullable=True)
    GeneroSolicitante = Column(String(20), nullable=True)
    EspecialidadID = Column(Integer, ForeignKey("ESPECIALIDAD.EspecialidadID"), nullable=False)
    MedicoID = Column(Integer, ForeignKey("MEDICO.MedicoID"), nullable=True)
    FechaHoraDeseada = Column(DateTime, nullable=False)
    MotivoConsulta = Column(Text, nullable=True)
    Estado = Column(String(30), nullable=False, default="Pendiente", server_default=text("'Pendiente'"))
    AceptaTerminos = Column(Boolean, nullable=False, default=False, server_default=text("0"))
    FechaSolicitud = Column(DateTime, nullable=False, default=datetime.now, server_default=text("CURRENT_TIMESTAMP"))
    FechaRespuesta = Column(DateTime, nullable=True)
    ObservacionAdmin = Column(String(500), nullable=True)

    paciente = relationship("Paciente", back_populates="reservas")
    especialidad = relationship("Especialidad", back_populates="reservas")
    medico = relationship("Medico", back_populates="reservas")
    cita = relationship("Cita", foreign_keys=[CitaID], uselist=False)

    __table_args__ = (
        CheckConstraint("Estado IN ('Pendiente', 'Confirmada', 'Rechazada', 'Convertida', 'Cancelada')", name="CK_RESERVA_ESTADO"),
        CheckConstraint("GeneroSolicitante IN ('Masculino', 'Femenino', 'Otro')", name="CK_RESERVA_GENERO"),
    )


class Cita(Base):
    __tablename__ = "CITA"

    CitaID = Column(Integer, primary_key=True, autoincrement=True)
    PacienteID = Column(Integer, ForeignKey("PACIENTE.PacienteID"), nullable=False)
    MedicoID = Column(Integer, ForeignKey("MEDICO.MedicoID"), nullable=False)
    EspecialidadID = Column(Integer, ForeignKey("ESPECIALIDAD.EspecialidadID"), nullable=False)
    UbicacionID = Column(Integer, ForeignKey("UBICACION_FISICA.UbicacionID"), nullable=True)
    ReservaID = Column(Integer, ForeignKey("RESERVA_WEB.ReservaID"), nullable=True)
    FechaHora = Column(DateTime, nullable=False)
    DuracionMinutos = Column(Integer, nullable=False, default=30, server_default=text("30"))
    EstadoCita = Column(String(30), nullable=False, default="Programada", server_default=text("'Programada'"))
    MotivoConsulta = Column(Text, nullable=True)
    Observaciones = Column(Text, nullable=True)
    FechaCreacion = Column(DateTime, nullable=False, default=datetime.now, server_default=text("CURRENT_TIMESTAMP"))
    CreadoPorUsuarioID = Column(Integer, ForeignKey("USUARIO.UsuarioID"), nullable=True)

    paciente = relationship("Paciente", back_populates="citas")
    medico = relationship("Medico", back_populates="citas")
    especialidad = relationship("Especialidad", back_populates="citas")
    ubicacion = relationship("UbicacionFisica", back_populates="citas")
    reserva = relationship("ReservaWeb", foreign_keys=[ReservaID], uselist=False)
    creador = relationship("Usuario", foreign_keys=[CreadoPorUsuarioID])

    __table_args__ = (
        CheckConstraint("EstadoCita IN ('Programada', 'Confirmada', 'En curso', 'Completada', 'Cancelada', 'No asistió')", name="CK_CITA_ESTADO"),
    )


class Admision(Base):
    __tablename__ = "ADMISION"

    AdmisionID = Column(Integer, primary_key=True, autoincrement=True)
    PacienteID = Column(Integer, ForeignKey("PACIENTE.PacienteID"), nullable=False)
    MedicoID = Column(Integer, ForeignKey("MEDICO.MedicoID"), nullable=False)
    EnfermeroID = Column(Integer, ForeignKey("ENFERMERO.EnfermeroID"), nullable=True)
    HabitacionID = Column(Integer, ForeignKey("HABITACION.HabitacionID"), nullable=False)
    CitaID = Column(Integer, ForeignKey("CITA.CitaID"), nullable=True)
    FechaIngreso = Column(DateTime, nullable=False, default=datetime.now, server_default=text("CURRENT_TIMESTAMP"))
    MotivoIngreso = Column(Text, nullable=False)
    DiagnosticoIngreso = Column(Text, nullable=True)
    FechaAlta = Column(DateTime, nullable=True)
    DiagnosticoAlta = Column(Text, nullable=True)
    TipoAlta = Column(String(50), nullable=True)
    Estado = Column(String(30), nullable=False, default="Activa", server_default=text("'Activa'"))
    Observaciones = Column(Text, nullable=True)
    FechaCreacion = Column(DateTime, nullable=False, default=datetime.now, server_default=text("CURRENT_TIMESTAMP"))
    CreadoPorUsuarioID = Column(Integer, ForeignKey("USUARIO.UsuarioID"), nullable=True)

    paciente = relationship("Paciente", back_populates="admisiones")
    medico = relationship("Medico", back_populates="admisiones")
    enfermero = relationship("Enfermero")
    habitacion = relationship("Habitacion", back_populates="admisiones")
    cita = relationship("Cita")
    creador = relationship("Usuario", foreign_keys=[CreadoPorUsuarioID])

    __table_args__ = (
        CheckConstraint("TipoAlta IN ('Voluntaria', 'Médica', 'Traslado', 'Defunción')", name="CK_ADMISION_TIPO_ALTA"),
        CheckConstraint("Estado IN ('Activa', 'Alta', 'Trasladado')", name="CK_ADMISION_ESTADO"),
    )


class HistoriaClinica(Base):
    __tablename__ = "HISTORIA_CLINICA"

    HistorialID = Column(Integer, primary_key=True, autoincrement=True)
    PacienteID = Column(Integer, ForeignKey("PACIENTE.PacienteID"), nullable=False)
    MedicoID = Column(Integer, ForeignKey("MEDICO.MedicoID"), nullable=False)
    CitaID = Column(Integer, ForeignKey("CITA.CitaID"), nullable=True)
    AdmisionID = Column(Integer, ForeignKey("ADMISION.AdmisionID"), nullable=True)
    Anamnesis = Column(Text, nullable=True)
    Diagnostico = Column(Text, nullable=False)
    Tratamiento = Column(Text, nullable=False)
    Prescripcion = Column(Text, nullable=True)
    Observaciones = Column(Text, nullable=True)
    FechaRegistro = Column(DateTime, nullable=False, default=datetime.now, server_default=text("CURRENT_TIMESTAMP"))

    paciente = relationship("Paciente", back_populates="historias")
    medico = relationship("Medico", back_populates="historias")
    cita = relationship("Cita")
    admision = relationship("Admision")
    documentos = relationship("DocumentoAdjunto", back_populates="historial", cascade="all, delete-orphan")


class CIE10Diagnostico(Base):
    __tablename__ = "CIE10_DIAGNOSTICO"

    Codigo = Column(String(10), primary_key=True)
    EspecialidadID = Column(Integer, ForeignKey("ESPECIALIDAD.EspecialidadID"), primary_key=True)
    Descripcion = Column(String(300), nullable=False)
    Categoria = Column(String(150), nullable=True)
    Activo = Column(Boolean, nullable=False, default=True)

    especialidad = relationship("Especialidad")


class DocumentoAdjunto(Base):
    __tablename__ = "DOCUMENTO_ADJUNTO"

    DocumentoID = Column(Integer, primary_key=True, autoincrement=True)
    HistorialID = Column(Integer, ForeignKey("HISTORIA_CLINICA.HistorialID", ondelete="CASCADE"), nullable=False)
    BlobURL = Column(String(500), nullable=False)
    NombreArchivo = Column(String(200), nullable=False)
    TipoArchivo = Column(String(50), nullable=False)
    TamanoKB = Column(Integer, nullable=True)
    Descripcion = Column(String(255), nullable=True)
    FechaSubida = Column(DateTime, nullable=False, default=datetime.now, server_default=text("CURRENT_TIMESTAMP"))
    SubidoPorUsuarioID = Column(Integer, ForeignKey("USUARIO.UsuarioID"), nullable=True)

    historial = relationship("HistoriaClinica", back_populates="documentos")
    subido_por = relationship("Usuario")

    __table_args__ = (
        CheckConstraint("TipoArchivo IN ('PDF', 'JPEG', 'PNG', 'DICOM', 'DOC', 'XLSX', 'Otro')", name="CK_DOCUMENTO_TIPO"),
    )


class LandingPlan(Base):
    __tablename__ = "LANDING_PLAN"

    PlanID = Column(Integer, primary_key=True, autoincrement=True)
    Slug = Column(String(50), nullable=False, unique=True)
    Nombre = Column(Unicode(80), nullable=False)
    Descripcion = Column(UnicodeText, nullable=False)
    Precio = Column(Numeric(10, 2), nullable=False)
    PrecioConWeb = Column(Numeric(10, 2), nullable=False)
    Periodo = Column(Unicode(120), nullable=False)
    ColorAcento = Column(String(20), nullable=False)
    Icono = Column(String(50), nullable=False, default="star", server_default=text("'star'"))
    IntroBeneficios = Column(Unicode(160), nullable=True)
    Popular = Column(Boolean, nullable=False, default=False, server_default=text("0"))
    EtiquetaPopular = Column(Unicode(60), nullable=True)
    TextoBoton = Column(Unicode(80), nullable=False, default="Elegir plan", server_default=text("'Elegir plan'"))
    EnlaceBoton = Column(String(200), nullable=False, default="#contact", server_default=text("'#contact'"))
    Orden = Column(Integer, nullable=False, default=0, server_default=text("0"))
    Activo = Column(Boolean, nullable=False, default=True, server_default=text("1"))
    FechaCreacion = Column(DateTime, nullable=False, default=datetime.now, server_default=text("CURRENT_TIMESTAMP"))

    features = relationship(
        "LandingPlanFeature",
        back_populates="plan",
        cascade="all, delete-orphan",
        order_by="LandingPlanFeature.Orden",
    )


class LandingPlanFeature(Base):
    __tablename__ = "LANDING_PLAN_FEATURE"

    FeatureID = Column(Integer, primary_key=True, autoincrement=True)
    PlanID = Column(Integer, ForeignKey("LANDING_PLAN.PlanID"), nullable=False)
    Texto = Column(Unicode(220), nullable=False)
    Tooltip = Column(UnicodeText, nullable=True)
    Orden = Column(Integer, nullable=False, default=0, server_default=text("0"))
    Activo = Column(Boolean, nullable=False, default=True, server_default=text("1"))

    plan = relationship("LandingPlan", back_populates="features")


class LandingMetric(Base):
    __tablename__ = "LANDING_METRIC"

    MetricID = Column(Integer, primary_key=True, autoincrement=True)
    Slug = Column(String(50), nullable=False, unique=True)
    Icono = Column(String(50), nullable=False)
    Etiqueta = Column(Unicode(80), nullable=False)
    Valor = Column(Numeric(12, 2), nullable=False, default=0, server_default=text("0"))
    Sufijo = Column(Unicode(40), nullable=False, default="", server_default=text("''"))
    Fuente = Column(String(50), nullable=False, default="manual", server_default=text("'manual'"))
    Orden = Column(Integer, nullable=False, default=0, server_default=text("0"))
    Activo = Column(Boolean, nullable=False, default=True, server_default=text("1"))


class LandingTestimonial(Base):
    __tablename__ = "LANDING_TESTIMONIAL"

    TestimonialID = Column(Integer, primary_key=True, autoincrement=True)
    Nombre = Column(Unicode(120), nullable=False)
    Especialidad = Column(Unicode(100), nullable=False)
    Ubicacion = Column(Unicode(100), nullable=False)
    AvatarURL = Column(String(500), nullable=True)
    Texto = Column(UnicodeText, nullable=False)
    Orden = Column(Integer, nullable=False, default=0, server_default=text("0"))
    Activo = Column(Boolean, nullable=False, default=True, server_default=text("1"))
    FechaCreacion = Column(DateTime, nullable=False, default=datetime.now, server_default=text("CURRENT_TIMESTAMP"))


class LandingFAQ(Base):
    __tablename__ = "LANDING_FAQ"

    FAQID = Column(Integer, primary_key=True, autoincrement=True)
    Pregunta = Column(Unicode(240), nullable=False)
    Respuesta = Column(UnicodeText, nullable=False)
    Orden = Column(Integer, nullable=False, default=0, server_default=text("0"))
    Activo = Column(Boolean, nullable=False, default=True, server_default=text("1"))


class LandingComparisonRow(Base):
    __tablename__ = "LANDING_COMPARISON_ROW"

    RowID = Column(Integer, primary_key=True, autoincrement=True)
    Categoria = Column(Unicode(120), nullable=True)
    Caracteristica = Column(Unicode(180), nullable=True)
    Tooltip = Column(UnicodeText, nullable=True)
    ValoresJSON = Column(UnicodeText, nullable=False)
    Orden = Column(Integer, nullable=False, default=0, server_default=text("0"))
    Activo = Column(Boolean, nullable=False, default=True, server_default=text("1"))


class LandingLead(Base):
    __tablename__ = "LANDING_LEAD"

    LeadID = Column(Integer, primary_key=True, autoincrement=True)
    Nombres = Column(Unicode(120), nullable=False)
    Apellidos = Column(Unicode(120), nullable=False)
    Email = Column(String(120), nullable=False)
    Telefono = Column(String(30), nullable=False)
    HorarioContacto = Column(Unicode(120), nullable=True)
    AreaImplementacion = Column(Unicode(160), nullable=False)
    AceptaMarketing = Column(Boolean, nullable=False, default=True, server_default=text("1"))
    Estado = Column(String(30), nullable=False, default="Nuevo", server_default=text("'Nuevo'"))
    FechaCreacion = Column(DateTime, nullable=False, default=datetime.now, server_default=text("CURRENT_TIMESTAMP"))
