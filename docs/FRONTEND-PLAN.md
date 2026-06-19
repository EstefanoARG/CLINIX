# CLINIX — Plan de Frontend UI/UX

> Generado el 2026-06-19. Basado en análisis del backend (módulos, schemas, endpoints) y `Sistema.txt`.
> Decisiones tomadas: MUI para ambos frontends, incluir Auditoría, excluir Señalizaciones Clínicas.

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| UI | Material UI (`@mui/material` + `@emotion/react`) | 5.x |
| HTTP | `axios` | — |
| Estado | React Context + hooks | — |
| Ruteo | `react-router-dom` | v6 |
| Fecha/hora | `dayjs` | — |

---

## Portal Público (`frontend/public`)

### Pantallas

| # | Pantalla | Ruta | Auth | Endpoint Backend |
|---|----------|------|------|------------------|
| 1 | Landing Page | `/` | No | — |
| 2 | Login Paciente | `/login` | No | `POST /api/v1/auth/login/paciente` |
| 3 | Registro Paciente | `/register` | No | `POST /api/v1/auth/register` |
| 4 | Recuperar Contraseña | `/forgot-password` | No | `POST /api/v1/auth/forgot-password` |
| 5 | Restablecer Contraseña | `/reset-password?token=` | No | `POST /api/v1/auth/reset-password` |
| 6 | Solicitar Cita (Paso 1) — especialidad | `/solicitar-cita` | No | `GET /api/v1/especialidades` |
| 7 | Solicitar Cita (Paso 2) — médico | `/solicitar-cita/medico` | No | `GET /api/v1/public/medicos?especialidad_id=` |
| 8 | Solicitar Cita (Paso 3) — horario | `/solicitar-cita/horario` | No | `GET /api/v1/disponibilidad/{medico_id}?fecha=` |
| 9 | Solicitar Cita (Paso 4) — datos + confirmar | `/solicitar-cita/confirmar` | No | `POST /api/v1/public/reservas` |
| 10 | Éxito / Confirmación | `/solicitar-cita/exito` | No | — |
| 11 | Mis Reservas (historial paciente) | `/mis-reservas` | Paciente | `GET /api/v1/public/mis-reservas` |
| 12 | Ver Médicos (listado público) | `/medicos` | No | `GET /api/v1/public/medicos` |

### Layout público

```
┌────────────────────────────────────────────────────┐
│ [Logo]  Inicio  Médicos  Sacar Cita  [Ingresar]   │
├────────────────────────────────────────────────────┤
│                                                    │
│                    CONTENIDO                       │
│                                                    │
├────────────────────────────────────────────────────┤
│  © CLINIX — Todos los derechos reservados         │
└────────────────────────────────────────────────────┘
```

- Header con logo + navegación simple
- Si el paciente está logueado: menú muestra "Mis Reservas" + "Cerrar Sesión"
- Footer institucional

### Wizard Solicitar Cita

Barra de progreso de 4 pasos:

```
[Especialidad] ──→ [Médico] ──→ [Horario] ──→ [Confirmar]
```

1. **Paso 1** — Seleccionar especialidad (cards o radio buttons)
2. **Paso 2** — Seleccionar médico (solo los de esa especialidad)
3. **Paso 3** — Calendario + slots disponibles (fetch disponibilidad al seleccionar fecha)
4. **Paso 4** — Formulario con datos personales + checkbox términos + botón "Enviar Solicitud"

### Elementos de la Landing Page

- Logo de CLINIX
- Mensaje de bienvenida
- Botón "Solicitar Cita" → `/solicitar-cita`
- Botón "Ingresar" → `/login`
- Sección informativa: especialidades, doctores destacados

---

## Portal Administrativo (`frontend/admin`)

### Layout admin

```
┌──────┬─────────────────────────────────────────────┐
│      │  Header: [Logo]  [Usuario]  [Cerrar Sesión] │
│      ├─────────────────────────────────────────────┤
│ Side │                                             │
│ bar  │              CONTENIDO                      │
│      │                                             │
│      │                                             │
└──────┴─────────────────────────────────────────────┘
```

