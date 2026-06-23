-- ============================================================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS - SISTEMA CLINIX
-- RDBMS: SQL Server
-- Versión: 2.0 (Completa)
-- Descripción: Base de datos para gestión clínica con portal público y
--              portal administrativo. Cubre autenticación, pacientes,
--              médicos, enfermeros, citas, admisiones y dashboard.
-- ============================================================================

USE master;
GO

IF EXISTS (SELECT 1 FROM sys.databases WHERE name = 'Clinix')
BEGIN
    ALTER DATABASE Clinix SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE Clinix;
END;
GO

CREATE DATABASE Clinix;
GO

USE Clinix;
GO

-- ============================================================================
-- SECCIÓN 1: TABLAS BASE (sin dependencias externas)
-- ============================================================================

-- 1.1 CLINICA
-- Entidad raíz del sistema. Todo pertenece a una clínica (multi-tenant).
CREATE TABLE CLINICA (
    ClinicalID       INT           IDENTITY(1,1) PRIMARY KEY,
    Nombre           VARCHAR(150)  NOT NULL,
    RUC              VARCHAR(20)   NOT NULL UNIQUE,
    Direccion        VARCHAR(250)  NOT NULL,
    Telefono         VARCHAR(20)   NOT NULL,
    Email            VARCHAR(100)  NOT NULL,
    PlanSuscripcion  VARCHAR(50)   NOT NULL
        CONSTRAINT CK_CLINICA_PLAN CHECK (PlanSuscripcion IN ('Basic', 'Standard', 'Premium')),
    Activo           BIT           NOT NULL DEFAULT 1,
    FechaCreacion    DATETIME      NOT NULL DEFAULT GETDATE()
);
GO

-- 1.2 ESPECIALIDAD
-- Catálogo de especialidades médicas.
CREATE TABLE ESPECIALIDAD (
    EspecialidadID    INT          IDENTITY(1,1) PRIMARY KEY,
    NombreEspecialidad VARCHAR(100) NOT NULL UNIQUE,
    Descripcion       VARCHAR(255) NULL
);
GO

-- 1.3 ROLE
-- Roles del sistema: Administrador, Médico, Enfermero, Recepcionista.
-- El paciente del portal público tiene su propia tabla de auth.
CREATE TABLE ROLE (
    RoleID     INT          IDENTITY(1,1) PRIMARY KEY,
    NombreRole VARCHAR(50)  NOT NULL UNIQUE
);
GO

-- ============================================================================
-- SECCIÓN 2: ESTRUCTURA FÍSICA DE LA CLÍNICA
-- ============================================================================

-- 2.1 DEPARTAMENTO
-- Área funcional dentro de una clínica (Cardiovascular, Neurología, etc.).
CREATE TABLE DEPARTAMENTO (
    DepartamentoID INT          IDENTITY(1,1) PRIMARY KEY,
    ClinicalID     INT          NOT NULL,
    Nombre         VARCHAR(100) NOT NULL,
    Descripcion    VARCHAR(255) NULL,
    Activo         BIT          NOT NULL DEFAULT 1,
    CONSTRAINT FK_DEPARTAMENTO_CLINICA FOREIGN KEY (ClinicalID)
        REFERENCES CLINICA(ClinicalID) ON DELETE CASCADE
);
GO

-- 2.2 UBICACION_FISICA
-- Espacios físicos dentro de un departamento (consultorios, salas, etc.).
CREATE TABLE UBICACION_FISICA (
    UbicacionID    INT          IDENTITY(1,1) PRIMARY KEY,
    DepartamentoID INT          NOT NULL,
    Nombre         VARCHAR(100) NOT NULL,
    Tipo           VARCHAR(50)  NOT NULL
        CONSTRAINT CK_UBICACION_TIPO CHECK (Tipo IN ('Consultorio', 'Operaciones', 'Emergencias', 'Laboratorio', 'Imagenologia', 'Otro')),
    Piso           VARCHAR(10)  NULL,
    Activo         BIT          NOT NULL DEFAULT 1,
    CONSTRAINT FK_UBICACION_DEPARTAMENTO FOREIGN KEY (DepartamentoID)
        REFERENCES DEPARTAMENTO(DepartamentoID)
);
GO

-- 2.3 HABITACION
-- Habitaciones para hospitalización. Pertenecen a un departamento.
CREATE TABLE HABITACION (
    HabitacionID   INT          IDENTITY(1,1) PRIMARY KEY,
    DepartamentoID INT          NOT NULL,
    Numero         VARCHAR(20)  NOT NULL,
    Piso           VARCHAR(10)  NULL,
    Tipo           VARCHAR(50)  NOT NULL
        CONSTRAINT CK_HABITACION_TIPO CHECK (Tipo IN ('UCI', 'Privado', 'Compartido', 'Post-op', 'Pediatria', 'Neonatal', 'Emergencia', 'Aislamiento')),
    Capacidad      INT          NOT NULL CONSTRAINT CK_HABITACION_CAPACIDAD CHECK (Capacidad >= 1),
    Estado         VARCHAR(30)  NOT NULL DEFAULT 'Disponible'
        CONSTRAINT CK_HABITACION_ESTADO CHECK (Estado IN ('Disponible', 'Ocupada', 'Mantenimiento', 'Reservada')),
    CONSTRAINT FK_HABITACION_DEPARTAMENTO FOREIGN KEY (DepartamentoID)
        REFERENCES DEPARTAMENTO(DepartamentoID),
    CONSTRAINT UQ_HABITACION_NUMERO UNIQUE (DepartamentoID, Numero)
);
GO

-- ============================================================================
-- SECCIÓN 3: USUARIOS DEL PORTAL ADMINISTRATIVO
-- ============================================================================

-- 3.1 USUARIO
-- Personal de la clínica (admins, médicos, enfermeros, recepcionistas).
CREATE TABLE USUARIO (
    UsuarioID    INT          IDENTITY(1,1) PRIMARY KEY,
    ClinicalID   INT          NOT NULL,
    RoleID       INT          NOT NULL,
    UbicacionID  INT          NULL,        -- Ubicación principal asignada
    Nombre       VARCHAR(100) NOT NULL,
    Apellido     VARCHAR(100) NOT NULL,
    DNI          VARCHAR(20)  NOT NULL,
    Email        VARCHAR(100) NOT NULL UNIQUE,
    Telefono     VARCHAR(20)  NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    TokenRecuperacion VARCHAR(255) NULL,   -- Para recuperación de contraseña
    TokenExpiracion   DATETIME     NULL,
    Activo       BIT          NOT NULL DEFAULT 1,
    FechaCreacion DATETIME    NOT NULL DEFAULT GETDATE(),
    UltimoAcceso  DATETIME    NULL,
    CONSTRAINT FK_USUARIO_CLINICA   FOREIGN KEY (ClinicalID)  REFERENCES CLINICA(ClinicalID),
    CONSTRAINT FK_USUARIO_ROLE      FOREIGN KEY (RoleID)      REFERENCES ROLE(RoleID),
    CONSTRAINT FK_USUARIO_UBICACION FOREIGN KEY (UbicacionID) REFERENCES UBICACION_FISICA(UbicacionID),
    CONSTRAINT UQ_USUARIO_DNI_CLINICA UNIQUE (ClinicalID, DNI)
);
GO

-- 3.2 LOG_AUDITORIA
-- Registro de acciones críticas para trazabilidad.
CREATE TABLE LOG_AUDITORIA (
    LogID       INT           IDENTITY(1,1) PRIMARY KEY,
    UsuarioID   INT           NULL,
    Accion      VARCHAR(100)  NOT NULL,   -- 'LOGIN', 'CREATE_CITA', 'DELETE_PACIENTE', etc.
    Descripcion VARCHAR(500)  NULL,
    TablaAfectada VARCHAR(50) NULL,
    RegistroID  INT           NULL,       -- ID del registro afectado
    IPOrigen    VARCHAR(45)   NULL,
    FechaHora   DATETIME      NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_LOG_USUARIO FOREIGN KEY (UsuarioID) REFERENCES USUARIO(UsuarioID)
);
GO

-- ============================================================================
-- SECCIÓN 4: PERSONAL MÉDICO
-- ============================================================================

-- 4.1 MEDICO
-- Extiende USUARIO con datos profesionales del médico.
CREATE TABLE MEDICO (
    MedicoID         INT          IDENTITY(1,1) PRIMARY KEY,
    UsuarioID        INT          NOT NULL UNIQUE,
    EspecialidadID   INT          NOT NULL,
    DepartamentoID   INT          NOT NULL,
    NumeroColegiatura VARCHAR(50) NOT NULL UNIQUE,
    Activo           BIT          NOT NULL DEFAULT 1,
    CONSTRAINT FK_MEDICO_USUARIO       FOREIGN KEY (UsuarioID)       REFERENCES USUARIO(UsuarioID),
    CONSTRAINT FK_MEDICO_ESPECIALIDAD  FOREIGN KEY (EspecialidadID)  REFERENCES ESPECIALIDAD(EspecialidadID),
    CONSTRAINT FK_MEDICO_DEPARTAMENTO  FOREIGN KEY (DepartamentoID)  REFERENCES DEPARTAMENTO(DepartamentoID)
);
GO

-- 4.2 HORARIO_MEDICO
-- Disponibilidad semanal de cada médico para la agenda de citas.
CREATE TABLE HORARIO_MEDICO (
    HorarioID     INT          IDENTITY(1,1) PRIMARY KEY,
    MedicoID      INT          NOT NULL,
    DiaSemana     TINYINT      NOT NULL   -- 1=Lunes, 2=Martes... 7=Domingo
        CONSTRAINT CK_HORARIO_DIA CHECK (DiaSemana BETWEEN 1 AND 7),
    HoraInicio    TIME         NOT NULL,
    HoraFin       TIME         NOT NULL,
    IntervaloCitas INT         NOT NULL DEFAULT 30,  -- minutos por cita
    Activo        BIT          NOT NULL DEFAULT 1,
    CONSTRAINT FK_HORARIO_MEDICO FOREIGN KEY (MedicoID) REFERENCES MEDICO(MedicoID),
    CONSTRAINT CK_HORARIO_HORAS CHECK (HoraFin > HoraInicio)
);
GO

-- 4.3 ENFERMERO
-- Extiende USUARIO con datos del personal de enfermería.
CREATE TABLE ENFERMERO (
    EnfermeroID    INT          IDENTITY(1,1) PRIMARY KEY,
    UsuarioID      INT          NOT NULL UNIQUE,
    DepartamentoID INT          NOT NULL,
    NumeroLicencia VARCHAR(50)  NOT NULL UNIQUE,
    Turno          VARCHAR(30)  NOT NULL
        CONSTRAINT CK_ENFERMERO_TURNO CHECK (Turno IN ('Mañana', 'Tarde', 'Noche', 'Rotativo')),
    Activo         BIT          NOT NULL DEFAULT 1,
    CONSTRAINT FK_ENFERMERO_USUARIO      FOREIGN KEY (UsuarioID)      REFERENCES USUARIO(UsuarioID),
    CONSTRAINT FK_ENFERMERO_DEPARTAMENTO FOREIGN KEY (DepartamentoID) REFERENCES DEPARTAMENTO(DepartamentoID)
);
GO

-- ============================================================================
-- SECCIÓN 5: PACIENTES
-- ============================================================================

-- 5.1 PACIENTE
-- Datos completos del paciente. Registrado desde recepción o portal público.
CREATE TABLE PACIENTE (
    PacienteID      INT          IDENTITY(1,1) PRIMARY KEY,
    ClinicalID      INT          NOT NULL,
    DNI             VARCHAR(20)  NOT NULL,
    Nombre          VARCHAR(100) NOT NULL,
    Apellido        VARCHAR(100) NOT NULL,
    FechaNacimiento DATE         NULL,
    Genero          VARCHAR(20)  NULL
        CONSTRAINT CK_PACIENTE_GENERO CHECK (Genero IN ('Masculino', 'Femenino', 'Otro', NULL)),
    Direccion       VARCHAR(250) NULL,
    Telefono        VARCHAR(20)  NULL,
    Email           VARCHAR(100) NULL,
    GrupoSanguineo  VARCHAR(10)  NULL
        CONSTRAINT CK_PACIENTE_SANGRE CHECK (GrupoSanguineo IN ('A+','A-','B+','B-','O+','O-','AB+','AB-', NULL)),
    Alergias        TEXT         NULL,
    Activo          BIT          NOT NULL DEFAULT 1,
    FechaRegistro   DATETIME     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_PACIENTE_CLINICA FOREIGN KEY (ClinicalID) REFERENCES CLINICA(ClinicalID),
    CONSTRAINT UQ_PACIENTE_DNI_CLINICA UNIQUE (ClinicalID, DNI)
);
GO

