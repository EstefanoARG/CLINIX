from pydantic import BaseModel, Field


class LandingPlanFeatureResponse(BaseModel):
    text: str
    tooltip: str | None = None


class LandingPlanResponse(BaseModel):
    id: str
    name: str
    description: str
    price: float
    hidden_price: float
    period: str
    accent_color: str
    icon: str
    benefits_intro: str | None = None
    popular: bool = False
    popular_label: str | None = None
    button_text: str
    button_href: str
    features: list[LandingPlanFeatureResponse] = Field(default_factory=list)


class LandingMetricResponse(BaseModel):
    id: str
    icon: str
    value: float
    suffix: str
    label: str


class LandingTestimonialResponse(BaseModel):
    name: str
    specialty: str
    location: str
    avatar: str | None = None
    text: str


class LandingFAQResponse(BaseModel):
    question: str
    answer: str


class LandingComparisonRowResponse(BaseModel):
    category: str | None = None
    feature: str
    tooltip: str
    values: list[str]


class LandingDataResponse(BaseModel):
    plans: list[LandingPlanResponse] = Field(default_factory=list)
    metrics: list[LandingMetricResponse] = Field(default_factory=list)
    testimonials: list[LandingTestimonialResponse] = Field(default_factory=list)
    faqs: list[LandingFAQResponse] = Field(default_factory=list)
    comparison_rows: list[LandingComparisonRowResponse] = Field(default_factory=list)


class LandingContactCreate(BaseModel):
    first_name: str = Field(..., min_length=2, max_length=120)
    last_name: str = Field(..., min_length=2, max_length=120)
    email: str = Field(..., min_length=5, max_length=120, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    phone: str = Field(..., min_length=6, max_length=30)
    contact_schedule: str | None = Field(default=None, max_length=120)
    implementation_area: str = Field(..., min_length=2, max_length=160)
    accepts_marketing: bool = True


class LandingContactResponse(BaseModel):
    lead_id: int
    message: str
