from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from infrastructure.uow import UnitOfWork


def get_uow(db: Session = Depends(get_db)) -> UnitOfWork:
    return UnitOfWork(db)
