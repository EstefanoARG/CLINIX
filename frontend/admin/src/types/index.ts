// --- Auth ---
export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user_id: number;
  nombre: string;
  role: string;
  medico_id: number | null;
}

export interface UserResponse {
  usuario_id: number;
  nombre: string;
  apellido: string;
  email: string;
  role: string;
  activo: boolean;
  medico_id: number | null;
}

// --- Paciente ---
export interface Paciente {
  paciente_id: number;
  clinical_id: number;
  dni: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string | null;
  genero: string | null;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  grupo_sanguineo: string | null;
  alergias: string | null;
  activo: boolean;
  fecha_registro: string;
}

export interface PacienteListResponse {
  items: Paciente[];
  total: number;
}

// --- Historia Clínica ---
export interface HistoriaClinica {
  historial_id: number;
  paciente_id: number;
  medico_id: number;
  cita_id: number | null;
  admision_id: number | null;
  anamnesis: string | null;
  diagnostico: string;
  tratamiento: string;
  prescripcion: string | null;
  observaciones: string | null;
  fecha_registro: string;
}

// --- Documento ---
export interface DocumentoAdjunto {
  documento_id: number;
  historial_id: number;
  blob_url: string;
  nombre_archivo: string;
  tipo_archivo: string;
  tamano_kb: number | null;
  descripcion: string | null;
  fecha_subida: string;
}

// --- Médico ---
export interface Medico {
  medico_id: number;
  usuario_id: number;
  especialidad_id: number;
  departamento_id: number;
  numero_colegiatura: string;
  activo: boolean;
  nombre: string | null;
  apellido: string | null;
  email: string | null;
  telefono: string | null;
  especialidad: string | null;
  departamento: string | null;
}

// --- Enfermero ---
export interface Enfermero {
  enfermero_id: number;
  usuario_id: number;
  departamento_id: number;
  numero_licencia: string;
  turno: string;
  activo: boolean;
  nombre: string | null;
  apellido: string | null;
  email: string | null;
}

// --- Horario Médico ---
export interface HorarioMedico {
  horario_id: number;
  medico_id: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  intervalo_citas: number;
  activo: boolean;
}

// --- Especialidad ---
export interface Especialidad {
  especialidad_id: number;
  nombre_especialidad: string;
  descripcion: string | null;
}

