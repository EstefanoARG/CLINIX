import json
from decimal import Decimal

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, joinedload

from app.models import (
    Clinica,
    LandingComparisonRow,
    LandingFAQ,
    LandingLead,
    LandingMetric,
    LandingPlan,
    LandingTestimonial,
    Paciente,
)
from app.modules.landing.schemas import (
    LandingComparisonRowResponse,
    LandingContactCreate,
    LandingDataResponse,
    LandingFAQResponse,
    LandingMetricResponse,
    LandingPlanFeatureResponse,
    LandingPlanResponse,
    LandingTestimonialResponse,
)


def _number(value: Decimal | int | float | None) -> float:
    if value is None:
        return 0
    return float(value)


class LandingService:
    def __init__(self, db: Session):
        self.db = db

    def _metric_value(self, metric: LandingMetric) -> float:
        if metric.Fuente == "clinicas_count":
            return float(
                self.db.query(Clinica)
                .filter(Clinica.Activo == True)
                .count()
            )
        if metric.Fuente == "pacientes_count":
            return float(
                self.db.query(Paciente)
                .filter(Paciente.Activo == True)
                .count()
            )
        return _number(metric.Valor)

    def get_public_data(self) -> LandingDataResponse:
        plans = (
            self.db.query(LandingPlan)
            .options(joinedload(LandingPlan.features))
            .filter(LandingPlan.Activo == True)
            .order_by(LandingPlan.Orden, LandingPlan.PlanID)
            .all()
        )
        metrics = (
            self.db.query(LandingMetric)
            .filter(LandingMetric.Activo == True)
            .order_by(LandingMetric.Orden, LandingMetric.MetricID)
            .all()
        )
        testimonials = (
            self.db.query(LandingTestimonial)
            .filter(LandingTestimonial.Activo == True)
            .order_by(LandingTestimonial.Orden, LandingTestimonial.TestimonialID)
            .all()
        )
        faqs = (
            self.db.query(LandingFAQ)
            .filter(LandingFAQ.Activo == True)
            .order_by(LandingFAQ.Orden, LandingFAQ.FAQID)
            .all()
        )
        comparison_rows = (
            self.db.query(LandingComparisonRow)
            .filter(LandingComparisonRow.Activo == True)
            .order_by(LandingComparisonRow.Orden, LandingComparisonRow.RowID)
            .all()
        )

        def parse_json(value: str | None) -> list[str]:
            if not value:
                return []
            try:
                result = json.loads(value)
                return result if isinstance(result, list) else []
            except (json.JSONDecodeError, TypeError):
                return []

        return LandingDataResponse(
            plans=[
                LandingPlanResponse(
                    id=plan.Slug,
                    name=plan.Nombre,
                    description=plan.Descripcion,
                    price=_number(plan.Precio),
                    precio_con_web=_number(plan.PrecioConWeb),
                    period=plan.Periodo,
                    accent_color=plan.ColorAcento,
                    icon=plan.Icono,
                    benefits_intro=plan.IntroBeneficios,
                    popular=bool(plan.Popular),
                    popular_label=plan.EtiquetaPopular,
                    button_text=plan.TextoBoton,
                    button_href=plan.EnlaceBoton,
                    features=[
                        LandingPlanFeatureResponse(
                            text=feature.Texto,
                            tooltip=feature.Tooltip,
                        )
                        for feature in plan.features
                        if feature.Activo
                    ],
                )
                for plan in plans
            ],
            metrics=[
                LandingMetricResponse(
                    id=metric.Slug,
                    icon=metric.Icono,
                    value=self._metric_value(metric),
                    suffix=metric.Sufijo,
                    label=metric.Etiqueta,
                )
                for metric in metrics
            ],
            testimonials=[
                LandingTestimonialResponse(
                    name=item.Nombre,
                    specialty=item.Especialidad,
                    location=item.Ubicacion,
                    avatar=item.AvatarURL,
                    text=item.Texto,
                )
                for item in testimonials
            ],
            faqs=[
                LandingFAQResponse(
                    question=item.Pregunta,
                    answer=item.Respuesta,
                )
                for item in faqs
            ],
            comparison_rows=[
                LandingComparisonRowResponse(
                    category=item.Categoria,
                    feature=item.Caracteristica or "",
                    tooltip=item.Tooltip or "",
                    values=parse_json(item.ValoresJSON),
                )
                for item in comparison_rows
            ],
        )

    def create_contact(self, data: LandingContactCreate) -> dict:
        lead = LandingLead(
            Nombres=data.first_name.strip(),
            Apellidos=data.last_name.strip(),
            Email=data.email,
            Telefono=data.phone.strip(),
            HorarioContacto=data.contact_schedule.strip() if data.contact_schedule else None,
            AreaImplementacion=data.implementation_area,
            AceptaMarketing=data.accepts_marketing,
        )
        self.db.add(lead)
        try:
            self.db.commit()
            self.db.refresh(lead)
        except SQLAlchemyError:
            self.db.rollback()
            raise
        return {
            "lead_id": lead.LeadID,
            "message": "Solicitud registrada correctamente.",
        }
