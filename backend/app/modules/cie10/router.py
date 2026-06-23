from fastapi import APIRouter, Query

from app.core.dependencies import DbSession
from app.modules.cie10.schemas import CIE10Response, CIE10ListResponse
from app.modules.cie10.service import CIE10Service

router = APIRouter(prefix="/api/v1/cie10", tags=["CIE-10"])


@router.get("", response_model=CIE10ListResponse)
def list_cie10(
    db: DbSession,
    q: str | None = Query(None, min_length=1),
    especialidad_id: int | None = Query(None, ge=1),
):
    service = CIE10Service(db)
    if q:
        items = service.search(q, especialidad_id)
    elif especialidad_id is not None:
        items = service.list_by_especialidad(especialidad_id)
    else:
        items = service.list_all()
    return CIE10ListResponse(items=items, total=len(items))
