import { useState, useCallback, useEffect } from 'react';
import { LICENSE_STORAGE_KEY, LICENSE_EVENT, getLicenseTier, getEntitlements, generateDemoKey, getDemoKeyExpiryDays } from '../config/licensePolicy';

export const validateLicenseKey = (key) => getLicenseTier(key) !== 'explore';
const readKey = () => { try { return localStorage.getItem(LICENSE_STORAGE_KEY) || ''; } catch { return ''; } };
export function useLicense() {
  const [licenseKey, setLicenseKey] = useState(readKey);
  useEffect(() => {
    const sync = () => setLicenseKey(readKey());
    window.addEventListener('storage', sync);
    window.addEventListener(LICENSE_EVENT, sync);
    return () => { window.removeEventListener('storage', sync); window.removeEventListener(LICENSE_EVENT, sync); };
  }, []);
  const tier = getLicenseTier(licenseKey);
  const activateKey = useCallback((key) => {
    if (!validateLicenseKey(key)) return 'invalid';
    const normalized = key.trim().toUpperCase();
    localStorage.setItem(LICENSE_STORAGE_KEY, normalized);
    setLicenseKey(normalized);
    window.dispatchEvent(new Event(LICENSE_EVENT));
    return 'ok';
  }, []);
  const deactivate = useCallback(() => {
    localStorage.removeItem(LICENSE_STORAGE_KEY);
    setLicenseKey('');
    window.dispatchEvent(new Event(LICENSE_EVENT));
  }, []);
  const activateDemoKey = useCallback(() => {
    const key = generateDemoKey();
    localStorage.setItem(LICENSE_STORAGE_KEY, key);
    setLicenseKey(key);
    window.dispatchEvent(new Event(LICENSE_EVENT));
    return key;
  }, []);
  const demoDaysLeft = tier === 'demo' ? getDemoKeyExpiryDays(licenseKey) : null;
  return { ...getEntitlements(tier), isPro: tier !== 'explore', licenseKey, activateKey, deactivate, activateDemoKey, demoDaysLeft };
}
