import React, { useState } from 'react';
import { FiDownload, FiCopy, FiCheck, FiPackage } from 'react-icons/fi';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
  generateMenuConfig,
  generateReactComponent,
  generatePureCSS,
  generatePackageStructure,
  generateHTMLPackage,
} from '../../utils/codeGenerator';
import { useBuilderPalette } from './builderTheme';

const TYPO_SCALE = 0.8;
const fs = (px) => `${Math.round(px * TYPO_SCALE * 10) / 10}px`;

/**
 * Export Panel Component
 * Allows exporting the configuration in various formats
 */
function ExportPanel({ config, menuItems, accentColor }) {
  const [copied, setCopied] = useState(null);
  const [selectedOutput, setSelectedOutput] = useState('tailwind');
  const palette = useBuilderPalette();
  const styles = createStyles(palette);

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownloadZip = async () => {
    let files;
    let zipName;

    if (selectedOutput === 'html') {
      // Convert nested builder config → flat customizer config for generateHTMLPackage
      const flatConfig = {
        radius: config.visual?.radius ?? 100,
        menuOffset: 160,
        menuOffsetX: 32,
        buttonSize: config.visual?.button?.width ?? 64,
        logoText: 'B',
        logoType: 'text',
        logoImage: null,
        menuItemFontSize: 10,
        buttonBgColor: config.visual?.colors?.background ?? '#1a1a1a',
        buttonOutlineColor: accentColor ?? '#d0cbb8',
        buttonOutlineWidth: 1,
        menuItemBgColor: config.visual?.colors?.background ?? '#1a1a1a',
        menuItemTextColor: config.visual?.colors?.text ?? '#e8e3d7',
        menuItemOutlineColor: accentColor ?? '#d0cbb8',
        menuItemOutlineWidth: 1,
        logoStiffness: config.animation?.logo?.stiffness ?? 350,
        logoDamping: config.animation?.logo?.damping ?? 15,
        responsive: {
          desktop: { radius: config.visual?.radius ?? 100, buttonSize: config.visual?.button?.width ?? 64, menuItemFontSize: 10, menuOffset: 160, menuOffsetX: 32 },
          ipadPortrait: { radius: 80, buttonSize: 55, menuItemFontSize: 9, menuOffset: 160, menuOffsetX: 32 },
          ipadLandscape: { radius: 80, buttonSize: 55, menuItemFontSize: 9, menuOffset: 160, menuOffsetX: 32 },
          mobile: { radius: 74, buttonSize: 45, menuItemFontSize: 9, menuOffset: 88, menuOffsetX: 8 },
          breakpoints: { ipadPortraitMax: 1024, ipadLandscapeMax: 1366, mobileMax: 768 },
        },
      };
      files = generateHTMLPackage(flatConfig);
      zipName = 'ZenOrbit-menu-build.zip';
    } else {
      const packageName = '@yourcompany/custom-radial-menu';
      const useTailwind = selectedOutput === 'tailwind';
      files = generatePackageStructure(packageName, config, menuItems, accentColor, useTailwind);
      zipName = 'radial-menu-package.zip';
    }

    const zip = new JSZip();
    Object.entries(files).forEach(([path, content]) => {
      zip.file(path, content);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, zipName);
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
      <h3 style={styles.title}>Ship Your Signature</h3>

      {/* Output Type Selector */}
      <div style={styles.outputSelector}>
        <label style={styles.selectorLabel}>Export Mode</label>
        <div style={styles.radioGroup}>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              value="tailwind"
              checked={selectedOutput === 'tailwind'}
              onChange={() => setSelectedOutput('tailwind')}
            />
            Tailwind CSS (React + Tailwind Stack)
          </label>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              value="pure-css"
              checked={selectedOutput === 'pure-css'}
              onChange={() => setSelectedOutput('pure-css')}
            />
            Pure CSS (React + Pure CSS, ideal für Tauri)
          </label>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              value="html"
              checked={selectedOutput === 'html'}
              onChange={() => setSelectedOutput('html')}
            />
            HTML — Standalone Delivery (ohne Framework)
          </label>
        </div>
        <p style={styles.selectorHint}>
          {selectedOutput === 'tailwind'
            ? 'Für React-Produkte mit bestehendem Tailwind-Setup.'
            : selectedOutput === 'pure-css'
            ? 'Für produktionsnahe Umgebungen ohne Tailwind-Abhängigkeit.'
            : 'ZIP laden -> npm install -> npm run build -> orbit.iife.js in deine Seite einbinden.'}
        </p>
      </div>

      {/* Export Options */}
      <div style={styles.exportOptions}>
        <button onClick={handleDownloadZip} style={styles.exportButton}>
          <FiPackage size={18} />
          <span>
            <strong>Download Production Package</strong>
            <small>Vollständiges Delivery-ZIP für direkten Einsatz</small>
          </span>
        </button>
      </div>

      {/* Code Preview Sections */}
      <div style={styles.codeSection}>
        <div style={styles.codeSectionHeader}>
          <h4 style={styles.codeSectionTitle}>Signature Configuration (config.js)</h4>
          <button
            onClick={() => handleCopy(configCode, 'config')}
            style={styles.copyButton}
          >
            {copied === 'config' ? (
              <>
                <FiCheck size={14} /> Copied
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
            Signature Component ({selectedOutput === 'tailwind' ? 'Tailwind' : 'Pure CSS'})
          </h4>
          <button
            onClick={() => handleCopy(componentCode, 'component')}
            style={styles.copyButton}
          >
            {copied === 'component' ? (
              <>
                <FiCheck size={14} /> Copied
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
          <h4 style={styles.codeSectionTitle}>Visual Layer (RadialMenu.css)</h4>
            <button
              onClick={() => handleCopy(cssCode, 'css')}
              style={styles.copyButton}
            >
              {copied === 'css' ? (
                <>
                  <FiCheck size={14} /> Copied
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

      {/* Installation Hero */}
      <div style={styles.installHero}>
        <div style={styles.installHeroBadge}>Delivery Flow</div>
        <div style={styles.installHeroTitle}>
          {selectedOutput === 'html' ? 'Orbit delivery in 3 Schritten.' : 'Integration in 3 Schritten.'}
        </div>
        <div style={styles.installHeroSub}>
          {selectedOutput === 'html'
            ? 'Framework-unabhängig ausliefern: Build erzeugen, Script einbinden, Signature live schalten.'
            : 'Package integrieren, Komponente einbinden, Signature produktiv nutzen.'}
        </div>

        <div style={styles.installSteps}>
          {selectedOutput === 'html' ? (
            <>
              <div style={styles.installStep}>
                <div style={styles.installStepNum}>01</div>
                <div>
                  <div style={styles.installStepTitle}>Package vorbereiten</div>
                  <div style={styles.installStepDesc}>ZIP laden, entpacken, danach <code style={styles.inlineCode}>npm install</code> und <code style={styles.inlineCode}>npm run build</code> ausführen.</div>
                </div>
              </div>
              <div style={styles.installStepDivider}>→</div>
              <div style={styles.installStep}>
                <div style={styles.installStepNum}>02</div>
                <div>
                  <div style={styles.installStepTitle}>Bundle platzieren</div>
                  <div style={styles.installStepDesc}><code style={styles.inlineCode}>dist/orbit.iife.js</code> in deinen Projektordner kopieren — neben deine <code style={styles.inlineCode}>index.html</code>.</div>
                </div>
              </div>
              <div style={styles.installStepDivider}>→</div>
              <div style={styles.installStep}>
                <div style={styles.installStepNum}>03</div>
                <div>
                  <div style={styles.installStepTitle}>Runtime einbinden</div>
                  <div style={styles.installStepDesc}>Direkt vor <code style={styles.inlineCode}>&lt;/body&gt;</code> einfügen und live schalten.</div>
                  <pre style={styles.installCode}>{'<div id="orbit-root"></div>\n<script src="orbit.iife.js"></script>'}</pre>
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={styles.installStep}>
                <div style={styles.installStepNum}>01</div>
                <div>
                  <div style={styles.installStepTitle}>Package einchecken</div>
                  <div style={styles.installStepDesc}>ZIP entpacken und sauber in dein Projekt integrieren.</div>
                </div>
              </div>
              <div style={styles.installStepDivider}>→</div>
              <div style={styles.installStep}>
                <div style={styles.installStepNum}>02</div>
                <div>
                  <div style={styles.installStepTitle}>Signature importieren</div>
                  <div style={styles.installStepDesc}><code style={styles.inlineCode}>import CustomRadialMenu from './path'</code>{selectedOutput === 'pure-css' && <> + CSS-Import</>}</div>
                </div>
              </div>
              <div style={styles.installStepDivider}>→</div>
              <div style={styles.installStep}>
                <div style={styles.installStepNum}>03</div>
                <div>
                  <div style={styles.installStepTitle}>Live einsetzen</div>
                  <pre style={styles.installCode}>{'<CustomRadialMenu logoSrc="/logo.png" />'}</pre>
                </div>
              </div>
            </>
          )}
        </div>

        <div style={styles.installHint}>
          Die komplette Delivery-Dokumentation liegt als <code style={styles.inlineCode}>README.html</code> im ZIP.
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
  title: {
    fontSize: fs(18),
    fontWeight: '600',
    color: palette.text,
    marginBottom: '1.5rem',
  },
  outputSelector: {
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: palette.bgPanelSoft,
    borderRadius: '8px',
  },
  selectorLabel: {
    display: 'block',
    fontSize: fs(14),
    fontWeight: '600',
    color: palette.text,
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
    color: palette.text,
    cursor: 'pointer',
  },
  selectorHint: {
    fontSize: fs(12),
    color: palette.textDim,
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
    backgroundColor: palette.gold,
    color: palette.buttonText,
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
    color: palette.text,
  },
  copyButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    backgroundColor: palette.bgPanelSoft,
    color: palette.text,
    border: `1px solid ${palette.border}`,
    borderRadius: '6px',
    fontSize: fs(12),
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  codeBlock: {
    padding: '1rem',
    backgroundColor: palette.bgCode,
    color: palette.text,
    borderRadius: '8px',
    fontSize: fs(12),
    fontFamily: 'monospace',
    overflow: 'auto',
    maxHeight: '300px',
  },
  installHero: {
    marginTop: '1.5rem',
    padding: '1.25rem',
    backgroundColor: palette.bgCodeSoft,
    border: `1px solid ${palette.borderStrong}`,
    borderRadius: 12,
  },
  installHeroBadge: {
    display: 'inline-block',
    fontSize: fs(9),
    fontWeight: 700,
    color: palette.gold,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    border: `1px solid ${palette.borderAccent}`,
    borderRadius: 99,
    padding: '2px 10px',
    marginBottom: '0.5rem',
  },
  installHeroTitle: {
    fontSize: fs(18),
    fontWeight: 800,
    color: palette.text,
    marginBottom: '0.35rem',
    lineHeight: 1.2,
    fontFamily: '"IBM Plex Mono", monospace',
  },
  installHeroSub: {
    fontSize: fs(11),
    color: palette.textDim,
    lineHeight: 1.6,
    marginBottom: '1.2rem',
    maxWidth: 520,
  },
  installSteps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
  },
  installStep: {
    display: 'flex',
    gap: '0.9rem',
    alignItems: 'flex-start',
    backgroundColor: palette.bgPanelSoft,
    border: `1px solid ${palette.border}`,
    borderRadius: 10,
    padding: '0.75rem 0.9rem',
  },
  installStepNum: {
    flexShrink: 0,
    fontSize: fs(10),
    fontWeight: 800,
    color: palette.gold,
    letterSpacing: '0.06em',
    fontFamily: '"IBM Plex Mono", monospace',
    minWidth: 24,
    paddingTop: 2,
  },
  installStepTitle: {
    fontSize: fs(12),
    fontWeight: 700,
    color: palette.text,
    marginBottom: 3,
    fontFamily: '"IBM Plex Mono", monospace',
  },
  installStepDesc: {
    fontSize: fs(11),
    color: palette.textDim,
    lineHeight: 1.55,
  },
  installStepDivider: {
    fontSize: fs(12),
    color: palette.gold,
    paddingLeft: '0.6rem',
    opacity: 0.5,
  },
  installCode: {
    marginTop: 6,
    fontSize: fs(10),
    color: palette.goldBright,
    backgroundColor: palette.bgCodeInline,
    border: `1px solid ${palette.border}`,
    borderRadius: 6,
    padding: '0.45rem 0.6rem',
    fontFamily: '"IBM Plex Mono", monospace',
  },
  inlineCode: {
    backgroundColor: palette.bgCodeInline,
    color: palette.goldBright,
    padding: '1px 5px',
    borderRadius: 4,
    fontSize: fs(10),
    fontFamily: '"IBM Plex Mono", monospace',
  },
  installHint: {
    marginTop: '0.9rem',
    fontSize: fs(10),
    color: palette.textDim,
    lineHeight: 1.5,
  },
});

export default ExportPanel;
