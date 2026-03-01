/**
 * Code Generator for Radial Menu
 * Generates code with Tailwind CSS OR Pure CSS (for Tauri/non-Tailwind environments)
 */

export const generateMenuConfig = (config, menuItems, accentColor) => {
  return `export const menuConfig = ${JSON.stringify(config, null, 2)};

export const menuItems = ${JSON.stringify(menuItems, null, 2)};

export const accentColor = "${accentColor}";
`;
};

export const generateReactComponent = (config, menuItems, accentColor, useTailwind = true) => {
  if (useTailwind) {
    return generateTailwindComponent(config, menuItems, accentColor);
  } else {
    return generatePureCSSComponent(config, menuItems, accentColor);
  }
};

// Tailwind Version (original)
const generateTailwindComponent = (config, menuItems, accentColor) => {
  return `import React from 'react';
import BitterButtonWithMenu from '@denisbitter/bitter-button-menu';

const menuConfig = ${JSON.stringify(config, null, 2)};

const menuItems = ${JSON.stringify(menuItems, null, 2)};

function CustomRadialMenu({ logoSrc }) {
  return (
    <BitterButtonWithMenu
      logoSrc={logoSrc}
      logoAlt="Menu"
      mainMenuItems={menuItems}
      config={menuConfig}
      accentColor="${accentColor}"
      tooltipText="Open Menu"
    />
  );
}

export default CustomRadialMenu;
`;
};

// Pure CSS Version (for Tauri and non-Tailwind environments)
const generatePureCSSComponent = (config, menuItems, accentColor) => {
  const css = generatePureCSS(config, accentColor);

  return `import React, { useState, useEffect, useRef } from 'react';
import './RadialMenu.css'; // Import the generated CSS

const menuConfig = ${JSON.stringify(config, null, 2)};
const menuItems = ${JSON.stringify(menuItems, null, 2)};

function CustomRadialMenu({ logoSrc }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentMenu, setCurrentMenu] = useState("main");
  const containerRef = useRef(null);

  const radius = menuConfig.visual.radius;
  const buttonSize = menuConfig.visual.button.width;

  const getPosition = (angle) => {
    const rad = ((angle) - 90) * (Math.PI / 180);
    return {
      x: Math.cos(rad) * radius,
      y: Math.sin(rad) * radius
    };
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleItemClick = (item) => {
    if (item.route) {
      // Navigate to route (implement your navigation logic)
      window.location.href = item.route;
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <div className="radial-menu-container" ref={containerRef}>
        {/* Main Button */}
        <div
          className="radial-menu-button"
          onClick={handleMenuToggle}
          style={{ width: buttonSize, height: buttonSize }}
        >
          <div className="radial-menu-button-inner" style={{ width: buttonSize - 8, height: buttonSize - 8 }}>
            {logoSrc && (
              <img src={logoSrc} alt="Menu" className="radial-menu-logo" />
            )}
          </div>
        </div>

        {/* Menu Items */}
        {isMenuOpen && (
          <div className="radial-menu-items">
            {menuItems.map((item, index) => {
              const position = getPosition(item.angle);
              return (
                <button
                  key={item.id}
                  className="radial-menu-item"
                  onClick={() => handleItemClick(item)}
                  style={{
                    width: buttonSize,
                    height: buttonSize,
                    transform: \`translate(\${position.x}px, \${position.y}px)\`,
                    animationDelay: \`\${index * menuConfig.animation.menuItem.staggerDelay}s\`
                  }}
                >
                  <span className="radial-menu-item-label">{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Backdrop */}
      {isMenuOpen && (
        <div
          className="radial-menu-backdrop"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
}

export default CustomRadialMenu;

/* CSS TO INCLUDE (RadialMenu.css):
${css}
*/
`;
};

