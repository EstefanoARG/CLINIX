# CLINIX - Sistema Integral de Gestión Hospitalaria

Sistema de gestión hospitalaria con **portal público** para pacientes (solicitud de citas online) y **portal administrativo** para el personal de la clínica (gestión de doctores, enfermeros, pacientes, citas, admisiones, habitaciones, historias clínicas y dashboard).

---

## Arquitectura

### Diagrama de componentes

```
[Portal Público SPA]  ──┐
[Portal Admin SPA]    ──┼──> [API REST (FastAPI)] ──> [Base de Datos]
                        │
                        └──> [Event Bus] ──> [Notificaciones]*

> *\* Notificaciones SMTP pendiente de configurar*

### Backend (monolito modular)

```
backend/
├── app/
│   ├── core/                    # Capa de infraestructura cross-cutting
│   │   ├── audit.py             # Registro de auditoría funcional
│   │   ├── cache.py             # MemoryCache para disponibilidad
│   │   ├── config.py            # Configuración (pydantic-settings)
│   │   ├── database.py          # SQLAlchemy engine + session
│   │   ├── dependencies.py      # Dependencias FastAPI (auth, roles)
│   │   ├── email_sender.py      # Envío de emails (SMTP)
│   │   ├── events.py            # Bus de eventos síncrono
│   │   ├── exceptions.py        # Excepciones HTTP personalizadas
│   │   └── security.py          # JWT + bcrypt
│   │
│   ├── models.py                # Modelos ORM (SQLAlchemy)
│   │
│   ├── modules/                 # Módulos de negocio (monolito)
│   │   ├── auth/                # Autenticación y usuarios
│   │   ├── pacientes/           # CRUD pacientes + historias clínicas
│   │   ├── personal/            # Médicos, enfermeros, especialidades
│   │   ├── citas/               # Reservas web + citas médicas
│   │   ├── admisiones/          # Hospitalización + habitaciones
│   │   └── dashboard/           # Métricas y reportes
│   │
│   └── main.py                  # Punto de entrada FastAPI
│
├── domain/                      # Capa de dominio (DDD)
│   ├── entities/                # Entidades de negocio
│   │   ├── paciente.py
│   │   ├── reserva.py
│   │   ├── cita.py
│   │   ├── admision.py
│   │   ├── habitacion.py
│   │   └── ...
│   ├── value_objects/           # Value objects (DNI, Email, etc.)
│   │   └── dni.py
│   ├── repositories/            # Interfaces de repositorio
│   │   └── ...
│   └── events/                  # Eventos de dominio
│       └── ...
│
├── application/                 # Capa de aplicación (DDD)
│   └── services/                # Casos de uso
│       └── ...
│
├── infrastructure/              # Capa de infraestructura (DDD)
│   ├── repositories/            # Implementaciones de repositorios
│   ├── mappers/                 # Mappers ORM → Dominio
│   │   ├── paciente_mapper.py
│   │   ├── reserva_mapper.py
│   │   ├── cita_mapper.py
│   │   ├── admision_mapper.py
│   │   └── habitacion_mapper.py
│   └── uow.py                   # Unit of Work
│
├── database/
│   └── init.sql                 # Esquema completo SQL Server
│
├── tests/
│   ├── conftest.py              # Fixtures compartidos (TestClient, DB)
│   └── integration/             # Tests de integración
│       ├── test_auth_flow.py
│       ├── test_reserva_flow.py
│       └── test_admision_flow.py
│
├── .env                         # Variables de entorno
├── pyproject.toml
└── requirements.txt
```

Cada módulo sigue la estructura:
- **`router.py`** → Definición de endpoints HTTP
- **`service.py`** → Lógica de negocio
- **`schemas.py`** → Validación Pydantic (request/response)

### Frontend (dos SPAs independientes)

```
frontend/
├── admin/                       # Portal Administrativo (puerto 5173)
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── components/          # (por implementar)
│       ├── pages/               # (por implementar)
│       └── services/            # (por implementar)
│
└── public/                      # Portal Público (puerto 5174)
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── components/          # (por implementar)
        ├── pages/               # (por implementar)
        └── services/            # (por implementar)
