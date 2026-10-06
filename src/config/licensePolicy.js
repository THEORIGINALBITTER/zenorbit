export const LICENSE_STORAGE_KEY = 'zenorbit_license_key';
export const LICENSE_EVENT = 'zenorbit-license-changed';
export const LICENSE_PREFIXES = { ZNCRT: 'creator', ZNSTU: 'studio', ZNPRO: 'studio' };
export const DEMO_PREFIX = 'ZNDEMO';
export const DEMO_DURATION_DAYS = 14;
export const checksum = (value) => ([...value].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 1296).toString(36).toUpperCase().padStart(2, '0');

const dayIndex = () => Math.floor(Date.now() / 86400000);

// Demo-Keys sind zustandslos: der Ablauftag (Tage seit Unix-Epoche) steckt
// base36-codiert im Key selbst. Keine Datenbank oder Server-Prüfung nötig,
// passt zum bestehenden rein client-seitigen Lizenzmodell.
export function generateDemoKey() {
  const expiryDay = dayIndex() + DEMO_DURATION_DAYS;
  const encoded = expiryDay.toString(36).toUpperCase().padStart(8, '0');
  const a = encoded.slice(0, 4);
  const b = encoded.slice(4, 8);
  const check = checksum(DEMO_PREFIX + a + b);
  return `${DEMO_PREFIX}-${a}-${b}-${check}`;
}

export function getDemoKeyExpiryDays(key) {
  if (typeof key !== 'string') return null;
  const parts = key.trim().toUpperCase().split('-');
  const [prefix, a, b] = parts;
  if (parts.length !== 4 || prefix !== DEMO_PREFIX) return null;
  const expiryDay = parseInt(a + b, 36);
  if (Number.isNaN(expiryDay)) return null;
  return expiryDay - dayIndex();
}

export function getLicenseTier(key) {
  if (typeof key !== 'string') return 'explore';
  const parts = key.trim().toUpperCase().split('-');
  const [prefix, a, b, check] = parts;
  if (parts.length !== 4 || !/^[A-Z0-9]{4}$/.test(a) || !/^[A-Z0-9]{4}$/.test(b)) return 'explore';

  if (prefix === DEMO_PREFIX) {
    if (check !== checksum(DEMO_PREFIX + a + b)) return 'explore';
    const daysLeft = getDemoKeyExpiryDays(key);
    return daysLeft !== null && daysLeft >= 0 ? 'demo' : 'explore';
  }

  if (!LICENSE_PREFIXES[prefix]) return 'explore';
  const payload = prefix === 'ZNPRO' ? a + b : prefix + a + b;
  return check === checksum(payload) ? LICENSE_PREFIXES[prefix] : 'explore';
}
export function getEntitlements(tier = 'explore') {
  // Der Demo-Key soll das komplette Produkt zeigen, deshalb gilt er als
  // vollwertiges Studio-Erlebnis für die Dauer seiner Gültigkeit.
  const studioLevel = tier === 'studio' || tier === 'demo';
  const paid = studioLevel || tier === 'creator';
  return { tier, canExport: paid, canExportHTML: studioLevel, canRemoveBranding: studioLevel, canUseAdaptive: studioLevel, maxMenuItems: studioLevel ? Infinity : paid ? 12 : 3 };
}
export function canUseTemplate(id, tier) {
  if (tier === 'studio' || tier === 'demo') return true;
  if (tier === 'creator') return !['luxury', 'vibrant'].includes(id);
  return ['default', 'minimal'].includes(id);
}
export function getExportRestriction(entitlements, { format = 'react', itemCount = 0, adaptive = false } = {}) {
  if (!entitlements.canExport) return 'Der Production-Export ist ab Creator verfügbar. Explore bleibt zum Ausprobieren im Builder.';
  if (format === 'html' && !entitlements.canExportHTML) return 'Das HTML-Delivery-Paket ist in Studio enthalten.';
  if (itemCount > entitlements.maxMenuItems) return `Dieser Entwurf enthält ${itemCount} Menüelemente. Creator unterstützt bis zu 12; Studio unbegrenzt viele.`;
  if (adaptive && !entitlements.canUseAdaptive) return 'Adaptive Navigation ist in Studio enthalten. Deaktiviere sie für einen Creator-Export.';
  return null;
}