// Generate Pure CSS
export const generatePureCSS = (config, accentColor) => {
  const { visual, animation } = config;

  return `/* Radial Menu Styles - Pure CSS (No Tailwind) */

.radial-menu-container {
  position: fixed;
  right: 1rem;
  top: 7rem;
  z-index: 100;
}

.radial-menu-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.radial-menu-button:hover {
  transform: scale(1.1);
  box-shadow: 0 20px 25px -5px rgba(107, 114, 128, 0.75);
}

.radial-menu-button-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
}

.radial-menu-logo {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.radial-menu-items {
  position: absolute;
  top: 0;
  left: 0;
}

.radial-menu-item {
  position: absolute;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  background-color: #f3f4f6;
  border: 2px solid ${accentColor};
  color: ${accentColor};
  transition: all 0.2s ease;
  animation: menuItemAppear ${animation.menuItem.damping / 10}s ease-out forwards;
}

@keyframes menuItemAppear {
  0% {
    opacity: 0;
    transform: scale(0) translate(0, 0);
  }
  100% {
    opacity: 1;
    transform: scale(1) translate(var(--x), var(--y));
  }
}

.radial-menu-item:hover {
  transform: scale(1.1);
  background-color: #374151;
}

.radial-menu-item-label {
  font-size: 10px;
  font-family: monospace;
  text-align: center;
  line-height: 1.2;
  padding: 0 0.25rem;
  font-weight: 600;
}

.radial-menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99;
  background-color: ${visual.colors.backdrop};
  backdrop-filter: blur(${visual.backdrop.blur});
  -webkit-backdrop-filter: blur(${visual.backdrop.blur});
  animation: backdropFadeIn ${animation.backdrop.duration}s ease-out;
}

@keyframes backdropFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .radial-menu-container {
    right: 0.5rem;
    top: 4rem;
  }
}
`;
};

// Generate package.json for export
export const generatePackageJson = (packageName) => {
  return `{
  "name": "${packageName}",
  "version": "1.0.0",
  "description": "Custom Radial Menu Component",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "scripts": {
    "build": "rollup -c"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "peerDependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "keywords": [
    "react",
    "menu",
    "radial-menu",
    "component"
  ],
  "license": "MIT"
}
`;
};

// Generate README
export const generateReadme = (packageName, useTailwind) => {
  const installNote = useTailwind
    ? `
## Prerequisites

This component uses Tailwind CSS. Make sure you have it configured in your project.

\`\`\`bash
npm install tailwindcss
\`\`\`
`
    : `
## Prerequisites

This component uses pure CSS - no Tailwind required! Perfect for Tauri apps and other environments.
`;

  return `# ${packageName}

Custom Radial Menu Component generated by Bitter Menu Builder.
${installNote}

## Installation

\`\`\`bash
npm install ${packageName}
\`\`\`

## Usage

\`\`\`jsx
import CustomRadialMenu from '${packageName}';

function App() {
  return (
    <CustomRadialMenu logoSrc="/path/to/logo.png" />
  );
}
\`\`\`

${!useTailwind ? `
## Pure CSS Version

Don't forget to import the CSS file:

\`\`\`jsx
import CustomRadialMenu from '${packageName}';
import '${packageName}/dist/RadialMenu.css';
\`\`\`
` : ''}

## Customization

Edit the generated config to customize colors, animations, and behavior.

## License

MIT
`;
};

// Generate complete package as zip structure
export const generatePackageStructure = (packageName, config, menuItems, accentColor, useTailwind) => {
  return {
    'package.json': generatePackageJson(packageName),
    'README.md': generateReadme(packageName, useTailwind),
    'src/index.js': generateReactComponent(config, menuItems, accentColor, useTailwind),
    'src/config.js': generateMenuConfig(config, menuItems, accentColor),
    ...(useTailwind ? {} : {
      'src/RadialMenu.css': generatePureCSS(config, accentColor)
    })
  };
};

// ─── Customizer-specific generators (flat config from OrbitCustomizer) ────────

export const generateStandaloneComponent = (config) => {
  const {
    radius,
    menuOffset,
    buttonSize,
    logoText,
    logoImage,
    logoType,
    menuItemFontSize,
    buttonBgColor,
    buttonOutlineColor,
    buttonOutlineWidth,
    menuItemBgColor,
    menuItemOutlineColor,
    menuItemOutlineWidth,
    menuItemTextColor,
    logoStiffness,
    logoDamping,
  } = config;

  const logoImageCode = logoType === 'image' && logoImage
    ? `
            {logoImage && (
              <img
                src={logoImage}
                alt="Logo"
                style={{ width: '70%', height: '70%', objectFit: 'contain' }}
              />
            )}`
    : '';

  const logoTextCode = logoType === 'text' ? `{logoText || '${logoText}'}` : '';

  return `import React, { useState } from 'react';
