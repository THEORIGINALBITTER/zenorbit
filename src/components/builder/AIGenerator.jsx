import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { FaExclamationTriangle, FaCloud, FaTerminal, FaDownload } from 'react-icons/fa';
import ZenSelect from '../ui/ZenSelect';
import {
  AI_PROVIDERS,
  getAISettings,
  isAIConfigured,
  isLocalhostUrl,
  isRemoteHost,
  resetAISettings,
  testAIConnection,
  updateAISettings,
} from '../../orbify-ai/services/aiService';
import { getProviderHelp } from '../../orbify-ai/services/aiProviderHelpService';
import { generateMenuFromDescription } from '../../orbify-ai/services/menuGenerator';

// ── Constants ─────────────────────────────────────────────────────────────────

const AI_PROVIDER_OPTIONS = [
  { value: AI_PROVIDERS.ANTHROPIC, label: 'Claude (Anthropic)' },
  { value: AI_PROVIDERS.OPENAI,    label: 'OpenAI' },
  { value: AI_PROVIDERS.OLLAMA,    label: 'Ollama (lokal)' },
  { value: AI_PROVIDERS.CUSTOM,    label: 'Custom API' },
];

const AI_STYLE_OPTIONS = [
  { value: 'openai-compatible', label: 'OpenAI-kompatibel' },
  { value: 'anthropic',         label: 'Anthropic' },
];

const AI_MODEL_OPTIONS = {
  [AI_PROVIDERS.ANTHROPIC]: [
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
    { value: 'claude-3-5-haiku-20241022',  label: 'Claude 3.5 Haiku' },
    { value: 'claude-3-opus-20240229',     label: 'Claude 3 Opus' },
  ],
  [AI_PROVIDERS.OPENAI]: [
    { value: 'gpt-4o',       label: 'GPT-4o' },
    { value: 'gpt-4o-mini',  label: 'GPT-4o Mini' },
    { value: 'gpt-3.5-turbo',label: 'GPT-3.5 Turbo' },
  ],
  [AI_PROVIDERS.OLLAMA]: [
    { value: 'llama3.1:8b',    label: 'llama3.1:8b' },
    { value: 'llama3.1:latest',label: 'llama3.1:latest' },
    { value: 'mistral:latest', label: 'mistral:latest' },
    { value: 'phi3:latest',    label: 'phi3:latest' },
    { value: 'gemma:latest',   label: 'gemma:latest' },
  ],
  [AI_PROVIDERS.CUSTOM]: [
    { value: 'gpt-4o-mini',               label: 'gpt-4o-mini' },
    { value: 'claude-3-5-sonnet-20241022', label: 'claude-3-5-sonnet-20241022' },
    { value: 'llama-3.1-8b-instant',      label: 'llama-3.1-8b-instant' },
    { value: 'mixtral-8x7b-32768',        label: 'mixtral-8x7b-32768' },
  ],
};

const isHexColor = (value) => /^#([0-9A-Fa-f]{6})$/.test(value || '');

const normalizeAIMenuItems = (items = []) => {
  const valid = items.filter((item) => item && typeof item === 'object');
  if (valid.length === 0) return [];
  const total = Math.min(valid.length, 6);
  return valid.slice(0, total).map((item, index) => ({
    id: item.id ? String(item.id) : `ai-${Date.now()}-${index}`,
    label: String(item.label || `Item ${index + 1}`).slice(0, 16),
    angle: typeof item.angle === 'number' ? item.angle : Math.round((360 / total) * index),
    route: item.route || `/${String(item.label || `item-${index + 1}`).toLowerCase().replace(/\s+/g, '-')}`,
  }));
};

// ── Styles ────────────────────────────────────────────────────────────────────

