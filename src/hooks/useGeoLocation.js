import { useState, useEffect } from 'react';

// Supported countries in the deposits system
const SUPPORTED_COUNTRIES = ['Ghana', 'Kenya', 'Nigeria', 'Uganda', 'Tanzania', 'Rwanda'];

// Map ISO country codes to country names used in the app
const COUNTRY_CODE_MAP = {
  GH: 'Ghana',
  KE: 'Kenya',
  NG: 'Nigeria',
  UG: 'Uganda',
  TZ: 'Tanzania',
  RW: 'Rwanda',
};

export default function useGeoLocation() {
  const [detectedCountry, setDetectedCountry] = useState(null);
  const [detecting, setDetecting] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check cache first (valid for 24 hours)
    const cached = localStorage.getItem('gf_detected_country');
    const cachedAt = localStorage.getItem('gf_detected_country_at');
    if (cached && cachedAt) {
      const age = Date.now() - parseInt(cachedAt, 10);
      if (age < 24 * 60 * 60 * 1000) {
        setDetectedCountry(cached);
        setDetecting(false);
        return;
      }
    }

    const detect = async () => {
      try {
        // Free, no-key IP geolocation API
        const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) });
        if (!res.ok) throw new Error('Geo API error');
        const data = await res.json();
        const countryCode = data.country_code;
        const mapped = COUNTRY_CODE_MAP[countryCode];

        if (mapped && SUPPORTED_COUNTRIES.includes(mapped)) {
          setDetectedCountry(mapped);
          localStorage.setItem('gf_detected_country', mapped);
          localStorage.setItem('gf_detected_country_at', Date.now().toString());
        } else {
          // Country not in supported list — fall back to null (component uses default)
          setDetectedCountry(null);
        }
      } catch (err) {
        setError(err.message);
        setDetectedCountry(null);
      } finally {
        setDetecting(false);
      }
    };

    detect();
  }, []);

  return { detectedCountry, detecting, error };
}
