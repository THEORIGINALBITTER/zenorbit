import React, { useState, useEffect, useCallback } from 'react';
import { useOrbitMenuConfig } from '../hooks/useOrbitMenuConfig';
import { useColorPicker } from '../hooks/useColorPicker';
import BitterButtonWithMenu from '../components/BitterButtonWithMenu';
import { generateStandaloneComponent, generateInstallationGuide, generateCSS } from '../utils/codeGenerator';

const logoBackPath = '/images/logo.png';

const OrbitCustomizer = () => {
  const { config, updateConfig } = useOrbitMenuConfig();
  const [showPreview, setShowPreview] = useState(true);

  const [radius, setRadius] = useState(config.visual.radius);
  const [menuOffset, setMenuOffset] = useState(config.visual.menuOffset);
  const [buttonSize, setButtonSize] = useState(config.visual.button.width);
  const [logoStiffness, setLogoStiffness] = useState(config.animation.logo.stiffness);
  const [logoDamping, setLogoDamping] = useState(config.animation.logo.damping);
  const [startAngle, setStartAngle] = useState(0);
  const [showMenuItems, setShowMenuItems] = useState(false);
  const [animatePreview, setAnimatePreview] = useState(false);
  const [logoRotation, setLogoRotation] = useState(0);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('visual'); // 'visual', 'animation', 'items'
  const [logoText, setLogoText] = useState('B');
  const [logoImage, setLogoImage] = useState(null); // Base64 image data
  const [logoType, setLogoType] = useState('text'); // 'text' or 'image'
  const [menuItemFontSize, setMenuItemFontSize] = useState(10);

  // Color state variables - Initialize from config if available
  const [buttonBgColor, setButtonBgColorState] = useState(config.visual.colors?.buttonBg || '#f97316');
  const [buttonOutlineColor, setButtonOutlineColorState] = useState(config.visual.colors?.buttonOutline || '#f97316');
  const [menuItemBgColor, setMenuItemBgColorState] = useState(config.visual.colors?.menuItemBg || '#1f2937');
  const [menuItemOutlineColor, setMenuItemOutlineColorState] = useState(config.visual.colors?.menuItemOutline || '#f97316');
  const [menuItemTextColor, setMenuItemTextColorState] = useState(config.visual.colors?.menuItemText || '#fef3c7');

  const [buttonOutlineWidth, setButtonOutlineWidth] = useState(config.visual.colors?.buttonOutlineWidth || 0);
  const [menuItemOutlineWidth, setMenuItemOutlineWidth] = useState(config.visual.colors?.menuItemOutlineWidth || 1);

  // Stable callback functions for color pickers
  const setButtonBgColor = useCallback((color) => setButtonBgColorState(color), []);
  const setButtonOutlineColor = useCallback((color) => setButtonOutlineColorState(color), []);
  const setMenuItemBgColor = useCallback((color) => setMenuItemBgColorState(color), []);
  const setMenuItemOutlineColor = useCallback((color) => setMenuItemOutlineColorState(color), []);
  const setMenuItemTextColor = useCallback((color) => setMenuItemTextColorState(color), []);

  // Color pickers with ColorWheel hooks
  const buttonBgPicker = useColorPicker(buttonBgColor, setButtonBgColor);
  const buttonOutlinePicker = useColorPicker(buttonOutlineColor, setButtonOutlineColor);
  const menuItemBgPicker = useColorPicker(menuItemBgColor, setMenuItemBgColor);
  const menuItemOutlinePicker = useColorPicker(menuItemOutlineColor, setMenuItemOutlineColor);
  const menuItemTextPicker = useColorPicker(menuItemTextColor, setMenuItemTextColor);

  // Menu items state (editable)
  const [menuItems, setMenuItems] = useState([
    { id: 1, angle: 0, label: 'Menü', action: 'openOverlay' },
    { id: 2, angle: -45, label: 'ZenLab', action: 'route', route: '/zenlab2' },
    { id: 3, angle: -90, label: 'Sag Hallo', action: 'route', route: '/contact' },
    { id: 4, angle: -135, label: 'Einfach Ich', action: 'submenu', submenu: 'about' },
    { id: 5, angle: -180, label: 'Moin', action: 'route', route: '/' }
  ]);

  // Submenus state
  const [submenus, setSubmenus] = useState({
    about: [
      { id: 'ab1', angle: -60, label: 'Ich', action: 'route', route: '/about#overview' },
      { id: 'ab2', angle: -120, label: 'Referenz', action: 'route', route: '/about#referenzen' },
      { id: 'ab3', angle: -180, label: 'Kompass', action: 'route', route: '/about#kompass' }
    ]
  });

  // Currently editing submenu
  const [editingSubmenu, setEditingSubmenu] = useState(null);

  // Overlay menu items state
  const [overlayItems, setOverlayItems] = useState([
    { id: 'ov1', label: 'Home', route: '/' },
    { id: 'ov2', label: 'About', route: '/about' },
    { id: 'ov3', label: 'Courses', route: '/courses' },
    { id: 'ov4', label: 'Contact', route: '/contact' },
  ]);

  // Editing overlay flag
  const [editingOverlay, setEditingOverlay] = useState(false);

  // Available routes for quick selection
  const availableRoutes = [
    { value: '/', label: 'Home' },
    { value: '/about', label: 'About' },
    { value: '/contact', label: 'Contact' },
    { value: '/zenlab2', label: 'ZenLab' },
    { value: '/courses', label: 'Courses' },
    { value: '/dashboard', label: 'Dashboard' },
    { value: '/userdashboard', label: 'User Dashboard' },
    { value: '/blog', label: 'Blog' },
    { value: '/projects', label: 'Projects' },
    { value: '/kompass', label: 'Kompass' },
    { value: 'custom', label: 'Custom Route...' }
  ];

  // Apply changes to config
  useEffect(() => {
    updateConfig('visual.radius', radius);
  }, [radius, updateConfig]);

  useEffect(() => {
    updateConfig('visual.menuOffset', menuOffset);
  }, [menuOffset, updateConfig]);

  useEffect(() => {
    updateConfig('visual.button.width', buttonSize);
    updateConfig('visual.button.height', buttonSize);
  }, [buttonSize, updateConfig]);

  useEffect(() => {
    updateConfig('animation.logo.stiffness', logoStiffness);
  }, [logoStiffness, updateConfig]);

  useEffect(() => {
    updateConfig('animation.logo.damping', logoDamping);
  }, [logoDamping, updateConfig]);

  useEffect(() => {
    updateConfig('visual.startAngle', startAngle);
  }, [startAngle, updateConfig]);

  // Update colors in config
  useEffect(() => {
    updateConfig('visual.colors.buttonBg', buttonBgColor);
  }, [buttonBgColor, updateConfig]);

  useEffect(() => {
    updateConfig('visual.colors.buttonOutline', buttonOutlineColor);
  }, [buttonOutlineColor, updateConfig]);

  useEffect(() => {
    updateConfig('visual.colors.buttonOutlineWidth', buttonOutlineWidth);
  }, [buttonOutlineWidth, updateConfig]);

  useEffect(() => {
    updateConfig('visual.colors.menuItemBg', menuItemBgColor);
  }, [menuItemBgColor, updateConfig]);

  useEffect(() => {
    updateConfig('visual.colors.menuItemOutline', menuItemOutlineColor);
  }, [menuItemOutlineColor, updateConfig]);

  useEffect(() => {
    updateConfig('visual.colors.menuItemOutlineWidth', menuItemOutlineWidth);
  }, [menuItemOutlineWidth, updateConfig]);

  useEffect(() => {
    updateConfig('visual.colors.menuItemText', menuItemTextColor);
  }, [menuItemTextColor, updateConfig]);

  useEffect(() => {
    updateConfig('visual.button.fontSize', `${menuItemFontSize}px`);
  }, [menuItemFontSize, updateConfig]);

  // Update logo settings
  useEffect(() => {
    updateConfig('visual.logo.type', logoType);
  }, [logoType, updateConfig]);

  useEffect(() => {
    updateConfig('visual.logo.text', logoText);
  }, [logoText, updateConfig]);

  useEffect(() => {
    updateConfig('visual.logo.image', logoImage);
  }, [logoImage, updateConfig]);

  // Animation state for expanding/contracting
  const [animationProgress, setAnimationProgress] = useState(0);
  const [animationPhase, setAnimationPhase] = useState('closed'); // 'closed', 'opening', 'open', 'closing'

  // Single-cycle animation: open -> pause -> close
  useEffect(() => {
    if (!animatePreview) {
      setLogoRotation(0);
      setAnimationProgress(0);
      setAnimationPhase('closed');
      return;
    }

    let startTime = Date.now();
    const openDuration = 800;   // 0.8s to open
    const pauseDuration = 1500; // 1.5s pause
    const closeDuration = 800;  // 0.8s to close
    const totalDuration = openDuration + pauseDuration + closeDuration;

    const animate = () => {
      const elapsed = Date.now() - startTime;

      if (elapsed < openDuration) {
        // Opening phase
        const progress = elapsed / openDuration;
        setAnimationPhase('opening');
        setLogoRotation(progress * 180);
        setAnimationProgress(progress);
      } else if (elapsed < openDuration + pauseDuration) {
        // Open and paused
        setAnimationPhase('open');
        setLogoRotation(180);
        setAnimationProgress(1);
      } else if (elapsed < totalDuration) {
        // Closing phase
        const closeElapsed = elapsed - openDuration - pauseDuration;
        const progress = 1 - (closeElapsed / closeDuration);
        setAnimationPhase('closing');
        setLogoRotation(progress * 180);
        setAnimationProgress(progress);
      } else {
        // Animation complete
        setLogoRotation(0);
        setAnimationProgress(0);
        setAnimationPhase('closed');
        setAnimatePreview(false);
        return;
      }

      requestAnimationFrame(animate);
    };

    const animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [animatePreview]);

  // Handle logo image upload
  const handleLogoImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoImage(event.target.result);
        setLogoType('image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExport = () => {
    const config = {
      radius,
      menuOffset,
      buttonSize,
      logoStiffness,
      logoDamping,
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
      menuItemTextColor
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orbit-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyToConfig = () => {
    // Changes are already applied live via useOrbitMenuConfig hook!
    // Just show confirmation
    const Toast = document.createElement('div');
    Toast.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #000;
      color: #fff;
      padding: 20px 40px;
      border: 2px solid #f97316;
      font-family: monospace;
      font-size: 14px;
      letter-spacing: 1px;
      z-index: 100000;
      text-align: center;
    `;
    Toast.textContent = 'CONFIG APPLIED ✓\nChanges are live on all menus!';
    Toast.style.whiteSpace = 'pre-line';
    document.body.appendChild(Toast);

    setTimeout(() => {
      Toast.style.opacity = '0';
      Toast.style.transition = 'opacity 0.3s';
      setTimeout(() => document.body.removeChild(Toast), 300);
    }, 2000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000',
      color: '#fff',
      fontFamily: 'monospace',
      display: 'flex',
      gap: '2em',
      padding: '2em',
      alignItems: 'flex-start'
    }}>
      {/* Preview Panel - Fixed/Sticky */}
      {showPreview && (
        <div style={{
          flex: '1 1 50%',
          backgroundColor: '#111',
          border: '1px solid #333',
          position: 'sticky',
          top: '2em',
          height: 'calc(100vh - 4em)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            position: 'absolute',
            top: '1em',
            left: '1em',
            fontSize: '11px',
            letterSpacing: '1px',
            color: '#666',
            zIndex: 10
          }}>
            PREVIEW
          </div>

          {/* Center Button - interactive */}
          <div
            onClick={() => {
              if (!animatePreview) {
                setIsManualOpen(!isManualOpen);
                setShowMenuItems(!showMenuItems);
              }
            }}
            style={{
              position: 'relative',
              width: `${buttonSize}px`,
              height: `${buttonSize}px`,
              backgroundColor: buttonBgColor,
              border: buttonOutlineWidth > 0 ? `${buttonOutlineWidth}px solid ${buttonOutlineColor}` : 'none',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#fff',
              cursor: animatePreview ? 'not-allowed' : 'pointer',
              zIndex: 10,
              transform: `translateY(${menuOffset}px) rotate(${animatePreview ? logoRotation : (isManualOpen ? 180 : 0)}deg)`,
              transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              userSelect: 'none',
              overflow: 'hidden'
            }}
          >
            {logoType === 'image' ? (
              <img
                src={logoImage || logoBackPath}
                alt="Logo"
                style={{
                  width: '70%',
                  height: '70%',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <span style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: buttonBgColor === '#ffffff' || buttonBgColor === '#fff' ? '#000' : '#fff'
              }}>
                {logoText}
              </span>
            )}
          </div>

          {/* Show radius circle - also offset */}
          <div style={{
            position: 'absolute',
            width: `${radius * 2}px`,
            height: `${radius * 2}px`,
            border: '1px dashed #666',
            borderRadius: '50%',
            pointerEvents: 'none',
            transform: `translateY(${menuOffset}px)`
          }} />

          {/* Menu Items - animated expansion from center */}
          {menuItems.map((item, index) => {
            const angleRad = ((item.angle + startAngle) * Math.PI) / 180;

            // Calculate target position
            const targetRadius = showMenuItems ? radius : 0;
            const x = Math.cos(angleRad) * targetRadius;
            const y = Math.sin(angleRad) * targetRadius;

            // Visual states
            const opacity = showMenuItems ? 1 : 0;
            const scale = showMenuItems ? 1 : 0.3;

            return (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: `calc(50% + ${menuOffset}px)`,
                  transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`,
                  width: `${buttonSize}px`,
                  height: `${buttonSize}px`,
                  backgroundColor: menuItemBgColor,
                  border: `${menuItemOutlineWidth}px solid ${menuItemOutlineColor}`,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: `${menuItemFontSize}px`,
                  color: menuItemTextColor,
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                  textAlign: 'center',
                  padding: '4px',
                  opacity: opacity,
                  transition: `transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.05}s,
                     opacity 0.4s ease ${index * 0.05}s`,
                  pointerEvents: opacity > 0.5 ? 'auto' : 'none'
                }}
              >
                {item.label}
              </div>
            );
          })}

          {/* Info */}
          <div style={{
            position: 'absolute',
            bottom: '1em',
            left: '1em',
            right: '1em',
            fontSize: '10px',
            color: '#666',
            lineHeight: '1.6',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '8px' }}>
              <button
                onClick={() => {
                  setIsManualOpen(!isManualOpen);
                  setShowMenuItems(!showMenuItems);
                }}
                disabled={animatePreview}
                style={{
                  padding: '8px 12px',
                  backgroundColor: isManualOpen ? '#f97316' : '#000',
                  color: '#fff',
                  border: '1px solid #f97316',
                  cursor: animatePreview ? 'not-allowed' : 'pointer',
                  fontSize: '10px',
                  letterSpacing: '1px',
                  fontFamily: 'monospace',
                  opacity: animatePreview ? 0.3 : 1
                }}
              >
                {isManualOpen ? 'CLOSE' : 'OPEN'}
              </button>
              <button
                onClick={() => {
                  setIsManualOpen(false);
                  setShowMenuItems(false);
                  setAnimatePreview(true);
                }}
                disabled={animatePreview}
                style={{
                  padding: '8px 12px',
                  backgroundColor: animatePreview ? '#666' : '#000',
                  color: '#fff',
                  border: '1px solid #f97316',
                  cursor: animatePreview ? 'not-allowed' : 'pointer',
                  fontSize: '10px',
                  letterSpacing: '1px',
                  fontFamily: 'monospace',
                  opacity: animatePreview ? 0.5 : 1
                }}
              >
                {animatePreview ? animationPhase.toUpperCase() : 'AUTO DEMO'}
              </button>
            </div>
            Button: {buttonSize}px | Radius: {radius}px | Offset: {menuOffset}px
          </div>
        </div>
      )}

      {/* Controls Panel */}
      <div style={{
        flex: showPreview ? '0 0 400px' : '1',
        maxWidth: showPreview ? '400px' : 'none',
        minWidth: '400px'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '3em'
        }}>
          <h1 style={{
            fontSize: '14px',
            letterSpacing: '2px',
            fontWeight: 'normal',
            margin: 0
          }}>
            ORBIT MENU CONFIG
          </h1>
          <button
            onClick={() => setShowPreview(!showPreview)}
            style={{
              padding: '8px 12px',
              backgroundColor: '#000',
              color: '#fff',
              border: '1px solid #333',
              cursor: 'pointer',
              fontSize: '10px',
              letterSpacing: '1px',
              fontFamily: 'monospace'
            }}
          >
            {showPreview ? 'HIDE' : 'SHOW'} PREVIEW
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '1em',
          marginBottom: '3em',
          borderBottom: '1px solid #333',
          paddingBottom: '1em'
        }}>
          {['visual', 'colors', 'animation', 'items', 'export'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === tab ? '#fff' : '#666',
                fontSize: '11px',
                letterSpacing: '1px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                fontFamily: 'monospace',
                borderBottom: activeTab === tab ? '2px solid #fff' : '2px solid transparent',
                paddingBottom: '4px'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Visual Section */}
        {activeTab === 'visual' && (
        <section style={{ marginBottom: '3em' }}>
          <h2 style={{
            fontSize: '11px',
            letterSpacing: '1px',
            color: '#666',
            marginBottom: '1.5em'
          }}>
            VISUAL
          </h2>

          <Slider
            label="Radius"
            value={radius}
            min={50}
            max={250}
            onChange={setRadius}
          />

          <Slider
            label="Menu Offset"
            value={menuOffset}
            min={0}
            max={300}
            onChange={setMenuOffset}
          />

          <Slider
            label="Button Size"
            value={buttonSize}
            min={48}
            max={96}
            onChange={setButtonSize}
          />

          <Slider
            label="Start Angle"
            value={startAngle}
            min={-180}
            max={180}
            onChange={setStartAngle}
          />

          {/* Logo Type Selector */}
          <div style={{ marginBottom: '2em', paddingBottom: '2em', borderBottom: '1px solid #333' }}>
            <div style={{
              fontSize: '11px',
              marginBottom: '12px',
              color: '#999',
              letterSpacing: '1px'
            }}>
              LOGO TYPE
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '1em' }}>
              <button
                onClick={() => setLogoType('text')}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: logoType === 'text' ? '#f97316' : '#000',
                  color: '#fff',
                  border: `1px solid ${logoType === 'text' ? '#f97316' : '#333'}`,
                  cursor: 'pointer',
                  fontSize: '10px',
                  letterSpacing: '1px',
                  fontFamily: 'monospace'
                }}
              >
                TEXT
              </button>
              <button
                onClick={() => setLogoType('image')}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: logoType === 'image' ? '#f97316' : '#000',
                  color: '#fff',
                  border: `1px solid ${logoType === 'image' ? '#f97316' : '#333'}`,
                  cursor: 'pointer',
                  fontSize: '10px',
                  letterSpacing: '1px',
                  fontFamily: 'monospace'
                }}
              >
                IMAGE
              </button>
            </div>

            {/* Text Input - only show if logoType is 'text' */}
            {logoType === 'text' && (
              <div>
                <div style={{
                  fontSize: '11px',
                  marginBottom: '8px'
                }}>
                  Logo Text
                </div>
                <input
                  type="text"
                  value={logoText}
                  onChange={(e) => setLogoText(e.target.value)}
                  maxLength={3}
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: '#000',
                    border: '1px solid #333',
                    color: '#fff',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}
                  placeholder="B"
                />
                <div style={{ fontSize: '9px', color: '#666', marginTop: '4px' }}>
                  Max 3 Zeichen für optimale Darstellung
                </div>
              </div>
            )}

            {/* Image Upload - only show if logoType is 'image' */}
            {logoType === 'image' && (
              <div>
                <div style={{
                  fontSize: '11px',
                  marginBottom: '8px'
                }}>
                  Logo Image
                </div>

                {/* Preview of uploaded image */}
                {logoImage && (
                  <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: buttonBgColor,
                    border: '1px solid #333',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px',
                    overflow: 'hidden'
                  }}>
                    <img
                      src={logoImage}
                      alt="Logo preview"
                      style={{
                        width: '70%',
                        height: '70%',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoImageUpload}
                  style={{ display: 'none' }}
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#000',
                    color: '#fff',
                    border: '1px solid #333',
                    cursor: 'pointer',
                    fontSize: '10px',
                    letterSpacing: '1px',
                    fontFamily: 'monospace',
                    textAlign: 'center'
                  }}
                >
                  {logoImage ? 'CHANGE IMAGE' : 'UPLOAD IMAGE'}
                </label>

                {logoImage && (
                  <button
                    onClick={() => {
                      setLogoImage(null);
                      setLogoType('text');
                    }}
                    style={{
                      width: '100%',
                      marginTop: '8px',
                      padding: '8px',
                      backgroundColor: '#000',
                      color: '#666',
                      border: '1px solid #333',
                      cursor: 'pointer',
                      fontSize: '9px',
                      letterSpacing: '1px',
                      fontFamily: 'monospace'
                    }}
                  >
                    REMOVE IMAGE
                  </button>
                )}

                <div style={{ fontSize: '9px', color: '#666', marginTop: '8px', lineHeight: '1.4' }}>
                  Empfohlen: PNG/SVG mit transparentem Hintergrund<br/>
                  Optimale Größe: 200x200px
                </div>
              </div>
            )}
          </div>

          <Slider
            label="Menu Text Size"
            value={menuItemFontSize}
            min={8}
            max={14}
            onChange={setMenuItemFontSize}
          />
        </section>
        )}

        {/* Colors Section */}
        {activeTab === 'colors' && (
        <section style={{ marginBottom: '3em' }}>
          <h2 style={{
            fontSize: '11px',
            letterSpacing: '1px',
            color: '#666',
            marginBottom: '1.5em'
          }}>
            COLORS
          </h2>

          {/* Button Colors */}
          <div style={{ marginBottom: '3em', paddingBottom: '2em', borderBottom: '1px solid #333' }}>
            <h3 style={{ fontSize: '10px', color: '#999', marginBottom: '1em', letterSpacing: '1px' }}>
              CENTER BUTTON
            </h3>

            <div style={{ marginBottom: '2em' }}>
              <div style={{ fontSize: '11px', marginBottom: '8px', color: '#999' }}>
                Background Color
              </div>
              <buttonBgPicker.ColorWheel size={200} />
            </div>

            <div style={{ marginBottom: '2em' }}>
              <div style={{ fontSize: '11px', marginBottom: '8px', color: '#999' }}>
                Outline Color
              </div>
              <buttonOutlinePicker.ColorWheel size={200} />
            </div>

            <Slider
              label="Outline Width"
              value={buttonOutlineWidth}
              min={0}
              max={5}
              onChange={setButtonOutlineWidth}
            />
          </div>

          {/* Menu Item Colors */}
          <div style={{ marginBottom: '2em' }}>
            <h3 style={{ fontSize: '10px', color: '#999', marginBottom: '1em', letterSpacing: '1px' }}>
              MENU ITEMS
            </h3>

            <div style={{ marginBottom: '2em' }}>
              <div style={{ fontSize: '11px', marginBottom: '8px', color: '#999' }}>
                Background Color
              </div>
              <menuItemBgPicker.ColorWheel size={200} />
            </div>

            <div style={{ marginBottom: '2em' }}>
              <div style={{ fontSize: '11px', marginBottom: '8px', color: '#999' }}>
                Text Color
              </div>
              <menuItemTextPicker.ColorWheel size={200} />
            </div>

            <div style={{ marginBottom: '2em' }}>
              <div style={{ fontSize: '11px', marginBottom: '8px', color: '#999' }}>
                Outline Color
              </div>
              <menuItemOutlinePicker.ColorWheel size={200} />
            </div>

            <Slider
              label="Outline Width"
              value={menuItemOutlineWidth}
              min={0}
              max={5}
              onChange={setMenuItemOutlineWidth}
            />
          </div>
        </section>
        )}

        {/* Export Section */}
        {activeTab === 'export' && (
        <section style={{ marginBottom: '3em' }}>
          <h2 style={{
            fontSize: '11px',
            letterSpacing: '1px',
            color: '#666',
            marginBottom: '1.5em'
          }}>
            EXPORT YOUR MENU
          </h2>

          <div style={{ marginBottom: '2em' }}>
            <p style={{ fontSize: '11px', color: '#999', lineHeight: '1.6', marginBottom: '2em' }}>
              Export your customized OrbitMenu as ready-to-use code.
              Choose your preferred format below:
            </p>

            {/* React Component Export */}
            <div style={{ marginBottom: '2em', paddingBottom: '2em', borderBottom: '1px solid #333' }}>
              <h3 style={{ fontSize: '10px', color: '#fff', marginBottom: '1em', letterSpacing: '1px' }}>
                REACT COMPONENT
              </h3>
              <p style={{ fontSize: '9px', color: '#666', marginBottom: '1em', lineHeight: '1.6' }}>
                Copy the React component code with Framer Motion animations
              </p>
              <button
                onClick={() => {
                  const currentConfig = {
                    radius,
                    menuOffset,
                    buttonSize,
                    logoStiffness,
                    logoDamping,
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
                    menuItemTextColor
                  };
                  const code = generateStandaloneComponent(currentConfig);
                  navigator.clipboard.writeText(code);
                  alert('React component code copied to clipboard!');
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#f97316',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '11px',
                  letterSpacing: '1px',
                  fontFamily: 'monospace',
                  marginBottom: '8px'
                }}
              >
                COPY REACT CODE
              </button>
              <div style={{ fontSize: '9px', color: '#666', lineHeight: '1.4' }}>
                Requires: npm install framer-motion
              </div>
            </div>

            {/* Installation Guide */}
            <div style={{ marginBottom: '2em', paddingBottom: '2em', borderBottom: '1px solid #333' }}>
              <h3 style={{ fontSize: '10px', color: '#fff', marginBottom: '1em', letterSpacing: '1px' }}>
                INSTALLATION GUIDE
              </h3>
              <p style={{ fontSize: '9px', color: '#666', marginBottom: '1em', lineHeight: '1.6' }}>
                Get step-by-step installation instructions with your config
              </p>
              <button
                onClick={() => {
                  const currentConfig = {
                    radius,
                    menuOffset,
                    buttonSize,
                    logoStiffness,
                    logoDamping,
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
                    menuItemTextColor
                  };
                  const guide = generateInstallationGuide(currentConfig);
                  navigator.clipboard.writeText(guide);
                  alert('Installation guide copied to clipboard!');
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#000',
                  color: '#fff',
                  border: '1px solid #333',
                  cursor: 'pointer',
                  fontSize: '11px',
                  letterSpacing: '1px',
                  fontFamily: 'monospace'
                }}
              >
                COPY INSTALL GUIDE
              </button>
            </div>

            {/* CSS Export */}
            <div style={{ marginBottom: '2em', paddingBottom: '2em', borderBottom: '1px solid #333' }}>
              <h3 style={{ fontSize: '10px', color: '#fff', marginBottom: '1em', letterSpacing: '1px' }}>
                CSS STYLES
              </h3>
              <p style={{ fontSize: '9px', color: '#666', marginBottom: '1em', lineHeight: '1.6' }}>
                Export the CSS styles based on your color configuration
              </p>
              <button
                onClick={() => {
                  const currentConfig = {
                    buttonSize,
                    buttonBgColor,
                    buttonOutlineColor,
                    buttonOutlineWidth,
                    menuItemBgColor,
                    menuItemTextColor,
                    menuItemOutlineColor,
                    menuItemOutlineWidth,
                    menuItemFontSize
                  };
                  const css = generateCSS(currentConfig);
                  navigator.clipboard.writeText(css);
                  alert('CSS styles copied to clipboard!');
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#000',
                  color: '#fff',
                  border: '1px solid #333',
                  cursor: 'pointer',
                  fontSize: '11px',
                  letterSpacing: '1px',
                  fontFamily: 'monospace'
                }}
              >
                COPY CSS
              </button>
            </div>

            {/* JSON Config (Already exists) */}
            <div style={{ marginBottom: '2em' }}>
              <h3 style={{ fontSize: '10px', color: '#fff', marginBottom: '1em', letterSpacing: '1px' }}>
                JSON CONFIGURATION
              </h3>
              <p style={{ fontSize: '9px', color: '#666', marginBottom: '1em', lineHeight: '1.6' }}>
                Download your configuration as JSON file
              </p>
              <button
                onClick={handleExport}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#000',
                  color: '#fff',
                  border: '1px solid #333',
                  cursor: 'pointer',
                  fontSize: '11px',
                  letterSpacing: '1px',
                  fontFamily: 'monospace'
                }}
              >
                DOWNLOAD JSON
              </button>
            </div>
          </div>

          {/* SaaS Promo Box */}
          <div style={{
            padding: '2em',
            border: '2px solid #f97316',
            backgroundColor: '#1a1a1a',
            marginTop: '2em'
          }}>
            <div style={{ fontSize: '12px', color: '#f97316', marginBottom: '1em', letterSpacing: '2px' }}>
              🚀 WANT MORE?
            </div>
            <div style={{ fontSize: '11px', color: '#fff', marginBottom: '1.5em', lineHeight: '1.6' }}>
              Get access to premium features:
            </div>
            <ul style={{ fontSize: '10px', color: '#999', lineHeight: '1.8', marginBottom: '1.5em', paddingLeft: '1.5em' }}>
              <li>Save & manage unlimited configs</li>
              <li>Premium template library</li>
              <li>NPM package generator</li>
              <li>Team collaboration</li>
              <li>Priority support</li>
            </ul>
            <button
              onClick={() => window.open('https://orbitcustomizer.com/pricing', '_blank')}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#f97316',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontSize: '11px',
                letterSpacing: '1px',
                fontFamily: 'monospace'
              }}
            >
              UPGRADE TO PRO
            </button>
          </div>
        </section>
        )}

        {/* Animation Section */}
        {activeTab === 'animation' && (
        <section style={{ marginBottom: '3em' }}>
          <h2 style={{
            fontSize: '11px',
            letterSpacing: '1px',
            color: '#666',
            marginBottom: '1.5em'
          }}>
            ANIMATION
          </h2>

          <Slider
            label="Logo Stiffness"
            value={logoStiffness}
            min={100}
            max={500}
            onChange={setLogoStiffness}
          />

          <Slider
            label="Logo Damping"
            value={logoDamping}
            min={10}
            max={50}
            onChange={setLogoDamping}
          />
        </section>
        )}

        {/* Menu Items Editor */}
        {activeTab === 'items' && (
        <section style={{ marginBottom: '3em' }}>
          <h2 style={{
            fontSize: '11px',
            letterSpacing: '1px',
            color: '#666',
            marginBottom: '1.5em'
          }}>
            MENU ITEMS
          </h2>

          {/* List of menu items */}
          <div style={{ marginBottom: '2em' }}>
            {menuItems.map((item, index) => (
              <div
                key={item.id}
                style={{
                  marginBottom: '1.5em',
                  padding: '1em',
                  border: '1px solid #333',
                  backgroundColor: '#111'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5em'
                }}>
                  <span style={{ fontSize: '10px', color: '#666' }}>ITEM {index + 1}</span>
                  <button
                    onClick={() => {
                      setMenuItems(menuItems.filter(i => i.id !== item.id));
                    }}
                    style={{
                      background: 'none',
                      border: '1px solid #666',
                      color: '#666',
                      fontSize: '10px',
                      padding: '4px 8px',
                      cursor: 'pointer',
                      fontFamily: 'monospace'
                    }}
                  >
                    DELETE
                  </button>
                </div>

                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => {
                    const newItems = [...menuItems];
                    newItems[index].label = e.target.value;
                    setMenuItems(newItems);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginBottom: '0.5em',
                    backgroundColor: '#000',
                    border: '1px solid #333',
                    color: '#fff',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}
                  placeholder="Label"
                />

                {/* Action Type */}
                <select
                  value={item.action || 'route'}
                  onChange={(e) => {
                    const newItems = [...menuItems];
                    newItems[index].action = e.target.value;
                    if (e.target.value === 'submenu' && !newItems[index].submenu) {
                      newItems[index].submenu = `submenu_${item.id}`;
                      setSubmenus(prev => ({ ...prev, [`submenu_${item.id}`]: [] }));
                    }
                    setMenuItems(newItems);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginBottom: '0.5em',
                    backgroundColor: '#000',
                    border: '1px solid #333',
                    color: '#fff',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}
                >
                  <option value="route">Route</option>
                  <option value="submenu">Submenu</option>
                  <option value="openOverlay">Open Overlay</option>
                </select>

                {/* Route field (only if action is 'route') */}
                {item.action === 'route' && (
                  <>
                    <select
                      value={availableRoutes.find(r => r.value === item.route) ? item.route : 'custom'}
                      onChange={(e) => {
                        const newItems = [...menuItems];
                        if (e.target.value !== 'custom') {
                          newItems[index].route = e.target.value;
                          setMenuItems(newItems);
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '8px',
                        marginBottom: '0.5em',
                        backgroundColor: '#000',
                        border: '1px solid #333',
                        color: '#fff',
                        fontSize: '11px',
                        fontFamily: 'monospace'
                      }}
                    >
                      {availableRoutes.map(route => (
                        <option key={route.value} value={route.value}>
                          {route.label}
                        </option>
                      ))}
                    </select>

                    {/* Custom route input - only show if 'custom' or route not in list */}
                    {(!availableRoutes.find(r => r.value === item.route) || item.route === 'custom') && (
                      <input
                        type="text"
                        value={item.route === 'custom' ? '' : (item.route || '')}
                        onChange={(e) => {
                          const newItems = [...menuItems];
                          newItems[index].route = e.target.value;
                          setMenuItems(newItems);
                        }}
                        style={{
                          width: '100%',
                          padding: '8px',
                          marginBottom: '0.5em',
                          backgroundColor: '#000',
                          border: '1px solid #f97316',
                          color: '#fff',
                          fontSize: '11px',
                          fontFamily: 'monospace'
                        }}
                        placeholder="Custom route (e.g. /my-page#section)"
                      />
                    )}
                  </>
                )}

                {/* Submenu button (only if action is 'submenu') */}
                {item.action === 'submenu' && (
                  <button
                    onClick={() => setEditingSubmenu(item.submenu)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      marginBottom: '0.5em',
                      backgroundColor: '#333',
                      border: '1px solid #666',
                      color: '#fff',
                      fontSize: '10px',
                      cursor: 'pointer',
                      fontFamily: 'monospace',
                      letterSpacing: '1px'
                    }}
                  >
                    EDIT SUBMENU ({(submenus[item.submenu] || []).length} items)
                  </button>
                )}

                {/* Overlay button (only if action is 'openOverlay') */}
                {item.action === 'openOverlay' && (
                  <button
                    onClick={() => setEditingOverlay(true)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      marginBottom: '0.5em',
                      backgroundColor: '#333',
                      border: '1px solid #666',
                      color: '#fff',
                      fontSize: '10px',
                      cursor: 'pointer',
                      fontFamily: 'monospace',
                      letterSpacing: '1px'
                    }}
                  >
                    EDIT OVERLAY ({overlayItems.length} items)
                  </button>
                )}

                <Slider
                  label="Angle"
                  value={item.angle}
                  min={-180}
                  max={180}
                  onChange={(value) => {
                    const newItems = [...menuItems];
                    newItems[index].angle = value;
                    setMenuItems(newItems);
                  }}
                />
              </div>
            ))}
          </div>

          {/* Add new item */}
          <button
            onClick={() => {
              const newId = Math.max(...menuItems.map(i => i.id)) + 1;
              setMenuItems([...menuItems, {
                id: newId,
                angle: 0,
                label: `Item ${menuItems.length + 1}`
              }]);
            }}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#000',
              color: '#fff',
              border: '1px solid #333',
              cursor: 'pointer',
              fontSize: '11px',
              letterSpacing: '1px',
              fontFamily: 'monospace'
            }}
          >
            + ADD ITEM
          </button>
        </section>
        )}

        {/* Submenu Editor Modal */}
        {editingSubmenu && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 10000,
            padding: '6em 2em 2em 2em',
            overflowY: 'auto'
          }}>
            <div style={{
              maxWidth: '600px',
              margin: '0 auto',
              backgroundColor: '#000',
              border: '2px solid #333',
              padding: '3em'      }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2em',
                borderBottom: '1px solid #333',
                paddingBottom: '1em'
              }}>
                <h2 style={{
                  fontSize: '14px',
                  letterSpacing: '2px',
                  margin: 0
                }}>
                  SUBMENU: {editingSubmenu}
                </h2>
                <button
                  onClick={() => setEditingSubmenu(null)}
                  style={{
                    background: 'none',
                    border: '1px solid #666',
                    color: '#666',
                    fontSize: '10px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                    letterSpacing: '1px'
                  }}
                >
                  CLOSE
                </button>
              </div>

              {/* Submenu Items List */}
              <div style={{ marginBottom: '2em' }}>
                {(submenus[editingSubmenu] || []).map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      marginBottom: '1.5em',
                      padding: '1em',
                      border: '1px solid #333',
                      backgroundColor: '#111'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5em'
                    }}>
                      <span style={{ fontSize: '10px', color: '#666' }}>ITEM {index + 1}</span>
                      <button
                        onClick={() => {
                          setSubmenus(prev => ({
                            ...prev,
                            [editingSubmenu]: prev[editingSubmenu].filter(i => i.id !== item.id)
                          }));
                        }}
                        style={{
                          background: 'none',
                          border: '1px solid #666',
                          color: '#666',
                          fontSize: '10px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          fontFamily: 'monospace'
                        }}
                      >
                        DELETE
                      </button>
                    </div>

                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => {
                        setSubmenus(prev => {
                          const newItems = [...prev[editingSubmenu]];
                          newItems[index].label = e.target.value;
                          return { ...prev, [editingSubmenu]: newItems };
                        });
                      }}
                      style={{
                        width: '100%',
                        padding: '8px',
                        marginBottom: '0.5em',
                        backgroundColor: '#000',
                        border: '1px solid #333',
                        color: '#fff',
                        fontSize: '11px',
                        fontFamily: 'monospace'
                      }}
                      placeholder="Label"
                    />

                    <select
                      value={availableRoutes.find(r => r.value === item.route) ? item.route : 'custom'}
                      onChange={(e) => {
                        if (e.target.value !== 'custom') {
                          setSubmenus(prev => {
                            const newItems = [...prev[editingSubmenu]];
                            newItems[index].route = e.target.value;
                            return { ...prev, [editingSubmenu]: newItems };
                          });
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '8px',
                        marginBottom: '0.5em',
                        backgroundColor: '#000',
                        border: '1px solid #333',
                        color: '#fff',
                        fontSize: '11px',
                        fontFamily: 'monospace'
                      }}
                    >
                      {availableRoutes.map(route => (
                        <option key={route.value} value={route.value}>
                          {route.label}
                        </option>
                      ))}
                    </select>

                    {/* Custom route input - only show if 'custom' or route not in list */}
                    {(!availableRoutes.find(r => r.value === item.route) || item.route === 'custom') && (
                      <input
                        type="text"
                        value={item.route === 'custom' ? '' : (item.route || '')}
                        onChange={(e) => {
                          setSubmenus(prev => {
                            const newItems = [...prev[editingSubmenu]];
                            newItems[index].route = e.target.value;
                            return { ...prev, [editingSubmenu]: newItems };
                          });
                        }}
                        style={{
                          width: '100%',
                          padding: '8px',
                          marginBottom: '0.5em',
                          backgroundColor: '#000',
                          border: '1px solid #f97316',
                          color: '#fff',
                          fontSize: '11px',
                          fontFamily: 'monospace'
                        }}
                        placeholder="Custom route (e.g. /about#section)"
                      />
                    )}

                    <Slider
                      label="Angle"
                      value={item.angle}
                      min={-180}
                      max={180}
                      onChange={(value) => {
                        setSubmenus(prev => {
                          const newItems = [...prev[editingSubmenu]];
                          newItems[index].angle = value;
                          return { ...prev, [editingSubmenu]: newItems };
                        });
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Add Submenu Item */}
              <button
                onClick={() => {
                  const newId = `${editingSubmenu}_${Date.now()}`;
                  setSubmenus(prev => ({
                    ...prev,
                    [editingSubmenu]: [
                      ...(prev[editingSubmenu] || []),
                      {
                        id: newId,
                        angle: 0,
                        label: `Item ${(prev[editingSubmenu] || []).length + 1}`,
                        action: 'route',
                        route: ''
                      }
                    ]
                  }));
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#000',
                  color: '#fff',
                  border: '1px solid #333',
                  cursor: 'pointer',
                  fontSize: '11px',
                  letterSpacing: '1px',
                  fontFamily: 'monospace'
                }}
              >
                + ADD SUBMENU ITEM
              </button>
            </div>
          </div>
        )}

        {/* Overlay Editor Modal */}
        {editingOverlay && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 10000,
            padding: '6em 2em 2em 2em',
            overflowY: 'auto'
          }}>
            <div style={{
              maxWidth: '600px',
              margin: '0 auto',
              backgroundColor: '#000',
              border: '2px solid #333',
              padding: '3em'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2em',
                borderBottom: '1px solid #333',
                paddingBottom: '1em'
              }}>
                <h2 style={{
                  fontSize: '14px',
                  letterSpacing: '2px',
                  margin: 0
                }}>
                  OVERLAY MENU EDITOR
                </h2>
                <button
                  onClick={() => setEditingOverlay(false)}
                  style={{
                    background: 'none',
                    border: '1px solid #666',
                    color: '#666',
                    fontSize: '10px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                    letterSpacing: '1px'
                  }}
                >
                  CLOSE
                </button>
              </div>

              {/* Overlay Items List */}
              <div style={{ marginBottom: '2em' }}>
                {overlayItems.map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      marginBottom: '1.5em',
                      padding: '1em',
                      border: '1px solid #333',
                      backgroundColor: '#111'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5em'
                    }}>
                      <span style={{ fontSize: '10px', color: '#666' }}>ITEM {index + 1}</span>
                      <button
                        onClick={() => {
                          setOverlayItems(prev => prev.filter(i => i.id !== item.id));
                        }}
                        style={{
                          background: 'none',
                          border: '1px solid #666',
                          color: '#666',
                          fontSize: '10px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          fontFamily: 'monospace'
                        }}
                      >
                        DELETE
                      </button>
                    </div>

                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => {
                        setOverlayItems(prev => {
                          const newItems = [...prev];
                          newItems[index].label = e.target.value;
                          return newItems;
                        });
                      }}
                      style={{
                        width: '100%',
                        padding: '8px',
                        marginBottom: '0.5em',
                        backgroundColor: '#000',
                        border: '1px solid #333',
                        color: '#fff',
                        fontSize: '11px',
                        fontFamily: 'monospace'
                      }}
                      placeholder="Label"
                    />

                    <select
                      value={availableRoutes.find(r => r.value === item.route) ? item.route : 'custom'}
                      onChange={(e) => {
                        if (e.target.value !== 'custom') {
                          setOverlayItems(prev => {
                            const newItems = [...prev];
                            newItems[index].route = e.target.value;
                            return newItems;
                          });
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '8px',
                        marginBottom: '0.5em',
                        backgroundColor: '#000',
                        border: '1px solid #333',
                        color: '#fff',
                        fontSize: '11px',
                        fontFamily: 'monospace'
                      }}
                    >
                      {availableRoutes.map(route => (
                        <option key={route.value} value={route.value}>
                          {route.label}
                        </option>
                      ))}
                    </select>

                    {/* Custom route input - only show if 'custom' or route not in list */}
                    {(!availableRoutes.find(r => r.value === item.route) || item.route === 'custom') && (
                      <input
                        type="text"
                        value={item.route === 'custom' ? '' : (item.route || '')}
                        onChange={(e) => {
                          setOverlayItems(prev => {
                            const newItems = [...prev];
                            newItems[index].route = e.target.value;
                            return newItems;
                          });
                        }}
                        style={{
                          width: '100%',
                          padding: '8px',
                          marginBottom: '0.5em',
                          backgroundColor: '#000',
                          border: '1px solid #f97316',
                          color: '#fff',
                          fontSize: '11px',
                          fontFamily: 'monospace'
                        }}
                        placeholder="Custom route (e.g. /my-page#section)"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Add new overlay item button */}
              <button
                onClick={() => {
                  const newId = overlayItems.length > 0
                    ? `ov${Math.max(...overlayItems.map(i => parseInt(i.id.replace('ov', '')))) + 1}`
                    : 'ov1';
                  setOverlayItems(prev => [
                    ...prev,
                    {
                      id: newId,
                      label: `Menu Item ${prev.length + 1}`,
                      route: ''
                    }
                  ]);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#000',
                  color: '#fff',
                  border: '1px solid #333',
                  cursor: 'pointer',
                  fontSize: '11px',
                  letterSpacing: '1px',
                  fontFamily: 'monospace'
                }}
              >
                + ADD OVERLAY ITEM
              </button>
            </div>
          </div>
        )}

        {/* Buttons */}
        <button
          onClick={handleApplyToConfig}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#fff',
            color: '#000',
            border: 'none',
            cursor: 'pointer',
            fontSize: '11px',
            letterSpacing: '1px',
            fontFamily: 'monospace',
            marginBottom: '1em'
          }}
        >
          APPLY TO CONFIG
        </button>

        <button
          onClick={handleExport}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#000',
            color: '#fff',
            border: '1px solid #333',
            cursor: 'pointer',
            fontSize: '11px',
            letterSpacing: '1px',
            fontFamily: 'monospace',
            marginBottom: '2em'
          }}
        >
          EXPORT JSON
        </button>

        {/* Current Values */}
        <div style={{
          padding: '1.5em',
          border: '1px solid #333',
          fontSize: '10px',
          lineHeight: '1.8',
          marginBottom: '1em'
        }}>
          <div style={{ marginBottom: '0.5em', color: '#666', fontSize: '11px', letterSpacing: '1px' }}>
            CURRENT VALUES
          </div>
          <pre style={{ margin: 0, fontSize: '9px', lineHeight: '1.6' }}>
{`radius: ${radius}
menuOffset: ${menuOffset}
buttonSize: ${buttonSize}
logoStiffness: ${logoStiffness}
logoDamping: ${logoDamping}
logoType: ${logoType}
${logoType === 'text' ? `logoText: "${logoText}"` : 'logoImage: [uploaded]'}
menuItemFontSize: ${menuItemFontSize}px

COLORS:
buttonBg: ${buttonBgColor}
buttonOutline: ${buttonOutlineColor} (${buttonOutlineWidth}px)
menuBg: ${menuItemBgColor}
menuText: ${menuItemTextColor}
menuOutline: ${menuItemOutlineColor} (${menuItemOutlineWidth}px)`}
          </pre>
        </div>

        {/* Info Box */}
        <div style={{
          padding: '1em',
          border: '1px solid #333',
          fontSize: '10px',
          color: '#666',
          lineHeight: '1.6'
        }}>
          <strong style={{ color: '#fff' }}>TEST:</strong><br/>
          Go to homepage and click the bottom-right<br/>
          Orbit Menu button to see your changes live.
        </div>
      </div>
    </div>
  );
};

// Slider Component
const Slider = ({ label, value, min, max, onChange }) => (
  <div style={{ marginBottom: '2em' }}>
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '8px',
      fontSize: '11px'
    }}>
      <span>{label}</span>
      <span style={{ color: '#666' }}>{value}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      style={{
        width: '100%',
        height: '1px',
        background: '#333',
        outline: 'none',
        cursor: 'pointer',
        WebkitAppearance: 'none',
        appearance: 'none'
      }}
    />
    <style>{`
      input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 12px;
        height: 12px;
        background: #fff;
        cursor: pointer;
        border-radius: 0;
      }

      input[type="range"]::-moz-range-thumb {
        width: 12px;
        height: 12px;
        background: #fff;
        cursor: pointer;
        border: none;
        border-radius: 0;
      }
    `}</style>
  </div>
);

export default OrbitCustomizer;
