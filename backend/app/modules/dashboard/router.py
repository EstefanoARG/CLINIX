from fastapi import APIRouter, Query

from app.core.dependencies import DbSession, require_role
from app.modules.dashboard.schemas import DashboardResponse
from app.modules.dashboard.service import DashboardService

router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardResponse)
def get_dashboard(
    db: DbSession,
    _ = require_role(["Administrador"]),
    periodo: str = Query("hoy", pattern="^(hoy|semana|mes)$"),
):
    return DashboardService(db).get_dashboard(periodo)


@router.get("/metricas", response_model=dict)
def get_metricas(db: DbSession, _ = require_role(["Administrador"])):
    s = DashboardService(db)
    return s.get_metricas().model_dump()