// --- Departamento ---
export interface Departamento {
  departamento_id: number;
  clinical_id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

// --- Ubicación Física ---
export interface UbicacionFisica {
  ubicacion_id: number;
  departamento_id: number;
  nombre: string;
  tipo: string;
  piso: string | null;
  activo: boolean;
}

// --- Cita ---
export interface Cita {
  cita_id: number;
  paciente_id: number;
  medico_id: number;
  especialidad_id: number;
  ubicacion_id: number | null;
  reserva_id: number | null;
  fecha_hora: string;
  duracion_minutos: number;
  estado_cita: string;
  motivo_consulta: string | null;
  observaciones: string | null;
  fecha_creacion: string;
  paciente_nombre: string | null;
  medico_nombre: string | null;
  especialidad_nombre: string | null;
}

// --- Reserva Web ---
export interface ReservaWeb {
  reserva_id: number;
  paciente_id: number | null;
  nombre_solicitante: string;
  dni_solicitante: string;
  email_solicitante: string;
  telefono_solicitante: string | null;
  especialidad_id: number;
  medico_id: number | null;
  fecha_hora_deseada: string;
  motivo_consulta: string | null;
  estado: string;
  acepta_terminos: boolean;
  cita_id: number | null;
  fecha_solicitud: string;
  fecha_respuesta: string | null;
  observacion_admin: string | null;
  especialidad_nombre: string | null;
  medico_nombre: string | null;
  paciente_nombre: string | null;
}

// --- Habitación ---
export interface Habitacion {
  habitacion_id: number;
  departamento_id: number;
  numero: string;
  piso: string | null;
  tipo: string;
  capacidad: number;
  estado: string;
  departamento_nombre: string | null;
}

// --- Admisión ---
export interface Admision {
  admision_id: number;
  paciente_id: number;
  medico_id: number;
  enfermero_id: number | null;
  habitacion_id: number;
  cita_id: number | null;
  fecha_ingreso: string;
  motivo_ingreso: string;
  diagnostico_ingreso: string | null;
  fecha_alta: string | null;
  diagnostico_alta: string | null;
  tipo_alta: string | null;
  estado: string;
  observaciones: string | null;
  fecha_creacion: string;
  paciente_nombre: string | null;
  medico_nombre: string | null;
  enfermero_nombre: string | null;
  habitacion_numero: string | null;
}

// --- Dashboard ---
export interface DashboardMetricas {
  total_doctores: number;
  total_enfermeros: number;
  total_pacientes: number;
  total_habitaciones: number;
  habitaciones_disponibles: number;
  habitaciones_ocupadas: number;
  habitaciones_mantenimiento: number;
  citas_hoy: number;
  total_citas_periodo: number;
  citas_completadas: number;
  citas_canceladas: number;
  admisiones_activas: number;
  reservas_pendientes: number;
  total_reservas_periodo: number;
  reservas_convertidas: number;
  pacientes_recientes: number;
}

export interface DashboardIndicadores {
  ocupacion_hospitalaria: number;
  tasa_completitud_citas: number;
  tasa_cancelacion_citas: number;
  conversion_reservas: number;
  promedio_citas_por_medico: number;
}

export interface SerieTemporalItem {
  fecha: string;
  etiqueta: string;
  citas: number;
  completadas: number;
  canceladas: number;
  reservas: number;
}

export interface DistribucionItem {
  nombre: string;
  valor: number;
}

export interface EspecialidadDemandaItem {
  especialidad: string;
  citas: number;
  reservas: number;
  total: number;
}

export interface DashboardGraficos {
  tendencia: SerieTemporalItem[];
  estados_citas: DistribucionItem[];
  ocupacion_habitaciones: DistribucionItem[];
  estados_reservas: DistribucionItem[];
  demanda_especialidades: EspecialidadDemandaItem[];
}

export interface ActividadReciente {
  tipo: string;
  descripcion: string;
  fecha: string;
}

export interface DoctorHoyItem {
  medico_id: number;
  nombre: string;
  especialidad: string;
  citas_programadas: number;
  citas_completadas: number;
}

export interface PacienteNuevoItem {
  paciente_id: number;
  nombre: string;
  dni: string;
  fecha_registro: string;
  tiene_cita: boolean;
}

export interface DashboardTablas {
  doctores_hoy: DoctorHoyItem[];
  pacientes_nuevos: PacienteNuevoItem[];
}

export interface DashboardResponse {
  metricas: DashboardMetricas;
  indicadores: DashboardIndicadores;
  graficos: DashboardGraficos;
  actividades: ActividadReciente[];
  tablas: DashboardTablas;
  periodo_desde: string;
  periodo_hasta: string;
  tendencia_desde: string;
  tendencia_hasta: string;
}

// --- Agenda Médico ---
export interface AgendaCitaItem {
  cita_id: number;
  paciente_id: number;
  paciente_nombre: string;
  paciente_dni: string;
  fecha_hora: string;
  duracion_minutos: number;
  estado_cita: string;
  motivo_consulta: string | null;
  ubicacion_nombre: string | null;
  especialidad_nombre: string | null;
  tiene_historia: boolean;
}

export interface AgendaResponse {
  medico_id: number;
  medico_nombre: string;
  fecha: string;
  citas: AgendaCitaItem[];
}

// --- Auditoría ---
export interface LogAuditoria {
  log_id: number;
  usuario_id: number | null;
  usuario_nombre: string | null;
  tabla_afectada: string | null;
  registro_id: number | null;
  accion: string;
  detalle: string | null;
  direccion_ip: string | null;
  fecha: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

// --- Reserva Web Output (admin bandeja) ---
export interface ReservaWebOut {
  reserva_id: number;
  paciente_id: number | null;
  nombre_solicitante: string;
  apellidos_solicitante?: string;
  dni_solicitante: string;
  email_solicitante: string;
  telefono_solicitante?: string;
  direccion_solicitante?: string;
  fecha_nacimiento_solicitante?: string;
  genero_solicitante?: string;
  especialidad_id: number;
  medico_id: number | null;
  fecha_hora_deseada: string;
  motivo_consulta?: string;
  estado: string;
  acepta_terminos: boolean;
  cita_id: number | null;
  fecha_solicitud: string;
  fecha_respuesta?: string;
  observacion_admin?: string;
  especialidad_nombre: string | null;
  medico_nombre: string | null;
  paciente_nombre: string | null;
}

// --- Disponibilidad ---
export interface DisponibilidadSlot {
  hora_inicio: string;
  hora_fin: string;
  disponible: boolean;
}

export interface DisponibilidadResponse {
  medico_id: number;
  fecha: string;
  slots: DisponibilidadSlot[];
}
