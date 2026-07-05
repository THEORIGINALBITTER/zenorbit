import { useEffect, useMemo, useState } from 'react';
import { USER_DEVICES, USER_INTENTS, USER_ROLES, normalizeUserContext } from './types.js';

const RETURNING_VISITOR_KEY = 'zenorbit-returning-visitor-v1';
const RECENT_CLICKS_KEY = 'zenorbit-recent-menu-clicks-v1';
const RUNTIME_ROLE_KEY = 'zenorbit-user-role';
const RUNTIME_INTENT_KEY = 'zenorbit-user-intent';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const classifyDevice = (width) => {
  if (width <= 768) return USER_DEVICES.MOBILE;
  if (width <= 1180) return USER_DEVICES.TABLET;
  return USER_DEVICES.DESKTOP;
};

const inferIntentFromPage = (page) => {
  const normalized = String(page || '').toLowerCase();
  if (normalized.includes('/pro') || normalized.includes('/pricing')) return USER_INTENTS.BUY;
  if (normalized.includes('/guide') || normalized.includes('/hilfe')) return USER_INTENTS.SUPPORT;
  if (normalized.includes('/builder') || normalized.includes('/customizer')) return USER_INTENTS.MANAGE;
  return USER_INTENTS.EXPLORE;
};

const readStoredRuntimeValue = (key) => {
  if (typeof window === 'undefined') return '';
  try {
    return window.localStorage.getItem(key) || '';
  } catch {
    return '';
  }
};

const readRecentClicks = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(RECENT_CLICKS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(Boolean).map(String) : [];
  } catch {
    return [];
  }
};

export const trackAdaptiveMenuClick = (token) => {
  if (typeof window === 'undefined' || !token) return;
  try {
    const current = readRecentClicks();
    const next = [String(token), ...current.filter((entry) => entry !== token)].slice(0, 8);
    window.localStorage.setItem(RECENT_CLICKS_KEY, JSON.stringify(next));
  } catch {
    // ignore storage failures
  }
};

export const useAdaptiveRuntimeContext = ({
  enabled = false,
  role,
  intent,
  page = '/',
  locale,
  campaign,
  contextOverrides = {},
} = {}) => {
  const [device, setDevice] = useState(
    typeof window !== 'undefined' ? classifyDevice(window.innerWidth) : USER_DEVICES.DESKTOP
  );
  const [scrollDepth, setScrollDepth] = useState(0);
  const [returning, setReturning] = useState(false);
  const [recentClicks, setRecentClicks] = useState(() => readRecentClicks());

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const updateDevice = () => setDevice(classifyDevice(window.innerWidth));
    const updateScrollDepth = () => {
      const viewportHeight = window.innerHeight || 1;
      const docHeight = Math.max(
        document.body?.scrollHeight || 0,
        document.documentElement?.scrollHeight || 0
      );
      const maxScroll = Math.max(1, docHeight - viewportHeight);
      setScrollDepth(clamp(window.scrollY / maxScroll, 0, 1));
    };

    updateDevice();
    updateScrollDepth();

    let hasVisitedBefore = false;
    try {
      hasVisitedBefore = window.localStorage.getItem(RETURNING_VISITOR_KEY) === 'true';
      if (!hasVisitedBefore) window.localStorage.setItem(RETURNING_VISITOR_KEY, 'true');
    } catch {
      hasVisitedBefore = false;
    }
    setReturning(hasVisitedBefore);
    setRecentClicks(readRecentClicks());
    const handleStorage = () => setRecentClicks(readRecentClicks());

    window.addEventListener('resize', updateDevice);
    window.addEventListener('scroll', updateScrollDepth, { passive: true });
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('resize', updateDevice);
      window.removeEventListener('scroll', updateScrollDepth);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const queryCampaign = useMemo(() => {
    if (campaign) return campaign;
    if (typeof window === 'undefined') return '';
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('utm_campaign') || params.get('campaign') || '';
    } catch {
      return '';
    }
  }, [campaign]);

  const resolvedRole = role || contextOverrides.role || readStoredRuntimeValue(RUNTIME_ROLE_KEY) || USER_ROLES.GUEST;
  const resolvedIntent = intent || contextOverrides.intent || readStoredRuntimeValue(RUNTIME_INTENT_KEY) || inferIntentFromPage(page);

  const context = useMemo(
    () => normalizeUserContext({
      role: resolvedRole,
      intent: resolvedIntent,
      device,
      page,
      scrollDepth,
      returning,
      locale: locale || (typeof navigator !== 'undefined' ? navigator.language : 'de-DE'),
      campaign: queryCampaign,
      recentClicks,
      ignoredItems: contextOverrides.ignoredItems || [],
      abortedInteractions: contextOverrides.abortedInteractions || 0,
      hour: new Date().getHours(),
    }),
    [resolvedRole, resolvedIntent, device, page, scrollDepth, returning, locale, queryCampaign, recentClicks, contextOverrides]
  );

  return enabled ? context : normalizeUserContext({ role: resolvedRole, intent: resolvedIntent, page });
};