```

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Backend** | Python + FastAPI + Uvicorn | ≥3.11 / 0.1.0 |
| **ORM** | SQLAlchemy | 2.x |
| **Validación** | Pydantic + pydantic-settings | 2.x |
| **Autenticación** | python-jose (JWT) + passlib (bcrypt) | — |
| **Base de datos** | SQL Server vía pyodbc | — |
| **Frontend Admin** | React 18 + TypeScript + Vite | puerto 5173 |
| **Frontend Público** | React 18 + TypeScript + Vite | puerto 5174 |
| **Documentación API** | Swagger UI (OpenAPI) | `/docs` |

---

## Módulos del Sistema

### 1. Autenticación y Usuarios (`/api/v1/auth`)

Gestión de acceso para personal administrativo (`USUARIO`) y pacientes (`PACIENTE_AUTH`).

| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/auth/login` | POST | No | Login de personal administrativo |
| `/auth/login/paciente` | POST | No | Login de pacientes (portal público) |
| `/auth/register` | POST | No | Registro de paciente en portal público |
| `/auth/refresh` | POST | No | Refrescar token (refresh_token) |
| `/auth/forgot-password` | POST | No | Solicitar restablecimiento de contraseña |
| `/auth/reset-password` | POST | No | Restablecer contraseña con token |
| `/auth/me` | GET | Bearer | Datos del usuario autenticado |

**Credenciales por defecto (seed):**
| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | `admin@clinix.com` | `admin123` |

**Roles del sistema:**
| Rol | Acceso |
|-----|--------|
| **Administrador** | Control total del sistema |
| **Médico** | Gestión de citas, historias clínicas, admisiones |
| **Enfermero** | Visualización de pacientes y admisiones asignadas |
| **Recepcionista** | Gestión de citas, pacientes y reservas |
| **Paciente** | Solicitud de citas vía portal público |

### 2. Gestión de Pacientes (`/api/v1/pacientes`)

CRUD completo de pacientes, historias clínicas y documentos adjuntos. Soft-delete (desactiva en lugar de borrar).

| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/pacientes` | GET | Admin/Med/Rec | Listar pacientes (paginado) |
| `/pacientes/buscar?q=` | GET | Admin/Med/Rec | Buscar por DNI, nombre, email |
| `/pacientes/{id}` | GET | Admin/Med/Rec | Obtener paciente |
| `/pacientes` | POST | Admin/Med | Crear paciente |
| `/pacientes/{id}` | PUT | Admin/Rec | Actualizar paciente (incluye DNI) |
| `/pacientes/{id}` | DELETE | Admin | Soft-delete (Activo = false) |
| `/pacientes/{id}/historias` | GET | Admin/Med/Rec | Listar historias clínicas |
| `/pacientes/{id}/historias` | POST | Admin/Med | Crear historia clínica |
| `/pacientes/{id}/historias/{hid}` | GET | Admin/Med/Rec | Obtener historia clínica |
| `/pacientes/{id}/historias/{hid}` | PUT | Admin/Med | Actualizar historia clínica |
| `/pacientes/{id}/historias/{hid}/documentos` | POST | Admin/Med | Adjuntar documento |
| `/pacientes/{id}/historias/{hid}/documentos` | GET | Admin/Med/Rec | Listar documentos |
| `/pacientes/{id}/historias/{hid}/documentos/{did}` | DELETE | Admin | Eliminar documento |

### 3. Gestión de Personal (`/api/v1/...`)

Agrupa especialidades, departamentos, ubicaciones, médicos, enfermeros y horarios.

| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/public/medicos` | GET | No | Listar médicos activos (público, filtro por especialidad) |
| `/especialidades` | GET | Todos | Listar especialidades médicas |
| `/especialidades` | POST | Admin | Crear especialidad |
| `/especialidades/{id}` | PUT | Admin | Actualizar especialidad |
| `/especialidades/{id}` | DELETE | Admin | Eliminar especialidad |
| `/departamentos` | GET | Todos | Listar departamentos |
| `/departamentos` | POST | Admin | Crear departamento |
| `/departamentos/{id}` | PUT | Admin | Actualizar departamento |
| `/departamentos/{id}` | DELETE | Admin | Soft-delete departamento |
| `/ubicaciones` | GET | Todos | Listar ubicaciones físicas |
| `/ubicaciones` | POST | Admin | Crear ubicación |
| `/medicos` | GET | Todos | Listar médicos (filtro por especialidad) |
| `/medicos/buscar?q=` | GET | Todos | Buscar médicos |
| `/medicos/{id}` | GET | Todos | Obtener médico con horarios |
| `/medicos` | POST | Admin | Crear médico (crea Usuario + Médico) |
| `/medicos/{id}` | PUT | Admin | Actualizar médico |
| `/medicos/{id}` | DELETE | Admin | Soft-delete médico + usuario |
| `/enfermeros` | GET | Todos | Listar enfermeros |
| `/enfermeros/buscar?q=` | GET | Todos | Buscar enfermeros |
| `/enfermeros/{id}` | GET | Todos | Obtener enfermero |
| `/enfermeros` | POST | Admin | Crear enfermero (crea Usuario + Enfermero) |
| `/enfermeros/{id}` | PUT | Admin | Actualizar enfermero |
| `/enfermeros/{id}` | DELETE | Admin | Soft-delete enfermero + usuario |
| `/medicos/{id}/horarios` | GET | Todos | Horarios de un médico |
| `/horarios` | POST | Admin | Crear horario |
| `/horarios/{id}` | PUT | Admin | Actualizar horario |
| `/horarios/{id}` | DELETE | Admin | Eliminar horario |

### 4. Citas y Reservas (`/api/v1/...`)

Flujo completo: solicitud web pública → revisión administrativa → conversión a cita médica.

| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/public/reservas` | POST | No | Solicitar cita (portal público) |
| `/public/mis-reservas` | GET | Bearer(Paciente) | Mis solicitudes de cita (portal público) |
| `/reservas` | GET | Admin/Med/Rec | Listar reservas (filtro por estado) |
| `/reservas/{id}` | GET | Admin/Med/Rec | Obtener reserva |
| `/reservas/{id}` | PUT | Admin/Rec | Actualizar estado/observación |
| `/reservas/{id}` | DELETE | Admin | Eliminar reserva |
| `/reservas/{id}/convertir` | POST | Admin/Rec | Convertir reserva en cita |
| `/citas` | GET | Admin/Med/Rec | Listar citas (filtros múltiples) |
| `/citas/{id}` | GET | Admin/Med/Rec | Obtener cita |
| `/citas` | POST | Admin/Rec/Med | Crear cita (con detección de conflictos) |
| `/citas/{id}` | PUT | Admin/Rec/Med | Actualizar cita |
| `/citas/{id}` | DELETE | Admin/Rec | Cancelar cita (soft-delete) |
| `/disponibilidad/{medico_id}?fecha=` | GET | Sí | Ver slots disponibles del médico |

**Flujo reserva → cita:**
1. **Portal Público**: Paciente solicita cita → se crea `RESERVA_WEB` (Estado: Pendiente, AceptaTerminos obligatorio)
2. **Administrativo**: Revisa la reserva, asigna médico si es necesario, confirma
3. **Conversión**: Se crea `CITA` con los datos de la reserva, la reserva pasa a estado "Convertida"

### 5. Admisiones y Hospitalización (`/api/v1/...`)

Control de hospitalización con gestión del estado de habitaciones.

| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/habitaciones` | GET | Todos | Listar habitaciones (filtros) |
| `/habitaciones/{id}` | GET | Todos | Obtener habitación |
| `/habitaciones` | POST | Admin | Crear habitación |
| `/habitaciones/{id}` | PUT | Admin | Actualizar habitación |
| `/habitaciones/{id}` | DELETE | Admin | Poner en mantenimiento |
| `/admisiones` | GET | Todos | Listar admisiones (paginado) |
| `/admisiones/{id}` | GET | Todos | Obtener admisión |
| `/admisiones` | POST | Admin/Med/Rec | Crear admisión (marca habitación Ocupada) |
| `/admisiones/{id}` | PUT | Admin/Med/Enf | Actualizar admisión (cambiar habitación) |
| `/admisiones/{id}/alta` | POST | Admin/Med | Dar de alta (libera habitación) |

