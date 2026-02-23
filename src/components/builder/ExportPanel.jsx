import React, { useState } from 'react';
import { FiDownload, FiCopy, FiCheck, FiPackage } from 'react-icons/fi';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
  generateMenuConfig,
  generateReactComponent,
  generatePureCSS,
  generatePackageStructure,
} from '../../utils/codeGenerator';

/**
 * Export Panel Component
 * Allows exporting the configuration in various formats
 */
function ExportPanel({ config, menuItems, accentColor }) {
  const [copied, setCopied] = useState(null);
  const [selectedOutput, setSelectedOutput] = useState('tailwind');

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownloadZip = async () => {
    const packageName = '@yourcompany/custom-radial-menu';
    const useTailwind = selectedOutput === 'tailwind';

    const files = generatePackageStructure(
      packageName,
      config,
      menuItems,
      accentColor,
      useTailwind
    );

    const zip = new JSZip();

    Object.entries(files).forEach(([path, content]) => {
      zip.file(path, content);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'radial-menu-package.zip');
  };

  const configCode = generateMenuConfig(config, menuItems, accentColor);
  const componentCode = generateReactComponent(
    config,
    menuItems,
    accentColor,
    selectedOutput === 'tailwind'
  );
  const cssCode = selectedOutput === 'pure-css' ? generatePureCSS(config, accentColor) : null;

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Export Your Menu</h3>

      {/* Output Type Selector */}
      <div style={styles.outputSelector}>
        <label style={styles.selectorLabel}>Output Type:</label>
        <div style={styles.radioGroup}>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              value="tailwind"
              checked={selectedOutput === 'tailwind'}
              onChange={() => setSelectedOutput('tailwind')}
            />
            Tailwind CSS (React + Tailwind)
          </label>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              value="pure-css"
              checked={selectedOutput === 'pure-css'}
              onChange={() => setSelectedOutput('pure-css')}
            />
            Pure CSS (React + Pure CSS - for Tauri)
          </label>
        </div>
        <p style={styles.selectorHint}>
          {selectedOutput === 'tailwind'
            ? 'Best for standard React apps with Tailwind CSS'
            : 'Best for Tauri apps or projects without Tailwind'}
        </p>
      </div>

      {/* Export Options */}
      <div style={styles.exportOptions}>
        <button onClick={handleDownloadZip} style={styles.exportButton}>
          <FiPackage size={18} />
          <span>
            <strong>Download Complete Package</strong>
            <small>ZIP file with all files ready to use</small>
          </span>
        </button>
      </div>

      {/* Code Preview Sections */}
      <div style={styles.codeSection}>
        <div style={styles.codeSectionHeader}>
          <h4 style={styles.codeSectionTitle}>Configuration (config.js)</h4>
          <button
            onClick={() => handleCopy(configCode, 'config')}
            style={styles.copyButton}
          >
            {copied === 'config' ? (
              <>
                <FiCheck size={14} /> Copied!
              </>
            ) : (
              <>
                <FiCopy size={14} /> Copy
              </>
            )}
          </button>
        </div>
        <pre style={styles.codeBlock}>
          <code>{configCode}</code>
        </pre>
      </div>

      <div style={styles.codeSection}>
        <div style={styles.codeSectionHeader}>
          <h4 style={styles.codeSectionTitle}>
            React Component ({selectedOutput === 'tailwind' ? 'Tailwind' : 'Pure CSS'})
          </h4>
          <button
            onClick={() => handleCopy(componentCode, 'component')}
            style={styles.copyButton}
          >
            {copied === 'component' ? (
              <>
                <FiCheck size={14} /> Copied!
              </>
            ) : (
              <>
                <FiCopy size={14} /> Copy
              </>
            )}
          </button>
        </div>
        <pre style={styles.codeBlock}>
          <code>{componentCode}</code>
        </pre>
      </div>

      {cssCode && (
        <div style={styles.codeSection}>
          <div style={styles.codeSectionHeader}>
            <h4 style={styles.codeSectionTitle}>CSS (RadialMenu.css)</h4>
            <button
              onClick={() => handleCopy(cssCode, 'css')}
              style={styles.copyButton}
            >
              {copied === 'css' ? (
                <>
                  <FiCheck size={14} /> Copied!
                </>
              ) : (
                <>
                  <FiCopy size={14} /> Copy
                </>
              )}
            </button>
          </div>
          <pre style={styles.codeBlock}>
            <code>{cssCode}</code>
          </pre>
        </div>
      )}

      {/* Installation Instructions */}
      <div style={styles.instructions}>
        <h4 style={styles.instructionsTitle}>Installation Instructions</h4>
        <ol style={styles.instructionsList}>
          <li>Download the complete package (ZIP file)</li>
          <li>Extract the files into your project</li>
          {selectedOutput === 'tailwind' ? (
            <li>Make sure Tailwind CSS is configured in your project</li>
          ) : (
            <li>Import the CSS file in your component</li>
          )}
          <li>Import and use the component: <code>import CustomRadialMenu from './path'</code></li>
          <li>Pass your logo: <code>&lt;CustomRadialMenu logoSrc="/logo.png" /&gt;</code></li>
        </ol>
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
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '1.5rem',
  },
  outputSelector: {
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
  },
  selectorLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.75rem',
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '14px',
    color: '#374151',
    cursor: 'pointer',
  },
  selectorHint: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '0.5rem',
    fontStyle: 'italic',
  },
  exportOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  exportButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    textAlign: 'left',
  },
  codeSection: {
    marginBottom: '1.5rem',
  },
  codeSectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  codeSectionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
  },
  copyButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  codeBlock: {
    padding: '1rem',
    backgroundColor: '#1f2937',
    color: '#f9fafb',
    borderRadius: '8px',
    fontSize: '12px',
    fontFamily: 'monospace',
    overflow: 'auto',
    maxHeight: '300px',
  },
  instructions: {
    padding: '1rem',
    backgroundColor: '#eff6ff',
    borderRadius: '8px',
    borderLeft: '4px solid #3b82f6',
  },
  instructionsTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: '0.75rem',
  },
  instructionsList: {
    fontSize: '13px',
    color: '#1e3a8a',
    paddingLeft: '1.5rem',
    lineHeight: '1.8',
  },
};

export default ExportPanel;
