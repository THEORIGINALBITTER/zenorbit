// OrbitMenu Configuration
// Centralized configuration for the radial/orbit menu system

export const orbitMenuConfig = {
  // Visual Settings
  visual: {
    radius: 100,                    // Base radius in pixels
    menuOffset: 150,                // Offset when menu opens to prevent cutoff

    // Brand Colors
    colors: {
      primary: "#f97316",           // Orange-400
      primaryDark: "#ea580c",       // Orange-600
      background: "#1f2937",        // Gray-800
      backgroundDark: "#111827",    // Gray-900
      text: "#fef3c7",              // Orange-50
      border: "#4b5563",            // Gray-600
      borderHighlight: "#f97316",   // Orange-400
      backdrop: "rgba(0, 0, 0, 0)",  // Transparent - only blur effect
    },

    // Button Styles
    button: {
      width: 64,                    // w-16 -> larger for better text spacing
      height: 64,                   // h-16 -> larger for better text spacing
      fontSize: "12px",
      fontFamily: "mono",
      borderRadius: "50%",
    },

    // Menu item style profile
    menuItem: {
      borderRadius: "50%",
      borderWidth: 2,
      fontWeight: 600,
      letterSpacing: "0px",
      textTransform: "none",
    },

    // Backdrop
    backdrop: {
      blur: "8px",
      opacity: 0.4,
    }
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
      stiffness: 260,
      damping: 20,
      staggerDelay: 0.05,           // Delay between items in seconds
    },

    // Scroll animation
    scroll: {
      stiffness: 150,
      damping: 11,
    },

    // Backdrop fade
    backdrop: {
      duration: 0.2,
    }
  },

  // Behavior Settings
  behavior: {
    scrollBehavior: "smooth",       // "smooth" | "fixed" | "disabled"
    closeOnBackdropClick: true,
    closeOnItemClick: true,
    resetSubmenuOnClose: true,
  },

  // Tooltip Settings
  tooltip: {
    enabled: true,
    duration: 6000,                 // 6 seconds
    repeatDelay: 10000,             // 10 seconds
    maxShows: 2,
    text: "Menü öffnen",
  },

  // Accessibility
  accessibility: {
    ariaLabel: "Hauptmenü",
    keyboardNavigation: true,
    focusTrapping: true,
  },

  // Multi-Layer Support (for future enhancement)
  layers: [
    {
      id: "main",
      radius: 100,
      startAngle: 0,
      endAngle: -180,
    }
    // Add more layers here for multi-ring menus
  ],
};

// Preset Configurations (for Visual Customizer)
export const orbitMenuPresets = {
  compact: {
    visual: { radius: 80, menuOffset: 120 },
    animation: { menuItem: { staggerDelay: 0.03 } },
  },

  spacious: {
    visual: { radius: 150, menuOffset: 200 },
    animation: { menuItem: { staggerDelay: 0.08 } },
  },

  fast: {
    animation: {
      logo: { stiffness: 400, damping: 20 },
      menuItem: { stiffness: 350, damping: 15, staggerDelay: 0.02 },
    },
  },

  smooth: {
    animation: {
      logo: { stiffness: 200, damping: 30 },
      menuItem: { stiffness: 180, damping: 25, staggerDelay: 0.1 },
    },
  },
};

export default orbitMenuConfig;
