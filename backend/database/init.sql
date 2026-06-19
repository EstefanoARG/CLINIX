-- ============================================================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS - SISTEMA CLINIX
-- RDBMS: SQL Server
-- Versión: 2.0 (Completa)
-- Descripción: Base de datos para gestión clínica con portal público y
--              portal administrativo. Cubre autenticación, pacientes,
--              médicos, enfermeros, citas, admisiones y dashboard.
-- ============================================================================

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'Clinix')
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
    UsuarioID   INT           NOT NULL,
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
    NombreSolicitante VARCHAR(150) NOT NULL,
    DNISolicitante   VARCHAR(20)  NOT NULL,
    EmailSolicitante VARCHAR(100) NOT NULL,
    TelefonoSolicitante VARCHAR(20) NULL,
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
-- SECCIÓN 11: DATOS DE PRUEBA
-- ============================================================================

-- 11.1 Clínicas
INSERT INTO CLINICA (Nombre, RUC, Direccion, Telefono, Email, PlanSuscripcion) VALUES
('Clínica San Pablo',       '20123456789', 'Av. Guardia Civil 337, San Borja, Lima',       '(01) 224-2224', 'contacto@sanpablo.com.pe',   'Premium'),
('Clínica Internacional',   '20987654321', 'Av. Garcilazo de la Vega 1420, Lima Centro',   '(01) 619-6161', 'contacto@clinicaint.com.pe',  'Standard'),
('Clínica El Golf',         '20456789123', 'Av. Aurelio Miro Quesada 1030, San Isidro',    '(01) 264-3320', 'contacto@clinicaelgolf.com',  'Basic');
GO

-- 11.2 Especialidades
INSERT INTO ESPECIALIDAD (NombreEspecialidad, Descripcion) VALUES
('Cardiología',         'Diagnóstico y tratamiento de enfermedades del corazón'),
('Neurología',          'Diagnóstico y tratamiento de enfermedades del sistema nervioso'),
('Pediatría General',   'Atención médica para niños y adolescentes'),
('Traumatología',       'Diagnóstico y tratamiento del sistema músculo-esquelético'),
('Ginecología',         'Salud del sistema reproductor femenino'),
('Oncología',           'Diagnóstico y tratamiento del cáncer'),
('Medicina General',    'Atención primaria y preventiva');
GO

-- 11.3 Roles
INSERT INTO ROLE (NombreRole) VALUES
('Administrador'),
('Médico'),
('Enfermero'),
('Recepcionista');
GO

-- 11.4 Departamentos
INSERT INTO DEPARTAMENTO (ClinicalID, Nombre, Descripcion) VALUES
(1, 'Cardiovascular',   'Área de cardiología e intervención cardíaca'),
(1, 'Neurología',       'Área de enfermedades neurológicas'),
(1, 'Pediatría',        'Área de atención pediátrica'),
(2, 'Traumatología',    'Área de cirugía y trauma ortopédico'),
(2, 'Ginecología',      'Área de salud femenina'),
(3, 'Medicina General', 'Consultas generales y emergencias menores');
GO

-- 11.5 Ubicaciones físicas
INSERT INTO UBICACION_FISICA (DepartamentoID, Nombre, Tipo, Piso) VALUES
(1, 'Consultorio 101',        'Consultorio', '1'),
(1, 'Sala de Operaciones A',  'Operaciones', '2'),
(2, 'Consultorio 201',        'Consultorio', '2'),
(3, 'Consultorio Pediatría 1','Consultorio', '1'),
(3, 'Emergencias Pediátricas','Emergencias', '1'),
(4, 'Consultorio Trauma 1',   'Consultorio', '3'),
(5, 'Consultorio Gine 1',     'Consultorio', '3'),
(6, 'Consultorio MG 1',       'Consultorio', '1');
GO

-- 11.6 Habitaciones
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

-- 11.7 Usuarios (personal de la clínica)
INSERT INTO USUARIO (ClinicalID, RoleID, UbicacionID, Nombre, Apellido, DNI, Email, Telefono, PasswordHash) VALUES
(1, 1, NULL, 'Carlos',   'Mendoza Ríos',   '40123456', 'carlos.admin@sanpablo.com',        '999111222', 'hash_pass_admin_1'),
(1, 2, 1,    'Alberto',  'Rivera Salas',   '40234567', 'alberto.rivera@sanpablo.com',       '999222333', 'hash_pass_med_1'),
(1, 2, 3,    'Patricia', 'Vega Montes',    '40345678', 'patricia.vega@sanpablo.com',        '999333444', 'hash_pass_med_2'),
(1, 3, 2,    'María',    'Gómez Paredes',  '40456789', 'maria.gomez@sanpablo.com',          '999444555', 'hash_pass_enf_1'),
(1, 4, 1,    'Roberto',  'Sánchez Díaz',   '40567890', 'roberto.sanchez@sanpablo.com',      '999555666', 'hash_pass_rec_1'),
(2, 1, NULL, 'Sandra',   'Flores Huamán',  '41123456', 'sandra.admin@clinicaint.com',       '998111222', 'hash_pass_admin_2'),
(2, 2, 6,    'Elena',    'Torres Cabrera', '41234567', 'elena.torres@clinicaint.com',       '998222333', 'hash_pass_med_3'),
(2, 3, 6,    'Jorge',    'Quispe Luna',    '41345678', 'jorge.quispe@clinicaint.com',       '998333444', 'hash_pass_enf_2');
GO

