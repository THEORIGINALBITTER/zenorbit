import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import LivePreview from '../components/builder/LivePreview';
import VisualEditor from '../components/builder/VisualEditor';
import MenuItemEditor from '../components/builder/MenuItemEditor';
import TemplateSelector from '../components/builder/TemplateSelector';
import ExportPanel from '../components/builder/ExportPanel';
import AIGenerator from '../components/builder/AIGenerator';
import IntentScenarioPanel from '../components/builder/IntentScenarioPanel';
import SeoHelmet from '../components/seo/SeoHelmet';
import ZenSelect from '../components/ui/ZenSelect';
import { menuTemplates } from '../templates/menuTemplates';
import { orbitMenuConfig } from '../config/orbitMenuConfig';
import { useTheme } from '../contexts/ThemeContext';
import {
  getIntentPreviewScenario,
  INTENT_PREVIEW_SCENARIOS,
  resolveZenOrbitMenu,
} from '../orbify-ai/intent';

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

const getLayoutAngles = (layout, count) => {
  if (count <= 1) return [0];
  if (layout === 'compact') return spreadAngles(-40, 40, count);
  if (layout === 'arc') return spreadAngles(-65, 65, count);
  return spreadAngles(-90, 90, count);
};

const spreadAngles = (start, end, count) => {
  if (count <= 1) return [0];
  const step = (end - start) / (count - 1);
  return Array.from({ length: count }, (_, index) => Math.round(start + (index * step)));
};

