from pydantic import BaseModel


class CIE10Response(BaseModel):
    codigo: str
    descripcion: str
    categoria: str | None = None
    especialidad_id: int
    especialidad_nombre: str | None = None

    class Config:
        from_attributes = True


class CIE10ListResponse(BaseModel):
    items: list[CIE10Response]
    total: int