-- 5.2 PACIENTE_AUTH
-- Credenciales del paciente para el portal público (separado del USUARIO admin).
CREATE TABLE PACIENTE_AUTH (
    AuthID            INT          IDENTITY(1,1) PRIMARY KEY,
    PacienteID        INT          NOT NULL UNIQUE,
    Email             VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash      VARCHAR(255) NOT NULL,
    TokenRecuperacion VARCHAR(255) NULL,
    TokenExpiracion   DATETIME     NULL,
    Activo            BIT          NOT NULL DEFAULT 1,
    FechaCreacion     DATETIME     NOT NULL DEFAULT GETDATE(),
    UltimoAcceso      DATETIME     NULL,
    CONSTRAINT FK_PACIENTE_AUTH_PACIENTE FOREIGN KEY (PacienteID) REFERENCES PACIENTE(PacienteID)
);
GO

-- ============================================================================
-- SECCIÓN 6: PORTAL PÚBLICO - RESERVAS WEB
-- ============================================================================

-- 6.1 RESERVA_WEB
-- Solicitud de cita iniciada desde el portal público por el paciente.
-- Puede convertirse en una CITA formal una vez confirmada.
CREATE TABLE RESERVA_WEB (
    ReservaID        INT          IDENTITY(1,1) PRIMARY KEY,
    -- Datos del solicitante (puede ser paciente registrado o no)
    PacienteID       INT          NULL,          -- NULL si aún no está registrado
    NombreSolicitante VARCHAR(250) NOT NULL,
    DNISolicitante   VARCHAR(20)  NOT NULL,
    EmailSolicitante VARCHAR(100) NOT NULL,
    TelefonoSolicitante VARCHAR(20) NULL,
    DireccionSolicitante VARCHAR(250) NULL,      -- Para crear PACIENTE al convertir
    FechaNacimientoSolicitante DATE NULL,        -- Para crear PACIENTE al convertir
    GeneroSolicitante VARCHAR(20) NULL
        CONSTRAINT CK_RESERVA_GENERO CHECK (GeneroSolicitante IN ('Masculino', 'Femenino', 'Otro', NULL)),
    -- Datos de la solicitud
    EspecialidadID   INT          NOT NULL,
    MedicoID         INT          NULL,          -- Puede no elegir médico específico
    FechaHoraDeseada DATETIME     NOT NULL,
    MotivoConsulta   TEXT         NULL,
    -- Estado y trazabilidad
    Estado           VARCHAR(30)  NOT NULL DEFAULT 'Pendiente'
        CONSTRAINT CK_RESERVA_ESTADO CHECK (Estado IN ('Pendiente', 'Confirmada', 'Rechazada', 'Convertida', 'Cancelada')),
    AceptaTerminos   BIT          NOT NULL DEFAULT 0,
    CitaID           INT          NULL,          -- Referencia a la cita creada tras confirmar
    FechaSolicitud   DATETIME     NOT NULL DEFAULT GETDATE(),
    FechaRespuesta   DATETIME     NULL,
    ObservacionAdmin VARCHAR(500) NULL,
    CONSTRAINT FK_RESERVA_PACIENTE    FOREIGN KEY (PacienteID)    REFERENCES PACIENTE(PacienteID),
    CONSTRAINT FK_RESERVA_ESPECIALIDAD FOREIGN KEY (EspecialidadID) REFERENCES ESPECIALIDAD(EspecialidadID),
    CONSTRAINT FK_RESERVA_MEDICO      FOREIGN KEY (MedicoID)      REFERENCES MEDICO(MedicoID)
);
GO

-- ============================================================================
-- SECCIÓN 7: CITAS MÉDICAS
-- ============================================================================

-- 7.1 CITA
-- Cita médica formal, creada por el administrativo o desde una reserva web.
CREATE TABLE CITA (
    CitaID         INT          IDENTITY(1,1) PRIMARY KEY,
    PacienteID     INT          NOT NULL,
    MedicoID       INT          NOT NULL,
    EspecialidadID INT          NOT NULL,
    UbicacionID    INT          NULL,            -- Consultorio asignado
    ReservaID      INT          NULL,            -- Reserva web de origen, si aplica
    FechaHora      DATETIME     NOT NULL,
    DuracionMinutos INT         NOT NULL DEFAULT 30,
    EstadoCita     VARCHAR(30)  NOT NULL DEFAULT 'Programada'
        CONSTRAINT CK_CITA_ESTADO CHECK (EstadoCita IN ('Programada', 'Confirmada', 'En curso', 'Completada', 'Cancelada', 'No asistió')),
    MotivoConsulta TEXT         NULL,
    Observaciones  TEXT         NULL,
    FechaCreacion  DATETIME     NOT NULL DEFAULT GETDATE(),
    CreadoPorUsuarioID INT      NULL,            -- Quién la creó en el sistema
    CONSTRAINT FK_CITA_PACIENTE    FOREIGN KEY (PacienteID)    REFERENCES PACIENTE(PacienteID),
    CONSTRAINT FK_CITA_MEDICO      FOREIGN KEY (MedicoID)      REFERENCES MEDICO(MedicoID),
    CONSTRAINT FK_CITA_ESPECIALIDAD FOREIGN KEY (EspecialidadID) REFERENCES ESPECIALIDAD(EspecialidadID),
    CONSTRAINT FK_CITA_UBICACION   FOREIGN KEY (UbicacionID)   REFERENCES UBICACION_FISICA(UbicacionID),
    CONSTRAINT FK_CITA_RESERVA     FOREIGN KEY (ReservaID)     REFERENCES RESERVA_WEB(ReservaID),
    CONSTRAINT FK_CITA_CREADOR     FOREIGN KEY (CreadoPorUsuarioID) REFERENCES USUARIO(UsuarioID)
);
GO

-- Ahora que CITA existe, podemos agregar la FK de RESERVA_WEB → CITA
ALTER TABLE RESERVA_WEB
    ADD CONSTRAINT FK_RESERVA_CITA FOREIGN KEY (CitaID) REFERENCES CITA(CitaID);
GO

-- ============================================================================
-- SECCIÓN 8: ADMISIONES Y HOSPITALIZACIÓN
-- ============================================================================

-- 8.1 ADMISION
-- Registro de hospitalización. Es el módulo más complejo del sistema.
CREATE TABLE ADMISION (
    AdmisionID     INT          IDENTITY(1,1) PRIMARY KEY,
    PacienteID     INT          NOT NULL,
    MedicoID       INT          NOT NULL,        -- Médico tratante
    EnfermeroID    INT          NULL,            -- Enfermero/a asignado/a
    HabitacionID   INT          NOT NULL,
    CitaID         INT          NULL,            -- Cita que originó la admisión, si aplica
    -- Datos del ingreso
    FechaIngreso   DATETIME     NOT NULL DEFAULT GETDATE(),
    MotivoIngreso  TEXT         NOT NULL,
    DiagnosticoIngreso TEXT     NULL,
    -- Datos del alta
    FechaAlta      DATETIME     NULL,
    DiagnosticoAlta TEXT        NULL,
    TipoAlta       VARCHAR(50)  NULL
        CONSTRAINT CK_ADMISION_TIPO_ALTA CHECK (TipoAlta IN ('Voluntaria', 'Médica', 'Traslado', 'Defunción', NULL)),
    -- Estado
    Estado         VARCHAR(30)  NOT NULL DEFAULT 'Activa'
        CONSTRAINT CK_ADMISION_ESTADO CHECK (Estado IN ('Activa', 'Alta', 'Trasladado')),
    Observaciones  TEXT         NULL,
    FechaCreacion  DATETIME     NOT NULL DEFAULT GETDATE(),
    CreadoPorUsuarioID INT      NULL,
    CONSTRAINT FK_ADMISION_PACIENTE    FOREIGN KEY (PacienteID)   REFERENCES PACIENTE(PacienteID),
    CONSTRAINT FK_ADMISION_MEDICO      FOREIGN KEY (MedicoID)     REFERENCES MEDICO(MedicoID),
    CONSTRAINT FK_ADMISION_ENFERMERO   FOREIGN KEY (EnfermeroID)  REFERENCES ENFERMERO(EnfermeroID),
    CONSTRAINT FK_ADMISION_HABITACION  FOREIGN KEY (HabitacionID) REFERENCES HABITACION(HabitacionID),
    CONSTRAINT FK_ADMISION_CITA        FOREIGN KEY (CitaID)       REFERENCES CITA(CitaID),
    CONSTRAINT FK_ADMISION_CREADOR     FOREIGN KEY (CreadoPorUsuarioID) REFERENCES USUARIO(UsuarioID)
);
GO

-- ============================================================================
-- SECCIÓN 9: HISTORIA CLÍNICA
-- ============================================================================

-- 9.1 HISTORIA_CLINICA
-- Cada registro representa una atención médica documentada.
-- Puede estar vinculada a una cita o a una admisión.
CREATE TABLE HISTORIA_CLINICA (
    HistorialID    INT          IDENTITY(1,1) PRIMARY KEY,
    PacienteID     INT          NOT NULL,
    MedicoID       INT          NOT NULL,
    CitaID         INT          NULL,            -- Si viene de una cita ambulatoria
    AdmisionID     INT          NULL,            -- Si viene de una hospitalización
    -- Contenido clínico
    Anamnesis      TEXT         NULL,            -- Descripción del paciente
    Diagnostico    TEXT         NOT NULL,
    Tratamiento    TEXT         NOT NULL,
    Prescripcion   TEXT         NULL,            -- Medicamentos indicados
    Observaciones  TEXT         NULL,
    FechaRegistro  DATETIME     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_HISTORIA_PACIENTE  FOREIGN KEY (PacienteID)  REFERENCES PACIENTE(PacienteID),
    CONSTRAINT FK_HISTORIA_MEDICO    FOREIGN KEY (MedicoID)    REFERENCES MEDICO(MedicoID),
    CONSTRAINT FK_HISTORIA_CITA      FOREIGN KEY (CitaID)      REFERENCES CITA(CitaID),
    CONSTRAINT FK_HISTORIA_ADMISION  FOREIGN KEY (AdmisionID)  REFERENCES ADMISION(AdmisionID)
);
GO

-- 9.2 DOCUMENTO_ADJUNTO
-- Archivos adjuntos a un historial (PDFs, imágenes, resultados de lab, etc.).
CREATE TABLE DOCUMENTO_ADJUNTO (
    DocumentoID  INT          IDENTITY(1,1) PRIMARY KEY,
    HistorialID  INT          NOT NULL,
    BlobURL      VARCHAR(500) NOT NULL,
    NombreArchivo VARCHAR(200) NOT NULL,
    TipoArchivo  VARCHAR(50)  NOT NULL
        CONSTRAINT CK_DOCUMENTO_TIPO CHECK (TipoArchivo IN ('PDF', 'JPEG', 'PNG', 'DICOM', 'DOC', 'XLSX', 'Otro')),
    TamanoKB     INT          NULL,
    Descripcion  VARCHAR(255) NULL,
    FechaSubida  DATETIME     NOT NULL DEFAULT GETDATE(),
    SubidoPorUsuarioID INT    NULL,
    CONSTRAINT FK_DOCUMENTO_HISTORIAL FOREIGN KEY (HistorialID) REFERENCES HISTORIA_CLINICA(HistorialID) ON DELETE CASCADE,
    CONSTRAINT FK_DOCUMENTO_USUARIO   FOREIGN KEY (SubidoPorUsuarioID) REFERENCES USUARIO(UsuarioID)
);
GO

-- ============================================================================
-- SECCIÓN 10: VISTAS PARA EL DASHBOARD Y CONSULTAS FRECUENTES
-- ============================================================================

