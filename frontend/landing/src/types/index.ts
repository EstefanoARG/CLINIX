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
  color: string;
  icon: string;
  features: string[];
  popular?: boolean;
  buttonText: string;
  buttonHref: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Review {
  name: string;
  specialty: string;
  location: string;
  avatar: string;
  testimonial: string;
}

export interface TableRow {
  category?: string;
  feature: string;
  tooltip: string;
  values: string[];
}
