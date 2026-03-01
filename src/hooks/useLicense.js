import { useState, useCallback } from 'react';

const STORAGE_KEY = 'zenorbit_license_key';
const KEY_PREFIX = 'ZNPRO';

function computeChecksum(str) {
  const sum = [...str].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return (sum % 1296).toString(36).toUpperCase().padStart(2, '0');
}

export function validateLicenseKey(key) {
  if (!key) return false;
  const parts = key.trim().toUpperCase().split('-');
  if (parts.length !== 4) return false;
  if (parts[0] !== KEY_PREFIX) return false;
  if (!/^[A-Z0-9]{4}$/.test(parts[1])) return false;
  if (!/^[A-Z0-9]{4}$/.test(parts[2])) return false;
  return parts[3] === computeChecksum(parts[1] + parts[2]);
}

export function useLicense() {
  const [licenseKey, setLicenseKey] = useState(
    () => localStorage.getItem(STORAGE_KEY) || ''
  );

  const isPro = validateLicenseKey(licenseKey);

  const activateKey = useCallback((key) => {
    if (validateLicenseKey(key)) {
      const normalized = key.trim().toUpperCase();
      localStorage.setItem(STORAGE_KEY, normalized);
      setLicenseKey(normalized);
      return 'ok';
    }
    return 'invalid';
  }, []);

  const deactivate = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setLicenseKey('');
  }, []);

  return { isPro, licenseKey, activateKey, deactivate };
}