-- 11.8 Médicos
INSERT INTO MEDICO (UsuarioID, EspecialidadID, DepartamentoID, NumeroColegiatura) VALUES
(2, 1, 1, 'CMP-45678'),   -- Dr. Alberto Rivera → Cardiología, Cardiovascular (Clinica 1)
(3, 2, 2, 'CMP-56789'),   -- Dra. Patricia Vega  → Neurología, Neurología (Clinica 1)
(7, 3, 5, 'CMP-78912');   -- Dra. Elena Torres   → Ginecología, Ginecología (Clinica 2)
GO

-- 11.9 Horarios de médicos
INSERT INTO HORARIO_MEDICO (MedicoID, DiaSemana, HoraInicio, HoraFin, IntervaloCitas) VALUES
(1, 1, '08:00', '12:00', 30),  -- Dr. Rivera: Lunes 8-12
(1, 3, '08:00', '12:00', 30),  -- Dr. Rivera: Miércoles 8-12
(1, 5, '08:00', '12:00', 30),  -- Dr. Rivera: Viernes 8-12
(2, 2, '14:00', '18:00', 30),  -- Dra. Vega: Martes 14-18
(2, 4, '14:00', '18:00', 30),  -- Dra. Vega: Jueves 14-18
(3, 1, '09:00', '13:00', 30),  -- Dra. Torres: Lunes 9-13
(3, 2, '09:00', '13:00', 30);  -- Dra. Torres: Martes 9-13
GO

-- 11.10 Enfermeros
INSERT INTO ENFERMERO (UsuarioID, DepartamentoID, NumeroLicencia, Turno) VALUES
(4, 1, 'CEP-12345', 'Mañana'),   -- María Gómez → Cardiovascular
(8, 4, 'CEP-67890', 'Tarde');    -- Jorge Quispe → Traumatología
GO

-- 11.11 Pacientes
INSERT INTO PACIENTE (ClinicalID, DNI, Nombre, Apellido, FechaNacimiento, Genero, Direccion, Telefono, Email, GrupoSanguineo, Alergias) VALUES
(1, '44556677', 'Juan',     'Pérez García',    '1980-03-15', 'Masculino', 'Jr. Las Flores 234, Miraflores', '987654321', 'juan.perez@gmail.com',    'O+',  'Penicilina'),
(1, '88776655', 'Ana',      'Martínez López',  '1992-07-22', 'Femenino',  'Av. Brasil 890, Jesús María',    '976543210', 'ana.martinez@gmail.com',  'A+',  NULL),
(1, '55443322', 'Carlos',   'Herrera Pinto',   '1975-11-05', 'Masculino', 'Calle Los Pinos 12, Surco',      '965432109', 'carlos.herrera@gmail.com','B+',  'Aspirina'),
(2, '66778899', 'Lucía',    'Delgado Ruiz',    '1988-04-10', 'Femenino',  'Av. Universitaria 567, SMP',     '954321098', 'lucia.delgado@gmail.com', 'AB-', NULL),
(2, '11223344', 'Miguel',   'Castro Vargas',   '2010-08-30', 'Masculino', 'Jr. Lima 456, Callao',           '943210987', NULL,                      'O-',  'Ibuprofeno');
GO

-- 11.12 Autenticación del portal de pacientes
INSERT INTO PACIENTE_AUTH (PacienteID, Email, PasswordHash) VALUES
(1, 'juan.perez@gmail.com',    'hash_paciente_1'),
(2, 'ana.martinez@gmail.com',  'hash_paciente_2'),
(3, 'carlos.herrera@gmail.com','hash_paciente_3'),
(4, 'lucia.delgado@gmail.com', 'hash_paciente_4');
GO

-- 11.13 Reservas web (portal público)
INSERT INTO RESERVA_WEB (PacienteID, NombreSolicitante, DNISolicitante, EmailSolicitante, TelefonoSolicitante, EspecialidadID, MedicoID, FechaHoraDeseada, MotivoConsulta, Estado, AceptaTerminos) VALUES
(1, 'Juan Pérez García',   '44556677', 'juan.perez@gmail.com',    '987654321', 1, 1, '2026-06-25 09:00:00', 'Dolor en el pecho al hacer ejercicio',     'Pendiente',   1),
(4, 'Lucía Delgado Ruiz',  '66778899', 'lucia.delgado@gmail.com', '954321098', 5, 3, '2026-06-26 10:00:00', 'Control ginecológico de rutina',            'Confirmada',  1),
(NULL, 'Pedro Ríos Cano',  '99887766', 'pedro.rios@outlook.com',  '932109876', 7, NULL,'2026-06-27 11:00:00','Dolor de cabeza frecuente y mareos',       'Pendiente',   1);
GO

