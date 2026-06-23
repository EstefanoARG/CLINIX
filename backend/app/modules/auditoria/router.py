from datetime import date

from fastapi import APIRouter, Query

from app.core.dependencies import DbSession, require_role
from app.modules.auditoria.schemas import AuditoriaListResponse
from app.modules.auditoria.service import AuditoriaService


router = APIRouter(prefix="/api/v1/auditoria", tags=["Auditoría"])


@router.get("", response_model=AuditoriaListResponse)
def list_auditoria(
    db: DbSession,
    _=require_role(["Administrador"]),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    usuario_id: int | None = None,
    accion: str | None = None,
    fecha_desde: date | None = None,
    fecha_hasta: date | None = None,
):
    return AuditoriaService(db).list(
        skip=skip,
        limit=limit,
        usuario_id=usuario_id,
        accion=accion,
        fecha_desde=fecha_desde,
        fecha_hasta=fecha_hasta,
    )
