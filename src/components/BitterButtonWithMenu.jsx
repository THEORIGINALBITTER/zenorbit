import React, { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useOrbitMenuConfig } from "../hooks/useOrbitMenuConfig";

/**
 * BitterButtonWithMenu - A radial/orbit menu button component
 *
 * @param {Object} props
 * @param {string} props.logoSrc - URL/path to the logo image
 * @param {string} props.logoAlt - Alt text for logo
 * @param {Array} props.mainMenuItems - Main menu items configuration
 * @param {Object} props.submenuItems - Submenu items configuration (key: submenu id, value: items array)
 * @param {Function} props.onMenuClick - Callback when menu is clicked
 * @param {Function} props.onOverlayOpen - Callback when overlay action is triggered
 * @param {Object} props.config - Optional custom configuration (overrides default)
 * @param {Object} props.nameContext - Optional context for dynamic name replacement
 * @param {string} props.tooltipText - Text to show in tooltip (default: "Menü öffnen")
 * @param {number} props.tooltipDuration - Duration tooltip stays visible in ms (default: 6000)
 * @param {string} props.accentColor - Accent color for highlights (default: "#AC8E66")
 */
const BitterButtonWithMenu = React.forwardRef(({
  logoSrc,
  logoAlt = "Menu Button",
  mainMenuItems = [],
  submenuItems = {},
  onMenuClick,
  onOverlayOpen,
  config: customConfig,
  nameContext,
  tooltipText = "Menü öffnen",
  tooltipDuration = 6000,
  accentColor = "#AC8E66",
}, ref) => {
  const containerRef = React.useRef(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentMenu, setCurrentMenu] = useState("main");
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const ticking = React.useRef(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Use OrbitMenu configuration
  const { config: defaultConfig } = useOrbitMenuConfig();
  const config = customConfig || defaultConfig;

  const BOTTOM_BUFFER_CLOSED = 170;
  const BOTTOM_BUFFER_OPEN = 300;
  const OPEN_TOP_SHIFT_Y = 12;
  const BASE_TOP_OFFSET = 62;
  const SMOOTH_SCROLL = true;

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    // Check if tooltip was already shown
    const hasSeenTooltip = localStorage.getItem('menuTooltipShown') === 'true';

    const updatePosition = () => {
      if (!containerRef.current) return;

      const currentScroll = window.scrollY;
      const viewportHeight = window.innerHeight;
      const initialTopOffset = BASE_TOP_OFFSET + (isMenuOpen ? OPEN_TOP_SHIFT_Y : 0);
      const bottomBuffer = isMenuOpen ? BOTTOM_BUFFER_OPEN : BOTTOM_BUFFER_CLOSED;

      const maxTranslateY = Math.max(0, viewportHeight - initialTopOffset - bottomBuffer);
      const clampedTranslateY = Math.min(Math.max(0, currentScroll), maxTranslateY);

      containerRef.current.style.transform = `translateY(${clampedTranslateY}px)`;
      containerRef.current.style.top = `${initialTopOffset}px`;
      containerRef.current.style.bottom = 'auto';

      // Show tooltip after user scrolls
      if (currentScroll > 100 && !hasScrolled && !hasSeenTooltip && !isMenuOpen) {
        setHasScrolled(true);
        setShowTooltip(true);
        localStorage.setItem('menuTooltipShown', 'true');

        setTimeout(() => {
          setShowTooltip(false);
        }, tooltipDuration);
      }

      ticking.current = false;
    };

    // Set initial position on mount
    updatePosition();

    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(updatePosition);
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasScrolled, isMenuOpen, tooltipDuration]);

  const handleClick = () => {
    const next = !isMenuOpen;
    setIsMenuOpen(next);
    if (!next) setCurrentMenu("main");
    if (onMenuClick) onMenuClick(next);
  };

  // Build menu items with dynamic actions
  const buildMenuItems = (items) => {
    return items.map(item => {
      const isActive = item.route && location.pathname === item.route;

      return {
        ...item,
        isActive,
        label: item.dynamic && item.label.includes('{name}') && nameContext
          ? item.label.replace('{name}', nameContext.name || 'Demo')
          : item.label,
        onClick: () => {
          if (item.action === 'openOverlay') {
            setIsMenuOpen(false);
            if (onOverlayOpen) onOverlayOpen();
          } else if (item.action === 'openSubmenu') {
            setCurrentMenu(item.submenu);
          } else if (item.action === 'closeSubmenu') {
            setCurrentMenu('main');
          } else if (item.route) {
            navigate(item.route);
            setIsMenuOpen(false);
          }

          // Call custom onClick if provided
          if (item.onClick) {
            item.onClick();
          }
        }
      };
    });
  };

  const processedMainMenu = buildMenuItems(mainMenuItems);
  const processedSubmenu = currentMenu !== "main" && submenuItems[currentMenu]
    ? buildMenuItems(submenuItems[currentMenu])
    : [];

  const radius = config.visual.radius;
  const buttonSize = config.visual.button.width;
  const startAngle = config.visual.startAngle || 0;
  const currentMenuItems = currentMenu === "main" ? processedMainMenu : processedSubmenu;

  const getPosition = (angle) => {
    const rad = ((angle + startAngle) - 90) * (Math.PI / 180);
    return {
      x: Math.cos(rad) * radius,
      y: Math.sin(rad) * radius
    };
  };

  const getResolvedAngle = (item, index, total) => {
    if (typeof item.angle === "number") return item.angle;
    if (total <= 1) return -90;
    // Evenly distribute items from top (0) to bottom (-180)
    return 0 - (180 / (total - 1)) * index;
  };

  return (
    <>
      <motion.div
        ref={(node) => {
          containerRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        style={{ position: 'fixed', right: '1rem', zIndex: 100, top: `${BASE_TOP_OFFSET}px` }}
      >
        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: showTooltip ? 1 : 0, x: showTooltip ? 0 : 20 }}
          transition={{ duration: 0.3 }}
          style={{
            display: showTooltip ? 'block' : 'none',
            position: 'absolute',
            right: '4rem',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }}
        >
          <div style={{
            backgroundColor: '#151515',
            color: accentColor,
            fontSize: '12px',
            fontFamily: 'monospace',
            padding: '6px 12px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.3)',
            whiteSpace: 'nowrap',
            position: 'relative',
          }}>
            {tooltipText}
            <div style={{
              position: 'absolute',
              right: '-6px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: 0,
              height: 0,
              borderTop: '6px solid transparent',
              borderBottom: '6px solid transparent',
              borderLeft: '6px solid #151515',
            }} />
          </div>
        </motion.div>

        {/* Main Button */}
        <motion.div
          style={{
            width: `${buttonSize}px`,
            height: `${buttonSize}px`,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            borderRadius: '50%',
            backgroundColor: '#1a1a1a',
            border: '1px solid #AC8E66',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          }}
          whileHover={{ scale: 1.1 }}
          onClick={handleClick}
        >
          <div
            style={{
              width: `${buttonSize - 8}px`,
              height: `${buttonSize - 8}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              overflow: 'hidden',
            }}
          >
            {logoSrc && (
              <img
                src={logoSrc}
                alt={logoAlt}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                loading="lazy"
              />
            )}
          </div>
        </motion.div>

        {/* Radial Menu Items */}
        <AnimatePresence>
          {isMenuOpen && (
            <div style={{ position: 'absolute', top: 0, left: 0 }}>
              {currentMenuItems.map((item, index) => {
                const resolvedAngle = getResolvedAngle(item, index, currentMenuItems.length);
                const position = getPosition(resolvedAngle);
                const bgColor = item.isBack
                  ? accentColor
                  : item.isActive
                  ? '#1a1a1a'
                  : isMobile
                  ? '#1a1a1a'
                  : 'transparent';

                return (
                  <motion.button
                    key={`${currentMenu}-${item.label}`}
                    initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
                    animate={{ scale: 1, x: position.x, y: position.y, opacity: 1 }}
                    exit={{ scale: 0, x: 0, y: 0, opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: config.animation.menuItem.stiffness,
                      damping: config.animation.menuItem.damping,
                      delay: index * config.animation.menuItem.staggerDelay
                    }}
                    onClick={item.onClick}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      position: 'absolute',
                      width: `${buttonSize}px`,
                      height: `${buttonSize}px`,
                      borderRadius: '50%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      border: `2px solid ${item.isMainMenu || item.isBack || item.isActive ? accentColor : '#AC8E66'}`,
                      backgroundColor: bgColor,
                      color: accentColor,
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)',
                      padding: 0,
                    }}
                  >
                    <span style={{
                      fontSize: '10px',
                      fontFamily: 'monospace',
                      textAlign: 'center',
                      lineHeight: 1.25,
                      padding: '0 4px',
                      fontWeight: 600,
                    }}>
                      {item.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Backdrop */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: config.animation.backdrop.duration }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99,
              backgroundColor: config.visual.colors.backdrop,
              backdropFilter: `blur(${config.visual.backdrop.blur})`,
              WebkitBackdropFilter: `blur(${config.visual.backdrop.blur})`
            }}
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
});

BitterButtonWithMenu.displayName = 'BitterButtonWithMenu';

export default BitterButtonWithMenu;
