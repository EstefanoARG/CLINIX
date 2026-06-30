import axios from 'axios';
import type { LandingContactPayload, LandingData } from '../types';
import type { ApiLandingData } from '../api/types';
import { mapLandingData } from '../api/mappers';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

export async function getLandingData(): Promise<LandingData> {
  const { data } = await api.get<ApiLandingData>('/public/landing');
  return mapLandingData(data);
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
