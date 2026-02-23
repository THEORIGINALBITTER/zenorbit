import React from 'react';
import { getAllTemplates } from '../../templates/menuTemplates';

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
        {Object.entries(templates).map(([id, template]) => (
          <div
            key={id}
            style={styles.templateCard}
            onClick={() => onSelectTemplate(id)}
          >
            <div style={styles.templatePreview}>
              {/* Mini preview visualization */}
              <div style={styles.miniCircle}>
                {template.menuItems.slice(0, 4).map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      ...styles.miniDot,
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
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '0.5rem',
  },
  description: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '1.5rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
  },
  templateCard: {
    padding: '1.5rem',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
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
    border: '2px solid #e5e7eb',
    borderRadius: '50%',
  },
  miniDot: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '12px',
    height: '12px',
    backgroundColor: '#9ca3af',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
  },
  templateInfo: {
    textAlign: 'center',
  },
  templateName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '0.25rem',
  },
  templateDesc: {
    fontSize: '12px',
    color: '#6b7280',
    lineHeight: '1.4',
  },
};

export default TemplateSelector;
