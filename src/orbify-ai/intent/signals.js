import { USER_DEVICES, USER_INTENTS, USER_ROLES } from './types.js';

const includesAny = (values = [], needles = []) => needles.some((needle) => values.includes(needle));

export const deriveUserSignals = (context) => {
  const page = context.page.toLowerCase();
  const recentClicks = context.recentClicks.map((entry) => entry.toLowerCase());
  const ignoredItems = context.ignoredItems.map((entry) => entry.toLowerCase());

  const isAdmin = context.role === USER_ROLES.ADMIN;
  const isStudent = context.role === USER_ROLES.STUDENT;
  const isCustomer = context.role === USER_ROLES.CUSTOMER;
  const isGuest = context.role === USER_ROLES.GUEST;
  const isBuyerIntent = context.intent === USER_INTENTS.BUY;
  const isLearningIntent = context.intent === USER_INTENTS.LEARN;
  const isSupportIntent = context.intent === USER_INTENTS.SUPPORT;
  const isManageIntent = context.intent === USER_INTENTS.MANAGE;

  const isLateSession = context.hour >= 21 || context.hour <= 5;
  const isDeepScroll = context.scrollDepth >= 0.72;
  const isMidScroll = context.scrollDepth >= 0.4;
  const isMobile = context.device === USER_DEVICES.MOBILE;
  const isTablet = context.device === USER_DEVICES.TABLET;
  const onPricingPage = page.includes('pricing') || page.includes('preise');
  const onCoursePage = page.includes('kurs') || page.includes('course') || page.includes('academy');
  const onSupportPage = page.includes('support') || page.includes('hilfe') || page.includes('faq');
  const onDashboardPage = page.includes('dashboard') || page.includes('studio') || page.includes('admin');

  const repeatedSupportSignals = includesAny(recentClicks, ['faq', 'hilfe', 'support', 'kontakt', 'preise']);
  const ignoredCommercialItems = includesAny(ignoredItems, ['buy', 'shop', 'pricing', 'preise', 'checkout']);
  const highFriction = context.abortedInteractions >= 2 || (isDeepScroll && repeatedSupportSignals);
  const needsReassurance = isSupportIntent || highFriction || (isBuyerIntent && ignoredCommercialItems);
  const returningLearner = context.returning && (isStudent || isLearningIntent || onCoursePage);
  const returningBuyer = context.returning && (isCustomer || isBuyerIntent);
  const operationalUser = isAdmin || isManageIntent || onDashboardPage;

  return {
    isAdmin,
    isStudent,
    isCustomer,
    isGuest,
    isBuyerIntent,
    isLearningIntent,
    isSupportIntent,
    isManageIntent,
    isLateSession,
    isDeepScroll,
    isMidScroll,
    isMobile,
    isTablet,
    onPricingPage,
    onCoursePage,
    onSupportPage,
    onDashboardPage,
    repeatedSupportSignals,
    ignoredCommercialItems,
    highFriction,
    needsReassurance,
    returningLearner,
    returningBuyer,
    operationalUser,
  };
};
