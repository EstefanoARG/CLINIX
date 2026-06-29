import axios from 'axios';
import type { LandingContactPayload, LandingData } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

interface ApiPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  hidden_price: number;
  period: string;
  accent_color: string;
  icon: string;
  benefits_intro?: string | null;
  popular?: boolean;
  popular_label?: string | null;
  button_text: string;
  button_href: string;
  features: { text: string; tooltip?: string | null }[];
}

interface ApiLandingData {
  plans: ApiPlan[];
  metrics: LandingData['metrics'];
  testimonials: LandingData['testimonials'];
  faqs: LandingData['faqs'];
  comparison_rows: LandingData['comparisonRows'];
}

export async function getLandingData(): Promise<LandingData> {
  const { data } = await api.get<ApiLandingData>('/public/landing');
  return {
    plans: data.plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      hiddenPrice: plan.hidden_price,
      period: plan.period,
      accentColor: plan.accent_color,
      icon: plan.icon,
      benefitsIntro: plan.benefits_intro ?? undefined,
      popular: plan.popular,
      popularLabel: plan.popular_label ?? undefined,
      buttonText: plan.button_text,
      buttonHref: plan.button_href,
      features: plan.features,
    })),
    metrics: data.metrics,
    testimonials: data.testimonials,
    faqs: data.faqs,
    comparisonRows: data.comparison_rows,
  };
}

export async function submitLandingContact(payload: LandingContactPayload) {
  return api.post('/public/landing/contact', {
    first_name: payload.firstName,
    last_name: payload.lastName,
    email: payload.email,
    phone: payload.phone,
    contact_schedule: payload.contactSchedule,
    implementation_area: payload.implementationArea,
    accepts_marketing: payload.acceptsMarketing,
  });
}
