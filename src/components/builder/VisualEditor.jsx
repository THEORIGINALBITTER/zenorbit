import React from 'react';
import { HexColorPicker } from 'react-colorful';
import { useBuilderPalette } from './builderTheme';
import { extractFontStylesheetUrl, extractGoogleFontFamily } from '../../utils/fontUtils';
import FontSourceField from '../ui/FontSourceField';

const TYPO_SCALE = 0.8;
const fs = (px) => `${Math.round(px * TYPO_SCALE * 10) / 10}px`;
const TYPE_FAMILY_OPTIONS = [
  { label: 'IBM Plex Mono', value: '"IBM Plex Mono", monospace' },
  { label: 'IBM Plex Sans', value: '"IBM Plex Sans", sans-serif' },
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'System Sans', value: 'system-ui, sans-serif' },
  { label: 'System Mono', value: 'ui-monospace, SFMono-Regular, monospace' },
];
const TYPE_WEIGHT_OPTIONS = [
  { label: 'Regular 400', value: 400 },
  { label: 'Medium 500', value: 500 },
  { label: 'Semibold 600', value: 600 },
  { label: 'Bold 700', value: 700 },
];

/**
 * Visual Editor Component
 * Provides controls for customizing the menu appearance
 */
function VisualEditor({ config, onConfigChange, accentColor, onAccentColorChange, logoSrc = '', onLogoSrcChange = null, hideHeader = false }) {
  const palette = useBuilderPalette();
  const styles = createStyles(palette);
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
  const setTypeFamily = (value) => {
    const newConfig = JSON.parse(JSON.stringify(config));
    newConfig.visual.button.fontFamily = value;
    newConfig.visual.menuItem.fontFamily = value;
    onConfigChange(newConfig);
  };
  const setTypeFontUrl = (value) => {
    const newConfig = JSON.parse(JSON.stringify(config));
    const normalized = extractFontStylesheetUrl(value);
    newConfig.visual.button.fontUrl = normalized;
    newConfig.visual.menuItem.fontUrl = normalized;
    const detectedFamily = extractGoogleFontFamily(value);
    if (detectedFamily) {
      newConfig.visual.button.fontFamily = detectedFamily;
      newConfig.visual.menuItem.fontFamily = detectedFamily;
    }
    onConfigChange(newConfig);
  };
  const renderColorPickerField = (label, value, onChange) => (
    <div style={styles.control}>
      <label style={styles.label}>{label}</label>
      <div style={styles.colorPickerWrapper}>
        <HexColorPicker color={value} onChange={onChange} />
        <div style={styles.colorDisplay}>
          <div
            style={{
              ...styles.colorSwatch,
              backgroundColor: value,
            }}
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={styles.colorInput}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      {!hideHeader && <h3 style={styles.sectionTitleFirst}>Visual Settings</h3>}

      {/* Logo URL */}
      {onLogoSrcChange && (
        <div style={styles.control}>
          <label style={styles.label}>Logo URL (optional)</label>
          <input
            type="text"
            placeholder="https://example.com/logo.png"
            value={logoSrc}
            onChange={(e) => onLogoSrcChange(e.target.value)}
            style={styles.input}
          />
        </div>
      )}

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
            const newConfig = JSON.parse(JSON.stringify(config));
            newConfig.visual.button.width = size;
            newConfig.visual.button.height = size;
            onConfigChange(newConfig);
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
        <label style={styles.label}>Accent / Outline Color</label>
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

      {renderColorPickerField(
        'Button Surface',
        config.visual.colors.backgroundDark || '#111827',
        (color) => handleChange('visual.colors.backgroundDark', color)
      )}
      {renderColorPickerField(
        'Item Surface',
        config.visual.colors.background || '#1b1b1e',
        (color) => handleChange('visual.colors.background', color)
      )}
      {renderColorPickerField(
        'Type Color',
        config.visual.colors.text || accentColor,
        (color) => handleChange('visual.colors.text', color)
      )}

      <h3 style={styles.sectionTitle}>Type Settings</h3>

      <div style={styles.control}>
        <FontSourceField
          palette={palette}
          presetOptions={TYPE_FAMILY_OPTIONS}
          familyValue={config.visual.button.fontFamily || '"IBM Plex Mono", monospace'}
          fontUrlValue={config.visual.button.fontUrl || ''}
          onFamilyChange={setTypeFamily}
          onFontUrlChange={setTypeFontUrl}
        />
      </div>

      <div style={styles.control}>
        <label style={styles.label}>Type Weight</label>
        <select
          value={String(config.visual.menuItem.fontWeight ?? 600)}
          onChange={(e) => handleChange('visual.menuItem.fontWeight', parseInt(e.target.value, 10))}
          style={styles.select}
        >
          {TYPE_WEIGHT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.control}>
        <label style={styles.label}>
          Type Size: {parseInt(config.visual.button.fontSize || '10px', 10)}px
        </label>
        <input
          type="range"
          min="8"
          max="18"
          value={parseInt(config.visual.button.fontSize || '10px', 10)}
          onChange={(e) => handleChange('visual.button.fontSize', `${e.target.value}px`)}
          style={styles.slider}
        />
        <div style={styles.rangeIndicators}>
          <span>8px</span>
          <span>18px</span>
        </div>
      </div>

      <div style={styles.control}>
        <label style={styles.label}>
          Letter Spacing: {config.visual.menuItem.letterSpacing || '0em'}
        </label>
        <input
          type="range"
          min="0"
          max="0.2"
          step="0.01"
          value={parseFloat(String(config.visual.menuItem.letterSpacing || '0').replace('em', ''))}
          onChange={(e) => handleChange('visual.menuItem.letterSpacing', `${e.target.value}em`)}
          style={styles.slider}
        />
        <div style={styles.rangeIndicators}>
          <span>0em</span>
          <span>0.2em</span>
        </div>
      </div>

      <div style={styles.control}>
        <label style={styles.label}>Type Case</label>
        <div style={styles.toggleRow}>
          {[
            { label: 'Default', value: 'none' },
            { label: 'Uppercase', value: 'uppercase' },
          ].map((option) => {
            const active = (config.visual.menuItem.textTransform || 'none') === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange('visual.menuItem.textTransform', option.value)}
                style={{
                  ...styles.toggleButton,
                  ...(active ? styles.toggleButtonActive : {}),
                }}
              >
                {option.label}
              </button>
            );
          })}
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