**Flujo de admisión:**
1. El paciente requiere hospitalización (desde cita o emergencia)
2. Se crea `ADMISION` con médico tratante, enfermero asignado y habitación
3. La habitación cambia a **"Ocupada"**
4. Al recibir alta médica, se registra diagnóstico de alta y la habitación vuelve a **"Disponible"**

### 6. Dashboard (`/api/v1/dashboard`)

Métricas agregadas y actividades recientes para el panel principal.

| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/dashboard` | GET | Admin | Métricas + actividades recientes |
| `/dashboard/metricas` | GET | Admin | Métricas agregadas (solo datos) |

**Métricas:**
- Total doctores activos, enfermeros activos, pacientes activos
- Total habitaciones, disponibles y ocupadas
- Citas programadas para hoy
- Admisiones activas
- Reservas web pendientes
- Pacientes registrados hoy

---

## Base de Datos

### Motor

SQL Server. La conexión se configura vía `.env` (variable `DATABASE_URL`). El script completo de creación está en `database/init.sql`.

### Tablas

| Tabla | Descripción | FK a |
|-------|-------------|------|
| `CLINICA` | Clínicas (multi-tenant) | — |
| `ESPECIALIDAD` | Catálogo de especialidades | — |
| `ROLE` | Roles del sistema | — |
| `DEPARTAMENTO` | Departamentos por clínica | CLINICA |
| `UBICACION_FISICA` | Consultorios, salas, etc. | DEPARTAMENTO |
| `HABITACION` | Habitaciones de hospitalización | DEPARTAMENTO |
| `USUARIO` | Personal administrativo | CLINICA, ROLE, UBICACION_FISICA |
| `LOG_AUDITORIA` | Auditoría de acciones | USUARIO |
| `MEDICO` | Médicos (extiende USUARIO) | USUARIO, ESPECIALIDAD, DEPARTAMENTO |
| `HORARIO_MEDICO` | Disponibilidad semanal | MEDICO |
| `ENFERMERO` | Enfermeros (extiende USUARIO) | USUARIO, DEPARTAMENTO |
| `PACIENTE` | Pacientes | CLINICA |
| `PACIENTE_AUTH` | Autenticación de pacientes | PACIENTE |
| `RESERVA_WEB` | Solicitudes de cita (portal público) | PACIENTE, ESPECIALIDAD, MEDICO, CITA |
| `CITA` | Citas médicas | PACIENTE, MEDICO, ESPECIALIDAD, UBICACION_FISICA, RESERVA_WEB |
| `ADMISION` | Hospitalizaciones | PACIENTE, MEDICO, ENFERMERO, HABITACION, CITA |
| `HISTORIA_CLINICA` | Registros de atención médica | PACIENTE, MEDICO, CITA, ADMISION |
| `DOCUMENTO_ADJUNTO` | Archivos adjuntos a historias | HISTORIA_CLINICA |

### Vistas del Dashboard

| Vista | Propósito |
|-------|-----------|
| `VW_MEDICOS_ACTIVOS` | Médicos activos con especialidad y departamento |
| `VW_ENFERMEROS_ACTIVOS` | Enfermeros activos con departamento y turno |
| `VW_CITAS_HOY` | Citas del día completo |
| `VW_ADMISIONES_ACTIVAS` | Hospitalizaciones activas con detalle |
| `VW_HABITACIONES_DISPONIBLES` | Habitaciones disponibles |
| `VW_DASHBOARD_METRICAS` | Métricas agregadas por clínica |

### Seed Data

Se cargan en dos etapas:

1. **`database/init.sql`** (ejecución manual): Carga datos de prueba completos:
   - **3 clínicas**: San Pablo, Internacional, El Golf
   - **7 especialidades**: Cardiología, Neurología, Pediatría, etc.
   - **4 roles**: Administrador, Médico, Enfermero, Recepcionista
   - **6 departamentos**, 8 ubicaciones físicas, 8 habitaciones
   - **8 usuarios** (personal), **3 médicos**, **2 enfermeros**
   - **5 pacientes**, 4 con autenticación
   - **3 reservas web**, **4 citas**, **2 admisiones activas**
   - **3 historias clínicas**, **4 documentos adjuntos**

2. **`init_seed_data()`** (automático al iniciar el backend): Si la tabla `ROLE` está vacía, inserta:
   - **1 clínica**: CLINIX Central
   - **4 roles**: Administrador, Médico, Enfermero, Recepcionista
   - **1 usuario admin**: admin@clinix.com / admin123

> ⚠️ Las contraseñas del `init.sql` son placeholders (`'hash_pass_...'`). Los usuarios funcionales para login son los creados por `init_seed_data()` del backend.

---

## Seguridad

- **Autenticación JWT**: Access token (default 60 min) + Refresh token (default 7 días)
- **Hash de contraseñas**: bcrypt via passlib
- **Autorización RBAC**: Control granular por endpoint basado en roles
- **Separación de autenticación**: Personal (`USUARIO`) vs pacientes (`PACIENTE_AUTH`)
- **Refresh de sesión**: Endpoint `/auth/refresh` para renovar access token sin re-login
- **Recuperación de contraseña**: Flujo forgot-password → email con token → reset-password
- **Soft-delete**: Nunca se eliminan registros físicamente (Activo = false)
- **CORS**: Habilitado para todos los orígenes en desarrollo

---

## Instalación y Ejecución

### Prerrequisitos

- Python ≥ 3.11
- Node.js ≥ 18
- SQL Server (con ODBC Driver 17+)

### Backend

1. Asegurar que SQL Server esté corriendo con la base de datos `Clinix` creada.

2. Ejecutar el script de base de datos:
   ```bash
   sqlcmd -S localhost -i database/init.sql
   ```

3. Verificar/configurar `.env` (ya incluido en el repo):
   ```env
   DATABASE_URL=mssql+pyodbc://@localhost/Clinix?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes
   ```

4. Instalar dependencias e iniciar:
   ```bash
   cd backend
   python -m venv .venv
   .venv\Scripts\activate    # Windows
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```

La API estará en `http://localhost:8000`. Documentación Swagger en `/docs`. Al iniciar, `Base.metadata.create_all()` sincroniza las tablas y `init_seed_data()` inserta el usuario administrador por defecto si la tabla `ROLE` está vacía.