const mapDecisionToMenuItems = (decision) => {
  const angles = getLayoutAngles(decision.layout, decision.items.length);
  return decision.items.map((item, index) => ({
    id: String(item.id),
    label: item.label,
    angle: angles[index] ?? 0,
    route: item.route,
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
  const [logoMode, setLogoMode] = useState('image');
  const [logoText, setLogoText] = useState('');
  const [logoTextColor, setLogoTextColor] = useState('#ffffff');
  const [logoTextFont, setLogoTextFont] = useState('"IBM Plex Mono", monospace');
  const [selectedTemplateId, setSelectedTemplateId] = useState('default');
  const [pendingTemplateId, setPendingTemplateId] = useState(null);
  const [autoOpenSignal, setAutoOpenSignal] = useState(0);
  const [openPanels, setOpenPanels] = useState({ template: true, logo: false, design: false, intent: false, items: false });
  const [intentPreviewEnabled, setIntentPreviewEnabled] = useState(false);
  const [intentScenarioKey, setIntentScenarioKey] = useState('guest-new');
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
    setLogoDraft(logoSrc);
  }, [logoSrc]);

  const togglePanel = (key) => {
    setOpenPanels((prev) => {
      const opening = !prev[key];
      if (opening) setAutoOpenSignal((s) => s + 1);
      return { template: false, logo: false, design: false, intent: false, items: false, [key]: opening };
    });
  };

  const activeIntentScenario = useMemo(
    () => getIntentPreviewScenario(intentScenarioKey),
    [intentScenarioKey]
  );

  const intentDecision = useMemo(
    () => resolveZenOrbitMenu(activeIntentScenario?.context || {}),
    [activeIntentScenario]
  );

  const previewMenuItems = useMemo(
    () => (intentPreviewEnabled ? mapDecisionToMenuItems(intentDecision) : menuItems),
    [intentPreviewEnabled, intentDecision, menuItems]
  );

  const previewMeta = useMemo(
    () => (
      intentPreviewEnabled
        ? {
            mode: 'Adaptive Intent',
            scenario: activeIntentScenario?.label || '',
            reason: intentDecision.reason,
            layout: intentDecision.layout,
          }
        : null
    ),
    [intentPreviewEnabled, activeIntentScenario, intentDecision]
  );

  const applyIntentDecision = () => {
    setMenuItems(mapDecisionToMenuItems(intentDecision));
    setAutoOpenSignal((prev) => prev + 1);
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
    const transferItems = menuItems.map(item => ({
      id: String(item.id),
      angle: typeof item.angle === 'number' ? item.angle : 0,
      label: item.label,
      action: item.route ? 'route' : 'openOverlay',
      route: item.route || '',
    }));
    const transfer = {
      radius: config.visual.radius,
      menuOffset: config.visual.menuOffset,
      buttonSize: config.visual.button?.width || 64,
      logoStiffness: config.animation.logo.stiffness,
      logoDamping: config.animation.logo.damping,
      accentColor,
      logoSrc: logoMode === 'image' ? (logoSrc || '') : '',
      logoText: logoMode === 'text' ? logoText : '',
      logoTextFont: logoMode === 'text' ? logoTextFont : '',
      menuItems: transferItems,
    };
    localStorage.setItem(CUSTOMIZER_TRANSFER_KEY, JSON.stringify(transfer));
    try {
      const existing = localStorage.getItem('customizerDraft_v1');
      const draft = existing ? JSON.parse(existing) : {};
      draft.menuItems = transferItems;
      if (logoMode === 'text' && logoText) {
        draft.logoText = logoText;
        draft.logoType = 'text';
        if (logoTextFont) draft.logoFontFamily = logoTextFont;
      } else if (logoMode === 'image' && logoSrc) {
        draft.logoImage = logoSrc;
        draft.logoType = 'image';
      }
      localStorage.setItem('customizerDraft_v1', JSON.stringify(draft));
    } catch { /* ignore */ }
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
              <h1 style={styles.stepHeadline}>Definiere mit KI.</h1>
              <p style={styles.stepSubtitle}>
                Starte mit einer KI-kuratierten Struktur.
              </p>
            </div>

               {/* ── AI Generator ── */}
            <AIGenerator
              palette={B}
              isMobileLayout={isMobileLayout}
              onMenuGenerated={({ items, accentColor: newAccent }) => {
                setMenuItems(items);
                if (newAccent) setAccentColor(newAccent);
                setCurrentStep(2);
              }}
            />
 <div style={styles.stepHeader}>
   
              <h1 style={styles.stepHeadline}>Definiere mit Vorlagen.</h1>
              <p style={styles.stepSubtitle}>
                Wähle eine gestalterische Basis Struktur.
              </p>
            </div>

            {/* ── Template grid ── */}
            <TemplateSelector onSelectTemplate={handleTemplateSelect} />

         

            <button onClick={() => setCurrentStep(2)} 
            style={styles.skipButton}>
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
                      menuItems={previewMenuItems}
                      accentColor={accentColor}
                      logoSrc={logoMode === 'image' ? logoDraft : ''}
                      logoText={logoMode === 'text' ? logoText : ''}
                      logoTextColor={logoTextColor}
                      logoTextFont={logoTextFont}
                      autoOpenSignal={autoOpenSignal}
                      isMobile={isMobileLayout}
                      previewMeta={previewMeta}
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
                      {/* Mode Toggle */}
                      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                        {[{ key: 'image', label: 'Bild' }, { key: 'text', label: 'Text' }].map(({ key, label }) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setLogoMode(key)}
                            style={{
                              flex: 1, padding: '5px 0', borderRadius: 6,
                              border: `1px solid ${logoMode === key ? B.gold : B.border}`,
                              background: logoMode === key ? B.goldSoft : 'transparent',
                              color: logoMode === key ? B.gold : B.textDim,
                              fontSize: 11, fontFamily: '"IBM Plex Mono", monospace',
                              cursor: 'pointer', fontWeight: logoMode === key ? 700 : 400,
                              letterSpacing: '0.04em',
                            }}
                          >{label}</button>
                        ))}
                      </div>

                      {logoMode === 'text' ? (
                        <>
                          <input
                            type="text"
                            placeholder="z. B. 軌 oder Initialen"
                            value={logoText}
                            onChange={(e) => setLogoText(e.target.value)}
                            style={{ ...styles.templateQuickSelect }}
                          />
                          {/* Farbe */}
                          <label style={{ ...styles.templateQuickLabel, marginTop: 10 }}>Farbe</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                            <input
                              type="color"
                              value={logoTextColor}
                              onChange={(e) => setLogoTextColor(e.target.value)}
                              style={{ width: 32, height: 32, borderRadius: 6, border: `1px solid ${B.border}`, padding: 2, background: 'none', cursor: 'pointer', flexShrink: 0 }}
                            />
                            <input
                              type="text"
                              value={logoTextColor}
                              onChange={(e) => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setLogoTextColor(e.target.value); }}
                              style={{ ...styles.templateQuickSelect, margin: 0, flex: 1 }}
                              maxLength={7}
                            />
                          </div>
                          {/* Schrift */}
                          <label style={{ ...styles.templateQuickLabel, marginTop: 10 }}>Schrift</label>
                          <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                            {[
                              { label: 'Mono', value: '"IBM Plex Mono", monospace' },
                              { label: 'Serif', value: 'Georgia, serif' },
                              { label: 'Sans', value: 'system-ui, sans-serif' },
                            ].map(({ label, value }) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() => setLogoTextFont(value)}
                                style={{
                                  flex: 1, padding: '5px 0', borderRadius: 6,
                                  border: `1px solid ${logoTextFont === value ? B.gold : B.border}`,
                                  background: logoTextFont === value ? B.goldSoft : 'transparent',
                                  color: logoTextFont === value ? B.gold : B.textDim,
                                  fontSize: 11, fontFamily: value,
                                  cursor: 'pointer', fontWeight: logoTextFont === value ? 700 : 400,
                                }}
                              >{label}</button>
                            ))}
                          </div>
                          {logoText && (
                            <button
                              type="button"
                              onClick={() => setLogoText('')}
                              style={{ ...styles.templateApplyGhost, marginTop: 10, width: '100%' }}
                            >
                              Text entfernen ✕
                            </button>
                          )}
                        </>
                      ) : (
                        <>
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
                        </>
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

                    <AccordionSection title="Adaptive Intent" isOpen={openPanels.intent} onToggle={() => togglePanel('intent')} palette={B}>
                      <IntentScenarioPanel
                        palette={B}
                        enabled={intentPreviewEnabled}
                        scenarioKey={intentScenarioKey}
                        scenarios={INTENT_PREVIEW_SCENARIOS}
                        context={activeIntentScenario?.context}
                        decision={intentDecision}
                        onEnabledChange={(next) => {
                          setIntentPreviewEnabled(next);
                          setAutoOpenSignal((prev) => prev + 1);
                        }}
                        onScenarioChange={(next) => {
                          setIntentScenarioKey(next);
                          setIntentPreviewEnabled(true);
                          setAutoOpenSignal((prev) => prev + 1);
                        }}
                        onApplyDecision={applyIntentDecision}
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
  textDim:     '#1a1a1a',
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
