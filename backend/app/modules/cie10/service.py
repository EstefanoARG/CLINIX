from sqlalchemy.orm import joinedload
from sqlalchemy import func

from app.models import CIE10Diagnostico, Especialidad
from app.core.exceptions import NotFoundError
from app.core.dependencies import DbSession


def _to_dict(item: CIE10Diagnostico) -> dict:
    esp = item.especialidad or None
    return {
        "codigo": item.Codigo,
        "descripcion": item.Descripcion,
        "categoria": item.Categoria,
        "especialidad_id": item.EspecialidadID,
        "especialidad_nombre": esp.NombreEspecialidad if esp else None,
    }


class CIE10Service:
    def __init__(self, db: DbSession):
        self.db = db

    def list_by_especialidad(self, especialidad_id: int) -> list[dict]:
        items = (
            self.db.query(CIE10Diagnostico)
            .options(joinedload(CIE10Diagnostico.especialidad))
            .filter(
                CIE10Diagnostico.EspecialidadID == especialidad_id,
                CIE10Diagnostico.Activo == True,
            )
            .order_by(CIE10Diagnostico.Codigo)
            .all()
        )
        return [_to_dict(item) for item in items]

    def search(self, q: str, especialidad_id: int | None = None) -> list[dict]:
        qry = (
            self.db.query(CIE10Diagnostico)
            .options(joinedload(CIE10Diagnostico.especialidad))
            .filter(CIE10Diagnostico.Activo == True)
        )
        if especialidad_id is not None:
            qry = qry.filter(CIE10Diagnostico.EspecialidadID == especialidad_id)
        if q:
            like = f"%{q}%"
            qry = qry.filter(
                (CIE10Diagnostico.Codigo.ilike(like)) |
                (CIE10Diagnostico.Descripcion.ilike(like)) |
                (CIE10Diagnostico.Categoria.ilike(like))
            )
        qry = qry.order_by(CIE10Diagnostico.Codigo).limit(50)
        return [_to_dict(item) for item in qry.all()]

    def list_all(self) -> list[dict]:
        items = (
            self.db.query(CIE10Diagnostico)
            .options(joinedload(CIE10Diagnostico.especialidad))
            .filter(CIE10Diagnostico.Activo == True)
            .order_by(CIE10Diagnostico.Codigo)
            .all()
        )
        return [_to_dict(item) for item in items]