**Sidebar** (colapsable):

- 📊 Dashboard
- 👨‍⚕️ Doctores
- 👩‍⚕️ Enfermeras
- 🧑‍🤝‍🧑 Pacientes
- 🏥 Especialidades
- 🏢 Departamentos
- 🗺️ Ubicaciones
- 📅 Citas
- 📋 Reservas Web
- 🛏️ Habitaciones
- 🏨 Admisiones
- 📝 Auditoría
- 👤 Panel Médico (solo rol Médico)
- 👤 Panel Enfermería (solo rol Enfermero)

---

### 1. Auth

| Pantalla | Ruta | Endpoint |
|----------|------|----------|
| Login Admin | `/login` | `POST /api/v1/auth/login` |
| Recuperar Contraseña | `/forgot-password` | `POST /api/v1/auth/forgot-password` |
| Restablecer Contraseña | `/reset-password?token=` | `POST /api/v1/auth/reset-password` |

### 2. Dashboard

| Pantalla | Ruta | Endpoint |
|----------|------|----------|
| Dashboard Principal | `/dashboard` | `GET /api/v1/dashboard` + `GET /api/v1/dashboard/metricas` |

**KPI Cards** (fila superior):
- Total Doctores
- Total Enfermeras
- Total Pacientes
- Habitaciones (Disponibles / Ocupadas)
- Citas Hoy
- Admisiones Activas
- Reservas Pendientes

**Tablas** (sección inferior):
- Doctores activos (Nombre, Ubicación, Especialidad)
- Pacientes recientemente admitidos (Nombre, Departamento, Fecha, Teléfono)

### 3. Doctores

| Pantalla | Ruta | Endpoint |
|----------|------|----------|
| Listar Doctores | `/doctores` | `GET /api/v1/medicos` |
| Registrar Doctor | `/doctores/nuevo` | `POST /api/v1/medicos` |
| Editar Doctor | `/doctores/:id/editar` | `PUT /api/v1/medicos/:id` |
| Ver Doctor + Horarios | `/doctores/:id` | `GET /api/v1/medicos/:id` + `GET /api/v1/medicos/:id/horarios` |

**Campos formulario doctor:**
- Nombres, Apellidos, DNI, Email, Teléfono
- Especialidad (select), Departamento (select), Ubicación (select)
- Número de Colegiatura, Contraseña (solo creación)

**Horarios del doctor** (inline en detalle):
- Tabla por día de semana (Lun-Vie): Hora Inicio, Hora Fin, Intervalo
- Botones: Agregar horario, Editar, Eliminar

### 4. Enfermeras

| Pantalla | Ruta | Endpoint |
|----------|------|----------|
| Listar Enfermeras | `/enfermeras` | `GET /api/v1/enfermeros` |
| Registrar Enfermera | `/enfermeras/nuevo` | `POST /api/v1/enfermeros` |
| Editar Enfermera | `/enfermeras/:id/editar` | `PUT /api/v1/enfermeros/:id` |

**Campos formulario enfermera:**
- Nombres, Apellidos, DNI, Email, Teléfono
- Departamento (select), Turno (select)
- Número de Licencia, Contraseña (solo creación)

### 5. Pacientes

| Pantalla | Ruta | Endpoint |
|----------|------|----------|
| Listar Pacientes | `/pacientes` | `GET /api/v1/pacientes` |
| Buscar Pacientes | `/pacientes?q=` | `GET /api/v1/pacientes/buscar?q=` |
| Registrar Paciente | `/pacientes/nuevo` | `POST /api/v1/pacientes` |
| Editar Paciente | `/pacientes/:id/editar` | `PUT /api/v1/pacientes/:id` |
| Detalle Paciente | `/pacientes/:id` | `GET /api/v1/pacientes/:id` + `GET /api/v1/pacientes/:id/historias` |
| Nueva Historia Clínica | `/pacientes/:id/historias/nuevo` | `POST /api/v1/pacientes/:id/historias` |
| Editar Historia Clínica | `/pacientes/:id/historias/:hid` | `PUT /api/v1/pacientes/:id/historias/:hid` |

