// --- Auth ---
export interface LoginRequest {
  email: string;
  password: string;
}

export interface PacienteRegisterRequest {
  dni: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  password: string;
  acepta_terminos: boolean;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user_id: number;
  nombre: string;
  role: string;
}

// --- Especialidad ---
export interface Especialidad {
  especialidad_id: number;
  nombre_especialidad: string;
  descripcion: string | null;
}

// --- Médico (público) ---
export interface Medico {
  medico_id: number;
  nombre: string | null;
  apellido: string | null;
  especialidad: string | null;
  telefono: string | null;
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
  dias_atencion: string[];
  mensaje: string;
}

// --- Reserva Web ---
export interface ReservaWebCreate {
  nombre_solicitante: string;
  apellidos_solicitante?: string;
  dni_solicitante: string;
  email_solicitante: string;
  telefono_solicitante?: string;
  direccion_solicitante?: string;
  fecha_nacimiento_solicitante?: string;
  genero_solicitante?: string;
  especialidad_id: number;
  medico_id?: number;
  fecha_hora_deseada: string;
  motivo_consulta?: string;
  acepta_terminos: boolean;
}

export interface ReservaWeb {
  reserva_id: number;
  nombre_solicitante: string;
  dni_solicitante: string;
  email_solicitante: string;
  telefono_solicitante?: string;
  direccion_solicitante?: string;
  fecha_nacimiento_solicitante?: string;
  genero_solicitante?: string;
  especialidad_id: number;
  medico_id: number | null;
  fecha_hora_deseada: string;
  estado: string;
  acepta_terminos: boolean;
  fecha_solicitud: string;
  fecha_respuesta?: string;
  observacion_admin?: string;
}
