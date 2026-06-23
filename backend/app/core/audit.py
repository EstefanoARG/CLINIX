from datetime import datetime
from sqlalchemy.orm import Session
from app.models import LogAuditoria


def registrar_auditoria(
    db: Session,
    usuario_id: int | None,
    accion: str,
    descripcion: str | None = None,
    tabla_afectada: str | None = None,
    registro_id: int | None = None,
    ip_origen: str | None = None,
) -> LogAuditoria:
    entry = LogAuditoria(
        UsuarioID=usuario_id,
        Accion=accion,
        Descripcion=descripcion,
        TablaAfectada=tabla_afectada,
        RegistroID=registro_id,
        IPOrigen=ip_origen,
        FechaHora=datetime.now(),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
