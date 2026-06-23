import secrets
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError, ConflictError, CredentialsError
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_refresh_token
from app.core.email_sender import send_password_reset
from app.core.audit import registrar_auditoria
from app.models import Usuario, Role, Paciente, PacienteAuth, Clinica
from app.modules.auth.schemas import LoginRequest, PacienteRegisterRequest, ForgotPasswordRequest, ResetPasswordRequest
from domain.entities.paciente import Paciente as PacienteDomain
from domain.value_objects.dni import DNI
from infrastructure.uow import UnitOfWork


class AuthService:
    def __init__(self, db: Session, uow: UnitOfWork | None = None):
        self.db = db
        self.uow = uow or UnitOfWork(db)

    def login_admin(self, request: LoginRequest) -> dict:
        from app.models import Medico
        user = self.db.query(Usuario).filter(Usuario.Email == request.email).first()
        if not user or not user.Activo:
            raise CredentialsError("Invalid email or password")
        if not verify_password(request.password, user.PasswordHash):
            raise CredentialsError("Invalid email or password")

        user.UltimoAcceso = datetime.now()
        self.db.commit()

        medico_id = None
        medico = self.db.query(Medico).filter(Medico.UsuarioID == user.UsuarioID).first()
        if medico:
            medico_id = medico.MedicoID

        access = create_access_token({"sub": str(user.UsuarioID), "role": user.role.NombreRole})
        refresh = create_refresh_token({"sub": str(user.UsuarioID), "role": user.role.NombreRole})
        return {
            "access_token": access,
            "refresh_token": refresh,
            "token_type": "bearer",
            "user_id": user.UsuarioID,
            "nombre": f"{user.Nombre} {user.Apellido}",
            "role": user.role.NombreRole,
            "medico_id": medico_id,
        }

    def login_paciente(self, request: LoginRequest) -> dict:
        auth = self.db.query(PacienteAuth).filter(PacienteAuth.Email == request.email).first()
        if not auth or not auth.Activo:
            raise CredentialsError("Invalid email or password")
        if not verify_password(request.password, auth.PasswordHash):
            raise CredentialsError("Invalid email or password")

        auth.UltimoAcceso = datetime.now()
        self.db.commit()

        paciente = auth.paciente
        access = create_access_token({"sub": f"pac_{auth.PacienteID}", "role": "Paciente"})
        refresh = create_refresh_token({"sub": f"pac_{auth.PacienteID}", "role": "Paciente"})
        return {
            "access_token": access,
            "refresh_token": refresh,
            "token_type": "bearer",
            "user_id": auth.PacienteID,
            "nombre": f"{paciente.Nombre} {paciente.Apellido}",
            "role": "Paciente",
        }

    def register_paciente(self, request: PacienteRegisterRequest) -> dict:
        if not request.acepta_terminos:
            raise ConflictError("You must accept the terms and conditions")

        existing = self.db.query(Paciente).filter(Paciente.Email == request.email).first()
        if existing:
            raise ConflictError("Email already registered")

        clinica = self.db.query(Clinica).filter(Clinica.ClinicalID == request.clinical_id).first()
        if not clinica:
            raise NotFoundError("Clinica not found")

        domain = PacienteDomain(
            paciente_id=None,
            clinical_id=request.clinical_id,
            dni=DNI(request.dni),
            nombre=request.nombre,
            apellido=request.apellido,
            email=request.email,
            telefono=request.telefono,
        )
        saved = self.uow.pacientes.save(domain)
        self.uow.session.flush()

        auth = PacienteAuth(
            PacienteID=saved.paciente_id,
            Email=request.email,
            PasswordHash=hash_password(request.password),
        )
        self.db.add(auth)
        self.db.commit()

        registrar_auditoria(self.db, None, "REGISTRO_PACIENTE",
                            f"Paciente registrado: {request.email}",
                            "PACIENTE", saved.paciente_id)

        access = create_access_token({"sub": f"pac_{saved.paciente_id}", "role": "Paciente"})
        refresh = create_refresh_token({"sub": f"pac_{saved.paciente_id}", "role": "Paciente"})
        return {
            "access_token": access,
            "refresh_token": refresh,
            "token_type": "bearer",
            "user_id": saved.paciente_id,
            "nombre": f"{saved.nombre} {saved.apellido}",
            "role": "Paciente",
        }

    def refresh_token(self, refresh_token: str) -> dict:
        payload = decode_refresh_token(refresh_token)
        if payload is None:
            raise CredentialsError("Invalid or expired refresh token")
        sub = payload.get("sub")
        role = payload.get("role", "")
        if not sub:
            raise CredentialsError("Token missing subject")
        access = create_access_token({"sub": sub, "role": role})
        refresh = create_refresh_token({"sub": sub, "role": role})
        return {
            "access_token": access,
            "refresh_token": refresh,
            "token_type": "bearer",
        }

    def forgot_password(self, request: ForgotPasswordRequest) -> dict:
        user = self.db.query(Usuario).filter(Usuario.Email == request.email).first()
        auth = self.db.query(PacienteAuth).filter(PacienteAuth.Email == request.email).first()

        if not user and not auth:
            return {"message": "If the email exists, a reset link has been sent"}

        token = secrets.token_urlsafe(32)
        expires = datetime.now() + timedelta(hours=1)

        if user:
            user.TokenRecuperacion = token
            user.TokenExpiracion = expires
            send_password_reset(request.email, token, paciente=False)
        elif auth:
            auth.TokenRecuperacion = token
            auth.TokenExpiracion = expires
            send_password_reset(request.email, token, paciente=True)

        self.db.commit()
        return {"message": "If the email exists, a reset link has been sent"}

    def reset_password(self, request: ResetPasswordRequest) -> dict:
        user = self.db.query(Usuario).filter(
            Usuario.TokenRecuperacion == request.token,
            Usuario.TokenExpiracion > datetime.now(),
        ).first()
        auth = self.db.query(PacienteAuth).filter(
            PacienteAuth.TokenRecuperacion == request.token,
            PacienteAuth.TokenExpiracion > datetime.now(),
        ).first()

        if not user and not auth:
            raise CredentialsError("Invalid or expired token")

        if user:
            user.PasswordHash = hash_password(request.new_password)
            user.TokenRecuperacion = None
            user.TokenExpiracion = None
            registrar_auditoria(self.db, user.UsuarioID, "RESET_PASSWORD",
                                "Contraseña restablecida", "USUARIO", user.UsuarioID)
        elif auth:
            auth.PasswordHash = hash_password(request.new_password)
            auth.TokenRecuperacion = None
            auth.TokenExpiracion = None
            registrar_auditoria(self.db, None, "RESET_PASSWORD",
                                "Contraseña de paciente restablecida",
                                "PACIENTE_AUTH", auth.PacienteID)

        self.db.commit()
        return {"message": "Password has been reset successfully"}
