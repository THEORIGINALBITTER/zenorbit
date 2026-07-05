import { deriveUserSignals } from './signals.js';
import { ADAPTIVE_MENU_RULES } from './rules.js';
import { createMenuDecision, MENU_LAYOUTS, normalizeUserContext } from './types.js';

const sortRules = (rules = []) => [...rules].sort((left, right) => (right.priority || 0) - (left.priority || 0));

const normalizeItems = (items = []) => items
  .filter((item) => item && item.id && item.label && item.route)
  .sort((left, right) => (right.priority || 0) - (left.priority || 0))
  .map(({ priority, ...item }) => item);

/**
 * Adaptive Intent Resolver
 * Decides a bounded menu output from user context and explicit rules.
 *
 * @param {import('./types').UserContext} rawContext
 * @param {{ rules?: typeof ADAPTIVE_MENU_RULES }} [options]
 * @returns {import('./types').MenuDecision}
 */
export const resolveZenOrbitMenu = (rawContext = {}, options = {}) => {
  const context = normalizeUserContext(rawContext);
  const signals = deriveUserSignals(context);
  const rules = sortRules(options.rules || ADAPTIVE_MENU_RULES);

  for (const rule of rules) {
    if (!rule.when(context, signals)) continue;
    const decision = rule.decide(context, signals);
    return createMenuDecision({
      ...decision,
      items: normalizeItems(decision.items),
      matchedRules: [rule.id],
      signals,
    });
  }

  return createMenuDecision({
    items: [],
    layout: 'orbit',
    priorityItem: null,
    reason: 'No rule matched.',
    matchedRules: [],
    signals,
  });
};

const normalizeToken = (value) => String(value || '').trim().toLowerCase();

const buildDecisionTokens = (decision) => {
  const tokens = new Set();
  (decision.items || []).forEach((item) => {
    tokens.add(normalizeToken(item.id));
    tokens.add(normalizeToken(item.label));
    if (item.route) {
      item.route.split('/').filter(Boolean).forEach((part) => tokens.add(normalizeToken(part)));
    }
  });
  return tokens;
};

const scoreCatalogItem = (item, context, signals, decisionTokens) => {
  const tags = new Set([
    normalizeToken(item.id),
    normalizeToken(item.label),
    ...(Array.isArray(item.tags) ? item.tags.map(normalizeToken) : []),
    ...(Array.isArray(item.audiences) ? item.audiences.map(normalizeToken) : []),
    ...(Array.isArray(item.intents) ? item.intents.map(normalizeToken) : []),
  ]);

  let score = Number(item.priority) || 0;

  if (item.route === context.page) score += 8;
  if (decisionTokens.has(normalizeToken(item.id))) score += 90;
  if (tags.has(context.role)) score += 70;
  if (tags.has(context.intent)) score += 60;
  if ([...decisionTokens].some((token) => tags.has(token))) score += 55;

  if (signals.returningLearner && ['learn', 'course', 'courses', 'dashboard', 'support'].some((tag) => tags.has(tag))) score += 75;
  if (signals.returningBuyer && ['pricing', 'buy', 'checkout', 'demo', 'contact'].some((tag) => tags.has(tag))) score += 72;
  if (signals.operationalUser && ['studio', 'manage', 'admin', 'analytics', 'export', 'builder'].some((tag) => tags.has(tag))) score += 78;
  if (signals.needsReassurance && ['faq', 'support', 'hilfe', 'contact', 'pricing', 'guide'].some((tag) => tags.has(tag))) score += 74;
  if (signals.isGuest && ['start', 'home', 'overview', 'contact'].some((tag) => tags.has(tag))) score += 36;
  if (signals.isMobile && item.mobilePriority) score += Number(item.mobilePriority) || 24;
  if (signals.isLateSession && ['contact', 'support', 'faq'].some((tag) => tags.has(tag))) score += 18;

  return score;
};

export const resolveAdaptiveMenuFromCatalog = (rawContext = {}, catalog = [], options = {}) => {
  const context = normalizeUserContext(rawContext);
  const baseDecision = resolveZenOrbitMenu(context, options);
  const signals = deriveUserSignals(context);
  const decisionTokens = buildDecisionTokens(baseDecision);
  const maxItems = options.maxItems || (signals.isMobile ? 3 : 5);

  const normalizedCatalog = (catalog || [])
    .filter((item) => item && item.id && item.label && item.route)
    .map((item, index) => ({
      ...item,
      _order: index,
      _score: scoreCatalogItem(item, context, signals, decisionTokens),
    }))
    .sort((left, right) => {
      if (right._score !== left._score) return right._score - left._score;
      return left._order - right._order;
    });

  const selectedItems = normalizedCatalog.slice(0, Math.min(maxItems, normalizedCatalog.length)).map(({ _order, _score, ...item }) => item);
  const priorityItem = selectedItems[0]?.id || baseDecision.priorityItem || null;
  const layout = signals.isMobile ? MENU_LAYOUTS.COMPACT : baseDecision.layout;

  return createMenuDecision({
    items: selectedItems,
    layout,
    priorityItem,
    reason: `${baseDecision.reason} Runtime catalog bounded to allowed navigation items.`,
    matchedRules: baseDecision.matchedRules,
    signals,
  });
};

export default resolveZenOrbitMenu;
