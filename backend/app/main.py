from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import HTTPException, RequestValidationError
from fastapi.responses import JSONResponse

from app.core.database import engine, Base, SessionLocal
from app.core.security import hash_password
from app.core.dependencies import require_role
from app.core.exceptions import CredentialsError, ForbiddenError, NotFoundError, ConflictError
from app.core.events import subscribe_all
from app.models import Role, Clinica, Usuario
from app.modules.auth.router import router as auth_router
from app.modules.pacientes.router import router as pacientes_router
from app.modules.personal.router import router as personal_router
from app.modules.citas.router import router as citas_router
from app.modules.admisiones.router import router as admisiones_router
from app.modules.dashboard.router import router as dashboard_router


def init_seed_data():
    db = SessionLocal()
    try:
        if db.query(Role).count() == 0:
            roles = ["Administrador", "Médico", "Enfermero", "Recepcionista"]
            for r in roles:
                db.add(Role(NombreRole=r))
            db.flush()

        if db.query(Clinica).count() == 0:
            clinica = Clinica(
                Nombre="CLINIX Central",
                RUC="20123456789",
                Direccion="Av. Principal 123",
                Telefono="+51 1 234 5678",
                Email="contacto@clinix.com",
                PlanSuscripcion="Premium",
            )
            db.add(clinica)
            db.flush()

        admin_user = db.query(Usuario).filter(Usuario.Email == "admin@clinix.com").first()
        if not admin_user:
            clinica = db.query(Clinica).first()
            admin_role = db.query(Role).filter(Role.NombreRole == "Administrador").first()
            if clinica and admin_role:
                usuario = Usuario(
                    ClinicalID=clinica.ClinicalID,
                    RoleID=admin_role.RoleID,
                    Nombre="Admin",
                    Apellido="Sistema",
                    DNI="00000001",
                    Email="admin@clinix.com",
                    Telefono="+51 999 999 999",
                    PasswordHash=hash_password("admin123"),
                )
                db.add(usuario)
                db.flush()

        usuarios = db.query(Usuario).filter(Usuario.PasswordHash.like("hash_pass_%")).all()
        for user in usuarios:
            if "admin" in user.PasswordHash:
                user.PasswordHash = hash_password("admin123")
        db.flush()

        db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    Base.metadata.create_all(bind=engine)
    init_seed_data()
    subscribe_all()
    yield


app = FastAPI(
    title="CLINIX API - Sistema Integral de Gestión Hospitalaria",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(pacientes_router)
app.include_router(personal_router)
app.include_router(citas_router)
app.include_router(admisiones_router)
app.include_router(dashboard_router)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "error": "Validation Error",
            "detail": exc.errors(),
            "code": 422,
        },
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(_request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "detail": exc.detail,
            "code": exc.status_code,
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(_request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": str(exc) if str(exc) else "An unexpected error occurred",
            "code": 500,
        },
    )


@app.get("/")
def root():
    return {
        "message": "CLINIX API",
        "version": "0.1.0",
        "docs": "/docs",
    }


@app.get("/api/v1/seed")
def seed(_ = require_role(["Administrador"])):
    init_seed_data()
    return {"message": "Seed data created successfully"}
