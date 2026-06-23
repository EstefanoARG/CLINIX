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