-- 10.1 Vista: Resumen de médicos activos con su especialidad y departamento
CREATE VIEW VW_MEDICOS_ACTIVOS AS
SELECT
    m.MedicoID,
    u.Nombre + ' ' + u.Apellido   AS NombreCompleto,
    u.Email,
    u.Telefono,
    e.NombreEspecialidad           AS Especialidad,
    d.Nombre                       AS Departamento,
    c.Nombre                       AS Clinica,
    m.NumeroColegiatura
FROM MEDICO m
INNER JOIN USUARIO      u ON m.UsuarioID      = u.UsuarioID
INNER JOIN ESPECIALIDAD e ON m.EspecialidadID  = e.EspecialidadID
INNER JOIN DEPARTAMENTO d ON m.DepartamentoID  = d.DepartamentoID
INNER JOIN CLINICA      c ON u.ClinicalID      = c.ClinicalID
WHERE m.Activo = 1 AND u.Activo = 1;
GO

-- 10.2 Vista: Resumen de enfermeros activos
CREATE VIEW VW_ENFERMEROS_ACTIVOS AS
SELECT
    en.EnfermeroID,
    u.Nombre + ' ' + u.Apellido  AS NombreCompleto,
    u.Email,
    u.Telefono,
    d.Nombre                      AS Departamento,
    c.Nombre                      AS Clinica,
    en.NumeroLicencia,
    en.Turno
FROM ENFERMERO  en
INNER JOIN USUARIO      u  ON en.UsuarioID      = u.UsuarioID
INNER JOIN DEPARTAMENTO d  ON en.DepartamentoID  = d.DepartamentoID
INNER JOIN CLINICA      c  ON u.ClinicalID       = c.ClinicalID
WHERE en.Activo = 1 AND u.Activo = 1;
GO

-- 10.3 Vista: Citas del día con detalle de paciente y médico
CREATE VIEW VW_CITAS_HOY AS
SELECT
    ci.CitaID,
    CAST(ci.FechaHora AS DATE)              AS Fecha,
    CAST(ci.FechaHora AS TIME)              AS Hora,
    p.Nombre + ' ' + p.Apellido             AS Paciente,
    p.DNI                                   AS DNIPaciente,
    u.Nombre + ' ' + u.Apellido             AS Medico,
    e.NombreEspecialidad                    AS Especialidad,
    uf.Nombre                               AS Consultorio,
    ci.EstadoCita,
    ci.MotivoConsulta
FROM CITA ci
INNER JOIN PACIENTE     p  ON ci.PacienteID     = p.PacienteID
INNER JOIN MEDICO       m  ON ci.MedicoID       = m.MedicoID
INNER JOIN USUARIO      u  ON m.UsuarioID       = u.UsuarioID
INNER JOIN ESPECIALIDAD e  ON ci.EspecialidadID = e.EspecialidadID
LEFT  JOIN UBICACION_FISICA uf ON ci.UbicacionID = uf.UbicacionID
WHERE CAST(ci.FechaHora AS DATE) = CAST(GETDATE() AS DATE);
GO

-- 10.4 Vista: Admisiones activas con detalle completo
CREATE VIEW VW_ADMISIONES_ACTIVAS AS
SELECT
    a.AdmisionID,
    p.Nombre + ' ' + p.Apellido         AS Paciente,
    p.DNI                               AS DNIPaciente,
    p.GrupoSanguineo,
    um.Nombre + ' ' + um.Apellido       AS MedicoTratante,
    ue.Nombre + ' ' + ue.Apellido       AS Enfermero,
    h.Numero                            AS NumeroHabitacion,
    h.Tipo                              AS TipoHabitacion,
    d.Nombre                            AS Departamento,
    a.FechaIngreso,
    DATEDIFF(DAY, a.FechaIngreso, GETDATE()) AS DiasInternado,
    a.MotivoIngreso,
    a.Estado
FROM ADMISION  a
INNER JOIN PACIENTE     p   ON a.PacienteID   = p.PacienteID
INNER JOIN MEDICO       m   ON a.MedicoID     = m.MedicoID
INNER JOIN USUARIO      um  ON m.UsuarioID    = um.UsuarioID
LEFT  JOIN ENFERMERO    en  ON a.EnfermeroID  = en.EnfermeroID
LEFT  JOIN USUARIO      ue  ON en.UsuarioID   = ue.UsuarioID
INNER JOIN HABITACION   h   ON a.HabitacionID = h.HabitacionID
INNER JOIN DEPARTAMENTO d   ON h.DepartamentoID = d.DepartamentoID
WHERE a.Estado = 'Activa';
GO

-- 10.5 Vista: Habitaciones disponibles
CREATE VIEW VW_HABITACIONES_DISPONIBLES AS
SELECT
    h.HabitacionID,
    h.Numero,
    h.Piso,
    h.Tipo,
    h.Capacidad,
    h.Estado,
    d.Nombre  AS Departamento,
    c.Nombre  AS Clinica
FROM HABITACION   h
INNER JOIN DEPARTAMENTO d ON h.DepartamentoID = d.DepartamentoID
INNER JOIN CLINICA      c ON d.ClinicalID     = c.ClinicalID
WHERE h.Estado = 'Disponible';
GO

-- 10.6 Vista: Métricas para el Dashboard (por clínica)
CREATE VIEW VW_DASHBOARD_METRICAS AS
SELECT
    c.ClinicalID,
    c.Nombre                                                        AS Clinica,
    (SELECT COUNT(*) FROM MEDICO    m
     INNER JOIN USUARIO u ON m.UsuarioID = u.UsuarioID
     WHERE u.ClinicalID = c.ClinicalID AND m.Activo = 1)           AS TotalMedicos,
    (SELECT COUNT(*) FROM ENFERMERO en
     INNER JOIN USUARIO u ON en.UsuarioID = u.UsuarioID
     WHERE u.ClinicalID = c.ClinicalID AND en.Activo = 1)          AS TotalEnfermeros,
    (SELECT COUNT(*) FROM PACIENTE  p
     WHERE p.ClinicalID = c.ClinicalID AND p.Activo = 1)           AS TotalPacientes,
    (SELECT COUNT(*) FROM HABITACION h
     INNER JOIN DEPARTAMENTO d ON h.DepartamentoID = d.DepartamentoID
     WHERE d.ClinicalID = c.ClinicalID)                            AS TotalHabitaciones,
    (SELECT COUNT(*) FROM HABITACION h
     INNER JOIN DEPARTAMENTO d ON h.DepartamentoID = d.DepartamentoID
     WHERE d.ClinicalID = c.ClinicalID AND h.Estado = 'Disponible') AS HabitacionesDisponibles,
    (SELECT COUNT(*) FROM ADMISION a
     INNER JOIN PACIENTE p ON a.PacienteID = p.PacienteID
     WHERE p.ClinicalID = c.ClinicalID AND a.Estado = 'Activa')    AS PacientesHospitalizados,
    (SELECT COUNT(*) FROM CITA ci
     INNER JOIN PACIENTE p ON ci.PacienteID = p.PacienteID
     WHERE p.ClinicalID = c.ClinicalID
       AND CAST(ci.FechaHora AS DATE) = CAST(GETDATE() AS DATE))   AS CitasHoy,
    (SELECT COUNT(*) FROM RESERVA_WEB rw
     INNER JOIN ESPECIALIDAD e ON rw.EspecialidadID = e.EspecialidadID
     WHERE rw.Estado = 'Pendiente')                                 AS ReservasPendientes
FROM CLINICA c
WHERE c.Activo = 1;
GO

-- ============================================================================
-- FIN DEL SCRIPT - Ejecutar seed_data.sql para cargar datos de prueba
-- ============================================================================

-- ============================================================================
-- SEED DATA - SISTEMA CLINIX
-- Ejecutar DESPUÉS de init.sql sobre BD vacía
-- Orden: respetar FKs (insertar padres antes que hijos)
-- ============================================================================
USE Clinix;
GO

-- ============================================================================
-- 1. CLÍNICAS
-- ============================================================================
INSERT INTO CLINICA (Nombre, RUC, Direccion, Telefono, Email, PlanSuscripcion) VALUES
('Clínica San Pablo',       '20123456789', 'Av. Guardia Civil 337, San Borja, Lima',       '(01) 224-2224', 'contacto@sanpablo.com.pe',   'Premium'),
('Clínica Internacional',   '20987654321', 'Av. Garcilazo de la Vega 1420, Lima Centro',   '(01) 619-6161', 'contacto@clinicaint.com.pe',  'Standard'),
('Clínica El Golf',         '20456789123', 'Av. Aurelio Miro Quesada 1030, San Isidro',    '(01) 264-3320', 'contacto@clinicaelgolf.com',  'Basic');
GO

-- ============================================================================
-- 2. ESPECIALIDADES
-- ============================================================================
INSERT INTO ESPECIALIDAD (NombreEspecialidad, Descripcion) VALUES
('Cardiología',         'Diagnóstico y tratamiento de enfermedades del corazón'),
('Neurología',          'Diagnóstico y tratamiento de enfermedades del sistema nervioso'),
('Pediatría General',   'Atención médica para niños y adolescentes'),
('Traumatología',       'Diagnóstico y tratamiento del sistema músculo-esquelético'),
('Ginecología',         'Salud del sistema reproductor femenino'),
('Oncología',           'Diagnóstico y tratamiento del cáncer'),
('Medicina General',    'Atención primaria y preventiva'),
('Dermatología',        'Diagnóstico y tratamiento de enfermedades de la piel'),
('Oftalmología',        'Diagnóstico y tratamiento de enfermedades oculares'),
('Psicología',          'Salud mental y bienestar emocional');
GO

-- ============================================================================
-- 3. ROLES
-- ============================================================================
INSERT INTO ROLE (NombreRole) VALUES
('Administrador'),
('Médico'),
('Enfermero'),
('Recepcionista');
GO

-- ============================================================================
-- 4. DEPARTAMENTOS
-- ============================================================================
INSERT INTO DEPARTAMENTO (ClinicalID, Nombre, Descripcion) VALUES
(1, 'Cardiovascular',   'Área de cardiología e intervención cardíaca'),
(1, 'Neurología',       'Área de enfermedades neurológicas'),
(1, 'Pediatría',        'Área de atención pediátrica'),
(2, 'Traumatología',    'Área de cirugía y trauma ortopédico'),
(2, 'Ginecología',      'Área de salud femenina'),
(3, 'Medicina General', 'Consultas generales y emergencias menores'),
(1, 'Oncología',        'Área de diagnóstico y tratamiento oncológico'),
(2, 'Dermatología',     'Área de enfermedades de la piel'),
(1, 'Oftalmología',     'Área de salud ocular y cirugía de ojos'),
(3, 'Psicología',       'Área de salud mental y consejería psicológica');
GO

-- ============================================================================
-- 5. UBICACIONES FÍSICAS
-- ============================================================================
INSERT INTO UBICACION_FISICA (DepartamentoID, Nombre, Tipo, Piso) VALUES
(1, 'Consultorio 101',          'Consultorio',  '1'),
(1, 'Sala de Operaciones A',    'Operaciones',  '2'),
(2, 'Consultorio 201',          'Consultorio',  '2'),
(3, 'Consultorio Pediatría 1',  'Consultorio',  '1'),
(3, 'Emergencias Pediátricas',  'Emergencias',  '1'),
(4, 'Consultorio Trauma 1',     'Consultorio',  '3'),
(5, 'Consultorio Gine 1',       'Consultorio',  '3'),
(6, 'Consultorio MG 1',         'Consultorio',  '1'),
(7, 'Consultorio Oncología 1',  'Consultorio',  '4'),
(6, 'Consultorio MG 2',         'Consultorio',  '1'),
(6, 'Emergencias Generales',    'Emergencias',  '1'),
(8, 'Consultorio Dermatología 1','Consultorio', '2'),
(9, 'Consultorio Oftalmología 1','Consultorio', '3'),
(9, 'Sala de Exámenes Visuales', 'Consultorio', '3'),
(10,'Consultorio Psicología 1',  'Consultorio', '1'),
(10,'Consultorio Psicología 2',  'Consultorio', '2');
GO

