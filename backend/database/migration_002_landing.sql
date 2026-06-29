USE Clinix;
GO

IF OBJECT_ID('dbo.LANDING_PLAN_FEATURE', 'U') IS NULL
AND OBJECT_ID('dbo.LANDING_PLAN', 'U') IS NULL
BEGIN
    CREATE TABLE LANDING_PLAN (
        PlanID          INT IDENTITY(1,1) PRIMARY KEY,
        Slug            VARCHAR(50) NOT NULL UNIQUE,
        Nombre          NVARCHAR(80) NOT NULL,
        Descripcion     NVARCHAR(MAX) NOT NULL,
        Precio          DECIMAL(10,2) NOT NULL,
        PrecioConWeb    DECIMAL(10,2) NOT NULL,
        Periodo         NVARCHAR(120) NOT NULL,
        ColorAcento     VARCHAR(20) NOT NULL,
        Icono           VARCHAR(50) NOT NULL DEFAULT 'star',
        IntroBeneficios NVARCHAR(160) NULL,
        Popular         BIT NOT NULL DEFAULT 0,
        EtiquetaPopular NVARCHAR(60) NULL,
        TextoBoton      NVARCHAR(80) NOT NULL DEFAULT 'Elegir plan',
        EnlaceBoton     VARCHAR(200) NOT NULL DEFAULT '#contact',
        Orden           INT NOT NULL DEFAULT 0,
        Activo          BIT NOT NULL DEFAULT 1,
        FechaCreacion   DATETIME NOT NULL DEFAULT GETDATE()
    );

    CREATE TABLE LANDING_PLAN_FEATURE (
        FeatureID INT IDENTITY(1,1) PRIMARY KEY,
        PlanID    INT NOT NULL,
        Texto     NVARCHAR(220) NOT NULL,
        Tooltip   NVARCHAR(MAX) NULL,
        Orden     INT NOT NULL DEFAULT 0,
        Activo    BIT NOT NULL DEFAULT 1,
        CONSTRAINT FK_LANDING_PLAN_FEATURE_PLAN
            FOREIGN KEY (PlanID) REFERENCES LANDING_PLAN(PlanID) ON DELETE CASCADE
    );
END
GO

IF OBJECT_ID('dbo.LANDING_METRIC', 'U') IS NULL
BEGIN
    CREATE TABLE LANDING_METRIC (
        MetricID INT IDENTITY(1,1) PRIMARY KEY,
        Slug     VARCHAR(50) NOT NULL UNIQUE,
        Icono    VARCHAR(50) NOT NULL,
        Etiqueta NVARCHAR(80) NOT NULL,
        Valor    DECIMAL(12,2) NOT NULL DEFAULT 0,
        Sufijo   NVARCHAR(40) NOT NULL DEFAULT '',
        Fuente   VARCHAR(50) NOT NULL DEFAULT 'manual',
        Orden    INT NOT NULL DEFAULT 0,
        Activo   BIT NOT NULL DEFAULT 1
    );
END
GO

IF OBJECT_ID('dbo.LANDING_TESTIMONIAL', 'U') IS NULL
BEGIN
    CREATE TABLE LANDING_TESTIMONIAL (
        TestimonialID INT IDENTITY(1,1) PRIMARY KEY,
        Nombre        NVARCHAR(120) NOT NULL,
        Especialidad  NVARCHAR(100) NOT NULL,
        Ubicacion     NVARCHAR(100) NOT NULL,
        AvatarURL     VARCHAR(500) NULL,
        Texto         NVARCHAR(MAX) NOT NULL,
        Orden         INT NOT NULL DEFAULT 0,
        Activo        BIT NOT NULL DEFAULT 1,
        FechaCreacion DATETIME NOT NULL DEFAULT GETDATE()
    );
END
GO

IF OBJECT_ID('dbo.LANDING_FAQ', 'U') IS NULL
BEGIN
    CREATE TABLE LANDING_FAQ (
        FAQID     INT IDENTITY(1,1) PRIMARY KEY,
        Pregunta  NVARCHAR(240) NOT NULL,
        Respuesta NVARCHAR(MAX) NOT NULL,
        Orden     INT NOT NULL DEFAULT 0,
        Activo    BIT NOT NULL DEFAULT 1
    );
END
GO

IF OBJECT_ID('dbo.LANDING_COMPARISON_ROW', 'U') IS NULL
BEGIN
    CREATE TABLE LANDING_COMPARISON_ROW (
        RowID          INT IDENTITY(1,1) PRIMARY KEY,
        Categoria      NVARCHAR(120) NULL,
        Caracteristica NVARCHAR(180) NULL,
        Tooltip        NVARCHAR(MAX) NULL,
        ValoresJSON    NVARCHAR(MAX) NOT NULL,
        Orden          INT NOT NULL DEFAULT 0,
        Activo         BIT NOT NULL DEFAULT 1
    );
END
GO

IF OBJECT_ID('dbo.LANDING_LEAD', 'U') IS NULL
BEGIN
    CREATE TABLE LANDING_LEAD (
        LeadID             INT IDENTITY(1,1) PRIMARY KEY,
        Nombres            NVARCHAR(120) NOT NULL,
        Apellidos          NVARCHAR(120) NOT NULL,
        Email              VARCHAR(120) NOT NULL,
        Telefono           VARCHAR(30) NOT NULL,
        HorarioContacto    NVARCHAR(120) NULL,
        AreaImplementacion NVARCHAR(160) NOT NULL,
        AceptaMarketing    BIT NOT NULL DEFAULT 1,
        Estado             VARCHAR(30) NOT NULL DEFAULT 'Nuevo',
        FechaCreacion      DATETIME NOT NULL DEFAULT GETDATE()
    );
END
GO
