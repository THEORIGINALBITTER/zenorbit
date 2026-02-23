import React, { useState, useEffect, useContext } from "react";
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
  const ticking = React.useRef(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Use OrbitMenu configuration
  const { config: defaultConfig } = useOrbitMenuConfig();
  const config = customConfig || defaultConfig;

  const BOTTOM_BUFFER_CLOSED = 170;
  const BOTTOM_BUFFER_OPEN = 300;
  const SMOOTH_SCROLL = true;

  useEffect(() => {
    // Check if tooltip was already shown
    const hasSeenTooltip = localStorage.getItem('menuTooltipShown') === 'true';

    const updatePosition = () => {
      if (!containerRef.current) return;

      const currentScroll = window.scrollY;
      const viewportHeight = window.innerHeight;
      const initialTopOffset = 112;
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

    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(updatePosition);
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasScrolled, isMenuOpen, tooltipDuration]);

  useEffect(() => {
    if (!isMenuOpen) {
      setCurrentMenu("main");
    }
  }, [isMenuOpen]);

  const handleClick = () => {
    setIsMenuOpen((prev) => !prev);
    if (onMenuClick) onMenuClick(!isMenuOpen);
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

  return (
    <>
      <motion.div
        ref={(node) => {
          containerRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className="fixed right-4 z-[100]"
      >
        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{
            opacity: showTooltip ? 1 : 0,
            x: showTooltip ? 0 : 20
          }}
          transition={{ duration: 0.3 }}
          className="absolute right-16 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ display: showTooltip ? 'block' : 'none' }}
        >
          <div
            className=" bg-[#151515] text-xs font-mono px-3 py-2 rounded-lg shadow-lg whitespace-nowrap relative"
            style={{ color: accentColor }}
          >
            {tooltipText}
            <div
              className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-gray-900"
            />
          </div>
        </motion.div>

        {/* Main Button */}
        <motion.div
          className="relative flex items-center justify-center cursor-pointer rounded-full bg-gray-50 border border-gray-200 shadow-lg hover:shadow-gray-500/75"
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}
          whileHover={{ scale: 1.1 }}
          onClick={handleClick}
        >
          <div
            className="flex items-center justify-center rounded-full overflow-hidden"
            style={{ width: `${buttonSize - 8}px`, height: `${buttonSize - 8}px` }}
          >
            {logoSrc && (
              <img
                src={logoSrc}
                alt={logoAlt}
                className="w-15 h-15 rounded-full"
                loading="lazy"
              />
            )}
          </div>
        </motion.div>

        {/* Radial Menu Items */}
        <AnimatePresence>
          {isMenuOpen && (
            <div className="absolute top-0 left-0">
              {currentMenuItems.map((item, index) => {
                const position = getPosition(item.angle);

                return (
                  <motion.button
                    key={`${currentMenu}-${item.label}`}
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
                    onClick={item.onClick}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`absolute rounded-full flex flex-col items-center justify-center cursor-pointer shadow-lg transform ${
                      item.isMainMenu
                        ? "bg-gray-50 border-2"
                        : item.isBack
                        ? "border-2"
                        : item.isActive
                        ? "bg-gray-800 border-2"
                        : "bg-gray-100 border-2"
                    } hover:bg-gray-700 transition-colors`}
                    style={{
                      width: `${buttonSize}px`,
                      height: `${buttonSize}px`,
                      color: accentColor,
                      borderColor: item.isMainMenu || item.isBack || item.isActive ? accentColor : undefined,
                      backgroundColor: item.isBack ? accentColor : undefined
                    }}
                  >
                    <span className="text-[10px] font-mono text-center leading-tight px-1 font-semibold">
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
            className="fixed inset-0 z-[99]"
            style={{
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