-- ============================================================================
-- 6. HABITACIONES
-- ============================================================================
INSERT INTO HABITACION (DepartamentoID, Numero, Piso, Tipo, Capacidad, Estado) VALUES
(1, '6025', '6', 'UCI',       2, 'Disponible'),
(1, '6026', '6', 'Privado',   1, 'Ocupada'),
(1, '6027', '6', 'Privado',   1, 'Disponible'),
(3, '101',  '1', 'Pediatria', 4, 'Disponible'),
(3, '102',  '1', 'Neonatal',  2, 'Disponible'),
(4, '301',  '3', 'Post-op',   4, 'Mantenimiento'),
(4, '302',  '3', 'Compartido',2, 'Disponible'),
(5, '401',  '4', 'Privado',   1, 'Disponible');
GO

-- ============================================================================
-- 7. USUARIOS (personal de la clínica)
-- ============================================================================
INSERT INTO USUARIO (ClinicalID, RoleID, UbicacionID, Nombre, Apellido, DNI, Email, Telefono, PasswordHash) VALUES
-- Administradores
(1, 1, NULL, 'Carlos',   'Mendoza Ríos',   '40123456', 'carlos.admin@sanpablo.com',        '999111222', 'hash_pass_admin_1'),
(2, 1, NULL, 'Sandra',   'Flores Huamán',  '41123456', 'sandra.admin@clinicaint.com',       '998111222', 'hash_pass_admin_2'),
-- Recepcionista
(1, 4, 1,    'Roberto',  'Sánchez Díaz',   '40567890', 'roberto.sanchez@sanpablo.com',      '999555666', 'hash_pass_rec_1'),
-- Médicos originales
(1, 2, 1,    'Alberto',  'Rivera Salas',   '40234567', 'alberto.rivera@sanpablo.com',       '999222333', 'hash_pass_med_1'),
(1, 2, 3,    'Patricia', 'Vega Montes',    '40345678', 'patricia.vega@sanpablo.com',        '999333444', 'hash_pass_med_2'),
(2, 2, 7,    'Elena',    'Torres Cabrera', '41234567', 'elena.torres@clinicaint.com',       '998222333', 'hash_pass_med_3'),
-- Nuevos médicos
(1, 2, 4,    'Fernando', 'López Castillo',  '40678901', 'fernando.lopez@sanpablo.com',      '999666777', 'hash_pass_med_4'),
(2, 2, 6,    'Ricardo',  'Álvarez Guerra',  '41456789', 'ricardo.alvarez@clinicaint.com',   '998444555', 'hash_pass_med_5'),
(1, 2, 9,    'Carmen',   'Reyes Palomino',  '40789012', 'carmen.reyes@sanpablo.com',       '999777888', 'hash_pass_med_6'),
(3, 2, 10,   'Luis',     'Mendoza Paredes', '42123456', 'luis.mendoza@elgolf.com',          '997111222', 'hash_pass_med_7'),
(1, 2, 1,    'Diana',    'Huamán Salazar',  '40890123', 'diana.huaman@sanpablo.com',        '999888999', 'hash_pass_med_8'),
(1, 2, 3,    'Javier',   'Castro Núñez',    '40901234', 'javier.castro@sanpablo.com',       '999000111', 'hash_pass_med_9'),
(2, 2, 12,   'Marco',    'Guerra Silva',    '41678901', 'marco.guerra@clinicaint.com',      '998666777', 'hash_pass_med_10'),
(1, 2, NULL, 'Silvia',   'Ramos Pineda',    '41789012', 'silvia.ramos@sanpablo.com',        '999222444', 'hash_pass_med_11'),
(1, 2, 13,   'Hugo',     'Salinas Torres',  '41890123', 'hugo.salinas@sanpablo.com',        '999333555', 'hash_pass_med_12'),
(2, 2, NULL, 'Claudia',  'Mori Vargas',     '41901234', 'claudia.mori@clinicaint.com',      '998777888', 'hash_pass_med_13'),
(3, 2, 15,   'Raúl',     'Pizarro Delgado', '42012345', 'raul.pizarro@elgolf.com',          '997222333', 'hash_pass_med_14'),
(3, 2, 16,   'Verónica', 'Linares Cruz',    '42123457', 'veronica.linares@elgolf.com',      '997333444', 'hash_pass_med_15'),
(1, 2, 4,    'Miguel',   'Córdova Ríos',    '42234567', 'miguel.cordova@sanpablo.com',      '999444666', 'hash_pass_med_16'),
(2, 2, 6,    'Beatriz',  'Solís Huerta',    '42345678', 'beatriz.solis@clinicaint.com',     '998888999', 'hash_pass_med_17'),
(3, 2, 10,   'Tomás',    'Guerrero Meza',   '42456789', 'tomas.guerrero@elgolf.com',        '997444555', 'hash_pass_med_18'),
(1, 2, 1,    'Paola',    'Cárdenas Vega',   '42567890', 'paola.cardenas@sanpablo.com',      '999555777', 'hash_pass_med_19'),
(2, 2, 7,    'Lorena',   'Ponte Sánchez',   '42678901', 'lorena.ponte@clinicaint.com',      '998999000', 'hash_pass_med_20'),
(1, 2, 3,    'Daniel',   'Zambrano Gil',    '42789012', 'daniel.zambrano@sanpablo.com',     '999666888', 'hash_pass_med_21'),
(1, 2, 9,    'Andrea',   'Quispe Tapia',    '42890123', 'andrea.quispe@sanpablo.com',       '999777999', 'hash_pass_med_22'),
-- Enfermeros originales
(1, 3, 2,    'María',    'Gómez Paredes',   '40456789', 'maria.gomez@sanpablo.com',         '999444555', 'hash_pass_enf_1'),
(2, 3, 6,    'Jorge',    'Quispe Luna',     '41345678', 'jorge.quispe@clinicaint.com',      '998333444', 'hash_pass_enf_2'),
-- Enfermeros nuevos
(1, 3, 2,    'Rosa',     'Mamani Quispe',   '41012345', 'rosa.mamani@sanpablo.com',         '999111333', 'hash_pass_enf_3'),
(2, 3, 6,    'Pedro',    'Gutiérrez Ríos',  '41567890', 'pedro.gutierrez@clinicaint.com',   '998555666', 'hash_pass_enf_4');
GO

-- Mapa de UsuarioIDs (orden de inserción):
--  1=Carlos(Admin), 2=Sandra(Admin), 3=Roberto(Recep)
--  4=Alberto(Rivera-Cardio), 5=Patricia(Vega-Neuro), 6=Elena(Torres-Gineco)
--  7=Fernando(López-Ped), 8=Ricardo(Álvarez-Traum), 9=Carmen(Reyes-Onco)
--  10=Luis(Mendoza-MG), 11=Diana(Huamán-Cardio), 12=Javier(Castro-Neuro)
--  13=Marco(Guerra-Derma), 14=Silvia(Ramos-Derma), 15=Hugo(Salinas-Oftal)
--  16=Claudia(Mori-Oftal), 17=Raúl(Pizarro-Psico), 18=Verónica(Linares-Psico)
--  19=Miguel(Córdova-Ped), 20=Beatriz(Solís-Traum), 21=Tomás(Guerrero-MG)
--  22=Paola(Cárdenas-Cardio), 23=Lorena(Ponte-Gineco), 24=Daniel(Zambrano-Neuro)
--  25=Andrea(Quispe-Onco)
--  26=María(Gómez-Enf), 27=Jorge(Quispe-Enf), 28=Rosa(Mamani-Enf), 29=Pedro(Gutiérrez-Enf)

-- ============================================================================
-- 8. MÉDICOS
-- ============================================================================
INSERT INTO MEDICO (UsuarioID, EspecialidadID, DepartamentoID, NumeroColegiatura) VALUES
(4, 1, 1,  'CMP-45678'),   -- ID 1: Dr. Rivera     → Cardiología
(5, 2, 2,  'CMP-56789'),   -- ID 2: Dra. Vega      → Neurología
(6, 5, 5,  'CMP-78912'),   -- ID 3: Dra. Torres    → Ginecología
(7, 3, 3,  'CMP-67890'),   -- ID 4: Dr. López      → Pediatría
(8, 4, 4,  'CMP-89012'),   -- ID 5: Dr. Álvarez    → Traumatología
(9, 6, 7,  'CMP-90123'),   -- ID 6: Dra. Reyes     → Oncología
(10,7, 6,  'CMP-01234'),   -- ID 7: Dr. Mendoza    → Medicina General
(11,1, 1,  'CMP-12345'),   -- ID 8: Dra. Huamán    → Cardiología
(12,2, 2,  'CMP-23456'),   -- ID 9: Dr. Castro     → Neurología
(13,8, 8,  'CMP-34567'),   -- ID 10: Dr. Guerra    → Dermatología
(14,8, 8,  'CMP-45678_2'), -- ID 11: Dra. Ramos    → Dermatología
(15,9, 9,  'CMP-56789_2'), -- ID 12: Dr. Salinas   → Oftalmología
(16,9, 9,  'CMP-67891'),   -- ID 13: Dra. Mori     → Oftalmología
(17,10,10, 'CMP-78901'),   -- ID 14: Dr. Pizarro   → Psicología
(18,10,10, 'CMP-89012_2'), -- ID 15: Dra. Linares  → Psicología
(19,3, 3,  'CMP-90124'),   -- ID 16: Dr. Córdova   → Pediatría
(20,4, 4,  'CMP-01235'),   -- ID 17: Dra. Solís    → Traumatología
(21,7, 6,  'CMP-12346'),   -- ID 18: Dr. Guerrero  → Medicina General
(22,1, 1,  'CMP-23457'),   -- ID 19: Dra. Cárdenas → Cardiología
(23,5, 5,  'CMP-34568'),   -- ID 20: Dra. Ponte    → Ginecología
(24,2, 2,  'CMP-45679'),   -- ID 21: Dr. Zambrano  → Neurología
(25,6, 7,  'CMP-56780');   -- ID 22: Dra. Quispe   → Oncología
GO

-- ============================================================================
-- 9. HORARIOS (intervalo 60 min, patrones muy variados)
-- ============================================================================

-- [1] Dr. Rivera - Solo MAR y JUE 8-12
INSERT INTO HORARIO_MEDICO (MedicoID, DiaSemana, HoraInicio, HoraFin, IntervaloCitas) VALUES
(1, 2, '08:00', '12:00', 60), (1, 4, '08:00', '12:00', 60);
GO

-- [2] Dra. Vega - LUN, MIÉ, VIE 14-18
INSERT INTO HORARIO_MEDICO (MedicoID, DiaSemana, HoraInicio, HoraFin, IntervaloCitas) VALUES
(2, 1, '14:00', '18:00', 60), (2, 3, '14:00', '18:00', 60), (2, 5, '14:00', '18:00', 60);
GO

-- [3] Dra. Torres - LUN a VIE 9-13 (clásico)
INSERT INTO HORARIO_MEDICO (MedicoID, DiaSemana, HoraInicio, HoraFin, IntervaloCitas) VALUES
(3, 1, '09:00', '13:00', 60), (3, 2, '09:00', '13:00', 60), (3, 3, '09:00', '13:00', 60),
(3, 4, '09:00', '13:00', 60), (3, 5, '09:00', '13:00', 60);
GO

-- [4] Dr. López - Solo MIÉ 8-16
INSERT INTO HORARIO_MEDICO (MedicoID, DiaSemana, HoraInicio, HoraFin, IntervaloCitas) VALUES
(4, 3, '08:00', '16:00', 60);
GO

-- [5] Dr. Álvarez - LUN, MIÉ, VIE 14-20
INSERT INTO HORARIO_MEDICO (MedicoID, DiaSemana, HoraInicio, HoraFin, IntervaloCitas) VALUES
(5, 1, '14:00', '20:00', 60), (5, 3, '14:00', '20:00', 60), (5, 5, '14:00', '20:00', 60);
GO

-- [6] Dra. Reyes - MAR y JUE 17-22 (noche)
INSERT INTO HORARIO_MEDICO (MedicoID, DiaSemana, HoraInicio, HoraFin, IntervaloCitas) VALUES
(6, 2, '17:00', '22:00', 60), (6, 4, '17:00', '22:00', 60);
GO

-- [7] Dr. Mendoza - LUN a VIE 8-12
INSERT INTO HORARIO_MEDICO (MedicoID, DiaSemana, HoraInicio, HoraFin, IntervaloCitas) VALUES
(7, 1, '08:00', '12:00', 60), (7, 2, '08:00', '12:00', 60), (7, 3, '08:00', '12:00', 60),
(7, 4, '08:00', '12:00', 60), (7, 5, '08:00', '12:00', 60);
GO