**Campos formulario paciente:**
- Nombres, Apellidos, DNI, Dirección, Email, Teléfono
- Fecha de Nacimiento, Género, Grupo Sanguíneo, Alergias

**Detalle Paciente** (tres secciones):
1. **Información Personal** — ID, nombre completo, correo, teléfono, fecha nacimiento, género, grupo sanguíneo, alergias
2. **Historial Clínico** — tabla con columnas: Fecha, Médico, Diagnóstico, Tratamiento, Acciones (ver/editar/adjuntar docs)
3. **Documentos Adjuntos** — tabla embebida en cada HC (nombre archivo, tipo, fecha, descargar/eliminar)

### 6. Catálogos

| Pantalla | Ruta | Endpoint |
|----------|------|----------|
| Especialidades (CRUD) | `/especialidades` | `GET/POST/PUT/DELETE /api/v1/especialidades` |
| Departamentos (CRUD) | `/departamentos` | `GET/POST/PUT/DELETE /api/v1/departamentos` |
| Ubicaciones Físicas (CRUD) | `/ubicaciones` | `GET/POST/PUT/DELETE /api/v1/ubicaciones` |

Cada uno con tabla + modal/formulario inline para crear/editar. Soft-delete en departamentos y ubicaciones.

### 7. Habitaciones

| Pantalla | Ruta | Endpoint |
|----------|------|----------|
| Listar Habitaciones | `/habitaciones` | `GET /api/v1/habitaciones` |
| Registrar Habitación | `/habitaciones/nuevo` | `POST /api/v1/habitaciones` |
| Editar / Mantenimiento | `/habitaciones/:id/editar` | `PUT /api/v1/habitaciones/:id` |

**Campos formulario:**
- Número, Departamento (select), Tipo (select: UCI, Pediatría, Privada, Postoperatorio, etc.), Capacidad, Piso

**Filtros:** por departamento, tipo, estado (Disponible/Ocupada/Mantenimiento)

### 8. Citas

| Pantalla | Ruta | Endpoint |
|----------|------|----------|
| Listar Citas | `/citas` | `GET /api/v1/citas` |
| Registrar Cita | `/citas/nuevo` | `POST /api/v1/citas` |
| Editar Cita | `/citas/:id/editar` | `PUT /api/v1/citas/:id` |
| Cancelar Cita | — (acción inline) | `DELETE /api/v1/citas/:id` |

**Campos formulario cita:**
- Paciente (select/buscador), Especialidad (select), Médico (select), Ubicación (select)
- Fecha y Hora, Duración (minutos), Motivo Consulta, Observaciones

**Filtros lista:** por paciente, médico, especialidad, fecha, estado

### 9. Reservas Web

| Pantalla | Ruta | Endpoint |
|----------|------|----------|
| Listar Reservas | `/reservas` | `GET /api/v1/reservas` |
| Revisar / Editar Reserva | `/reservas/:id` | `PUT /api/v1/reservas/:id` |
| Convertir Reserva → Cita | `/reservas/:id/convertir` | `POST /api/v1/reservas/:id/convertir` |

**Flujo de Revisión:**
1. Admin ve lista de reservas pendientes (con filtro por estado)
2. Abre detalle de la reserva: ve datos del solicitante, especialidad, médico (si asignó), fecha deseada
3. Puede asignar médico si no tiene, agregar observación
4. Botón "Convertir en Cita" → modal con fecha/hora/duración → confirma → crea la cita

**Estados de Reserva:** Pendiente, Aprobada, Rechazada, Convertida

### 10. Admisiones

