/**
 * Orbify AI - License Service
 * Handles license validation and feature gating
 */

import { FEATURE_TIERS, STORAGE_KEYS, ERROR_MESSAGES } from '../../orbify-core/config/constants';

// License tiers and their features
const TIER_FEATURES = {
  [FEATURE_TIERS.FREE]: {
    name: 'Free',
    price: 0,
    features: [
      'visual_customizer',
      'manual_menu_editor',
      'basic_presets',
      'json_export',
    ],
    limits: {
      configs: 5,
      menuItems: 8,
      exports: Infinity,
    },
  },
  [FEATURE_TIERS.PRO]: {
    name: 'Pro',
    price: 29,
    features: [
      ...TIER_FEATURES[FEATURE_TIERS.FREE]?.features || [],
      'premium_templates',
      'npm_package_generator',
      'vanilla_js_export',
      'react_export',
      'priority_support',
    ],
    limits: {
      configs: Infinity,
      menuItems: 12,
      exports: Infinity,
    },
  },
  [FEATURE_TIERS.AI]: {
    name: 'AI',
    price: 79,
    features: [
      ...TIER_FEATURES[FEATURE_TIERS.PRO]?.features || [],
      'ai_menu_generator',
      'ai_color_palette',
      'ai_animation_optimizer',
      'smart_suggestions',
      'ai_accessibility_check',
      'api_access',
    ],
    limits: {
      configs: Infinity,
      menuItems: 20,
      exports: Infinity,
      aiGenerations: 50, // per month
    },
  },
  [FEATURE_TIERS.ENTERPRISE]: {
    name: 'Enterprise',
    price: null, // Custom pricing
    features: [
      ...TIER_FEATURES[FEATURE_TIERS.AI]?.features || [],
      'white_label',
      'unlimited_ai',
      'custom_ai_training',
      'dedicated_support',
      'on_premise',
    ],
    limits: {
      configs: Infinity,
      menuItems: Infinity,
      exports: Infinity,
      aiGenerations: Infinity,
    },
  },
};

/**
 * Get current license from storage
 * @returns {Object|null}
 */
export const getCurrentLicense = () => {
  try {
    const licenseData = localStorage.getItem(STORAGE_KEYS.LICENSE);
    if (!licenseData) return null;

    return JSON.parse(licenseData);
  } catch (error) {
    console.error('Failed to read license:', error);
    return null;
  }
};

/**
 * Save license to storage
 * @param {Object} license
 */
export const saveLicense = (license) => {
  try {
    localStorage.setItem(STORAGE_KEYS.LICENSE, JSON.stringify(license));
  } catch (error) {
    console.error('Failed to save license:', error);
  }
};

/**
 * Validate license
 * @param {string} licenseKey
 * @returns {Promise<Object>}
 */
export const validateLicense = async (licenseKey) => {
  try {
    // In production, this would call your backend API
    // For now, mock validation
    const response = await fetch('/api/license/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey }),
    });

    if (!response.ok) {
      throw new Error(ERROR_MESSAGES.LICENSE_EXPIRED);
    }

    const license = await response.json();

    // Save to storage
    saveLicense(license);

    return license;
  } catch (error) {
    console.error('License validation failed:', error);
    throw error;
  }
};

/**
 * Check if license is valid (not expired)
 * @param {Object} license
 * @returns {boolean}
 */
export const isLicenseValid = (license) => {
  if (!license) return false;

  // Check expiration
  if (license.expiresAt) {
    const expirationDate = new Date(license.expiresAt);
    if (expirationDate < new Date()) {
      return false;
    }
  }

  return true;
};

/**
 * Get user's current tier
 * @returns {string}
 */
export const getCurrentTier = () => {
  const license = getCurrentLicense();

  if (!license || !isLicenseValid(license)) {
    return FEATURE_TIERS.FREE;
  }

  return license.tier || FEATURE_TIERS.FREE;
};

/**
 * Check if user has access to a specific feature
 * @param {string} featureName
 * @returns {boolean}
 */
export const hasFeatureAccess = (featureName) => {
  const tier = getCurrentTier();
  const tierFeatures = TIER_FEATURES[tier];

  return tierFeatures?.features.includes(featureName) || false;
};

/**
 * Check if user has AI access
 * @returns {boolean}
 */
export const hasAIAccess = () => {
  const tier = getCurrentTier();
  return tier === FEATURE_TIERS.AI || tier === FEATURE_TIERS.ENTERPRISE;
};

/**
 * Get remaining AI generations for current month
 * @returns {Promise<number>}
 */
export const getRemainingAIGenerations = async () => {
  const tier = getCurrentTier();

  if (tier === FEATURE_TIERS.ENTERPRISE) {
    return Infinity;
  }

  if (tier !== FEATURE_TIERS.AI) {
    return 0;
  }

  try {
    // In production, fetch from backend
    const response = await fetch('/api/usage/ai-generations');
    const data = await response.json();

    const limit = TIER_FEATURES[FEATURE_TIERS.AI].limits.aiGenerations;
    return Math.max(0, limit - (data.used || 0));
  } catch (error) {
    console.error('Failed to get AI usage:', error);
    return 0;
  }
};

/**
 * Check if user can use AI generation
 * @returns {Promise<boolean>}
 */
export const canUseAIGeneration = async () => {
  if (!hasAIAccess()) return false;

  const tier = getCurrentTier();
  if (tier === FEATURE_TIERS.ENTERPRISE) return true;

  const remaining = await getRemainingAIGenerations();
  return remaining > 0;
};

/**
 * Get features for a specific tier
 * @param {string} tier
 * @returns {Object}
 */
export const getTierFeatures = (tier) => {
  return TIER_FEATURES[tier] || TIER_FEATURES[FEATURE_TIERS.FREE];
};

/**
 * Get all available tiers
 * @returns {Object}
 */
export const getAllTiers = () => {
  return TIER_FEATURES;
};

/**
 * Mock license for development
 * @param {string} tier
 */
export const setMockLicense = (tier = FEATURE_TIERS.AI) => {
  const mockLicense = {
    tier,
    licenseKey: 'MOCK-LICENSE-KEY',
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
    email: 'dev@orbify.com',
    name: 'Developer',
  };

  saveLicense(mockLicense);
  return mockLicense;
};

/**
 * Clear license (logout)
 */
export const clearLicense = () => {
  localStorage.removeItem(STORAGE_KEYS.LICENSE);
};

export default {
  getCurrentLicense,
  saveLicense,
  validateLicense,
  isLicenseValid,
  getCurrentTier,
  hasFeatureAccess,
  hasAIAccess,
  getRemainingAIGenerations,
  canUseAIGeneration,
  getTierFeatures,
  getAllTiers,
  setMockLicense,
  clearLicense,
};
