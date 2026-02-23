import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Live Preview Component
 * Shows real-time preview of the radial menu as user customizes it
 */
function LivePreview({ config, menuItems, accentColor, logoSrc }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentMenu, setCurrentMenu] = useState("main");

  const radius = config.visual.radius;
  const buttonSize = config.visual.button.width;

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

  return (
    <div style={styles.previewContainer}>
      <div style={styles.previewContent}>
        {/* Info Text */}
        <div style={styles.infoText}>
          <h3 style={styles.infoTitle}>Live Preview</h3>
          <p style={styles.infoDescription}>
            Click the button to test your menu
          </p>
        </div>

        {/* Menu Preview */}
        <div style={styles.menuWrapper}>
          <motion.div style={styles.menuContainer}>
            {/* Main Button */}
            <motion.div
              style={{
                ...styles.mainButton,
                width: `${buttonSize}px`,
                height: `${buttonSize}px`,
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
                          color: accentColor,
                          borderColor: accentColor,
                        }}
                      >
                        <span style={styles.menuItemLabel}>
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
              backgroundColor: config.visual.colors.backdrop,
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
    height: '600px',
    backgroundColor: '#f3f4f6',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  previewContent: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  infoText: {
    textAlign: 'center',
    marginBottom: '3rem',
  },
  infoTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '0.5rem',
  },
  infoDescription: {
    fontSize: '14px',
    color: '#6b7280',
  },
  menuWrapper: {
    position: 'relative',
    width: '100%',
    height: '400px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContainer: {
    position: 'relative',
    zIndex: 10,
  },
  mainButton: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    borderRadius: '50%',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
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
    color: '#9ca3af',
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
    backgroundColor: '#f3f4f6',
    border: '2px solid',
    transition: 'background-color 0.2s ease',
  },
  menuItemLabel: {
    fontSize: '10px',
    fontFamily: 'monospace',
    textAlign: 'center',
    lineHeight: '1.2',
    padding: '0 4px',
    fontWeight: '600',
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
    zIndex: 5,
  },
};

export default LivePreview;
