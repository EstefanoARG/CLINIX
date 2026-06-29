from fastapi import APIRouter

from app.core.dependencies import DbSession
from app.modules.landing.schemas import (
    LandingContactCreate,
    LandingContactResponse,
    LandingDataResponse,
)
from app.modules.landing.service import LandingService

router = APIRouter(prefix="/api/v1/public/landing", tags=["Landing"])


@router.get("", response_model=LandingDataResponse)
def get_landing_data(db: DbSession):
    return LandingService(db).get_public_data()


@router.post("/contact", response_model=LandingContactResponse, status_code=201)
def create_landing_contact(data: LandingContactCreate, db: DbSession):
    return LandingService(db).create_contact(data)