-- 11.14 Citas
INSERT INTO CITA (PacienteID, MedicoID, EspecialidadID, UbicacionID, ReservaID, FechaHora, DuracionMinutos, EstadoCita, MotivoConsulta, CreadoPorUsuarioID) VALUES
(1, 1, 1, 1, NULL, '2026-06-18 10:00:00', 30, 'Programada', 'Revisión cardiológica anual',                1),
(2, 1, 1, 1, NULL, '2026-06-18 10:30:00', 30, 'Programada', 'Seguimiento hipertensión',                   1),
(3, 2, 2, 3, NULL, '2026-06-19 14:00:00', 30, 'Programada', 'Evaluación neurológica por cefaleas',        5),
(4, 3, 5, 7, 2,   '2026-06-26 10:00:00', 30, 'Confirmada', 'Control ginecológico de rutina',              6);
GO

-- 11.15 Admisiones activas
INSERT INTO ADMISION (PacienteID, MedicoID, EnfermeroID, HabitacionID, CitaID, FechaIngreso, MotivoIngreso, DiagnosticoIngreso, Estado, CreadoPorUsuarioID) VALUES
(1, 1, 1, 2, 1, '2026-06-16 14:30:00', 'Dolor torácico agudo con elevación del ST', 'Infarto agudo de miocardio anterolateral', 'Activa', 1),
(3, 2, NULL, 7, NULL, '2026-06-17 08:00:00', 'Crisis convulsiva en casa', 'Epilepsia focal sintomática', 'Activa', 5);
GO

-- 11.16 Historia clínica
INSERT INTO HISTORIA_CLINICA (PacienteID, MedicoID, CitaID, AdmisionID, Anamnesis, Diagnostico, Tratamiento, Prescripcion) VALUES
(1, 1, NULL, 1, 'Paciente masculino de 46 años, tabaquismo leve, sin antecedentes cardíacos previos.', 'Infarto agudo de miocardio anterolateral (STEMI).', 'Angioplastia coronaria percutánea primaria (ICP). Stent en arteria descendente anterior.', 'Ácido acetilsalicílico 100mg/día, Clopidogrel 75mg/día, Atorvastatina 40mg/noche.'),
(2, 1, 2, NULL, 'Paciente femenina de 34 años con HTA diagnosticada hace 2 años.', 'Hipertensión arterial estadio 1 en control.', 'Ajuste de medicación antihipertensiva. Dieta hiposódica. Control en 3 meses.', 'Losartán 50mg cada 12 horas. Control de PA en casa.'),
(3, 2, 3, 2, 'Paciente masculino de 51 años, sin antecedentes neurológicos. Cefalea progresiva hace 3 semanas.', 'Epilepsia focal sintomática en estudio. Posible lesión estructural a descartar.', 'Hospitalización para monitoreo EEG continuo y resonancia magnética de urgencia.', 'Valproato de sodio 500mg cada 12 horas. Reposo absoluto.');
GO

-- 11.17 Documentos adjuntos
INSERT INTO DOCUMENTO_ADJUNTO (HistorialID, BlobURL, NombreArchivo, TipoArchivo, TamanoKB, Descripcion, SubidoPorUsuarioID) VALUES
(1, 'https://storage.clinix.com/docs/ecg_perez_20260616.pdf',    'ecg_perez_20260616.pdf',    'PDF',  450, 'Electrocardiograma de ingreso con elevación del ST en V1-V4', 2),
(1, 'https://storage.clinix.com/docs/catlab_perez_20260617.pdf', 'catlab_perez_20260617.pdf', 'PDF',  820, 'Informe de cateterismo y angioplastia coronaria',             2),
(2, 'https://storage.clinix.com/docs/lab_martinez_20260618.pdf', 'lab_martinez_20260618.pdf', 'PDF',  210, 'Resultados analítica: perfil lipídico y función renal',       2),
(3, 'https://storage.clinix.com/docs/rm_herrera_20260618.jpeg',  'rm_herrera_20260618.jpeg',  'JPEG', 3200,'Imágenes de resonancia magnética cerebral - cortes axiales',  3);
GO

-- 11.18 Log de auditoría
INSERT INTO LOG_AUDITORIA (UsuarioID, Accion, Descripcion, TablaAfectada, RegistroID, IPOrigen) VALUES
(1, 'LOGIN',         'Inicio de sesión exitoso',                             NULL,       NULL, '192.168.1.10'),
(2, 'LOGIN',         'Inicio de sesión exitoso',                             NULL,       NULL, '192.168.1.11'),
(1, 'CREATE',        'Admisión registrada para paciente Juan Pérez',         'ADMISION', 1,    '192.168.1.10'),
(5, 'CREATE',        'Cita programada para Carlos Herrera',                  'CITA',     3,    '192.168.1.12'),
(2, 'CREATE',        'Historia clínica registrada para admisión #1',         'HISTORIA_CLINICA', 1, '192.168.1.11'),
(6, 'LOGIN',         'Inicio de sesión exitoso en Clínica Internacional',    NULL,       NULL, '192.168.1.20');
GO

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================