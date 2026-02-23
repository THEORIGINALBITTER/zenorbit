import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * Hook for interactive color picking with HSL color wheel
 * Returns both the color value and a ColorWheel component
 *
 * @param {string} initialColor - Initial color in hex format (e.g., '#ff0000')
 * @param {function} onChange - Callback when color changes
 * @returns {object} { color, setColor, ColorWheel }
 */
export const useColorPicker = (initialColor = '#ff0000', onChange) => {
  const [isOpen, setIsOpen] = useState(false);
  const canvasRef = useRef(null);
  const [hsl, setHsl] = useState({ h: 0, s: 100, l: 50 });

  // Convert hex to HSL
  const hexToHsl = useCallback((hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { h: 0, s: 100, l: 50 };

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
        default: h = 0;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }, []);

  // Update HSL when initialColor changes
  useEffect(() => {
    setHsl(hexToHsl(initialColor));
  }, [initialColor, hexToHsl]);

  // Convert HSL to hex
  const hslToHex = useCallback((h, s, l) => {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else if (h >= 300 && h < 360) {
      r = c; g = 0; b = x;
    }

    const toHex = (n) => {
      const hex = Math.round((n + m) * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }, []);

  // Draw color wheel on canvas
  const drawColorWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw color wheel
    for (let angle = 0; angle < 360; angle += 1) {
      const startAngle = (angle - 1) * Math.PI / 180;
      const endAngle = angle * Math.PI / 180;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, 'white');
      gradient.addColorStop(0.7, `hsl(${angle}, 100%, 50%)`);
      gradient.addColorStop(1, `hsl(${angle}, 100%, 30%)`);

      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Draw current color indicator
    const currentAngle = (hsl.h * Math.PI) / 180;
    const indicatorRadius = radius * 0.85;
    const indicatorX = centerX + Math.cos(currentAngle) * indicatorRadius;
    const indicatorY = centerY + Math.sin(currentAngle) * indicatorRadius;

    ctx.beginPath();
    ctx.arc(indicatorX, indicatorY, 8, 0, 2 * Math.PI);
    ctx.fillStyle = initialColor;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [hsl, initialColor]);

  // Handle canvas click
  const handleCanvasClick = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Calculate angle
    const dx = x - centerX;
    const dy = y - centerY;
    let angle = Math.atan2(dy, dx) * 180 / Math.PI;
    if (angle < 0) angle += 360;

    // Calculate distance from center (for saturation/lightness)
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radius = Math.min(centerX, centerY) - 10;
    const normalizedDistance = Math.min(distance / radius, 1);

    // Update HSL
    const newHsl = {
      h: Math.round(angle),
      s: Math.round(100 * normalizedDistance),
      l: Math.round(50 + (1 - normalizedDistance) * 20)
    };

    const newColor = hslToHex(newHsl.h, newHsl.s, newHsl.l);
    setHsl(newHsl);
    if (onChange) onChange(newColor);
  }, [onChange, hslToHex]);

  // Redraw when canvas opens or HSL changes
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      setTimeout(() => drawColorWheel(), 50);
    }
  }, [isOpen, drawColorWheel]);

  // Preset colors
  const presetColors = useMemo(() => [
    '#f97316', // Orange
    '#ef4444', // Red
    '#10b981', // Green
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#f59e0b', // Amber
    '#06b6d4', // Cyan
    '#1f2937', // Gray-800
    '#111827', // Gray-900
    '#000000', // Black
    '#ffffff', // White
  ], []);

  // ColorWheel Component - memoized
  const ColorWheel = useMemo(() => {
    return ({ size = 200 }) => (
      <div style={{ position: 'relative' }}>
        {/* Current color display button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(prev => !prev);
          }}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: initialColor,
            border: '2px solid #333',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'monospace',
            fontSize: '11px',
            color: hsl.l > 50 ? '#000' : '#fff',
            letterSpacing: '1px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span>FARBRAD</span>
          <span>{initialColor.toUpperCase()}</span>
        </button>

        {/* Preset colors grid below button */}
        <div style={{
          marginTop: '12px',
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '6px'
        }}>
          {presetColors.map((presetColor) => (
            <button
              key={presetColor}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onChange) onChange(presetColor);
              }}
              style={{
                width: '100%',
                height: '32px',
                backgroundColor: presetColor,
                border: initialColor === presetColor ? '2px solid #fff' : '1px solid #333',
                cursor: 'pointer',
                borderRadius: '3px',
                transition: 'transform 0.1s',
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              title={presetColor}
            />
          ))}
        </div>

        {/* Color wheel modal */}
        {isOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              zIndex: 999999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: '#000',
                border: '2px solid #333',
                padding: '2em',
                borderRadius: '8px',
                maxWidth: '90vw'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5em',
                color: '#fff',
                fontFamily: 'monospace',
                fontSize: '11px',
                letterSpacing: '1px'
              }}>
                <span>FARBRAD AUSWAHL</span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: 'none',
                    border: '1px solid #666',
                    color: '#666',
                    padding: '4px 12px',
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                    fontSize: '10px'
                  }}
                >
                  SCHLIESSEN
                </button>
              </div>

              <canvas
                ref={canvasRef}
                width={size}
                height={size}
                onClick={handleCanvasClick}
                style={{
                  cursor: 'crosshair',
                  display: 'block',
                  margin: '0 auto',
                  border: '1px solid #333',
                  borderRadius: '4px'
                }}
              />

              <div style={{
                marginTop: '1.5em',
                fontFamily: 'monospace',
                fontSize: '10px',
                color: '#999',
                textAlign: 'center',
                lineHeight: '1.6'
              }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong style={{ color: '#fff' }}>H:</strong> {hsl.h}° |{' '}
                  <strong style={{ color: '#fff' }}>S:</strong> {hsl.s}% |{' '}
                  <strong style={{ color: '#fff' }}>L:</strong> {hsl.l}%
                </div>
                <div
                  style={{
                    padding: '12px',
                    backgroundColor: initialColor,
                    border: '1px solid #333',
                    borderRadius: '4px',
                    color: hsl.l > 50 ? '#000' : '#fff',
                    fontWeight: 'bold'
                  }}
                >
                  {initialColor.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }, [initialColor, hsl, isOpen, presetColors, onChange, handleCanvasClick]);

  return {
    color: initialColor,
    ColorWheel,
    hsl
  };
};

export default useColorPicker;
