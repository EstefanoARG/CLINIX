from typing import Annotated

from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.exceptions import CredentialsError, ForbiddenError
from app.core.security import decode_access_token
from app.models import Usuario

DbSession = Annotated[Session, Depends(get_db)]


def get_current_user(
    db: DbSession,
    authorization: Annotated[str | None, Header()] = None,
) -> Usuario:
    if not authorization or not authorization.startswith("Bearer "):
        raise CredentialsError("Missing or invalid authorization header")
    token = authorization.removeprefix("Bearer ")
    payload = decode_access_token(token)
    if payload is None:
        raise CredentialsError("Invalid or expired token")
    try:
        user_id = int(payload.get("sub"))
    except (ValueError, TypeError):
        raise CredentialsError("Invalid or missing token subject")
    user = db.query(Usuario).filter(Usuario.UsuarioID == user_id).first()
    if not user or not user.Activo:
        raise CredentialsError("User not found or inactive")
    return user


CurrentUser = Annotated[Usuario, Depends(get_current_user)]


def get_current_paciente(
    db: DbSession,
    authorization: Annotated[str | None, Header()] = None,
) -> int:
    if not authorization or not authorization.startswith("Bearer "):
        raise CredentialsError("Missing or invalid authorization header")
    token = authorization.removeprefix("Bearer ")
    payload = decode_access_token(token)
    if payload is None:
        raise CredentialsError("Invalid or expired token")
    sub = payload.get("sub", "")
    if not sub.startswith("pac_"):
        raise CredentialsError("Not a patient token")
    return int(sub.removeprefix("pac_"))


def require_role(allowed_roles: list[str]):
    def role_checker(current_user: CurrentUser) -> Usuario:
        if current_user.role.NombreRole not in allowed_roles:
            raise ForbiddenError(f"Role '{current_user.role.NombreRole}' not allowed")
        return current_user
    return Depends(role_checker)