const createStyles = (palette) => ({
  container: {
    padding: '1.5rem',
    backgroundColor: palette.bgPanel,
    borderRadius: '12px',
    border: `1px solid ${palette.border}`,
    boxShadow: palette.shadow,
    maxHeight: '540px',
    overflowY: 'auto',
  },
  sectionTitleFirst: {
    fontSize: fs(18),
    fontWeight: '600',
    color: palette.text,
    marginBottom: '1rem',
    marginTop: 0,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: fs(18),
    fontWeight: '600',
    color: palette.text,
    marginBottom: '1rem',
    marginTop: '1.5rem',
    paddingTop: '1rem',
    borderTop: `1px solid ${palette.border}`,
  },
  control: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    fontSize: fs(14),
    fontWeight: '500',
    color: palette.text,
    marginBottom: '0.5rem',
  },
  slider: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    outline: 'none',
    background: palette.border,
    WebkitAppearance: 'none',
    appearance: 'none',
  },
  rangeIndicators: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '0.25rem',
    fontSize: fs(12),
    color: palette.textDim,
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
    border: `2px solid ${palette.border}`,
  },
  colorInput: {
    flex: 1,
    padding: '0.5rem',
    fontSize: fs(14),
    fontFamily: 'monospace',
    border: `1px solid ${palette.border}`,
    borderRadius: '6px',
    outline: 'none',
    backgroundColor: palette.bgInput,
    color: palette.text,
  },
  input: {
    width: '100%',
    padding: '0.6rem',
    fontSize: fs(14),
    border: `1px solid ${palette.border}`,
    borderRadius: '6px',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: palette.bgInput,
    color: palette.text,
    fontFamily: 'monospace',
  },
  select: {
    width: '100%',
    padding: '0.6rem',
    fontSize: fs(14),
    border: `1px solid ${palette.border}`,
    borderRadius: '6px',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: palette.bgInput,
    color: palette.text,
    fontFamily: 'monospace',
  },
  toggleRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.6rem',
  },
  toggleButton: {
    padding: '0.65rem 0.8rem',
    fontSize: fs(12),
    fontFamily: 'monospace',
    border: `1px solid ${palette.border}`,
    borderRadius: '8px',
    backgroundColor: palette.bgInput,
    color: palette.textDim,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  toggleButtonActive: {
    backgroundColor: palette.bgCard,
    color: palette.text,
    border: `1px solid ${palette.gold}`,
    boxShadow: `0 0 0 1px ${palette.gold}22`,
  },
});

export default VisualEditor;
