/**
 * Orbify Core - Constants
 * Shared constants used across Basic and AI versions
 */

export const ORBIFY_VERSION = '1.0.0';

// Z-Index Layers
export const Z_INDEX = {
  BACKDROP: 99,
  ORBIT_BUTTON: 100,
  MENU_ITEMS: 101,
  TOOLTIP: 102,
  MODAL: 9999,
};

// Default Dimensions
export const DEFAULTS = {
  BUTTON_SIZE: 64,
  RADIUS: 120,
  MENU_OFFSET: 150,
  FONT_SIZE: 10,
};

// Animation Timing
export const ANIMATION = {
  DURATION: {
    FAST: 200,
    NORMAL: 400,
    SLOW: 600,
  },
  SPRING: {
    STIFF: { stiffness: 260, damping: 20 },
    SMOOTH: { stiffness: 180, damping: 25 },
    BOUNCY: { stiffness: 400, damping: 15 },
  },
  STAGGER_DELAY: 0.05, // seconds between menu items
};

// Tooltip Configuration
export const TOOLTIP = {
  DURATION: 6000,        // 6 seconds
  REPEAT_DELAY: 10000,   // 10 seconds
  MAX_SHOWS: 2,          // Maximum times to show tooltip
  STORAGE_KEY: 'orbify_tooltip_count',
};

// Scroll Behavior
export const SCROLL = {
  FOOTER_OFFSET: 50,     // Distance from footer to stop
  SHOW_AFTER: 100,       // Scroll distance before showing tooltip
};

// Menu Types
export const MENU_TYPES = {
  MAIN: 'main',
  SUBMENU: 'submenu',
  OVERLAY: 'overlay',
};

// Action Types
export const ACTION_TYPES = {
  ROUTE: 'route',
  SUBMENU: 'openSubmenu',
  CLOSE_SUBMENU: 'closeSubmenu',
  OVERLAY: 'openOverlay',
  CUSTOM: 'custom',
};

// Color Palette Presets (Basic)
export const COLOR_PRESETS = {
  ORANGE: {
    primary: '#f97316',
    primaryDark: '#ea580c',
    background: '#1f2937',
    backgroundDark: '#111827',
    text: '#fef3c7',
    border: '#4b5563',
  },
  BLUE: {
    primary: '#3b82f6',
    primaryDark: '#2563eb',
    background: '#1e293b',
    backgroundDark: '#0f172a',
    text: '#dbeafe',
    border: '#475569',
  },
  GREEN: {
    primary: '#10b981',
    primaryDark: '#059669',
    background: '#064e3b',
    backgroundDark: '#022c22',
    text: '#d1fae5',
    border: '#065f46',
  },
  PURPLE: {
    primary: '#8b5cf6',
    primaryDark: '#7c3aed',
    background: '#4c1d95',
    backgroundDark: '#2e1065',
    text: '#ede9fe',
    border: '#6d28d9',
  },
};

// Export Formats
export const EXPORT_FORMATS = {
  JSON: 'json',
  REACT: 'react',
  CSS: 'css',
  VANILLA_JS: 'vanilla-js',
  VUE: 'vue', // Future
};

// Feature Tiers (for gating)
export const FEATURE_TIERS = {
  FREE: 'free',
  BASIC: 'basic',
  PRO: 'pro',
  AI: 'ai',
  ENTERPRISE: 'enterprise',
};

// API Endpoints (will be configured)
export const API_ENDPOINTS = {
  AI_GENERATE: '/api/ai/generate-menu',
  AI_COLOR: '/api/ai/generate-colors',
  AI_OPTIMIZE: '/api/ai/optimize-animation',
  LICENSE_VALIDATE: '/api/license/validate',
  ANALYTICS: '/api/analytics/track',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  CONFIG: 'orbify_config',
  LICENSE: 'orbify_license',
  TOOLTIP_COUNT: 'orbify_tooltip_count',
  USER_PRESETS: 'orbify_user_presets',
  AI_HISTORY: 'orbify_ai_history',
};

// Validation Rules
export const VALIDATION = {
  MIN_RADIUS: 50,
  MAX_RADIUS: 300,
  MIN_BUTTON_SIZE: 40,
  MAX_BUTTON_SIZE: 120,
  MIN_MENU_ITEMS: 1,
  MAX_MENU_ITEMS: 12,
  MIN_FONT_SIZE: 8,
  MAX_FONT_SIZE: 16,
};

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_CONFIG: 'Invalid configuration provided',
  LICENSE_EXPIRED: 'Your license has expired',
  AI_QUOTA_EXCEEDED: 'AI generation quota exceeded',
  NETWORK_ERROR: 'Network error occurred',
  INVALID_MENU_STRUCTURE: 'Invalid menu structure',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  CONFIG_SAVED: 'Configuration saved successfully',
  EXPORT_SUCCESS: 'Export completed successfully',
  AI_GENERATED: 'AI generation completed',
  LICENSE_VALID: 'License validated successfully',
};

export default {
  ORBIFY_VERSION,
  Z_INDEX,
  DEFAULTS,
  ANIMATION,
  TOOLTIP,
  SCROLL,
  MENU_TYPES,
  ACTION_TYPES,
  COLOR_PRESETS,
  EXPORT_FORMATS,
  FEATURE_TIERS,
  API_ENDPOINTS,
  STORAGE_KEYS,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};