import { motion } from 'framer-motion';

const OrbitMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logoRotation, setLogoRotation] = useState(0);

  const config = {
    radius: ${radius},
    menuOffset: ${menuOffset},
    buttonSize: ${buttonSize},
    logoText: '${logoText}',
    logoType: '${logoType}',
    menuItemFontSize: ${menuItemFontSize},
    colors: {
      buttonBg: '${buttonBgColor}',
      buttonOutline: '${buttonOutlineColor}',
      buttonOutlineWidth: ${buttonOutlineWidth},
      menuItemBg: '${menuItemBgColor}',
      menuItemText: '${menuItemTextColor}',
      menuItemOutline: '${menuItemOutlineColor}',
      menuItemOutlineWidth: ${menuItemOutlineWidth},
    },
    animation: { logoStiffness: ${logoStiffness}, logoDamping: ${logoDamping} }
  };

  const menuItems = [
    { id: 1, angle: 0, label: 'Menu 1', route: '/page1' },
    { id: 2, angle: -45, label: 'Menu 2', route: '/page2' },
    { id: 3, angle: -90, label: 'Menu 3', route: '/page3' },
    { id: 4, angle: -135, label: 'Menu 4', route: '/page4' },
    { id: 5, angle: -180, label: 'Home', route: '/' },
  ];

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setLogoRotation(isOpen ? 0 : 180);
  };

  return (
    <div style={{ position: 'fixed', bottom: '2em', right: '2em', zIndex: 1000 }}>
      <motion.div
        onClick={handleToggle}
        animate={{ rotate: logoRotation }}
        transition={{ type: 'spring', stiffness: config.animation.logoStiffness, damping: config.animation.logoDamping }}
        style={{
          position: 'relative', width: config.buttonSize, height: config.buttonSize,
          backgroundColor: config.colors.buttonBg,
          border: config.colors.buttonOutlineWidth > 0 ? \`\${config.colors.buttonOutlineWidth}px solid \${config.colors.buttonOutline}\` : 'none',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px', fontWeight: 'bold', color: '#fff', cursor: 'pointer', overflow: 'hidden',
          transform: \`translateY(\${config.menuOffset}px)\`,
        }}
      >${logoImageCode}${logoTextCode}
      </motion.div>
      {menuItems.map((item, index) => {
        const angleRad = (item.angle * Math.PI) / 180;
        const targetRadius = isOpen ? config.radius : 0;
        return (
          <motion.div key={item.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ x: Math.cos(angleRad) * targetRadius, y: Math.sin(angleRad) * targetRadius, scale: isOpen ? 1 : 0, opacity: isOpen ? 1 : 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: index * 0.05 }}
            style={{
              position: 'absolute', left: config.buttonSize / 2, top: config.buttonSize / 2 + config.menuOffset,
              transform: 'translate(-50%, -50%)', width: config.buttonSize, height: config.buttonSize,
              backgroundColor: config.colors.menuItemBg, border: \`\${config.colors.menuItemOutlineWidth}px solid \${config.colors.menuItemOutline}\`,
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: config.menuItemFontSize, color: config.colors.menuItemText, cursor: 'pointer',
              fontFamily: 'monospace', textAlign: 'center', padding: '4px', pointerEvents: isOpen ? 'auto' : 'none',
            }}
            onClick={() => console.log('Navigate to:', item.route)}
          >{item.label}</motion.div>
        );
      })}
    </div>
  );
};

export default OrbitMenu;
`;
};

export const generateInstallationGuide = (config) => {
  const logoLine = config.logoType === 'text'
    ? `- **Logo Text:** "${config.logoText || ''}"`
    : (config.logoType === 'icon'
      ? `- **Logo Icon:** ${config.logoIconKey || 'n/a'}`
      : '- **Logo:** Custom Image');

  return `# OrbitMenu Installation Guide

## Step 1: Install Dependencies

\`\`\`bash
npm install framer-motion
\`\`\`

## Step 2: Copy the Component

Copy the \`OrbitMenu.jsx\` component to your project:
\`\`\`
src/components/OrbitMenu.jsx
\`\`\`

## Step 3: Use in Your App

\`\`\`jsx
import OrbitMenu from './components/OrbitMenu';

function App() {
  return (
    <div>
      {/* Your app content */}
      <OrbitMenu />
    </div>
  );
}
\`\`\`

## Configuration

Your current configuration:

### Layout
- **Radius:** ${config.radius ?? 'n/a'}px
- **Menu Offset X:** ${config.menuOffsetX ?? 0}px
- **Menu Offset Y:** ${config.menuOffset ?? 'n/a'}px
- **Start Angle:** ${config.startAngle ?? 0}deg
- **Button Size:** ${config.buttonSize ?? 'n/a'}px
- **Menu Item Font Size:** ${config.menuItemFontSize ?? 'n/a'}px

### Shape
- **Button Shape:** ${config.buttonShape || 'circle'}
- **Square Radius:** ${config.squareRadius ?? 0}px
- **Polygon Sides:** ${config.polygonSides ?? 'n/a'}
- **Polygon Corner:** ${config.polygonCorner ?? 0}%

### Logo
- **Logo Type:** ${config.logoType || 'text'}
${logoLine}
- **Logo Size:** ${config.logoSize ?? 'n/a'}%
- **Logo Fit:** ${config.logoFit || 'contain'}
- **Logo Font:** ${config.logoFontFamily || 'n/a'}
- **Logo Font Weight:** ${config.logoFontWeight ?? 'n/a'}

### Colors
- **Center Button Background:** ${config.buttonBgColor || 'n/a'}
- **Center Button Outline:** ${config.buttonOutlineColor || 'n/a'}
- **Center Button Outline Width:** ${config.buttonOutlineWidth ?? 'n/a'}px
- **Menu Item Background:** ${config.menuItemBgColor || 'n/a'}
- **Menu Item Text:** ${config.menuItemTextColor || 'n/a'}
- **Menu Item Outline:** ${config.menuItemOutlineColor || 'n/a'}
- **Menu Item Outline Width:** ${config.menuItemOutlineWidth ?? 'n/a'}px
- **Backdrop Tint Color:** ${config.backdropTintColor || 'n/a'}
- **Backdrop Tint Opacity:** ${config.backdropTintOpacity ?? 0}%
- **Backdrop Blur:** ${config.backdropBlur ?? 0}px

### Animation
- **Center Rotation Enabled:** ${config.centerButtonRotates === false ? 'No' : 'Yes'}
- **Logo Stiffness:** ${config.logoStiffness ?? 'n/a'}
- **Logo Damping:** ${config.logoDamping ?? 'n/a'}

### Backdrop Source
- **Backdrop Image:** ${config.backdropImage ? 'Custom image set' : 'Pattern/gradient only'}

## Save / Load Workflow

- Save your project as **Project JSON** to keep all values.
- Later, load the JSON again in the Customizer to continue editing.
- No API needed.

## Need Help?

- 🌐 zenorbit.denisbitter.de
- 📦 npm: @denisbitter/bitter-button-menu
`;
};

export const generateCSS = (config) => {
  const {
    buttonSize, buttonBgColor, buttonOutlineColor, buttonOutlineWidth,
    menuItemBgColor, menuItemTextColor, menuItemOutlineColor, menuItemOutlineWidth, menuItemFontSize,
  } = config;

  return `/* OrbitMenu Styles */

.orbit-menu {
  position: fixed;
  bottom: 2em;
  right: 2em;
  z-index: 1000;
}

.orbit-menu__button {
  width: ${buttonSize}px;
  height: ${buttonSize}px;
  background-color: ${buttonBgColor};
  border: ${buttonOutlineWidth}px solid ${buttonOutlineColor};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.orbit-menu__button:hover { transform: scale(1.05); }
.orbit-menu__button--open { transform: rotate(180deg); }

.orbit-menu__item {
  position: absolute;
  width: ${buttonSize}px;
  height: ${buttonSize}px;
  background-color: ${menuItemBgColor};
  border: ${menuItemOutlineWidth}px solid ${menuItemOutlineColor};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${menuItemFontSize}px;
  color: ${menuItemTextColor};
  cursor: pointer;
  font-family: monospace;
  text-align: center;
  padding: 4px;
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease;
}

.orbit-menu__item:hover { transform: scale(1.1); z-index: 10; }
`;
};
