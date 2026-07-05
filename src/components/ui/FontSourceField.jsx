import React, { useEffect, useMemo, useState } from 'react';
import { extractFontStylesheetUrl, extractGoogleFontFamily } from '../../utils/fontUtils';

const TYPO_SCALE = 0.8;
const fs = (px) => `${Math.round(px * TYPO_SCALE * 10) / 10}px`;

const detectSource = (familyValue, fontUrlValue, presetOptions) => {
  const normalizedUrl = extractFontStylesheetUrl(fontUrlValue);
  if (normalizedUrl) {
    return normalizedUrl.includes('fonts.googleapis.com') ? 'google' : 'external';
  }
  return presetOptions.some((option) => option.value === familyValue) ? 'preset' : 'external';
};

function FontSourceField({
  palette,
  presetOptions,
  familyValue,
  fontUrlValue,
  onFamilyChange,
  onFontUrlChange,
}) {
  const styles = useMemo(() => createStyles(palette), [palette]);
  const derivedSource = useMemo(
    () => detectSource(familyValue, fontUrlValue, presetOptions),
    [familyValue, fontUrlValue, presetOptions]
  );
  const detectedGoogleFamily = useMemo(
    () => extractGoogleFontFamily(fontUrlValue),
    [fontUrlValue]
  );
  const [source, setSource] = useState(derivedSource);

  useEffect(() => {
    setSource(derivedSource);
  }, [derivedSource]);

  useEffect(() => {
    if (source !== 'google') return;
    if (!detectedGoogleFamily) return;
    if (detectedGoogleFamily === familyValue) return;
    onFamilyChange(detectedGoogleFamily);
  }, [source, detectedGoogleFamily, familyValue, onFamilyChange]);

  const handleSourceChange = (nextSource) => {
    setSource(nextSource);

    if (nextSource === 'preset') {
      onFontUrlChange('');
      if (!presetOptions.some((option) => option.value === familyValue)) {
        onFamilyChange(presetOptions[0]?.value || 'monospace');
      }
      return;
    }

    if (nextSource === 'google') {
      const normalizedUrl = extractFontStylesheetUrl(fontUrlValue);
      if (normalizedUrl && !normalizedUrl.includes('fonts.googleapis.com')) {
        onFontUrlChange('');
      }
      return;
    }

    if (nextSource === 'external') {
      if (!familyValue) {
        onFamilyChange('system-ui, sans-serif');
      }
    }
  };

  const handleGoogleFontInputChange = (value) => {
    onFontUrlChange(value);
    const detectedFamily = extractGoogleFontFamily(value);
    if (detectedFamily) {
      onFamilyChange(detectedFamily);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.control}>
        <label style={styles.label}>Font Source</label>
        <select
          value={source}
          onChange={(e) => handleSourceChange(e.target.value)}
          style={styles.select}
        >
          <option value="preset">Preset Fonts</option>
          <option value="google">Google Fonts</option>
          <option value="external">External Stylesheet</option>
        </select>
      </div>

      {source === 'preset' && (
        <div style={styles.control}>
          <label style={styles.label}>Type Family</label>
          <select
            value={familyValue || presetOptions[0]?.value || 'monospace'}
            onChange={(e) => onFamilyChange(e.target.value)}
            style={styles.select}
          >
            {presetOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {source !== 'preset' && (
        <div style={styles.control}>
          <label style={styles.label}>{source === 'google' ? 'Detected Google Font Family' : 'Font Family'}</label>
          <input
            type="text"
            value={source === 'google' ? (detectedGoogleFamily || familyValue || '') : (familyValue || '')}
            onChange={(e) => {
              if (source !== 'google') onFamilyChange(e.target.value);
            }}
            placeholder={source === 'google' ? '"Sora", sans-serif' : '"Neue Haas Grotesk", sans-serif'}
            style={styles.input}
            readOnly={source === 'google'}
          />
          {source === 'google' && (
            <div style={styles.helperText}>
              {detectedGoogleFamily
                ? 'Wird automatisch aus dem Google-Fonts-Link gelesen.'
                : 'Noch kein gültiger Google-Fonts-Link erkannt.'}
            </div>
          )}
        </div>
      )}

      {source === 'google' && (
        <div style={styles.control}>
          <label style={styles.label}>Google Fonts Embed</label>
          <div style={styles.helperText}>
            Einfach den Code von Google Fonts hier einfügen — URL, @import oder Link-Snippet.
          </div>
          <div style={styles.urlRow}>
            <input
              type="text"
              value={fontUrlValue || ''}
              onChange={(e) => handleGoogleFontInputChange(e.target.value)}
              placeholder="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap"
              style={{ ...styles.input, margin: 0 }}
            />
            <a
              href="https://fonts.google.com/"
              target="_blank"
              rel="noreferrer"
              style={styles.linkButton}
            >
              Google Fonts
            </a>
          </div>
          <div style={styles.helperText}>
            Google Fonts CSS URL, @import-Snippet oder Link-Snippet, z. B. https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap
          </div>
        </div>
      )}

      {source === 'external' && (
        <div style={styles.control}>
          <label style={styles.label}>Stylesheet URL</label>
          <input
            type="text"
            value={fontUrlValue || ''}
            onChange={(e) => onFontUrlChange(e.target.value)}
            placeholder="https://cdn.example.com/fonts/brand-font.css"
            style={styles.input}
          />
          <div style={styles.helperText}>
            Externe CSS-Datei mit @font-face oder gehostetem Font-Stylesheet.
          </div>
        </div>
      )}
    </div>
  );
}

const createStyles = (palette) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  control: {
    marginBottom: 0,
  },
  label: {
    display: 'block',
    fontSize: fs(14),
    fontWeight: '500',
    color: palette.text,
    marginBottom: '0.5rem',
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
  helperText: {
    marginTop: '0.45rem',
    fontSize: fs(11),
    color: palette.textDim,
    lineHeight: 1.5,
  },
  urlRow: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '0.6rem',
    alignItems: 'center',
  },
  linkButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    padding: '0 0.85rem',
    borderRadius: '8px',
    border: `1px solid ${palette.border}`,
    backgroundColor: palette.bgCard,
    color: palette.text,
    textDecoration: 'none',
    fontFamily: 'monospace',
    fontSize: fs(12),
    whiteSpace: 'nowrap',
  },
});

export default FontSourceField;
