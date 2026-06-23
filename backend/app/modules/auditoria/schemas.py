from datetime import datetime

from pydantic import BaseModel


class AuditoriaResponse(BaseModel):
    log_id: int
    usuario_id: int | None = None
    usuario_nombre: str | None = None
    tabla_afectada: str | None = None
    registro_id: int | None = None
    accion: str
    detalle: str | None = None
    direccion_ip: str | None = None
    fecha: datetime


class AuditoriaListResponse(BaseModel):
    items: list[AuditoriaResponse]
    total: int
