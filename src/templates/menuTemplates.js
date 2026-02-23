// Pre-built templates for quick start

export const menuTemplates = {
  default: {
    name: "Default",
    description: "Classic elegant design with golden accents",
    config: {
      visual: {
        radius: 100,
        button: { width: 64, height: 64 },
        colors: {
          primary: "#f97316",
          backdrop: "rgba(0, 0, 0, 0)",
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
      { id: "1", label: "Home", angle: 0, route: "/" },
      { id: "2", label: "About", angle: -60, route: "/about" },
      { id: "3", label: "Services", angle: -120, route: "/services" },
      { id: "4", label: "Contact", angle: -180, route: "/contact" },
    ],
    accentColor: "#AC8E66",
  },

  modern: {
    name: "Modern Blue",
    description: "Clean modern design with blue tones",
    config: {
      visual: {
        radius: 120,
        button: { width: 70, height: 70 },
        colors: {
          primary: "#3B82F6",
          backdrop: "rgba(0, 0, 0, 0.2)",
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
      { id: "1", label: "Dashboard", angle: 0, route: "/dashboard" },
      { id: "2", label: "Analytics", angle: -45, route: "/analytics" },
      { id: "3", label: "Reports", angle: -90, route: "/reports" },
      { id: "4", label: "Settings", angle: -135, route: "/settings" },
      { id: "5", label: "Profile", angle: -180, route: "/profile" },
    ],
    accentColor: "#3B82F6",
  },

  compact: {
    name: "Compact",
    description: "Small and efficient for mobile-first apps",
    config: {
      visual: {
        radius: 80,
        button: { width: 56, height: 56 },
        colors: {
          primary: "#10B981",
          backdrop: "rgba(0, 0, 0, 0)",
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
      { id: "1", label: "Home", angle: 0, route: "/" },
      { id: "2", label: "Menu", angle: -90, route: "/menu" },
      { id: "3", label: "More", angle: -180, route: "/more" },
    ],
    accentColor: "#10B981",
  },

  luxury: {
    name: "Luxury Dark",
    description: "Premium dark theme with gold accents",
    config: {
      visual: {
        radius: 130,
        button: { width: 75, height: 75 },
        colors: {
          primary: "#D4AF37",
          backdrop: "rgba(0, 0, 0, 0.6)",
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
      { id: "1", label: "Boutique", angle: 0, route: "/shop" },
      { id: "2", label: "Collections", angle: -45, route: "/collections" },
      { id: "3", label: "Exclusive", angle: -90, route: "/exclusive" },
      { id: "4", label: "About", angle: -135, route: "/about" },
      { id: "5", label: "Contact", angle: -180, route: "/contact" },
    ],
    accentColor: "#D4AF37",
  },

  minimal: {
    name: "Minimal White",
    description: "Clean minimalist design",
    config: {
      visual: {
        radius: 110,
        button: { width: 60, height: 60 },
        colors: {
          primary: "#1F2937",
          backdrop: "rgba(255, 255, 255, 0.3)",
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
      { id: "1", label: "Work", angle: 0, route: "/work" },
      { id: "2", label: "Studio", angle: -60, route: "/studio" },
      { id: "3", label: "Journal", angle: -120, route: "/journal" },
      { id: "4", label: "Contact", angle: -180, route: "/contact" },
    ],
    accentColor: "#1F2937",
  },

  vibrant: {
    name: "Vibrant Colors",
    description: "Bold and colorful for creative projects",
    config: {
      visual: {
        radius: 115,
        button: { width: 68, height: 68 },
        colors: {
          primary: "#EC4899",
          backdrop: "rgba(236, 72, 153, 0.1)",
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
      { id: "1", label: "Gallery", angle: 0, route: "/gallery" },
      { id: "2", label: "Portfolio", angle: -45, route: "/portfolio" },
      { id: "3", label: "Blog", angle: -90, route: "/blog" },
      { id: "4", label: "Shop", angle: -135, route: "/shop" },
      { id: "5", label: "About", angle: -180, route: "/about" },
    ],
    accentColor: "#EC4899",
  },
};

export const getTemplateById = (id) => menuTemplates[id];
export const getAllTemplates = () => Object.entries(menuTemplates).map(([id, template]) => ({ id, ...template }));
