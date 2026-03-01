import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { zenPalette } from '../../styles/zenPalette';

const TYPO_SCALE = 0.8;
const fs = (px) => `${Math.round(px * TYPO_SCALE * 10) / 10}px`;
const scalePxValue = (value) => {
  if (typeof value === 'number') return fs(value);
  if (typeof value !== 'string') return value;
  if (!value.endsWith('px')) return value;
  const numeric = parseFloat(value);
  if (Number.isNaN(numeric)) return value;
  return fs(numeric);
};

/**
 * Live Preview Component
 * Shows real-time preview of the radial menu as user customizes it
 */
function LivePreview({ config, menuItems, accentColor, logoSrc, autoOpenSignal = 0 }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentMenu, setCurrentMenu] = useState("main");

  const radius = config.visual.radius;
  const buttonSize = config.visual.button.width;
  const colors = config.visual.colors || {};
  const buttonConfig = config.visual.button || {};
  const menuItemConfig = config.visual.menuItem || {};
  const itemBg = colors.background || '#1b1b1e';
  const itemText = colors.text || accentColor;
  const mainBg = colors.backgroundDark || '#141417';
  const mainBorder = colors.borderHighlight || accentColor;
  const normalizedBackdrop = String(colors.backdrop || '').replace(/\s+/g, '');
  const backdropColor = normalizedBackdrop === 'rgba(0,0,0,0)'
    ? 'rgba(8, 10, 14, 0.3)'
    : (colors.backdrop || 'rgba(8, 10, 14, 0.3)');
  const mainBorderRadius = buttonConfig.borderRadius || '50%';
  const menuItemBorderRadius = menuItemConfig.borderRadius || '50%';
  const menuItemBorderWidth = menuItemConfig.borderWidth ?? 2;
  const labelFontSize = buttonConfig.fontSize || '10px';
  const scaledLabelFontSize = scalePxValue(labelFontSize);
  const labelFontFamily = buttonConfig.fontFamily || 'monospace';
  const labelFontWeight = menuItemConfig.fontWeight ?? 600;
  const labelLetterSpacing = menuItemConfig.letterSpacing || '0px';
  const labelTextTransform = menuItemConfig.textTransform || 'none';

  const getPosition = (angle) => {
    const rad = (angle - 90) * (Math.PI / 180);
    return {
      x: Math.cos(rad) * radius,
      y: Math.sin(rad) * radius
    };
  };

  const handleItemClick = (item) => {
    console.log('Menu item clicked:', item);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    if (!autoOpenSignal) return;
    setIsMenuOpen(true);
  }, [autoOpenSignal]);

  return (
    <div style={styles.previewContainer}>
      <div style={styles.previewScene}>
        <div style={styles.sceneGlow} />
        <div style={styles.sceneGrid} />
        <div style={styles.sceneCardLeft} />
        <div style={styles.sceneCardRight} />
        <div style={styles.sceneLineTop} />
      </div>

      <div style={styles.previewContent}>
        {/* Info Text */}
        <div style={styles.infoText}>
          <h3 style={styles.infoTitle}>Live Preview</h3>
          <p style={styles.infoDescription}>
            Click the button to test your menu
          </p>
        </div>
      </div>

      {/* Menu Overlay Layer (always above backdrop) */}
      <div style={styles.menuOverlayLayer}>
        {/* Menu Preview */}
        <div style={styles.menuWrapper}>
          <motion.div style={styles.menuContainer}>
            {/* Main Button */}
            <motion.div
              style={{
                ...styles.mainButton,
                width: `${buttonSize}px`,
                height: `${buttonSize}px`,
                backgroundColor: mainBg,
                borderColor: mainBorder,
                borderRadius: mainBorderRadius,
              }}
              whileHover={{ scale: 1.1 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div
                style={{
                  ...styles.mainButtonInner,
                  width: `${buttonSize - 8}px`,
                  height: `${buttonSize - 8}px`,
                }}
              >
                {logoSrc ? (
                  <img
                    src={logoSrc}
                    alt="Menu"
                    style={styles.logo}
                  />
                ) : (
                  <div style={{ ...styles.logoPlaceholder, fontSize: `${buttonSize / 4}px` }}>
                    Logo
                  </div>
                )}
              </div>
            </motion.div>

            {/* Radial Menu Items */}
            <AnimatePresence>
              {isMenuOpen && (
                <div style={styles.menuItems}>
                  {menuItems.map((item, index) => {
                    const position = getPosition(item.angle);

                    return (
                      <motion.button
                        key={`${currentMenu}-${item.id}`}
                        initial={{
                          scale: 0,
                          x: 0,
                          y: 0,
                          opacity: 0
                        }}
                        animate={{
                          scale: 1,
                          x: position.x,
                          y: position.y,
                          opacity: 1
                        }}
                        exit={{
                          scale: 0,
                          x: 0,
                          y: 0,
                          opacity: 0
                        }}
                        transition={{
                          type: "spring",
                          stiffness: config.animation.menuItem.stiffness,
                          damping: config.animation.menuItem.damping,
                          delay: index * config.animation.menuItem.staggerDelay
                        }}
                        onClick={() => handleItemClick(item)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          ...styles.menuItem,
                          width: `${buttonSize}px`,
                          height: `${buttonSize}px`,
                          color: itemText,
                          borderColor: accentColor,
                          backgroundColor: itemBg,
                          borderRadius: menuItemBorderRadius,
                          borderWidth: menuItemBorderWidth,
                        }}
                      >
                        <span
                          style={{
                            ...styles.menuItemLabel,
                            fontSize: scaledLabelFontSize,
                            fontFamily: labelFontFamily,
                            fontWeight: labelFontWeight,
                            letterSpacing: labelLetterSpacing,
                            textTransform: labelTextTransform,
                          }}
                        >
                          {item.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Backdrop */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: config.animation.backdrop.duration }}
            style={{
              ...styles.backdrop,
              backgroundColor: backdropColor,
              backdropFilter: `blur(${config.visual.backdrop.blur})`,
              WebkitBackdropFilter: `blur(${config.visual.backdrop.blur})`,
            }}
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  previewContainer: {
    position: 'relative',
    width: '100%',
    height: '540px',
    backgroundColor: zenPalette.panel,
    borderRadius: '12px',
    overflow: 'hidden',
    border: `1px solid ${zenPalette.border}`,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
  },
  previewScene: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  sceneGlow: {
    position: 'absolute',
    width: 380,
    height: 380,
    borderRadius: '50%',
    left: '50%',
    top: '54%',
    transform: 'translate(-50%, -50%)',
    background: 'radial-gradient(circle, rgba(172, 142, 102, 0.2) 0%, rgba(172, 142, 102, 0.04) 45%, transparent 75%)',
  },
  sceneGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
    backgroundSize: '26px 26px',
    opacity: 0.55,
  },
  sceneCardLeft: {
    position: 'absolute',
    left: '10%',
    top: '20%',
    width: 145,
    height: 95,
    borderRadius: 12,
    border: `1px solid ${zenPalette.border}`,
    background: 'rgba(255,255,255,0.03)',
  },
  sceneCardRight: {
    position: 'absolute',
    right: '12%',
    bottom: '21%',
    width: 170,
    height: 110,
    borderRadius: 14,
    border: `1px solid ${zenPalette.border}`,
    background: 'rgba(255,255,255,0.035)',
  },
  sceneLineTop: {
    position: 'absolute',
    left: '8%',
    right: '8%',
    top: '13%',
    borderTop: `1px solid ${zenPalette.border}`,
    opacity: 0.85,
  },
  previewContent: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: '1.5rem',
    zIndex: 6,
  },
  menuOverlayLayer: {
    position: 'absolute',
    inset: 0,
    zIndex: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    textAlign: 'left',
    width: '100%',
    marginBottom: 0,
  },
  infoTitle: {
    fontSize: fs(18),
    fontWeight: '600',
    color: zenPalette.text,
    marginBottom: '0.4rem',
  },
  infoDescription: {
    fontSize: fs(14),
    color: zenPalette.textMuted,
    fontWeight: '500',
  },
  menuWrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContainer: {
    position: 'relative',
    zIndex: 20,
  },
  mainButton: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    borderRadius: '50%',
    backgroundColor: '#141417',
    border: `1px solid ${zenPalette.borderStrong}`,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  mainButtonInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  logoPlaceholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: zenPalette.textMuted,
    fontFamily: 'monospace',
  },
  menuItems: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  menuItem: {
    position: 'absolute',
    borderRadius: '50%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#1b1b1e',
    borderStyle: 'solid',
    borderWidth: 2,
    transition: 'background-color 0.2s ease',
  },
  menuItemLabel: {
    fontSize: fs(10),
    fontFamily: 'monospace',
    textAlign: 'center',
    lineHeight: '1.2',
    padding: '0 4px',
    fontWeight: '600',
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
    zIndex: 10,
  },
};

export default LivePreview;