-- [8] Dra. Huamán - Solo SÁB 8-16
INSERT INTO HORARIO_MEDICO (MedicoID, DiaSemana, HoraInicio, HoraFin, IntervaloCitas) VALUES
(8, 6, '08:00', '16:00', 60);
GO

-- [9] Dr. Castro - Solo DOM 8-14
INSERT INTO HORARIO_MEDICO (MedicoID, DiaSemana, HoraInicio, HoraFin, IntervaloCitas) VALUES
(9, 7, '08:00', '14:00', 60);
GO

-- [10] Dr. Guerra - MAR y JUE 18-22
INSERT INTO HORARIO_MEDICO (MedicoID, DiaSemana, HoraInicio, HoraFin, IntervaloCitas) VALUES
(10, 2, '18:00', '22:00', 60), (10, 4, '18:00', '22:00', 60);
GO

-- [11] Dra. Ramos - LUN, MIÉ, VIE 7-9 (early bird)
INSERT INTO HORARIO_MEDICO (MedicoID, DiaSemana, HoraInicio, HoraFin, IntervaloCitas) VALUES
(11, 1, '07:00', '09:00', 60), (11, 3, '07:00', '09:00', 60), (11, 5, '07:00', '09:00', 60);
GO

-- [12] Dr. Salinas - SÁB y DOM 9-17 (finde)
INSERT INTO HORARIO_MEDICO (MedicoID, DiaSemana, HoraInicio, HoraFin, IntervaloCitas) VALUES
(12, 6, '09:00', '17:00', 60), (12, 7, '09:00', '17:00', 60);
GO

-- [13] Dra. Mori - Solo MAR 8-18 (jornada extendida)
INSERT INTO HORARIO_MEDICO (MedicoID, DiaSemana, HoraInicio, HoraFin, IntervaloCitas) VALUES
(13, 2, '08:00', '18:00', 60);
GO

-- [14] Dr. Pizarro - LUN, MIÉ, VIE 18-22 (noche)
INSERT INTO HORARIO_MEDICO (MedicoID, DiaSemana, HoraInicio, HoraFin, IntervaloCitas) VALUES
(14, 1, '18:00', '22:00', 60), (14, 3, '18:00', '22:00', 60), (14, 5, '18:00', '22:00', 60);
GO

-- [15] Dra. Linares - Solo SÁB 8-12
INSERT INTO HORARIO_MEDICO (MedicoID, DiaSemana, HoraInicio, HoraFin, IntervaloCitas) VALUES
(15, 6, '08:00', '12:00', 60);
GO

-- [16] Dr. Córdova - LUN a VIE 22-02 (trasnoche)
INSERT INTO HORARIO_MEDICO (MedicoID, DiaSemana, HoraInicio, HoraFin, IntervaloCitas) VALUES
(16, 1, '22:00', '23:59', 60), (16, 2, '00:00', '02:00', 60),
(16, 2, '22:00', '23:59', 60), (16, 3, '00:00', '02:00', 60),
(16, 3, '22:00', '23:59', 60), (16, 4, '00:00', '02:00', 60),
(16, 4, '22:00', '23:59', 60), (16, 5, '00:00', '02:00', 60),
(16, 5, '22:00', '23:59', 60), (16, 6, '00:00', '02:00', 60);
GO

-- [17] Dra. Solís - LUN-MIÉ 6-10 + JUE-VIE 16-20 (mixto)
INSERT INTO HORARIO_MEDICO (MedicoID, DiaSemana, HoraInicio, HoraFin, IntervaloCitas) VALUES
(17, 1, '06:00', '10:00', 60), (17, 2, '06:00', '10:00', 60), (17, 3, '06:00', '10:00', 60),
(17, 4, '16:00', '20:00', 60), (17, 5, '16:00', '20:00', 60);
GO

-- [18] Dr. Guerrero - MIÉ-JUE 8-12 + SÁB 14-18
INSERT INTO HORARIO_MEDICO (MedicoID, DiaSemana, HoraInicio, HoraFin, IntervaloCitas) VALUES
(18, 3, '08:00', '12:00', 60), (18, 4, '08:00', '12:00', 60), (18, 6, '14:00', '18:00', 60);
GO

-- [19] Dra. Cárdenas - LUN y VIE 10-14
INSERT INTO HORARIO_MEDICO (MedicoID, DiaSemana, HoraInicio, HoraFin, IntervaloCitas) VALUES
(19, 1, '10:00', '14:00', 60), (19, 5, '10:00', '14:00', 60);
GO

-- [20] Dra. Ponte - JUE-VIE 17-21 + DOM 9-13
INSERT INTO HORARIO_MEDICO (MedicoID, DiaSemana, HoraInicio, HoraFin, IntervaloCitas) VALUES
(20, 4, '17:00', '21:00', 60), (20, 5, '17:00', '21:00', 60), (20, 7, '09:00', '13:00', 60);
GO

-- [21] Dr. Zambrano - LUN a VIE 13-17
INSERT INTO HORARIO_MEDICO (MedicoID, DiaSemana, HoraInicio, HoraFin, IntervaloCitas) VALUES
(21, 1, '13:00', '17:00', 60), (21, 2, '13:00', '17:00', 60), (21, 3, '13:00', '17:00', 60),
(21, 4, '13:00', '17:00', 60), (21, 5, '13:00', '17:00', 60);
GO

-- [22] Dra. Quispe - Solo MIÉ 14-20
INSERT INTO HORARIO_MEDICO (MedicoID, DiaSemana, HoraInicio, HoraFin, IntervaloCitas) VALUES
(22, 3, '14:00', '20:00', 60);
GO

-- ============================================================================
-- 10. ENFERMEROS
-- ============================================================================
INSERT INTO ENFERMERO (UsuarioID, DepartamentoID, NumeroLicencia, Turno) VALUES
(26, 1, 'CEP-12345', 'Mañana'),   -- María Gómez → Cardiovascular
(27, 4, 'CEP-67890', 'Tarde'),    -- Jorge Quispe → Traumatología
(28, 3, 'CEP-23456', 'Mañana'),   -- Rosa Mamani  → Pediatría
(29, 4, 'CEP-78901', 'Noche');    -- Pedro Gutiérrez → Traumatología
GO

-- ============================================================================
-- 11. PACIENTES
-- ============================================================================
INSERT INTO PACIENTE (ClinicalID, DNI, Nombre, Apellido, FechaNacimiento, Genero, Direccion, Telefono, Email, GrupoSanguineo, Alergias) VALUES
(1, '44556677', 'Juan',     'Pérez García',    '1980-03-15', 'Masculino', 'Jr. Las Flores 234, Miraflores', '987654321', 'juan.perez@gmail.com',    'O+',  'Penicilina'),
(1, '88776655', 'Ana',      'Martínez López',  '1992-07-22', 'Femenino',  'Av. Brasil 890, Jesús María',    '976543210', 'ana.martinez@gmail.com',  'A+',  NULL),
(1, '55443322', 'Carlos',   'Herrera Pinto',   '1975-11-05', 'Masculino', 'Calle Los Pinos 12, Surco',      '965432109', 'carlos.herrera@gmail.com','B+',  'Aspirina'),
(2, '66778899', 'Lucía',    'Delgado Ruiz',    '1988-04-10', 'Femenino',  'Av. Universitaria 567, SMP',     '954321098', 'lucia.delgado@gmail.com', 'AB-', NULL),
(2, '11223344', 'Miguel',   'Castro Vargas',   '2010-08-30', 'Masculino', 'Jr. Lima 456, Callao',           '943210987', NULL,                      'O-',  'Ibuprofeno'),
(1, '33445566', 'María',    'Torres Luna',     '1995-02-14', 'Femenino',  'Jr. Las Orquídeas 432, San Isidro','998877665','maria.torres@gmail.com',   'A+',  'Sulfa'),
(1, '22334455', 'José',     'Rodríguez Silva', '1970-09-08', 'Masculino', 'Av. Arequipa 1560, Lince',       '987766554', 'jose.rodriguez@gmail.com','O+',  NULL),
(3, '77889900', 'Sofía',    'Castillo Marín',  '2005-12-20', 'Femenino',  'Calle Los Olivos 89, Magdalena', '976655443', 'sofia.castillo@gmail.com','B-',  'Penicilina'),
(1, '55667788', 'Andrés',   'Paredes Vega',    '1988-06-30', 'Masculino', 'Av. La Marina 2450, San Miguel','965544332', 'andres.paredes@gmail.com','AB+', NULL),
(2, '12345678', 'Gabriela', 'Montes Rivas',    '1990-11-25', 'Femenino',  'Jr. Los Claveles 88, Surquillo', '954433221', 'gabriela.montes@gmail.com','O-', 'Ibuprofeno');
GO

-- ============================================================================
-- 12. AUTENTICACIÓN PACIENTES (portal público)
-- ============================================================================
INSERT INTO PACIENTE_AUTH (PacienteID, Email, PasswordHash) VALUES
(1, 'juan.perez@gmail.com',    'hash_paciente_1'),
(2, 'ana.martinez@gmail.com',  'hash_paciente_2'),
(3, 'carlos.herrera@gmail.com','hash_paciente_3'),
(4, 'lucia.delgado@gmail.com', 'hash_paciente_4');
GO

-- ============================================================================
-- 13. RESERVAS WEB (portal público)
-- ============================================================================
INSERT INTO RESERVA_WEB (PacienteID, NombreSolicitante, DNISolicitante, EmailSolicitante, TelefonoSolicitante, EspecialidadID, MedicoID, FechaHoraDeseada, MotivoConsulta, Estado, AceptaTerminos) VALUES
(1, 'Juan Pérez García',   '44556677', 'juan.perez@gmail.com',    '987654321', 1, 1, '2026-06-25 09:00:00', 'Dolor en el pecho al hacer ejercicio',     'Pendiente',   1),
(4, 'Lucía Delgado Ruiz',  '66778899', 'lucia.delgado@gmail.com', '954321098', 5, 3, '2026-06-26 10:00:00', 'Control ginecológico de rutina',            'Confirmada',  1),
(NULL, 'Pedro Ríos Cano',  '99887766', 'pedro.rios@outlook.com',  '932109876', 7, NULL,'2026-06-27 11:00:00','Dolor de cabeza frecuente y mareos',       'Pendiente',   1);
GO

-- ============================================================================
-- 14. CITAS (ocupar slots específicos según cada horario)
-- ============================================================================
INSERT INTO CITA (PacienteID, MedicoID, EspecialidadID, UbicacionID, FechaHora, DuracionMinutos, EstadoCita, MotivoConsulta, CreadoPorUsuarioID) VALUES
(1, 1, 1, 1, '2026-06-23 09:00:00', 60, 'Programada', 'Control post-operatorio cardíaco',          1),
(2, 2, 2, 3, '2026-06-22 14:00:00', 60, 'Programada', 'Seguimiento de migraña crónica',            3),
(4, 1, 1, 1, '2026-06-25 09:00:00', 60, 'Confirmada', 'Dolor en el pecho recurrente',              3),
(10,3, 5, 7, '2026-06-22 09:00:00', 60, 'Programada', 'Control prenatal',                          2),
(6, 4, 3, 4, '2026-06-24 09:00:00', 60, 'Programada', 'Control pediátrico de rutina',              1),
(7, 5, 4, 6, '2026-06-26 16:00:00', 60, 'Programada', 'Dolor lumbar crónico',                      1),
(8, 6, 6, 9, '2026-06-23 18:00:00', 60, 'Programada', 'Quimioterapia de seguimiento',              1),
(9, 7, 7, 10,'2026-06-23 08:00:00', 60, 'Programada', 'Control de presión arterial',               1),
(10,8, 1, 1, '2026-06-27 09:00:00', 60, 'Programada', 'Electrocardiograma de control',             1),
(3, 9, 2, 3, '2026-06-28 09:00:00', 60, 'Programada', 'Evaluación de cefaleas persistentes',       3),
(3, 10,8,12, '2026-06-23 19:00:00', 60, 'Programada', 'Evaluación de lunar sospechoso',            1),
(5, 12,9,13, '2026-06-27 10:00:00', 60, 'Programada', 'Examen de vista anual',                     2),
(4, 14,10,15,'2026-06-22 19:00:00', 60, 'Programada', 'Sesión de terapia semanal',                 1),
(8, 18,7,10, '2026-06-24 08:00:00', 60, 'Programada', 'Chequeo general',                           1);
GO

