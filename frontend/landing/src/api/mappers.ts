import type { ApiPlan, ApiLandingData } from './types';
import type { LandingData } from '../types';

export function mapPlan(plan: ApiPlan): LandingData['plans'][number] {
  return {
    id: plan.id,
    name: plan.name,
    description: plan.description,
    price: plan.price,
    hiddenPrice: plan.precio_con_web,
    period: plan.period,
    accentColor: plan.accent_color,
    icon: plan.icon,
    benefitsIntro: plan.benefits_intro ?? undefined,
    popular: plan.popular,
    popularLabel: plan.popular_label ?? undefined,
    buttonText: plan.button_text,
    buttonHref: plan.button_href,
    features: plan.features,
  };
}

export function mapLandingData(api: ApiLandingData): LandingData {
  return {
    plans: api.plans.map(mapPlan),
    metrics: api.metrics,
    testimonials: api.testimonials,
    faqs: api.faqs,
    comparisonRows: api.comparison_rows,
  };
}
