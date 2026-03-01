import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import LivePreview from '../components/builder/LivePreview';
import VisualEditor from '../components/builder/VisualEditor';
import MenuItemEditor from '../components/builder/MenuItemEditor';
import TemplateSelector from '../components/builder/TemplateSelector';
import ExportPanel from '../components/builder/ExportPanel';
import SeoHelmet from '../components/seo/SeoHelmet';
import { menuTemplates } from '../templates/menuTemplates';
import { orbitMenuConfig } from '../config/orbitMenuConfig';
import { zenPalette } from '../styles/zenPalette';
import { generateMenuFromDescription } from '../orbify-ai/services/menuGenerator';
import {
  AI_PROVIDERS,
  getAISettings,
  isAIConfigured,
  resetAISettings,
  updateAISettings,
} from '../orbify-ai/services/aiService';

const CUSTOMIZER_TRANSFER_KEY = 'customizerTransfer_v1';

const AccordionSection = ({ title, badge, isOpen, onToggle, children }) => (
  <div style={{
    backgroundColor: zenPalette.panel,
    border: `1px solid ${isOpen ? zenPalette.borderStrong : zenPalette.border}`,
    borderRadius: 8,
    overflow: 'hidden',
  }}>
    <button
      onClick={onToggle}
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.55rem 0.75rem',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: isOpen ? zenPalette.gold : zenPalette.textMuted,
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {title}
        {badge !== undefined && (
          <span style={{
            fontSize: 9,
            padding: '1px 6px',
            backgroundColor: zenPalette.gold + '22',
            color: zenPalette.gold,
            borderRadius: 99,
            fontWeight: 700,
          }}>{badge}</span>
        )}
      </span>
      <span style={{ fontSize: 12, transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', lineHeight: 1 }}>▾</span>
    </button>
    {isOpen && (
      <div style={{ padding: '0.65rem 0.75rem', borderTop: `1px solid ${zenPalette.border}` }}>
        {children}
      </div>
    )}
  </div>
);

const TYPO_SCALE = 0.72;
const fs = (px) => `${Math.round(px * TYPO_SCALE * 10) / 10}px`;

const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

const deepMerge = (base, override) => {
  if (!isObject(base)) return override;
  const result = { ...base };

  Object.keys(override || {}).forEach((key) => {
    const baseValue = base[key];
    const overrideValue = override[key];

    if (isObject(baseValue) && isObject(overrideValue)) {
      result[key] = deepMerge(baseValue, overrideValue);
    } else {
      result[key] = overrideValue;
    }
  });

  return result;
};

const isHexColor = (value) => /^#([0-9A-Fa-f]{6})$/.test(value || '');

const normalizeAIMenuItems = (items = []) => {
  const valid = items.filter((item) => item && typeof item === 'object');
  if (valid.length === 0) return [];

  const total = Math.min(valid.length, 6);
  return valid.slice(0, total).map((item, index) => ({
    id: item.id ? String(item.id) : `ai-${Date.now()}-${index}`,
    label: String(item.label || `Item ${index + 1}`).slice(0, 16),
    angle: typeof item.angle === 'number' ? item.angle : 0 - (180 / Math.max(total - 1, 1)) * index,
    route: item.route || `/${String(item.label || `item-${index + 1}`).toLowerCase().replace(/\s+/g, '-')}`,
  }));
};

/**
 * Main App - Bitter Menu Builder
 * Visual builder and dashboard for creating custom radial menus
 */
function App() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState(orbitMenuConfig);
  const [menuItems, setMenuItems] = useState([
    { id: '1', label: 'Home', angle: 0, route: '/' },
    { id: '2', label: 'About', angle: -90, route: '/about' },
    { id: '3', label: 'Contact', angle: -180, route: '/contact' },
  ]);
  const [accentColor, setAccentColor] = useState('#AC8E66');
  const [logoSrc, setLogoSrc] = useState('');
  const [logoDraft, setLogoDraft] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('default');
  const [pendingTemplateId, setPendingTemplateId] = useState(null);
  const [autoOpenSignal, setAutoOpenSignal] = useState(0);
  const [openPanels, setOpenPanels] = useState({ template: true, logo: false, design: false, items: false });
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiInfo, setAiInfo] = useState('');
  const [aiSettings, setAiSettings] = useState(() => getAISettings());
  const [showAISettings, setShowAISettings] = useState(false);
  const [isMobileLayout, setIsMobileLayout] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const normalizedLogoDraft = logoDraft.trim();
  const normalizedLogoSrc = (logoSrc || '').trim();
  const hasPendingLogoApply = normalizedLogoDraft.length > 0 && normalizedLogoDraft !== normalizedLogoSrc;

  useEffect(() => {
    const onResize = () => setIsMobileLayout(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    setLogoDraft(logoSrc);
  }, [logoSrc]);

  const togglePanel = (key) => {
    setOpenPanels((prev) => {
      const opening = !prev[key];
      if (opening) setAutoOpenSignal((s) => s + 1);
      return { template: false, logo: false, design: false, items: false, [key]: opening };
    });
  };

  const handleTemplateSelect = (templateId) => {
    const template = menuTemplates[templateId];
    if (template) {
      setConfig(deepMerge(orbitMenuConfig, template.config));
      setMenuItems(template.menuItems);
      setAccentColor(template.accentColor);
      setSelectedTemplateId(templateId);
      setCurrentStep(2);
    }
  };

  const applyAIGeneratedMenu = async () => {
    const prompt = aiPrompt.trim();
    if (!prompt) {
      setAiError('Bitte beschreibe zuerst dein Menü.');
      return;
    }

    if (!isAIConfigured()) {
      setAiError('AI ist nicht konfiguriert. Setze VITE_AI_API_KEY in deiner .env.local.');
      return;
    }

    setAiLoading(true);
    setAiError('');
    setAiInfo('');

    const result = await generateMenuFromDescription(prompt, {
      websiteType: 'general',
      maxItems: 6,
      includeSubmenus: false,
    });

    setAiLoading(false);

    if (!result.success) {
      setAiError(result.error || 'Generierung fehlgeschlagen.');
      return;
    }

    const generated = normalizeAIMenuItems(result.menu?.menuItems || []);
    if (generated.length === 0) {
      setAiError('Die KI hat keine nutzbaren Menüeinträge geliefert.');
      return;
    }

    setMenuItems(generated);
    setCurrentStep(2);
    setAiInfo(`KI-Menü angewendet (${generated.length} Items).`);

    const paletteCandidate = result.menu?.suggestions?.accentColor
      || result.menu?.suggestions?.primaryColor
      || result.menu?.colors?.primary
      || '';

    if (isHexColor(paletteCandidate)) {
      setAccentColor(paletteCandidate);
    }
  };

  const onProviderChange = (provider) => {
    const next = resetAISettings(provider);
    setAiSettings(next);
    setAiInfo(`Provider gewechselt: ${provider}`);
    setAiError('');
  };

  const onSettingChange = (key, value) => {
    const next = updateAISettings({ [key]: value });
    setAiSettings(next);
    setAiError('');
  };

  const applyTemplateStyleById = (templateId) => {
    const template = menuTemplates[templateId];
    if (!template) return;

    setConfig(deepMerge(orbitMenuConfig, template.config));
    setAccentColor(template.accentColor);
    setAutoOpenSignal((prev) => prev + 1);
  };

  const onQuickTemplateChange = (templateId) => {
    setSelectedTemplateId(templateId);
    applyTemplateStyleById(templateId); // immediate visual feedback
    setPendingTemplateId(templateId);
  };

  const confirmTemplateMode = (mode) => {
    const template = menuTemplates[pendingTemplateId || selectedTemplateId];
    if (!template) {
      setPendingTemplateId(null);
      return;
    }

    if (mode === 'full') {
      setMenuItems(template.menuItems);
    }

    setPendingTemplateId(null);
  };

  const applyLogoDraft = () => {
    setLogoSrc(logoDraft.trim());
  };

  const openInCustomizer = () => {
    const transfer = {
      radius: config.visual.radius,
      menuOffset: config.visual.menuOffset,
      buttonSize: config.visual.button?.width || 64,
      logoStiffness: config.animation.logo.stiffness,
      logoDamping: config.animation.logo.damping,
      accentColor,
      logoSrc: logoSrc || '',
      menuItems: menuItems.map(item => ({
        id: item.id,
        angle: item.angle || 0,
        label: item.label,
        action: item.route ? 'route' : 'openOverlay',
        route: item.route || '',
      })),
    };
    localStorage.setItem(CUSTOMIZER_TRANSFER_KEY, JSON.stringify(transfer));
    navigate('/customizer');
  };

  const steps = [
    { id: 1, title: 'Choose Template', component: TemplateSelector },
    { id: 2, title: 'Customize Design', component: null },
    { id: 3, title: 'Export', component: ExportPanel },
  ];

  const navInlineSlot = typeof document !== 'undefined'
    ? document.getElementById('zo-nav-inline-slot')
    : null;

  const stepIndicatorRow = (
    <div style={{
      ...styles.stepIndicatorRow,
      ...(isMobileLayout ? styles.stepIndicatorRowMobile : {}),
      ...(navInlineSlot && !isMobileLayout ? styles.stepIndicatorRowInline : {}),
    }}>
      <div style={{ ...styles.stepIndicatorContent, ...(isMobileLayout ? { flex: 1 } : {}) }}>
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div
              style={{
                ...styles.step,
                ...(isMobileLayout ? styles.stepMobile : {}),
                ...(navInlineSlot && !isMobileLayout ? styles.stepInline : {}),
                ...(currentStep === step.id ? styles.stepActive : {}),
                ...(currentStep > step.id ? styles.stepCompleted : {}),
              }}
              onClick={() => setCurrentStep(step.id)}
            >
              <div
                style={{
                  ...styles.stepNumber,
                  ...(isMobileLayout ? styles.stepNumberMobile : {}),
                  ...(navInlineSlot && !isMobileLayout ? styles.stepNumberInline : {}),
                  ...(currentStep === step.id ? styles.stepNumberActive : {}),
                }}
              >
                {step.id}
              </div>
              {(!isMobileLayout || currentStep === step.id) && (
                <div
                  style={{
                    ...styles.stepTitle,
                    ...(isMobileLayout ? styles.stepTitleMobile : {}),
                    ...(navInlineSlot && !isMobileLayout ? styles.stepTitleInline : {}),
                    ...(currentStep === step.id ? styles.stepTitleActive : {}),
                  }}
                >
                  {step.title}
                </div>
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                style={{
                  ...styles.stepConnector,
                  ...(isMobileLayout ? styles.stepConnectorMobile : {}),
                  ...(navInlineSlot && !isMobileLayout ? styles.stepConnectorInline : {}),
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        {!isMobileLayout && currentStep >= 2 && (
          <button
            type="button"
            onClick={openInCustomizer}
            aria-label="Aktuelle Konfiguration im Customizer weiter bearbeiten"
            title="Aktuelle Konfiguration im Customizer öffnen"
            style={{
              padding: isMobileLayout ? '0.45rem 0.6rem' : '0.45rem 0.8rem',
              background: `linear-gradient(135deg, ${zenPalette.gold}1a, ${zenPalette.gold}0a)`,
              color: '#f4e5cb',
              border: `1px solid ${zenPalette.gold}88`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: fs(navInlineSlot && !isMobileLayout ? 10 : 12),
              fontWeight: 700,
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
              boxShadow: `0 0 0 1px ${zenPalette.gold}22 inset`,
              transition: 'background-color 0.2s, border-color 0.2s, transform 0.2s, box-shadow 0.2s',
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = `linear-gradient(135deg, ${zenPalette.gold}30, ${zenPalette.gold}14)`;
              e.currentTarget.style.borderColor = zenPalette.gold;
              e.currentTarget.style.boxShadow = `0 0 0 1px ${zenPalette.gold}55 inset, 0 8px 22px ${zenPalette.gold}1a`;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = `linear-gradient(135deg, ${zenPalette.gold}1a, ${zenPalette.gold}0a)`;
              e.currentTarget.style.borderColor = zenPalette.gold + '88';
              e.currentTarget.style.boxShadow = `0 0 0 1px ${zenPalette.gold}22 inset`;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {isMobileLayout ? '✦ →' : '✦ Im Customizer weiter bearbeiten →'}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div style={styles.app}>
      <SeoHelmet
        title="Builder"
        description="Erstelle dein Orbit-Menü in 3 Schritten: Template wählen, Design anpassen und React-Code exportieren."
        path="/builder"
        keywords="ZenOrbit Builder, React Menu Generator, Orbit Menü erstellen, UI Builder"
      />
      {!isMobileLayout && navInlineSlot && createPortal(stepIndicatorRow, navInlineSlot)}
      {(isMobileLayout || !navInlineSlot) && (
        <div style={{ ...styles.stepIndicator, ...(isMobileLayout ? styles.stepIndicatorMobile : {}) }}>
          {stepIndicatorRow}
          {isMobileLayout && currentStep >= 2 && (
            <button
              type="button"
              onClick={openInCustomizer}
              aria-label="Aktuelle Konfiguration im Customizer weiter bearbeiten"
              title="Aktuelle Konfiguration im Customizer öffnen"
              style={styles.mobileCustomizerBtn}
            >
              ✦ Im Customizer weiter bearbeiten →
            </button>
          )}
        </div>
      )}

      {/* Main Content */}
      <main style={styles.main}>
        {currentStep === 1 && (
          <div style={styles.templateSection}>
            <TemplateSelector onSelectTemplate={handleTemplateSelect} />
            <div style={styles.aiGeneratorCard}>
              <div style={styles.aiGeneratorTitle}>AI-Generator</div>
              <p style={styles.aiGeneratorText}>
                Beschreib dein Menü auf Deutsch, die KI erstellt Struktur und optional Farben.
              </p>
              <button
                type="button"
                onClick={() => setShowAISettings((prev) => !prev)}
                style={styles.aiSettingsToggle}
              >
                {showAISettings ? 'AI-Provider ausblenden' : 'AI-Provider konfigurieren'}
              </button>
              {showAISettings && (
                <div style={styles.aiSettingsCard}>
                  <label style={styles.aiFieldLabel}>Provider</label>
                  <select
                    value={aiSettings.provider}
                    onChange={(e) => onProviderChange(e.target.value)}
                    style={styles.aiFieldInput}
                  >
                    <option value={AI_PROVIDERS.ANTHROPIC}>Claude (Anthropic)</option>
                    <option value={AI_PROVIDERS.OPENAI}>OpenAI</option>
                    <option value={AI_PROVIDERS.OLLAMA}>Ollama (lokal)</option>
                    <option value={AI_PROVIDERS.CUSTOM}>Custom API</option>
                  </select>

                  <label style={styles.aiFieldLabel}>Endpoint</label>
                  <input
                    value={aiSettings.endpoint || ''}
                    onChange={(e) => onSettingChange('endpoint', e.target.value)}
                    style={styles.aiFieldInput}
                    placeholder="https://..."
                  />

                  <label style={styles.aiFieldLabel}>Model</label>
                  <input
                    value={aiSettings.model || ''}
                    onChange={(e) => onSettingChange('model', e.target.value)}
                    style={styles.aiFieldInput}
                    placeholder="z. B. claude-3-5-sonnet-20241022"
                  />

                  {aiSettings.provider !== AI_PROVIDERS.OLLAMA && (
                    <>
                      <label style={styles.aiFieldLabel}>API Key</label>
                      <input
                        type="password"
                        value={aiSettings.apiKey || ''}
                        onChange={(e) => onSettingChange('apiKey', e.target.value)}
                        style={styles.aiFieldInput}
                        placeholder="sk-..."
                      />
                    </>
                  )}

                  {aiSettings.provider === AI_PROVIDERS.CUSTOM && (
                    <>
                      <label style={styles.aiFieldLabel}>API Style</label>
                      <select
                        value={aiSettings.apiStyle || 'openai-compatible'}
                        onChange={(e) => onSettingChange('apiStyle', e.target.value)}
                        style={styles.aiFieldInput}
                      >
                        <option value="openai-compatible">OpenAI-kompatibel</option>
                        <option value="anthropic">Anthropic</option>
                      </select>
                    </>
                  )}

                  <p style={styles.aiSettingsHint}>
                    Tipp fuer Ollama: `ollama serve` laufen lassen. Falls Browser-Blocker kommt, `OLLAMA_ORIGINS=*` setzen.
                  </p>
                </div>
              )}
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Beispiel: Ich brauche ein Menü für eine Coaching-Website mit Start, Leistungen, Über mich, Blog und Kontakt."
                style={styles.aiTextarea}
              />
              <div style={styles.aiActions}>
                <button
                  type="button"
                  onClick={applyAIGeneratedMenu}
                  disabled={aiLoading}
                  style={{ ...styles.aiGenerateButton, ...(aiLoading ? styles.aiGenerateButtonDisabled : {}) }}
                >
                  {aiLoading ? 'Generiert...' : 'Mit KI generieren'}
                </button>
              </div>
              {aiError ? <p style={styles.aiError}>{aiError}</p> : null}
              {aiInfo ? <p style={styles.aiInfo}>{aiInfo}</p> : null}
            </div>
            <button
              onClick={() => setCurrentStep(2)}
              style={styles.skipButton}
            >
              Skip & Start from Scratch
            </button>
          </div>
        )}

            {currentStep === 2 && (
              <>
                <div style={{
                  display: 'flex',
                  flexDirection: isMobileLayout ? 'column' : 'row',
                  gap: '0.75rem',
                  alignItems: isMobileLayout ? 'stretch' : 'flex-start',
                }}>
                  {/* Preview — oben (mobile) / links sticky (desktop) */}
                  <div style={{
                    flex: isMobileLayout ? 'none' : 1,
                    position: isMobileLayout ? 'relative' : 'sticky',
                    top: isMobileLayout ? undefined : 80,
                    height: isMobileLayout ? 300 : undefined,
                    minHeight: isMobileLayout ? undefined : 'calc(100vh - 120px)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}>
                    <LivePreview
                      config={config}
                      menuItems={menuItems}
                      accentColor={accentColor}
                      logoSrc={logoDraft}
                      autoOpenSignal={autoOpenSignal}
                    />
                  </div>

                  {/* Accordion Controls — unten (mobile) / rechts (desktop) */}
                  <div style={{
                    width: isMobileLayout ? '100%' : 360,
                    flexShrink: 0,
                    position: isMobileLayout ? 'static' : 'sticky',
                    top: isMobileLayout ? undefined : 80,
                    height: isMobileLayout ? undefined : 'calc(100vh - 120px)',
                    overflowY: isMobileLayout ? undefined : 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}>
                    {/* Template */}
                    <AccordionSection title="Template" isOpen={openPanels.template} onToggle={() => togglePanel('template')}>
                      <label style={styles.templateQuickLabel}>Vorlage</label>
                      <select
                        value={selectedTemplateId}
                        onChange={(e) => onQuickTemplateChange(e.target.value)}
                        style={{ ...styles.templateQuickSelect, marginTop: 4 }}
                      >
                        {Object.entries(menuTemplates).map(([id, template]) => (
                          <option key={id} value={id}>{template.name}</option>
                        ))}
                      </select>
                      <p style={{ ...styles.templateQuickHint, marginTop: 6 }}>
                        Style wird sofort angewendet. Danach optional komplett übernehmen.
                      </p>
                      {pendingTemplateId && (
                        <div style={{ ...styles.templateApplyPanel, marginTop: 8 }}>
                          <p style={styles.templateApplyText}>
                            Template-Vorschau aktiv: Nur Style oder komplett übernehmen?
                          </p>
                          <div style={styles.templateApplyActions}>
                            <button type="button" style={styles.templateApplyGhost} onClick={() => confirmTemplateMode('style')}>
                              Nur Style
                            </button>
                            <button type="button" style={styles.templateApplyPrimary} onClick={() => confirmTemplateMode('full')}>
                              Komplett
                            </button>
                          </div>
                        </div>
                      )}
                    </AccordionSection>

                    {/* Logo */}
                    <AccordionSection title="Logo" isOpen={openPanels.logo} onToggle={() => togglePanel('logo')}>
                      <label style={styles.templateQuickLabel}>Logo URL (optional)</label>
                      <input
                        type="text"
                        placeholder="https://example.com/logo.png"
                        value={logoDraft}
                        onChange={(e) => {
                          const nextValue = e.target.value;
                          setLogoDraft(nextValue);
                          if (nextValue.trim() === '') setLogoSrc('');
                        }}
                        style={{ ...styles.templateQuickSelect, marginTop: 4 }}
                      />
                      <p style={{ ...styles.templateQuickHint, marginTop: 6 }}>
                        Logo wird live in der Preview angezeigt.
                      </p>
                      {hasPendingLogoApply && (
                        <div style={{ ...styles.templateApplyPanel, marginTop: 8 }}>
                          <p style={styles.templateApplyText}>Logo-Vorschau aktiv. Wenn es passt, übernehmen.</p>
                          <button type="button" style={styles.templateApplyPrimary} onClick={applyLogoDraft}>
                            Logo übernehmen
                          </button>
                        </div>
                      )}
                    </AccordionSection>

                    {/* Design */}
                    <AccordionSection title="Design" isOpen={openPanels.design} onToggle={() => togglePanel('design')}>
                      <VisualEditor
                        config={config}
                        onConfigChange={setConfig}
                        accentColor={accentColor}
                        onAccentColorChange={setAccentColor}
                        logoSrc={logoSrc}
                        onLogoSrcChange={null}
                        hideHeader
                      />
                    </AccordionSection>

                    {/* Menu Items */}
                    <AccordionSection title="Menu Items" badge={menuItems.length} isOpen={openPanels.items} onToggle={() => togglePanel('items')}>
                      <MenuItemEditor
                        menuItems={menuItems}
                        onMenuItemsChange={setMenuItems}
                      />
                    </AccordionSection>
                  </div>
                </div>
              </>
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

    </div>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: zenPalette.bg,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    backgroundColor: zenPalette.bgMuted,
    borderBottom: `1px solid ${zenPalette.border}`,
    padding: '1.5rem 2rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.35)',
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  logo: {
    fontSize: fs(28),
    fontWeight: '700',
    color: zenPalette.text,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  logoImage: {
    width: '34px',
    height: '34px',
    objectFit: 'contain',
  },
  tagline: {
    fontSize: fs(14),
    color: zenPalette.textMuted,
    margin: '0.5rem 0 0 calc(34px + 0.5rem)',
  },
  stepIndicator: {
    backgroundColor: zenPalette.bgMuted,
    borderBottom: `1px solid ${zenPalette.border}`,
    padding: '1.15rem 1.5rem',
  },
  stepIndicatorMobile: {
    backgroundColor: zenPalette.bgMuted,
    borderBottom: 'none',
    padding: '0.5rem 0.7rem 0.4rem',
  },
  stepIndicatorRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '1100px',
    margin: '0 auto',
    gap: '1rem',
  },
  stepIndicatorRowMobile: {
    backgroundColor: '#13151d',
    border: `1px solid ${zenPalette.border}`,
    borderRadius: 14,
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
    padding: '0.55rem 0.65rem',
    gap: '0.5rem',
  },
  stepIndicatorRowInline: {
    maxWidth: 'none',
    margin: 0,
    gap: '0.75rem',
  },
  stepIndicatorContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
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
    backgroundColor: zenPalette.gold,
    border: `1px solid ${zenPalette.gold}`,
  },
  stepCompleted: {
    opacity: 0.6,
  },
  stepNumber: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: zenPalette.panelSoft,
    color: zenPalette.textMuted,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: fs(14),
    fontWeight: '600',
  },
  stepNumberActive: {
    backgroundColor: '#121212',
    color: zenPalette.gold,
  },
  stepTitle: {
    fontSize: fs(14),
    fontWeight: '500',
    color: zenPalette.text,
  },
  stepTitleActive: {
    color: '#121212',
    fontWeight: '700',
  },
  stepConnector: {
    width: '60px',
    height: '2px',
    backgroundColor: zenPalette.border,
    margin: '0 1rem',
  },
  stepConnectorMobile: {
    flex: 0,
    flexShrink: 0,
    width: '20px',
    margin: '0 0.2rem',
  },
  stepConnectorInline: {
    width: '34px',
    margin: '0 0.25rem',
  },
  stepInline: {
    padding: '0.3rem 0.55rem',
    gap: '0.35rem',
  },
  stepNumberInline: {
    width: '22px',
    height: '22px',
    fontSize: fs(10),
  },
  stepTitleInline: {
    fontSize: fs(10),
  },
  stepMobile: {
    flex: 1,
    justifyContent: 'center',
    padding: '0.34rem 0.5rem',
    gap: '0.4rem',
    borderRadius: 10,
  },
  stepNumberMobile: {
    width: '24px',
    height: '24px',
    fontSize: fs(11),
  },
  stepTitleMobile: {
    fontSize: fs(10),
  },
  main: {
    flex: 1,
    padding: '0.75rem',
    maxWidth: '1100px',
    width: '100%',
    margin: '0 auto',
  },
  templateSection: {
    maxWidth: '820px',
    margin: '0 auto',
  },
  aiGeneratorCard: {
    marginTop: '1rem',
    backgroundColor: zenPalette.panel,
    border: `1px solid ${zenPalette.border}`,
    borderRadius: 12,
    padding: '0.9rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.55rem',
  },
  aiGeneratorTitle: {
    fontSize: fs(13),
    fontWeight: 700,
    color: zenPalette.gold,
    fontFamily: '"IBM Plex Mono", monospace',
    letterSpacing: '0.03em',
    textTransform: 'uppercase',
  },
  aiGeneratorText: {
    margin: 0,
    color: zenPalette.textMuted,
    fontSize: fs(11),
    fontFamily: '"IBM Plex Mono", monospace',
    lineHeight: 1.5,
  },
  aiSettingsToggle: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    border: `1px solid ${zenPalette.borderStrong}`,
    backgroundColor: zenPalette.panelSoft,
    color: zenPalette.text,
    padding: '0.4rem 0.65rem',
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: fs(11),
    cursor: 'pointer',
  },
  aiSettingsCard: {
    border: `1px solid ${zenPalette.border}`,
    borderRadius: 10,
    backgroundColor: '#141417',
    padding: '0.65rem',
    display: 'grid',
    gap: '0.42rem',
  },
  aiFieldLabel: {
    color: zenPalette.textMuted,
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: fs(10),
  },
  aiFieldInput: {
    width: '100%',
    boxSizing: 'border-box',
    borderRadius: 8,
    border: `1px solid ${zenPalette.border}`,
    backgroundColor: '#0f1013',
    color: zenPalette.text,
    padding: '0.45rem 0.55rem',
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: fs(11),
    outline: 'none',
  },
  aiSettingsHint: {
    margin: 0,
    color: zenPalette.textMuted,
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: fs(10),
    lineHeight: 1.45,
  },
  aiTextarea: {
    width: '100%',
    minHeight: 92,
    resize: 'vertical',
    boxSizing: 'border-box',
    borderRadius: 10,
    border: `1px solid ${zenPalette.border}`,
    backgroundColor: '#141417',
    color: zenPalette.text,
    padding: '0.65rem',
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: fs(12),
    outline: 'none',
    lineHeight: 1.45,
  },
  aiActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  aiGenerateButton: {
    borderRadius: 8,
    border: `1px solid ${zenPalette.gold}`,
    backgroundColor: zenPalette.gold,
    color: '#121212',
    fontFamily: '"IBM Plex Mono", monospace',
    fontWeight: 700,
    fontSize: fs(11),
    padding: '0.5rem 0.75rem',
    cursor: 'pointer',
  },
  aiGenerateButtonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  aiError: {
    margin: 0,
    color: zenPalette.danger,
    fontSize: fs(11),
    fontFamily: '"IBM Plex Mono", monospace',
  },
  aiInfo: {
    margin: 0,
    color: zenPalette.success,
    fontSize: fs(11),
    fontFamily: '"IBM Plex Mono", monospace',
  },
  skipButton: {
    display: 'block',
    margin: '2rem auto 0',
    padding: '0.75rem 1.5rem',
    backgroundColor: zenPalette.panel,
    color: zenPalette.text,
    border: `1px solid ${zenPalette.border}`,
    borderRadius: '8px',
    fontSize: fs(14),
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  builderSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 300px 1fr',
    gap: '0.75rem',
  },
  builderSectionMobile: {
    display: 'block',
  },
  previewPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  templateQuickSwitch: {
    backgroundColor: zenPalette.panel,
    border: `1px solid ${zenPalette.border}`,
    borderRadius: '12px',
    padding: '0.8rem',
    minHeight: '112px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.55rem',
  },
  templateQuickLabel: {
    fontSize: fs(12),
    color: zenPalette.textMuted,
    fontFamily: '"IBM Plex Mono", monospace',
  },
  templateQuickSelect: {
    width: '100%',
    padding: '0.55rem 0.6rem',
    borderRadius: '8px',
    border: `1px solid ${zenPalette.border}`,
    backgroundColor: '#141417',
    color: zenPalette.text,
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: fs(13),
    outline: 'none',
  },
  templateQuickHint: {
    fontSize: fs(11),
    color: zenPalette.textMuted,
    margin: 0,
    fontFamily: '"IBM Plex Mono", monospace',
  },
  editorQuickPanel: {
    backgroundColor: zenPalette.panel,
    border: `1px solid ${zenPalette.border}`,
    borderRadius: '12px',
    padding: '0.8rem',
    minHeight: '112px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
  },
  templateApplyPanel: {
    border: `1px solid ${zenPalette.border}`,
    borderRadius: 10,
    backgroundColor: zenPalette.panelSoft,
    padding: '0.6rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.55rem',
  },
  templateApplyActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  templateApplyGhost: {
    flex: 1,
    padding: '0.5rem',
    borderRadius: 8,
    border: `1px solid ${zenPalette.border}`,
    backgroundColor: zenPalette.panel,
    color: zenPalette.text,
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: fs(11),
    cursor: 'pointer',
  },
  templateApplyText: {
    margin: 0,
    fontSize: fs(11),
    lineHeight: 1.35,
    color: zenPalette.textMuted,
    fontFamily: '"IBM Plex Mono", monospace',
  },
  templateApplyPrimary: {
    flex: 1,
    padding: '0.5rem',
    borderRadius: 8,
    border: `1px solid ${zenPalette.gold}`,
    backgroundColor: zenPalette.gold,
    color: '#121212',
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: fs(11),
    fontWeight: 700,
    cursor: 'pointer',
  },
  editorPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  itemsPanel: {},
  mobilePanelTabs: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    marginTop: '0.3rem',
    marginBottom: '0.6rem',
    position: 'static',
    zIndex: 8,
    backgroundColor: '#10131b',
    border: `1px solid ${zenPalette.border}`,
    borderRadius: 14,
    padding: '0.32rem',
    width: '100%',
    maxWidth: 460,
    marginInline: 'auto',
    boxShadow: '0 8px 18px rgba(0, 0, 0, 0.2)',
  },
  mobileTabBtn: {
    border: `1px solid ${zenPalette.border}`,
    backgroundColor: '#1a1d27',
    color: zenPalette.textMuted,
    borderRadius: 10,
    padding: '0.48rem 0.7rem',
    fontSize: fs(12),
    fontWeight: 500,
    fontFamily: '"IBM Plex Mono", monospace',
    cursor: 'pointer',
    flex: 1,
    minWidth: 88,
    textAlign: 'center',
    transition: 'all 0.2s ease',
  },
  mobileTabBtnActive: {
    backgroundColor: '#d9d4c5',
    color: '#121212',
    borderColor: zenPalette.gold + '99',
    boxShadow: `0 0 0 1px ${zenPalette.gold}1f inset`,
  },
  mobileCustomizerBtn: {
    width: '100%',
    marginTop: '0.45rem',
    padding: '0.48rem 0.7rem',
    borderRadius: 10,
    border: `1px solid ${zenPalette.gold}88`,
    background: `linear-gradient(135deg, ${zenPalette.gold}1f, ${zenPalette.gold}0d)`,
    color: '#f4e5cb',
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: fs(11),
    fontWeight: 700,
    letterSpacing: '0.03em',
    cursor: 'pointer',
  },
  exportSection: {
    maxWidth: '1000px',
    margin: '0 auto',
  },
  footer: {
    padding: '1.5rem',
    textAlign: 'center',
    borderTop: `1px solid ${zenPalette.border}`,
    backgroundColor: zenPalette.bgMuted,
  },
  footerText: {
    fontSize: fs(14),
    color: zenPalette.textMuted,
    margin: 0,
  },
  footerLink: {
    color: zenPalette.gold,
    textDecoration: 'none',
    fontWeight: '500',
  },
};

export default App;
