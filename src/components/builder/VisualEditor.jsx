import React from 'react';
import { HexColorPicker } from 'react-colorful';

/**
 * Visual Editor Component
 * Provides controls for customizing the menu appearance
 */
function VisualEditor({ config, onConfigChange, accentColor, onAccentColorChange }) {
  const handleChange = (path, value) => {
    const keys = path.split('.');
    const newConfig = JSON.parse(JSON.stringify(config));

    let current = newConfig;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;

    onConfigChange(newConfig);
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.sectionTitle}>Visual Settings</h3>

      {/* Radius Control */}
      <div style={styles.control}>
        <label style={styles.label}>
          Menu Radius: {config.visual.radius}px
        </label>
        <input
          type="range"
          min="60"
          max="200"
          value={config.visual.radius}
          onChange={(e) => handleChange('visual.radius', parseInt(e.target.value))}
          style={styles.slider}
        />
        <div style={styles.rangeIndicators}>
          <span>60px</span>
          <span>200px</span>
        </div>
      </div>

      {/* Button Size Control */}
      <div style={styles.control}>
        <label style={styles.label}>
          Button Size: {config.visual.button.width}px
        </label>
        <input
          type="range"
          min="48"
          max="90"
          value={config.visual.button.width}
          onChange={(e) => {
            const size = parseInt(e.target.value);
            handleChange('visual.button.width', size);
            handleChange('visual.button.height', size);
          }}
          style={styles.slider}
        />
        <div style={styles.rangeIndicators}>
          <span>48px</span>
          <span>90px</span>
        </div>
      </div>

      {/* Accent Color */}
      <div style={styles.control}>
        <label style={styles.label}>Accent Color</label>
        <div style={styles.colorPickerWrapper}>
          <HexColorPicker color={accentColor} onChange={onAccentColorChange} />
          <div style={styles.colorDisplay}>
            <div
              style={{
                ...styles.colorSwatch,
                backgroundColor: accentColor,
              }}
            />
            <input
              type="text"
              value={accentColor}
              onChange={(e) => onAccentColorChange(e.target.value)}
              style={styles.colorInput}
            />
          </div>
        </div>
      </div>

      <h3 style={styles.sectionTitle}>Animation Settings</h3>

      {/* Stiffness */}
      <div style={styles.control}>
        <label style={styles.label}>
          Animation Stiffness: {config.animation.menuItem.stiffness}
        </label>
        <input
          type="range"
          min="100"
          max="400"
          value={config.animation.menuItem.stiffness}
          onChange={(e) => handleChange('animation.menuItem.stiffness', parseInt(e.target.value))}
          style={styles.slider}
        />
        <div style={styles.rangeIndicators}>
          <span>Slow</span>
          <span>Fast</span>
        </div>
      </div>

      {/* Damping */}
      <div style={styles.control}>
        <label style={styles.label}>
          Animation Damping: {config.animation.menuItem.damping}
        </label>
        <input
          type="range"
          min="10"
          max="40"
          value={config.animation.menuItem.damping}
          onChange={(e) => handleChange('animation.menuItem.damping', parseInt(e.target.value))}
          style={styles.slider}
        />
        <div style={styles.rangeIndicators}>
          <span>Bouncy</span>
          <span>Smooth</span>
        </div>
      </div>

      {/* Stagger Delay */}
      <div style={styles.control}>
        <label style={styles.label}>
          Stagger Delay: {config.animation.menuItem.staggerDelay}s
        </label>
        <input
          type="range"
          min="0"
          max="0.15"
          step="0.01"
          value={config.animation.menuItem.staggerDelay}
          onChange={(e) => handleChange('animation.menuItem.staggerDelay', parseFloat(e.target.value))}
          style={styles.slider}
        />
        <div style={styles.rangeIndicators}>
          <span>0s</span>
          <span>0.15s</span>
        </div>
      </div>

      <h3 style={styles.sectionTitle}>Backdrop Settings</h3>

      {/* Blur */}
      <div style={styles.control}>
        <label style={styles.label}>
          Backdrop Blur: {config.visual.backdrop.blur}
        </label>
        <input
          type="range"
          min="0"
          max="20"
          value={parseInt(config.visual.backdrop.blur)}
          onChange={(e) => handleChange('visual.backdrop.blur', `${e.target.value}px`)}
          style={styles.slider}
        />
        <div style={styles.rangeIndicators}>
          <span>0px</span>
          <span>20px</span>
        </div>
      </div>

      {/* Backdrop Color */}
      <div style={styles.control}>
        <label style={styles.label}>Backdrop Color</label>
        <div style={styles.colorPickerWrapper}>
          <HexColorPicker
            color={config.visual.colors.backdrop || '#000000'}
            onChange={(color) => handleChange('visual.colors.backdrop', `${color}40`)}
          />
          <div style={styles.colorDisplay}>
            <div
              style={{
                ...styles.colorSwatch,
                backgroundColor: config.visual.colors.backdrop,
              }}
            />
            <input
              type="text"
              value={config.visual.colors.backdrop}
              onChange={(e) => handleChange('visual.colors.backdrop', e.target.value)}
              style={styles.colorInput}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '1.5rem',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    maxHeight: '600px',
    overflowY: 'auto',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '1rem',
    marginTop: '1.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e5e7eb',
  },
  control: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.5rem',
  },
  slider: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    outline: 'none',
    background: '#e5e7eb',
    WebkitAppearance: 'none',
    appearance: 'none',
  },
  rangeIndicators: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '0.25rem',
    fontSize: '12px',
    color: '#6b7280',
  },
  colorPickerWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  colorDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  colorSwatch: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
  },
  colorInput: {
    flex: 1,
    padding: '0.5rem',
    fontSize: '14px',
    fontFamily: 'monospace',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    outline: 'none',
  },
};

export default VisualEditor;
