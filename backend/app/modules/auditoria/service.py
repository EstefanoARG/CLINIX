from datetime import date, datetime

from sqlalchemy.orm import Session, joinedload

from app.models import LogAuditoria


class AuditoriaService:
    def __init__(self, db: Session):
        self.db = db

    def list(
        self,
        skip: int = 0,
        limit: int = 50,
        usuario_id: int | None = None,
        accion: str | None = None,
        fecha_desde: date | None = None,
        fecha_hasta: date | None = None,
    ) -> dict:
        query = self.db.query(LogAuditoria).options(joinedload(LogAuditoria.usuario))
        if usuario_id is not None:
            query = query.filter(LogAuditoria.UsuarioID == usuario_id)
        if accion:
            query = query.filter(LogAuditoria.Accion.ilike(f"%{accion}%"))
        if fecha_desde:
            query = query.filter(
                LogAuditoria.FechaHora >= datetime.combine(fecha_desde, datetime.min.time())
            )
        if fecha_hasta:
            query = query.filter(
                LogAuditoria.FechaHora <= datetime.combine(fecha_hasta, datetime.max.time())
            )

        total = query.count()
        logs = query.order_by(LogAuditoria.FechaHora.desc()).offset(skip).limit(limit).all()
        return {
            "items": [
                {
                    "log_id": log.LogID,
                    "usuario_id": log.UsuarioID,
                    "usuario_nombre": (
                        f"{log.usuario.Nombre} {log.usuario.Apellido}"
                        if log.usuario else None
                    ),
                    "tabla_afectada": log.TablaAfectada,
                    "registro_id": log.RegistroID,
                    "accion": log.Accion,
                    "detalle": log.Descripcion,
                    "direccion_ip": log.IPOrigen,
                    "fecha": log.FechaHora,
                }
                for log in logs
            ],
            "total": total,
        }
