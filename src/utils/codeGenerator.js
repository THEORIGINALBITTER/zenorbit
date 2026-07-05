/**
 * Code Generator for Radial Menu
 * Generates code with Tailwind CSS OR Pure CSS (for Tauri/non-Tailwind environments)
 */

import { extractFontStylesheetUrl } from './fontUtils';

const EXPORT_BRAND = 'ZenOrbit by Denis Bitter';
const EXPORT_BRAND_URL = 'https://zenorbit.denisbitter.de';

const normalizeExportOptions = (options = {}) => ({
  includeBranding: options.includeBranding !== false,
});

const jsBanner = (label, options) => normalizeExportOptions(options).includeBranding ? `/**
 * ${label}
 * Generated with ${EXPORT_BRAND}
 * ${EXPORT_BRAND_URL}
 */

` : '';

const cssBanner = (label, options) => normalizeExportOptions(options).includeBranding ? `/* ${label}
 * Generated with ${EXPORT_BRAND}
 * ${EXPORT_BRAND_URL}
 */

` : '';

const htmlBanner = (label, options) => normalizeExportOptions(options).includeBranding
  ? `<!-- ${label} | Generated with ${EXPORT_BRAND} | ${EXPORT_BRAND_URL} -->\n`
  : '';

const textBanner = (label, options) => normalizeExportOptions(options).includeBranding ? `${label}
Generated with ${EXPORT_BRAND}
${EXPORT_BRAND_URL}

` : `${label}\n\n`;

export const generateProjectJson = (state, options = {}) => {
  const { includeBranding } = normalizeExportOptions(options);
  return JSON.stringify({
    _meta: {
      ...(includeBranding ? { generatedWith: EXPORT_BRAND, website: EXPORT_BRAND_URL } : {}),
      format: 'project-json',
      exportedAt: new Date().toISOString(),
    },
    ...state,
  }, null, 2);
};

export const generateMenuConfig = (config, menuItems, accentColor, options = {}) => {
  return `${jsBanner('ZenOrbit menu config', options)}export const menuConfig = ${JSON.stringify(config, null, 2)};

export const menuItems = ${JSON.stringify(menuItems, null, 2)};

export const accentColor = "${accentColor}";
`;
};

export const generateReactComponent = (config, menuItems, accentColor, useTailwind = true, options = {}) => {
  if (useTailwind) {
    return generateTailwindComponent(config, menuItems, accentColor, options);
  } else {
    return generatePureCSSComponent(config, menuItems, accentColor, options);
  }
};

