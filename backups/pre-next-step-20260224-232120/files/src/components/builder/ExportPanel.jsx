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
import { zenPalette } from '../../styles/zenPalette';

const TYPO_SCALE = 0.8;
const fs = (px) => `${Math.round(px * TYPO_SCALE * 10) / 10}px`;

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
    backgroundColor: zenPalette.panel,
    borderRadius: '12px',
    border: `1px solid ${zenPalette.border}`,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
    maxHeight: '540px',
    overflowY: 'auto',
  },
  title: {
    fontSize: fs(18),
    fontWeight: '600',
    color: zenPalette.text,
    marginBottom: '1.5rem',
  },
  outputSelector: {
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: zenPalette.panelSoft,
    borderRadius: '8px',
  },
  selectorLabel: {
    display: 'block',
    fontSize: fs(14),
    fontWeight: '600',
    color: zenPalette.text,
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
    fontSize: fs(14),
    color: zenPalette.text,
    cursor: 'pointer',
  },
  selectorHint: {
    fontSize: fs(12),
    color: zenPalette.textMuted,
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
    backgroundColor: zenPalette.gold,
    color: '#121212',
    border: 'none',
    borderRadius: '8px',
    fontSize: fs(14),
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
    fontSize: fs(14),
    fontWeight: '600',
    color: zenPalette.text,
  },
  copyButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    backgroundColor: zenPalette.panelSoft,
    color: zenPalette.text,
    border: `1px solid ${zenPalette.border}`,
    borderRadius: '6px',
    fontSize: fs(12),
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  codeBlock: {
    padding: '1rem',
    backgroundColor: '#131316',
    color: '#e6dfd0',
    borderRadius: '8px',
    fontSize: fs(12),
    fontFamily: 'monospace',
    overflow: 'auto',
    maxHeight: '300px',
  },
  instructions: {
    padding: '1rem',
    backgroundColor: '#221f1a',
    borderRadius: '8px',
    borderLeft: `4px solid ${zenPalette.gold}`,
  },
  instructionsTitle: {
    fontSize: fs(14),
    fontWeight: '600',
    color: zenPalette.goldSoft,
    marginBottom: '0.75rem',
  },
  instructionsList: {
    fontSize: fs(13),
    color: zenPalette.text,
    paddingLeft: '1.5rem',
    lineHeight: '1.8',
  },
};

export default ExportPanel;
