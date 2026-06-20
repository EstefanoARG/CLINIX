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