// Tailwind Version (original)
const generateTailwindComponent = (config, menuItems, accentColor, options = {}) => {
  const fontUrl = extractFontStylesheetUrl(config?.visual?.button?.fontUrl || config?.visual?.menuItem?.fontUrl || '');
  return `${jsBanner('ZenOrbit React radial menu component', options)}import React${fontUrl ? ", { useEffect }" : ''} from 'react';
import BitterButtonWithMenu from '@denisbitter/bitter-button-menu';

const menuConfig = ${JSON.stringify(config, null, 2)};

const menuItems = ${JSON.stringify(menuItems, null, 2)};

function CustomRadialMenu({ logoSrc }) {
  ${fontUrl ? `useEffect(() => {
    const id = 'zenorbit-custom-font';
    let link = document.getElementById(id);
    if (!link) {
      link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = ${JSON.stringify(fontUrl)};
      document.head.appendChild(link);
    }
  }, []);` : ''}
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
const generatePureCSSComponent = (config, menuItems, accentColor, options = {}) => {
  const css = generatePureCSS(config, accentColor, options);
  const fontUrl = extractFontStylesheetUrl(config?.visual?.button?.fontUrl || config?.visual?.menuItem?.fontUrl || '');

  return `${jsBanner('ZenOrbit React radial menu component', options)}import React, { useState, useEffect, useRef } from 'react';
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

  ${fontUrl ? `useEffect(() => {
    const id = 'zenorbit-custom-font';
    let link = document.getElementById(id);
    if (!link) {
      link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = ${JSON.stringify(fontUrl)};
      document.head.appendChild(link);
    }
  }, []);` : ''}

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
export const generatePureCSS = (config, accentColor, options = {}) => {
  const { visual, animation } = config;
  const fontFamily = visual?.button?.fontFamily || visual?.menuItem?.fontFamily || 'monospace';
  const fontSize = visual?.button?.fontSize || '10px';
  const fontWeight = visual?.menuItem?.fontWeight ?? 600;
  const letterSpacing = visual?.menuItem?.letterSpacing || '0px';
  const textTransform = visual?.menuItem?.textTransform || 'none';

  return `${cssBanner('Radial Menu Styles - Pure CSS (No Tailwind)', options)}.radial-menu-container {
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
  font-size: ${fontSize};
  font-family: ${fontFamily};
  text-align: center;
  line-height: 1.2;
  padding: 0 0.25rem;
  font-weight: ${fontWeight};
  letter-spacing: ${letterSpacing};
  text-transform: ${textTransform};
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
  "description": "Custom Radial Menu Component generated with ${EXPORT_BRAND}",
  "author": "Denis Bitter",
  "homepage": "${EXPORT_BRAND_URL}",
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
export const generateReadme = (packageName, useTailwind, options = {}) => {
  const { includeBranding } = normalizeExportOptions(options);
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

  return `${textBanner(packageName, options)}# ${packageName}

${includeBranding ? `Custom Radial Menu Component generated with ${EXPORT_BRAND}.` : 'Custom Radial Menu Component.'}
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
export const generatePackageStructure = (packageName, config, menuItems, accentColor, useTailwind, options = {}) => {
  return {
    'package.json': generatePackageJson(packageName),
    'README.md': generateReadme(packageName, useTailwind, options),
    'src/index.js': generateReactComponent(config, menuItems, accentColor, useTailwind, options),
    'src/config.js': generateMenuConfig(config, menuItems, accentColor, options),
    ...(useTailwind ? {} : {
      'src/RadialMenu.css': generatePureCSS(config, accentColor, options)
    })
  };
};

// ─── Customizer-specific generators (flat config from OrbitCustomizer) ────────

export const generateStandaloneComponent = (config, options = {}) => {
  const {
    radius,
    menuOffset,
    menuOffsetX = 0,
    buttonSize,
    logoText,
    logoImage,
    logoType,
    menuItemFontSize,
    menuItemFontFamily = '"IBM Plex Mono", monospace',
    menuItemFontUrl = '',
    scrollBehavior = { enabled: false },
    buttonBgColor,
    buttonOutlineColor,
    buttonOutlineWidth,
    menuItemBgColor,
    menuItemOutlineColor,
    menuItemOutlineWidth,
    menuItemTextColor,
    logoStiffness,
    logoDamping,
    itemMotionDuration = 0.72,
    itemMotionStagger = 0.05,
    itemMotionCurvePreset = 'snappy',
    itemMotionBezier = [0.34, 1.32, 0.64, 1],
    responsive,
  } = config;

  const baseProfile = { radius, menuOffset, menuOffsetX, buttonSize, menuItemFontSize };

  const responsiveConfig = {
    desktop: { ...baseProfile, ...(responsive?.desktop || {}) },
    ipadPortrait: { ...baseProfile, ...(responsive?.ipadPortrait || responsive?.tablet || {}) },
    ipadLandscape: { ...baseProfile, ...(responsive?.ipadLandscape || responsive?.tablet || {}) },
    mobile: { ...baseProfile, ...(responsive?.mobile || {}) },
    breakpoints: {
      ipadPortraitMax: 1024,
      ipadLandscapeMax: 1366,
      mobileMax: 768,
      ...(responsive?.breakpoints || {}),
    },
  };

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

  const sb = scrollBehavior?.enabled ? scrollBehavior : null;
  const sbCorner = sb?.corner || 'right';
  const sbOppCorner = sbCorner === 'right' ? 'left' : 'right';

  const scrollHookCode = sb ? `
  const containerRef = React.useRef(null);
  const ticking = React.useRef(false);
  useEffect(() => {
    const BASE_TOP      = ${sb.startTop};
    const HEADER_HEIGHT = ${sb.headerEnabled ? (sb.headerHeight ?? 0) : 0};
    const TOP_STOP_OVER_HEADER = ${sb.headerEnabled ? (sb.topStopOverHeader ?? 0) : 0};
    const FOOTER_HEIGHT = ${sb.footerEnabled ? (sb.footerHeight ?? 0) : 0};
    const BUFFER_CLOSED = ${sb.bottomBuffer};
    const BUFFER_OPEN   = ${sb.bottomBufferOpen};
    const OPEN_SHIFT_TOP    = ${sb.openShiftTop ?? 69};
    const OPEN_SHIFT_BOTTOM = ${sb.openShiftBottom ?? -40};
    const SPEED         = ${sb.speedFactor};
    const update = () => {
      if (!containerRef.current) return;
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const isNearBottom = scrollY > window.innerHeight * 0.4;
      const openShift = isOpen ? (isNearBottom ? OPEN_SHIFT_BOTTOM : OPEN_SHIFT_TOP) : 0;
      const minTop = HEADER_HEIGHT - TOP_STOP_OVER_HEADER;
      const effectiveTop = Math.max(minTop, BASE_TOP + HEADER_HEIGHT + openShift);
      const buffer = (isOpen ? BUFFER_OPEN : BUFFER_CLOSED) + FOOTER_HEIGHT;
      const maxY = Math.max(0, vh - effectiveTop - buffer);
      const y = Math.min(Math.max(0, scrollY * SPEED), maxY);
      containerRef.current.style.top = (effectiveTop + y) + 'px';
      ticking.current = false;
    };
    update();
    const onScroll = () => { if (!ticking.current) { requestAnimationFrame(update); ticking.current = true; } };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isOpen]);
` : '';

  const containerStyle = sb
    ? `position: 'fixed', top: '${sb.startTop + (sb.headerEnabled ? (sb.headerHeight ?? 0) : 0)}px', ${sbCorner}: '${sb.edgeGap}px', ${sbOppCorner}: 'auto', zIndex: 1000, width: bs, height: bs`
    : `position: 'fixed', top: \`\${activeResponsive.menuOffset ?? config.menuOffset}px\`, right: \`\${activeResponsive.menuOffsetX ?? config.menuOffsetX}px\`, zIndex: 1000, width: bs, height: bs`;

  const refProp = sb ? ' ref={containerRef}' : '';

  return `${jsBanner('ZenOrbit standalone OrbitMenu component', options)}import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

const OrbitMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewport, setViewport] = useState(
    typeof window !== 'undefined'
      ? { width: window.innerWidth, height: window.innerHeight }
      : { width: 1440, height: 900 }
  );

  const config = {
    radius: ${radius},
    menuOffset: ${menuOffset},
    menuOffsetX: ${menuOffsetX},
    buttonSize: ${buttonSize},
    logoText: '${logoText}',
    logoType: '${logoType}',
    menuItemFontSize: ${menuItemFontSize},
    menuItemFontFamily: ${JSON.stringify(menuItemFontFamily)},
    menuItemFontUrl: ${JSON.stringify(menuItemFontUrl)},
    responsive: ${JSON.stringify(responsiveConfig, null, 4)},
    colors: {
      buttonBg: '${buttonBgColor}',
      buttonOutline: '${buttonOutlineColor}',
      buttonOutlineWidth: ${buttonOutlineWidth},
      menuItemBg: '${menuItemBgColor}',
      menuItemText: '${menuItemTextColor}',
      menuItemOutline: '${menuItemOutlineColor}',
      menuItemOutlineWidth: ${menuItemOutlineWidth},
    },
    animation: {
      logoStiffness: ${logoStiffness},
      logoDamping: ${logoDamping},
      menuItemDuration: ${itemMotionDuration},
      menuItemStagger: ${itemMotionStagger},
      menuItemCurvePreset: ${JSON.stringify(itemMotionCurvePreset)},
      menuItemBezier: ${JSON.stringify(itemMotionBezier)},
    }
  };

  useEffect(() => {
    const onResize = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!config.menuItemFontUrl) return;
    const id = 'zenorbit-custom-font';
    let link = document.getElementById(id);
    if (!link) {
      link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = config.menuItemFontUrl;
      document.head.appendChild(link);
    }
  }, []);

  const activeResponsive = useMemo(() => {
    const viewportWidth = viewport.width;
    const viewportHeight = viewport.height;
    const b = config.responsive?.breakpoints || {};
    const mobileMax = b.mobileMax ?? 768;
    const ipadPortraitMax = b.ipadPortraitMax ?? 1024;
    const ipadLandscapeMax = b.ipadLandscapeMax ?? 1366;

    if (viewportWidth <= mobileMax) return config.responsive.mobile || config.responsive.desktop;
    if (viewportWidth <= ipadPortraitMax && viewportHeight > viewportWidth) {
      return config.responsive.ipadPortrait || config.responsive.ipadLandscape || config.responsive.desktop;
    }
    if (viewportWidth <= ipadLandscapeMax) {
      return config.responsive.ipadLandscape || config.responsive.ipadPortrait || config.responsive.desktop;
    }
    return config.responsive.desktop;
  }, [viewport]);

  const menuItems = [
    { id: 1, angle: 0, label: 'Menu 1', route: '/page1' },
    { id: 2, angle: -45, label: 'Menu 2', route: '/page2' },
    { id: 3, angle: -90, label: 'Menu 3', route: '/page3' },
    { id: 4, angle: -135, label: 'Menu 4', route: '/page4' },
    { id: 5, angle: -180, label: 'Home', route: '/' },
  ];

  const handleToggle = () => setIsOpen(!isOpen);

  const handleItemClick = (item) => {
    setIsOpen(false);
    if (item.external) {
      window.open(item.route, '_blank', 'noopener');
    } else {
      window.location.hash = item.route === '/' ? '/' : item.route;
    }
  };
${scrollHookCode}
  const bs = activeResponsive.buttonSize;
  const r = activeResponsive.radius;

  return (
    <div${refProp} style={{
      ${containerStyle},
    }}>
      {/* framer-motion v12: never use style.transform on motion.div — animate prop takes full ownership */}
      <motion.div
        onClick={handleToggle}
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: config.animation.logoStiffness, damping: config.animation.logoDamping }}
        style={{
          width: bs, height: bs,
          backgroundColor: config.colors.buttonBg,
          border: config.colors.buttonOutlineWidth > 0 ? \`\${config.colors.buttonOutlineWidth}px solid \${config.colors.buttonOutline}\` : 'none',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px', fontWeight: 'bold', color: '#fff', cursor: 'pointer', overflow: 'hidden',
        }}
      >${logoImageCode}${logoTextCode}
      </motion.div>
      {menuItems.map((item, index) => {
        const angleRad = (item.angle * Math.PI) / 180;
        return (
          <motion.div
            key={item.id}
            initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
            animate={{
              x: isOpen ? Math.cos(angleRad) * r : 0,
              y: isOpen ? Math.sin(angleRad) * r : 0,
              scale: isOpen ? 1 : 0.3,
              opacity: isOpen ? 1 : 0,
            }}
            transition={{
              duration: config.animation.menuItemDuration,
              ease: config.animation.menuItemBezier,
              delay: index * config.animation.menuItemStagger,
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: bs, height: bs,
              backgroundColor: config.colors.menuItemBg,
              border: \`\${config.colors.menuItemOutlineWidth}px solid \${config.colors.menuItemOutline}\`,
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: activeResponsive.menuItemFontSize, color: config.colors.menuItemText, cursor: 'pointer',
              fontFamily: config.menuItemFontFamily, textAlign: 'center', padding: '4px',
              pointerEvents: isOpen ? 'auto' : 'none',
            }}
            onClick={() => handleItemClick(item)}
          >{item.label}</motion.div>
        );
      })}
    </div>
  );
};

export default OrbitMenu;
`;
};

export const generateInstallationGuide = (config, options = {}) => {
  const { includeBranding } = normalizeExportOptions(options);
  const responsive = config.responsive || {};
  const rDesktop = responsive.desktop || {};
  const rIpadPortrait = responsive.ipadPortrait || responsive.tablet || {};
  const rIpadLandscape = responsive.ipadLandscape || responsive.tablet || {};
  const rMobile = responsive.mobile || {};
  const logoLine = config.logoType === 'text'
    ? `- **Logo Text:** "${config.logoText || ''}"`
    : (config.logoType === 'icon'
      ? `- **Logo Icon:** ${config.logoIconKey || 'n/a'}`
      : '- **Logo:** Custom Image');

  return `${textBanner('OrbitMenu Installation Guide', options)}# OrbitMenu Installation Guide

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

### Responsive Profiles
- **Desktop:** r${rDesktop.radius ?? 'n/a'} · size ${rDesktop.buttonSize ?? 'n/a'} · offsetX ${rDesktop.menuOffsetX ?? 'n/a'} · offsetY ${rDesktop.menuOffset ?? 'n/a'}
- **iPad Hoch:** r${rIpadPortrait.radius ?? 'n/a'} · size ${rIpadPortrait.buttonSize ?? 'n/a'} · offsetX ${rIpadPortrait.menuOffsetX ?? 'n/a'} · offsetY ${rIpadPortrait.menuOffset ?? 'n/a'}
- **iPad Quer:** r${rIpadLandscape.radius ?? 'n/a'} · size ${rIpadLandscape.buttonSize ?? 'n/a'} · offsetX ${rIpadLandscape.menuOffsetX ?? 'n/a'} · offsetY ${rIpadLandscape.menuOffset ?? 'n/a'}
- **Mobile:** r${rMobile.radius ?? 'n/a'} · size ${rMobile.buttonSize ?? 'n/a'} · offsetX ${rMobile.menuOffsetX ?? 'n/a'} · offsetY ${rMobile.menuOffset ?? 'n/a'}

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
- **Item Motion Duration:** ${config.itemMotionDuration ?? 'n/a'}s
- **Item Motion Stagger:** ${config.itemMotionStagger ?? 'n/a'}s
- **Item Motion Curve:** ${config.itemMotionCurvePreset || 'n/a'} ${Array.isArray(config.itemMotionBezier) ? `(${config.itemMotionBezier.join(', ')})` : ''}

### Backdrop Source
- **Backdrop Image:** ${config.backdropImage ? 'Custom image set' : 'Pattern/gradient only'}

## Save / Load Workflow

- Save your project as **Project JSON** to keep all values.
- Later, load the JSON again in the Customizer to continue editing.
- No API needed.

${includeBranding ? `## Branding Notice

- Generated with ${EXPORT_BRAND}
- Website: ${EXPORT_BRAND_URL}
` : ''}

## Need Help?

- 🌐 zenorbit.denisbitter.de
- 📦 npm: @denisbitter/bitter-button-menu
`;
};

export const generateCSS = (config, options = {}) => {
  const responsive = config.responsive || {};
  const desktop = responsive.desktop || {};
  const ipadPortrait = responsive.ipadPortrait || responsive.tablet || {};
  const ipadLandscape = responsive.ipadLandscape || responsive.tablet || {};
  const mobile = responsive.mobile || {};
  const bp = responsive.breakpoints || {};
  const ipadPortraitMax = bp.ipadPortraitMax ?? 1024;
  const ipadLandscapeMax = bp.ipadLandscapeMax ?? 1366;
  const mobileMax = bp.mobileMax ?? 768;

  const {
    buttonSize, buttonBgColor, buttonOutlineColor, buttonOutlineWidth,
    menuItemBgColor, menuItemTextColor, menuItemOutlineColor, menuItemOutlineWidth, menuItemFontSize,
    menuItemFontFamily = '"IBM Plex Mono", monospace',
    menuItemFontUrl = '',
    scrollBehavior = { enabled: false },
  } = config;

  const sb = scrollBehavior?.enabled ? scrollBehavior : null;
  const containerPos = sb
    ? `  position: fixed;\n  top: ${sb.startTop + (sb.headerEnabled ? (sb.headerHeight ?? 0) : 0)}px;\n  ${sb.corner}: ${sb.edgeGap}px;`
    : `  position: fixed;\n  bottom: 2em;\n  right: 2em;`;

  return `${cssBanner('OrbitMenu Styles', options)}${menuItemFontUrl ? `@import url('${menuItemFontUrl}');\n\n` : ''}.orbit-menu {
${containerPos}
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
  font-family: ${menuItemFontFamily};
  text-align: center;
  padding: 4px;
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease;
}

.orbit-menu__item:hover { transform: scale(1.1); z-index: 10; }

.orbit-menu--desktop .orbit-menu__button {
  width: ${desktop.buttonSize ?? buttonSize}px;
  height: ${desktop.buttonSize ?? buttonSize}px;
}

.orbit-menu--desktop .orbit-menu__item {
  width: ${desktop.buttonSize ?? buttonSize}px;
  height: ${desktop.buttonSize ?? buttonSize}px;
  font-size: ${desktop.menuItemFontSize ?? menuItemFontSize}px;
}

@media (max-width: ${ipadPortraitMax}px) and (orientation: portrait) {
  .orbit-menu__button {
    width: ${ipadPortrait.buttonSize ?? buttonSize}px;
    height: ${ipadPortrait.buttonSize ?? buttonSize}px;
  }
  .orbit-menu__item {
    width: ${ipadPortrait.buttonSize ?? buttonSize}px;
    height: ${ipadPortrait.buttonSize ?? buttonSize}px;
    font-size: ${ipadPortrait.menuItemFontSize ?? menuItemFontSize}px;
  }
}

@media (max-width: ${ipadLandscapeMax}px) and (orientation: landscape) {
  .orbit-menu__button {
    width: ${ipadLandscape.buttonSize ?? buttonSize}px;
    height: ${ipadLandscape.buttonSize ?? buttonSize}px;
  }
  .orbit-menu__item {
    width: ${ipadLandscape.buttonSize ?? buttonSize}px;
    height: ${ipadLandscape.buttonSize ?? buttonSize}px;
    font-size: ${ipadLandscape.menuItemFontSize ?? menuItemFontSize}px;
  }
}

@media (max-width: ${mobileMax}px) {
  .orbit-menu__button {
    width: ${mobile.buttonSize ?? buttonSize}px;
    height: ${mobile.buttonSize ?? buttonSize}px;
  }
  .orbit-menu__item {
    width: ${mobile.buttonSize ?? buttonSize}px;
    height: ${mobile.buttonSize ?? buttonSize}px;
    font-size: ${mobile.menuItemFontSize ?? menuItemFontSize}px;
  }
}
`;
};

// ─── HTML Package Generator ────────────────────────────────────────────────────
// Generates all files needed for a plain HTML site (no framework required).
// Returns { filename → string content } — caller zips with JSZip.

export const generateHTMLPackage = (config, options = {}) => {
  const { includeBranding } = normalizeExportOptions(options);
  const componentCode = generateStandaloneComponent(config, options);
  const indexHtml = `${htmlBanner('ZenOrbit HTML runtime page', options)}<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ZenOrbit Menu Runtime</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      min-height: 100%;
      background: #0f1014;
      color: #e8e3d7;
      font-family: "IBM Plex Mono", monospace;
    }
    .hint {
      position: fixed;
      left: 12px;
      bottom: 12px;
      z-index: 2;
      font-size: 11px;
      color: #a79b88;
      background: rgba(20,20,24,0.82);
      border: 1px solid rgba(208,203,184,0.24);
      border-radius: 8px;
      padding: 6px 10px;
    }
    .error {
      position: fixed;
      left: 12px;
      bottom: 52px;
      z-index: 3;
      max-width: 560px;
      font-size: 11px;
      line-height: 1.5;
      color: #ffb4b4;
      background: rgba(54,20,20,0.9);
      border: 1px solid rgba(255,120,120,0.4);
      border-radius: 8px;
      padding: 8px 10px;
      display: none;
      white-space: pre-line;
    }
  </style>
</head>
<body>
  <div id="orbit-root"></div>
  ${includeBranding ? '<div class="hint">ZenOrbit Runtime · versucht <code>orbit.iife.js</code> und <code>dist/orbit.iife.js</code></div>' : ''}
  <div id="orbit-error" class="error"></div>
  <script>
    (function loadOrbitBundle() {
      const candidates = ['./orbit.iife.js', './dist/orbit.iife.js'];
      const errorBox = document.getElementById('orbit-error');
      let current = 0;

      const tryNext = () => {
        if (current >= candidates.length) {
          errorBox.style.display = 'block';
          errorBox.textContent = [
            'Orbit Bundle nicht gefunden.',
            'Bitte im Export-Ordner ausführen:',
            '1) npm install',
            '2) npm run build',
            '3) Prüfen ob dist/orbit.iife.js existiert',
            'Optional: dist/orbit.iife.js neben index.html kopieren als orbit.iife.js',
          ].join('\\n');
          return;
        }

        const src = candidates[current++];
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
          if (errorBox) errorBox.style.display = 'none';
        };
        script.onerror = () => {
          tryNext();
        };
        document.body.appendChild(script);
      };

      tryNext();
    })();
  </script>
</body>
</html>`;

  const mainJsx = `${jsBanner('ZenOrbit HTML package entry', options) }import React from 'react';
import { createRoot } from 'react-dom/client';
import OrbitMenu from './orbit-menu.jsx';

const root = document.getElementById('orbit-root');
if (root) {
  createRoot(root).render(<OrbitMenu />);
}
`;

  const viteConfig = `${jsBanner('ZenOrbit Vite config', options) }import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/main.jsx',
      name: 'OrbitMenu',
      fileName: 'orbit',
      formats: ['iife'],
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});
`;

  const packageJson = `{
  "name": "ZenOrbit-menu-build",
  "version": "1.0.0",
  "private": true,
  "author": "Denis Bitter",
  "homepage": "${EXPORT_BRAND_URL}",
  "scripts": {
    "build": "vite build"
  },
  "dependencies": {
    "framer-motion": "^12.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^7.0.0"
  }
}
`;

  const snippet = `${htmlBanner('ZenOrbit HTML snippet', options)}<!-- 1. Füge dieses div ein (am besten direkt vor </body>) -->
<div id="orbit-root"></div>

<!-- 2. Lade das OrbitMenu Script (direkt darunter) -->
<script src="orbit.iife.js"></script>
`;

  const readme = `${htmlBanner('ZenOrbit setup guide', options)}<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>OrbitMenu — Setup Guide</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
  <style>
    :root {
      --bg: #F0EBE1;
      --text: #1a1a1a;
      --text-muted: #40372f;
      --text-soft: #6d6154;
      --header-bg: #1a1a1a;
      --header-text: #d0cbb8;
      --card: #E8E2D8;
      --code-bg: #1a1a1a;
      --code-border: #2d3142;
      --code-text: #EFE7DC;
      --line: #D4CEC6;
      --accent: #b08d62;
      --accent-soft: #7b5b35;
    }
    [data-theme="dark"] {
      --bg: #0f1116;
      --text: #e8e3d7;
      --text-muted: #b4ab9a;
      --text-soft: #8f8575;
      --header-bg: #090a0d;
      --header-text: #d0cbb8;
      --card: #171a22;
      --code-bg: #0b0d12;
      --code-border: #2f3443;
      --code-text: #e6dcc6;
      --line: #2b2f3a;
      --accent: #d0cbb8;
      --accent-soft: #9e8769;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: 'IBM Plex Mono', 'Courier New', monospace; padding: 0; line-height: 1.8; transition: background 0.25s ease, color 0.25s ease; }

    /* Header */
    .header { background: var(--header-bg); padding: 18px 32px; display: flex; align-items: center; justify-content: space-between; }
    .header-brand { display: flex; align-items: center; gap: 10px; }
    .header-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); }
    .header-name { font-size: 11px; color: var(--header-text); letter-spacing: 0.14em; text-transform: uppercase; }
    .header-tag { font-size: 10px; color: #8d8579; letter-spacing: 0.06em; }
    .theme-toggle {
      border: 1px solid rgba(208,203,184,0.28);
      background: rgba(208,203,184,0.08);
      color: var(--header-text);
      border-radius: 999px;
      padding: 5px 10px;
      font-size: 10px;
      font-family: inherit;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      cursor: pointer;
    }

    /* Content */
    .wrap { max-width: 680px; margin: 0 auto; padding: 64px 32px 80px; }

    /* Label */
    .label { font-size: 10px; color: var(--accent-soft); letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 12px; font-weight: 700; }

    /* Hero */
    h1 { font-size: 36px; font-weight: 700; color: var(--text); line-height: 1.15; margin-bottom: 16px; }
    .subtitle { font-size: 13px; color: var(--text-muted); margin-bottom: 56px; line-height: 1.7; }

    /* Steps */
    .step { display: flex; gap: 28px; margin-bottom: 44px; }
    .step-num-col { flex-shrink: 0; width: 72px; padding-top: 2px; }
    .step-num { font-size: 9px; color: var(--accent); letter-spacing: 0.18em; text-transform: uppercase; }
    .step-content {}
    .step-title { font-size: 17px; font-weight: 700; color: var(--text); margin-bottom: 10px; }
    .step-body { font-size: 12px; color: var(--text-muted); line-height: 1.8; }
    .step-body p { margin-bottom: 8px; }

    /* Code */
    code { background: color-mix(in srgb, var(--card) 82%, #ffffff 18%); border-radius: 3px; font-size: 11px; color: #624527; padding: 2px 6px; font-family: 'IBM Plex Mono', monospace; font-weight: 600; }
    pre { background: var(--code-bg); color: var(--code-text); border: 1px solid var(--code-border); border-radius: 6px; padding: 16px 18px; margin: 12px 0; font-size: 11.5px; line-height: 1.7; overflow-x: auto; font-family: 'IBM Plex Mono', monospace; }
    pre code { background: none; color: var(--header-text); padding: 0; font-size: inherit; }

    /* Divider */
    .divider { display: flex; align-items: center; gap: 16px; margin: 52px 0; }
    .divider-line { flex: 1; height: 1px; background: var(--line); }
    .divider-label { font-size: 9px; color: var(--accent-soft); letter-spacing: 0.22em; text-transform: uppercase; white-space: nowrap; font-weight: 700; }

    /* Tip box */
    .tip { background: var(--card); border-left: 3px solid var(--accent); border-radius: 0 4px 4px 0; padding: 14px 16px; margin: 12px 0; font-size: 12px; color: var(--text-muted); line-height: 1.8; }
    .tip strong { color: var(--text); font-weight: 700; }

    /* Links */
    a { color: var(--accent-soft); text-decoration: underline; text-decoration-color: var(--accent-soft); }

    /* Footer */
    .footer { border-top: 1px solid var(--line); padding-top: 20px; margin-top: 64px; display: flex; justify-content: space-between; font-size: 10px; color: var(--text-soft); }
    .footer a { color: var(--accent); text-decoration: none; }
  </style>
</head>
<body data-theme="light">

  <div class="header">
    <div class="header-brand">
      <img src="https://zenorbit.denisbitter.de/zenorbit-logo.svg" alt="ZenOrbit" style="width:22px;height:22px;object-fit:contain;" />
      <span class="header-name">ZenOrbit</span>
    </div>
    <div style="display:flex;align-items:center;gap:10px;">
      <span class="header-tag">orbit-menu-build · Setup Guide</span>
      <button id="theme-toggle" class="theme-toggle" type="button">Dark</button>
    </div>
  </div>

  <div class="wrap">

    <div class="label">Anleitung</div>
    <h1>OrbitMenu<br>in 3 Schritten.</h1>
    <p class="subtitle">
      Kein Framework. Kein Tailwind. Kein Fachwissen nötig.<br>
      Lade das Bundle, binde zwei Zeilen ein — fertig.
    </p>

    <!-- VIDEO: YouTube-ID unten eintragen wenn das Video live ist -->
    <div style="margin-bottom: 52px;">
      <iframe
        width="100%"
        height="360"
        src="https://www.youtube.com/embed/VIDEO_ID_HERE"
        title="OrbitMenu Setup — Schritt für Schritt"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        style="border-radius: 8px; border: 1px solid #D4CEC6; display: block;"
      ></iframe>
      <p style="font-size: 10px; color: #a151515; margin-top: 8px; text-align: center; letter-spacing: 0.06em;">
        Noch kein Video verfügbar — kommt bald auf <a href="https://youtube.com/@zenlabcode" target="_blank">@zenlabcode by denis bitter</a>
      </p>
    </div>

    <div class="step">
      <div class="step-num-col"><span class="step-num">Schritt 01</span></div>
      <div class="step-content">
        <div class="step-title">Node.js installieren <span style="font-size:13px;font-weight:400;color:#9a8878">(einmalig)</span></div>
        <div class="step-body">
          <p>Falls noch nicht vorhanden:</p>
          <p><a href="https://nodejs.org/en/download" target="_blank">nodejs.org</a> — LTS Version herunterladen und installieren.</p>
          <p>Danach im Terminal prüfen: <code>node -v</code></p>
        </div>
      </div>
    </div>

    <div class="step">
      <div class="step-num-col"><span class="step-num">Schritt 02</span></div>
      <div class="step-content">
        <div class="step-title">Bundle bauen</div>
        <div class="step-body">
          <p>Terminal öffnen, in diesen Ordner navigieren und ausführen:</p>
          <pre>cd orbit-menu-build
npm install
npm run build</pre>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0;">
            <div style="background:#171b24;border:1px solid #3a4358;border-radius:8px;padding:12px;">
              <div style="font-size:10px;font-weight:700;color:#7eb8d4;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px;display:flex;align-items:center;gap:6px;"><i class="fa-brands fa-windows"></i> Windows</div>
              <p style="margin:0 0 6px;font-size:11px;color:#d7d0c3;">Terminal öffnen:</p>
              <p style="margin:0 0 4px;font-size:11px;color:#ece4d4;"><code style="background:#0b0e14;color:#f2c891;padding:2px 5px;border-radius:4px;border:1px solid #2f3a50;">Win + R</code> → <code style="background:#0b0e14;color:#f2c891;padding:2px 5px;border-radius:4px;border:1px solid #2f3a50;">cmd</code> → Enter</p>
              <p style="margin:6px 0 4px;font-size:11px;color:#d7d0c3;">oder: Rechtsklick auf den Ordner → <em>"In Terminal öffnen"</em></p>
              <p style="margin:6px 0 0;font-size:11px;color:#d7d0c3;">Dann die Befehle oben nacheinander eingeben und jeweils Enter drücken.</p>
            </div>
            <div style="background:#171b24;border:1px solid #3a4358;border-radius:8px;padding:12px;">
              <div style="font-size:10px;font-weight:700;color:#74aa9c;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px;display:flex;align-items:center;gap:6px;"><i class="fa-brands fa-apple"></i> Mac</div>
              <p style="margin:0 0 6px;font-size:11px;color:#d7d0c3;">Terminal öffnen:</p>
              <p style="margin:0 0 4px;font-size:11px;color:#ece4d4;"><code style="background:#0b0e14;color:#f2c891;padding:2px 5px;border-radius:4px;border:1px solid #2f3a50;">Cmd + Leertaste</code> → <code style="background:#0b0e14;color:#f2c891;padding:2px 5px;border-radius:4px;border:1px solid #2f3a50;">Terminal</code> → Enter</p>
              <p style="margin:6px 0 4px;font-size:11px;color:#d7d0c3;">oder: Rechtsklick auf den Ordner im Finder → <em>"Neues Terminal beim Ordner"</em></p>
              <p style="margin:6px 0 0;font-size:11px;color:#d7d0c3;">Dann die Befehle oben nacheinander eingeben und jeweils Return drücken.</p>
            </div>
          </div>

          <p style="margin:8px 0 4px;font-size:11px;color:#4d443c;"><i class="fa-solid fa-circle-info" style="margin-right:5px;"></i>Tipp: Wenn du den Ordner im Explorer/Finder geöffnet hast, kannst du den Pfad direkt in die Adresszeile eingeben und Enter drücken — das öffnet das Terminal direkt im richtigen Ordner.</p>
          <p>→ Ergebnis: <code>dist/orbit.iife.js</code></p>
          <p><strong>Wichtig:</strong> Erst nach diesem Schritt <code>index.html</code> öffnen.</p>
          <p>Diese Datei ist dein fertiges OrbitMenu — alles inklusive, keine externen Abhängigkeiten.</p>
        </div>
      </div>
    </div>

    <div class="step">
      <div class="step-num-col"><span class="step-num">Schritt 03</span></div>
      <div class="step-content">
        <div class="step-title">In deine HTML einbinden</div>
        <div class="step-body">
          <p>1. <code>dist/orbit.iife.js</code> in deinen Projektordner kopieren (neben deine <code>index.html</code>)</p>
          <p>2. Diese zwei Zeilen direkt vor <code>&lt;/body&gt;</code> einfügen:</p>
          <pre>&lt;div id="orbit-root"&gt;&lt;/div&gt;
&lt;script src="orbit.iife.js"&gt;&lt;/script&gt;</pre>
          <p>Fertig. Das OrbitMenu erscheint auf deiner Seite.</p>
        </div>
      </div>
    </div>

    <div class="divider">
      <div class="divider-line"></div>
      <span class="divider-label">Anpassen</span>
      <div class="divider-line"></div>
    </div>

    <div class="step">
      <div class="step-num-col"><span class="step-num">Config</span></div>
      <div class="step-content">
        <div class="step-title">Menü anpassen</div>
        <div class="step-body">
          <p>Öffne <code>src/orbit-menu.jsx</code> — alle Einstellungen direkt im <code>config</code>-Objekt:</p>
          <div class="tip">
            <strong>menuItems</strong> — Label, Route/Link, Winkel der Buttons<br>
            <strong>config.colors</strong> — Farben für Button und Menu-Items<br>
            <strong>config.responsive</strong> — Größen für Desktop / Tablet / Mobile<br>
            <strong>config.animation</strong> — Federsteifigkeit und Dämpfung
          </div>
          <p>Nach jeder Änderung: <code>npm run build</code> → neue <code>dist/orbit.iife.js</code> kopieren.</p>
        </div>
      </div>
    </div>

    <div class="step">
      <div class="step-num-col"><span class="step-num">Tipp</span></div>
      <div class="step-content">
        <div class="step-title">Hamburger Menu ersetzen</div>
        <div class="step-body">
          <p>1. Hamburger-Button in der HTML auskommentieren oder entfernen</p>
          <p>2. Dazugehöriges CSS deaktivieren</p>
          <p>3. OrbitMenu Snippet einfügen (Schritt 03)</p>
          <div class="tip">Das OrbitMenu ist <code>position: fixed</code> — es schwebt unabhängig über der Seite. Kein Eingriff ins Layout nötig.</div>
        </div>
      </div>
    </div>

    <div class="step">
      <div class="step-num-col"><span class="step-num">Tipp</span></div>
      <div class="step-content">
        <div class="step-title">Externe Links</div>
        <div class="step-body">
          <p>Mit <code>external: true</code> öffnet ein Menu-Item in einem neuen Tab:</p>
          <pre>{ id: '4', angle: 88, label: 'App',
  route: 'https://deine-seite.de', external: true }</pre>
        </div>
      </div>
    </div>

    <div class="footer">
      <span>ZenOrbit</span>
      <a href="https://zenorbit.denisbitter.de/guide#export-flow" target="_blank">ZenOrbit Guide.de</a>
    </div>

  </div>
  <script>
    (function () {
      var root = document.body;
      var btn = document.getElementById('theme-toggle');
      var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      var stored = localStorage.getItem('zo_readme_theme');
      var theme = stored || (prefersDark ? 'dark' : 'light');
      root.setAttribute('data-theme', theme);
      btn.textContent = theme === 'dark' ? 'Light' : 'Dark';
      btn.addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        localStorage.setItem('zo_readme_theme', next);
        btn.textContent = next === 'dark' ? 'Light' : 'Dark';
      });
    })();
  </script>
</body>
</html>`;

  const readmeTxt = `${textBanner('OrbitMenu — Setup Guide', options)}OrbitMenu — Setup Guide
=======================

Kein Framework. Kein Tailwind. Nur 3 Schritte.
(Tipp: README.html im Browser öffnen — besser lesbar)

SCHRITT 01 — Node.js installieren (einmalig)
--------------------------------------------
Falls noch nicht vorhanden:
https://nodejs.org  (LTS Version)

Danach prüfen: node -v


SCHRITT 02 — Bundle bauen
--------------------------
Terminal öffnen, in diesen Ordner navigieren:

  cd orbit-menu-build
  npm install
  npm run build

→ Ergebnis: dist/orbit.iife.js
  Diese Datei ist dein fertiges OrbitMenu — alles inklusive.


SCHRITT 03 — In deine HTML einbinden
--------------------------------------
1. dist/orbit.iife.js in deinen Projektordner kopieren

2. Diese zwei Zeilen vor </body> einfügen:

  <div id="orbit-root"></div>
  <script src="orbit.iife.js"></script>

Fertig.


ANPASSEN
--------
Öffne src/orbit-menu.jsx:
- menuItems       → Label, Route, Winkel
- config.colors   → Farben
- config.responsive → Größen Desktop/Tablet/Mobile
- config.animation  → Federsteifigkeit und Dämpfung

Nach jeder Änderung: npm run build → neue dist/orbit.iife.js kopieren.


HAMBURGER MENU ERSETZEN
------------------------
1. Hamburger-Button in HTML auskommentieren
2. Dazugehöriges CSS deaktivieren
3. OrbitMenu Snippet einfügen (Schritt 03)

Das OrbitMenu ist position:fixed — schwebt unabhängig über der Seite.


EXTERNE LINKS
-------------
external: true → öffnet in neuem Tab:

  { id: '4', angle: 88, label: 'App', route: 'https://deine-seite.de', external: true }


${includeBranding ? `Generiert mit ${EXPORT_BRAND} · ${EXPORT_BRAND_URL}` : ''}
`;

  return {
    'index.html': indexHtml,
    'README.html': readme,
    'README.txt': readmeTxt,
    'SNIPPET.html': snippet,
    'package.json': packageJson,
    'vite.config.js': viteConfig,
    'src/main.jsx': mainJsx,
    'src/orbit-menu.jsx': componentCode,
  };
};
