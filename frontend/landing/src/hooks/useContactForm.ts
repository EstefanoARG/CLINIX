import { useState, useCallback } from 'react';
import { submitLandingContact } from '../services/landingApi';
import type { LandingContactPayload } from '../types';

const COOLDOWN_MS = 30000;

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  implementationArea?: string;
}

const initialForm: LandingContactPayload = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  contactSchedule: '',
  implementationArea: '',
  acceptsMarketing: true,
};

export function useContactForm() {
  const [form, setForm] = useState<LandingContactPayload>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<FormErrors>({});

  const updateField = useCallback((field: keyof LandingContactPayload, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const validate = useCallback((): boolean => {
    const errs: FormErrors = {};
    if (form.firstName.trim().length < 2) errs.firstName = 'Mínimo 2 caracteres';
    if (form.lastName.trim().length < 2) errs.lastName = 'Mínimo 2 caracteres';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Correo inválido';
    if (!/^(\+51\s?)?\d{9}$/.test(form.phone.trim())) errs.phone = 'Ingrese un número válido (ej: +51 999888777)';
    if (!form.implementationArea) errs.implementationArea = 'Selecciona una opción';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    setSubmitting(true);
    setStatus('idle');
    try {
      await submitLandingContact(form);
      setForm(initialForm);
      setStatus('success');
      setCooldown(true);
      setTimeout(() => setCooldown(false), COOLDOWN_MS);
    } catch {
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  }, [form, validate]);

  const reset = useCallback(() => {
    setForm(initialForm);
    setStatus('idle');
    setErrors({});
  }, []);

  return {
    form, errors, submitting, cooldown, status,
    updateField, handleSubmit, reset,
  };
}
