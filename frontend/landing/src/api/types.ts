export interface ApiPlanFeature {
  text: string;
  tooltip?: string | null;
}

export interface ApiPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  precio_con_web: number;
  period: string;
  accent_color: string;
  icon: string;
  benefits_intro?: string | null;
  popular?: boolean;
  popular_label?: string | null;
  button_text: string;
  button_href: string;
  features: ApiPlanFeature[];
}

export interface ApiLandingData {
  plans: ApiPlan[];
  metrics: import('../types').LandingMetric[];
  testimonials: import('../types').Review[];
  faqs: import('../types').FAQItem[];
  comparison_rows: import('../types').TableRow[];
}
