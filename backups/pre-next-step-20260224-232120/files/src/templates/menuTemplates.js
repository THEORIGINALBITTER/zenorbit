// Pre-built templates for quick start

export const menuTemplates = {
  default: {
    name: "Default",
    description: "Classic elegant design with golden accents",
    config: {
      visual: {
        radius: 100,
        menuOffset: 150,
        button: { width: 64, height: 64, fontSize: "11px", fontFamily: "monospace", borderRadius: "50%" },
        menuItem: {
          borderRadius: "50%",
          borderWidth: 2,
          fontWeight: 600,
          letterSpacing: "0px",
          textTransform: "none",
        },
        colors: {
          primary: "#AC8E66",
          primaryDark: "#8F734F",
          background: "#1b1b1f",
          backgroundDark: "#131316",
          text: "#ECE1CF",
          border: "#3A342C",
          borderHighlight: "#AC8E66",
          backdrop: "rgba(0, 0, 0, 0.32)",
        },
        backdrop: {
          blur: "8px",
          opacity: 0.4,
        }
      },
      animation: {
        menuItem: {
          stiffness: 260,
          damping: 20,
          staggerDelay: 0.05,
        },
      },
    },
    menuItems: [
      { id: "1", label: "Moin", angle: 0, route: "/" },
      { id: "2", label: "Ich", angle: -60, route: "/about" },
      { id: "3", label: "ZenLab", angle: -120, route: "/zenlab2" },
      { id: "4", label: "Sag Hallo", angle: -180, route: "/contact" },
    ],
    accentColor: "#AC8E66",
  },

  modern: {
    name: "Modern Blue",
    description: "Clean modern design with blue tones",
    config: {
      visual: {
        radius: 120,
        menuOffset: 170,
        button: { width: 70, height: 70, fontSize: "11px", fontFamily: "system-ui", borderRadius: "32%" },
        menuItem: {
          borderRadius: "32%",
          borderWidth: 2,
          fontWeight: 600,
          letterSpacing: "0.2px",
          textTransform: "none",
        },
        colors: {
          primary: "#3B82F6",
          primaryDark: "#1D4ED8",
          background: "#0F1C2E",
          backgroundDark: "#09101C",
          text: "#DBEAFE",
          border: "#1E3A5F",
          borderHighlight: "#60A5FA",
          backdrop: "rgba(11, 26, 45, 0.46)",
        },
        backdrop: {
          blur: "12px",
          opacity: 0.5,
        }
      },
      animation: {
        menuItem: {
          stiffness: 300,
          damping: 25,
          staggerDelay: 0.03,
        },
      },
    },
    menuItems: [
      { id: "1", label: "Cockpit", angle: 0, route: "/dashboard" },
      { id: "2", label: "ZenPost", angle: -45, route: "/dashboard?demo=zeneditor" },
      { id: "3", label: "ZenLMS", angle: -90, route: "/dashboard?demo=lms" },
      { id: "4", label: "Blog", angle: -135, route: "/blog" },
      { id: "5", label: "Profil", angle: -180, route: "/about" },
    ],
    accentColor: "#3B82F6",
  },

  compact: {
    name: "Compact",
    description: "Small and efficient for mobile-first apps",
    config: {
      visual: {
        radius: 80,
        menuOffset: 120,
        button: { width: 56, height: 56, fontSize: "9px", fontFamily: "monospace", borderRadius: "50%" },
        menuItem: {
          borderRadius: "50%",
          borderWidth: 2,
          fontWeight: 700,
          letterSpacing: "0.4px",
          textTransform: "uppercase",
        },
        colors: {
          primary: "#10B981",
          primaryDark: "#0F766E",
          background: "#102623",
          backgroundDark: "#0A1715",
          text: "#D1FAE5",
          border: "#1E4741",
          borderHighlight: "#34D399",
          backdrop: "rgba(5, 20, 18, 0.36)",
        },
        backdrop: {
          blur: "6px",
          opacity: 0.3,
        }
      },
      animation: {
        menuItem: {
          stiffness: 350,
          damping: 18,
          staggerDelay: 0.02,
        },
      },
    },
    menuItems: [
      { id: "1", label: "Start", angle: 0, route: "/" },
      { id: "2", label: "Kurse", angle: -90, route: "/courses" },
      { id: "3", label: "Kontakt", angle: -180, route: "/contact" },
    ],
    accentColor: "#10B981",
  },

  luxury: {
    name: "Luxury Dark",
    description: "Premium dark theme with gold accents",
    config: {
      visual: {
        radius: 130,
        menuOffset: 185,
        button: { width: 75, height: 75, fontSize: "11px", fontFamily: "serif", borderRadius: "50%" },
        menuItem: {
          borderRadius: "50%",
          borderWidth: 3,
          fontWeight: 500,
          letterSpacing: "0.5px",
          textTransform: "none",
        },
        colors: {
          primary: "#D4AF37",
          primaryDark: "#B08D2E",
          background: "#1A1510",
          backgroundDark: "#100D09",
          text: "#F5E7C2",
          border: "#4B3A22",
          borderHighlight: "#E7C25C",
          backdrop: "rgba(0, 0, 0, 0.62)",
        },
        backdrop: {
          blur: "16px",
          opacity: 0.7,
        }
      },
      animation: {
        menuItem: {
          stiffness: 200,
          damping: 30,
          staggerDelay: 0.08,
        },
      },
    },
    menuItems: [
      { id: "1", label: "Portfolio", angle: 0, route: "/projects" },
      { id: "2", label: "Referenzen", angle: -45, route: "/about#referenzen" },
      { id: "3", label: "Kompass", angle: -90, route: "/about#kompass" },
      { id: "4", label: "ZenDev", angle: -135, route: "/zen" },
      { id: "5", label: "Kontakt", angle: -180, route: "/contact" },
    ],
    accentColor: "#D4AF37",
  },

  minimal: {
    name: "Minimal White",
    description: "Clean minimalist design",
    config: {
      visual: {
        radius: 110,
        menuOffset: 160,
        button: { width: 60, height: 60, fontSize: "10px", fontFamily: "system-ui", borderRadius: "18px" },
        menuItem: {
          borderRadius: "18px",
          borderWidth: 1,
          fontWeight: 500,
          letterSpacing: "0px",
          textTransform: "none",
        },
        colors: {
          primary: "#1F2937",
          primaryDark: "#111827",
          background: "#EEF2F7",
          backgroundDark: "#E2E8F0",
          text: "#1F2937",
          border: "#CBD5E1",
          borderHighlight: "#334155",
          backdrop: "rgba(248, 250, 252, 0.52)",
        },
        backdrop: {
          blur: "10px",
          opacity: 0.4,
        }
      },
      animation: {
        menuItem: {
          stiffness: 280,
          damping: 22,
          staggerDelay: 0.04,
        },
      },
    },
    menuItems: [
      { id: "1", label: "Blog", angle: 0, route: "/blog" },
      { id: "2", label: "ZenKurs", angle: -60, route: "/courses" },
      { id: "3", label: "ZenPost", angle: -120, route: "/zenpost-studio" },
      { id: "4", label: "Kontakt", angle: -180, route: "/contact" },
    ],
    accentColor: "#1F2937",
  },

  vibrant: {
    name: "Vibrant Colors",
    description: "Bold and colorful for creative projects",
    config: {
      visual: {
        radius: 115,
        menuOffset: 165,
        button: { width: 68, height: 68, fontSize: "10px", fontFamily: "monospace", borderRadius: "35%" },
        menuItem: {
          borderRadius: "35%",
          borderWidth: 2,
          fontWeight: 700,
          letterSpacing: "0.3px",
          textTransform: "none",
        },
        colors: {
          primary: "#EC4899",
          primaryDark: "#BE185D",
          background: "#2A1230",
          backgroundDark: "#1A0B21",
          text: "#FCE7F3",
          border: "#582567",
          borderHighlight: "#F472B6",
          backdrop: "rgba(98, 33, 87, 0.4)",
        },
        backdrop: {
          blur: "14px",
          opacity: 0.5,
        }
      },
      animation: {
        menuItem: {
          stiffness: 320,
          damping: 20,
          staggerDelay: 0.05,
        },
      },
    },
    menuItems: [
      { id: "1", label: "ZenLab", angle: 0, route: "/zenlab2" },
      { id: "2", label: "Builder", angle: -45, route: "/builder" },
      { id: "3", label: "Customizer", angle: -90, route: "/customizer" },
      { id: "4", label: "Kurse", angle: -135, route: "/courses" },
      { id: "5", label: "Moin", angle: -180, route: "/" },
    ],
    accentColor: "#EC4899",
  },
};

export const getTemplateById = (id) => menuTemplates[id];
export const getAllTemplates = () => Object.entries(menuTemplates).map(([id, template]) => ({ id, ...template }));
