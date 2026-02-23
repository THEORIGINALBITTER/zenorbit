import React, { useState } from 'react';
import LivePreview from '../components/builder/LivePreview';
import VisualEditor from '../components/builder/VisualEditor';
import MenuItemEditor from '../components/builder/MenuItemEditor';
import TemplateSelector from '../components/builder/TemplateSelector';
import ExportPanel from '../components/builder/ExportPanel';
import { menuTemplates } from '../templates/menuTemplates';
import { orbitMenuConfig } from '../config/orbitMenuConfig';

/**
 * Main App - Bitter Menu Builder
 * Visual builder and dashboard for creating custom radial menus
 */
function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState(orbitMenuConfig);
  const [menuItems, setMenuItems] = useState([
    { id: '1', label: 'Home', angle: 0, route: '/' },
    { id: '2', label: 'About', angle: -90, route: '/about' },
    { id: '3', label: 'Contact', angle: -180, route: '/contact' },
  ]);
  const [accentColor, setAccentColor] = useState('#AC8E66');
  const [logoSrc, setLogoSrc] = useState('');

  const handleTemplateSelect = (templateId) => {
    const template = menuTemplates[templateId];
    if (template) {
      setConfig({ ...orbitMenuConfig, ...template.config });
      setMenuItems(template.menuItems);
      setAccentColor(template.accentColor);
      setCurrentStep(2);
    }
  };

  const steps = [
    { id: 1, title: 'Choose Template', component: TemplateSelector },
    { id: 2, title: 'Customize Design', component: null },
    { id: 3, title: 'Export', component: ExportPanel },
  ];

  return (
    <div style={styles.app}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.logo}>
            <span style={styles.logoIcon}>⚡</span>
            Bitter Menu Builder
          </h1>
          <p style={styles.tagline}>
            Build beautiful radial menus visually - No code required
          </p>
        </div>
      </header>

      {/* Step Indicator */}
      <div style={styles.stepIndicator}>
        <div style={styles.stepIndicatorContent}>
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div
                style={{
                  ...styles.step,
                  ...(currentStep === step.id ? styles.stepActive : {}),
                  ...(currentStep > step.id ? styles.stepCompleted : {}),
                }}
                onClick={() => setCurrentStep(step.id)}
              >
                <div style={styles.stepNumber}>{step.id}</div>
                <div style={styles.stepTitle}>{step.title}</div>
              </div>
              {index < steps.length - 1 && <div style={styles.stepConnector} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main style={styles.main}>
        {currentStep === 1 && (
          <div style={styles.templateSection}>
            <TemplateSelector onSelectTemplate={handleTemplateSelect} />
            <button
              onClick={() => setCurrentStep(2)}
              style={styles.skipButton}
            >
              Skip & Start from Scratch
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div style={styles.builderSection}>
            {/* Left Panel - Preview */}
            <div style={styles.previewPanel}>
              <LivePreview
                config={config}
                menuItems={menuItems}
                accentColor={accentColor}
                logoSrc={logoSrc}
              />

              {/* Logo Upload */}
              <div style={styles.logoUpload}>
                <label style={styles.logoUploadLabel}>
                  Logo URL (optional)
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/logo.png"
                  value={logoSrc}
                  onChange={(e) => setLogoSrc(e.target.value)}
                  style={styles.logoUploadInput}
                />
              </div>
            </div>

            {/* Middle Panel - Visual Editor */}
            <div style={styles.editorPanel}>
              <VisualEditor
                config={config}
                onConfigChange={setConfig}
                accentColor={accentColor}
                onAccentColorChange={setAccentColor}
              />
            </div>

            {/* Right Panel - Menu Items */}
            <div style={styles.itemsPanel}>
              <MenuItemEditor
                menuItems={menuItems}
                onMenuItemsChange={setMenuItems}
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div style={styles.exportSection}>
            <ExportPanel
              config={config}
              menuItems={menuItems}
              accentColor={accentColor}
            />
          </div>
        )}
      </main>

      {/* Navigation Buttons */}
      {currentStep > 1 && (
        <div style={styles.navigation}>
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            style={styles.navButton}
          >
            ← Previous
          </button>
          {currentStep < 3 && (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              style={{ ...styles.navButton, ...styles.navButtonPrimary }}
            >
              Next →
            </button>
          )}
        </div>
      )}

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>
          Made with ❤️ by{' '}
          <a
            href="https://denisbitter.de"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.footerLink}
          >
            Denis Bitter
          </a>
        </p>
      </footer>
    </div>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#151515',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    padding: '1.5rem 2rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  logo: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  logoIcon: {
    fontSize: '32px',
  },
  tagline: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0.5rem 0 0 0',
  },
  stepIndicator: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    padding: '1.5rem 2rem',
  },
  stepIndicatorContent: {
    maxWidth: '800px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  step: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  stepActive: {
    backgroundColor: '#eff6ff',
  },
  stepCompleted: {
    opacity: 0.6,
  },
  stepNumber: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#e5e7eb',
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
  },
  stepTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  stepConnector: {
    width: '60px',
    height: '2px',
    backgroundColor: '#e5e7eb',
    margin: '0 1rem',
  },
  main: {
    flex: 1,
    padding: '2rem',
    maxWidth: '1400px',
    width: '100%',
    margin: '0 auto',
  },
  templateSection: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  skipButton: {
    display: 'block',
    margin: '2rem auto 0',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  builderSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '1.5rem',
  },
  previewPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  editorPanel: {},
  itemsPanel: {},
  logoUpload: {
    padding: '1rem',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  logoUploadLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.5rem',
  },
  logoUploadInput: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '14px',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  exportSection: {
    maxWidth: '1000px',
    margin: '0 auto',
  },
  navigation: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    padding: '2rem',
    borderTop: '1px solid #e5e7eb',
    backgroundColor: '#ffffff',
  },
  navButton: {
    padding: '0.75rem 2rem',
    fontSize: '14px',
    fontWeight: '500',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: '#ffffff',
    color: '#374151',
  },
  navButtonPrimary: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    borderColor: '#3b82f6',
  },
  footer: {
    padding: '1.5rem',
    textAlign: 'center',
    borderTop: '1px solid #e5e7eb',
    backgroundColor: '#ffffff',
  },
  footerText: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
  footerLink: {
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: '500',
  },
};

export default App;