const createStyles = (B) => ({
  aiCard: {
    backgroundColor: B.bgCard,
    border: `1px solid ${B.border}`,
    borderRadius: 14,
    padding: '1.25rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  aiCardTop: { display: 'flex', alignItems: 'flex-start', gap: '0.85rem', flexWrap: 'wrap' },
  aiCardTopMobile: { flexDirection: 'column', alignItems: 'stretch', gap: '0.65rem' },
  aiCardIcon: {
    width: 36, height: 36, borderRadius: 10,
    background: B.goldSoft, border: `1px solid ${B.goldDim}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, color: '#1a1a1a', flexShrink: 0,
  },
  aiCardTitle: {
    fontSize: 13, fontWeight: 700, color:'#1a1a1a',
    letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2,
  },
  aiCardSubtitle: { fontSize: 11, color: B.textSub, lineHeight: 1.5 },
  aiTopActions: {
    display: 'flex', gap: 8, flexShrink: 0,
    flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center',
  },
  aiTopActionsMobile: { width: '100%', justifyContent: 'stretch', gap: 6 },
  aiActionBtn: {
    borderRadius: 7, border: `1px solid ${B.border}`,
    backgroundColor: B.bgPanel, color: B.textSub,
    padding: '0.4rem 0.75rem', minHeight: 32,
    fontFamily: '"IBM Plex Mono", monospace', fontSize: '11px',
    cursor: 'pointer', whiteSpace: 'nowrap',
  },
  aiActionBtnMobile: { flex: 1, minWidth: 0, textAlign: 'center', padding: '0.52rem 0.6rem', fontSize: '12px' },
  aiActionBtnDisabled: { opacity: 0.6, cursor: 'not-allowed' },
  aiGuideBtn: {
    borderRadius: 7, border: `1px solid ${B.goldDim}`,
    backgroundColor: B.goldSoft, color: B.gold,
    padding: '0.4rem 0.75rem',
    fontFamily: '"IBM Plex Mono", monospace', fontSize: '11px',
    fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
  },
  aiSettingsCard: {
    border: `1px solid ${B.border}`, borderRadius: 10,
    backgroundColor: B.bgInput, padding: '0.75rem', display: 'grid', gap: '0.45rem',
  },
  aiFieldLabel: {
    color: B.textDim, fontFamily: '"IBM Plex Mono", monospace',
    fontSize: '10px', letterSpacing: '0.06em',
    textTransform: 'uppercase', marginTop: '0.25rem',
  },
  aiFieldInput: {
    width: '100%', boxSizing: 'border-box', borderRadius: 8,
    border: `1px solid ${B.border}`, backgroundColor: B.bgInput,
    color: B.text, padding: '0.5rem 0.65rem',
    fontFamily: '"IBM Plex Mono", monospace', fontSize: '12px', outline: 'none',
  },
  aiSelectWrap: { width: '100%' },
  aiHelpCard: {
    marginTop: '0.35rem', border: `1px solid ${B.borderStrong}`,
    borderRadius: 10, backgroundColor: B.bgCard,
    padding: '0.6rem 0.7rem', display: 'grid', gap: '0.5rem',
  },
  aiHelpTitle: {
    display: 'flex', alignItems: 'center', gap: 8,
    color: B.text, fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em',
  },
  aiHelpBadge: {
    border: `1px solid ${B.border}`, borderRadius: 999,
    padding: '2px 8px', fontSize: '9px', textTransform: 'uppercase',
    color: B.textDim, letterSpacing: '0.08em',
  },
  aiHelpList: { margin: 0, paddingLeft: '1rem', color: B.textSub, fontSize: '10px', lineHeight: 1.55 },
  aiHelpCommands: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  aiHelpCodeBtn: { border: 'none', padding: 0, margin: 0, background: 'transparent', display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' },
  aiHelpCode: {
    border: `1px solid ${B.border}`, borderRadius: 7,
    backgroundColor: B.bgInput, color: B.gold,
    fontFamily: '"IBM Plex Mono", monospace', fontSize: '10px', padding: '4px 7px',
  },
  aiHelpCopyLabel: {
    border: `1px solid ${B.border}`, borderRadius: 7,
    backgroundColor: B.bgPanel, color: B.textDim,
    fontFamily: '"IBM Plex Mono", monospace', fontSize: '9px',
    padding: '3px 6px', letterSpacing: '0.04em',
  },
  aiInputRow: { display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' },
  aiInputRowMobile: { flexDirection: 'column', alignItems: 'stretch', gap: '0.6rem' },
  aiTextarea: {
    flex: 1, minWidth: 0, minHeight: 150, resize: 'vertical', boxSizing: 'border-box',
    borderRadius: 10, border: `1px solid ${B.border}`,
    backgroundColor: B.bgInput, color: B.text,
    padding: '0.7rem 0.85rem', fontFamily: '"IBM Plex Mono", monospace',
    fontSize: '10px', outline: 'none', lineHeight: 1.6,
  },
  aiTextareaMobile: { width: '100%', minHeight: 132 },
  aiGenerateButton: {
    flexShrink: 0, borderRadius: 10, border: `1px solid ${B.gold}`,
    backgroundColor: '#1a1a1a', color: B.buttonText,
    fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700,
    fontSize: '13px', padding: '0.7rem 1.25rem',
    cursor: 'pointer', letterSpacing: '0.02em', whiteSpace: 'nowrap', alignSelf: 'flex-end',
  },
  aiGenerateButtonMobile: { width: '100%', alignSelf: 'stretch', textAlign: 'center', padding: '0.72rem 0.9rem' },
  aiGenerateButtonDisabled: { opacity: 0.6, cursor: 'not-allowed' },
  aiError: { margin: 0, color: B.danger, fontSize: '11px', fontFamily: '"IBM Plex Mono", monospace', whiteSpace: 'pre-line', lineHeight: 1.55 },
  aiInfo:  { margin: 0, color: B.success, fontSize: '11px', fontFamily: '"IBM Plex Mono", monospace' },
  aiWorkOverlay: {
    position: 'fixed', inset: 0, zIndex: 9500,
    backgroundColor: B.overlay,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem', backdropFilter: 'blur(2px)',
  },
  aiWorkPanel: {
    width: '100%', maxWidth: 560, borderRadius: 14,
    border: `1px solid ${B.borderAccent}`, backgroundColor: B.bgPanel,
    boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
    padding: '1.1rem 1.2rem', display: 'grid', gap: '0.7rem',
  },
  aiWorkLabel: { color: B.gold, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 },
  aiWorkTitle: { margin: 0, color: B.text, fontSize: '22px', lineHeight: 1.1 },
  aiWorkText:  { margin: 0, color: B.textSub, fontSize: '12px', lineHeight: 1.55 },
  aiWorkSteps: { display: 'grid', gap: 8, marginTop: '0.2rem' },
  aiWorkStepItem: {
    border: `1px solid ${B.border}`, borderRadius: 8,
    padding: '0.45rem 0.55rem', color: B.textDim,
    fontSize: '11px', backgroundColor: B.bgCard,
  },
  aiWorkStepItemActive: { borderColor: B.goldDim, color: B.text, backgroundColor: B.goldSoft },
});

// ── Component ─────────────────────────────────────────────────────────────────

export default function AIGenerator({ palette, isMobileLayout, onMenuGenerated }) {
  const B = palette;
  const styles = useMemo(() => createStyles(B), [B]);

  const [aiPrompt,      setAiPrompt]      = useState('');
  const [aiLoading,     setAiLoading]     = useState(false);
  const [aiTesting,     setAiTesting]     = useState(false);
  const [aiError,       setAiError]       = useState('');
  const [aiInfo,        setAiInfo]        = useState('');
  const [aiSettings,    setAiSettings]    = useState(() => getAISettings());
  const [showAISettings,setShowAISettings]= useState(false);
  const [showAIGuide,   setShowAIGuide]   = useState(false);
  const [copiedCommand, setCopiedCommand] = useState('');
  const [aiWorkStep,    setAiWorkStep]    = useState(0);

  useEffect(() => {
    if (!aiLoading) { setAiWorkStep(0); return; }
    const timer = window.setInterval(() => setAiWorkStep((prev) => (prev + 1) % 4), 900);
    return () => window.clearInterval(timer);
  }, [aiLoading]);

  const modelOptionsForProvider = useMemo(() => {
    const provider = aiSettings.provider || AI_PROVIDERS.ANTHROPIC;
    const base = AI_MODEL_OPTIONS[provider] || [];
    const current = (aiSettings.model || '').trim();
    if (current && !base.find((o) => o.value === current)) {
      return [{ value: current, label: current }, ...base];
    }
    return base;
  }, [aiSettings.provider, aiSettings.model]);

  const providerHelp = useMemo(() => getProviderHelp(aiSettings.provider), [aiSettings.provider]);

  const onProviderChange = (provider) => {
    const next = resetAISettings(provider);
    setAiSettings(next);
    setAiInfo(`Provider gewechselt: ${provider}`);
  };

  const onSettingChange = (key, value) => {
    const next = updateAISettings({ [key]: value });
    setAiSettings(next);
  };

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
    if (text.toLowerCase().includes('does not support chat') && aiSettings.provider === AI_PROVIDERS.OLLAMA) {
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
      setAiError('Kopieren fehlgeschlagen.');
    }
  };

  const applyAIGeneratedMenu = async () => {
    const prompt = aiPrompt.trim();
    if (!prompt) { setAiError('Bitte beschreibe zuerst dein Menü.'); return; }
    if (!isAIConfigured()) { setAiError('AI ist nicht konfiguriert. Bitte Provider und API Key eintragen.'); return; }

    setAiLoading(true);
    setAiError('');
    setAiInfo('');

    const result = await generateMenuFromDescription(prompt, {
      websiteType: 'general', maxItems: 6, includeSubmenus: false,
    });
    setAiLoading(false);

    if (!result.success) { setAiError(result.error || 'Generierung fehlgeschlagen.'); return; }

    const generated = normalizeAIMenuItems(result.menu?.menuItems || []);
    if (generated.length === 0) { setAiError('Die KI hat keine nutzbaren Menüeinträge geliefert.'); return; }

    setAiInfo(`KI-Menü angewendet (${generated.length} Items).`);

    const paletteCandidate = result.menu?.suggestions?.accentColor
      || result.menu?.suggestions?.primaryColor
      || result.menu?.colors?.primary
      || '';

    onMenuGenerated({
      items: generated,
      accentColor: isHexColor(paletteCandidate) ? paletteCandidate : null,
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div style={styles.aiCard}>
        {/* Header */}
        <div style={{ ...styles.aiCardTop, ...(isMobileLayout ? styles.aiCardTopMobile : {}) }}>

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

        {/* Settings panel */}
        {showAISettings && (
          <div style={styles.aiSettingsCard}>
            {isRemoteHost() && isLocalhostUrl(aiSettings.endpoint) && (
              <div style={{ background: '#fff8e6', border: '1px solid #f0c040', borderRadius: 8, padding: '12px 14px', marginBottom: 14, fontSize: 12, color: '#5a4200', lineHeight: 1.6 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <FaExclamationTriangle style={{ color: '#e0a000', flexShrink: 0 }} />
                  Ollama ist nicht erreichbar
                </div>
                <p style={{ margin: '0 0 10px', fontSize: 11 }}>
                  Du greifst remote auf diese App zu, aber Ollama läuft lokal auf deinem Rechner. Der Browser blockiert solche Anfragen.
                </p>
                <div style={{ fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FaCloud style={{ fontSize: 11 }} /> Option 1 — Cloud-Provider
                  <span style={{ fontWeight: 400, fontSize: 10, color: '#9a7a30' }}>(einfachste Lösung)</span>
                </div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => onProviderChange(AI_PROVIDERS.ANTHROPIC)} style={{ padding: '5px 12px', fontSize: 11, borderRadius: 4, border: '1px solid #c8a840', background: '#fffbf0', cursor: 'pointer', fontWeight: 600 }}>
                    Anthropic wählen
                  </button>
                  <button type="button" onClick={() => onProviderChange(AI_PROVIDERS.OPENAI)} style={{ padding: '5px 12px', fontSize: 11, borderRadius: 4, border: '1px solid #c8a840', background: '#fffbf0', cursor: 'pointer', fontWeight: 600 }}>
                    OpenAI wählen
                  </button>
                </div>
                <div style={{ fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FaTerminal style={{ fontSize: 11 }} /> Option 2 — Ollama per ngrok erreichbar machen
                </div>
                <p style={{ margin: '0 0 8px', fontSize: 11, color: '#7a5a10' }}>
                  Setup-Script herunterladen — es richtet alles automatisch ein und zeigt die fertige URL an.
                </p>
                <a href="/ZenOrbit-Ollama-Setup.pkg" download="ZenOrbit-Ollama-Setup.pkg" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 10, padding: '6px 14px', fontSize: 12, fontWeight: 700, borderRadius: 5, border: '1px solid #c8a840', background: '#fffbf0', color: '#5a4200', textDecoration: 'none', cursor: 'pointer' }}>
                  <FaDownload style={{ fontSize: 11 }} />
                  ZenOrbit Ollama Setup herunterladen (.pkg)
                </a>
                <ol style={{ margin: '0 0 8px', paddingLeft: 16, fontSize: 11, lineHeight: 1.8 }}>
                  <li>Installer herunterladen und öffnen</li>
                  <li>Installation durchführen</li>
                  <li><strong>„ZenOrbit Ollama Start"</strong> auf dem Desktop öffnen</li>
                  <li>Angezeigte <code style={{ background: '#ffedb0', padding: '1px 4px', borderRadius: 3 }}>https://…ngrok-free.app</code> URL hier als Endpoint eintragen</li>
                </ol>
                <p style={{ margin: 0, fontSize: 10, color: '#9a7a30' }}>
                  Voraussetzung: macOS mit <a href="https://ollama.com/download" target="_blank" rel="noreferrer" style={{ color: '#8a6a20' }}>Ollama</a> installiert · ngrok wird automatisch eingerichtet · Free-URL ändert sich bei Neustart
                </p>
              </div>
            )}

            <label style={styles.aiFieldLabel}>Provider</label>
            <ZenSelect value={aiSettings.provider} onChange={onProviderChange} options={AI_PROVIDER_OPTIONS} style={styles.aiSelectWrap} />
            <label style={styles.aiFieldLabel}>Endpoint</label>
            <input value={aiSettings.endpoint || ''} onChange={(e) => onSettingChange('endpoint', e.target.value)} style={styles.aiFieldInput} placeholder="https://..." />
            <label style={styles.aiFieldLabel}>Model</label>
            <ZenSelect value={aiSettings.model || ''} onChange={(next) => onSettingChange('model', next)} options={modelOptionsForProvider} style={styles.aiSelectWrap} />
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
                {providerHelp.steps.map((step) => <li key={step}>{step}</li>)}
              </ul>
              {providerHelp.commands.length > 0 && (
                <div style={styles.aiHelpCommands}>
                  {providerHelp.commands.map((command) => (
                    <button key={command} type="button" onClick={() => copyCommand(command)} style={styles.aiHelpCodeBtn} title="Befehl kopieren">
                      <code style={styles.aiHelpCode}>{command}</code>
                      <span style={styles.aiHelpCopyLabel}>{copiedCommand === command ? 'Kopiert' : 'Copy'}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Prompt + Generate */}
        <div style={{ ...styles.aiInputRow, ...(isMobileLayout ? styles.aiInputRowMobile : {}) }}>
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="z. B. Premium SaaS Interface mit Home, Product, Cases, Journal und Contact."
            style={{ ...styles.aiTextarea, ...(isMobileLayout ? styles.aiTextareaMobile : {}) }}
          />
          <button type="button" onClick={applyAIGeneratedMenu} disabled={aiLoading} style={{ ...styles.aiGenerateButton, ...(isMobileLayout ? styles.aiGenerateButtonMobile : {}), ...(aiLoading ? styles.aiGenerateButtonDisabled : {}) }}>
            {aiLoading ? 'Generiert…' : 'Mit KI bauen →'}
          </button>
        </div>

        {aiError && <p style={styles.aiError}>{getReadableAIError(aiError)}</p>}
        {aiInfo  && <p style={styles.aiInfo}>{aiInfo}</p>}
      </div>

      {/* Guide modal — portal */}
      {showAIGuide && createPortal(
        <div onClick={() => setShowAIGuide(false)} style={{ position: 'fixed', inset: 0, zIndex: 9000, backgroundColor: B.overlay, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: B.bgPanel, border: `1px solid ${B.borderAccent}`, borderRadius: 16, width: '100%', maxWidth: 620, maxHeight: '88vh', overflowY: 'auto', padding: '1.5rem', fontFamily: '"IBM Plex Mono", monospace', position: 'relative' }}>
            <button onClick={() => setShowAIGuide(false)} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', color: B.textDim, fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>✕</button>
            <div style={{ color: B.gold, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4, fontWeight: 700 }}>AI Provider</div>
            <h2 style={{ margin: '0 0 1.2rem', fontSize: 20, color: B.text, fontWeight: 700, lineHeight: 1.2 }}>Signature Setup</h2>
            {[
              { name: 'Claude (Anthropic)', color: '#C8A96E', steps: ['Erstelle einen Account unter console.anthropic.com.', 'Lege unter "API Keys" einen neuen Key an.', 'Sichere den Key direkt, er wird nur einmal vollständig angezeigt.', 'Setze im Builder den Provider auf Claude (Anthropic).', 'Hinterlege den Key im Feld "API Key".', 'Empfohlene Modelle: claude-3-5-sonnet-20241022 oder ein aktuelles Sonnet/Haiku-Profil.', 'Endpoint leer lassen, ZenOrbit setzt ihn automatisch.'] },
              { name: 'OpenAI', color: '#74AA9C', steps: ['Melde dich bei platform.openai.com an.', 'Erstelle unter "API Keys" einen neuen Secret Key.', 'Übernimm den Key direkt in deine sichere Ablage.', 'Wähle im Builder den Provider OpenAI.', 'Trage den Key in "API Key" ein.', 'Empfohlene Modelle: gpt-4o für Qualität, gpt-4o-mini für Effizienz.', 'Endpoint leer lassen, der Standard wird automatisch verwendet.'] },
              { name: 'Ollama (lokal)', color: '#7EB8D4', steps: ['Voraussetzung: macOS mit Ollama installiert (ollama.com/download).', 'Provider auf Ollama wählen → im Fehler-Overlay „ZenOrbit Ollama Setup" (.pkg) herunterladen und öffnen.', '„ZenOrbit Ollama Start" auf dem Desktop doppelklicken — Terminal startet automatisch.', 'Die angezeigte https://…ngrok-free.app/v1/chat/completions URL kopieren.', 'Provider → Custom API, URL als Endpoint eintragen. API-Key leer lassen.', 'Modellnamen eintragen, der beim Start geladen wurde — z. B. llama3.2:3b.', 'Hinweis: Free-URL ändert sich bei jedem Neustart — Endpoint nach jeder Session aktualisieren.'] },
              { name: 'Custom API', color: '#A889C8', steps: ['Wähle im Builder den Provider Custom API.', 'Trage die vollständige Endpoint-URL des Anbieters ein.', 'Setze den API-Style passend zur Schnittstelle: OpenAI-kompatibel oder Anthropic.', 'Hinterlege den API-Key, sofern vom Anbieter verlangt.', 'Trage die exakte Model-ID des Zielmodells ein.', 'Typische Anbieter: Groq, Together AI, Mistral, Fireworks oder interne Enterprise-Gateways.'] },
            ].map((provider) => (
              <div key={provider.name} style={{ marginBottom: '1.2rem', border: `1px solid ${B.border}`, borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ padding: '0.55rem 0.9rem', backgroundColor: provider.color + '26', borderBottom: `1px solid ${B.border}`, fontSize: 12, fontWeight: 700, color: B.text, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{provider.name}</div>
                <div style={{ padding: '0.75rem 0.9rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {provider.steps.map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: '50%', backgroundColor: provider.color + '33', color: B.text, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${provider.color}77` }}>{i + 1}</span>
                      <span style={{ fontSize: 12, color: B.text, lineHeight: 1.6 }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <p style={{ margin: 0, fontSize: 10, color: B.textSub, lineHeight: 1.6 }}>Security Note: API-Keys bleiben lokal im Browserprofil und werden nicht an ZenOrbit-Server übertragen.</p>
              <a href="/guide#ai-provider" onClick={() => setShowAIGuide(false)} style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', padding: '0.45rem 0.9rem', borderRadius: 8, backgroundColor: B.gold, color: B.buttonText, fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                Signature Guide öffnen →
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Loading overlay — portal */}
      {aiLoading && createPortal(
        <div style={styles.aiWorkOverlay}>
          <div style={styles.aiWorkPanel}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={styles.aiWorkLabel}>Builder Orbit KI Work Screen</div>
              <button
                type="button"
                onClick={() => setAiLoading(false)}
                style={{ background: 'none', border: 'none', color: B.textDim, fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: '0 2px' }}
                title="Abbrechen"
              >✕</button>
            </div>
            <h3 style={styles.aiWorkTitle}>Orbit Menü wird generiert…</h3>
            <p style={styles.aiWorkText}>Einen Moment. Wir kuratieren Struktur, Labels und Flow für deine Signature Navigation.</p>
            <div style={styles.aiWorkSteps}>
              {['Direction analysieren', 'Menüarchitektur kuratieren', 'Navigation strukturieren', 'Signature anwenden'].map((label, index) => (
                <div key={label} style={{ ...styles.aiWorkStepItem, ...(index <= aiWorkStep ? styles.aiWorkStepItemActive : {}) }}>
                  {index + 1}. {label}
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
