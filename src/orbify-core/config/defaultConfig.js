/**
 * Orbify Core - Default Configuration
 * Base configuration structure used by both Basic and AI versions
 */

import { DEFAULTS, COLOR_PRESETS, ANIMATION } from './constants';

export const defaultOrbitConfig = {
  // Visual Settings
  visual: {
    radius: DEFAULTS.RADIUS,
    menuOffset: DEFAULTS.MENU_OFFSET,
    startAngle: 0, // Starting angle offset for menu items

    // Button Styles
    button: {
      width: DEFAULTS.BUTTON_SIZE,
      height: DEFAULTS.BUTTON_SIZE,
      fontSize: '20px',
      fontFamily: 'monospace',
      fontWeight: 'bold',
    },

    // Menu Item Styles
    menuItem: {
      width: DEFAULTS.BUTTON_SIZE,
      height: DEFAULTS.BUTTON_SIZE,
      fontSize: DEFAULTS.FONT_SIZE,
      fontFamily: 'monospace',
    },

    // Colors
    colors: {
      primary: COLOR_PRESETS.ORANGE.primary,
      primaryDark: COLOR_PRESETS.ORANGE.primaryDark,
      background: COLOR_PRESETS.ORANGE.background,
      backgroundDark: COLOR_PRESETS.ORANGE.backgroundDark,
      text: COLOR_PRESETS.ORANGE.text,
      border: COLOR_PRESETS.ORANGE.border,
      borderHighlight: COLOR_PRESETS.ORANGE.primary,
      backdrop: 'rgba(0, 0, 0, 0.4)',
    },

    // Button Specific Colors
    buttonColors: {
      background: COLOR_PRESETS.ORANGE.primary,
      outline: COLOR_PRESETS.ORANGE.primary,
      outlineWidth: 0,
    },

    // Menu Item Specific Colors
    menuItemColors: {
      background: COLOR_PRESETS.ORANGE.background,
      text: COLOR_PRESETS.ORANGE.text,
      outline: COLOR_PRESETS.ORANGE.primary,
      outlineWidth: 1,
    },

    // Backdrop
    backdrop: {
      blur: '8px',
      opacity: 0.4,
    },
  },

  // Animation Settings
  animation: {
    // Logo rotation
    logo: {
      openRotation: 180,
      closeRotation: 0,
      stiffness: 100,
      damping: 50,
    },

    // Menu item animations
    menuItem: {
      stiffness: ANIMATION.SPRING.STIFF.stiffness,
      damping: ANIMATION.SPRING.STIFF.damping,
      staggerDelay: ANIMATION.STAGGER_DELAY,
    },

    // Scroll animation
    scroll: {
      stiffness: 150,
      damping: 11,
    },

    // Backdrop fade
    backdrop: {
      duration: 0.2,
    },
  },

  // Behavior Settings
  behavior: {
    scrollBehavior: 'smooth',    // "smooth" | "fixed" | "disabled"
    closeOnBackdropClick: true,
    closeOnItemClick: true,
    resetSubmenuOnClose: true,
    showTooltip: true,
  },

  // Tooltip Settings
  tooltip: {
    enabled: true,
    duration: 6000,
    repeatDelay: 10000,
    maxShows: 2,
    text: 'Menü öffnen',
  },

  // Accessibility
  accessibility: {
    ariaLabel: 'Hauptmenü',
    keyboardNavigation: true,
    focusTrapping: true,
  },

  // Logo Configuration
  logo: {
    type: 'image', // 'image' | 'text' | 'icon'
    text: 'B',
    imageUrl: null,
    imageAlt: 'Menu Logo',
  },
};

