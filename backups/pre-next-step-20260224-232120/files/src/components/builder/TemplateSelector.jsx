import React from 'react';
import { getAllTemplates } from '../../templates/menuTemplates';
import { zenPalette } from '../../styles/zenPalette';

const TYPO_SCALE = 0.8;
const fs = (px) => `${Math.round(px * TYPO_SCALE * 10) / 10}px`;

/**
 * Template Library Component
 * Shows pre-built templates users can start from
 */
function TemplateSelector({ onSelectTemplate }) {
  const templates = getAllTemplates();

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Choose a Template</h3>
      <p style={styles.description}>
        Start with a pre-built design or create from scratch
      </p>

      <div style={styles.grid}>
        {templates.map((template) => (
          <div
            key={template.id}
            style={styles.templateCard}
            onClick={() => onSelectTemplate(template.id)}
          >
            <div style={styles.templatePreview}>
              {/* Mini preview visualization */}
              <div
                style={{
                  ...styles.miniCircle,
                  borderColor: template.config.visual.colors.border || zenPalette.border,
                }}
              >
                <div
                  style={{
                    ...styles.miniCenter,
                    width: `${Math.max(16, Math.round((template.config.visual.button.width || 60) / 4))}px`,
                    height: `${Math.max(16, Math.round((template.config.visual.button.width || 60) / 4))}px`,
                    backgroundColor: template.config.visual.colors.backgroundDark || zenPalette.panel,
                    borderColor: template.accentColor,
                    borderRadius: template.config.visual.button.borderRadius || '50%',
                  }}
                />
                {template.menuItems.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    style={{
                      ...styles.miniDot,
                      backgroundColor: template.accentColor,
                      borderRadius: template.config.visual.menuItem?.borderRadius || '50%',
                      transform: `rotate(${item.angle}deg) translateY(-30px)`,
                    }}
                  />
                ))}
              </div>
            </div>
            <div style={styles.templateInfo}>
              <h4 style={styles.templateName}>{template.name}</h4>
              <p style={styles.templateDesc}>{template.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '1.5rem',
    backgroundColor: zenPalette.panel,
    borderRadius: '12px',
    border: `1px solid ${zenPalette.border}`,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
  },
  title: {
    fontSize: fs(18),
    fontWeight: '600',
    color: zenPalette.text,
    marginBottom: '0.5rem',
  },
  description: {
    fontSize: fs(14),
    color: zenPalette.textMuted,
    marginBottom: '1.5rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
  },
  templateCard: {
    padding: '1.5rem',
    backgroundColor: zenPalette.panelSoft,
    borderRadius: '8px',
    border: `2px solid ${zenPalette.border}`,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  templatePreview: {
    position: 'relative',
    width: '80px',
    height: '80px',
    margin: '0 auto 1rem',
  },
  miniCircle: {
    position: 'relative',
    width: '100%',
    height: '100%',
    border: `2px solid ${zenPalette.border}`,
    borderRadius: '50%',
  },
  miniDot: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '12px',
    height: '12px',
    backgroundColor: zenPalette.gold,
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
  },
  miniCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    border: '1px solid',
  },
  templateInfo: {
    textAlign: 'center',
  },
  templateName: {
    fontSize: fs(14),
    fontWeight: '600',
    color: zenPalette.text,
    marginBottom: '0.25rem',
  },
  templateDesc: {
    fontSize: fs(12),
    color: zenPalette.textMuted,
    lineHeight: '1.4',
  },
};

export default TemplateSelector;
