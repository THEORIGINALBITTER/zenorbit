import { MENU_LAYOUTS, USER_INTENTS, USER_ROLES } from './types.js';

const menuItem = (id, label, route, extra = {}) => ({
  id,
  label,
  route,
  action: 'route',
  ...extra,
});

export const ADAPTIVE_MENU_RULES = [
  {
    id: 'admin-operations',
    priority: 100,
    when: ({ role }, signals) => role === USER_ROLES.ADMIN || signals.operationalUser,
    decide: () => ({
      items: [
        menuItem('studio', 'Studio', '/builder', { priority: 100, audience: 'admin' }),
        menuItem('analytics', 'Analytics', '/guide', { priority: 90, audience: 'admin' }),
        menuItem('export', 'Export', '/customizer', { priority: 85, audience: 'admin' }),
      ],
      layout: MENU_LAYOUTS.COMPACT,
      priorityItem: 'studio',
      reason: 'Operational context detected. Primary admin workflows are surfaced first.',
    }),
  },
  {
    id: 'returning-student',
    priority: 90,
    when: (_context, signals) => signals.returningLearner,
    decide: () => ({
      items: [
        menuItem('dashboard', 'Dashboard', '/dashboard', { priority: 100, audience: 'student' }),
        menuItem('courses', 'Meine Kurse', '/courses', { priority: 95, audience: 'student' }),
        menuItem('support', 'Support', '/support', { priority: 80, audience: 'student' }),
      ],
      layout: MENU_LAYOUTS.ORBIT,
      priorityItem: 'courses',
      reason: 'Returning learner detected. Resume-oriented actions outrank discovery.',
    }),
  },
  {
    id: 'high-friction-support',
    priority: 85,
    when: (_context, signals) => signals.needsReassurance && signals.isDeepScroll,
    decide: () => ({
      items: [
        menuItem('questions', 'Fragen?', '/faq', { priority: 100 }),
        menuItem('consulting', 'Beratung', '/contact', { priority: 95 }),
        menuItem('pricing', 'Preise', '/pricing', { priority: 90 }),
      ],
      layout: MENU_LAYOUTS.ARC,
      priorityItem: 'questions',
      reason: 'High-friction session detected. Reassurance and direct help take priority.',
    }),
  },
  {
    id: 'buyer-priority',
    priority: 80,
    when: ({ intent }, signals) => intent === USER_INTENTS.BUY || signals.returningBuyer || signals.onPricingPage,
    decide: () => ({
      items: [
        menuItem('pricing', 'Preise', '/pricing', { priority: 100 }),
        menuItem('demo', 'Demo', '/contact', { priority: 92 }),
        menuItem('checkout', 'Starten', '/checkout', { action: 'checkout', priority: 88 }),
      ],
      layout: MENU_LAYOUTS.ARC,
      priorityItem: 'pricing',
      reason: 'Commercial intent detected. Conversion path is reduced to the shortest route.',
    }),
  },
  {
    id: 'support-context',
    priority: 75,
    when: ({ intent }, signals) => intent === USER_INTENTS.SUPPORT || signals.onSupportPage,
    decide: () => ({
      items: [
        menuItem('help', 'Hilfe', '/hilfe', { priority: 100 }),
        menuItem('faq', 'FAQ', '/faq', { priority: 92 }),
        menuItem('contact', 'Kontakt', '/contact', { priority: 84 }),
      ],
      layout: MENU_LAYOUTS.COMPACT,
      priorityItem: 'help',
      reason: 'Support context detected. Clarification paths are prioritized over exploration.',
    }),
  },
  {
    id: 'new-visitor-default',
    priority: 10,
    when: ({ role, returning }) => role === USER_ROLES.GUEST && !returning,
    decide: () => ({
      items: [
        menuItem('start', 'Start', '/', { priority: 100 }),
        menuItem('courses', 'Kurse', '/courses', { priority: 88 }),
        menuItem('contact', 'Kontakt', '/contact', { priority: 80 }),
      ],
      layout: MENU_LAYOUTS.ORBIT,
      priorityItem: 'start',
      reason: 'First-visit context detected. Orientation, offer and contact are shown first.',
    }),
  },
  {
    id: 'fallback-explore',
    priority: 0,
    when: () => true,
    decide: () => ({
      items: [
        menuItem('home', 'Start', '/', { priority: 100 }),
        menuItem('about', 'Überblick', '/guide', { priority: 84 }),
        menuItem('contact', 'Kontakt', '/contact', { priority: 76 }),
      ],
      layout: MENU_LAYOUTS.ORBIT,
      priorityItem: 'home',
      reason: 'Fallback explore mode. Core navigation remains stable when no stronger intent is detected.',
    }),
  },
];
