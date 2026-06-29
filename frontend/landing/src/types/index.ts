export interface NavLink {
  label: string;
  href: string;
  children?: NavLink[];
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  hiddenPrice: number;
  period: string;
  accentColor: string;
  icon: string;
  benefitsIntro?: string;
  features: PlanFeature[];
  popular?: boolean;
  popularLabel?: string;
  buttonText?: string;
  buttonHref?: string;
}

export interface PlanFeature {
  text: string;
  tooltip?: string | null;
}

export interface LandingMetric {
  id: string;
  icon: string;
  value: number;
  suffix: string;
  label: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Review {
  name: string;
  specialty: string;
  location: string;
  avatar?: string | null;
  text: string;
}

export interface TableRow {
  category?: string;
  feature: string;
  tooltip: string;
  values: string[];
}

export interface LandingData {
  plans: PricingPlan[];
  metrics: LandingMetric[];
  testimonials: Review[];
  faqs: FAQItem[];
  comparisonRows: TableRow[];
}

export interface LandingContactPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  contactSchedule?: string;
  implementationArea: string;
  acceptsMarketing: boolean;
}
