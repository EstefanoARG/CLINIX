from pathlib import Path
import re

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models import (
    Clinica,
    Especialidad,
    PacienteAuth,
    Role,
    Usuario,
)


INSERT_PATTERN = re.compile(r"INSERT\s+INTO\s+.+?;", re.IGNORECASE | re.DOTALL)


def _is_bootstrap_only(db: Session) -> bool:
    return (
        db.query(Especialidad).count() == 0
        and db.query(Clinica).count() <= 1
        and db.query(Role).count() <= 4
        and db.query(Usuario).count() <= 1
    )


def should_rebuild_sqlite_demo(db: Session) -> bool:
    if not _is_bootstrap_only(db):
        return False
    columns = db.execute(text("PRAGMA table_info('CLINICA')")).mappings().all()
    active_column = next((column for column in columns if column["name"] == "Activo"), None)
    return active_column is not None and active_column["dflt_value"] is None


def _reset_bootstrap_data(db: Session) -> None:
    db.query(Usuario).delete()
    db.query(Role).delete()
    db.query(Clinica).delete()
    db.commit()


def _load_sqlite_demo_data(db: Session) -> None:
    sql_path = Path(__file__).resolve().parents[2] / "database" / "seed_data.sql"
    source = sql_path.read_text(encoding="utf-8")
    statements = INSERT_PATTERN.findall(source)
    for statement in statements:
        db.execute(text(statement))
    db.commit()


def _make_demo_passwords_functional(db: Session) -> None:
    admin_hash = hash_password("admin123")
    staff_hash = hash_password("clinix123")
    patient_hash = hash_password("paciente123")

    users = db.query(Usuario).filter(Usuario.PasswordHash.like("hash_pass_%")).all()
    for user in users:
        user.PasswordHash = (
            admin_hash
            if user.role and user.role.NombreRole == "Administrador"
            else staff_hash
        )

    patient_accounts = db.query(PacienteAuth).filter(
        PacienteAuth.PasswordHash.like("hash_paciente_%")
    ).all()
    for account in patient_accounts:
        account.PasswordHash = patient_hash

    db.commit()


def _ensure_minimum_data(db: Session) -> None:
    if db.query(Role).count() == 0:
        for name in ["Administrador", "Médico", "Enfermero", "Recepcionista"]:
            db.add(Role(NombreRole=name))
        db.flush()

    if db.query(Clinica).count() == 0:
        db.add(Clinica(
            Nombre="CLINIX Central",
            RUC="20123456789",
            Direccion="Av. Principal 123",
            Telefono="+51 1 234 5678",
            Email="contacto@clinix.com",
            PlanSuscripcion="Premium",
        ))
        db.flush()

    admin = db.query(Usuario).filter(Usuario.Email == "admin@clinix.com").first()
    if not admin:
        clinic = db.query(Clinica).order_by(Clinica.ClinicalID).first()
        role = db.query(Role).filter(Role.NombreRole == "Administrador").first()
        db.add(Usuario(
            ClinicalID=clinic.ClinicalID,
            RoleID=role.RoleID,
            Nombre="Admin",
            Apellido="Sistema",
            DNI="00000001",
            Email="admin@clinix.com",
            Telefono="+51 999 999 999",
            PasswordHash=hash_password("admin123"),
        ))

    db.commit()


def initialize_seed_data(db: Session, dialect_name: str, demo_seed: bool = True) -> None:
    if dialect_name == "sqlite" and demo_seed and _is_bootstrap_only(db):
        if should_rebuild_sqlite_demo(db):
            _reset_bootstrap_data(db)
        _load_sqlite_demo_data(db)

    _make_demo_passwords_functional(db)
    _ensure_minimum_data(db)
