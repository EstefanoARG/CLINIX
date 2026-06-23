# CLINIX — Sistema Integral de Gestión Hospitalaria

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-0.1.0-009688)]()
[![React](https://img.shields.io/badge/React-18-61DAFB)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)]()
[![MUI](https://img.shields.io/badge/MUI-5-007FFF)]()
[![SQL Server](https://img.shields.io/badge/SQL%20Server-2019-CC2927)]()

Sistema de gestión hospitalaria con **portal público** para pacientes (solicitud de citas online, registro, consulta de médicos) y **portal administrativo** para el personal de la clínica (gestión de doctores, enfermeros, pacientes, citas, admisiones, habitaciones, historias clínicas, catálogos, bandeja de recepción de reservas y dashboard).

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Backend** | Python + FastAPI + Uvicorn | ≥ 3.11 |
| **ORM** | SQLAlchemy | 2.x |
| **Validación** | Pydantic + pydantic-settings | 2.x |
| **Autenticación** | python-jose (JWT) + passlib (bcrypt) | — |
| **Base de datos** | SQL Server vía pyodbc | ODBC 17+ |
| **Frontend Admin** | React 18 + TypeScript + Vite, MUI 5 | puerto 5175 |
| **Frontend Público** | React 18 + TypeScript + Vite, MUI 5 | puerto 5174 |
| **Documentación API** | Swagger UI (OpenAPI) | `/docs` |

---

## Arquitectura

```
[Portal Público SPA]  ──┐
[Portal Admin SPA]    ──┼──> [API REST (FastAPI)] ──> [Base de Datos (SQL Server)]
                        │
                        └──> [Event Bus] ──> [Notificaciones]*
```

> *Notificaciones SMTP pendiente de configurar.*

### Backend — Monolito Modular + DDD

```
backend/
├── app/                            # FastAPI
│   ├── core/                       # Cross-cutting: auth, audit, cache, config, db, events, exceptions, security
│   ├── models.py                   # ORM (SQLAlchemy)
│   ├── modules/                    # Módulos de negocio
│   │   ├── auth/                   # Autenticación
│   │   ├── pacientes/              # Pacientes + HC + documentos
│   │   ├── personal/               # Médicos, enfermeros, especialidades, departamentos, ubicaciones, horarios
│   │   ├── citas/                  # Reservas web + citas médicas
│   │   ├── admisiones/             # Hospitalización + habitaciones
│   │   └── dashboard/              # Métricas
│   └── main.py
├── domain/                         # Capa de dominio (DDD)
│   ├── entities/                   # Entidades de negocio
│   ├── value_objects/              # Value objects (DNI, RangoHorario, EstadoCita, etc.)
│   ├── repositories.py             # Interfaces de repositorio
│   └── events/                     # Eventos de dominio
├── application/services/           # Casos de uso
├── infrastructure/                 # Implementaciones
│   ├── repositories/               # Repositorios SQLAlchemy
│   ├── mappers/                    # ORM → Dominio
│   └── uow.py                      # Unit of Work
├── database/
│   ├── init.sql                    # Esquema DDL
│   └── seed_data.sql               # Datos de prueba
├── tests/
│   └── integration/
└── requirements.txt
```

Cada módulo sigue la estructura: `router.py` → `service.py` → `schemas.py`.

### Frontend — Dos SPAs Independientes

```
frontend/
├── admin/                          # Portal Administrativo (Vite, puerto 5175)
│   └── src/
│       ├── App.tsx                 # Routes
│       ├── types/index.ts          # Interfaces TypeScript
│       ├── services/api.ts         # Axios + JWT interceptor
│       ├── store/AuthContext.tsx    # Auth
│       ├── components/
│       │   ├── layout/             # AdminLayout, Sidebar, AdminHeader
│       │   ├── auth/               # PrivateRoute
│       │   ├── table/              # DataTable genérico
│       │   └── ui/                 # Modales reutilizables
│       │       ├── EditarCitaModal.tsx
│       │       ├── EditarHabitacionModal.tsx
│       │       ├── ConvertirCitaModal.tsx
│       │       ├── RechazarReservaModal.tsx
│       │       ├── DetalleCitaModal.tsx
│       │       ├── DetalleReservaModal.tsx
│       │       ├── DialogSection.tsx
│       │       ├── PageHeader.tsx
│       │       ├── StatusBadge.tsx
│       │       └── KpiCard.tsx
│       └── pages/
│           ├── auth/               # Login, ForgotPassword, ResetPassword
│           ├── dashboard/          # DashboardPage
│           ├── recepcion/          # BandejaRecepcion
│           ├── citas/              # AdmisionCitas
│           ├── habitaciones/       # PanelCuartos
│           ├── departamentos/      # DepartamentosPage
│           └── ubicaciones/        # UbicacionesPage
│
└── public/                         # Portal Público (Vite, puerto 5174)
    └── src/
        ├── App.tsx
        ├── components/layout/      # PublicLayout
        └── pages/
            ├── PublicPortal/       # Inicio, SolicitudCita (wizard 4 pasos)
            ├── auth/               # Login, Register, ForgotPassword, ResetPassword
            ├── medicos/            # MedicosPage
            └── citas/              # MisReservasPage
```

---

## Módulos del Sistema

### 1. Autenticación y Usuarios (`/api/v1/auth`)

Gestión de acceso para personal administrativo (`USUARIO`) y pacientes (`PACIENTE_AUTH`).

| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/auth/login` | POST | No | Login de personal administrativo |
| `/auth/login/paciente` | POST | No | Login de pacientes |
| `/auth/register` | POST | No | Registro de paciente |
| `/auth/refresh` | POST | No | Refrescar token |
| `/auth/forgot-password` | POST | No | Solicitar restablecimiento |
| `/auth/reset-password` | POST | No | Restablecer contraseña |
| `/auth/me` | GET | Bearer | Datos del usuario autenticado |

**Credenciales por defecto:**

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | `admin@clinix.com` | `admin123` |
| Médico demo | `alberto.rivera@sanpablo.com` | `clinix123` |
| Enfermero demo | `maria.gomez@sanpablo.com` | `clinix123` |
| Paciente demo | `juan.perez@gmail.com` | `paciente123` |

**Roles:**
- **Administrador** — Control total
- **Médico** — Citas, HC, admisiones
- **Enfermero** — Pacientes y admisiones asignadas
- **Recepcionista** — Citas, pacientes, reservas
- **Paciente** — Portal público

---

### 2. Gestión de Pacientes (`/api/v1/pacientes`)

CRUD completo + historias clínicas + documentos adjuntos. Soft-delete.

---

### 3. Gestión de Personal (`/api/v1/...`)

Especialidades, departamentos, ubicaciones, médicos, enfermeros y horarios.

**Catálogos (CRUD completo — frontend implementado):**

| Página | Ruta | Descripción |
|--------|------|-------------|
| Departamentos | `/departamentos` | CRUD con tabla, búsqueda, modal crear/editar, soft-delete |
| Ubicaciones | `/ubicaciones` | CRUD con filtro por departamento, tipo (Consultorio, Operaciones, etc.), piso |

---

### 4. Citas y Reservas (`/api/v1/...`)

Flujo completo: solicitud web pública → revisión administrativa → conversión a cita o rechazo.

```
Portal Público → ReservaWeb (Pendiente)
                      ↓
           Bandeja Recepción (/bandeja)
                    ↙          ↘
            Convertir          Rechazar
              (CITA)        (con motivo)
```

**Admisión Directa:** El recepcionista puede agendar citas desde `/citas` sin formulario web (búsqueda de paciente, especialidad, médico, horarios disponibles, ubicación).

---

### 5. Admisiones y Hospitalización (`/api/v1/...`)

Control de hospitalización con gestión de habitaciones.

**Panel de Cuartos (`/habitaciones`):** Grid dinámico de tarjetas agrupadas por departamento, con indicadores visuales de estado, capacidad y filtros. Crear/editar habitaciones desde el mismo panel vía modal.

---

### 6. Dashboard (`/api/v1/dashboard`)

Métricas agregadas y actividades recientes.

---

## Base de Datos

### Tablas principales

| Tabla | Descripción |
|-------|-------------|
| `CLINICA` | Clínicas (multi-tenant) |
| `ESPECIALIDAD` | Especialidades médicas |
| `DEPARTAMENTO` | Departamentos por clínica |
| `UBICACION_FISICA` | Consultorios, salas |
| `HABITACION` | Habitaciones (con tipo, capacidad, estado) |
| `USUARIO` | Personal (con rol y ubicación) |
| `MEDICO` / `ENFERMERO` | Personal médico |
| `HORARIO_MEDICO` | Disponibilidad semanal |
| `PACIENTE` / `PACIENTE_AUTH` | Pacientes y su autenticación |
| `RESERVA_WEB` | Solicitudes de cita online |
| `CITA` | Citas médicas |
| `ADMISION` | Hospitalizaciones |
| `HISTORIA_CLINICA` | Registros de atención |
| `DOCUMENTO_ADJUNTO` | Archivos adjuntos |
| `LOG_AUDITORIA` | Auditoría de acciones |

### Vistas del Dashboard

`VW_MEDICOS_ACTIVOS`, `VW_ENFERMEROS_ACTIVOS`, `VW_CITAS_HOY`, `VW_ADMISIONES_ACTIVAS`, `VW_HABITACIONES_DISPONIBLES`, `VW_DASHBOARD_METRICAS`.

### Seed Data

En desarrollo se usa SQLite por defecto. Al iniciar el backend por primera vez, SQLAlchemy crea
`backend/clinix.db` y carga automáticamente `database/seed_data.sql`: 3 clínicas,
10 especialidades, 22 médicos, 4 enfermeros, 10 pacientes, reservas, citas,
admisiones, historias clínicas y auditoría. Los placeholders de contraseña se
reemplazan por hashes bcrypt funcionales.

SQL Server sigue soportado configurando `DATABASE_URL`; para una instalación manual
se conservan `database/init.sql` y `database/seed_data.sql`.

---

## Seguridad

- JWT (access token 60 min + refresh token 7 días)
- bcrypt via passlib
- RBAC granular por endpoint
- Auth separada: personal (`USUARIO`) vs pacientes (`PACIENTE_AUTH`)
- Recuperación de contraseña con token por email
- Soft-delete en todas las entidades
- Auditoría funcional (`LOG_AUDITORIA`)
- CORS habilitado para desarrollo

---

## Instalación y Ejecución

### Prerrequisitos

- Python 3.11 o 3.12
- Node.js ≥ 18
- PowerShell 5+ en Windows

SQL Server es opcional. Para desarrollo local no hace falta instalar ningún servidor
de base de datos.

### Instalación automática en Windows

```powershell
.\setup.ps1
.\run-dev.ps1
```

Servicios:

- Portal público: `http://localhost:5174`
- Portal administrativo: `http://localhost:5175`
- API: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`

### Instalación manual

```powershell
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

En otras terminales:

```powershell
cd frontend/admin
npm ci
npm run dev

cd frontend/public
npm ci
npm run dev
```

Las variables disponibles están documentadas en los archivos `.env.example` de cada
aplicación. `VITE_API_URL` permite cambiar la URL de la API.

---

## Frontend — Rutas del Admin

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/dashboard` | DashboardPage | Métricas y actividad reciente |
| `/bandeja` | BandejaRecepcion | Reservas web pendientes de revisión |
| `/doctores` | DoctoresPage | CRUD de médicos y horarios |
| `/enfermeras` | EnfermerasPage | CRUD de personal de enfermería |
| `/pacientes` | PacientesPage | CRUD, detalle e historias clínicas |
| `/especialidades` | EspecialidadesPage | CRUD de especialidades |
| `/citas` | AdmisionCitas | CRUD de citas (admisión directa) |
| `/reservas` | BandejaRecepcion | Revisión, asignación, conversión y rechazo |
| `/habitaciones` | PanelCuartos | Grid de cuartos + crear/editar |
| `/admisiones` | AdmisionesPage | Ingreso hospitalario y alta médica |
| `/auditoria` | AuditoriaPage | Logs con filtros y paginación |
| `/panel/doctor` | PanelMedicoPage | Agenda y pacientes hospitalizados |
| `/panel/enfermeria` | PanelEnfermeriaPage | Pacientes asignados |
| `/departamentos` | DepartamentosPage | CRUD de departamentos |
| `/ubicaciones` | UbicacionesPage | CRUD de ubicaciones físicas |

---

## API — Endpoints completos

Para la lista completa de endpoints (70+), consultar la documentación Swagger en `/docs` al ejecutar el backend.

Endpoint principales por módulo:

| Módulo | Métodos principales |
|--------|-------------------|
| Auth | `POST /login`, `POST /refresh`, `GET /me` |
| Pacientes | `GET/POST/PUT/DELETE /pacientes`, `GET/POST /historias`, `POST/DELETE /documentos` |
| Personal | `CRUD /especialidades`, `CRUD /departamentos`, `CRUD /ubicaciones`, `CRUD /medicos`, `CRUD /enfermeros`, `CRUD /horarios` |
| Citas/Reservas | `GET/POST/PUT/DELETE /citas`, `GET/POST/PUT/DELETE /reservas`, `POST /convertir`, `POST /rechazar`, `GET /disponibilidad` |
| Habitaciones | `CRUD /habitaciones` |
| Admisiones | `CRUD /admisiones`, `POST /alta` |
| Dashboard | `GET /dashboard`, `GET /dashboard/metricas` |
| Auditoría | `GET /auditoria` |
| Paneles | `GET /medico/mis-citas`, `GET /medico/mis-admisiones`, `GET /enfermero/mis-pacientes` |
| Público | `GET /public/especialidades`, `GET /public/medicos`, `POST /public/reservas`, `GET /public/mis-reservas` |

---

## Implementado recientemente

- [x] **Módulo de Logística Física** — Panel de Cuartos con grid dinámico, filtros, indicadores de ocupación
- [x] **CRUD de Habitaciones** — Crear/editar desde el Panel de Cuartos vía modal (departamento, número, piso, tipo, capacidad, estado)
- [x] **CRUD de Departamentos** — Página dedicada con tabla, búsqueda, modal crear/editar, soft-delete
- [x] **CRUD de Ubicaciones** — Página dedicada con filtro por departamento, tipo (Consultorio, Operaciones, etc.), piso
- [x] **Módulo de Captación y Recepción** — Flujo completo solicitud → bandeja → convertir/rechazar
- [x] Portal Público: Landing page + wizard solicitud de cita en 4 pasos
- [x] Portal Admin: Bandeja de recepción con modales convertir/rechazar/detalle
- [x] Creación automática de paciente al convertir reserva (por DNI)
- [x] Recuperación de contraseña
- [x] Bus de eventos síncrono (ReservaCreada, CitaConfirmada, PacienteAdmitido, AltaMedica)
- [x] Auditoría funcional con escritura en `LOG_AUDITORIA`
- [x] Caché en memoria para disponibilidad de horarios
- [x] Envío de emails via SMTP (requiere configurar `.env`)
- [x] Tests de integración (pytest) — auth, reserva, admisión
- [x] Refactor a Clean Architecture/DDD: domain, application, infrastructure layers
- [x] Seed data completo en `database/seed_data.sql`
- [x] Auto-seed funcional para SQLite con credenciales demo
- [x] Panel Admin completo: médicos, enfermería, pacientes, especialidades, reservas, admisiones, auditoría y paneles por rol
- [x] Scripts `setup.ps1` y `run-dev.ps1`

## Pendiente

- [ ] Notificaciones asíncronas (RabbitMQ / Celery / Service Bus)
- [ ] Subida real de archivos (Blob Storage / multipart)
- [ ] API Gateway (Ocelot, Kong)
- [ ] Docker y docker-compose
- [ ] Migración a Alembic
- [ ] Tests unitarios de dominio (pytest)
- [ ] Refactor: services legacy → repositorios + UoW

---

## Desarrollo

### Convenciones

- **API versionada**: Prefijo `/api/v1/`
- **Respuestas**: JSON con códigos HTTP estándar
- **Errores**: Excepciones HTTP personalizadas
- **Paginación**: Parámetros `skip` / `limit`
- **Soft-delete**: `Activo = false`, no se eliminan registros
- **Código**: Sin comentarios, tipado estricto, estructurado por módulo

### Licencia

Uso interno / educativo.
