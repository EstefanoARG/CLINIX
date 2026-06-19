from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: int
    nombre: str
    role: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class PacienteRegisterRequest(BaseModel):
    clinical_id: int = 1
    dni: str = Field(..., min_length=8, max_length=20)
    nombre: str = Field(..., min_length=2, max_length=100)
    apellido: str = Field(..., min_length=2, max_length=100)
    email: str
    telefono: str | None = None
    password: str = Field(..., min_length=6)
    acepta_terminos: bool = False


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)


class UserResponse(BaseModel):
    usuario_id: int
    nombre: str
    apellido: str
    email: str
    role: str
    activo: bool

    class Config:
        from_attributes = True
