import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBuilderPalette } from './builderTheme';
import { extractFontStylesheetUrl } from '../../utils/fontUtils';

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
function LivePreview({ config, menuItems, accentColor, logoSrc, logoText = '', logoTextColor = '#ffffff', logoTextFont = '"IBM Plex Mono", monospace', autoOpenSignal = 0, isMobile = false, previewMeta = null }) {
  const palette = useBuilderPalette();
  const styles = createStyles(palette, isMobile);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentMenu, setCurrentMenu] = useState("main");

  const previewScale = isMobile ? 0.68 : 1;
  const radius = Math.round(config.visual.radius * previewScale);
  const buttonSize = Math.round(config.visual.button.width * previewScale);
  const previewOffsetY = isMobile ? 26 : 40;
  const colors = config.visual.colors || {};
  const buttonConfig = config.visual.button || {};
  const menuItemConfig = config.visual.menuItem || {};
  const itemBg = colors.background || '#1b1b1e';
  const itemText = colors.text || accentColor;
  const mainBg = colors.backgroundDark || palette.bgInput;
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
  const labelFontFamily = buttonConfig.fontFamily || menuItemConfig.fontFamily || 'monospace';
  const customFontUrl = extractFontStylesheetUrl(buttonConfig.fontUrl || menuItemConfig.fontUrl || '');
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

  useEffect(() => {
    if (!customFontUrl || typeof document === 'undefined') return undefined;
    const id = `zo-builder-font-${btoa(customFontUrl).replace(/=/g, '')}`;
    let link = document.getElementById(id);
    if (!link) {
      link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = customFontUrl;
      document.head.appendChild(link);
    }
    return undefined;
  }, [customFontUrl]);

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
          {previewMeta && (
            <div style={styles.intentMeta}>
              <div style={styles.intentMetaTop}>
                <span style={styles.intentBadge}>{previewMeta.mode}</span>
                <span style={styles.intentBadgeMuted}>{previewMeta.layout}</span>
              </div>
              <div style={styles.intentScenario}>{previewMeta.scenario}</div>
              <div style={styles.intentReason}>{previewMeta.reason}</div>
            </div>
          )}
        </div>
      </div>

      {/* Menu Overlay Layer (always above backdrop) */}
      <div style={styles.menuOverlayLayer}>
        {/* Menu Preview */}
        <div style={{ ...styles.menuWrapper, transform: `translateY(${previewOffsetY}px)` }}>
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
                ) : logoText ? (
                  <div style={{ fontSize: `${buttonSize / 4}px`, lineHeight: 1, fontFamily: logoTextFont, fontWeight: 600, color: logoTextColor, userSelect: 'none' }}>
                    {logoText}
                  </div>
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

const createStyles = (palette, isMobile = false) => ({
  previewContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: palette.bgPanel,
    borderRadius: '12px',
    overflow: 'hidden',
    border: `1px solid ${palette.border}`,
    boxShadow: palette.shadow,
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
    background: palette.glow,
  },
  sceneGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      `linear-gradient(${palette.gridLine} 1px, transparent 1px), linear-gradient(90deg, ${palette.gridLine} 1px, transparent 1px)`,
    backgroundSize: '26px 26px',
    opacity: 0.55,
  },
  sceneCardLeft: {
    position: 'absolute',
    left: '10%',
    top: '20%',
    width: isMobile ? 90 : 145,
    height: isMobile ? 60 : 95,
    borderRadius: 12,
    border: `1px solid ${palette.border}`,
    background: palette.glass,
  },
  sceneCardRight: {
    position: 'absolute',
    right: '12%',
    bottom: '21%',
    width: isMobile ? 105 : 170,
    height: isMobile ? 68 : 110,
    borderRadius: 14,
    border: `1px solid ${palette.border}`,
    background: palette.glassStrong,
  },
  sceneLineTop: {
    position: 'absolute',
    left: '8%',
    right: '8%',
    top: '13%',
    borderTop: `1px solid ${palette.border}`,
    opacity: 0.85,
  },
  previewContent: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: isMobile ? '0.75rem 0.75rem 1rem' : '1.5rem 1.5rem 1.75rem',
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
    marginBottom: 'auto',
    paddingRight: isMobile ? '4.75rem' : '5.5rem',
  },
  infoTitle: {
    fontSize: isMobile ? fs(13) : fs(18),
    fontWeight: '600',
    color: palette.text,
    marginBottom: '0.25rem',
  },
  infoDescription: {
    fontSize: isMobile ? fs(11) : fs(14),
    color: palette.textDim,
    fontWeight: '500',
  },
  intentMeta: {
    marginTop: 10,
    display: 'grid',
    gap: 6,
    maxWidth: isMobile ? 220 : 300,
  },
  intentMetaTop: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
  },
  intentBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 8px',
    borderRadius: 999,
    border: `1px solid ${palette.borderStrong}`,
    backgroundColor: palette.goldSoft,
    color: palette.gold,
    fontSize: fs(9),
    fontFamily: '"IBM Plex Mono", monospace',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  intentBadgeMuted: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 8px',
    borderRadius: 999,
    border: `1px solid ${palette.border}`,
    backgroundColor: palette.bgInput,
    color: palette.textDim,
    fontSize: fs(9),
    fontFamily: '"IBM Plex Mono", monospace',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  intentScenario: {
    fontSize: isMobile ? fs(11) : fs(12),
    fontWeight: 700,
    color: palette.text,
  },
  intentReason: {
    fontSize: isMobile ? fs(10) : fs(11),
    lineHeight: 1.5,
    color: palette.textSub,
  },
  menuWrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: isMobile ? '2.5rem' : '3rem',
    paddingBottom: isMobile ? '2.75rem' : '3.25rem',
    boxSizing: 'border-box',
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
    backgroundColor: palette.bgInput,
    border: `1px solid ${palette.borderStrong}`,
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
    color: palette.textDim,
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
    backgroundColor: palette.bgCard,
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
});

export default LivePreview;