### Frontend

```bash
# Portal Administrativo
cd frontend/admin
npm install
npm run dev      # http://localhost:5173

# Portal Público
cd frontend/public
npm install
npm run dev      # http://localhost:5174
```

---

## API - Endpoints completos

| Método | Ruta | Auth |
|--------|------|------|
| `GET` | `/` | No |
| `GET` | `/api/v1/seed` | Admin |
| `POST` | `/api/v1/auth/login` | No |
| `POST` | `/api/v1/auth/login/paciente` | No |
| `POST` | `/api/v1/auth/register` | No |
| `POST` | `/api/v1/auth/refresh` | No |
| `POST` | `/api/v1/auth/forgot-password` | No |
| `POST` | `/api/v1/auth/reset-password` | No |
| `GET` | `/api/v1/auth/me` | Bearer |
| `GET` | `/api/v1/pacientes` | Admin/Med/Rec |
| `GET` | `/api/v1/pacientes/buscar` | Admin/Med/Rec |
| `GET` | `/api/v1/pacientes/{id}` | Admin/Med/Rec |
| `POST` | `/api/v1/pacientes` | Admin/Med |
| `PUT` | `/api/v1/pacientes/{id}` | Admin/Rec |
| `DELETE` | `/api/v1/pacientes/{id}` | Admin |
| `GET` | `/api/v1/pacientes/{id}/historias` | Admin/Med/Rec |
| `POST` | `/api/v1/pacientes/{id}/historias` | Admin/Med |
| `GET` | `/api/v1/pacientes/{id}/historias/{hid}` | Admin/Med/Rec |
| `PUT` | `/api/v1/pacientes/{id}/historias/{hid}` | Admin/Med |
| `POST` | `/api/v1/pacientes/{id}/historias/{hid}/documentos` | Admin/Med |
| `GET` | `/api/v1/pacientes/{id}/historias/{hid}/documentos` | Admin/Med/Rec |
| `DELETE` | `/api/v1/pacientes/{id}/historias/{hid}/documentos/{did}` | Admin |
| `GET` | `/api/v1/especialidades` | Todos |
| `POST` | `/api/v1/especialidades` | Admin |
| `PUT` | `/api/v1/especialidades/{id}` | Admin |
| `DELETE` | `/api/v1/especialidades/{id}` | Admin |
| `GET` | `/api/v1/departamentos` | Todos |
| `POST` | `/api/v1/departamentos` | Admin |
| `PUT` | `/api/v1/departamentos/{id}` | Admin |
| `DELETE` | `/api/v1/departamentos/{id}` | Admin |
| `GET` | `/api/v1/ubicaciones` | Todos |
| `POST` | `/api/v1/ubicaciones` | Admin |
| `PUT` | `/api/v1/ubicaciones/{id}` | Admin |
| `DELETE` | `/api/v1/ubicaciones/{id}` | Admin |
| `GET` | `/api/v1/medicos` | Todos |
| `GET` | `/api/v1/medicos/buscar` | Todos |
| `GET` | `/api/v1/medicos/{id}` | Todos |
| `POST` | `/api/v1/medicos` | Admin |
| `PUT` | `/api/v1/medicos/{id}` | Admin |
| `DELETE` | `/api/v1/medicos/{id}` | Admin |
| `GET` | `/api/v1/enfermeros` | Todos |
| `GET` | `/api/v1/enfermeros/buscar` | Todos |
| `GET` | `/api/v1/enfermeros/{id}` | Todos |
| `POST` | `/api/v1/enfermeros` | Admin |
| `PUT` | `/api/v1/enfermeros/{id}` | Admin |
| `DELETE` | `/api/v1/enfermeros/{id}` | Admin |
| `GET` | `/api/v1/medicos/{id}/horarios` | Todos |
| `POST` | `/api/v1/horarios` | Admin |
| `PUT` | `/api/v1/horarios/{id}` | Admin |
| `DELETE` | `/api/v1/horarios/{id}` | Admin |
| `GET` | `/api/v1/public/medicos` | No |
| `POST` | `/api/v1/public/reservas` | No |
| `GET` | `/api/v1/public/mis-reservas` | Bearer(Paciente) |
| `GET` | `/api/v1/reservas` | Admin/Med/Rec |
| `GET` | `/api/v1/reservas/{id}` | Admin/Med/Rec |
| `PUT` | `/api/v1/reservas/{id}` | Admin/Rec |
| `DELETE` | `/api/v1/reservas/{id}` | Admin |
| `POST` | `/api/v1/reservas/{id}/convertir` | Admin/Rec |
| `GET` | `/api/v1/citas` | Admin/Med/Rec |
| `GET` | `/api/v1/citas/{id}` | Admin/Med/Rec |
| `POST` | `/api/v1/citas` | Admin/Rec/Med |
| `PUT` | `/api/v1/citas/{id}` | Admin/Rec/Med |
| `DELETE` | `/api/v1/citas/{id}` | Admin/Rec |
| `GET` | `/api/v1/disponibilidad/{medico_id}` | Bearer |
| `GET` | `/api/v1/habitaciones` | Todos |
| `GET` | `/api/v1/habitaciones/{id}` | Todos |
| `POST` | `/api/v1/habitaciones` | Admin |
| `PUT` | `/api/v1/habitaciones/{id}` | Admin |
| `DELETE` | `/api/v1/habitaciones/{id}` | Admin |
| `GET` | `/api/v1/admisiones` | Todos |
| `GET` | `/api/v1/admisiones/{id}` | Todos |
| `POST` | `/api/v1/admisiones` | Admin/Med/Rec |
| `PUT` | `/api/v1/admisiones/{id}` | Admin/Med/Enf |
| `POST` | `/api/v1/admisiones/{id}/alta` | Admin/Med |
| `GET` | `/api/v1/dashboard` | Admin |
| `GET` | `/api/v1/dashboard/metricas` | Admin |