| Pantalla | Ruta | Endpoint |
|----------|------|----------|
| Listar Admisiones | `/admisiones` | `GET /api/v1/admisiones` |
| Registrar Admisión | `/admisiones/nuevo` | `POST /api/v1/admisiones` |
| Editar Admisión | `/admisiones/:id/editar` | `PUT /api/v1/admisiones/:id` |
| Dar Alta | `/admisiones/:id/alta` | `POST /api/v1/admisiones/:id/alta` |

**Campos formulario admisión:**
- Paciente (select/buscador), Médico (select), Enfermera (select), Habitación (select — mostrar solo disponibles)
- Fecha de Ingreso (automática), Motivo Ingreso, Diagnóstico Ingreso, Observaciones

**Dar Alta** (modal):
- Diagnóstico Alta, Tipo Alta (Médica/Voluntaria/Traslado/etc.), Observaciones
- Confirmar → habitación pasa a Disponible automáticamente

**Filtros lista:** por paciente, médico, estado (Activa/Dada de Alta)

### 11. Auditoría

| Pantalla | Ruta | Endpoint |
|----------|------|----------|
| Listar Logs | `/auditoria` | `GET /api/v1/auditoria` ⚠️ *Endpoint por crear* |

**Campos de filtro:**
- Usuario (select/buscador)
- Tipo Acción (select: CREATE, UPDATE, DELETE, LOGIN, etc.)
- Fecha Desde / Fecha Hasta
- Paginación

**Tabla:** Fecha, Usuario, Acción, Entidad, ID Entidad, Detalle, IP

### 12. Paneles de Rol

| Pantalla | Ruta | Acceso | Lógica |
|----------|------|--------|--------|
| Panel Médico | `/panel/doctor` | Médico | Citas del día del médico logueado, pacientes asignados en admisiones activas |
| Panel Enfermería | `/panel/enfermeria` | Enfermero | Admisiones activas donde está asignado, pacientes, horarios |

---

## Arquitectura de Componentes

### Estructura de carpetas (común a ambos SPAs)

```
src/
├── components/
│   ├── layout/
│   │   ├── AdminLayout.tsx       # Sidebar + Header + Outlet
│   │   ├── PublicLayout.tsx      # Header + Footer + Outlet
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── ui/
│   │   ├── KpiCard.tsx           # Tarjeta de métrica con icono+valor
│   │   ├── StatusBadge.tsx       # Badge de color según estado
│   │   ├── ConfirmDialog.tsx     # Diálogo de confirmación
│   │   ├── EmptyState.tsx        # Estado vacío con icono+mensaje
│   │   ├── LoadingOverlay.tsx
│   │   └── PageHeader.tsx        # Título + breadcrumb + botones
│   ├── table/
│   │   ├── DataTable.tsx         # Tabla genérica con MUI DataGrid o Table
│   │   ├── TableFilters.tsx      # Fila de filtros arriba de la tabla
│   │   └── Pagination.tsx
│   └── form/
│       ├── FormField.tsx         # Wrapper de TextField con validación
│       ├── SelectField.tsx       # Select con opciones
│       ├── DatePickerField.tsx   # DatePicker con dayjs
│       └── FormActions.tsx       # Botones Guardar + Cancelar
├── hooks/
│   ├── useAuth.ts                # Contexto de autenticación
│   ├── useApi.ts                 # Llamadas API con loading/error
│   └── usePagination.ts          # Estado de paginación
├── services/
│   ├── api.ts                    # Cliente axios (base URL + interceptors)
│   ├── auth.service.ts           # login, register, refresh, forgot/reset password
│   ├── pacientes.service.ts
│   ├── medicos.service.ts
│   ├── enfermeros.service.ts
│   ├── citas.service.ts
│   ├── reservas.service.ts
│   ├── admisiones.service.ts
│   ├── habitaciones.service.ts
│   ├── especialidades.service.ts
│   ├── departamentos.service.ts
│   ├── ubicaciones.service.ts
│   ├── dashboard.service.ts
│   └── auditoria.service.ts
├── store/
│   └── AuthContext.tsx            # Provider + hook useAuth
├── types/
│   ├── auth.ts
│   ├── paciente.ts
│   ├── medico.ts
│   ├── cita.ts
│   ├── admision.ts
│   └── ...
├── pages/
│   ├── auth/
│   ├── dashboard/
│   ├── doctores/
│   ├── enfermeras/
│   ├── pacientes/
│   ├── catalogos/
│   ├── citas/
│   ├── reservas/
│   ├── habitaciones/
│   ├── admisiones/
│   ├── auditoria/
│   └── paneles/
├── App.tsx                         # Router principal
└── main.tsx                        # Entry point con ThemeProvider
```

