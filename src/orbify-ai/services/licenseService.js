/**
 * Orbify AI - License Service
 * Handles license validation and feature gating
 */

import { LICENSE_STORAGE_KEY, getLicenseTier } from '../../config/licensePolicy';
import { FEATURE_TIERS, STORAGE_KEYS, ERROR_MESSAGES } from '../../orbify-core/config/constants';

// License tiers and their features
const explore = { name: 'Explore', price: 0, features: ['visual_customizer', 'manual_menu_editor', 'basic_presets'], limits: { configs: 5, menuItems: 3, exports: 0 } };
const creator = { name: 'Creator', price: 99, features: [...explore.features, 'json_export', 'json_import', 'react_export', 'npm_package_generator', 'own_commercial_projects'], limits: { configs: Infinity, menuItems: 12, exports: Infinity } };
const studio = { name: 'Studio', price: 299, features: [...creator.features, 'premium_templates', 'vanilla_js_export', 'html_export', 'white_label', 'team_use', 'client_projects', 'adaptive_navigation', 'priority_support'], limits: { configs: Infinity, menuItems: Infinity, exports: Infinity } };
const TIER_FEATURES = {
  [FEATURE_TIERS.EXPLORE]: explore,
  [FEATURE_TIERS.CREATOR]: creator,
  [FEATURE_TIERS.STUDIO]: studio,
  [FEATURE_TIERS.SIGNATURE]: { name: 'Signature', price: 2500, custom: true, features: ['brand_analysis', 'custom_motion', 'responsive_design', 'react_integration', 'handover'], limits: {} },
  [FEATURE_TIERS.BESPOKE]: { name: 'Bespoke Experience', price: 6000, custom: true, features: ['brand_workshop', 'custom_navigation', 'adaptive_content', 'accessibility_review', 'integration', 'motion_documentation', 'optimization_phase'], limits: {} },
  // Preserve previously issued tiers; new purchases use Creator or Studio.
  [FEATURE_TIERS.FREE]: explore,
  [FEATURE_TIERS.BASIC]: creator,
  [FEATURE_TIERS.PRO]: studio,
  [FEATURE_TIERS.AI]: { ...studio, limits: { ...studio.limits, aiGenerations: 50 } },
  [FEATURE_TIERS.ENTERPRISE]: { ...studio, limits: { ...studio.limits, aiGenerations: Infinity } },
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
  const keyTier = getLicenseTier(localStorage.getItem(LICENSE_STORAGE_KEY));
  if (keyTier !== 'explore') return keyTier;
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
  return Object.fromEntries(['explore', 'creator', 'studio', 'signature', 'bespoke'].map((tier) => [tier, TIER_FEATURES[tier]]));
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