// Main Menu Items Default Structure
export const defaultMainMenuItems = [
  {
    id: 'menu-overlay',
    label: 'Menü',
    angle: 0,
    action: 'openOverlay',
    isMainMenu: true,
    icon: null,
    tooltip: 'Vollständiges Menü öffnen',
  },
  {
    id: 'zenlab',
    label: 'ZenLab',
    angle: -45,
    route: '/zenlab2',
    action: 'route',
    icon: null,
    tooltip: 'Zum ZenLab',
  },
  {
    id: 'contact',
    label: 'Sag Hallo',
    angle: -90,
    route: '/contact',
    action: 'route',
    icon: null,
    tooltip: 'Kontakt aufnehmen',
  },
  {
    id: 'about',
    label: 'Einfach Ich',
    angle: -135,
    action: 'openSubmenu',
    submenu: 'about',
    hasSubmenu: true,
    icon: null,
    tooltip: 'Über mich erfahren',
  },
  {
    id: 'home',
    label: 'Moin {name}',
    angle: -180,
    route: '/',
    action: 'route',
    icon: null,
    tooltip: 'Zur Startseite',
    dynamic: true,
  },
];

// About Submenu Items Default Structure
export const defaultAboutSubmenuItems = [
  {
    id: 'back',
    label: 'Zurück',
    angle: 0,
    action: 'closeSubmenu',
    isBack: true,
    icon: null,
    tooltip: 'Zurück zum Hauptmenü',
  },
  {
    id: 'about-overview',
    label: 'Ich',
    angle: -60,
    route: '/about#overview',
    action: 'route',
    icon: null,
    tooltip: 'Über mich',
  },
  {
    id: 'references',
    label: 'Referenz',
    angle: -120,
    route: '/about#referenzen',
    action: 'route',
    icon: null,
    tooltip: 'Referenzen ansehen',
  },
  {
    id: 'kompass',
    label: 'Kompass',
    angle: -180,
    route: '/about#kompass',
    action: 'route',
    icon: null,
    tooltip: 'Mein Kompass',
  },
];

// Preset Configurations
export const orbitPresets = {
  compact: {
    name: 'Compact',
    description: 'Smaller radius for compact layouts',
    visual: {
      radius: 80,
      menuOffset: 120,
    },
    animation: {
      menuItem: {
        staggerDelay: 0.03,
      },
    },
  },

  spacious: {
    name: 'Spacious',
    description: 'Larger radius for spacious layouts',
    visual: {
      radius: 150,
      menuOffset: 200,
    },
    animation: {
      menuItem: {
        staggerDelay: 0.08,
      },
    },
  },

  fast: {
    name: 'Fast',
    description: 'Quick snappy animations',
    animation: {
      logo: {
        stiffness: 400,
        damping: 20,
      },
      menuItem: {
        stiffness: 350,
        damping: 15,
        staggerDelay: 0.02,
      },
    },
  },

  smooth: {
    name: 'Smooth',
    description: 'Slow smooth animations',
    animation: {
      logo: {
        stiffness: 200,
        damping: 30,
      },
      menuItem: {
        stiffness: 180,
        damping: 25,
        staggerDelay: 0.1,
      },
    },
  },

  minimal: {
    name: 'Minimal',
    description: 'Minimalist color scheme',
    visual: {
      colors: {
        primary: '#000000',
        primaryDark: '#111111',
        background: '#ffffff',
        backgroundDark: '#f5f5f5',
        text: '#000000',
        border: '#e0e0e0',
        borderHighlight: '#000000',
        backdrop: 'rgba(0, 0, 0, 0.2)',
      },
    },
  },

  vibrant: {
    name: 'Vibrant',
    description: 'Bold colorful scheme',
    visual: {
      colors: {
        primary: '#ff6b6b',
        primaryDark: '#ee5a52',
        background: '#4ecdc4',
        backgroundDark: '#45b7af',
        text: '#ffe66d',
        border: '#95e1d3',
        borderHighlight: '#ff6b6b',
        backdrop: 'rgba(0, 0, 0, 0.5)',
      },
    },
  },
};

export default {
  defaultOrbitConfig,
  defaultMainMenuItems,
  defaultAboutSubmenuItems,
  orbitPresets,
};
