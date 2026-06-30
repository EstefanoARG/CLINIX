import { useEffect, useState, useCallback } from 'react';
import { getLandingData } from '../services/landingApi';
import type { LandingData } from '../types';

const MAX_RETRIES = 2;

interface UseLandingDataResult {
  data: LandingData | null;
  loading: boolean;
  error: boolean;
  retry: () => void;
}

export function useLandingData(): UseLandingDataResult {
  const [data, setData] = useState<LandingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetch = useCallback(async (attempt = 0) => {
    setLoading(true);
    setError(false);
    try {
      const result = await getLandingData();
      setData(result);
    } catch {
      if (attempt < MAX_RETRIES) {
        setTimeout(() => fetch(attempt + 1), 1500 * (attempt + 1));
        return;
      }
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const retry = useCallback(() => fetch(), [fetch]);

  return { data, loading, error, retry };
}