-- ============================================================================
-- 15. ADMISIONES
-- ============================================================================
INSERT INTO ADMISION (PacienteID, MedicoID, EnfermeroID, HabitacionID, CitaID, FechaIngreso, MotivoIngreso, DiagnosticoIngreso, Estado, CreadoPorUsuarioID) VALUES
(1, 1, 1, 2, NULL, '2026-06-16 14:30:00', 'Dolor torácico agudo con elevación del ST', 'Infarto agudo de miocardio anterolateral', 'Activa', 1),
(3, 2, NULL, 7, NULL, '2026-06-17 08:00:00', 'Crisis convulsiva en casa', 'Epilepsia focal sintomática', 'Activa', 3);
GO

-- ============================================================================
-- 16. HISTORIA CLÍNICA
-- ============================================================================
INSERT INTO HISTORIA_CLINICA (PacienteID, MedicoID, CitaID, AdmisionID, Anamnesis, Diagnostico, Tratamiento, Prescripcion) VALUES
(1, 1, NULL, 1, 'Paciente masculino de 46 años, tabaquismo leve, sin antecedentes cardíacos previos.', 'Infarto agudo de miocardio anterolateral (STEMI).', 'Angioplastia coronaria percutánea primaria (ICP). Stent en arteria descendente anterior.', 'Ácido acetilsalicílico 100mg/día, Clopidogrel 75mg/día, Atorvastatina 40mg/noche.'),
(2, 1, NULL, NULL, 'Paciente femenina de 34 años con HTA diagnosticada hace 2 años.', 'Hipertensión arterial estadio 1 en control.', 'Ajuste de medicación antihipertensiva. Dieta hiposódica. Control en 3 meses.', 'Losartán 50mg cada 12 horas. Control de PA en casa.'),
(3, 2, NULL, 2, 'Paciente masculino de 51 años, sin antecedentes neurológicos. Cefalea progresiva hace 3 semanas.', 'Epilepsia focal sintomática en estudio. Posible lesión estructural a descartar.', 'Hospitalización para monitoreo EEG continuo y resonancia magnética de urgencia.', 'Valproato de sodio 500mg cada 12 horas. Reposo absoluto.'),
(6, 4, NULL, NULL, 'Paciente femenina de 31 años, sin antecedentes relevantes.', 'Chequeo general sin hallazgos patológicos.', 'Seguimiento anual. Estilo de vida saludable.', 'Multivitamínico diario.'),
(7, 5, NULL, NULL, 'Paciente masculino de 56 años, trabajador de construcción.', 'Lumbalgia crónica por esfuerzo laboral. Discopatía L4-L5.', 'Fisioterapia 3 veces por semana. Reposo laboral 15 días.', 'Ketorolaco 10mg c/8h por 5 días. Relajante muscular.'),
(8, 6, NULL, NULL, 'Paciente femenina de 36 años. Cáncer de mama diagnosticado en 2024.', 'Carcinoma ductal infiltrante estadio IIB. Post-quimioterapia.', 'Continuar esquema de quimioterapia adyuvante. Control en 3 semanas.', 'Esquema ACT.');
GO

-- ============================================================================
-- 17. DOCUMENTOS ADJUNTOS
-- ============================================================================
INSERT INTO DOCUMENTO_ADJUNTO (HistorialID, BlobURL, NombreArchivo, TipoArchivo, TamanoKB, Descripcion, SubidoPorUsuarioID) VALUES
(1, 'https://storage.clinix.com/docs/ecg_perez_20260616.pdf',    'ecg_perez_20260616.pdf',    'PDF',  450, 'Electrocardiograma de ingreso con elevación del ST en V1-V4', 4),
(1, 'https://storage.clinix.com/docs/catlab_perez_20260617.pdf', 'catlab_perez_20260617.pdf', 'PDF',  820, 'Informe de cateterismo y angioplastia coronaria',             4),
(2, 'https://storage.clinix.com/docs/lab_martinez_20260618.pdf', 'lab_martinez_20260618.pdf', 'PDF',  210, 'Resultados analítica: perfil lipídico y función renal',       4),
(3, 'https://storage.clinix.com/docs/rm_herrera_20260618.jpeg',  'rm_herrera_20260618.jpeg',  'JPEG', 3200,'Imágenes de resonancia magnética cerebral - cortes axiales',  5);
GO

-- ============================================================================
-- 18. LOG DE AUDITORÍA
-- ============================================================================
INSERT INTO LOG_AUDITORIA (UsuarioID, Accion, Descripcion, TablaAfectada, RegistroID, IPOrigen) VALUES
(1, 'LOGIN',         'Inicio de sesión exitoso',                          NULL, NULL, '192.168.1.10'),
(4, 'LOGIN',         'Inicio de sesión exitoso',                          NULL, NULL, '192.168.1.11'),
(1, 'CREATE',        'Admisión registrada para paciente Juan Pérez',      'ADMISION', 1, '192.168.1.10'),
(3, 'CREATE',        'Cita programada para Carlos Herrera',               'CITA', 3, '192.168.1.12'),
(4, 'CREATE',        'Historia clínica registrada para admisión #1',      'HISTORIA_CLINICA', 1, '192.168.1.11'),
(2, 'LOGIN',         'Inicio de sesión exitoso en Clínica Internacional', NULL, NULL, '192.168.1.20'),
(1, 'EXECUTE_SEED',  'Ejecución de seed_data.sql completada',             NULL, NULL, '192.168.1.1');
GO

PRINT 'Seed data cargada exitosamente.';
GO

-- ============================================================================
-- MIGRATION 001: Agregar tabla CIE10_DIAGNOSTICO y seed data
-- Uso: Ejecutar contra BD existente (no afecta datos existentes)
-- ============================================================================
USE Clinix;
GO

-- ============================================================================
-- 1. CREAR TABLA (si no existe, para que sea idempotente)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'CIE10_DIAGNOSTICO') AND type = 'U')
BEGIN
    CREATE TABLE CIE10_DIAGNOSTICO (
        Codigo          VARCHAR(10)  NOT NULL,
        EspecialidadID  INT          NOT NULL,
        Descripcion     VARCHAR(300) NOT NULL,
        Categoria       VARCHAR(150) NULL,
        Activo          BIT          NOT NULL DEFAULT 1,
        CONSTRAINT PK_CIE10_DIAGNOSTICO PRIMARY KEY (Codigo, EspecialidadID),
        CONSTRAINT FK_CIE10_ESPECIALIDAD FOREIGN KEY (EspecialidadID)
            REFERENCES ESPECIALIDAD(EspecialidadID)
    );
    PRINT 'Tabla CIE10_DIAGNOSTICO creada.';
END
ELSE
    PRINT 'Tabla CIE10_DIAGNOSTICO ya existe.';
GO

-- ============================================================================
-- 2. INSERTAR CÓDIGOS CIE-10 (ignorar duplicados para re-ejecución)
-- ============================================================================
PRINT 'Insertando códigos CIE-10 por especialidad...';
GO

-- Medicina General (EspecialidadID = 7)
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'A09' AND EspecialidadID = 7)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('A09', 7, 'Diarrea y gastroenteritis de presunto origen infeccioso', 'Enfermedades infecciosas intestinales', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'B34' AND EspecialidadID = 7)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('B34', 7, 'Infección viral de sitio no especificado', 'Enfermedades virales', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'E78' AND EspecialidadID = 7)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('E78', 7, 'Hiperlipidemia no especificada', 'Trastornos del metabolismo lipídico', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'J00' AND EspecialidadID = 7)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('J00', 7, 'Resfriado común', 'Infecciones agudas de las vías respiratorias superiores', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'J06.9' AND EspecialidadID = 7)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('J06.9', 7, 'Infección aguda de las vías respiratorias superiores, no especificada', 'Infecciones agudas de las vías respiratorias superiores', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'J15' AND EspecialidadID = 7)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('J15', 7, 'Neumonía bacteriana no clasificada en otra parte', 'Neumonía', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'N39' AND EspecialidadID = 7)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('N39', 7, 'Trastorno del sistema urinario no especificado', 'Enfermedades del sistema urinario', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'R05' AND EspecialidadID = 7)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('R05', 7, 'Tos', 'Síntomas generales', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'R10' AND EspecialidadID = 7)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('R10', 7, 'Dolor abdominal y pélvico', 'Síntomas generales', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'R50' AND EspecialidadID = 7)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('R50', 7, 'Fiebre de origen desconocido', 'Síntomas generales', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'R51' AND EspecialidadID = 7)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('R51', 7, 'Cefalea', 'Síntomas generales', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'R53' AND EspecialidadID = 7)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('R53', 7, 'Malestar y fatiga', 'Síntomas generales', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'Z00' AND EspecialidadID = 7)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('Z00', 7, 'Examen general y reconocimiento de personas sin quejas', 'Exámenes de salud de rutina', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'Z23' AND EspecialidadID = 7)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('Z23', 7, 'Necesidad de vacunación contra enfermedad bacteriana única', 'Vacunación', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'Z30' AND EspecialidadID = 7)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('Z30', 7, 'Atención para anticoncepción', 'Anticoncepción', 1);
GO

-- Cardiología (EspecialidadID = 1)
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'E78' AND EspecialidadID = 1)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('E78', 1, 'Hiperlipidemia no especificada', 'Trastornos del metabolismo lipídico', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'I10' AND EspecialidadID = 1)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('I10', 1, 'Hipertensión esencial (primaria)', 'Enfermedades hipertensivas', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'I11' AND EspecialidadID = 1)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('I11', 1, 'Cardiopatía hipertensiva', 'Enfermedades hipertensivas', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'I20' AND EspecialidadID = 1)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('I20', 1, 'Angina de pecho', 'Cardiopatía isquémica', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'I21' AND EspecialidadID = 1)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('I21', 1, 'Infarto agudo de miocardio', 'Cardiopatía isquémica', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'I25' AND EspecialidadID = 1)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('I25', 1, 'Cardiopatía isquémica crónica', 'Cardiopatía isquémica', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'I42' AND EspecialidadID = 1)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('I42', 1, 'Miocardiopatía', 'Miocardiopatías', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'I47' AND EspecialidadID = 1)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('I47', 1, 'Taquicardia paroxística', 'Trastornos del ritmo cardíaco', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'I48' AND EspecialidadID = 1)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('I48', 1, 'Fibrilación y aleteo auricular', 'Trastornos del ritmo cardíaco', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'I49' AND EspecialidadID = 1)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('I49', 1, 'Otras arritmias cardíacas', 'Trastornos del ritmo cardíaco', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'I50' AND EspecialidadID = 1)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('I50', 1, 'Insuficiencia cardíaca', 'Insuficiencia cardíaca', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'I51' AND EspecialidadID = 1)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('I51', 1, 'Complicaciones de cardiopatía y descripción inadecuada', 'Enfermedades cardiovasculares', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'I63' AND EspecialidadID = 1)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('I63', 1, 'Infarto cerebral', 'Enfermedades cerebrovasculares', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'I64' AND EspecialidadID = 1)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('I64', 1, 'Accidente vascular encefálico agudo no especificado', 'Enfermedades cerebrovasculares', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'I70' AND EspecialidadID = 1)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('I70', 1, 'Aterosclerosis', 'Enfermedades arteriales', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'R00' AND EspecialidadID = 1)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('R00', 1, 'Palpitaciones', 'Síntomas cardiovasculares', 1);
GO