---

## Desarrollo

### Convenciones

- **API versionada**: Prefijo `/api/v1/`
- **Respuestas**: JSON con códigos HTTP estándar (200, 201, 204, 400, 401, 403, 404, 409)
- **Errores**: Excepciones HTTP personalizadas con mensajes descriptivos
- **Paginación**: Parámetros `skip` y `limit` en endpoints de listado
- **Soft-delete**: Los registros se desactivan (Activo = false), no se eliminan
- **Código**: Sin comentarios, tipado estricto (Python type hints), estructurado por módulo

### Implementado recientemente

- [x] Recuperación de contraseña (endpoints `/auth/forgot-password`, `/auth/reset-password`)
- [x] Bus de eventos síncrono (`app/core/events.py`) con eventos: ReservaCreada, CitaConfirmada, PacienteAdmitido, AltaMedica
- [x] Log de auditoría funcional (`app/core/audit.py`) con escritura en `LOG_AUDITORIA`
- [x] Caché en memoria para disponibilidad de horarios (`app/core/cache.py`)
- [x] Envío de emails via SMTP (`app/core/email_sender.py`) — requiere configurar SMTP en `.env`
- [x] Tests de integración (pytest + TestClient) — auth, reserva, admisión
- [x] Endpoint público para listar médicos por especialidad (`GET /api/v1/public/medicos`)
- [x] Endpoint para que pacientes vean sus reservas (`GET /api/v1/public/mis-reservas`)
- [x] Refresh token (`POST /api/v1/auth/refresh`)
- [x] Capa DDD/Clean Architecture: `domain/`, `application/`, `infrastructure/` con repositorios, mappers, UoW

### Pendiente de implementar

- [ ] Notificaciones asíncronas (RabbitMQ / Service Bus / Celery)
- [ ] Subida real de archivos (Blob Storage / multipart upload)
- [ ] API Gateway (Ocelot, Kong, o similar)
- [ ] Docker y docker-compose
- [ ] Componentes de UI en ambos frontends (React)
- [ ] Migración a Alembic para control de versiones de BD
- [ ] Tests unitarios de dominio (pytest)
- [ ] Refactor: migrar services viejos (`app/modules/*/service.py`) a usar repositorios + UoW

---

## Licencia

Uso interno / educativo.
