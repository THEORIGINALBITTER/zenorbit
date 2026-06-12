import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import LivePreview from '../components/builder/LivePreview';
import VisualEditor from '../components/builder/VisualEditor';
import MenuItemEditor from '../components/builder/MenuItemEditor';
import TemplateSelector from '../components/builder/TemplateSelector';
import ExportPanel from '../components/builder/ExportPanel';
import SeoHelmet from '../components/seo/SeoHelmet';
import ZenSelect from '../components/ui/ZenSelect';
import { menuTemplates } from '../templates/menuTemplates';
import { orbitMenuConfig } from '../config/orbitMenuConfig';
import { generateMenuFromDescription } from '../orbify-ai/services/menuGenerator';
import { useTheme } from '../contexts/ThemeContext';
import {
  AI_PROVIDERS,
  getAISettings,
  isAIConfigured,
  isLocalhostUrl,
  isRemoteHost,
  resetAISettings,
  testAIConnection,
  updateAISettings,
} from '../orbify-ai/services/aiService';
import { getProviderHelp } from '../orbify-ai/services/aiProviderHelpService';

const CUSTOMIZER_TRANSFER_KEY = 'customizerTransfer_v1';

const AccordionSection = ({ title, badge, isOpen, onToggle, children, palette }) => (
  <div style={{
    backgroundColor: palette.bgCard,
    border: `1px solid ${isOpen ? palette.borderAccent : palette.border}`,
    borderRadius: 10,
    overflow: 'hidden',
  }}>
    <button
      onClick={onToggle}
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.65rem 0.9rem',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: isOpen ? palette.gold : palette.textDim,
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        {title}
        {badge !== undefined && (
          <span style={{
            fontSize: 9,
            padding: '1px 7px',
            backgroundColor: palette.goldSoft,
            color: palette.gold,
            borderRadius: 99,
            fontWeight: 700,
          }}>{badge}</span>
        )}
      </span>
      <span style={{ fontSize: 11, transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', lineHeight: 1, color: palette.textDim }}>▾</span>
    </button>
    {isOpen && (
      <div style={{ padding: '0.75rem 0.9rem', borderTop: `1px solid ${palette.borderSoft}` }}>
        {children}
      </div>
    )}
  </div>
);

const fs = (px) => `${px}px`;
const AI_PROVIDER_OPTIONS = [
  { value: AI_PROVIDERS.ANTHROPIC, label: 'Claude (Anthropic)' },
  { value: AI_PROVIDERS.OPENAI, label: 'OpenAI' },
  { value: AI_PROVIDERS.OLLAMA, label: 'Ollama (lokal)' },
  { value: AI_PROVIDERS.CUSTOM, label: 'Custom API' },
];
const AI_STYLE_OPTIONS = [
  { value: 'openai-compatible', label: 'OpenAI-kompatibel' },
  { value: 'anthropic', label: 'Anthropic' },
];
const AI_MODEL_OPTIONS = {
  [AI_PROVIDERS.ANTHROPIC]: [
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
    { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
    { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
  ],
  [AI_PROVIDERS.OPENAI]: [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  ],
  [AI_PROVIDERS.OLLAMA]: [
    { value: 'llama3.1:8b', label: 'llama3.1:8b' },
    { value: 'llama3.1:latest', label: 'llama3.1:latest' },
    { value: 'mistral:latest', label: 'mistral:latest' },
    { value: 'phi3:latest', label: 'phi3:latest' },
    { value: 'gemma:latest', label: 'gemma:latest' },
  ],
  [AI_PROVIDERS.CUSTOM]: [
    { value: 'gpt-4o-mini', label: 'gpt-4o-mini' },
    { value: 'claude-3-5-sonnet-20241022', label: 'claude-3-5-sonnet-20241022' },
    { value: 'llama-3.1-8b-instant', label: 'llama-3.1-8b-instant' },
    { value: 'mixtral-8x7b-32768', label: 'mixtral-8x7b-32768' },
  ],
};

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
  const { isDark } = useTheme();
  const B = isDark ? BUILDER_DARK : BUILDER_LIGHT;
  const styles = createStyles(B);
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState(orbitMenuConfig);
  const [menuItems, setMenuItems] = useState([
    { id: '1', label: 'Home', angle: 0, route: '/' },
    { id: '2', label: 'About', angle: -90, route: '/about' },
    { id: '3', label: 'Contact', angle: -180, route: '/contact' },
  ]);
  const [accentColor, setAccentColor] = useState('#d0cbb8');
  const [logoSrc, setLogoSrc] = useState('');
  const [logoDraft, setLogoDraft] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('default');
  const [pendingTemplateId, setPendingTemplateId] = useState(null);
  const [autoOpenSignal, setAutoOpenSignal] = useState(0);
  const [openPanels, setOpenPanels] = useState({ template: true, logo: false, design: false, items: false });
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTesting, setAiTesting] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiInfo, setAiInfo] = useState('');
  const [aiSettings, setAiSettings] = useState(() => getAISettings());
  const [showAISettings, setShowAISettings] = useState(false);
  const [showAIGuide, setShowAIGuide] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState('');
  const [aiWorkStep, setAiWorkStep] = useState(0);
  const [isMobileLayout, setIsMobileLayout] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const normalizedLogoDraft = logoDraft.trim();
  const normalizedLogoSrc = (logoSrc || '').trim();
  const hasPendingLogoApply = normalizedLogoDraft.length > 0 && normalizedLogoDraft !== normalizedLogoSrc;

  useEffect(() => {
    const onResize = () => setIsMobileLayout(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!aiLoading) {
      setAiWorkStep(0);
      return;
    }
    const timer = window.setInterval(() => {
      setAiWorkStep((prev) => (prev + 1) % 4);
    }, 900);
    return () => window.clearInterval(timer);
  }, [aiLoading]);

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
  const modelOptionsForProvider = React.useMemo(() => {
    const provider = aiSettings.provider || AI_PROVIDERS.ANTHROPIC;
    const base = AI_MODEL_OPTIONS[provider] || [];
    const current = (aiSettings.model || '').trim();
    if (!current) return base;
    if (base.some((item) => item.value === current)) return base;
    return [{ value: current, label: `${current} (aktuell)` }, ...base];
  }, [aiSettings.provider, aiSettings.model]);
  const providerHelp = React.useMemo(() => getProviderHelp(aiSettings.provider), [aiSettings.provider]);

  const handleTestAIConnection = async () => {
    if (aiTesting) return;
    setAiTesting(true);
    setAiError('');
    setAiInfo('');
    try {
      const result = await testAIConnection();
      if (result?.success) {
        setAiInfo('Verbindung erfolgreich getestet.');
      } else {
        setAiError(result?.error || 'Verbindungstest fehlgeschlagen.');
      }
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'Verbindungstest fehlgeschlagen.');
    } finally {
      setAiTesting(false);
    }
  };

  const getReadableAIError = (raw) => {
    const text = String(raw || '');
    const lower = text.toLowerCase();
    if (lower.includes('does not support chat') && aiSettings.provider === AI_PROVIDERS.OLLAMA) {
      return [
        'Das gewählte Modell ist nicht kompatibel.',
        'So gehst du Schritt für Schritt vor:',
        '1) Öffne die App "Terminal" auf deinem Mac.',
        '2) Gib diesen Befehl ein und drücke Enter:',
        '   ollama pull llama3.1:8b',
        '3) Starte danach Ollama im selben Terminal:',
        '   ollama serve',
        '4) Gehe zurück in den Builder.',
        '5) Wähle im Feld "Model" den Eintrag "llama3.1:8b".',
        '6) Klicke auf "Test".',
        'Wenn es weiter nicht geht: Ollama komplett schließen und neu öffnen, dann Schritt 3 bis 6 wiederholen.',
      ].join('\n');
    }
    return text;
  };

  const copyCommand = async (command) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedCommand(command);
      window.setTimeout(() => setCopiedCommand(''), 1400);
    } catch {
      setAiError('Kopieren fehlgeschlagen. Bitte Befehl manuell markieren und kopieren.');
    }
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

  const handleLogoDrop = (e) => {
    e.preventDefault();
    setIsDraggingLogo(false);
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setLogoDraft(dataUrl);
      setLogoSrc(dataUrl);
    };
    reader.readAsDataURL(file);
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
    { id: 1, title: 'Brand Direction', component: TemplateSelector },
    { id: 2, title: 'Signature Design', component: null },
    { id: 3, title: 'Production Export', component: ExportPanel },
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
              padding: isMobileLayout ? '0.45rem 0.6rem' : '0.5rem 1rem',
              background: B.gold,
              color: B.buttonText,
              border: `1px solid ${B.gold}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: navInlineSlot && !isMobileLayout ? '12px' : '13px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
              transition: 'opacity 0.2s',
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
        description="Forme deine ZenOrbit Signature in drei Schritten: Brand Direction, Signature Design und Production Export."
        path="/builder"
        type="website"
        keywords="ZenOrbit Builder, Brand Interface, Orbit Navigation, Signature UI, React Code Export"
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

            {/* ── Page header ── */}
            <div style={styles.stepHeader}>
              <div style={styles.stepLabel}>Schritt 1 von 3</div>
              <h1 style={styles.stepHeadline}>Definiere die Richtung.</h1>
              <p style={styles.stepSubtitle}>
                Wähle eine gestalterische Basis oder starte mit einer KI-kuratierten Struktur.
              </p>
            </div>

            {/* ── Template grid ── */}
            <TemplateSelector onSelectTemplate={handleTemplateSelect} />

            {/* ── AI Generator ── */}
            <div style={styles.aiCard}>
              <div style={{ ...styles.aiCardTop, ...(isMobileLayout ? styles.aiCardTopMobile : {}) }}>
                <div style={styles.aiCardIcon}>軌</div>
                <div style={{ flex: 1, minWidth: isMobileLayout ? '100%' : 240 }}>
                  <div style={styles.aiCardTitle}>AI-Generator</div>
                  <div style={styles.aiCardSubtitle}>Beschreibe deinen Markencharakter - ZenOrbit übersetzt ihn in ein Orbit-Menü.</div>
                </div>
                <div style={{ ...styles.aiTopActions, ...(isMobileLayout ? styles.aiTopActionsMobile : {}) }}>
                  <button type="button" onClick={() => setShowAISettings((prev) => !prev)} style={{ ...styles.aiActionBtn, ...(isMobileLayout ? styles.aiActionBtnMobile : {}) }}>
                    {showAISettings ? 'Provider ausblenden' : 'Provider konfigurieren'}
                  </button>
                  <button type="button" onClick={handleTestAIConnection} disabled={aiTesting || aiLoading} style={{ ...styles.aiActionBtn, ...(isMobileLayout ? styles.aiActionBtnMobile : {}), ...(aiTesting || aiLoading ? styles.aiActionBtnDisabled : {}) }}>
                    {aiTesting ? 'Teste…' : 'Test'}
                  </button>
                  <button type="button" onClick={() => setShowAIGuide(true)} style={{ ...styles.aiGuideBtn, ...(isMobileLayout ? styles.aiActionBtnMobile : {}) }}>
                    ? Guide
                  </button>
                </div>
              </div>

              {showAISettings && (
                <div style={styles.aiSettingsCard}>
                  {isRemoteHost() && isLocalhostUrl(aiSettings.endpoint) && (
                    <div style={{
                      background: '#fff8e6',
                      border: '1px solid #f0c040',
                      borderRadius: 8,
                      padding: '12px 14px',
                      marginBottom: 14,
                      fontSize: 12,
                      color: '#5a4200',
                      lineHeight: 1.6,
                    }}>
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                        ⚠️ Ollama ist nicht erreichbar
                      </div>
                      <p style={{ margin: '0 0 10px' }}>
                        Du greifst remote auf diese App zu, aber Ollama läuft lokal auf deinem Rechner. Der Browser blockiert solche Anfragen.
                      </p>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>Option 1 — Cloud-Provider (einfachste Lösung)</div>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                        <button type="button" onClick={() => onProviderChange(AI_PROVIDERS.ANTHROPIC)} style={{ padding: '4px 10px', fontSize: 11, borderRadius: 4, border: '1px solid #c8a840', background: '#fffbf0', cursor: 'pointer', fontWeight: 600 }}>
                          → Anthropic wählen
                        </button>
                        <button type="button" onClick={() => onProviderChange(AI_PROVIDERS.OPENAI)} style={{ padding: '4px 10px', fontSize: 11, borderRadius: 4, border: '1px solid #c8a840', background: '#fffbf0', cursor: 'pointer', fontWeight: 600 }}>
                          → OpenAI wählen
                        </button>
                      </div>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>Option 2 — Ollama per ngrok tunneln</div>
                      <p style={{ margin: '0 0 8px', fontSize: 11, color: '#7a5a10' }}>
                        ngrok erstellt eine öffentliche URL für dein lokales Ollama. Entweder manuell oder per Script:
                      </p>
                      <a
                        href="/setup-ollama-tunnel.sh"
                        download="setup-ollama-tunnel.sh"
                        style={{
                          display: 'inline-block',
                          marginBottom: 10,
                          padding: '5px 12px',
                          fontSize: 11,
                          fontWeight: 700,
                          borderRadius: 4,
                          border: '1px solid #c8a840',
                          background: '#fffbf0',
                          color: '#5a4200',
                          textDecoration: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        ↓ Setup-Script herunterladen (.sh)
                      </a>
                      <p style={{ margin: '0 0 4px', fontSize: 10, color: '#7a5a10' }}>
                        Script im Terminal ausführen: <code style={{ background: '#ffedb0', padding: '1px 4px', borderRadius: 3 }}>bash ~/Downloads/setup-ollama-tunnel.sh</code>
                      </p>
                      <p style={{ margin: '0 0 6px', fontSize: 10, color: '#9a7a30' }}>Oder manuell:</p>
                      <ol style={{ margin: '0 0 6px', paddingLeft: 16, fontSize: 11 }}>
                        <li>Terminal öffnen → <code style={{ background: '#ffedb0', padding: '1px 4px', borderRadius: 3 }}>brew install ngrok</code></li>
                        <li>Ollama starten → <code style={{ background: '#ffedb0', padding: '1px 4px', borderRadius: 3 }}>ollama serve</code></li>
                        <li>Tunnel starten → <code style={{ background: '#ffedb0', padding: '1px 4px', borderRadius: 3 }}>ngrok http 11434</code></li>
                        <li>Angezeigte URL als Endpoint: <code style={{ background: '#ffedb0', padding: '1px 4px', borderRadius: 3 }}>https://xxxxx.ngrok-free.app/v1/chat/completions</code></li>
                      </ol>
                      <p style={{ margin: 0, fontSize: 10, color: '#9a7a30' }}>
                        ngrok Free: URL ändert sich bei Neustart. Feste URL ab ~$10/Monat.
                      </p>
                    </div>
                  )}
                  <label style={styles.aiFieldLabel}>Provider</label>
                  <ZenSelect value={aiSettings.provider} onChange={onProviderChange} options={AI_PROVIDER_OPTIONS} style={styles.aiSelectWrap} />
                  <label style={styles.aiFieldLabel}>Endpoint</label>
                  <input value={aiSettings.endpoint || ''} onChange={(e) => onSettingChange('endpoint', e.target.value)} style={styles.aiFieldInput} placeholder="https://..." />
                  <label style={styles.aiFieldLabel}>Model</label>
                  <ZenSelect
                    value={aiSettings.model || ''}
                    onChange={(next) => onSettingChange('model', next)}
                    options={modelOptionsForProvider}
                    style={styles.aiSelectWrap}
                  />
                  {aiSettings.provider !== AI_PROVIDERS.OLLAMA && (
                    <>
                      <label style={styles.aiFieldLabel}>API Key</label>
                      <input type="password" value={aiSettings.apiKey || ''} onChange={(e) => onSettingChange('apiKey', e.target.value)} style={styles.aiFieldInput} placeholder="sk-..." />
                    </>
                  )}
                  {aiSettings.provider === AI_PROVIDERS.CUSTOM && (
                    <>
                      <label style={styles.aiFieldLabel}>API Style</label>
                      <ZenSelect value={aiSettings.apiStyle || 'openai-compatible'} onChange={(next) => onSettingChange('apiStyle', next)} options={AI_STYLE_OPTIONS} style={styles.aiSelectWrap} />
                    </>
                  )}
                  <div style={styles.aiHelpCard}>
                    <div style={styles.aiHelpTitle}>
                      {providerHelp.title}
                      <span style={styles.aiHelpBadge}>{providerHelp.level}</span>
                    </div>
                    <ul style={styles.aiHelpList}>
                      {providerHelp.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ul>
                    {providerHelp.commands.length > 0 && (
                      <div style={styles.aiHelpCommands}>
                        {providerHelp.commands.map((command) => (
                          <button
                            key={command}
                            type="button"
                            onClick={() => copyCommand(command)}
                            style={styles.aiHelpCodeBtn}
                            title="Befehl kopieren"
                          >
                            <code style={styles.aiHelpCode}>{command}</code>
                            <span style={styles.aiHelpCopyLabel}>
                              {copiedCommand === command ? 'Kopiert' : 'Copy'}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div style={{ ...styles.aiInputRow, ...(isMobileLayout ? styles.aiInputRowMobile : {}) }}>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="z. B. Premium SaaS Interface mit Home, Product, Cases, Journal und Contact."
                  style={{ ...styles.aiTextarea, ...(isMobileLayout ? styles.aiTextareaMobile : {}) }}
                />
                <button
                  type="button"
                  onClick={applyAIGeneratedMenu}
                  disabled={aiLoading}
                  style={{ ...styles.aiGenerateButton, ...(isMobileLayout ? styles.aiGenerateButtonMobile : {}), ...(aiLoading ? styles.aiGenerateButtonDisabled : {}) }}
                >
                  {aiLoading ? 'Generiert…' : 'Mit KI bauen →'}
                </button>
              </div>

              {aiError ? <p style={styles.aiError}>{getReadableAIError(aiError)}</p> : null}
              {aiInfo  ? <p style={styles.aiInfo}>{aiInfo}</p>  : null}
            </div>

            <button onClick={() => setCurrentStep(2)} style={styles.skipButton}>
              Ohne Vorgabe starten →
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
                    top: isMobileLayout ? undefined : 116,
                    height: isMobileLayout ? 300 : 'calc(100vh - 128px)',
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
                      isMobile={isMobileLayout}
                    />
                  </div>

                  {/* Accordion Controls — unten (mobile) / rechts (desktop) */}
                  <div style={{
                    width: isMobileLayout ? '100%' : 360,
                    flexShrink: 0,
                    position: isMobileLayout ? 'static' : 'sticky',
                    top: isMobileLayout ? undefined : 116,
                    height: isMobileLayout ? undefined : 'calc(100vh - 128px)',
                    overflowY: isMobileLayout ? undefined : 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}>
                    {/* Template */}
                    <AccordionSection title="Template" isOpen={openPanels.template} onToggle={() => togglePanel('template')} palette={B}>
                      <label style={styles.templateQuickLabel}>Vorlage</label>
                      <ZenSelect
                        value={selectedTemplateId}
                        onChange={onQuickTemplateChange}
                        options={Object.entries(menuTemplates).map(([id, template]) => ({
                          value: id,
                          label: template.name,
                        }))}
                        style={{ marginTop: 4 }}
                      />
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
                    <AccordionSection title="Logo" isOpen={openPanels.logo} onToggle={() => togglePanel('logo')} palette={B}>
                      {/* Drag & Drop Zone */}
                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsDraggingLogo(true); }}
                        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsDraggingLogo(false); }}
                        onDrop={handleLogoDrop}
                        style={{
                          border: `2px dashed ${isDraggingLogo ? B.gold : B.borderStrong}`,
                          borderRadius: 10,
                          padding: '0.9rem 0.75rem',
                          textAlign: 'center',
                          backgroundColor: isDraggingLogo ? B.goldSoft : 'transparent',
                          transition: 'border-color 0.18s, background-color 0.18s',
                          marginBottom: 8,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        {logoSrc ? (
                          <img
                            src={logoSrc}
                            alt="Logo Preview"
                            style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', marginBottom: 4 }}
                          />
                        ) : (
                          <div style={{ fontSize: 20, lineHeight: 1, color: isDraggingLogo ? B.gold : B.textDim }}>
                            軌
                          </div>
                        )}
                        <p style={{ margin: 0, fontSize: 11, color: isDraggingLogo ? B.gold : B.textDim, fontFamily: '"IBM Plex Mono", monospace' }}>
                          {isDraggingLogo ? 'Loslassen zum Laden' : 'Bild hierher ziehen'}
                        </p>
                        {!isDraggingLogo && (
                          <p style={{ margin: 0, fontSize: 10, color: B.textDim, fontFamily: '"IBM Plex Mono", monospace', opacity: 0.7 }}>
                            PNG, JPG, SVG, WebP
                          </p>
                        )}
                      </div>

                      <label style={styles.templateQuickLabel}>oder URL eingeben</label>
                      <input
                        type="text"
                        placeholder="https://example.com/logo.png"
                        value={logoDraft.startsWith('data:') ? '' : logoDraft}
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
                      {hasPendingLogoApply && !logoDraft.startsWith('data:') && (
                        <div style={{ ...styles.templateApplyPanel, marginTop: 8 }}>
                          <p style={styles.templateApplyText}>Logo-Vorschau aktiv. Wenn es passt, übernehmen.</p>
                          <button type="button" style={styles.templateApplyPrimary} onClick={applyLogoDraft}>
                            Logo übernehmen
                          </button>
                        </div>
                      )}
                      {logoSrc && (
                        <button
                          type="button"
                          onClick={() => { setLogoDraft(''); setLogoSrc(''); }}
                          style={{ ...styles.templateApplyGhost, marginTop: 6, width: '100%' }}
                        >
                          Logo entfernen ✕
                        </button>
                      )}
                    </AccordionSection>

                    {/* Design */}
                    <AccordionSection title="Design" isOpen={openPanels.design} onToggle={() => togglePanel('design')} palette={B}>
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
                    <AccordionSection title="Menu Items" badge={menuItems.length} isOpen={openPanels.items} onToggle={() => togglePanel('items')} palette={B}>
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

      {showAIGuide && (
        <div
          onClick={() => setShowAIGuide(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9000,
            backgroundColor: B.overlay,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: B.bgPanel,
              border: `1px solid ${B.borderAccent}`,
              borderRadius: 16,
              width: '100%',
              maxWidth: 620,
              maxHeight: '88vh',
              overflowY: 'auto',
              padding: '1.5rem',
              fontFamily: '"IBM Plex Mono", monospace',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setShowAIGuide(false)}
              style={{
                position: 'absolute', top: 14, right: 14,
                background: 'none', border: 'none', color: B.textDim,
                fontSize: 18, cursor: 'pointer', lineHeight: 1,
              }}
            >✕</button>

            <div style={{ color: B.gold, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4, fontWeight: 700 }}>AI Provider</div>
            <h2 style={{ margin: '0 0 1.2rem', fontSize: 20, color: B.text, fontWeight: 700, lineHeight: 1.2 }}>Signature Setup</h2>

            {[
              {
                name: 'Claude (Anthropic)',
                color: '#C8A96E',
                steps: [
                  'Erstelle einen Account unter console.anthropic.com.',
                  'Lege unter "API Keys" einen neuen Key an.',
                  'Sichere den Key direkt, er wird nur einmal vollständig angezeigt.',
                  'Setze im Builder den Provider auf Claude (Anthropic).',
                  'Hinterlege den Key im Feld "API Key".',
                  'Empfohlene Modelle: claude-3-5-sonnet-20241022 oder ein aktuelles Sonnet/Haiku-Profil.',
                  'Endpoint leer lassen, ZenOrbit setzt ihn automatisch.',
                ],
              },
              {
                name: 'OpenAI',
                color: '#74AA9C',
                steps: [
                  'Melde dich bei platform.openai.com an.',
                  'Erstelle unter "API Keys" einen neuen Secret Key.',
                  'Übernimm den Key direkt in deine sichere Ablage.',
                  'Wähle im Builder den Provider OpenAI.',
                  'Trage den Key in "API Key" ein.',
                  'Empfohlene Modelle: gpt-4o für Qualität, gpt-4o-mini für Effizienz.',
                  'Endpoint leer lassen, der Standard wird automatisch verwendet.',
                ],
              },
              {
                name: 'Ollama (lokal)',
                color: '#7EB8D4',
                steps: [
                  'Installiere Ollama über ollama.com/download.',
                  'Starte den lokalen Dienst mit `ollama serve`.',
                  'Lade ein Modell, z. B. `ollama pull llama3.1:8b`.',
                  'Setze im Builder den Provider auf Ollama (lokal).',
                  'Endpoint: http://localhost:11434/v1/chat/completions',
                  'Wähle exakt den lokal installierten Modellnamen.',
                  'Bei Browser-Restriktionen `OLLAMA_ORIGINS=*` setzen und den Dienst neu starten.',
                ],
              },
              {
                name: 'Custom API',
                color: '#A889C8',
                steps: [
                  'Wähle im Builder den Provider Custom API.',
                  'Trage die vollständige Endpoint-URL des Anbieters ein.',
                  'Setze den API-Style passend zur Schnittstelle: OpenAI-kompatibel oder Anthropic.',
                  'Hinterlege den API-Key, sofern vom Anbieter verlangt.',
                  'Trage die exakte Model-ID des Zielmodells ein.',
                  'Typische Anbieter: Groq, Together AI, Mistral, Fireworks oder interne Enterprise-Gateways.',
                ],
              },
            ].map((provider) => (
              <div key={provider.name} style={{
                marginBottom: '1.2rem',
                border: `1px solid ${B.border}`,
                borderRadius: 10,
                overflow: 'hidden',
              }}>
                <div style={{
                  padding: '0.55rem 0.9rem',
                  backgroundColor: provider.color + '26',
                  borderBottom: `1px solid ${B.border}`,
                  fontSize: 12,
                  fontWeight: 700,
                  color: B.text,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}>
                  {provider.name}
                </div>
                <div style={{ padding: '0.75rem 0.9rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {provider.steps.map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{
                        flexShrink: 0,
                        width: 22, height: 22,
                        borderRadius: '50%',
                        backgroundColor: provider.color + '33',
                        color: B.text,
                        fontSize: 10,
                        fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `1px solid ${provider.color}77`,
                      }}>{i + 1}</span>
                      <span style={{ fontSize: 12, color: B.text, lineHeight: 1.6 }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <p style={{ margin: 0, fontSize: 10, color: B.textSub, lineHeight: 1.6 }}>
                Security Note: API-Keys bleiben lokal im Browserprofil und werden nicht an ZenOrbit-Server übertragen.
              </p>
              <a
                href="/guide#ai-provider"
                onClick={() => setShowAIGuide(false)}
                style={{
                  flexShrink: 0,
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  textDecoration: 'none',
                  padding: '0.45rem 0.9rem',
                  borderRadius: 8,
                  backgroundColor: B.gold,
                  color: B.buttonText,
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                }}
              >
                Signature Guide öffnen →
              </a>
            </div>
          </div>
        </div>
      )}

      {aiLoading && (
        <div style={styles.aiWorkOverlay}>
          <div style={styles.aiWorkPanel}>
            <div style={styles.aiWorkLabel}>Builder Orbit KI Work Screen</div>
            <h3 style={styles.aiWorkTitle}>Orbit Menü wird generiert…</h3>
            <p style={styles.aiWorkText}>
              Einen Moment. Wir kuratieren Struktur, Labels und Flow für deine Signature Navigation.
            </p>
            <div style={styles.aiWorkSteps}>
              {[
                'Direction analysieren',
                'Menüarchitektur kuratieren',
                'Navigation strukturieren',
                'Signature anwenden',
              ].map((label, index) => (
                <div
                  key={label}
                  style={{
                    ...styles.aiWorkStepItem,
                    ...(index <= aiWorkStep ? styles.aiWorkStepItemActive : {}),
                  }}
                >
                  {index + 1}. {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const BUILDER_DARK = {
  bg:          '#0d0d0f',
  bgCard:      '#131316',
  bgCardHover: '#1a1a1e',
  bgPanel:     '#18181c',
  bgInput:     '#0f0f12',
  border:      '#222226',
  borderSoft:  '#1e1e22',
  borderStrong:'#2e2e34',
  borderAccent:'#3a3028',
  text:        '#d0cbb8',
  textSub:     '#b0ac9b',
  textDim:     '#d0cbb8',
  gold:        '#d0cbb8',
  goldBright:  '#cca87a',
  goldDim:     '#5a4428',
  goldSoft:    'rgba(208,203,184,0.13)',
  buttonText:  '#0d0d0f',
  danger:      '#d06767',
  success:     '#3a8f60',
  overlay:     'rgba(0,0,0,0.72)',
};

const BUILDER_LIGHT = {
  bg:          '#e8e3d8',
  bgCard:      '#d8d1c4',
  bgCardHover: '#d0c8ba',
  bgPanel:     '#d2cabd',
  bgInput:     '#f2ece1',
  border:      'rgba(30,24,16,0.18)',
  borderSoft:  'rgba(30,24,16,0.12)',
  borderStrong:'rgba(30,24,16,0.24)',
  borderAccent:'#8e7657',
  text:        '#1a1710',
  textSub:     '#4a4438',
  textDim:     '#6f6658',
  gold:        '#8e7657',
  goldBright:  '#7a5d39',
  goldDim:     '#b89c74',
  goldSoft:    'rgba(142,118,87,0.14)',
  buttonText:  '#f7f1e6',
  danger:      '#b24d4d',
  success:     '#2f7a4c',
  overlay:     'rgba(20,16,12,0.45)',
};

const createStyles = (B) => ({
  app: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: B.bg,
    color: B.text,
    fontFamily: '"IBM Plex Sans", "Avenir Next", "Helvetica Neue", sans-serif',
  },
  stepIndicator: {
    backgroundColor: B.bgCard,
    borderBottom: `1px solid ${B.border}`,
    padding: '0.9rem 1.5rem',
  },
  stepIndicatorMobile: {
    backgroundColor: B.bgCard,
    borderBottom: `1px solid ${B.border}`,
    padding: '0.6rem 0.75rem',
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
    backgroundColor: B.bgPanel,
    border: `1px solid ${B.border}`,
    borderRadius: 12,
    padding: '0.45rem 0.55rem',
    gap: '0.4rem',
  },
  stepIndicatorRowInline: {
    maxWidth: 'none',
    margin: 0,
    gap: '0.6rem',
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
    gap: '0.6rem',
    padding: '0.55rem 1.1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.18s',
    border: '1px solid transparent',
  },
  stepActive: {
    backgroundColor: B.gold,
    border: `1px solid ${B.gold}`,
  },
  stepCompleted: {
    opacity: 0.5,
  },
  stepNumber: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    backgroundColor: B.bgPanel,
    border: `1px solid ${B.border}`,
    color: B.textDim,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700',
    flexShrink: 0,
  },
  stepNumberActive: {
    backgroundColor: B.goldSoft,
    border: `1px solid ${B.borderAccent}`,
    color: B.buttonText,
  },
  stepTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: B.textSub,
    letterSpacing: '0.02em',
  },
  stepTitleActive: {
    color: B.buttonText,
    fontWeight: '700',
  },
  stepConnector: {
    width: '40px',
    height: '1px',
    backgroundColor: B.border,
    margin: '0 0.5rem',
    flexShrink: 0,
  },
  stepConnectorMobile: {
    flex: 0,
    flexShrink: 0,
    width: '16px',
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
    padding: '0.3rem 0.45rem',
    gap: '0.35rem',
    borderRadius: 8,
  },
  stepNumberMobile: {
    width: '22px',
    height: '22px',
    fontSize: '11px',
  },
  stepTitleMobile: {
    fontSize: '10px',
  },
  main: {
    flex: 1,
    padding: '2rem 1.25rem',
    maxWidth: '1100px',
    width: '100%',
    margin: '0 auto',
  },
  templateSection: {
    maxWidth: '860px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  stepHeader: {
    textAlign: 'center',
    paddingBottom: '0.5rem',
  },
  stepLabel: {
    fontSize: '10px',
    color: B.textDim,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  stepHeadline: {
    fontSize: 'clamp(1.8rem, 4vw, 2.7rem)',
    fontWeight: 800,
    letterSpacing: '-0.9px',
    margin: '0 0 0.6rem',
    color: B.text,
    lineHeight: 1.05,
    fontFamily: '"IBM Plex Sans", "Avenir Next", "Helvetica Neue", sans-serif',
  },
  stepSubtitle: {
    fontSize: 14,
    color: B.textSub,
    margin: 0,
    lineHeight: 1.75,
    letterSpacing: '0.01em',
  },
  // ── AI Card ──
  aiCard: {
    backgroundColor: B.bgCard,
    border: `1px solid ${B.border}`,
    borderRadius: 14,
    padding: '1.25rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  aiCardTop: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.85rem',
    flexWrap: 'wrap',
  },
  aiCardTopMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '0.65rem',
  },
  aiCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: B.goldSoft,
    border: `1px solid ${B.goldDim}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    color: B.gold,
    flexShrink: 0,
  },
  aiCardTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: B.gold,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  aiCardSubtitle: {
    fontSize: 11,
    color: B.textSub,
    lineHeight: 1.5,
  },
  aiTopActions: {
    display: 'flex',
    gap: 8,
    flexShrink: 0,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  aiTopActionsMobile: {
    width: '100%',
    justifyContent: 'stretch',
    gap: 6,
  },
  aiActionBtn: {
    borderRadius: 7,
    border: `1px solid ${B.border}`,
    backgroundColor: B.bgPanel,
    color: B.textSub,
    padding: '0.4rem 0.75rem',
    minHeight: 32,
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: '11px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  aiActionBtnMobile: {
    flex: 1,
    minWidth: 0,
    textAlign: 'center',
    padding: '0.52rem 0.6rem',
    fontSize: '12px',
  },
  aiActionBtnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  aiInputRow: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },
  aiInputRowMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '0.6rem',
  },
  aiGuideBtn: {
    borderRadius: 7,
    border: `1px solid ${B.goldDim}`,
    backgroundColor: B.goldSoft,
    color: B.gold,
    padding: '0.4rem 0.75rem',
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  aiSettingsCard: {
    border: `1px solid ${B.border}`,
    borderRadius: 10,
    backgroundColor: B.bgInput,
    padding: '0.75rem',
    display: 'grid',
    gap: '0.45rem',
  },
  aiFieldLabel: {
    color: B.textDim,
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: '10px',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginTop: '0.25rem',
  },
  aiFieldInput: {
    width: '100%',
    boxSizing: 'border-box',
    borderRadius: 8,
    border: `1px solid ${B.border}`,
    backgroundColor: B.bgInput,
    color: B.text,
    padding: '0.5rem 0.65rem',
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: '12px',
    outline: 'none',
  },
  aiSelectWrap: {
    width: '100%',
  },
  aiSettingsHint: {
    margin: 0,
    color: B.text,
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: '10px',
    lineHeight: 1.5,
  },
  aiHelpCard: {
    marginTop: '0.35rem',
    border: `1px solid ${B.borderStrong}`,
    borderRadius: 10,
    backgroundColor: B.bgCard,
    padding: '0.6rem 0.7rem',
    display: 'grid',
    gap: '0.5rem',
  },
  aiHelpTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: B.text,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.04em',
  },
  aiHelpBadge: {
    border: `1px solid ${B.border}`,
    borderRadius: 999,
    padding: '2px 8px',
    fontSize: '9px',
    textTransform: 'uppercase',
    color: B.textDim,
    letterSpacing: '0.08em',
  },
  aiHelpList: {
    margin: 0,
    paddingLeft: '1rem',
    color: B.textSub,
    fontSize: '10px',
    lineHeight: 1.55,
  },
  aiHelpCommands: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  aiHelpCodeBtn: {
    border: 'none',
    padding: 0,
    margin: 0,
    background: 'transparent',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    cursor: 'pointer',
  },
  aiHelpCode: {
    border: `1px solid ${B.border}`,
    borderRadius: 7,
    backgroundColor: B.bgInput,
    color: B.gold,
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: '10px',
    padding: '4px 7px',
  },
  aiHelpCopyLabel: {
    border: `1px solid ${B.border}`,
    borderRadius: 7,
    backgroundColor: B.bgPanel,
    color: B.textDim,
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: '9px',
    padding: '3px 6px',
    letterSpacing: '0.04em',
  },
  aiTextarea: {
    flex: 1,
    minWidth: 0,
    minHeight: 150,
    resize: 'vertical',
    boxSizing: 'border-box',
    borderRadius: 10,
    border: `1px solid ${B.border}`,
    backgroundColor: B.bgInput,
    color: B.text,
    padding: '0.7rem 0.85rem',
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: '10px',
    outline: 'none',
    lineHeight: 1.6,
  },
  aiTextareaMobile: {
    width: '100%',
    minHeight: 132,
  },
  aiGenerateButton: {
    flexShrink: 0,
    borderRadius: 10,
    border: `1px solid ${B.gold}`,
    backgroundColor: B.gold,
    color: B.buttonText,
    fontFamily: '"IBM Plex Mono", monospace',
    fontWeight: 700,
    fontSize: '13px',
    padding: '0.7rem 1.25rem',
    cursor: 'pointer',
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap',
    alignSelf: 'flex-end',
  },
  aiGenerateButtonMobile: {
    width: '100%',
    alignSelf: 'stretch',
    textAlign: 'center',
    padding: '0.72rem 0.9rem',
  },
  aiGenerateButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  aiError: {
    margin: 0,
    color: B.danger,
    fontSize: '11px',
    fontFamily: '"IBM Plex Mono", monospace',
    whiteSpace: 'pre-line',
    lineHeight: 1.55,
  },
  aiInfo: {
    margin: 0,
    color: B.success,
    fontSize: '11px',
    fontFamily: '"IBM Plex Mono", monospace',
  },
  skipButton: {
    display: 'block',
    margin: '0 auto',
    padding: '0',
    backgroundColor: 'transparent',
    color: B.textDim,
    border: 'none',
    fontSize: '12px',
    fontFamily: '"IBM Plex Mono", monospace',
    cursor: 'pointer',
    letterSpacing: '0.04em',
    textDecoration: 'underline',
    textUnderlineOffset: 3,
  },
  aiWorkOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9500,
    backgroundColor: B.overlay,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    backdropFilter: 'blur(2px)',
  },
  aiWorkPanel: {
    width: '100%',
    maxWidth: 560,
    borderRadius: 14,
    border: `1px solid ${B.borderAccent}`,
    backgroundColor: B.bgPanel,
    boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
    padding: '1.1rem 1.2rem',
    display: 'grid',
    gap: '0.7rem',
  },
  aiWorkLabel: {
    color: B.gold,
    fontSize: '10px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    fontWeight: 700,
  },
  aiWorkTitle: {
    margin: 0,
    color: B.text,
    fontSize: '22px',
    lineHeight: 1.1,
  },
  aiWorkText: {
    margin: 0,
    color: B.textSub,
    fontSize: '12px',
    lineHeight: 1.55,
  },
  aiWorkSteps: {
    display: 'grid',
    gap: 8,
    marginTop: '0.2rem',
  },
  aiWorkStepItem: {
    border: `1px solid ${B.border}`,
    borderRadius: 8,
    padding: '0.45rem 0.55rem',
    color: B.textDim,
    fontSize: '11px',
    backgroundColor: B.bgCard,
  },
  aiWorkStepItemActive: {
    borderColor: B.goldDim,
    color: B.text,
    backgroundColor: B.goldSoft,
  },
  previewPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  templateQuickLabel: {
    fontSize: '11px',
    color: B.textDim,
    fontFamily: '"IBM Plex Mono", monospace',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: '0.2rem',
  },
  templateQuickSelect: {
    width: '100%',
    padding: '0.5rem 0.6rem',
    borderRadius: '8px',
    border: `1px solid ${B.border}`,
    backgroundColor: B.bgInput,
    color: B.text,
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: '12px',
    outline: 'none',
  },
  templateQuickHint: {
    fontSize: '11px',
    color: B.textDim,
    margin: 0,
    fontFamily: '"IBM Plex Mono", monospace',
    lineHeight: 1.5,
  },
  templateApplyPanel: {
    border: `1px solid ${B.borderStrong}`,
    borderRadius: 10,
    backgroundColor: B.bgPanel,
    padding: '0.65rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  templateApplyActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  templateApplyGhost: {
    flex: 1,
    padding: '0.5rem',
    borderRadius: 8,
    border: `1px solid ${B.border}`,
    backgroundColor: B.bgCard,
    color: B.textSub,
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: '11px',
    cursor: 'pointer',
  },
  templateApplyText: {
    margin: 0,
    fontSize: '11px',
    lineHeight: 1.4,
    color: B.textSub,
    fontFamily: '"IBM Plex Mono", monospace',
  },
  templateApplyPrimary: {
    flex: 1,
    padding: '0.5rem',
    borderRadius: 8,
    border: `1px solid ${B.gold}`,
    backgroundColor: B.gold,
    color: B.buttonText,
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: '11px',
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
    gap: '0.35rem',
    marginTop: '0.3rem',
    marginBottom: '0.6rem',
    backgroundColor: B.bgCard,
    border: `1px solid ${B.border}`,
    borderRadius: 12,
    padding: '0.3rem',
    width: '100%',
    maxWidth: 460,
    marginInline: 'auto',
  },
  mobileTabBtn: {
    border: `1px solid ${B.border}`,
    backgroundColor: 'transparent',
    color: B.textSub,
    borderRadius: 9,
    padding: '0.45rem 0.6rem',
    fontSize: '12px',
    fontWeight: 500,
    fontFamily: '"IBM Plex Mono", monospace',
    cursor: 'pointer',
    flex: 1,
    minWidth: 80,
    textAlign: 'center',
    transition: 'all 0.18s ease',
  },
  mobileTabBtnActive: {
    backgroundColor: B.gold,
    color: B.buttonText,
    borderColor: B.gold,
    fontWeight: 700,
  },
  mobileCustomizerBtn: {
    width: '100%',
    marginTop: '0.45rem',
    padding: '0.55rem 0.7rem',
    borderRadius: 10,
    border: `1px solid ${B.gold}`,
    background: B.gold,
    color: B.buttonText,
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: '0.03em',
    cursor: 'pointer',
  },
  exportSection: {
    maxWidth: '1000px',
    margin: '0 auto',
  },
});

export default App;
