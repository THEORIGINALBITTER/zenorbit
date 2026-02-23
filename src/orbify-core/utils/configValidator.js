/**
 * Orbify Core - Config Validator
 * Validates configuration objects and menu structures
 */

import { VALIDATION, ERROR_MESSAGES } from '../config/constants';

/**
 * Validate orbit configuration
 * @param {Object} config - Configuration object
 * @returns {{valid: boolean, errors: string[]}}
 */
export const validateConfig = (config) => {
  const errors = [];

  if (!config) {
    errors.push(ERROR_MESSAGES.INVALID_CONFIG);
    return { valid: false, errors };
  }

  // Validate visual settings
  if (config.visual) {
    const { radius, menuOffset, button, menuItem } = config.visual;

    if (radius < VALIDATION.MIN_RADIUS || radius > VALIDATION.MAX_RADIUS) {
      errors.push(`Radius must be between ${VALIDATION.MIN_RADIUS} and ${VALIDATION.MAX_RADIUS}`);
    }

    if (button?.width < VALIDATION.MIN_BUTTON_SIZE || button?.width > VALIDATION.MAX_BUTTON_SIZE) {
      errors.push(`Button size must be between ${VALIDATION.MIN_BUTTON_SIZE} and ${VALIDATION.MAX_BUTTON_SIZE}`);
    }

    if (menuItem?.fontSize < VALIDATION.MIN_FONT_SIZE || menuItem?.fontSize > VALIDATION.MAX_FONT_SIZE) {
      errors.push(`Font size must be between ${VALIDATION.MIN_FONT_SIZE} and ${VALIDATION.MAX_FONT_SIZE}`);
    }
  }

  // Validate animation settings
  if (config.animation) {
    const { logo, menuItem } = config.animation;

    if (logo?.stiffness && (logo.stiffness < 0 || logo.stiffness > 1000)) {
      errors.push('Logo stiffness must be between 0 and 1000');
    }

    if (logo?.damping && (logo.damping < 0 || logo.damping > 100)) {
      errors.push('Logo damping must be between 0 and 100');
    }

    if (menuItem?.staggerDelay && (menuItem.staggerDelay < 0 || menuItem.staggerDelay > 1)) {
      errors.push('Stagger delay must be between 0 and 1 second');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate menu items structure
 * @param {Array} menuItems - Array of menu item objects
 * @returns {{valid: boolean, errors: string[]}}
 */
export const validateMenuItems = (menuItems) => {
  const errors = [];

  if (!Array.isArray(menuItems)) {
    errors.push('Menu items must be an array');
    return { valid: false, errors };
  }

  if (menuItems.length < VALIDATION.MIN_MENU_ITEMS) {
    errors.push(`Must have at least ${VALIDATION.MIN_MENU_ITEMS} menu item`);
  }

  if (menuItems.length > VALIDATION.MAX_MENU_ITEMS) {
    errors.push(`Cannot have more than ${VALIDATION.MAX_MENU_ITEMS} menu items`);
  }

  menuItems.forEach((item, index) => {
    // Check required fields
    if (!item.id) {
      errors.push(`Menu item at index ${index} missing required field: id`);
    }

    if (!item.label) {
      errors.push(`Menu item at index ${index} missing required field: label`);
    }

    if (item.angle === undefined || item.angle === null) {
      errors.push(`Menu item at index ${index} missing required field: angle`);
    }

    // Validate angle range
    if (item.angle < -360 || item.angle > 360) {
      errors.push(`Menu item "${item.label}" angle must be between -360 and 360`);
    }

    // Validate action
    if (item.action === 'route' && !item.route) {
      errors.push(`Menu item "${item.label}" has action "route" but no route specified`);
    }

    if (item.action === 'openSubmenu' && !item.submenu) {
      errors.push(`Menu item "${item.label}" has action "openSubmenu" but no submenu specified`);
    }

    // Check for duplicate IDs
    const duplicates = menuItems.filter(i => i.id === item.id);
    if (duplicates.length > 1) {
      errors.push(`Duplicate menu item ID: ${item.id}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate color value
 * @param {string} color - Color string (hex, rgb, rgba)
 * @returns {boolean}
 */
export const validateColor = (color) => {
  if (!color || typeof color !== 'string') return false;

  // Hex color
  if (/^#([0-9A-F]{3}){1,2}$/i.test(color)) return true;

  // RGB/RGBA
  if (/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/i.test(color)) return true;

  // Named colors (basic check)
  const namedColors = ['transparent', 'inherit', 'currentColor'];
  if (namedColors.includes(color.toLowerCase())) return true;

  return false;
};

/**
 * Sanitize configuration (remove invalid values, apply defaults)
 * @param {Object} config - Configuration object
 * @returns {Object} Sanitized config
 */
export const sanitizeConfig = (config) => {
  const sanitized = JSON.parse(JSON.stringify(config)); // Deep clone

  // Sanitize numbers
  if (sanitized.visual) {
    if (sanitized.visual.radius) {
      sanitized.visual.radius = Math.round(
        Math.max(VALIDATION.MIN_RADIUS, Math.min(VALIDATION.MAX_RADIUS, sanitized.visual.radius))
      );
    }

    if (sanitized.visual.button?.width) {
      sanitized.visual.button.width = Math.round(
        Math.max(VALIDATION.MIN_BUTTON_SIZE, Math.min(VALIDATION.MAX_BUTTON_SIZE, sanitized.visual.button.width))
      );
    }
  }

  // Sanitize colors
  if (sanitized.visual?.colors) {
    Object.keys(sanitized.visual.colors).forEach(key => {
      if (!validateColor(sanitized.visual.colors[key])) {
        delete sanitized.visual.colors[key];
      }
    });
  }

  return sanitized;
};

/**
 * Check if config has AI features
 * @param {Object} config
 * @returns {boolean}
 */
export const hasAIFeatures = (config) => {
  return !!(
    config.aiGenerated ||
    config.aiOptimized ||
    config.aiColorPalette ||
    config.aiSuggestions
  );
};

/**
 * Merge configurations (deep merge)
 * @param {Object} target - Target config
 * @param {Object} source - Source config to merge
 * @returns {Object} Merged config
 */
export const mergeConfigs = (target, source) => {
  const merged = { ...target };

  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      merged[key] = mergeConfigs(merged[key] || {}, source[key]);
    } else {
      merged[key] = source[key];
    }
  }

  return merged;
};

export default {
  validateConfig,
  validateMenuItems,
  validateColor,
  sanitizeConfig,
  hasAIFeatures,
  mergeConfigs,
};