-- Neurología (EspecialidadID = 2)
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'F03' AND EspecialidadID = 2)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('F03', 2, 'Demencia no especificada', 'Demencia', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'F07' AND EspecialidadID = 2)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('F07', 2, 'Trastorno orgánico de la personalidad', 'Trastornos de la personalidad orgánicos', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'G20' AND EspecialidadID = 2)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('G20', 2, 'Enfermedad de Parkinson', 'Enfermedades extrapiramidales', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'G30' AND EspecialidadID = 2)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('G30', 2, 'Enfermedad de Alzheimer', 'Enfermedades degenerativas del sistema nervioso', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'G40' AND EspecialidadID = 2)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('G40', 2, 'Epilepsia', 'Epilepsia', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'G43' AND EspecialidadID = 2)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('G43', 2, 'Migraña', 'Cefaleas', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'G44' AND EspecialidadID = 2)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('G44', 2, 'Otras cefaleas', 'Cefaleas', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'G45' AND EspecialidadID = 2)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('G45', 2, 'Ataques de isquemia cerebral transitoria', 'Enfermedades cerebrovasculares', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'G50' AND EspecialidadID = 2)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('G50', 2, 'Trastornos del nervio trigémino', 'Trastornos de nervios craneales', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'G54' AND EspecialidadID = 2)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('G54', 2, 'Trastornos de raíces y plexos nerviosos', 'Trastornos de raíces y plexos', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'G56' AND EspecialidadID = 2)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('G56', 2, 'Síndrome del túnel carpiano', 'Mononeuropatías', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'G62' AND EspecialidadID = 2)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('G62', 2, 'Polineuropatía no especificada', 'Polineuropatías', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'G90' AND EspecialidadID = 2)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('G90', 2, 'Trastornos del sistema nervioso autónomo', 'Trastornos del SNA', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'I63' AND EspecialidadID = 2)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('I63', 2, 'Infarto cerebral', 'Enfermedades cerebrovasculares', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'I67' AND EspecialidadID = 2)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('I67', 2, 'Enfermedad cerebrovascular aterosclerótica', 'Enfermedades cerebrovasculares', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'R51' AND EspecialidadID = 2)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('R51', 2, 'Cefalea', 'Síntomas generales', 1);
GO

-- Pediatría (EspecialidadID = 3)
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'A09' AND EspecialidadID = 3)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('A09', 3, 'Diarrea y gastroenteritis de presunto origen infeccioso', 'Enfermedades infecciosas intestinales', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'B05' AND EspecialidadID = 3)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('B05', 3, 'Sarampión', 'Enfermedades virales exantemáticas', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'B06' AND EspecialidadID = 3)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('B06', 3, 'Rubeola', 'Enfermedades virales exantemáticas', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'B15' AND EspecialidadID = 3)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('B15', 3, 'Hepatitis aguda tipo A', 'Hepatitis viral', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'E10' AND EspecialidadID = 3)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('E10', 3, 'Diabetes mellitus tipo 1', 'Diabetes mellitus', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'H10' AND EspecialidadID = 3)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('H10', 3, 'Conjuntivitis', 'Conjuntivitis', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'H66' AND EspecialidadID = 3)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('H66', 3, 'Otitis media supurativa', 'Otitis media', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'J00' AND EspecialidadID = 3)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('J00', 3, 'Resfriado común', 'Infecciones agudas de las vías respiratorias superiores', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'J02' AND EspecialidadID = 3)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('J02', 3, 'Faringitis aguda', 'Infecciones agudas de las vías respiratorias superiores', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'J03' AND EspecialidadID = 3)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('J03', 3, 'Amigdalitis aguda', 'Infecciones agudas de las vías respiratorias superiores', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'J06.9' AND EspecialidadID = 3)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('J06.9', 3, 'Infección aguda de las vías respiratorias superiores, no especificada', 'Infecciones agudas de las vías respiratorias superiores', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'J15' AND EspecialidadID = 3)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('J15', 3, 'Neumonía bacteriana no clasificada en otra parte', 'Neumonía', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'J45' AND EspecialidadID = 3)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('J45', 3, 'Asma', 'Asma', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'K29' AND EspecialidadID = 3)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('K29', 3, 'Gastritis no especificada', 'Enfermedades del esófago, estómago y duodeno', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'N39' AND EspecialidadID = 3)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('N39', 3, 'Trastorno del sistema urinario no especificado', 'Enfermedades del sistema urinario', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'R05' AND EspecialidadID = 3)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('R05', 3, 'Tos', 'Síntomas generales', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'R10' AND EspecialidadID = 3)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('R10', 3, 'Dolor abdominal y pélvico', 'Síntomas generales', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'R50' AND EspecialidadID = 3)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('R50', 3, 'Fiebre de origen desconocido', 'Síntomas generales', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'Z23' AND EspecialidadID = 3)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('Z23', 3, 'Necesidad de vacunación contra enfermedad bacteriana única', 'Vacunación', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'Z27' AND EspecialidadID = 3)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('Z27', 3, 'Necesidad de vacunación contra combinaciones de enfermedades', 'Vacunación', 1);
GO

-- Traumatología (EspecialidadID = 4)
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'M13' AND EspecialidadID = 4)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('M13', 4, 'Artritis no especificada', 'Artritis', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'M16' AND EspecialidadID = 4)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('M16', 4, 'Coxartrosis (artrosis de cadera)', 'Artrosis', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'M17' AND EspecialidadID = 4)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('M17', 4, 'Gonartrosis (artrosis de rodilla)', 'Artrosis', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'M19' AND EspecialidadID = 4)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('M19', 4, 'Artrosis no especificada', 'Artrosis', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'M23' AND EspecialidadID = 4)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('M23', 4, 'Trastorno interno de rodilla', 'Trastornos articulares', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'M25' AND EspecialidadID = 4)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('M25', 4, 'Otros trastornos articulares no clasificados', 'Trastornos articulares', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'M40' AND EspecialidadID = 4)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('M40', 4, 'Cifosis y lordosis', 'Deformidades de la columna', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'M41' AND EspecialidadID = 4)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('M41', 4, 'Escoliosis', 'Deformidades de la columna', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'M43' AND EspecialidadID = 4)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('M43', 4, 'Otras deformidades de la columna', 'Deformidades de la columna', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'M48' AND EspecialidadID = 4)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('M48', 4, 'Estenosis del conducto raquídeo', 'Espondilopatías', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'M51' AND EspecialidadID = 4)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('M51', 4, 'Trastorno de disco lumbar', 'Trastornos de disco intervertebral', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'M54' AND EspecialidadID = 4)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('M54', 4, 'Lumbago (dolor en la espalda baja)', 'Dorsopatías', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'M75' AND EspecialidadID = 4)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('M75', 4, 'Hombro doloroso', 'Lesiones del hombro', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'M79' AND EspecialidadID = 4)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('M79', 4, 'Otros trastornos de los tejidos blandos', 'Trastornos de tejidos blandos', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'S06' AND EspecialidadID = 4)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('S06', 4, 'Traumatismo intracraneal', 'Traumatismos de la cabeza', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'S22' AND EspecialidadID = 4)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('S22', 4, 'Fractura de costilla', 'Fracturas del tórax', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'S42' AND EspecialidadID = 4)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('S42', 4, 'Fractura de húmero', 'Fracturas del miembro superior', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'S52' AND EspecialidadID = 4)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('S52', 4, 'Fractura de antebrazo', 'Fracturas del miembro superior', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'S62' AND EspecialidadID = 4)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('S62', 4, 'Fractura de mano', 'Fracturas del miembro superior', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'S72' AND EspecialidadID = 4)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('S72', 4, 'Fractura de fémur', 'Fracturas del miembro inferior', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'S82' AND EspecialidadID = 4)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('S82', 4, 'Fractura de pierna', 'Fracturas del miembro inferior', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'S83' AND EspecialidadID = 4)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('S83', 4, 'Luxación de rodilla', 'Luxaciones', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'S93' AND EspecialidadID = 4)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('S93', 4, 'Luxación de tobillo', 'Luxaciones', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'T14' AND EspecialidadID = 4)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('T14', 4, 'Traumatismo de región no especificada del cuerpo', 'Traumatismos', 1);
GO

-- Ginecología (EspecialidadID = 5)
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'C53' AND EspecialidadID = 5)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('C53', 5, 'Neoplasia maligna del cuello uterino', 'Neoplasias malignas', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'D05' AND EspecialidadID = 5)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('D05', 5, 'Carcinoma in situ de mama', 'Neoplasias in situ', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'D25' AND EspecialidadID = 5)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('D25', 5, 'Leiomioma del útero', 'Neoplasias benignas', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'D26' AND EspecialidadID = 5)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('D26', 5, 'Otros neoplasmas benignos del útero', 'Neoplasias benignas', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'E28' AND EspecialidadID = 5)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('E28', 5, 'Disfunción ovárica', 'Trastornos ováricos', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'N20' AND EspecialidadID = 5)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('N20', 5, 'Cálculo del riñón y uréter', 'Litiasis urinaria', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'N23' AND EspecialidadID = 5)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('N23', 5, 'Cólico renal no especificado', 'Litiasis urinaria', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'N30' AND EspecialidadID = 5)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('N30', 5, 'Cistitis', 'Cistitis', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'N39' AND EspecialidadID = 5)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('N39', 5, 'Trastorno del sistema urinario no especificado', 'Enfermedades del sistema urinario', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'N61' AND EspecialidadID = 5)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('N61', 5, 'Trastornos inflamatorios de la mama', 'Trastornos de la mama', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'N63' AND EspecialidadID = 5)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('N63', 5, 'Nódulo mamario no especificado', 'Trastornos de la mama', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'N64' AND EspecialidadID = 5)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('N64', 5, 'Otros trastornos de la mama', 'Trastornos de la mama', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'N70' AND EspecialidadID = 5)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('N70', 5, 'Salpingitis y ooforitis', 'Enfermedades inflamatorias pélvicas', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'N72' AND EspecialidadID = 5)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('N72', 5, 'Enfermedad inflamatoria del cuello uterino', 'Enfermedades inflamatorias pélvicas', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'N76' AND EspecialidadID = 5)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('N76', 5, 'Inflamación de la vagina y vulva', 'Enfermedades inflamatorias pélvicas', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'N80' AND EspecialidadID = 5)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('N80', 5, 'Endometriosis', 'Endometriosis', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'N81' AND EspecialidadID = 5)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('N81', 5, 'Prolapso genital femenino', 'Prolapso genital', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'N85' AND EspecialidadID = 5)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('N85', 5, 'Otros trastornos no inflamatorios del útero', 'Trastornos uterinos', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'N91' AND EspecialidadID = 5)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('N91', 5, 'Ausencia de menstruación', 'Trastornos menstruales', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'N92' AND EspecialidadID = 5)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('N92', 5, 'Menstruación excesiva o irregular', 'Trastornos menstruales', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'N93' AND EspecialidadID = 5)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('N93', 5, 'Sangrado uterino anormal', 'Trastornos menstruales', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'N95' AND EspecialidadID = 5)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('N95', 5, 'Trastornos menopáusicos y perimenopáusicos', 'Trastornos menopáusicos', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'Z01' AND EspecialidadID = 5)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('Z01', 5, 'Examen ginecológico', 'Exámenes de salud de rutina', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'Z12' AND EspecialidadID = 5)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('Z12', 5, 'Examen de detección de neoplasias malignas', 'Exámenes de salud de rutina', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'Z30' AND EspecialidadID = 5)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('Z30', 5, 'Atención para anticoncepción', 'Anticoncepción', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'Z32' AND EspecialidadID = 5)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('Z32', 5, 'Examen de embarazo', 'Atención materna', 1);
GO

