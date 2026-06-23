from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import HTTPException, RequestValidationError
from fastapi.responses import JSONResponse

from app.core.database import engine, Base, SessionLocal
from app.core.dependencies import require_role
from app.core.exceptions import CredentialsError, ForbiddenError, NotFoundError, ConflictError
from app.core.events import subscribe_all
from app.core.config import settings
from app.core.seed import initialize_seed_data, should_rebuild_sqlite_demo
from app.modules.auth.router import router as auth_router
from app.modules.pacientes.router import router as pacientes_router
from app.modules.personal.router import router as personal_router
from app.modules.citas.router import router as citas_router
from app.modules.admisiones.router import router as admisiones_router
from app.modules.dashboard.router import router as dashboard_router
from app.modules.auditoria.router import router as auditoria_router
from app.modules.cie10.router import router as cie10_router


def init_seed_data():
    db = SessionLocal()
    try:
        if (
            engine.dialect.name == "sqlite"
            and settings.DEMO_SEED
            and should_rebuild_sqlite_demo(db)
        ):
            db.close()
            Base.metadata.drop_all(bind=engine)
            Base.metadata.create_all(bind=engine)
            db = SessionLocal()
        initialize_seed_data(db, engine.dialect.name, settings.DEMO_SEED)
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
app.include_router(auditoria_router)
app.include_router(cie10_router)


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