### Flujo de Autenticación

```
Login → POST /api/v1/auth/login (o /login/paciente)
       ↓
Recibe { access_token, refresh_token, user_id, nombre, role }
       ↓
Guarda en localStorage + AuthContext
       ↓
Interceptor axios agrega Authorization: Bearer <token>
       ↓
Si 401 → POST /api/v1/auth/refresh con refresh_token
       ↓
Si refresh falla → limpia storage y redirige a /login
```

### Tema MUI

Crear tema personalizado con colores de CLINIX:

```typescript
// src/theme.ts
const theme = createTheme({
  palette: {
    primary: { main: '#1565C0' },  // Azul médico
    secondary: { main: '#26A69A' }, // Verde clínico
    error: { main: '#E53935' },
    background: { default: '#F5F7FA' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
  },
  components: {
    MuiCard: { styleOverrides: { root: { borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' } } },
    MuiButton: { styleOverrides: { root: { textTransform: 'none', borderRadius: 8 } } },
  },
});
```

---

## Backend: Nuevos Endpoints Requeridos

### Auditoría

```
GET /api/v1/auditoria
  ?usuario_id=int
  &tipo_accion=string (CREATE|UPDATE|DELETE|LOGIN|LOGOUT)
  &fecha_desde=YYYY-MM-DD
  &fecha_hasta=YYYY-MM-DD
  &skip=int (default 0)
  &limit=int (default 50)
  Auth: Admin

Response:
{
  "items": [
    {
      "log_id": int,
      "usuario_id": int,
      "usuario_nombre": string,
      "tabla_afectada": string,
      "registro_id": int | null,
      "accion": string,
      "detalle": string | null,
      "direccion_ip": string | null,
      "fecha": datetime
    }
  ],
  "total": int
}
```

---

## Lo que queda fuera del plan

| Funcionalidad | Motivo |
|--------------|--------|
| Señalizaciones Clínicas (Concern) | Sin backend (no hay tabla, endpoints ni modelo) |
| Notificaciones en tiempo real | Requiere WebSockets/Socket.IO (futuro) |
| Subida real de archivos (Blob) | Backend tiene endpoint pero falta storage configurado |
| API Gateway | Propuesto en Sistema.txt como Kong/Ocelot, futuro |
| Tests unitarios frontend | Jest + React Testing Library (futuro) |

---

## Orden de implementación sugerido

1. **Base**: Estructura del proyecto, tema MUI, Layouts, api.ts, AuthContext
2. **Auth**: Login, Register, Forgot/Reset Password (ambos portales)
3. **Público**: Landing Page + Wizard Solicitar Cita + Mis Reservas
4. **Admin - Dashboard**: KPI cards + tablas de actividad reciente
5. **Admin - Doctores + Enfermeras**: CRUD completo + horarios
6. **Admin - Pacientes**: CRUD + Detalle + Historias Clínicas + Documentos
7. **Admin - Catálogos**: Especialidades, Departamentos, Ubicaciones
8. **Admin - Citas + Reservas**: CRUD citas + revisión y conversión de reservas
9. **Admin - Habitaciones + Admisiones**: CRUD habitaciones + flujo admisión/alta
10. **Admin - Auditoría**: Lista de logs con filtros
11. **Admin - Paneles de Rol**: Panel Médico, Panel Enfermería