-- Oncología (EspecialidadID = 6)
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'C00' AND EspecialidadID = 6)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('C00', 6, 'Neoplasia maligna del labio', 'Neoplasias malignas', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'C16' AND EspecialidadID = 6)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('C16', 6, 'Neoplasia maligna del estómago', 'Neoplasias malignas del tracto digestivo', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'C18' AND EspecialidadID = 6)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('C18', 6, 'Neoplasia maligna del colon', 'Neoplasias malignas del tracto digestivo', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'C22' AND EspecialidadID = 6)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('C22', 6, 'Neoplasia maligna del hígado', 'Neoplasias malignas del tracto digestivo', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'C25' AND EspecialidadID = 6)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('C25', 6, 'Neoplasia maligna del páncreas', 'Neoplasias malignas del tracto digestivo', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'C34' AND EspecialidadID = 6)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('C34', 6, 'Neoplasia maligna de bronquio y pulmón', 'Neoplasias malignas respiratorias', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'C50' AND EspecialidadID = 6)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('C50', 6, 'Neoplasia maligna de la mama', 'Neoplasias malignas de mama', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'C53' AND EspecialidadID = 6)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('C53', 6, 'Neoplasia maligna del cuello uterino', 'Neoplasias malignas ginecológicas', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'C56' AND EspecialidadID = 6)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('C56', 6, 'Neoplasia maligna del ovario', 'Neoplasias malignas ginecológicas', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'C61' AND EspecialidadID = 6)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('C61', 6, 'Neoplasia maligna de la próstata', 'Neoplasias malignas urológicas', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'C64' AND EspecialidadID = 6)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('C64', 6, 'Neoplasia maligna del riñón', 'Neoplasias malignas urológicas', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'C67' AND EspecialidadID = 6)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('C67', 6, 'Neoplasia maligna de la vejiga', 'Neoplasias malignas urológicas', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'C71' AND EspecialidadID = 6)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('C71', 6, 'Neoplasia maligna del encéfalo', 'Neoplasias malignas del SNC', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'C73' AND EspecialidadID = 6)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('C73', 6, 'Neoplasia maligna de la glándula tiroides', 'Neoplasias malignas endócrinas', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'C81' AND EspecialidadID = 6)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('C81', 6, 'Enfermedad de Hodgkin', 'Neoplasias malignas linfáticas', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'C82' AND EspecialidadID = 6)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('C82', 6, 'Linfoma no Hodgkin', 'Neoplasias malignas linfáticas', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'C91' AND EspecialidadID = 6)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('C91', 6, 'Leucemia linfoide', 'Leucemias', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'C92' AND EspecialidadID = 6)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('C92', 6, 'Leucemia mieloide', 'Leucemias', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'D05' AND EspecialidadID = 6)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('D05', 6, 'Carcinoma in situ de mama', 'Neoplasias in situ', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'D09' AND EspecialidadID = 6)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('D09', 6, 'Carcinoma in situ de otros sitios', 'Neoplasias in situ', 1);
GO

-- Dermatología (EspecialidadID = 8)
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'A63' AND EspecialidadID = 8)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('A63', 8, 'Otras enfermedades de transmisión principalmente sexual', 'ETS', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'B00' AND EspecialidadID = 8)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('B00', 8, 'Infecciones por virus del herpes', 'Enfermedades virales', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'B02' AND EspecialidadID = 8)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('B02', 8, 'Herpes zóster', 'Enfermedades virales', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'B07' AND EspecialidadID = 8)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('B07', 8, 'Verrugas virales', 'Enfermedades virales', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'B35' AND EspecialidadID = 8)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('B35', 8, 'Dermatofitosis (tiña)', 'Micosis superficiales', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'B36' AND EspecialidadID = 8)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('B36', 8, 'Otras micosis superficiales', 'Micosis superficiales', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'B86' AND EspecialidadID = 8)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('B86', 8, 'Escabiosis (sarna)', 'Infestaciones', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'L00' AND EspecialidadID = 8)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('L00', 8, 'Síndrome de piel escaldada estafilocócica', 'Infecciones de la piel', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'L01' AND EspecialidadID = 8)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('L01', 8, 'Impétigo', 'Infecciones de la piel', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'L02' AND EspecialidadID = 8)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('L02', 8, 'Absceso cutáneo, forúnculo y ántrax', 'Infecciones de la piel', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'L03' AND EspecialidadID = 8)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('L03', 8, 'Celulitis', 'Infecciones de la piel', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'L20' AND EspecialidadID = 8)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('L20', 8, 'Dermatitis atópica (eczema)', 'Dermatitis', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'L21' AND EspecialidadID = 8)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('L21', 8, 'Dermatitis seborreica', 'Dermatitis', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'L23' AND EspecialidadID = 8)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('L23', 8, 'Dermatitis alérgica de contacto', 'Dermatitis', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'L25' AND EspecialidadID = 8)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('L25', 8, 'Dermatitis de contacto no especificada', 'Dermatitis', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'L30' AND EspecialidadID = 8)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('L30', 8, 'Otra dermatitis no especificada', 'Dermatitis', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'L40' AND EspecialidadID = 8)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('L40', 8, 'Psoriasis', 'Psoriasis', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'L50' AND EspecialidadID = 8)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('L50', 8, 'Urticaria', 'Urticaria', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'L60' AND EspecialidadID = 8)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('L60', 8, 'Trastornos de las uñas', 'Trastornos ungueales', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'L70' AND EspecialidadID = 8)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('L70', 8, 'Acné', 'Acné', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'L81' AND EspecialidadID = 8)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('L81', 8, 'Trastornos de la pigmentación', 'Trastornos pigmentarios', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'L89' AND EspecialidadID = 8)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('L89', 8, 'Úlcera de decúbito', 'Úlceras', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'L90' AND EspecialidadID = 8)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('L90', 8, 'Trastornos atróficos de la piel', 'Trastornos cutáneos', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'L91' AND EspecialidadID = 8)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('L91', 8, 'Trastornos hipertróficos de la piel', 'Trastornos cutáneos', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'L92' AND EspecialidadID = 8)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('L92', 8, 'Trastornos granulomatosos de la piel', 'Trastornos cutáneos', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'R21' AND EspecialidadID = 8)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('R21', 8, 'Salpullido y erupción cutánea', 'Síntomas cutáneos', 1);
GO

-- Oftalmología (EspecialidadID = 9)
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'H00' AND EspecialidadID = 9)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('H00', 9, 'Orzuelo y calacio', 'Trastornos del párpado', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'H01' AND EspecialidadID = 9)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('H01', 9, 'Blefaritis', 'Trastornos del párpado', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'H02' AND EspecialidadID = 9)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('H02', 9, 'Otros trastornos del párpado', 'Trastornos del párpado', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'H04' AND EspecialidadID = 9)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('H04', 9, 'Trastornos del aparato lagrimal', 'Trastornos lagrimales', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'H10' AND EspecialidadID = 9)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('H10', 9, 'Conjuntivitis', 'Conjuntivitis', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'H11' AND EspecialidadID = 9)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('H11', 9, 'Otros trastornos de la conjuntiva', 'Conjuntivitis', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'H15' AND EspecialidadID = 9)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('H15', 9, 'Trastornos de la esclerótica', 'Trastornos esclerales', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'H16' AND EspecialidadID = 9)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('H16', 9, 'Queratitis', 'Queratitis', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'H18' AND EspecialidadID = 9)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('H18', 9, 'Otros trastornos de la córnea', 'Trastornos corneales', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'H20' AND EspecialidadID = 9)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('H20', 9, 'Iridociclitis (uveítis anterior)', 'Trastornos del iris', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'H25' AND EspecialidadID = 9)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('H25', 9, 'Catarata senil', 'Cataratas', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'H26' AND EspecialidadID = 9)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('H26', 9, 'Otras cataratas', 'Cataratas', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'H27' AND EspecialidadID = 9)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('H27', 9, 'Otros trastornos del cristalino', 'Cataratas', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'H33' AND EspecialidadID = 9)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('H33', 9, 'Desprendimiento de retina', 'Trastornos retinianos', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'H35' AND EspecialidadID = 9)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('H35', 9, 'Otros trastornos de la retina', 'Trastornos retinianos', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'H40' AND EspecialidadID = 9)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('H40', 9, 'Glaucoma', 'Glaucoma', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'H43' AND EspecialidadID = 9)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('H43', 9, 'Trastornos del vítreo', 'Trastornos vítreos', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'H46' AND EspecialidadID = 9)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('H46', 9, 'Neuritis óptica', 'Trastornos del nervio óptico', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'H52' AND EspecialidadID = 9)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('H52', 9, 'Trastornos de la refracción y acomodación', 'Trastornos refractivos', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'H53' AND EspecialidadID = 9)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('H53', 9, 'Alteraciones visuales', 'Alteraciones visuales', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'H54' AND EspecialidadID = 9)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('H54', 9, 'Ceguera', 'Alteraciones visuales', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'H57' AND EspecialidadID = 9)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('H57', 9, 'Otros trastornos del ojo', 'Trastornos oculares', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'Z01' AND EspecialidadID = 9)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('Z01', 9, 'Examen oftalmológico', 'Exámenes de salud de rutina', 1);
GO

-- Psicología (EspecialidadID = 10)
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'F10' AND EspecialidadID = 10)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('F10', 10, 'Trastornos mentales y del comportamiento por consumo de alcohol', 'Trastornos por consumo de sustancias', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'F11' AND EspecialidadID = 10)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('F11', 10, 'Trastornos mentales por consumo de opiáceos', 'Trastornos por consumo de sustancias', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'F12' AND EspecialidadID = 10)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('F12', 10, 'Trastornos mentales por consumo de cannabis', 'Trastornos por consumo de sustancias', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'F17' AND EspecialidadID = 10)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('F17', 10, 'Trastornos mentales por consumo de tabaco', 'Trastornos por consumo de sustancias', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'F20' AND EspecialidadID = 10)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('F20', 10, 'Esquizofrenia', 'Esquizofrenia', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'F25' AND EspecialidadID = 10)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('F25', 10, 'Trastorno esquizoafectivo', 'Trastornos esquizoafectivos', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'F29' AND EspecialidadID = 10)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('F29', 10, 'Psicosis no orgánica no especificada', 'Psicosis', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'F31' AND EspecialidadID = 10)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('F31', 10, 'Trastorno bipolar', 'Trastornos del estado de ánimo', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'F32' AND EspecialidadID = 10)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('F32', 10, 'Episodio depresivo', 'Trastornos del estado de ánimo', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'F33' AND EspecialidadID = 10)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('F33', 10, 'Trastorno depresivo recurrente', 'Trastornos del estado de ánimo', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'F34' AND EspecialidadID = 10)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('F34', 10, 'Trastornos del estado de ánimo persistentes', 'Trastornos del estado de ánimo', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'F40' AND EspecialidadID = 10)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('F40', 10, 'Trastorno fóbico', 'Trastornos de ansiedad', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'F41' AND EspecialidadID = 10)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('F41', 10, 'Trastorno de ansiedad generalizada', 'Trastornos de ansiedad', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'F42' AND EspecialidadID = 10)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('F42', 10, 'Trastorno obsesivo-compulsivo', 'Trastornos de ansiedad', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'F43' AND EspecialidadID = 10)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('F43', 10, 'Reacción al estrés grave y trastornos de adaptación', 'Trastornos de ansiedad', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'F44' AND EspecialidadID = 10)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('F44', 10, 'Trastorno disociativo', 'Trastornos disociativos', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'F45' AND EspecialidadID = 10)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('F45', 10, 'Trastorno somatomorfo', 'Trastornos somatomorfos', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'F50' AND EspecialidadID = 10)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('F50', 10, 'Trastorno de la conducta alimentaria', 'Trastornos alimentarios', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'F51' AND EspecialidadID = 10)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('F51', 10, 'Trastorno del sueño no orgánico', 'Trastornos del sueño', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'F60' AND EspecialidadID = 10)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('F60', 10, 'Trastorno específico de la personalidad', 'Trastornos de la personalidad', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'F70' AND EspecialidadID = 10)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('F70', 10, 'Discapacidad intelectual leve', 'Discapacidad intelectual', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'F80' AND EspecialidadID = 10)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('F80', 10, 'Trastorno del desarrollo del habla', 'Trastornos del desarrollo', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'F84' AND EspecialidadID = 10)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('F84', 10, 'Autismo infantil', 'Trastornos del desarrollo', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'F90' AND EspecialidadID = 10)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('F90', 10, 'Trastorno hipercinético (TDAH)', 'Trastornos del comportamiento', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'F91' AND EspecialidadID = 10)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('F91', 10, 'Trastorno de la conducta', 'Trastornos del comportamiento', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'F93' AND EspecialidadID = 10)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('F93', 10, 'Trastorno emocional de inicio en la infancia', 'Trastornos emocionales infantiles', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'F98' AND EspecialidadID = 10)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('F98', 10, 'Otros trastornos emocionales y del comportamiento infantiles', 'Trastornos emocionales infantiles', 1);
IF NOT EXISTS (SELECT 1 FROM CIE10_DIAGNOSTICO WHERE Codigo = 'R45' AND EspecialidadID = 10)
INSERT INTO CIE10_DIAGNOSTICO (Codigo, EspecialidadID, Descripcion, Categoria, Activo) VALUES ('R45', 10, 'Inquietud y agitación', 'Síntomas emocionales', 1);
GO

PRINT 'Migración 001 completada: tabla CIE10_DIAGNOSTICO creada y datos insertados.';
GO
