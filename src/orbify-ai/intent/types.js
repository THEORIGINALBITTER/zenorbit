export const USER_ROLES = Object.freeze({
  GUEST: 'guest',
  STUDENT: 'student',
  CUSTOMER: 'customer',
  ADMIN: 'admin',
});

export const USER_INTENTS = Object.freeze({
  EXPLORE: 'explore',
  BUY: 'buy',
  LEARN: 'learn',
  SUPPORT: 'support',
  MANAGE: 'manage',
});

export const USER_DEVICES = Object.freeze({
  MOBILE: 'mobile',
  TABLET: 'tablet',
  DESKTOP: 'desktop',
});

export const MENU_LAYOUTS = Object.freeze({
  ORBIT: 'orbit',
  ARC: 'arc',
  COMPACT: 'compact',
});

/**
 * @typedef {Object} UserContext
 * @property {'guest'|'student'|'customer'|'admin'} [role]
 * @property {'explore'|'buy'|'learn'|'support'|'manage'} [intent]
 * @property {'mobile'|'tablet'|'desktop'} [device]
 * @property {string} [page]
 * @property {number} [scrollDepth]
 * @property {boolean} [returning]
 * @property {number} [hour]
 * @property {string} [campaign]
 * @property {string} [locale]
 * @property {string[]} [recentClicks]
 * @property {string[]} [ignoredItems]
 * @property {number} [abortedInteractions]
 */

/**
 * @typedef {Object} AdaptiveMenuItem
 * @property {string} id
 * @property {string} label
 * @property {string} route
 * @property {'route'|'support'|'checkout'|'dashboard'|'overlay'} [action]
 * @property {number} [priority]
 * @property {string} [audience]
 */

/**
 * @typedef {Object} MenuDecision
 * @property {AdaptiveMenuItem[]} items
 * @property {'orbit'|'arc'|'compact'} layout
 * @property {string | null} priorityItem
 * @property {string} reason
 * @property {string[]} matchedRules
 * @property {Record<string, boolean|number|string>} signals
 */

const FALLBACK_CONTEXT = Object.freeze({
  role: USER_ROLES.GUEST,
  intent: USER_INTENTS.EXPLORE,
  device: USER_DEVICES.DESKTOP,
  page: '/',
  scrollDepth: 0,
  returning: false,
  hour: 12,
  campaign: '',
  locale: 'de-DE',
  recentClicks: [],
  ignoredItems: [],
  abortedInteractions: 0,
});

const clamp = (value, min, max, fallback) => {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, value));
};

export const normalizeUserContext = (context = {}) => ({
  role: Object.values(USER_ROLES).includes(context.role) ? context.role : FALLBACK_CONTEXT.role,
  intent: Object.values(USER_INTENTS).includes(context.intent) ? context.intent : FALLBACK_CONTEXT.intent,
  device: Object.values(USER_DEVICES).includes(context.device) ? context.device : FALLBACK_CONTEXT.device,
  page: typeof context.page === 'string' && context.page.trim() ? context.page.trim() : FALLBACK_CONTEXT.page,
  scrollDepth: clamp(Number(context.scrollDepth), 0, 1, FALLBACK_CONTEXT.scrollDepth),
  returning: Boolean(context.returning),
  hour: clamp(Number(context.hour), 0, 23, FALLBACK_CONTEXT.hour),
  campaign: typeof context.campaign === 'string' ? context.campaign.trim() : FALLBACK_CONTEXT.campaign,
  locale: typeof context.locale === 'string' && context.locale.trim() ? context.locale.trim() : FALLBACK_CONTEXT.locale,
  recentClicks: Array.isArray(context.recentClicks) ? context.recentClicks.filter(Boolean).map(String) : [],
  ignoredItems: Array.isArray(context.ignoredItems) ? context.ignoredItems.filter(Boolean).map(String) : [],
  abortedInteractions: clamp(Number(context.abortedInteractions), 0, 99, FALLBACK_CONTEXT.abortedInteractions),
});

export const createMenuDecision = ({
  items = [],
  layout = MENU_LAYOUTS.ORBIT,
  priorityItem = null,
  reason = '',
  matchedRules = [],
  signals = {},
} = {}) => ({
  items,
  layout,
  priorityItem,
  reason,
  matchedRules,
  signals,
});
