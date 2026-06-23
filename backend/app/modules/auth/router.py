from fastapi import APIRouter

from app.core.dependencies import DbSession, CurrentUser
from app.modules.auth.schemas import (
    LoginRequest, PacienteRegisterRequest, UserResponse,
    ForgotPasswordRequest, ResetPasswordRequest, RefreshTokenRequest,
)
from app.modules.auth.service import AuthService

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])


@router.post("/login")
def login(request: LoginRequest, db: DbSession):
    service = AuthService(db)
    return service.login_admin(request)


@router.post("/login/paciente")
def login_paciente(request: LoginRequest, db: DbSession):
    service = AuthService(db)
    return service.login_paciente(request)


@router.post("/register")
def register(request: PacienteRegisterRequest, db: DbSession):
    service = AuthService(db)
    return service.register_paciente(request)


@router.post("/refresh")
def refresh_token(request: RefreshTokenRequest, db: DbSession):
    return AuthService(db).refresh_token(request.refresh_token)


@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: DbSession):
    return AuthService(db).forgot_password(request)


@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: DbSession):
    return AuthService(db).reset_password(request)


@router.get("/me")
def me(current_user: CurrentUser, db: DbSession):
    from app.models import Medico
    medico_id = None
    medico = db.query(Medico).filter(Medico.UsuarioID == current_user.UsuarioID).first()
    if medico:
        medico_id = medico.MedicoID
    return UserResponse(
        usuario_id=current_user.UsuarioID,
        nombre=current_user.Nombre,
        apellido=current_user.Apellido,
        email=current_user.Email,
        role=current_user.role.NombreRole,
        activo=current_user.Activo,
        medico_id=medico_id,
    )
