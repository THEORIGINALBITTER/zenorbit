import { Profiler, useCallback, useState, useEffect, useRef, useMemo } from 'react';
import * as FaIcons from 'react-icons/fa';
import { createPortal } from 'react-dom';
import { useOrbitMenuConfig } from '../hooks/useOrbitMenuConfig';
import { generateStandaloneComponent, generateInstallationGuide, generateCSS, generateHTMLPackage, generateProjectJson } from '../utils/codeGenerator';
import JSZip from 'jszip';
import { orbitMenuPresets } from '../config/orbitMenuConfig';
import { zenPalette as darkPalette } from '../styles/zenPalette';
import SeoHelmet from '../components/seo/SeoHelmet';
import { useTheme } from '../contexts/ThemeContext';
import { useLicense } from '../hooks/useLicense';
import FontSourceField from '../components/ui/FontSourceField';
import ItemMotionControls, {
  DEFAULT_ITEM_MOTION_BEZIER,
  resolveItemMotionBezier,
} from '../components/ui/ItemMotionControls';
import IntentScenarioPanel from '../components/builder/IntentScenarioPanel';
import {
  getIntentPreviewScenario,
  INTENT_PREVIEW_SCENARIOS,
  resolveZenOrbitMenu,
} from '../orbify-ai/intent';

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

const CUSTOMIZER_LIGHT = {
  bg: '#f2ede3',
  bgCreme: '#d9d4c5',
  bgMuted: '#e2dbce',
  panel: '#d8d1c4',
  panelSoft: '#e3ddd1',
  border: 'rgba(30,24,16,0.16)',
  borderStrong: 'rgba(30,24,16,0.24)',
  text: '#1a1710',
  textMenu1: '#2f261d',
  textMuted: '#6f6658',
  textMenu: '#6f5332',
  gold: '#8e7657',
  goldSoft: '#c8b59b',
  danger: '#b24d4d',
  success: '#2f7a4c',
};

const getExportSectionLabel = (palette) => ({
  fontSize: 9,
  fontFamily: '"IBM Plex Mono", monospace',
  fontWeight: 700,
  color: palette.textMuted,
  textTransform: 'uppercase',
  letterSpacing: '0.2em',
  marginTop: 18,
  marginBottom: 12,
  paddingBottom: 6,
  borderBottom: `1px solid ${palette.border}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const TYPE_FAMILY_OPTIONS = [
  { label: 'IBM Plex Mono', value: '"IBM Plex Mono", monospace' },
  { label: 'IBM Plex Sans', value: '"IBM Plex Sans", sans-serif' },
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'System Sans', value: 'system-ui, sans-serif' },
  { label: 'System Mono', value: 'ui-monospace, SFMono-Regular, monospace' },
];

const PREVIEW_DEVICE_OPTIONS = [
  { key: 'desktop', label: 'Desktop' },
  { key: 'ipadPortrait', label: 'iPad Hoch' },
  { key: 'ipadLandscape', label: 'iPad Quer' },
  { key: 'mobile', label: 'Mobile' },
];

const PREVIEW_DEVICE_BUTTON_SIZE_LIMITS = {
  desktop: { min: 40, max: 96 },
  ipadPortrait: { min: 40, max: 88 },
  ipadLandscape: { min: 40, max: 90 },
  mobile: { min: 36, max: 72 },
};

const clampNumber = (value, min, max, fallback) => {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
};

const deriveLegacyItemMotion = (stiffness = 260, damping = 20, staggerDelay = 0.05) => {
  const stiffnessT = clampNumber((stiffness - 100) / 400, 0, 1, 0.4);
  const dampingT = clampNumber((damping - 10) / 70, 0, 1, 0.14);
  const duration = Math.max(0.3, 0.85 - (stiffnessT * 0.35) + (dampingT * 0.08));
  const overshootY = Math.max(1.02, 1.42 - (dampingT * 0.38));
  return {
    duration,
    stagger: clampNumber(staggerDelay, 0, 0.2, 0.05),
    bezier: [0.34, Number(overshootY.toFixed(2)), 0.64, 1],
  };
};

const spreadAdaptiveAngles = (start, end, count) => {
  if (count <= 1) return [0];
  const step = (end - start) / (count - 1);
  return Array.from({ length: count }, (_, index) => Math.round(start + (index * step)));
};

const getAdaptiveLayoutAngles = (layout, count) => {
  if (layout === 'compact') return spreadAdaptiveAngles(-40, 40, count);
  if (layout === 'arc') return spreadAdaptiveAngles(-65, 65, count);
  return spreadAdaptiveAngles(-90, 90, count);
};

const mapDecisionToCustomizerItems = (decision) => {
  const angles = getAdaptiveLayoutAngles(decision.layout, decision.items.length);
  return decision.items.map((item, index) => ({
    id: String(item.id),
    angle: angles[index] ?? 0,
    label: item.label,
    action: item.action === 'checkout' ? 'route' : (item.action || 'route'),
    route: item.route || '',
  }));
};

const AccordionSection = ({ title, badge, isOpen, onToggle, children, palette }) => (
  <div style={{
    backgroundColor: palette.panel,
    border: `1px solid ${isOpen ? palette.gold : palette.border}`,
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
        color: isOpen ? palette.gold : palette.textMuted,
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
            backgroundColor: `${palette.gold}22`,
            color: palette.gold,
            borderRadius: 99,
            fontWeight: 700,
          }}>{badge}</span>
        )}
      </span>
      <span style={{ fontSize: 11, transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', lineHeight: 1, color: palette.textMuted }}>▾</span>
    </button>
    {isOpen && (
      <div style={{ padding: '0.75rem 0.9rem', borderTop: `1px solid ${palette.border}` }}>
        {children}
      </div>
    )}
  </div>
);

const SliderRow = ({ label, value, min, max, step = 1, onChange, unit = '', palette, alert = false, disabled = false }) => (
  <div style={{ marginBottom: '1rem', opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
      <label style={{ fontSize: 10, color: disabled ? palette.textDim : (alert ? palette.danger : palette.textMuted), fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.04em', fontWeight: alert ? 700 : 400 }}>{label}</label>
      <span style={{ fontSize: 11, color: disabled ? palette.textDim : (alert ? palette.danger : palette.gold), fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700 }}>
        {value}{unit}
      </span>
    </div>
    <input
      className="zen-slider"
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      disabled={disabled}
      style={{ width: '100%', accentColor: disabled ? palette.textDim : (alert ? palette.danger : palette.gold), cursor: disabled ? 'not-allowed' : 'pointer', display: 'block' }}
    />
  </div>
);

const InlineSectionCard = ({ title, hint, children, palette }) => (
  <div style={{
    marginBottom: '1rem',
    padding: '0.75rem',
    borderRadius: 8,
    border: `1px solid ${palette.border}`,
    backgroundColor: palette.panelSoft,
  }}>
    <div style={{
      fontSize: 10,
      color: palette.text,
      fontFamily: '"IBM Plex Mono", monospace',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      marginBottom: 4,
      fontWeight: 700,
    }}>
      {title}
    </div>
    {hint && (
      <div style={{
        fontSize: 9,
        color: palette.textMuted,
        fontFamily: 'monospace',
        lineHeight: 1.5,
        marginBottom: 8,
      }}>
        {hint}
      </div>
    )}
    {children}
  </div>
);

const SectionLabel = ({ children, palette }) => (
  <div style={{
    fontSize: 9,
    fontFamily: '"IBM Plex Mono", monospace',
    fontWeight: 700,
    color: palette.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    marginTop: 18,
    marginBottom: 12,
    paddingBottom: 6,
    borderBottom: `1px solid ${palette.border}`,
  }}>{children}</div>
);

const PreviewDeviceChrome = ({
  device,
  isDark,
  zenPalette,
  isManualOpen,
  togglePreview,
  buttonSize,
  radius,
  scrollSimActive,
  setScrollSimActive,
  setScrollEnabled,
  openScrollingPanel,
  isOffsetOutsideBounds,
  snapOffsetsIntoBounds,
  perfMonitorEnabled,
  setPerfMonitorEnabled,
  setPreviewActualSize,
}) => {
  const DEVICE_BG = '#0f0f10';
  if (device === 'desktop') {
    const barBg = isDark ? 'rgba(28,28,30,0.98)' : 'rgba(236,236,240,0.98)';
    const barBorder = isDark ? '#3a3a3c' : '#c8c8cc';
    const urlBarBg = isDark ? '#2c2c2e' : '#ffffff';
    const urlTextColor = isDark ? '#8e8e93' : '#636366';
    return (
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 50, borderRadius: 8, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 46,
          background: barBg, borderBottom: `1px solid ${barBorder}`,
          display: 'flex', alignItems: 'center', padding: '0 10px', gap: 8,
        }}>
          <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }} />
          </div>
          <div style={{ flex: 1, height: 24, background: urlBarBg, borderRadius: 6, display: 'flex', alignItems: 'center', padding: '0 8px', gap: 5, opacity: 0.9 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#34c759', flexShrink: 0 }} />
            <span style={{ fontSize: 9, color: urlTextColor, fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.01em', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              zenorbit.denisbitter.de
            </span>
          </div>
        </div>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 36,
          background: barBg, borderTop: `1px solid ${barBorder}`,
          display: 'flex', alignItems: 'center', padding: '0 10px', gap: 6,
          pointerEvents: 'auto', zIndex: 60,
        }}>
          <button onClick={togglePreview} style={{
            padding: '2px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 8,
            fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.04em',
            backgroundColor: isManualOpen ? '#eb4e05' : 'transparent',
            color: isManualOpen ? (isDark ? '#f1eadc' : '#2a1e10') : (isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'),
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`,
          }}>{isManualOpen ? 'CLOSE' : 'OPEN'}</button>
          <span style={{ fontSize: 8, fontFamily: 'monospace', color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)', letterSpacing: '0.03em' }}>
            {buttonSize}px · r{radius}
          </span>
          <div style={{ flex: 1 }} />
          <button onClick={() => {
            const next = !scrollSimActive;
            setScrollSimActive(next);
            setScrollEnabled(next);
            if (next) openScrollingPanel();
          }} style={{
            padding: '2px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 8,
            fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.04em',
            backgroundColor: scrollSimActive ? '#42cd23' : 'transparent',
            color: scrollSimActive ? (isDark ? '#f1eadc' : '#2a1e10') : (isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'),
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`,
          }}>{scrollSimActive ? 'SCROLL ●' : 'SCROLL'}</button>
          {isOffsetOutsideBounds && (
            <button onClick={snapOffsetsIntoBounds} style={{
              padding: '2px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 8,
              fontFamily: 'monospace', fontWeight: 700,
              backgroundColor: 'rgba(208,103,103,0.28)', color: '#ffd6d6',
              border: '1px solid rgba(255,172,172,0.7)',
            }}>SNAP</button>
          )}
          <button onClick={() => setPerfMonitorEnabled((p) => !p)} style={{
            padding: '2px 6px', borderRadius: 4, cursor: 'pointer', fontSize: 10,
            fontFamily: 'monospace', fontWeight: 700,
            border: `1px solid ${perfMonitorEnabled ? (isDark ? '#d0cbb8' : '#8e7657') : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)')}`,
            backgroundColor: perfMonitorEnabled ? (isDark ? 'rgba(208,203,184,0.15)' : 'rgba(142,118,87,0.12)') : 'transparent',
            color: perfMonitorEnabled ? (isDark ? '#d0cbb8' : '#8e7657') : (isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'),
          }}>⚡ Perfomance {perfMonitorEnabled ? 'ON' : 'OFF'}</button>
          <button onClick={() => setPreviewActualSize(true)} style={{
            padding: '2px 6px', borderRadius: 4, cursor: 'pointer', fontSize: 10,
            fontFamily: 'monospace', fontWeight: 700,
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`,
            backgroundColor: 'transparent',
            color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
          }}>100% VIEW</button>
        </div>
      </div>
    );
  }

  if (device === 'ipadPortrait' || device === 'ipadLandscape') {
    const bezel = device === 'ipadPortrait' ? 18 : 14;
    const radius = bezel + 6;
    return (
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 50, borderRadius: radius, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: bezel, background: DEVICE_BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#222', border: '1px solid #333' }} />
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: bezel, background: DEVICE_BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 30, height: 3, borderRadius: 2, background: '#2a2a2c' }} />
        </div>
        <div style={{ position: 'absolute', top: bezel, bottom: bezel, left: 0, width: bezel, background: DEVICE_BG }} />
        <div style={{ position: 'absolute', top: bezel, bottom: bezel, right: 0, width: bezel, background: DEVICE_BG }} />
      </div>
    );
  }

  if (device === 'mobile') {
    return (
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 50, borderRadius: 44, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 50, background: DEVICE_BG, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 10 }}>
          <div style={{ position: 'relative', width: 100, height: 26, borderRadius: 13, background: '#000', border: '0.5px solid #1e1e20' }}>
            <div style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', width: 9, height: 9, borderRadius: '50%', background: '#0d0d0f', border: '1px solid #222' }} />
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 34, background: DEVICE_BG, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 6 }}>
          <div style={{ width: 110, height: 4, borderRadius: 3, background: '#2a2a2c' }} />
        </div>
        <div style={{ position: 'absolute', top: 50, bottom: 34, left: 0, width: 12, background: DEVICE_BG }} />
        <div style={{ position: 'absolute', top: 50, bottom: 34, right: 0, width: 12, background: DEVICE_BG }} />
      </div>
    );
  }

  return null;
};

// ── Polygon path helper ───────────────────────────────────────────────────────
const ngonPath = (sides, cornerPct, size = 64) => {
  const cx = size / 2, cy = size / 2, r = size / 2 * 0.92;
  const pts = Array.from({ length: sides }, (_, i) => {
    const a = (i / sides * 2 * Math.PI) - Math.PI / 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });
  if (cornerPct === 0) {
    return 'polygon(' + pts.map(p => `${(p.x / size * 100).toFixed(1)}% ${(p.y / size * 100).toFixed(1)}%`).join(', ') + ')';
  }
  const maxRound = (cornerPct / 100) * r;
  let d = '';
  for (let i = 0; i < sides; i++) {
    const p0 = pts[(i - 1 + sides) % sides], p1 = pts[i], p2 = pts[(i + 1) % sides];
    const dx1 = p1.x - p0.x, dy1 = p1.y - p0.y, l1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const dx2 = p2.x - p1.x, dy2 = p2.y - p1.y, l2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    const cr = Math.min(maxRound, l1 / 2, l2 / 2);
    const bx1 = p1.x - cr * dx1 / l1, by1 = p1.y - cr * dy1 / l1;
    const bx2 = p1.x + cr * dx2 / l2, by2 = p1.y + cr * dy2 / l2;
    d += i === 0 ? `M${bx1.toFixed(1)},${by1.toFixed(1)}` : ` L${bx1.toFixed(1)},${by1.toFixed(1)}`;
    d += ` Q${p1.x.toFixed(1)},${p1.y.toFixed(1)} ${bx2.toFixed(1)},${by2.toFixed(1)}`;
  }
  return `path('${d}Z')`;
};

// ── Inline Color Picker ────────────────────────────────────────────────────────
const PRESET_COLORS = [
  '#d0cbb8', '#f97316', '#ef4444', '#10b981',
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
  '#06b6d4', '#1f2937', '#000000', '#ffffff',
];

const hexToHsl = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

const hslToHex = (h, s, l) => {
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60)       { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else              { r = c; b = x; }
  const hex = (n) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
  return `#${hex(r)}${hex(g)}${hex(b)}`;
};

const normalizeAngle = (angle) => {
  let normalized = ((angle + 180) % 360 + 360) % 360 - 180;
  if (normalized === -180) normalized = 180;
  return normalized;
};

const hexToRgba = (hex, alpha = 1) => {
  if (!hex || typeof hex !== 'string') return `rgba(15, 17, 23, ${alpha})`;
  const value = hex.replace('#', '');
  const full = value.length === 3
    ? value.split('').map((c) => c + c).join('')
    : value.slice(0, 6);
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return `rgba(15, 17, 23, ${alpha})`;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const LOGO_FONT_OPTIONS = [
  { value: '"IBM Plex Mono", monospace', label: 'Mono' },
  { value: '"IBM Plex Sans", sans-serif', label: 'Plex Sans' },
  { value: '"Space Grotesk", sans-serif', label: 'Grotesk' },
  { value: '"Fira Sans", sans-serif', label: 'Fira Sans' },
];

const LOGO_ICONS = [
  { key: 'FaBolt', label: 'Bolt' },
  { key: 'FaRocket', label: 'Rocket' },
  { key: 'FaBrain', label: 'Brain' },
  { key: 'FaCode', label: 'Code' },
  { key: 'FaCompass', label: 'Compass' },
  { key: 'FaStar', label: 'Star' },
  { key: 'FaHeart', label: 'Heart' },
  { key: 'FaFeatherAlt', label: 'Feather' },
];

const LOGO_ICON_PRESETS = [
  { label: 'Brand', icon: 'FaGem' },
  { label: 'Tech', icon: 'FaMicrochip' },
  { label: 'UI', icon: 'FaDesktop' },
  { label: 'Product', icon: 'FaCube' },
];
const SNAPSHOT_STORAGE_KEY = 'customizerSnapshots_v1';
const CUSTOMIZER_DRAFT_KEY = 'customizerDraft_v1';
const PREVIEW_DEVICE_PRESETS = {
  desktop: { label: 'Desktop', width: 1440, height: 900 },
  ipadPortrait: { label: 'iPad Hoch', width: 820, height: 1180 },
  ipadLandscape: { label: 'iPad Quer', width: 1180, height: 820 },
  mobile: { label: 'Mobile', width: 390, height: 844 },
};

const PREVIEW_DEVICE_SAFE_AREAS = {
  desktop: { top: 10, right: 12, bottom: 44, left: 12 },
  ipadPortrait: { top: 32, right: 18, bottom: 34, left: 18 },
  ipadLandscape: { top: 28, right: 14, bottom: 30, left: 14 },
  mobile: { top: 62, right: 12, bottom: 56, left: 12 },
};

const PREVIEW_DEVICE_CHROME = {
  desktop: { contentInsets: { top: 46, right: 0, bottom: 36, left: 0 }, borderRadius: 8 },
  ipadPortrait: { contentInsets: { top: 18, right: 18, bottom: 18, left: 18 }, borderRadius: 24 },
  ipadLandscape: { contentInsets: { top: 14, right: 14, bottom: 14, left: 14 }, borderRadius: 20 },
  mobile: { contentInsets: { top: 50, right: 12, bottom: 34, left: 12 }, borderRadius: 44 },
};

const PREVIEW_DEVICE_PANEL_BUDGETS = {
  desktop: { widthRatio: 1, heightRatio: 1, maxScale: Infinity },
  ipadPortrait: { widthRatio: 0.74, heightRatio: 0.82, maxScale: 0.78 },
  ipadLandscape: { widthRatio: 1, heightRatio: 1, maxScale: Infinity },
  mobile: { widthRatio: 0.58, heightRatio: 0.76, maxScale: 0.72 },
};


const PREVIEW_DEVICE_CONTENT_SCALES = {
  desktop: 1,
  ipadPortrait: 0.88,
  ipadLandscape: 1,
  mobile: 0.64,
};

const RESPONSIVE_PROFILE_KEYS = ['desktop', 'ipadPortrait', 'ipadLandscape', 'mobile'];

const getResponsiveProfileKey = (device) => {
  if (PREVIEW_DEVICE_PRESETS[device]) return device;
  return 'desktop';
};

const getDeviceSafeArea = (deviceKey = 'desktop') =>
  PREVIEW_DEVICE_SAFE_AREAS[deviceKey] || PREVIEW_DEVICE_SAFE_AREAS.desktop;

const getPreviewDeviceChrome = (deviceKey = 'desktop') =>
  PREVIEW_DEVICE_CHROME[deviceKey] || PREVIEW_DEVICE_CHROME.desktop;

const getPreviewDeviceButtonSizeLimits = (deviceKey = 'desktop') =>
  PREVIEW_DEVICE_BUTTON_SIZE_LIMITS[deviceKey] || PREVIEW_DEVICE_BUTTON_SIZE_LIMITS.desktop;

const getPresetSize = (deviceKey) => PREVIEW_DEVICE_PRESETS[deviceKey] || PREVIEW_DEVICE_PRESETS.desktop;

const getLogicalViewportMetrics = (deviceKey = 'desktop') => {
  const preset = getPresetSize(deviceKey);
  const safe = getDeviceSafeArea(deviceKey);
  const usableWidth = Math.max(1, preset.width - safe.left - safe.right);
  const usableHeight = Math.max(1, preset.height - safe.top - safe.bottom);
  const anchorX = safe.left + (usableWidth / 2);
  const anchorY = safe.top + (usableHeight / 2);
  return {
    width: preset.width,
    height: preset.height,
    safe,
    usableWidth,
    usableHeight,
    anchorX,
    anchorY,
  };
};

const InlineColorPicker = ({ label, color, onChange, palette }) => {
  const [open, setOpen] = useState(false);
  const [hexInput, setHexInput] = useState(color);
  const hsl = hexToHsl(color || '#000000');
  const isDark = hsl.l < 55;

  useEffect(() => { setHexInput(color); }, [color]);

  return (
    <div style={{ marginBottom: 8 }}>
      {label && (
        <div style={{ fontSize: 9, color: palette.textMuted, fontFamily: 'monospace', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {label}
        </div>
      )}
      {/* Swatch button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', height: 30, padding: '0 10px',
          backgroundColor: color,
          border: `1px solid ${open ? palette.gold : palette.border}`,
          borderRadius: open ? '5px 5px 0 0' : 5,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: 'monospace', fontSize: 10, fontWeight: 600,
          color: isDark ? '#fff' : '#000',
        }}
      >
        <span>{(color || '').toUpperCase()}</span>
        <span style={{ fontSize: 8, opacity: 0.7 }}>{open ? '▲' : '▼'}</span>
      </button>

      {/* Inline picker panel */}
      {open && (
        <div style={{
          backgroundColor: palette.bg,
          border: `1px solid ${palette.gold}`,
          borderTop: 'none',
          borderRadius: '0 0 5px 5px',
          padding: '8px 10px',
        }}>
          {/* Preset swatches */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 3, marginBottom: 8 }}>
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                onClick={() => onChange(c)}
                style={{
                  height: 20, backgroundColor: c, borderRadius: 3, cursor: 'pointer',
                  border: color === c ? '2px solid #fff' : `1px solid ${palette.border}`,
                }}
              />
            ))}
          </div>

          {/* Hue slider */}
          <div style={{ marginBottom: 5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontFamily: 'monospace', color: palette.textMuted, marginBottom: 2 }}>
              <span>Hue</span><span>{hsl.h}°</span>
            </div>
            <input className="zen-slider" type="range" min={0} max={359} value={hsl.h}
              onChange={e => onChange(hslToHex(+e.target.value, hsl.s, hsl.l))}
              style={{ width: '100%', accentColor: palette.gold }}
            />
          </div>

          {/* Saturation slider */}
          <div style={{ marginBottom: 5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontFamily: 'monospace', color: palette.textMuted, marginBottom: 2 }}>
              <span>Saturation</span><span>{hsl.s}%</span>
            </div>
            <input className="zen-slider" type="range" min={0} max={100} value={hsl.s}
              onChange={e => onChange(hslToHex(hsl.h, +e.target.value, hsl.l))}
              style={{ width: '100%', accentColor: palette.gold }}
            />
          </div>

          {/* Lightness slider */}
          <div style={{ marginBottom: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontFamily: 'monospace', color: palette.textMuted, marginBottom: 2 }}>
              <span>Lightness</span><span>{hsl.l}%</span>
            </div>
            <input className="zen-slider" type="range" min={0} max={100} value={hsl.l}
              onChange={e => onChange(hslToHex(hsl.h, hsl.s, +e.target.value))}
              style={{ width: '100%', accentColor: palette.gold }}
            />
          </div>

          {/* Hex input */}
          <input
            type="text"
            value={hexInput}
            onChange={e => {
              setHexInput(e.target.value);
              if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) onChange(e.target.value);
            }}
            style={{
              width: '100%', padding: '4px 8px', boxSizing: 'border-box',
              backgroundColor: palette.panelSoft, color: palette.text,
              border: `1px solid ${palette.border}`, borderRadius: 3,
              fontFamily: 'monospace', fontSize: 10,
            }}
          />
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

const OrbitCustomizer = () => {
  const { isDark } = useTheme();
  const { isPro } = useLicense();
  const zenPalette = isDark ? darkPalette : CUSTOMIZER_LIGHT;
  const exportSectionLabel = getExportSectionLabel(zenPalette);
  const panelControl = {
    bg: isDark ? '#262830' : '#ebe5da',
    bgHover: isDark ? '#2c2f38' : '#e3dccf',
    text: isDark ? '#ddd6c8' : '#2b241d',
    border: isDark ? '#3b3f4a' : 'rgba(30,24,16,0.2)',
    activeBg: isDark ? 'rgba(208,203,184,0.24)' : 'rgba(142,118,87,0.18)',
    activeText: isDark ? '#f4eee0' : '#2a2016',
  };
  const intentPanelPalette = useMemo(() => ({
    bgCard: zenPalette.panel,
    bgInput: zenPalette.panelSoft,
    border: zenPalette.border,
    borderStrong: zenPalette.borderStrong || zenPalette.border,
    gold: zenPalette.gold,
    goldSoft: `${zenPalette.gold}12`,
    text: zenPalette.text,
    textDim: zenPalette.textMuted,
    textSub: zenPalette.textMuted,
    buttonText: zenPalette.textMenu1,
  }), [zenPalette]);
  const { config, applyPreset, updateMany } = useOrbitMenuConfig();

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ── Accordion state ────────────────────────────────────────────────────────
  const [openPanels, setOpenPanels] = useState({
    visual: true, colors: false, animation: false, intent: false, items: false, scrolling: false, export: false,
  });
  const [intentPreviewEnabled, setIntentPreviewEnabled] = useState(false);
  const [intentScenarioKey, setIntentScenarioKey] = useState('guest-new');

  // ── Scroll Behavior Config ─────────────────────────────────────────────────
  const [scrollEnabled, setScrollEnabled] = useState(false);
  const [scrollCorner, setScrollCorner] = useState('right');
  const [scrollStartTopRatio, setScrollStartTopRatio] = useState(130 / PREVIEW_DEVICE_PRESETS.desktop.height);
  const [scrollEdgeGapRatio, setScrollEdgeGapRatio] = useState(16 / PREVIEW_DEVICE_PRESETS.desktop.width);
  const [scrollHeaderEnabled, setScrollHeaderEnabled] = useState(false);
  const [scrollHeaderHeightRatio, setScrollHeaderHeightRatio] = useState(96 / PREVIEW_DEVICE_PRESETS.desktop.height);
  const [scrollTopStopOverHeaderRatio, setScrollTopStopOverHeaderRatio] = useState(0 / PREVIEW_DEVICE_PRESETS.desktop.height);
  const [scrollFooterEnabled, setScrollFooterEnabled] = useState(false);
  const [scrollFooterHeightRatio, setScrollFooterHeightRatio] = useState(96 / PREVIEW_DEVICE_PRESETS.desktop.height);
  const [scrollBottomBufferRatio, setScrollBottomBufferRatio] = useState(130 / PREVIEW_DEVICE_PRESETS.desktop.height);
  const [scrollBottomBufferOpenRatio, setScrollBottomBufferOpenRatio] = useState(230 / PREVIEW_DEVICE_PRESETS.desktop.height);
  const [scrollOpenShiftTopRatio, setScrollOpenShiftTopRatio] = useState(69 / PREVIEW_DEVICE_PRESETS.desktop.height);   // positiv → Button geht nach unten
  const [scrollOpenShiftBottomRatio, setScrollOpenShiftBottomRatio] = useState(-40 / PREVIEW_DEVICE_PRESETS.desktop.height); // negativ → Button geht nach oben
  const [scrollSpeedFactor, setScrollSpeedFactor] = useState(1.0);
  const [fakeScrollY, setFakeScrollY] = useState(0);
  const fakeScrollRef = useRef(null);
  const openScrollingPanel = () => {
    setOpenPanels({
      visual: false,
      colors: false,
      animation: false,
      intent: false,
      items: false,
      scrolling: true,
      export: false,
    });
    requestAnimationFrame(() => {
      document.getElementById('customizer-scrolling-panel')?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    });
  };
  const togglePanel = (key) => setOpenPanels((prev) => {
    const shouldOpen = !prev[key];
    return {
      visual: false,
      colors: false,
      animation: false,
      intent: false,
      items: false,
      scrolling: false,
      export: false,
      [key]: shouldOpen,
    };
  });

  const offsetXRatioFromPx = (px, deviceKey = 'desktop') => {
    const { usableWidth } = getLogicalViewportMetrics(deviceKey);
    return Number(px || 0) / usableWidth;
  };
  const offsetYRatioFromPx = (px, deviceKey = 'desktop') => {
    const { usableHeight } = getLogicalViewportMetrics(deviceKey);
    return Number(px || 0) / usableHeight;
  };
  const offsetXPxFromRatio = (ratio, deviceKey = 'desktop') => {
    const { usableWidth } = getLogicalViewportMetrics(deviceKey);
    return Math.round((Number(ratio) || 0) * usableWidth);
  };
  const offsetYPxFromRatio = (ratio, deviceKey = 'desktop') => {
    const { usableHeight } = getLogicalViewportMetrics(deviceKey);
    return Math.round((Number(ratio) || 0) * usableHeight);
  };
  const verticalRatioFromPx = (px, deviceKey = 'desktop') => {
    const { usableHeight } = getLogicalViewportMetrics(deviceKey);
    return Number(px || 0) / usableHeight;
  };
  const horizontalRatioFromPx = (px, deviceKey = 'desktop') => {
    const { usableWidth } = getLogicalViewportMetrics(deviceKey);
    return Number(px || 0) / usableWidth;
  };
  const verticalPxFromRatio = (ratio, deviceKey = 'desktop') => {
    const { usableHeight } = getLogicalViewportMetrics(deviceKey);
    return Math.round((Number(ratio) || 0) * usableHeight);
  };
  const horizontalPxFromRatio = (ratio, deviceKey = 'desktop') => {
    const { usableWidth } = getLogicalViewportMetrics(deviceKey);
    return Math.round((Number(ratio) || 0) * usableWidth);
  };
  const clampButtonSizeForDevice = (px, deviceKey = 'desktop') => {
    const { min, max } = getPreviewDeviceButtonSizeLimits(deviceKey);
    return Math.max(min, Math.min(max, Math.round(Number(px) || min)));
  };

  // ── Visual state ───────────────────────────────────────────────────────────
  const [radius, setRadius] = useState(config.visual.radius);
  const [menuOffsetRatio, setMenuOffsetRatioState] = useState(offsetYRatioFromPx(config.visual.menuOffset, 'desktop'));
  const [menuOffsetXRatio, setMenuOffsetXRatioState] = useState(0);
  const [buttonSize, setButtonSize] = useState(config.visual.button.width);
  const [startAngle, setStartAngle] = useState(0);
  const [menuItemFontSize, setMenuItemFontSize] = useState(10);
  const [itemFontFamily, setItemFontFamily] = useState('"IBM Plex Mono", monospace');
  const [itemFontUrl, setItemFontUrl] = useState('');
  const [autoFontSize, setAutoFontSize] = useState(true);
  const [backdropBlur, setBackdropBlur] = useState(parseInt(config.visual?.backdrop?.blur || '8', 10));
  const [backdropImage, setBackdropImage] = useState('');
  const [backdropImageDraft, setBackdropImageDraft] = useState('');
  const [isBackdropDragOver, setIsBackdropDragOver] = useState(false);
  const backdropFileInputRef = useRef(null);

  // ── Logo state ─────────────────────────────────────────────────────────────
  const [logoText, setLogoText] = useState('B');
  const [logoImage, setLogoImage] = useState(null);
  const [logoUrlDraft, setLogoUrlDraft] = useState('');
  const [logoType, setLogoType] = useState('text');
  const [logoFontFamily, setLogoFontFamily] = useState(LOGO_FONT_OPTIONS[0].value);
  const [logoFontWeight, setLogoFontWeight] = useState(700);
  const [logoIconKey, setLogoIconKey] = useState('FaBolt');
  const [logoIconInput, setLogoIconInput] = useState('FaBolt');
  const [logoSize, setLogoSize] = useState(80);        // % of button size
  const [logoFit, setLogoFit] = useState('contain');   // 'cover' | 'contain'
  const [isLogoDragOver, setIsLogoDragOver] = useState(false);
  const logoFileInputRef = useRef(null);

  // ── Shape state ────────────────────────────────────────────────────────────
  const [buttonShape, setButtonShape] = useState('circle');
  const [squareRadius, setSquareRadius] = useState(4);    // px, 0–50
  const [polygonSides, setPolygonSides] = useState(6);    // 3–12
  const [polygonCorner, setPolygonCorner] = useState(0);  // %, 0–30

  // ── Animation state ────────────────────────────────────────────────────────
  const legacyItemMotionDefaults = deriveLegacyItemMotion(
    config.animation?.menuItem?.stiffness,
    config.animation?.menuItem?.damping,
    config.animation?.menuItem?.staggerDelay
  );
  const [logoStiffness, setLogoStiffness] = useState(config.animation.logo.stiffness);
  const [logoDamping, setLogoDamping] = useState(config.animation.logo.damping);
  const [centerButtonRotates, setCenterButtonRotates] = useState(true);
  const [itemMotionDuration, setItemMotionDuration] = useState(legacyItemMotionDefaults.duration);
  const [itemMotionStagger, setItemMotionStagger] = useState(legacyItemMotionDefaults.stagger);
  const [itemMotionCurvePreset, setItemMotionCurvePreset] = useState('snappy');
  const [itemMotionBezier, setItemMotionBezier] = useState(legacyItemMotionDefaults.bezier);
  const previewDebounceRef = useRef(null);
  const previewFrameRef = useRef(null);
  const mobileAutoSnapped = useRef(false);
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [previewActualSize, setPreviewActualSize] = useState(false);
  const [responsiveProfiles, setResponsiveProfiles] = useState({
    desktop: {
      radius: config.visual.radius,
      menuOffset: config.visual.menuOffset,
      menuOffsetX: 0,
      menuOffsetRatio: offsetYRatioFromPx(config.visual.menuOffset, 'desktop'),
      menuOffsetXRatio: 0,
      buttonSize: config.visual.button.width,
      menuItemFontSize: 10,
    },
    ipadPortrait: {
      radius: config.visual.radius,
      menuOffset: config.visual.menuOffset,
      menuOffsetX: 0,
      menuOffsetRatio: offsetYRatioFromPx(config.visual.menuOffset, 'desktop'),
      menuOffsetXRatio: 0,
      buttonSize: config.visual.button.width,
      menuItemFontSize: 10,
    },
    ipadLandscape: {
      radius: config.visual.radius,
      menuOffset: config.visual.menuOffset,
      menuOffsetX: 0,
      menuOffsetRatio: offsetYRatioFromPx(config.visual.menuOffset, 'desktop'),
      menuOffsetXRatio: 0,
      buttonSize: config.visual.button.width,
      menuItemFontSize: 10,
    },
    mobile: {
      radius: config.visual.radius,
      menuOffset: config.visual.menuOffset,
      menuOffsetX: 0,
      menuOffsetRatio: offsetYRatioFromPx(config.visual.menuOffset, 'desktop'),
      menuOffsetXRatio: 0,
      buttonSize: 48,
      menuItemFontSize: 8,
    },
  });
  const profileSyncRef = useRef(false);
  const [perfMonitorEnabled, setPerfMonitorEnabled] = useState(false);
  const [devicePixelRatio, setDevicePixelRatio] = useState(
    typeof window !== 'undefined' ? Number((window.devicePixelRatio || 1).toFixed(2)) : 1
  );
  const [perfStats, setPerfStats] = useState({
    fps: 0,
    avgFrameMs: 0,
    jankPct: 0,
    avgReactRenderMs: 0,
    reactSharePct: 0,
    targetHz: 60,
    fpsTargetPct: 0,
  });
  const [perfLastAlert, setPerfLastAlert] = useState(null);
  const [perfAlertHistory, setPerfAlertHistory] = useState([]);
  const perfRafRef = useRef(null);
  const perfLastTsRef = useRef(0);
  const perfWindowStartRef = useRef(0);
  const perfFramesRef = useRef(0);
  const perfFrameTimeRef = useRef(0);
  const perfLongFramesRef = useRef(0);
  const perfMinFrameMsRef = useRef(Number.POSITIVE_INFINITY);
  const perfReactRenderTimeRef = useRef(0);
  const perfReactRenderCommitsRef = useRef(0);
  const perfAlertCooldownRef = useRef(0);

  // ── Shape helper ──────────────────────────────────────────────────────────
  const SHAPES = {
    circle:  { borderRadius: '50%', clipPath: 'none' },
    square:  { borderRadius: `${squareRadius}px`, clipPath: 'none' },
    polygon: { borderRadius: 0, clipPath: ngonPath(polygonSides, polygonCorner, buttonSize) },
  };
  const shapeStyle = SHAPES[buttonShape] || SHAPES.circle;

  // ── Preview state ──────────────────────────────────────────────────────────
  const [showMenuItems, setShowMenuItems] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [animatePreview, setAnimatePreview] = useState(false);
  const [scrollSimActive, setScrollSimActive] = useState(false);
  const [logoRotation, setLogoRotation] = useState(0);
  const normalizedLogoIconInput = (() => {
    const raw = (logoIconInput || '').trim();
    if (!raw) return logoIconKey;
    return raw.startsWith('Fa') ? raw : `Fa${raw}`;
  })();
  const resolvedLogoIconName = FaIcons[normalizedLogoIconInput]
    ? normalizedLogoIconInput
    : logoIconKey;
  const SelectedLogoIcon = FaIcons[resolvedLogoIconName] || FaIcons.FaBolt;
  const stiffnessT = (logoStiffness - 100) / 400; // 0..1
  const dampingT = (logoDamping - 10) / 70; // 0..1
  const centerMotionDuration = Math.max(0.25, 0.95 - (stiffnessT * 0.45) + (dampingT * 0.12));
  const resolvedItemMotionBezier = useMemo(
    () => resolveItemMotionBezier(itemMotionCurvePreset, itemMotionBezier),
    [itemMotionCurvePreset, itemMotionBezier]
  );
  const itemMotionCurve = `cubic-bezier(${resolvedItemMotionBezier.map((value) => value.toFixed(2)).join(', ')})`;

  // ── Color state ────────────────────────────────────────────────────────────
  const [buttonBgColor, setButtonBgColor] = useState(config.visual.colors?.buttonBg || '#1a1a1a');
  const [buttonOutlineColor, setButtonOutlineColor] = useState(config.visual.colors?.buttonOutline || '#d0cbb8');
  const [menuItemBgColor, setMenuItemBgColor] = useState(config.visual.colors?.menuItemBg || '#1a1a1a');
  const [menuItemOutlineColor, setMenuItemOutlineColor] = useState(config.visual.colors?.menuItemOutline || '#d0cbb8');
  const [menuItemTextColor, setMenuItemTextColor] = useState(config.visual.colors?.menuItemText || '#e8e3d7');
  const [backdropTintColor, setBackdropTintColor] = useState('#0f1117');
  const [backdropTintOpacity, setBackdropTintOpacity] = useState(28);
  const [buttonOutlineWidth, setButtonOutlineWidth] = useState(config.visual.colors?.buttonOutlineWidth || 1);
  const [menuItemOutlineWidth, setMenuItemOutlineWidth] = useState(config.visual.colors?.menuItemOutlineWidth || 2);

  // ── Menu items state ───────────────────────────────────────────────────────
  const [menuItems, setMenuItems] = useState([
    { id: 1, angle: 0,    label: 'Menü',    action: 'openOverlay' },
    { id: 2, angle: -45,  label: 'ZenLab',  action: 'route', route: '/zenlab2' },
    { id: 3, angle: -90,  label: 'Hallo',   action: 'route', route: '/contact' },
    { id: 4, angle: -135, label: 'Ich',     action: 'submenu', submenu: 'about' },
    { id: 5, angle: -180, label: 'Moin',    action: 'route', route: '/' },
  ]);
  const [submenus, setSubmenus] = useState({
    about: [
      { id: 'ab1', angle: -60,  label: 'Ich',      action: 'route', route: '/about#overview' },
      { id: 'ab2', angle: -120, label: 'Referenz', action: 'route', route: '/about#referenzen' },
    ],
  });
  const [editingSubmenu, setEditingSubmenu] = useState(null);
  const activeIntentScenario = useMemo(
    () => getIntentPreviewScenario(intentScenarioKey),
    [intentScenarioKey]
  );
  const intentDecision = useMemo(
    () => resolveZenOrbitMenu(activeIntentScenario?.context || {}),
    [activeIntentScenario]
  );
  const previewMenuItems = useMemo(
    () => (intentPreviewEnabled ? mapDecisionToCustomizerItems(intentDecision) : menuItems),
    [intentPreviewEnabled, intentDecision, menuItems]
  );
  const intentPreviewMeta = useMemo(
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

  // ── Export preview state ───────────────────────────────────────────────────
  const [exportTab, setExportTab] = useState(null); // null | 'react' | 'guide' | 'css' | 'json'
  const [copiedTab, setCopiedTab] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [snapshotName, setSnapshotName] = useState('');
  const [showSnapshotOverlay, setShowSnapshotOverlay] = useState(false);
  const [jsonImportHint, setJsonImportHint] = useState('');
  const [presetHint, setPresetHint] = useState('');
  const [syncHint, setSyncHint] = useState('');
  const [cleaningReport, setCleaningReport] = useState(null);
  const [selectedPresetName, setSelectedPresetName] = useState('compact');
  const [exportIncludeBranding, setExportIncludeBranding] = useState(true);
  const [hasHydratedDraft, setHasHydratedDraft] = useState(false);
  const latestDraftRef = useRef(null);
  const projectJsonInputRef = useRef(null);

  // ── Transfer banner state ──────────────────────────────────────────────────
  const [transferBanner, setTransferBanner] = useState(false);

  const getExportContent = (tab) => {
    const cfg = buildExportConfig();
    const exportOptions = { includeBranding: exportIncludeBranding || !isPro };
    if (tab === 'react') return generateStandaloneComponent(cfg, exportOptions);
    if (tab === 'guide') return generateInstallationGuide(cfg, exportOptions);
    if (tab === 'css') return generateCSS(cfg, exportOptions);
    if (tab === 'json') return generateProjectJson(buildSnapshotState(), exportOptions);
    return '';
  };

  const handleCopyExport = async (tab) => {
    try {
      await navigator.clipboard.writeText(getExportContent(tab));
      setCopiedTab(tab);
      setTimeout(() => setCopiedTab(null), 2000);
    } catch {
      alert('Clipboard nicht verfügbar.');
    }
  };

  // ── Builder → Customizer transfer ─────────────────────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem('customizerTransfer_v1');
      if (stored) {
        const t = JSON.parse(stored);
        localStorage.removeItem('customizerTransfer_v1');
        if (t.radius)        setRadius(t.radius);
        if (t.menuOffset !== undefined) setMenuOffsetForDevice(t.menuOffset, 'desktop');
        if (t.menuOffsetX !== undefined) setMenuOffsetXForDevice(t.menuOffsetX, 'desktop');
        if (t.buttonSize)    setButtonSize(t.buttonSize);
        if (t.backdropBlur !== undefined) setBackdropBlur(t.backdropBlur);
        if (t.backdropImage) {
          setBackdropImage(t.backdropImage);
          setBackdropImageDraft(t.backdropImage);
        }
        if (t.config?.visual?.backdrop?.blur) setBackdropBlur(parseInt(t.config.visual.backdrop.blur, 10));
        if (t.config?.visual?.colors?.backdrop) {
          const match = t.config.visual.colors.backdrop.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i);
          if (match) {
            const [, rs, gs, bs, as] = match;
            const hex = `#${[rs, gs, bs].map((part) => Number(part).toString(16).padStart(2, '0')).join('')}`;
            setBackdropTintColor(hex);
            if (as !== undefined) {
              setBackdropTintOpacity(Math.max(0, Math.min(100, Math.round(Number(as) * 100))));
            }
          }
        }
        if (t.logoStiffness) setLogoStiffness(t.logoStiffness);
        if (t.logoDamping)   setLogoDamping(t.logoDamping);
        if (t.accentColor) {
          setButtonOutlineColor(t.accentColor);
          setMenuItemOutlineColor(t.accentColor);
        }
        if (t.logoSrc) {
          setLogoImage(t.logoSrc);
          setLogoType('image');
        }
        if (t.logoText) {
          setLogoText(t.logoText);
          setLogoType('text');
          if (t.logoTextFont) setLogoFontFamily(t.logoTextFont);
        }
        if (t.menuItems && t.menuItems.length > 0) setMenuItems(t.menuItems);
        setTransferBanner(true);
        setTimeout(() => setTransferBanner(false), 3500);
        setHasHydratedDraft(true);
        return;
      }

      const draftRaw = localStorage.getItem(CUSTOMIZER_DRAFT_KEY);
      if (draftRaw) {
        const draft = JSON.parse(draftRaw);
        applySnapshotState(draft);
      }
    } catch { /* ignore */ }
    setHasHydratedDraft(true);
  }, []);

  useEffect(() => {
    if (animatePreview) return;
    const shouldOpen = openPanels.visual || openPanels.colors || openPanels.animation || openPanels.intent || openPanels.items || openPanels.scrolling;
    setIsManualOpen(shouldOpen);
    setShowMenuItems(shouldOpen);
    if (!shouldOpen) {
      setLogoRotation(0);
    } else if (centerButtonRotates) {
      setLogoRotation(180);
    }
  }, [openPanels.visual, openPanels.colors, openPanels.animation, openPanels.intent, openPanels.items, openPanels.scrolling, animatePreview, centerButtonRotates]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SNAPSHOT_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setSnapshots(parsed);
      }
    } catch {
      // ignore invalid snapshot data
    }
  }, []);

  // ── Auto-demo animation ────────────────────────────────────────────────────
  useEffect(() => {
    if (!animatePreview) {
      return;
    }
    const openDuration = Math.round(950 - (stiffnessT * 420) + (dampingT * 150));
    const holdDuration = 220;
    const closeDuration = Math.round(860 - (stiffnessT * 300) + (dampingT * 120));
    const totalDuration = openDuration + holdDuration + closeDuration;
    const startTime = Date.now();
    setShowMenuItems(false);
    setLogoRotation(0);
    setIsManualOpen(false);

    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < openDuration) {
        const p = elapsed / openDuration;
        setLogoRotation(centerButtonRotates ? (p * 180) : 0);
        setShowMenuItems(p > 0.3);
      } else if (elapsed < openDuration + holdDuration) {
        setLogoRotation(centerButtonRotates ? 180 : 0);
        setShowMenuItems(true);
      } else if (elapsed < totalDuration) {
        const closeElapsed = elapsed - openDuration - holdDuration;
        const p = 1 - (closeElapsed / closeDuration);
        setLogoRotation(centerButtonRotates ? (p * 180) : 0);
        setShowMenuItems(p > 0.25);
      } else {
        setLogoRotation(0);
        setShowMenuItems(false);
        setIsManualOpen(false);
        setAnimatePreview(false);
        return;
      }
      requestAnimationFrame(animate);
    };
    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [animatePreview, stiffnessT, dampingT, centerButtonRotates]);

  useEffect(() => {
    return () => {
      if (previewDebounceRef.current) {
        clearTimeout(previewDebounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!logoImage || logoImage.startsWith('data:')) {
      setLogoUrlDraft('');
      return;
    }
    setLogoUrlDraft(logoImage);
  }, [logoImage]);

  useEffect(() => {
    setBackdropImageDraft(backdropImage || '');
  }, [backdropImage]);

  useEffect(() => {
    const updateDpr = () => setDevicePixelRatio(Number((window.devicePixelRatio || 1).toFixed(2)));
    updateDpr();
    window.addEventListener('resize', updateDpr);
    return () => window.removeEventListener('resize', updateDpr);
  }, []);

  const resetPerfRefs = useCallback(() => {
    perfLastTsRef.current = 0;
    perfWindowStartRef.current = 0;
    perfFramesRef.current = 0;
    perfFrameTimeRef.current = 0;
    perfLongFramesRef.current = 0;
    perfMinFrameMsRef.current = Number.POSITIVE_INFINITY;
    perfReactRenderTimeRef.current = 0;
    perfReactRenderCommitsRef.current = 0;
  }, []);

  const resetPerfStats = useCallback(() => {
    setPerfStats({
      fps: 0,
      avgFrameMs: 0,
      jankPct: 0,
      avgReactRenderMs: 0,
      reactSharePct: 0,
      targetHz: 60,
      fpsTargetPct: 0,
    });
    setPerfLastAlert(null);
    setPerfAlertHistory([]);
    perfAlertCooldownRef.current = 0;
    resetPerfRefs();
  }, [resetPerfRefs]);

  const handlePreviewProfilerRender = useCallback((id, phase, actualDuration) => {
    if (!perfMonitorEnabled) return;
    perfReactRenderTimeRef.current += actualDuration;
    perfReactRenderCommitsRef.current += 1;
  }, [perfMonitorEnabled]);

  useEffect(() => {
    if (!perfMonitorEnabled) {
      if (perfRafRef.current) {
        cancelAnimationFrame(perfRafRef.current);
      }
      perfRafRef.current = null;
      resetPerfRefs();
      return;
    }

    const updateWindowMs = 700;
    const longFrameThreshold = 19;
    const COMMON_HZ = [60, 90, 120, 144, 165, 240];
    const toNearestHz = (value) =>
      COMMON_HZ.reduce((best, hz) => (
        Math.abs(hz - value) < Math.abs(best - value) ? hz : best
      ), 60);

    const loop = () => {
      const now = performance.now();
      if (perfLastTsRef.current > 0) {
        const dt = now - perfLastTsRef.current;
        perfFramesRef.current += 1;
        perfFrameTimeRef.current += dt;
        perfMinFrameMsRef.current = Math.min(perfMinFrameMsRef.current, dt);
        if (dt > longFrameThreshold) perfLongFramesRef.current += 1;
      } else {
        perfWindowStartRef.current = now;
      }
      perfLastTsRef.current = now;

      const elapsed = now - perfWindowStartRef.current;
      if (elapsed >= updateWindowMs && perfFramesRef.current > 0) {
        const avgFrameMs = perfFrameTimeRef.current / perfFramesRef.current;
        const fps = 1000 / avgFrameMs;
        const avgReactRenderMs =
          perfReactRenderCommitsRef.current > 0
            ? perfReactRenderTimeRef.current / perfReactRenderCommitsRef.current
            : 0;
        const reactSharePct = avgFrameMs > 0
          ? Math.min(100, (avgReactRenderMs / avgFrameMs) * 100)
          : 0;
        const minFrameMs = Number.isFinite(perfMinFrameMsRef.current) ? perfMinFrameMsRef.current : avgFrameMs;
        const estimatedHz = toNearestHz(Math.max(30, Math.min(240, 1000 / Math.max(1, minFrameMs))));
        const fpsTargetPct = estimatedHz > 0 ? Math.min(100, (fps / estimatedHz) * 100) : 0;
        setPerfStats({
          fps: Number(fps.toFixed(1)),
          avgFrameMs: Number(avgFrameMs.toFixed(2)),
          jankPct: Number(((perfLongFramesRef.current / perfFramesRef.current) * 100).toFixed(1)),
          avgReactRenderMs: Number(avgReactRenderMs.toFixed(2)),
          reactSharePct: Number(reactSharePct.toFixed(1)),
          targetHz: estimatedHz,
          fpsTargetPct: Number(fpsTargetPct.toFixed(1)),
        });
        resetPerfRefs();
        perfWindowStartRef.current = now;
        perfLastTsRef.current = now;
      }
      perfRafRef.current = requestAnimationFrame(loop);
    };

    perfRafRef.current = requestAnimationFrame(loop);
    return () => {
      if (perfRafRef.current) {
        cancelAnimationFrame(perfRafRef.current);
      }
      perfRafRef.current = null;
      resetPerfRefs();
    };
  }, [perfMonitorEnabled, resetPerfRefs]);

  useEffect(() => {
    const node = previewFrameRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return;
    const update = () => {
      const rect = node.getBoundingClientRect();
      setPreviewSize({
        width: rect.width || 0,
        height: rect.height || 0,
      });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const selectedPreviewPreset = PREVIEW_DEVICE_PRESETS[previewDevice] || PREVIEW_DEVICE_PRESETS.desktop;
  const activeResponsiveProfileKey = getResponsiveProfileKey(previewDevice);
  const previewSafeArea = PREVIEW_DEVICE_SAFE_AREAS[previewDevice] || PREVIEW_DEVICE_SAFE_AREAS.desktop;
  const previewDeviceChrome = getPreviewDeviceChrome(previewDevice);
  const previewDeviceButtonSizeLimits = getPreviewDeviceButtonSizeLimits(previewDevice);
  const previewPanelBudget = PREVIEW_DEVICE_PANEL_BUDGETS[previewDevice] || PREVIEW_DEVICE_PANEL_BUDGETS.desktop;
  const logicalViewportMetrics = useMemo(() => getLogicalViewportMetrics(previewDevice), [previewDevice]);
  const shouldAutoSnapPreviewDevice = previewDevice === 'mobile' || previewDevice === 'ipadPortrait';
  const activeResponsiveProfile = responsiveProfiles[activeResponsiveProfileKey] || responsiveProfiles.desktop;
  const sharedResponsiveGeometry = responsiveProfiles.desktop || activeResponsiveProfile;
  const menuOffset = useMemo(
    () => offsetYPxFromRatio(menuOffsetRatio, previewDevice),
    [menuOffsetRatio, previewDevice]
  );
  const menuOffsetX = useMemo(
    () => offsetXPxFromRatio(menuOffsetXRatio, previewDevice),
    [menuOffsetXRatio, previewDevice]
  );
  const scrollStartTop = useMemo(
    () => verticalPxFromRatio(scrollStartTopRatio, previewDevice),
    [scrollStartTopRatio, previewDevice]
  );
  const scrollEdgeGap = useMemo(
    () => horizontalPxFromRatio(scrollEdgeGapRatio, previewDevice),
    [scrollEdgeGapRatio, previewDevice]
  );
  const scrollHeaderHeight = useMemo(
    () => verticalPxFromRatio(scrollHeaderHeightRatio, previewDevice),
    [scrollHeaderHeightRatio, previewDevice]
  );
  const scrollTopStopOverHeader = useMemo(
    () => verticalPxFromRatio(scrollTopStopOverHeaderRatio, previewDevice),
    [scrollTopStopOverHeaderRatio, previewDevice]
  );
  const scrollFooterHeight = useMemo(
    () => verticalPxFromRatio(scrollFooterHeightRatio, previewDevice),
    [scrollFooterHeightRatio, previewDevice]
  );
  const scrollBottomBuffer = useMemo(
    () => verticalPxFromRatio(scrollBottomBufferRatio, previewDevice),
    [scrollBottomBufferRatio, previewDevice]
  );
  const scrollBottomBufferOpen = useMemo(
    () => verticalPxFromRatio(scrollBottomBufferOpenRatio, previewDevice),
    [scrollBottomBufferOpenRatio, previewDevice]
  );
  const scrollOpenShiftTop = useMemo(
    () => verticalPxFromRatio(scrollOpenShiftTopRatio, previewDevice),
    [scrollOpenShiftTopRatio, previewDevice]
  );
  const scrollOpenShiftBottom = useMemo(
    () => verticalPxFromRatio(scrollOpenShiftBottomRatio, previewDevice),
    [scrollOpenShiftBottomRatio, previewDevice]
  );
  const setMenuOffsetForDevice = useCallback((nextPx, deviceKey = previewDevice) => {
    setMenuOffsetRatioState(offsetYRatioFromPx(nextPx, deviceKey));
  }, [previewDevice]);
  const setMenuOffsetXForDevice = useCallback((nextPx, deviceKey = previewDevice) => {
    setMenuOffsetXRatioState(offsetXRatioFromPx(nextPx, deviceKey));
  }, [previewDevice]);
  const setScrollStartTopForDevice = useCallback((nextPx, deviceKey = previewDevice) => {
    setScrollStartTopRatio(verticalRatioFromPx(nextPx, deviceKey));
  }, [previewDevice]);
  const setScrollEdgeGapForDevice = useCallback((nextPx, deviceKey = previewDevice) => {
    setScrollEdgeGapRatio(horizontalRatioFromPx(nextPx, deviceKey));
  }, [previewDevice]);
  const setScrollHeaderHeightForDevice = useCallback((nextPx, deviceKey = previewDevice) => {
    setScrollHeaderHeightRatio(verticalRatioFromPx(nextPx, deviceKey));
  }, [previewDevice]);
  const setScrollTopStopOverHeaderForDevice = useCallback((nextPx, deviceKey = previewDevice) => {
    setScrollTopStopOverHeaderRatio(verticalRatioFromPx(nextPx, deviceKey));
  }, [previewDevice]);
  const setScrollFooterHeightForDevice = useCallback((nextPx, deviceKey = previewDevice) => {
    setScrollFooterHeightRatio(verticalRatioFromPx(nextPx, deviceKey));
  }, [previewDevice]);
  const setScrollBottomBufferForDevice = useCallback((nextPx, deviceKey = previewDevice) => {
    setScrollBottomBufferRatio(verticalRatioFromPx(nextPx, deviceKey));
  }, [previewDevice]);
  const setScrollBottomBufferOpenForDevice = useCallback((nextPx, deviceKey = previewDevice) => {
    setScrollBottomBufferOpenRatio(verticalRatioFromPx(nextPx, deviceKey));
  }, [previewDevice]);
  const setScrollOpenShiftTopForDevice = useCallback((nextPx, deviceKey = previewDevice) => {
    setScrollOpenShiftTopRatio(verticalRatioFromPx(nextPx, deviceKey));
  }, [previewDevice]);
  const setScrollOpenShiftBottomForDevice = useCallback((nextPx, deviceKey = previewDevice) => {
    setScrollOpenShiftBottomRatio(verticalRatioFromPx(nextPx, deviceKey));
  }, [previewDevice]);

  useEffect(() => {
    if (!activeResponsiveProfile || !sharedResponsiveGeometry) return;
    profileSyncRef.current = true;
    setRadius(sharedResponsiveGeometry.radius);
    setMenuOffsetRatioState(
      sharedResponsiveGeometry.menuOffsetRatio
        ?? offsetYRatioFromPx(sharedResponsiveGeometry.menuOffset, 'desktop')
    );
    setMenuOffsetXRatioState(
      sharedResponsiveGeometry.menuOffsetXRatio
        ?? offsetXRatioFromPx(sharedResponsiveGeometry.menuOffsetX, 'desktop')
    );
    setButtonSize(clampButtonSizeForDevice(activeResponsiveProfile.buttonSize, activeResponsiveProfileKey));
    setMenuItemFontSize(activeResponsiveProfile.menuItemFontSize);
    const t = setTimeout(() => { profileSyncRef.current = false; }, 0);
    return () => clearTimeout(t);
  }, [activeResponsiveProfileKey, activeResponsiveProfile, sharedResponsiveGeometry]);

  useEffect(() => {
    const clamped = clampButtonSizeForDevice(buttonSize, previewDevice);
    if (clamped !== buttonSize) {
      setButtonSize(clamped);
      if (autoFontSize) {
        setMenuItemFontSize(Math.max(8, Math.min(14, Math.round(clamped * 10 / 64))));
      }
    }
  }, [autoFontSize, buttonSize, previewDevice]);


  useEffect(() => {
    if (profileSyncRef.current) return;
    setResponsiveProfiles((prev) => {
      const next = { ...prev };
      let changed = false;

      RESPONSIVE_PROFILE_KEYS.forEach((key) => {
        const current = next[key] || {};
        const shouldUseActiveSizing = key === activeResponsiveProfileKey;
        const nextProfile = {
          ...current,
          radius,
          menuOffset: offsetYPxFromRatio(menuOffsetRatio, key),
          menuOffsetX: offsetXPxFromRatio(menuOffsetXRatio, key),
          menuOffsetRatio,
          menuOffsetXRatio,
          buttonSize: shouldUseActiveSizing ? buttonSize : current.buttonSize,
          menuItemFontSize: shouldUseActiveSizing ? menuItemFontSize : current.menuItemFontSize,
        };

        if (
          current.radius !== nextProfile.radius ||
          current.menuOffset !== nextProfile.menuOffset ||
          current.menuOffsetX !== nextProfile.menuOffsetX ||
          current.menuOffsetRatio !== nextProfile.menuOffsetRatio ||
          current.menuOffsetXRatio !== nextProfile.menuOffsetXRatio ||
          current.buttonSize !== nextProfile.buttonSize ||
          current.menuItemFontSize !== nextProfile.menuItemFontSize
        ) {
          next[key] = nextProfile;
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [activeResponsiveProfileKey, radius, menuOffsetRatio, menuOffsetXRatio, buttonSize, menuItemFontSize]);

  const previewFrameMetrics = useMemo(() => {
    const pad = 20;
    const outerW = Math.max(0, ((previewSize.width  || 0) - pad * 2) * previewPanelBudget.widthRatio);
    const outerH = Math.max(0, ((previewSize.height || 0) - pad * 2) * previewPanelBudget.heightRatio);

    if (outerW <= 0 || outerH <= 0) {
      return { width: 0, height: 0, scale: 1 };
    }

    if (previewActualSize) {
      return {
        width: Math.max(1, Math.round(outerW)),
        height: Math.max(1, Math.round(outerH)),
        scale: 1,
      };
    }

    const baseScale = Math.min(
      outerW / selectedPreviewPreset.width,
      outerH / selectedPreviewPreset.height
    );
    const scale = Math.min(
      baseScale,
      previewDevice === 'mobile' ? 1 : Infinity,
      previewPanelBudget.maxScale
    );

    return {
      width:  Math.max(1, Math.round(selectedPreviewPreset.width  * scale)),
      height: Math.max(1, Math.round(selectedPreviewPreset.height * scale)),
      scale,
    };
  }, [previewActualSize, previewDevice, previewPanelBudget.heightRatio, previewPanelBudget.maxScale, previewPanelBudget.widthRatio, previewSize.width, previewSize.height, selectedPreviewPreset.width, selectedPreviewPreset.height]);

  const offsetBounds = useMemo(() => {
    const maxOffsetLimit = 400;
    const width = selectedPreviewPreset.width || 0;
    const height = selectedPreviewPreset.height || 0;
    if (width <= 0 || height <= 0) {
      return {
        minX: -maxOffsetLimit,
        maxX: maxOffsetLimit,
        minY: -maxOffsetLimit,
        maxY: maxOffsetLimit,
      };
    }
    const sidePadding = Math.max(previewSafeArea.left, previewSafeArea.right);
    const topReserved = previewSafeArea.top;
    const bottomReserved = previewSafeArea.bottom;
    const btnHalf = buttonSize / 2;
    const anchorX = logicalViewportMetrics.anchorX;
    const anchorY = logicalViewportMetrics.anchorY;
    const minXRaw = -anchorX + sidePadding + btnHalf;
    const maxXRaw = (width - anchorX) - sidePadding - btnHalf;
    const minYRaw = -anchorY + topReserved + btnHalf;
    const maxYRaw = (height - anchorY) - bottomReserved - btnHalf;

    const minX = Math.max(-maxOffsetLimit, Math.min(maxOffsetLimit, Math.round(minXRaw)));
    const maxX = Math.max(-maxOffsetLimit, Math.min(maxOffsetLimit, Math.round(maxXRaw)));
    const minY = Math.max(-maxOffsetLimit, Math.min(maxOffsetLimit, Math.round(minYRaw)));
    const maxY = Math.max(-maxOffsetLimit, Math.min(maxOffsetLimit, Math.round(maxYRaw)));

    return {
      minX: minX <= maxX ? minX : 0,
      maxX: minX <= maxX ? maxX : 0,
      minY: minY <= maxY ? minY : 0,
      maxY: minY <= maxY ? maxY : 0,
    };
  }, [buttonSize, logicalViewportMetrics.anchorX, logicalViewportMetrics.anchorY, previewSafeArea.bottom, previewSafeArea.left, previewSafeArea.right, previewSafeArea.top, selectedPreviewPreset.height, selectedPreviewPreset.width]);

  const isOffsetOutsideBounds =
    menuOffsetX < offsetBounds.minX ||
    menuOffsetX > offsetBounds.maxX ||
    menuOffset < offsetBounds.minY ||
    menuOffset > offsetBounds.maxY;

  const snapOffsetsIntoBounds = () => {
    setMenuOffsetXForDevice(Math.max(offsetBounds.minX, Math.min(offsetBounds.maxX, menuOffsetX)));
    setMenuOffsetForDevice(Math.max(offsetBounds.minY, Math.min(offsetBounds.maxY, menuOffset)));
  };

  const clampOffsetX = (value) => value;

  const clampOffsetY = (value) => value;

  // Auto-snap offsets into view when first loading on mobile
  useEffect(() => {
    if (!shouldAutoSnapPreviewDevice) { mobileAutoSnapped.current = false; return; }
    if ((selectedPreviewPreset.width || 0) <= 0 || mobileAutoSnapped.current) return;
    mobileAutoSnapped.current = true;
    snapOffsetsIntoBounds();
  }, [selectedPreviewPreset.width, shouldAutoSnapPreviewDevice]); // eslint-disable-line react-hooks/exhaustive-deps


  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleLogoImageFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setLogoImage(ev.target.result);
        setLogoType('image');
        setLogoUrlDraft('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoImageUpload = (e) => {
    const file = e.target.files?.[0];
    handleLogoImageFile(file);
  };

  const handleLogoDrop = (e) => {
    e.preventDefault();
    setIsLogoDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    handleLogoImageFile(file);
  };

  const handleLogoUrlChange = (value) => {
    setLogoUrlDraft(value);
    const trimmed = value.trim();
    if (!trimmed) {
      setLogoImage(null);
      return;
    }
    setLogoImage(trimmed);
    setLogoType('image');
  };

  const handleBackdropImageFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const next = String(ev.target?.result || '');
        setBackdropImage(next);
        setBackdropImageDraft(next);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackdropImageUpload = (e) => {
    const file = e.target.files?.[0];
    handleBackdropImageFile(file);
  };

  const handleBackdropDrop = (e) => {
    e.preventDefault();
    setIsBackdropDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    handleBackdropImageFile(file);
  };

  const handleBackdropUrlChange = (value) => {
    setBackdropImageDraft(value);
    setBackdropImage(value.trim());
  };

  const buildExportConfig = () => ({
    radius, menuOffset, menuOffsetX, menuOffsetRatio, menuOffsetXRatio, buttonSize, logoStiffness, logoDamping,
    centerButtonRotates,
    itemMotionDuration,
    itemMotionStagger,
    itemMotionCurvePreset,
    itemMotionBezier: resolvedItemMotionBezier,
    scrollBehavior: scrollEnabled ? {
      enabled: true,
      corner: scrollCorner,
      startTop: scrollStartTop,
      startTopRatio: scrollStartTopRatio,
      edgeGap: scrollEdgeGap,
      edgeGapRatio: scrollEdgeGapRatio,
      headerEnabled: scrollHeaderEnabled,
      headerHeight: scrollHeaderHeight,
      headerHeightRatio: scrollHeaderHeightRatio,
      topStopOverHeader: scrollTopStopOverHeader,
      topStopOverHeaderRatio: scrollTopStopOverHeaderRatio,
      footerEnabled: scrollFooterEnabled,
      footerHeight: scrollFooterHeight,
      footerHeightRatio: scrollFooterHeightRatio,
      bottomBuffer: scrollBottomBuffer,
      bottomBufferRatio: scrollBottomBufferRatio,
      bottomBufferOpen: scrollBottomBufferOpen,
      bottomBufferOpenRatio: scrollBottomBufferOpenRatio,
      openShiftTop: scrollOpenShiftTop,
      openShiftTopRatio: scrollOpenShiftTopRatio,
      openShiftBottom: scrollOpenShiftBottom,
      openShiftBottomRatio: scrollOpenShiftBottomRatio,
      speedFactor: scrollSpeedFactor,
    } : { enabled: false },
    responsive: {
      desktop: { ...(responsiveProfiles.desktop || {}) },
      ipadPortrait: { ...(responsiveProfiles.ipadPortrait || {}) },
      ipadLandscape: { ...(responsiveProfiles.ipadLandscape || {}) },
      mobile: { ...(responsiveProfiles.mobile || {}) },
      breakpoints: { ipadPortraitMax: 1024, ipadLandscapeMax: 1366, mobileMax: 768 },
    },
    logoText, logoImage, logoType, logoFontFamily, logoFontWeight, logoIconKey: resolvedLogoIconName, logoSize, logoFit, menuItemFontSize,
    menuItemFontFamily: itemFontFamily,
    menuItemFontUrl: itemFontUrl,
    backdropBlur,
    backdropImage,
    backdropTintColor,
    backdropTintOpacity,
    buttonShape, squareRadius, polygonSides, polygonCorner,
    buttonBgColor, buttonOutlineColor, buttonOutlineWidth,
    menuItemBgColor, menuItemOutlineColor, menuItemOutlineWidth, menuItemTextColor,
  });

  const buildSnapshotState = () => ({
    ...buildExportConfig(),
    startAngle,
    menuItems,
    submenus,
  });

  const applySnapshotState = (state) => {
    if (!state || typeof state !== 'object') return;
    if (state.responsive && typeof state.responsive === 'object') {
      const legacyTablet = state.responsive.tablet || {};
      setResponsiveProfiles((prev) => ({
        ...prev,
        desktop: { ...prev.desktop, ...(state.responsive.desktop || {}) },
        ipadPortrait: { ...prev.ipadPortrait, ...(state.responsive.ipadPortrait || legacyTablet) },
        ipadLandscape: { ...prev.ipadLandscape, ...(state.responsive.ipadLandscape || legacyTablet) },
        mobile: { ...prev.mobile, ...(state.responsive.mobile || {}) },
      }));
    }
    if (state.radius !== undefined) setRadius(state.radius);
    if (state.menuOffsetRatio !== undefined) setMenuOffsetRatioState(state.menuOffsetRatio);
    else if (state.menuOffset !== undefined) setMenuOffsetRatioState(offsetYRatioFromPx(state.menuOffset, 'desktop'));
    if (state.menuOffsetXRatio !== undefined) setMenuOffsetXRatioState(state.menuOffsetXRatio);
    else if (state.menuOffsetX !== undefined) setMenuOffsetXRatioState(offsetXRatioFromPx(state.menuOffsetX, 'desktop'));
    if (state.buttonSize !== undefined) setButtonSize(state.buttonSize);
    if (state.startAngle !== undefined) setStartAngleNormalized(state.startAngle);
    if (state.logoStiffness !== undefined) setLogoStiffness(state.logoStiffness);
    if (state.logoDamping !== undefined) setLogoDamping(state.logoDamping);
    if (state.centerButtonRotates !== undefined) setCenterButtonRotates(state.centerButtonRotates);
    if (state.itemMotionDuration !== undefined) setItemMotionDuration(state.itemMotionDuration);
    if (state.itemMotionStagger !== undefined) setItemMotionStagger(state.itemMotionStagger);
    if (state.itemMotionCurvePreset !== undefined) setItemMotionCurvePreset(state.itemMotionCurvePreset);
    if (state.itemMotionBezier !== undefined) setItemMotionBezier(state.itemMotionBezier);
    if (state.logoText !== undefined) setLogoText(state.logoText);
    if (state.logoImage !== undefined) setLogoImage(state.logoImage);
    if (state.logoType !== undefined) setLogoType(state.logoType);
    if (state.logoFontFamily !== undefined) setLogoFontFamily(state.logoFontFamily);
    if (state.logoFontWeight !== undefined) setLogoFontWeight(state.logoFontWeight);
    if (state.logoIconKey !== undefined) {
      setLogoIconKey(state.logoIconKey);
      setLogoIconInput(state.logoIconKey);
    }
    if (state.logoSize !== undefined) setLogoSize(state.logoSize);
    if (state.logoFit !== undefined) setLogoFit(state.logoFit);
    if (state.menuItemFontSize !== undefined) setMenuItemFontSize(state.menuItemFontSize);
    if (state.menuItemFontFamily !== undefined) setItemFontFamily(state.menuItemFontFamily);
    if (state.menuItemFontUrl !== undefined) setItemFontUrl(state.menuItemFontUrl);
    if (state.backdropBlur !== undefined) setBackdropBlur(state.backdropBlur);
    if (state.buttonShape !== undefined) setButtonShape(state.buttonShape);
    if (state.squareRadius !== undefined) setSquareRadius(state.squareRadius);
    if (state.polygonSides !== undefined) setPolygonSides(state.polygonSides);
    if (state.polygonCorner !== undefined) setPolygonCorner(state.polygonCorner);
    if (state.buttonBgColor !== undefined) setButtonBgColor(state.buttonBgColor);
    if (state.buttonOutlineColor !== undefined) setButtonOutlineColor(state.buttonOutlineColor);
    if (state.buttonOutlineWidth !== undefined) setButtonOutlineWidth(state.buttonOutlineWidth);
    if (state.menuItemBgColor !== undefined) setMenuItemBgColor(state.menuItemBgColor);
    if (state.menuItemOutlineColor !== undefined) setMenuItemOutlineColor(state.menuItemOutlineColor);
    if (state.menuItemOutlineWidth !== undefined) setMenuItemOutlineWidth(state.menuItemOutlineWidth);
    if (state.menuItemTextColor !== undefined) setMenuItemTextColor(state.menuItemTextColor);
    if (state.backdropImage !== undefined) setBackdropImage(state.backdropImage);
    if (state.backdropTintColor !== undefined) setBackdropTintColor(state.backdropTintColor);
    if (state.backdropTintOpacity !== undefined) setBackdropTintOpacity(state.backdropTintOpacity);
    if (state.scrollBehavior) {
      const sb = state.scrollBehavior;
      setScrollEnabled(!!sb.enabled);
      if (sb.corner !== undefined) setScrollCorner(sb.corner);
      if (sb.startTopRatio !== undefined) setScrollStartTopRatio(sb.startTopRatio);
      else if (sb.startTop !== undefined) setScrollStartTopRatio(verticalRatioFromPx(sb.startTop, 'desktop'));
      if (sb.edgeGapRatio !== undefined) setScrollEdgeGapRatio(sb.edgeGapRatio);
      else if (sb.edgeGap !== undefined) setScrollEdgeGapRatio(horizontalRatioFromPx(sb.edgeGap, 'desktop'));
      if (sb.headerEnabled !== undefined) setScrollHeaderEnabled(!!sb.headerEnabled);
      if (sb.headerHeightRatio !== undefined) setScrollHeaderHeightRatio(sb.headerHeightRatio);
      else if (sb.headerHeight !== undefined) setScrollHeaderHeightRatio(verticalRatioFromPx(sb.headerHeight, 'desktop'));
      if (sb.topStopOverHeaderRatio !== undefined) setScrollTopStopOverHeaderRatio(sb.topStopOverHeaderRatio);
      else if (sb.topStopOverHeader !== undefined) setScrollTopStopOverHeaderRatio(verticalRatioFromPx(sb.topStopOverHeader, 'desktop'));
      if (sb.footerEnabled !== undefined) setScrollFooterEnabled(!!sb.footerEnabled);
      if (sb.footerHeightRatio !== undefined) setScrollFooterHeightRatio(sb.footerHeightRatio);
      else if (sb.footerHeight !== undefined) setScrollFooterHeightRatio(verticalRatioFromPx(sb.footerHeight, 'desktop'));
      if (sb.bottomBufferRatio !== undefined) setScrollBottomBufferRatio(sb.bottomBufferRatio);
      else if (sb.bottomBuffer !== undefined) setScrollBottomBufferRatio(verticalRatioFromPx(sb.bottomBuffer, 'desktop'));
      if (sb.bottomBufferOpenRatio !== undefined) setScrollBottomBufferOpenRatio(sb.bottomBufferOpenRatio);
      else if (sb.bottomBufferOpen !== undefined) setScrollBottomBufferOpenRatio(verticalRatioFromPx(sb.bottomBufferOpen, 'desktop'));
      if (sb.openShiftTopRatio !== undefined) setScrollOpenShiftTopRatio(sb.openShiftTopRatio);
      else if (sb.openShiftTop !== undefined) setScrollOpenShiftTopRatio(verticalRatioFromPx(sb.openShiftTop, 'desktop'));
      if (sb.openShiftBottomRatio !== undefined) setScrollOpenShiftBottomRatio(sb.openShiftBottomRatio);
      else if (sb.openShiftBottom !== undefined) setScrollOpenShiftBottomRatio(verticalRatioFromPx(sb.openShiftBottom, 'desktop'));
      if (sb.speedFactor !== undefined) setScrollSpeedFactor(sb.speedFactor);
    }
    if (Array.isArray(state.menuItems)) setMenuItems(state.menuItems);
    if (state.submenus && typeof state.submenus === 'object') setSubmenus(state.submenus);
    setEditingSubmenu(null);
    setAnimatePreview(false);
    setIsManualOpen(false);
    setShowMenuItems(false);
    setLogoRotation(0);
  };

  useEffect(() => {
    if (!hasHydratedDraft) return;
    latestDraftRef.current = buildSnapshotState();
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(CUSTOMIZER_DRAFT_KEY, JSON.stringify(latestDraftRef.current));
      } catch {
        // ignore storage write failures
      }
    }, 180);
    return () => clearTimeout(timer);
  }, [
    hasHydratedDraft,
    radius, menuOffset, menuOffsetX, buttonSize, startAngle,
    scrollEnabled, scrollCorner, scrollStartTopRatio, scrollEdgeGapRatio,
    scrollHeaderEnabled, scrollHeaderHeightRatio, scrollTopStopOverHeaderRatio, scrollFooterEnabled, scrollFooterHeightRatio,
    scrollBottomBufferRatio, scrollBottomBufferOpenRatio, scrollOpenShiftTopRatio, scrollOpenShiftBottomRatio, scrollSpeedFactor,
    logoStiffness, logoDamping, centerButtonRotates, itemMotionDuration, itemMotionStagger, itemMotionCurvePreset, resolvedItemMotionBezier,
    logoText, logoImage, logoType, logoFontFamily, logoFontWeight, resolvedLogoIconName, logoSize, logoFit, menuItemFontSize, itemFontFamily, itemFontUrl,
    backdropBlur, backdropImage, backdropTintColor, backdropTintOpacity,
    buttonShape, squareRadius, polygonSides, polygonCorner,
    buttonBgColor, buttonOutlineColor, buttonOutlineWidth,
    menuItemBgColor, menuItemOutlineColor, menuItemOutlineWidth, menuItemTextColor,
    menuItems, submenus, responsiveProfiles, previewDevice,
  ]);

  useEffect(() => {
    if (!hasHydratedDraft) return;
    latestDraftRef.current = buildSnapshotState();
    const flushDraftNow = () => {
      try {
        const snapshot = latestDraftRef.current || buildSnapshotState();
        localStorage.setItem(CUSTOMIZER_DRAFT_KEY, JSON.stringify(snapshot));
      } catch {
        // ignore storage write failures
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flushDraftNow();
    };
    window.addEventListener('pagehide', flushDraftNow);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('pagehide', flushDraftNow);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      flushDraftNow();
    };
  }, [hasHydratedDraft]);

  const persistSnapshots = (nextSnapshots) => {
    setSnapshots(nextSnapshots);
    localStorage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(nextSnapshots));
  };

  const saveSnapshot = () => {
    const name = snapshotName.trim() || `Snapshot ${snapshots.length + 1}`;
    const entry = {
      id: `snap-${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      state: buildSnapshotState(),
    };
    const next = [entry, ...snapshots].slice(0, 24);
    persistSnapshots(next);
    setSnapshotName('');
  };

  const loadSnapshot = (snapshot) => {
    applySnapshotState(snapshot?.state);
    setShowSnapshotOverlay(false);
  };

  const deleteSnapshot = (id) => {
    persistSnapshots(snapshots.filter((snap) => snap.id !== id));
  };

  const applyBasePresetToLocalState = (presetName, mode) => {
    const preset = orbitMenuPresets[presetName];
    if (!preset) return;
    applyPreset(presetName, mode);

    const baseVisual = preset.visual || {};
    const baseAnimation = preset.animation || {};
    const menuAnim = baseAnimation.menuItem || {};
    const logoAnim = baseAnimation.logo || {};

    if (baseVisual.radius !== undefined) setRadius(baseVisual.radius);
    if (baseVisual.menuOffsetRatio !== undefined) setMenuOffsetRatioState(baseVisual.menuOffsetRatio);
    else if (baseVisual.menuOffset !== undefined) setMenuOffsetRatioState(offsetYRatioFromPx(baseVisual.menuOffset, 'desktop'));
    if (baseVisual.menuOffsetXRatio !== undefined) setMenuOffsetXRatioState(baseVisual.menuOffsetXRatio);
    else if (baseVisual.menuOffsetX !== undefined) setMenuOffsetXRatioState(offsetXRatioFromPx(baseVisual.menuOffsetX, 'desktop'));
    if (baseVisual.startAngle !== undefined) setStartAngleNormalized(baseVisual.startAngle);
    if (logoAnim.stiffness !== undefined) setLogoStiffness(logoAnim.stiffness);
    if (logoAnim.damping !== undefined) setLogoDamping(logoAnim.damping);
    if (
      menuAnim.stiffness !== undefined
      || menuAnim.damping !== undefined
      || menuAnim.staggerDelay !== undefined
    ) {
      const nextMotion = deriveLegacyItemMotion(
        menuAnim.stiffness,
        menuAnim.damping,
        menuAnim.staggerDelay
      );
      setItemMotionDuration(nextMotion.duration);
      setItemMotionStagger(nextMotion.stagger);
      setItemMotionCurvePreset('custom');
      setItemMotionBezier(nextMotion.bezier);
    }

    setPresetHint(`Preset applied: ${presetName} (${mode})`);
    setTimeout(() => setPresetHint(''), 1800);
  };

  const syncCustomizerToGlobalConfig = () => {
    updateMany({
      visual: {
        radius,
        menuOffset,
        menuOffsetRatio,
        startAngle,
        backdrop: { blur: `${backdropBlur}px` },
        colors: {
          background: menuItemBgColor,
          backgroundDark: buttonBgColor,
          text: menuItemTextColor,
          borderHighlight: buttonOutlineColor,
          backdrop: hexToRgba(backdropTintColor, backdropTintOpacity / 100),
        },
      },
      animation: {
        logo: {
          stiffness: logoStiffness,
          damping: logoDamping,
        },
        menuItem: {
          duration: itemMotionDuration,
          staggerDelay: itemMotionStagger,
          curvePreset: itemMotionCurvePreset,
          bezier: resolvedItemMotionBezier,
        },
      },
    });
    setSyncHint('Global config synced');
    setTimeout(() => setSyncHint(''), 1800);
  };

  const handleImportProjectJson = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      applySnapshotState(parsed);
      setJsonImportHint(`Loaded: ${file.name}`);
    } catch {
      setJsonImportHint('Invalid JSON file');
    } finally {
      e.target.value = '';
      setTimeout(() => setJsonImportHint(''), 2500);
    }
  };

  const getDownloadMeta = (tab) => {
    switch (tab) {
      case 'react':
        return { label: 'React herunterladen', filename: 'orbit-menu.jsx', mime: 'text/plain' };
      case 'guide':
        return { label: 'Guide herunterladen', filename: 'orbit-menu-guide.md', mime: 'text/markdown' };
      case 'css':
        return { label: 'CSS herunterladen', filename: 'orbit-menu.css', mime: 'text/css' };
      case 'json':
      default:
        return { label: 'Project JSON herunterladen', filename: 'orbit-project.json', mime: 'application/json' };
    }
  };

  const handleExport = () => {
    const activeTab = exportTab || 'json';
    const { filename, mime } = getDownloadMeta(activeTab);
    const content = getExportContent(activeTab);
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const handleShareConfig = async () => {
    const json = generateProjectJson(buildSnapshotState(), { includeBranding: exportIncludeBranding || !isPro });
    const file = new File([json], 'zenorbit-signature.json', { type: 'application/json' });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          title: 'ZenOrbit Signature',
          text: 'Meine ZenOrbit Konfiguration — im Customizer unter "Project JSON importieren" laden.',
          files: [file],
        });
      } catch (e) {
        if (e.name !== 'AbortError') handleExport();
      }
    } else if (navigator.share) {
      navigator.share({ title: 'ZenOrbit Signature', url: window.location.href }).catch(() => {});
    } else {
      handleExport();
    }
  };

  const handleHTMLExport = async () => {
    const cfg = buildExportConfig();
    const files = generateHTMLPackage(cfg, { includeBranding: exportIncludeBranding || !isPro });
    const zip = new JSZip();
    const folder = zip.folder('orbit-menu-build');
    Object.entries(files).forEach(([path, content]) => {
      folder.file(path, content);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'orbit-menu-build.zip'; a.click();
    URL.revokeObjectURL(url);
  };

  const runZenClean = (mode) => {
    const before = {
      blur: backdropBlur,
      size: buttonSize,
      radius,
      outline: menuItemOutlineWidth,
      jank: perfStats.jankPct,
      fpsTarget: perfStats.fpsTargetPct,
    };

    const profilesFactor = mode === 'light' ? 0.94 : mode === 'balanced' ? 0.88 : 0.8;
    const blurStep = mode === 'light' ? 1 : mode === 'balanced' ? 2 : 3;
    const outlineTarget = mode === 'aggressive' ? 1 : menuItemOutlineWidth;

    setBackdropBlur((v) => Math.max(0, v - blurStep));
    setMenuItemOutlineWidth(outlineTarget);
    setButtonSize((v) => Math.max(40, Math.round(v * profilesFactor)));
    setRadius((v) => Math.max(50, Math.round(v * profilesFactor)));

    setResponsiveProfiles((prev) => {
      const mapProfile = (profile) => ({
        ...profile,
        buttonSize: Math.max(40, Math.round((profile.buttonSize || buttonSize) * profilesFactor)),
        radius: Math.max(50, Math.round((profile.radius || radius) * profilesFactor)),
      });
      return {
        ...prev,
        desktop: mapProfile(prev.desktop || {}),
        ipadPortrait: mapProfile(prev.ipadPortrait || {}),
        ipadLandscape: mapProfile(prev.ipadLandscape || {}),
        mobile: mapProfile(prev.mobile || {}),
      };
    });

    requestAnimationFrame(() => {
      snapOffsetsIntoBounds();
      setCleaningReport({
        mode,
        timestamp: Date.now(),
        before,
        after: {
          blur: Math.max(0, before.blur - blurStep),
          size: Math.max(40, Math.round(before.size * profilesFactor)),
          radius: Math.max(50, Math.round(before.radius * profilesFactor)),
          outline: outlineTarget,
        },
      });
    });
  };

  const addMenuItem = () => setMenuItems((prev) => {
    const nextAngle = (() => {
      if (prev.length === 0) return 0;
      if (prev.length === 1) return normalizeAngle((prev[0].angle || 0) + 180);

      const points = prev
        .map((item) => ((item.angle || 0) % 360 + 360) % 360)
        .sort((a, b) => a - b);

      let largestGap = -1;
      let midpoint = points[0];

      for (let i = 0; i < points.length; i += 1) {
        const current = points[i];
        const next = i === points.length - 1 ? points[0] + 360 : points[i + 1];
        const gap = next - current;
        if (gap > largestGap) {
          largestGap = gap;
          midpoint = current + (gap / 2);
        }
      }

      return normalizeAngle(Math.round(midpoint));
    })();

    return [
      ...prev,
      { id: Date.now(), angle: nextAngle, label: 'Neu', action: 'route', route: '/' },
    ];
  });

  const rebalanceMenuItemAngles = () => {
    setMenuItems((prev) => {
      if (prev.length < 2) return prev;

      const sorted = [...prev].sort((a, b) => {
        const aa = ((a.angle || 0) % 360 + 360) % 360;
        const bb = ((b.angle || 0) % 360 + 360) % 360;
        return aa - bb;
      });

      const firstAngle = ((sorted[0].angle || 0) % 360 + 360) % 360;
      const step = 360 / sorted.length;
      const angleById = new Map(
        sorted.map((item, index) => [
          item.id,
          normalizeAngle(Math.round(firstAngle + (index * step))),
        ])
      );

      return prev.map((item) => ({
        ...item,
        angle: angleById.get(item.id) ?? item.angle,
      }));
    });
  };

  const distributeMenuItemsOnArc = (arcStartDeg, arcEndDeg) => {
    setMenuItems((prev) => {
      if (prev.length === 0) return prev;

      const sorted = [...prev].sort((a, b) => {
        const aa = ((a.angle || 0) % 360 + 360) % 360;
        const bb = ((b.angle || 0) % 360 + 360) % 360;
        return aa - bb;
      });

      const count = sorted.length;
      const span = arcEndDeg - arcStartDeg;
      const step = count === 1 ? 0 : span / (count - 1);
      const angleById = new Map(
        sorted.map((item, index) => [
          item.id,
          normalizeAngle(Math.round(arcStartDeg + (index * step))),
        ])
      );

      return prev.map((item) => ({
        ...item,
        angle: angleById.get(item.id) ?? item.angle,
      }));
    });
  };

  const distributeRightArc = () => distributeMenuItemsOnArc(-90, 90);
  const distributeLeftArc = () => distributeMenuItemsOnArc(90, 270);
  const removeMenuItem = (id) => setMenuItems(prev => prev.filter(i => i.id !== id));
  const updateMenuItem = (id, field, value) =>
    setMenuItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));

  const togglePreview = () => {
    const next = !isManualOpen;
    setIsManualOpen(next);
    setShowMenuItems(next);
  };

  const setStartAngleNormalized = (value) => {
    if (!Number.isFinite(value)) return;
    setStartAngle(normalizeAngle(Math.round(value)));
  };

  const triggerAnimationPreview = () => {
    if (previewDebounceRef.current) {
      clearTimeout(previewDebounceRef.current);
    }
    setAnimatePreview(false);
    previewDebounceRef.current = setTimeout(() => {
      setAnimatePreview(true);
    }, 30);
  };

  const scheduleAnimationPreview = () => {
    if (previewDebounceRef.current) {
      clearTimeout(previewDebounceRef.current);
    }
    previewDebounceRef.current = setTimeout(() => {
      triggerAnimationPreview();
    }, 140);
  };

  const applyIntentDecisionToMenu = () => {
    setMenuItems(mapDecisionToCustomizerItems(intentDecision));
    setEditingSubmenu(null);
    scheduleAnimationPreview();
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Preview Panel
  // ─────────────────────────────────────────────────────────────────────────
  const perfTargetRatio = perfStats.fpsTargetPct / 100;
  const perfHealth = !perfMonitorEnabled
    ? 'off'
    : perfTargetRatio >= 0.9 && perfStats.jankPct < 8
      ? 'smooth'
      : perfTargetRatio >= 0.72 && perfStats.jankPct < 18
        ? 'ok'
        : 'heavy';

  const perfInsight = useMemo(() => {
    if (!perfMonitorEnabled) {
      return {
        label: 'Monitoring aus',
        color: zenPalette.textMuted,
        reason: 'Monitor starten fuer Live-Analyse.',
        tips: [],
      };
    }

    const lowFps = perfStats.fps > 0 && perfTargetRatio < 0.82;
    const janky = perfStats.jankPct >= 14;
    const reactHeavy = perfStats.reactSharePct >= 45 || perfStats.avgReactRenderMs >= 7;
    const paintHeavy = (lowFps || janky) && perfStats.reactSharePct < 28;

    if (!lowFps && !janky) {
      return {
        label: 'Smooth',
        color: zenPalette.success,
        reason: `Live Preview laeuft stabil (${Math.round(perfStats.fpsTargetPct)}% vom ${perfStats.targetHz}Hz-Ziel).`,
        tips: ['Optional nur Feintuning notwendig.'],
      };
    }
    if (reactHeavy) {
      return {
        label: 'Script/React Last',
        color: zenPalette.danger,
        reason: 'React-Render-Anteil ist hoch.',
        tips: [
          'State-Updates reduzieren (batchen/debouncen).',
          'Memoisierung fuer teure Berechnungen erweitern.',
        ],
      };
    }
    if (paintHeavy || backdropBlur > 12) {
      return {
        label: 'Render/Paint Last',
        color: zenPalette.gold,
        reason: 'Rendering/Paint dominiert den Frame.',
        tips: [
          'Blur, Schatten oder Overlays reduzieren.',
          'Animation auf transform/opacity fokussieren.',
        ],
      };
    }
    return {
      label: 'Balanced Bottleneck',
      color: zenPalette.text,
      reason: 'Kein eindeutiger Hotspot, gemischte Last.',
      tips: [
        'Im Browser Performance Tab nach Layout/Paint vergleichen.',
      ],
    };
  }, [perfMonitorEnabled, perfStats.fps, perfStats.jankPct, perfStats.reactSharePct, perfStats.avgReactRenderMs, perfStats.fpsTargetPct, perfStats.targetHz, perfTargetRatio, backdropBlur]);

  const engineRecommendation = useMemo(() => {
    if (!perfMonitorEnabled) {
      return {
        level: 'monitor_off',
        label: 'Engine Recommendation: Monitoring aktivieren',
        color: zenPalette.textMuted,
      };
    }

    const lowFps = perfStats.fps > 0 && perfTargetRatio < 0.78;
    const veryLowFps = perfStats.fps > 0 && perfTargetRatio < 0.62;
    const highJank = perfStats.jankPct >= 18;
    const veryHighJank = perfStats.jankPct >= 28;
    const reactHeavy = perfStats.reactSharePct >= 45 || perfStats.avgReactRenderMs >= 7;
    const veryReactHeavy = perfStats.reactSharePct >= 60 || perfStats.avgReactRenderMs >= 10;

    if (!lowFps && perfStats.jankPct < 10 && perfTargetRatio >= 0.9) {
      return {
        level: 'js_only',
        label: 'Engine Recommendation: JS only',
        color: zenPalette.success,
      };
    }

    if (veryLowFps && veryHighJank && veryReactHeavy) {
      return {
        level: 'wasm_cpp',
        label: 'Engine Recommendation: WASM/C++ sinnvoll',
        color: zenPalette.danger,
      };
    }

    if ((lowFps && highJank && reactHeavy) || veryReactHeavy) {
      return {
        level: 'js_worker',
        label: 'Engine Recommendation: JS + Worker',
        color: zenPalette.gold,
      };
    }

    return {
      level: 'optimize_render',
      label: 'Engine Recommendation: Erst Render/Paint optimieren',
      color: zenPalette.textMuted,
    };
  }, [perfMonitorEnabled, perfStats.fps, perfStats.jankPct, perfStats.reactSharePct, perfStats.avgReactRenderMs, perfTargetRatio]);

  const retinaPixelLoadMp = useMemo(() => {
    const w = previewFrameMetrics.width || 0;
    const h = previewFrameMetrics.height || 0;
    if (w <= 0 || h <= 0) return 0;
    const pixels = w * h * devicePixelRatio * devicePixelRatio;
    return Number((pixels / 1_000_000).toFixed(2));
  }, [previewFrameMetrics.width, previewFrameMetrics.height, devicePixelRatio]);

  useEffect(() => {
    if (!perfMonitorEnabled) return;
    const isCritical =
      perfHealth === 'heavy' ||
      perfInsight.label === 'Script/React Last' ||
      perfInsight.label === 'Render/Paint Last';
    if (!isCritical) return;

    const now = Date.now();
    if (now - perfAlertCooldownRef.current < 6000) return;
    perfAlertCooldownRef.current = now;

    const nextAlert = {
      id: `alert-${now}`,
      timestamp: now,
      label: perfInsight.label,
      reason: perfInsight.reason,
      fps: perfStats.fps,
      jankPct: perfStats.jankPct,
      fpsTargetPct: perfStats.fpsTargetPct,
      targetHz: perfStats.targetHz,
    };

    setPerfLastAlert(nextAlert);
    setPerfAlertHistory((prev) => [nextAlert, ...prev].slice(0, 5));
  }, [
    perfMonitorEnabled,
    perfHealth,
    perfInsight.label,
    perfInsight.reason,
    perfStats.fps,
    perfStats.jankPct,
    perfStats.fpsTargetPct,
    perfStats.targetHz,
  ]);

  const deviceFrameStyle = (() => {
    if (previewDevice === 'mobile') return {
      borderRadius: 44,
      border: 'none',
      boxShadow: '0 0 0 1px #0a0a0c, 0 24px 64px rgba(0,0,0,0.7)',
    };
    if (previewDevice === 'ipadPortrait' || previewDevice === 'ipadLandscape') return {
      borderRadius: 20,
      border: 'none',
      boxShadow: '0 0 0 1px #0a0a0c, 0 16px 50px rgba(0,0,0,0.6)',
    };
    return {
      borderRadius: 8,
      border: `1px solid ${zenPalette.borderStrong}`,
      boxShadow: '0 0 0 1px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.2)',
    };
  })();

  // Scale all values to match preview frame size vs real device size
  const s = previewFrameMetrics.scale || 1;
  const previewContentScale = previewActualSize ? 1 : (PREVIEW_DEVICE_CONTENT_SCALES[previewDevice] || 1);
  const visualScale = s * previewContentScale;
  const dBtn  = Math.max(8,  Math.round(buttonSize      * visualScale));
  const dRad  = Math.max(10, Math.round(radius          * visualScale));
  const dOffY = Math.round(menuOffset   * visualScale);
  const dOffX = Math.round(menuOffsetX  * visualScale);
  const dFont = Math.max(5,  Math.round(menuItemFontSize * visualScale));
  const dOutline = Math.max(1, Math.round(menuItemOutlineWidth * visualScale));
  const logicalFrameWidth = selectedPreviewPreset.width || 0;
  const logicalFrameHeight = selectedPreviewPreset.height || 0;
  const logicalAnchorX = logicalViewportMetrics.anchorX;
  const logicalAnchorY = logicalViewportMetrics.anchorY;
  const previewShapeStyle = {
    circle:  { borderRadius: '50%', clipPath: 'none' },
    square:  { borderRadius: `${Math.max(0, Math.round(squareRadius * visualScale))}px`, clipPath: 'none' },
    polygon: { borderRadius: 0, clipPath: ngonPath(polygonSides, polygonCorner, dBtn) },
  }[buttonShape] || { borderRadius: '50%', clipPath: 'none' };
  const previewAnchorX = previewActualSize ? '50%' : `${logicalFrameWidth > 0 ? Math.round((logicalAnchorX / logicalFrameWidth) * 10000) / 100 : 50}%`;
  const previewAnchorY = previewActualSize ? '50%' : `${logicalFrameHeight > 0 ? Math.round((logicalAnchorY / logicalFrameHeight) * 10000) / 100 : 50}%`;
  const effectiveDOffX = previewActualSize ? 0 : dOffX;
  const effectiveDOffY = previewActualSize ? 0 : dOffY;

  // Scroll-mode button position (corner-based, simulates fixed positioning)
  const scrollBtnPosition = (() => {
    if (!scrollSimActive) return null;
    const pH = previewFrameMetrics.height || 300;
    const pW = previewFrameMetrics.width  || 400;
    const previewChromeTopInset = previewActualSize ? (previewSafeArea.top * s) : previewDeviceChrome.contentInsets.top;
    const previewChromeBottomInset = previewActualSize ? (previewSafeArea.bottom * s) : previewDeviceChrome.contentInsets.bottom;
    const headerOffset = scrollHeaderEnabled ? scrollHeaderHeight * s : 0;
    const topStopAllowance = scrollHeaderEnabled ? scrollTopStopOverHeader * s : 0;
    const footerOffset = scrollFooterEnabled ? scrollFooterHeight * s : 0;
    const startTop = previewChromeTopInset + (scrollStartTop * s) + headerOffset;
    const minTop = previewChromeTopInset + headerOffset - topStopAllowance;
    const isNearBottom = fakeScrollY > (previewFrameMetrics.height || 300) * 0.4;
    const rawShift = isManualOpen ? (isNearBottom ? scrollOpenShiftBottom : scrollOpenShiftTop) : 0;
    const openShift = rawShift * s;
    const buffer = ((isManualOpen ? scrollBottomBufferOpen : scrollBottomBuffer) * s) + previewChromeBottomInset + footerOffset;
    const effectiveTop = Math.max(minTop, startTop + openShift);
    const maxY = Math.max(0, pH - effectiveTop - buffer);
    const clampedY = Math.min(Math.max(0, fakeScrollY * scrollSpeedFactor), maxY);
    const edgeGap = scrollEdgeGap * s;
    const btnTop = effectiveTop + clampedY;
    // Button center in frame pixel coordinates (used to anchor menu items)
    const cx = scrollCorner === 'right' ? pW - edgeGap - dBtn / 2 : edgeGap + dBtn / 2;
    const cy = btnTop + dBtn / 2;
    return {
      top: btnTop,
      [scrollCorner === 'right' ? 'right' : 'left']: edgeGap,
      [scrollCorner === 'right' ? 'left'  : 'right']: 'auto',
      cx, cy,
    };
  })();

  const scrollBtnPositionLogical = (() => {
    if (!scrollSimActive) return null;
    const pH = logicalFrameHeight || 300;
    const pW = logicalFrameWidth || 400;
    const previewChromeTopInset = previewActualSize ? previewSafeArea.top : previewDeviceChrome.contentInsets.top;
    const previewChromeBottomInset = previewActualSize ? previewSafeArea.bottom : previewDeviceChrome.contentInsets.bottom;
    const headerOffset = scrollHeaderEnabled ? scrollHeaderHeight : 0;
    const topStopAllowance = scrollHeaderEnabled ? scrollTopStopOverHeader : 0;
    const footerOffset = scrollFooterEnabled ? scrollFooterHeight : 0;
    const startTop = previewChromeTopInset + scrollStartTop + headerOffset;
    const minTop = previewChromeTopInset + headerOffset - topStopAllowance;
    const isNearBottom = fakeScrollY > (logicalFrameHeight || 300) * 0.4;
    const rawShift = isManualOpen ? (isNearBottom ? scrollOpenShiftBottom : scrollOpenShiftTop) : 0;
    const buffer = (isManualOpen ? scrollBottomBufferOpen : scrollBottomBuffer) + previewChromeBottomInset + footerOffset;
    const effectiveTop = Math.max(minTop, startTop + rawShift);
    const maxY = Math.max(0, pH - effectiveTop - buffer);
    const clampedY = Math.min(Math.max(0, fakeScrollY * scrollSpeedFactor), maxY);
    const edgeGap = scrollEdgeGap;
    const btnTop = effectiveTop + clampedY;
    const cx = scrollCorner === 'right' ? pW - edgeGap - buttonSize / 2 : edgeGap + buttonSize / 2;
    const cy = btnTop + buttonSize / 2;
    return { cx, cy };
  })();

  const previewInsetBounds = useMemo(() => {
    const pW = logicalFrameWidth || 0;
    const pH = logicalFrameHeight || 0;
    if (pW <= 0 || pH <= 0) return null;
    const contentInsets = previewActualSize ? previewSafeArea : previewDeviceChrome.contentInsets;

    return {
      width: pW,
      height: pH,
      left: contentInsets.left,
      right: pW - contentInsets.right,
      top: contentInsets.top + (scrollHeaderEnabled ? scrollHeaderHeight - scrollTopStopOverHeader : 0),
      bottom: pH - contentInsets.bottom - (scrollFooterEnabled ? scrollFooterHeight : 0),
    };
  }, [
    logicalFrameHeight,
    logicalFrameWidth,
    previewActualSize,
    previewDeviceChrome.contentInsets.bottom,
    previewDeviceChrome.contentInsets.left,
    previewDeviceChrome.contentInsets.right,
    previewDeviceChrome.contentInsets.top,
    previewSafeArea.bottom,
    previewSafeArea.left,
    previewSafeArea.right,
    previewSafeArea.top,
    scrollFooterEnabled,
    scrollFooterHeight,
    scrollHeaderEnabled,
    scrollHeaderHeight,
    scrollTopStopOverHeader,
  ]);

  const baseLayoutBoundsStatus = useMemo(() => {
    if (!previewInsetBounds) {
      return { left: false, right: false, top: false, bottom: false };
    }

    const baseCx = scrollBtnPositionLogical
      ? scrollBtnPositionLogical.cx
      : logicalAnchorX + menuOffsetX;
    const baseCy = scrollBtnPositionLogical
      ? scrollBtnPositionLogical.cy
      : logicalAnchorY + menuOffset;
    const itemHalf = buttonSize / 2;

    return {
      left: baseCx - itemHalf < previewInsetBounds.left,
      right: baseCx + itemHalf > previewInsetBounds.right,
      top: baseCy - itemHalf < previewInsetBounds.top,
      bottom: baseCy + itemHalf > previewInsetBounds.bottom,
    };
  }, [
    buttonSize,
    logicalAnchorX,
    logicalAnchorY,
    menuOffset,
    menuOffsetX,
    previewInsetBounds,
    scrollBtnPositionLogical,
  ]);

  const openLayoutBoundsStatus = useMemo(() => {
    if (!previewInsetBounds) {
      return { left: false, right: false, top: false, bottom: false };
    }

    // In scroll mode: use the configured start position regardless of sim state.
    // In static mode: use anchor + offset.
    let baseCx, baseCy;
    if (scrollEnabled) {
      const pW = logicalFrameWidth || 400;
      const previewChromeTopInset = previewActualSize ? previewSafeArea.top : previewDeviceChrome.contentInsets.top;
      baseCx = scrollCorner === 'right'
        ? pW - scrollEdgeGap - buttonSize / 2
        : scrollEdgeGap + buttonSize / 2;
      baseCy = previewChromeTopInset + scrollStartTop + (scrollHeaderEnabled ? scrollHeaderHeight : 0) + buttonSize / 2;
    } else if (scrollBtnPositionLogical) {
      baseCx = scrollBtnPositionLogical.cx;
      baseCy = scrollBtnPositionLogical.cy;
    } else {
      baseCx = logicalAnchorX + menuOffsetX;
      baseCy = logicalAnchorY + menuOffset;
    }

    const points = [
      { x: baseCx, y: baseCy },
      ...menuItems.map((item) => {
        const angleRad = ((item.angle + startAngle) * Math.PI) / 180;
        return {
          x: baseCx + Math.cos(angleRad) * radius,
          y: baseCy + Math.sin(angleRad) * radius,
        };
      }),
    ];

    const itemHalf = buttonSize / 2;
    return points.reduce((status, { x, y }) => ({
      left: status.left || x - itemHalf < previewInsetBounds.left,
      right: status.right || x + itemHalf > previewInsetBounds.right,
      top: status.top || y - itemHalf < previewInsetBounds.top,
      bottom: status.bottom || y + itemHalf > previewInsetBounds.bottom,
    }), { left: false, right: false, top: false, bottom: false });
  }, [
    buttonSize,
    logicalAnchorX,
    logicalAnchorY,
    logicalFrameWidth,
    menuItems,
    menuOffset,
    menuOffsetX,
    previewInsetBounds,
    radius,
    scrollBtnPositionLogical,
    scrollCorner,
    scrollEdgeGap,
    scrollEnabled,
    previewActualSize,
    previewDeviceChrome.contentInsets.top,
    scrollHeaderEnabled,
    scrollHeaderHeight,
    scrollStartTop,
    startAngle,
  ]);
  const openLayoutOutsideBounds = openLayoutBoundsStatus.left
    || openLayoutBoundsStatus.right
    || openLayoutBoundsStatus.top
    || openLayoutBoundsStatus.bottom;
  const openLayoutSideWarning = scrollCorner === 'left'
    ? openLayoutBoundsStatus.left
    : openLayoutBoundsStatus.right;
  const openLayoutTopWarning = openLayoutBoundsStatus.top;
  const openLayoutBottomWarning = openLayoutBoundsStatus.bottom;

  const previewHeaderBarHeight = 34;
  const previewFooterBarHeight = previewActualSize ? 42 : 40;
  const useOverlayFooter = false;
  const previewPageTopInset = previewActualSize ? previewSafeArea.top * s : previewDeviceChrome.contentInsets.top;
  const previewPageBottomInset = previewActualSize ? previewSafeArea.bottom * s : previewDeviceChrome.contentInsets.bottom;
  const previewPageLeftInset = previewActualSize ? previewSafeArea.left * s : previewDeviceChrome.contentInsets.left;
  const previewPageRightInset = previewActualSize ? previewSafeArea.right * s : previewDeviceChrome.contentInsets.right;
  const previewZoneOverlayFill = isDark
    ? 'rgba(208,203,184,0.16)'
    : 'rgba(142,118,87,0.14)';
  const previewZoneOverlayFade = isDark
    ? 'rgba(208,203,184,0.03)'
    : 'rgba(142,118,87,0.04)';
  const previewZoneOverlayBorder = isDark
    ? 'rgba(208,203,184,0.42)'
    : 'rgba(142,118,87,0.38)';
  const previewZoneOverlayText = isDark
    ? '#1a1a1a'
    : '#1a1a1a';
  const previewZoneOverlayTextMuted = isDark
    ? 'rgba(218,208,188,0.78)'
    : 'rgba(122,94,60,0.76)';
  const footerButtonIdleBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(21, 17, 14, 0.08)';
  const footerButtonIdleBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(83, 68, 53, 0.28)';
  const footerButtonIdleText = isDark ? zenPalette.textMuted : '#6f614f';
  const footerButtonOpenBg = '#42cd23';
  const footerButtonOpenText = '#17210f';
  const footerButtonCloseBg = '#eb4e05';
  const footerButtonCloseText = '#fff0e8';
  const footerButtonWarnBg = isDark ? 'rgba(208, 103, 103, 0.28)' : 'rgba(208, 103, 103, 0.16)';
  const footerButtonWarnText = isDark ? '#ffd6d6' : '#8f2f2f';
  const footerButtonWarnBorder = isDark ? 'rgba(255, 172, 172, 0.7)' : 'rgba(191, 83, 83, 0.48)';
  const footerButtonViewBg = isDark ? 'rgba(208,203,184,0.08)' : 'rgba(90, 77, 61, 0.08)';
  const footerButtonViewText = isDark ? '#d8cfba' : '#5f5141';
  const footerButtonViewBorder = isDark ? 'rgba(208,203,184,0.24)' : 'rgba(95, 81, 65, 0.28)';
  const footerButtonViewActiveBg = isDark ? 'rgba(208,203,184,0.16)' : 'rgba(95, 81, 65, 0.14)';
  const previewFrameInset = previewActualSize
    ? {
        top: previewHeaderBarHeight + 8,
        right: 12,
        bottom: previewFooterBarHeight + 8,
        left: 12,
      }
    : null;

  const previewFrameStatusError = isOffsetOutsideBounds;
  const previewFrameStatusColor = previewFrameStatusError ? zenPalette.danger : zenPalette.success;
  const previewFrameStatusLabel = previewFrameStatusError ? 'outside  : ' : 'inside ok';
  const previewFrameStatusVisible = !previewActualSize;
  const previewPreferredStatusSide = scrollEnabled && scrollCorner === 'right' ? 'right' : 'left';
  const activeBoundsStatus = openLayoutOutsideBounds ? openLayoutBoundsStatus : baseLayoutBoundsStatus;
  const previewFrameLeftWarning = previewFrameStatusVisible && (previewFrameStatusError
    ? activeBoundsStatus.left
    : previewPreferredStatusSide === 'left');
  const previewFrameRightWarning = previewFrameStatusVisible && (previewFrameStatusError
    ? activeBoundsStatus.right
    : previewPreferredStatusSide === 'right');
  const previewFrameTopWarning = previewFrameStatusVisible && (previewFrameStatusError
    ? activeBoundsStatus.top
    : false);
  const previewFrameBottomWarning = previewFrameStatusVisible && (previewFrameStatusError
    ? activeBoundsStatus.bottom
    : false);
  const visualPositionControlsDisabled = previewActualSize || scrollEnabled;
  const visualPositionDisabledReason = scrollEnabled
    ? 'Scroll ON aktiv - Position wird im Scrolling-Panel gesteuert.'
    : previewActualSize
      ? '100% View aktiv - Position ist in diesem Modus gesperrt.'
      : null;

  const PreviewPanel = (
    <Profiler id="LivePreview" onRender={handlePreviewProfilerRender}>
      <div style={{
      flex: 1,
      width: '100%',
      height: '100%',
      backgroundColor: zenPalette.bgMuted,
      border: `1px solid ${zenPalette.border}`,
      borderRadius: 8,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      minHeight: isMobile ? 400 : undefined,
    }}
    ref={previewFrameRef}
    onWheel={scrollSimActive ? (e) => e.stopPropagation() : undefined}
    >
      {previewFrameLeftWarning && (
        <div style={{
          position: 'absolute',
          top: previewHeaderBarHeight + 0,
          bottom: previewFooterBarHeight + 0,
          left: 0,
          width: 4,
          background: previewFrameStatusColor,
          boxShadow: `0 0 0 1px ${previewFrameStatusColor}33, 0 0 18px ${previewFrameStatusColor}33`,
          zIndex: 2,
          pointerEvents: 'none',
        }} />
      )}
      {previewFrameRightWarning && (
        <div style={{
          position: 'absolute',
          top: previewHeaderBarHeight + 0,
          bottom: previewFooterBarHeight + 0,
          right: 0,
          width: 4,
          background: previewFrameStatusColor,
          boxShadow: `0 0 0 1px ${previewFrameStatusColor}33, 0 0 18px ${previewFrameStatusColor}33`,
          zIndex: 2,
          pointerEvents: 'none',
        }} />
      )}
      {previewFrameTopWarning && (
        <div style={{
          position: 'absolute',
          top: previewHeaderBarHeight + 0,
          left: 0,
          right: 0,
          height: 4,
          background: previewFrameStatusColor,
          boxShadow: `0 0 0 1px ${previewFrameStatusColor}33, 0 0 18px ${previewFrameStatusColor}33`,
          zIndex: 2,
          pointerEvents: 'none',
        }} />
      )}
      {previewFrameBottomWarning && (
        <div style={{
          position: 'absolute',
          bottom: previewFooterBarHeight + 0,
          left: 0,
          right: 0,
          height: 10,
          background: previewFrameStatusColor,
          boxShadow: `0 0 0 1px ${previewFrameStatusColor}33, 0 0 18px ${previewFrameStatusColor}33`,
          zIndex: 2,
          pointerEvents: 'none',
        }} />
      )}
    
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 30,
        height: previewHeaderBarHeight,
        padding: '0 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        backgroundColor: zenPalette.panel + 'f2',
        borderBottom: `1px solid ${zenPalette.border}`,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          minWidth: 0,
          flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 10, color: zenPalette.textMuted, fontFamily: 'monospace', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            live preview · {selectedPreviewPreset.label}
          </span>
          {!previewActualSize && (
            <select
              value={previewDevice}
              onChange={(e) => setPreviewDevice(e.target.value)}
              style={{
                height: 24,
                minWidth: 118,
                padding: '0 24px 0 8px',
                borderRadius: 5,
                border: `1px solid ${zenPalette.border}`,
                backgroundColor: zenPalette.panelSoft,
                color: zenPalette.text,
                fontSize: 9,
                fontFamily: '"IBM Plex Mono", monospace',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                outline: 'none',
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                backgroundImage: `linear-gradient(45deg, transparent 50%, ${zenPalette.textMuted} 50%), linear-gradient(135deg, ${zenPalette.textMuted} 50%, transparent 50%)`,
                backgroundPosition: 'calc(100% - 14px) 10px, calc(100% - 9px) 10px',
                backgroundSize: '5px 5px, 5px 5px',
                backgroundRepeat: 'no-repeat',
              }}
              aria-label="Preview-Gerät wählen"
            >
              {PREVIEW_DEVICE_OPTIONS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
          {previewActualSize && (
            <span style={{ fontSize: 10, color: zenPalette.gold, fontFamily: 'monospace', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              · 100% view
            </span>
          )}
        </div>
        <button
          onClick={() => { setPerfMonitorEnabled(p => !p); }}
          title={perfMonitorEnabled ? 'Performance Monitor ausschalten' : 'Performance Monitor einschalten'}
          style={{
            padding: '3px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 9,
            fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.06em',
            border: `1px solid ${perfMonitorEnabled ? zenPalette.gold : zenPalette.border}`,
            backgroundColor: perfMonitorEnabled ? `${zenPalette.gold}22` : zenPalette.bgMuted,
            color: perfMonitorEnabled ? zenPalette.gold : zenPalette.textMuted,
            transition: 'all 0.18s',
          flexShrink: 0,
        }}
        >⚡ Performance {perfMonitorEnabled ? 'ON' : 'OFF'}</button>
      </div>
      {intentPreviewMeta && (
        <div style={{
          position: 'absolute',
          top: previewHeaderBarHeight + 10,
          left: previewSafeArea.left,
          zIndex: 32,
          maxWidth: previewActualSize ? 320 : 280,
          padding: '7px 9px',
          borderRadius: 6,
          border: `1px solid ${zenPalette.border}`,
          backgroundColor: `${zenPalette.panel}e8`,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          fontFamily: '"IBM Plex Mono", monospace',
          boxSizing: 'border-box',
        }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 5 }}>
            <span style={{
              padding: '2px 7px',
              borderRadius: 999,
              border: `1px solid ${zenPalette.gold}44`,
              backgroundColor: `${zenPalette.gold}14`,
              color: zenPalette.gold,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>{intentPreviewMeta.mode}</span>
            <span style={{
              padding: '2px 7px',
              borderRadius: 999,
              border: `1px solid ${zenPalette.border}`,
              backgroundColor: zenPalette.panelSoft,
              color: zenPalette.textMuted,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>{intentPreviewMeta.layout}</span>
          </div>
          <div style={{ fontSize: 10, color: zenPalette.text, fontWeight: 700, marginBottom: 3 }}>
            {intentPreviewMeta.scenario}
          </div>
          <div style={{ fontSize: 9, color: zenPalette.textMuted, lineHeight: 1.5 }}>
            {intentPreviewMeta.reason}
          </div>
        </div>
      )}
      {previewDevice === 'desktop' && perfMonitorEnabled && (
        <div style={{
          position: 'absolute',
          top: previewActualSize ? previewHeaderBarHeight + 12 : previewHeaderBarHeight + 14,
          right: previewSafeArea.right,
          zIndex: 13,
          width: 240,
          minHeight: 112,
          boxSizing: 'border-box',
          padding: '5px 8px',
          borderRadius: 5,
          border: `1px solid ${
            perfHealth === 'smooth'
              ? `${zenPalette.success}77`
              : perfHealth === 'ok'
                ? `${zenPalette.gold}77`
                : `${zenPalette.danger}77`
          }`,
          backgroundColor: zenPalette.panel + 'dd',
          fontFamily: 'monospace',
          fontSize: 9,
          color: zenPalette.textMuted,
          lineHeight: 1.45,
          fontVariantNumeric: 'tabular-nums',
          fontFeatureSettings: '"tnum" 1',
        }}>
          <div style={{ color: zenPalette.text, marginBottom: 2 }}>
            FPS {perfStats.fps} · Frame {perfStats.avgFrameMs}ms
          </div>
          <div>Jank {perfStats.jankPct}% · React {perfStats.avgReactRenderMs}ms</div>
          <div style={{ color: zenPalette.gold }}>Render Share {perfStats.reactSharePct}%</div>
          <div>DPR {devicePixelRatio} · Pixel Load {retinaPixelLoadMp}MP</div>
          <div>Target {perfStats.targetHz}Hz · FPS/Target {perfStats.fpsTargetPct}%</div>
          <div style={{ color: perfInsight.color, marginTop: 2 }}>{perfInsight.label}</div>
        </div>
      )}
      {/* ── Inner device frame ─────────────────────────────── */}
      <div style={{
        position: 'relative',
        width: previewActualSize ? 'auto' : previewFrameMetrics.width,
        height: previewActualSize ? 'auto' : previewFrameMetrics.height,
        overflow: 'hidden',
        transform: !previewActualSize && previewDevice === 'mobile' ? 'translateY(-40px)' : 'none',
        ...(previewActualSize ? {
          position: 'absolute',
          top: previewFrameInset.top,
          right: previewFrameInset.right,
          bottom: previewFrameInset.bottom,
          left: previewFrameInset.left,
          borderRadius: 12,
          border: `1px solid ${zenPalette.border}`,
          boxShadow: 'none',
          backgroundColor: zenPalette.bgMuted,
        } : deviceFrameStyle),
      }}>

      {backdropImage && (
        <div style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          backgroundImage: `url("${backdropImage}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }} />
      )}

      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        backgroundImage: `
          radial-gradient(circle at 22% 24%, rgba(172,142,102,0.22), transparent 34%),
          radial-gradient(circle at 78% 18%, rgba(97,157,255,0.18), transparent 34%),
          linear-gradient(120deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 55%)
        `,
      }} />

      {previewDevice !== 'desktop' && perfMonitorEnabled && (
        <div style={{
          position: 'absolute',
          top: previewSafeArea.top,
          right: previewSafeArea.right,
          zIndex: 55,
          width: previewDevice === 'ipadPortrait' ? 188 : 172,
          minHeight: previewDevice === 'ipadPortrait' ? 104 : 96,
          boxSizing: 'border-box',
          padding: '5px 8px',
          borderRadius: 5,
          border: `1px solid ${
            perfHealth === 'smooth'
              ? `${zenPalette.success}77`
              : perfHealth === 'ok'
                ? `${zenPalette.gold}77`
                : `${zenPalette.danger}77`
          }`,
          backgroundColor: zenPalette.panel + 'dd',
          fontFamily: 'monospace',
          fontSize: previewDevice === 'ipadPortrait' ? 8 : 9,
          color: zenPalette.textMuted,
          lineHeight: 1.45,
          fontVariantNumeric: 'tabular-nums',
          fontFeatureSettings: '"tnum" 1',
        }}>
          <div style={{ color: zenPalette.text, marginBottom: 2 }}>
            FPS {perfStats.fps} · Frame {perfStats.avgFrameMs}ms
          </div>
          <div>Jank {perfStats.jankPct}% · React {perfStats.avgReactRenderMs}ms</div>
          <div style={{ color: zenPalette.gold }}>Render Share {perfStats.reactSharePct}%</div>
          <div>DPR {devicePixelRatio} · Pixel Load {retinaPixelLoadMp}MP</div>
          <div>Target {perfStats.targetHz}Hz · FPS/Target {perfStats.fpsTargetPct}%</div>
          <div style={{ color: perfInsight.color, marginTop: 2 }}>{perfInsight.label}</div>
        </div>
      )}

      {transferBanner && (
        <div style={{
          position: 'absolute',
          top: previewSafeArea.top + 22,
          left: previewSafeArea.left,
          right: previewSafeArea.right,
          zIndex: 54,
          backgroundColor: zenPalette.gold + '18',
          border: `1px solid ${zenPalette.gold}66`,
          borderRadius: 5,
          padding: '5px 10px',
          fontSize: 9,
          fontFamily: 'monospace',
          color: zenPalette.gold,
          textAlign: 'center',
          letterSpacing: '0.06em',
        }}>
          ✓ Builder-Konfiguration übernommen
        </div>
      )}

      {!previewActualSize && scrollEnabled && scrollHeaderEnabled && (
        <div style={{
          position: 'absolute',
          top: previewPageTopInset,
          left: previewPageLeftInset,
          right: previewPageRightInset,
          height: Math.max(0, scrollHeaderHeight * s),
          zIndex: 52,
          pointerEvents: 'none',
          background: `linear-gradient(180deg, ${previewZoneOverlayFill} 0%, ${previewZoneOverlayFade} 100%)`,
          borderBottom: `1px dashed ${previewZoneOverlayBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${Math.max(4, 8 * s)}px ${Math.max(6, 10 * s)}px`,
          boxSizing: 'border-box',
        }}>
          <span style={{ fontFamily: '"IBM Plex Mono", monospace', 
            fontSize: Math.max(7, 10 * s), letterSpacing: '0.08em', 
            textTransform: 'uppercase', 
            color: previewZoneOverlayText }}>
            Header-Zone
          </span>
          <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: Math.max(7, 10 * s), color: previewZoneOverlayTextMuted }}>
            {scrollHeaderHeight}px
          </span>
        </div>
      )}

      {!previewActualSize && scrollEnabled && scrollFooterEnabled && (
        <div style={{
          position: 'absolute',
          bottom: previewPageBottomInset,
          left: previewPageLeftInset,
          right: previewPageRightInset,
          height: Math.max(0, scrollFooterHeight * s),
          zIndex: 52,
          pointerEvents: 'none',
          background: `linear-gradient(0deg, ${previewZoneOverlayFill} 0%, ${previewZoneOverlayFade} 100%)`,
          borderTop: `1px dashed ${previewZoneOverlayBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${Math.max(4, 8 * s)}px ${Math.max(6, 10 * s)}px`,
          boxSizing: 'border-box',
        }}>
          <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: Math.max(7, 10 * s), letterSpacing: '0.08em', textTransform: 'uppercase', color: previewZoneOverlayText }}>
            Footer-Stop
          </span>
          <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: Math.max(7, 10 * s), color: previewZoneOverlayTextMuted }}>
            {scrollFooterHeight}px
          </span>
        </div>
      )}

      {/* Scrollable fake page content */}
      <div
        ref={fakeScrollRef}
        style={{
          position: 'absolute', inset: 0,
          overflowY: scrollSimActive ? 'auto' : 'hidden',
          zIndex: 1, pointerEvents: scrollSimActive ? 'auto' : 'none',
          scrollbarWidth: 'none', msOverflowStyle: 'none',
        }}
        onScroll={(e) => setFakeScrollY(e.currentTarget.scrollTop)}
        onWheel={scrollSimActive ? (e) => e.stopPropagation() : undefined}
      >
        <div style={{
          paddingTop: Math.round(previewPageTopInset + (18 * s)),
          paddingRight: Math.round(previewPageRightInset + (8 * s)),
          paddingBottom: Math.round(previewPageBottomInset + (20 * s)),
          paddingLeft: Math.round(previewPageLeftInset + (8 * s)),
          minHeight: '200%',
        }}>
          {/* Fake hero */}
          <div style={{ marginBottom: Math.round(20 * s) }}>
            <div style={{ height: Math.round(8 * s), width: '45%', borderRadius: 4, background: 'rgba(255,255,255,0.07)', marginBottom: Math.round(8 * s) }} />
            <div style={{ height: Math.round(14 * s), width: '70%', borderRadius: 4, background: 'rgba(255,255,255,0.12)', marginBottom: Math.round(6 * s) }} />
            <div style={{ height: Math.round(14 * s), width: '55%', borderRadius: 4, background: 'rgba(255,255,255,0.12)', marginBottom: Math.round(14 * s) }} />
            <div style={{ height: Math.round(6 * s), width: '80%', borderRadius: 3, background: 'rgba(255,255,255,0.05)', marginBottom: Math.round(4 * s) }} />
            <div style={{ height: Math.round(6 * s), width: '65%', borderRadius: 3, background: 'rgba(255,255,255,0.05)', marginBottom: Math.round(16 * s) }} />
            <div style={{ display: 'flex', gap: Math.round(8 * s) }}>
              <div style={{ height: Math.round(10 * s), width: Math.round(60 * s), borderRadius: Math.round(5 * s), background: 'rgba(208,203,184,0.35)' }} />
              <div style={{ height: Math.round(10 * s), width: Math.round(50 * s), borderRadius: Math.round(5 * s), background: 'rgba(255,255,255,0.06)' }} />
            </div>
          </div>
          {/* Fake cards */}
          {[0.08, 0.06, 0.07].map((op, i) => (
            <div key={i} style={{ height: Math.round(40 * s), borderRadius: Math.round(6 * s), background: `rgba(255,255,255,${op})`, marginBottom: Math.round(8 * s) }} />
          ))}
          {/* Second section */}
          <div style={{ marginTop: Math.round(24 * s) }}>
            <div style={{ height: Math.round(10 * s), width: '50%', borderRadius: 4, background: 'rgba(255,255,255,0.1)', marginBottom: Math.round(12 * s) }} />
            {[0.05, 0.04, 0.06, 0.05].map((op, i) => (
              <div key={i} style={{ height: Math.round(6 * s), width: `${70 - i * 8}%`, borderRadius: 3, background: `rgba(255,255,255,${op})`, marginBottom: Math.round(5 * s) }} />
            ))}
          </div>
        </div>
      </div>
      <div style={{
        position: 'absolute',
        top: `calc(50% + ${menuOffset - radius - 42}px)`,
        left: `calc(50% + ${menuOffsetX}px)`,
        transform: 'translate(-50%, -50%)',
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: 24,
        letterSpacing: '0.28em',
        color: 'rgba(240, 236, 223, 0.1)',
        textTransform: 'uppercase',
        pointerEvents: 'none',
        zIndex: 0,
      }}>
        ZenOrbit
      </div>
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: hexToRgba(backdropTintColor, backdropTintOpacity / 100),
        backdropFilter: `blur(${backdropBlur}px)`,
        WebkitBackdropFilter: `blur(${backdropBlur}px)`,
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* Radius ring */}
      <div style={{
        position: 'absolute',
        zIndex: 2,
        width: dRad * 2, height: dRad * 2,
        border: `1px dashed ${zenPalette.border}`,
        borderRadius: '50%',
        pointerEvents: 'none',
        ...(scrollBtnPosition
          ? { left: scrollBtnPosition.cx - dRad, top: scrollBtnPosition.cy - dRad, transform: 'none' }
          : { left: previewAnchorX, top: previewAnchorY, transform: `translate(-50%, -50%) translate(${effectiveDOffX}px, ${effectiveDOffY}px)` }
        ),
      }} />

      {/* Menu items */}
      {previewMenuItems.map((item, index) => {
        const angleRad = ((item.angle + startAngle) * Math.PI) / 180;
        const r = showMenuItems ? dRad : 0;
        const x = Math.cos(angleRad) * r;
        const y = Math.sin(angleRad) * r;
        return (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              zIndex: 4,
              ...(scrollBtnPosition
                ? { left: scrollBtnPosition.cx, top: scrollBtnPosition.cy }
                : { left: `calc(${previewAnchorX} + ${effectiveDOffX}px)`, top: `calc(${previewAnchorY} + ${effectiveDOffY}px)` }
              ),
              transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${showMenuItems ? 1 : 0.3})`,
              width: dBtn, height: dBtn,
              backgroundColor: menuItemBgColor,
              border: previewShapeStyle.clipPath === 'none' ? `${dOutline}px solid ${menuItemOutlineColor}` : 'none',
              borderRadius: previewShapeStyle.borderRadius,
              clipPath: previewShapeStyle.clipPath !== 'none' ? previewShapeStyle.clipPath : undefined,
              backdropFilter: `blur(${backdropBlur}px)`,
              WebkitBackdropFilter: `blur(${backdropBlur}px)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: dFont, color: menuItemTextColor,
              fontFamily: itemFontFamily, textAlign: 'center', padding: 2,
              opacity: showMenuItems ? 1 : 0,
              transition: `transform ${itemMotionDuration.toFixed(2)}s ${itemMotionCurve} ${(index * itemMotionStagger).toFixed(3)}s, opacity ${Math.min(itemMotionDuration, 0.35).toFixed(2)}s ${itemMotionCurve} ${(index * itemMotionStagger).toFixed(3)}s`,
              pointerEvents: 'none',
            }}
          >{item.label}</div>
        );
      })}

      {/* Center button */}
      <div
        onClick={animatePreview ? undefined : togglePreview}
        style={{
          position: 'absolute',
          ...(scrollBtnPosition
            ? { left: scrollBtnPosition.cx, top: scrollBtnPosition.cy }
            : { left: previewAnchorX, top: previewAnchorY }),
          zIndex: 10,
          width: dBtn, height: dBtn,
          backgroundColor: buttonBgColor,
          border: previewShapeStyle.clipPath === 'none' ? (buttonOutlineWidth > 0 ? `${Math.max(1, Math.round(buttonOutlineWidth * s))}px solid ${buttonOutlineColor}` : 'none') : 'none',
          borderRadius: previewShapeStyle.borderRadius,
          clipPath: previewShapeStyle.clipPath !== 'none' ? previewShapeStyle.clipPath : undefined,
          backdropFilter: `blur(${backdropBlur}px)`,
          WebkitBackdropFilter: `blur(${backdropBlur}px)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: animatePreview ? 'not-allowed' : 'pointer',
          transform: scrollBtnPosition
            ? `translate(-50%, -50%) rotate(${centerButtonRotates ? (animatePreview ? logoRotation : (isManualOpen ? 180 : 0)) : 0}deg)`
            : `translate(-50%, -50%) translate(${effectiveDOffX}px, ${effectiveDOffY}px) rotate(${centerButtonRotates ? (animatePreview ? logoRotation : (isManualOpen ? 180 : 0)) : 0}deg)`,
          transition: `transform ${centerMotionDuration.toFixed(2)}s ${itemMotionCurve}`,
          overflow: 'hidden',
          userSelect: 'none',
        }}
      >
        {logoType === 'image' && logoImage ? (
          <img src={logoImage} alt="Logo" style={{ width: `${logoSize}%`, height: `${logoSize}%`, objectFit: logoFit }} />
        ) : logoType === 'icon' ? (
          <span style={{ color: menuItemTextColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SelectedLogoIcon size={Math.max(6, dBtn * (logoSize / 100) * 0.78)} />
          </span>
        ) : (
          <span style={{
            fontSize: Math.max(6, dBtn * (logoSize / 100)),
            fontWeight: logoFontWeight,
            fontFamily: logoFontFamily,
            color: menuItemTextColor,
          }}>
            {logoText}
          </span>
        )}
      </div>

      {!previewActualSize && (
        <PreviewDeviceChrome
          device={previewDevice}
          isDark={isDark}
          zenPalette={zenPalette}
          isManualOpen={isManualOpen}
          togglePreview={togglePreview}
          buttonSize={buttonSize}
          radius={radius}
          scrollSimActive={scrollSimActive}
          setScrollSimActive={setScrollSimActive}
          setScrollEnabled={setScrollEnabled}
          openScrollingPanel={openScrollingPanel}
          isOffsetOutsideBounds={isOffsetOutsideBounds}
          snapOffsetsIntoBounds={snapOffsetsIntoBounds}
          perfMonitorEnabled={perfMonitorEnabled}
          setPerfMonitorEnabled={setPerfMonitorEnabled}
          setPreviewActualSize={setPreviewActualSize}
        />
      )}

      </div>{/* end inner device frame */}

      <div style={{
        position: 'absolute',
        bottom: useOverlayFooter ? 14 : 0,
        left: useOverlayFooter ? '50%' : 0,
        right: useOverlayFooter ? 'auto' : 0,
        transform: useOverlayFooter ? 'translateX(-50%)' : 'none',
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        minHeight: previewFooterBarHeight,
        width: useOverlayFooter ? 'calc(100% - 28px)' : 'auto',
        maxWidth: useOverlayFooter ? 520 : 'none',
        padding: useOverlayFooter ? '8px 12px' : '0 12px',
        backgroundColor: useOverlayFooter ? zenPalette.panel + 'f5' : zenPalette.panel + 'f2',
        border: useOverlayFooter ? `1px solid ${zenPalette.borderStrong}` : 'none',
        borderTop: useOverlayFooter ? `1px solid ${zenPalette.borderStrong}` : `1px solid ${zenPalette.border}`,
        borderRadius: useOverlayFooter ? 10 : 0,
        boxShadow: useOverlayFooter ? `0 14px 34px ${hexToRgba(zenPalette.bg, 0.34)}` : 'none',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        pointerEvents: 'auto',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          minWidth: 0,
          flexWrap: 'wrap',
        }}>
          <span style={{
            fontSize: 10,
            color: previewActualSize ? previewFrameStatusColor : previewFrameStatusColor,
            fontFamily: 'monospace',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 700,
          }}>
            {previewActualSize ? 'object controls' : `frame mode · ${selectedPreviewPreset.label} · ${previewFrameStatusLabel} `}
          </span>
          {!previewActualSize && (
            <span style={{ fontSize: 9, color: zenPalette.textMuted, fontFamily: 'monospace' }}>
              {selectedPreviewPreset.width}×{selectedPreviewPreset.height}
            </span>
          )}
          {previewActualSize && (
            <span style={{ fontSize: 9, color: zenPalette.textMuted, fontFamily: 'monospace' }}>
              {buttonSize}px · r{radius}
            </span>
          )}
        </div>
        {previewActualSize ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          justifyContent: 'flex-end',
          flexWrap: 'wrap',
        }}>
            <button
              onClick={togglePreview}
              style={{
                padding: '4px 12px',
                backgroundColor: isManualOpen ? footerButtonCloseBg : footerButtonOpenBg,
                color: isManualOpen ? footerButtonCloseText : footerButtonOpenText,
                border: `1px solid ${isManualOpen ? footerButtonCloseBg : footerButtonOpenBg}`,
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 10, fontFamily: 'monospace', fontWeight: 600,
              }}
            >{isManualOpen ? 'CLOSE' : 'OPEN'}</button>
            <button
              onClick={() => {
                const next = !scrollSimActive;
                setScrollSimActive(next);
                setScrollEnabled(next);
                if (next) openScrollingPanel();
              }}
              style={{
                padding: '4px 10px',
                backgroundColor: scrollSimActive ? footerButtonOpenBg : footerButtonIdleBg,
                color: scrollSimActive ? footerButtonOpenText : footerButtonIdleText,
                border: `1px solid ${scrollSimActive ? footerButtonOpenBg : footerButtonIdleBorder}`,
                borderRadius: 4, cursor: 'pointer',
                fontSize: 10, fontFamily: 'monospace', fontWeight: 600,
              }}
            >{scrollSimActive ? 'SCROLL ●' : 'SCROLL'}</button>
            {isOffsetOutsideBounds && (
              <button
                onClick={snapOffsetsIntoBounds}
                style={{
                  padding: '4px 10px',
                  backgroundColor: footerButtonWarnBg,
                  color: footerButtonWarnText,
                  border: `1px solid ${footerButtonWarnBorder}`,
                  borderRadius: 4, cursor: 'pointer',
                  fontSize: 10, fontFamily: 'monospace', fontWeight: 600,
                }}
              >SNAP</button>
            )}
            <button
              onClick={() => setPerfMonitorEnabled((p) => !p)}
              style={{
                padding: '4px 10px',
                backgroundColor: perfMonitorEnabled ? `${zenPalette.gold}22` : footerButtonIdleBg,
                color: perfMonitorEnabled ? zenPalette.gold : footerButtonIdleText,
                border: `1px solid ${perfMonitorEnabled ? zenPalette.gold : footerButtonIdleBorder}`,
                borderRadius: 4, cursor: 'pointer',
                fontSize: 10, fontFamily: 'monospace', fontWeight: 600,
              }}
            >⚡ {perfMonitorEnabled ? 'PERF ON' : 'PERF OFF'}</button>
            <button
              onClick={() => setPreviewActualSize(false)}
              style={{
                padding: '4px 10px',
                backgroundColor: footerButtonViewActiveBg,
                color: footerButtonViewText,
                border: `1px solid ${footerButtonViewBorder}`,
                borderRadius: 4, cursor: 'pointer',
                fontSize: 10, fontFamily: 'monospace', fontWeight: 600,
              }}
            >FRAME VIEW</button>
        </div>
        ) : previewDevice === 'desktop' ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            justifyContent: 'flex-end',
            flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 9, color: zenPalette.textMuted, fontFamily: 'monospace', letterSpacing: '0.04em' }}>
              safari controls in frame
            </span>
            <button
              onClick={() => setPreviewActualSize(true)}
              style={{
                padding: '4px 10px',
                backgroundColor: footerButtonViewBg,
                color: footerButtonViewText,
                border: `1px solid ${footerButtonViewBorder}`,
                borderRadius: 4, cursor: 'pointer',
                fontSize: 10, fontFamily: 'monospace', fontWeight: 600,
              }}
            >100% VIEW</button>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            justifyContent: 'flex-end',
            flexWrap: 'wrap',
          }}>
            <button
              onClick={togglePreview}
              style={{
                padding: '4px 12px',
                backgroundColor: isManualOpen ? footerButtonCloseBg : footerButtonOpenBg,
                color: isManualOpen ? footerButtonCloseText : footerButtonOpenText,
                border: `1px solid ${isManualOpen ? footerButtonCloseBg : footerButtonOpenBg}`,
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 10, fontFamily: 'monospace', fontWeight: 600,
              }}
            >{isManualOpen ? 'CLOSE' : 'OPEN'}</button>
            <span style={{ fontSize: 9, color: zenPalette.textMuted, fontFamily: 'monospace' }}>
              {buttonSize}px · r{radius}
            </span>
            {isOffsetOutsideBounds && (
              <button
                onClick={snapOffsetsIntoBounds}
                style={{
                  padding: '4px 10px',
                  backgroundColor: footerButtonWarnBg,
                  color: footerButtonWarnText,
                  border: `1px solid ${footerButtonWarnBorder}`,
                  borderRadius: 4, cursor: 'pointer',
                  fontSize: 10, fontFamily: 'monospace', fontWeight: 600,
                }}
              >SNAP</button>
            )}
            <button
              onClick={() => {
                const next = !scrollSimActive;
                setScrollSimActive(next);
                setScrollEnabled(next);
                if (next) openScrollingPanel();
              }}
              style={{
                padding: '4px 10px',
                backgroundColor: scrollSimActive ? footerButtonOpenBg : footerButtonIdleBg,
                color: scrollSimActive ? footerButtonOpenText : footerButtonIdleText,
                border: `1px solid ${scrollSimActive ? footerButtonOpenBg : footerButtonIdleBorder}`,
                borderRadius: 4, cursor: 'pointer',
                fontSize: 10, fontFamily: 'monospace', fontWeight: 600,
                transition: 'all 0.18s',
              }}
            >{scrollSimActive ? 'SCROLL ●' : 'SCROLL'}</button>
            <button
              onClick={() => setPreviewActualSize(true)}
              style={{
                padding: '4px 10px',
                backgroundColor: footerButtonViewBg,
                color: footerButtonViewText,
                border: `1px solid ${footerButtonViewBorder}`,
                borderRadius: 4, cursor: 'pointer',
                fontSize: 10, fontFamily: 'monospace', fontWeight: 600,
              }}
            >100% VIEW</button>
          </div>
        )}
      </div>

      {/* ── Performance Panel — im äußeren Container, außerhalb Device Frame ── */}
      {perfMonitorEnabled && (
        <div style={{
          position: 'absolute',
          bottom: previewActualSize
            ? previewFooterBarHeight + 14
            : useOverlayFooter
              ? previewFooterBarHeight - 6
              : previewFooterBarHeight + 8,
          left: useOverlayFooter ? 14 : 10,
          right: useOverlayFooter ? 14 : 10,
          zIndex: 72,
          display: 'flex', flexDirection: 'column', gap: 4,
          pointerEvents: 'none',
          ...(useOverlayFooter ? {
            maxWidth: 520,
            marginLeft: 'auto',
            marginRight: 'auto',
          } : {}),
        }}>
          {/* Diagnose row */}
          <div style={{
            padding: '6px 9px', borderRadius: 6,
            border: `1px solid ${perfInsight.color}88`,
            backgroundColor: zenPalette.panel + 'f4',
            boxShadow: `0 10px 24px ${hexToRgba(zenPalette.bg, 0.22)}`,
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
            pointerEvents: 'auto',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: perfInsight.color, flexShrink: 0 }} />
              <span style={{ fontSize: 8, fontFamily: 'monospace', color: perfInsight.color, fontWeight: 700, whiteSpace: 'nowrap' }}>
                {perfInsight.label}
              </span>
              <span style={{ fontSize: 8, fontFamily: 'monospace', color: zenPalette.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {perfInsight.reason}
              </span>
            </div>
            <button
              onClick={resetPerfStats}
              style={{
                flexShrink: 0, padding: '1px 6px', borderRadius: 3, cursor: 'pointer',
                fontSize: 8, fontFamily: 'monospace', fontWeight: 600,
                border: `1px solid ${zenPalette.border}`,
                backgroundColor: 'transparent', color: zenPalette.textMuted,
              }}
            >RESET</button>
          </div>

          {/* Alert + history */}
          {perfLastAlert && (
            <div style={{
              padding: '6px 9px', borderRadius: 6,
              border: `1px solid ${zenPalette.danger}88`,
              backgroundColor: zenPalette.panel + 'f4',
              boxShadow: `0 12px 26px ${hexToRgba(zenPalette.bg, 0.24)}`,
              backdropFilter: 'blur(8px)',
              fontSize: 8, fontFamily: 'monospace', lineHeight: 1.5,
              pointerEvents: 'auto',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                <span style={{ color: zenPalette.danger, fontWeight: 700 }}>
                  ⚠ {new Date(perfLastAlert.timestamp).toLocaleTimeString()} · {perfLastAlert.label}
                </span>
                <span style={{ color: engineRecommendation.color, fontWeight: 700, fontSize: 7, letterSpacing: '0.04em' }}>
                  {engineRecommendation.label}
                </span>
              </div>
              <div style={{ color: zenPalette.textMuted }}>
                FPS {perfLastAlert.fps} · Jank {perfLastAlert.jankPct}% · {perfLastAlert.fpsTargetPct}% von {perfLastAlert.targetHz}Hz
              </div>
              {perfAlertHistory.length > 1 && (
                <div style={{ marginTop: 3, opacity: 0.7 }}>
                  {perfAlertHistory.slice(1, 3).map(a => (
                    <div key={a.id} style={{ color: zenPalette.textMuted }}>
                      {new Date(a.timestamp).toLocaleTimeString()} · {a.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
    </Profiler>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Controls Panel
  // ─────────────────────────────────────────────────────────────────────────
  const ControlsPanel = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      paddingBottom: 16,
    }}>

      {/* VISUAL */}
      <AccordionSection title="Visual" isOpen={openPanels.visual} onToggle={() => togglePanel('visual')} palette={zenPalette}>
        {/* ── GEOMETRY ─────────────────────────────────────── */}
        <div style={exportSectionLabel}>Geometry</div>
        <SliderRow label="Radius" value={radius} min={50} max={250} onChange={e => setRadius(+e.target.value)} unit="px" palette={zenPalette} />
        <SliderRow label="Button Size" value={buttonSize} min={previewDeviceButtonSizeLimits.min} max={previewDeviceButtonSizeLimits.max} onChange={e => {
          const size = clampButtonSizeForDevice(+e.target.value, previewDevice);
          setButtonSize(size);
          if (autoFontSize) {
            setMenuItemFontSize(Math.max(8, Math.min(14, Math.round(size * 10 / 64))));
          }
        }} unit="px" palette={zenPalette} />

        {/* ── POSITION ─────────────────────────────────────── */}
        <div style={{ ...exportSectionLabel }}>Position</div>
        {visualPositionDisabledReason && (
          <div style={{
            marginBottom: 8,
            padding: '6px 8px',
            borderRadius: 4,
            border: `1px solid ${zenPalette.gold}44`,
            backgroundColor: `${zenPalette.gold}12`,
            color: zenPalette.gold,
            fontSize: 9,
            fontFamily: '"IBM Plex Mono", monospace',
            lineHeight: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}>
            <span>{visualPositionDisabledReason}</span>
            {scrollEnabled && (
              <button
                onClick={openScrollingPanel}
                style={{
                  flexShrink: 0,
                  padding: '4px 8px',
                  borderRadius: 4,
                  border: `1px solid ${zenPalette.gold}`,
                  backgroundColor: `${zenPalette.gold}22`,
                  color: zenPalette.gold,
                  fontSize: 8,
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                Zu Scrolling
              </button>
            )}
          </div>
        )}
        <SliderRow label="Offset X" value={menuOffsetX} min={-400} max={400} onChange={e => setMenuOffsetXForDevice(clampOffsetX(+e.target.value))} unit="px" palette={zenPalette} disabled={visualPositionControlsDisabled} />
        <SliderRow label="Offset Y" value={menuOffset} min={-400} max={400} onChange={e => setMenuOffsetForDevice(clampOffsetY(+e.target.value))} unit="px" palette={zenPalette} disabled={visualPositionControlsDisabled} />
        <div style={{
          marginBottom: 8, padding: '6px 8px',
          border: `1px solid ${isOffsetOutsideBounds ? `${zenPalette.danger}66` : zenPalette.border}`,
          borderRadius: 4, backgroundColor: zenPalette.panelSoft,
          opacity: visualPositionControlsDisabled ? 0.55 : 1,
        }}>
          <div style={{ fontSize: 9, fontFamily: 'monospace', color: zenPalette.textMuted, marginBottom: 2 }}>
            X: {offsetBounds.minX}..{offsetBounds.maxX}px &nbsp;|&nbsp; Y: {offsetBounds.minY}..{offsetBounds.maxY}px
          </div>
          {isOffsetOutsideBounds && (
            <div style={{ fontSize: 9, fontFamily: 'monospace', color: zenPalette.danger, marginBottom: 4 }}>
              Menu außerhalb des Device-Frames.
            </div>
          )}
          {!isOffsetOutsideBounds && openLayoutOutsideBounds && (
            <div style={{ fontSize: 9, fontFamily: 'monospace', color: zenPalette.danger, marginBottom: 4 }}>
            Offen liegt das Menü teilweise außerhalb des Device-Frames.
            </div>
          )}
          <button
            onClick={snapOffsetsIntoBounds}
            disabled={visualPositionControlsDisabled}
            style={{
              width: '100%', marginTop: 4, padding: '4px 8px', fontSize: 9, fontFamily: 'monospace', fontWeight: 600,
              backgroundColor: isOffsetOutsideBounds ? panelControl.activeBg : panelControl.bg,
              color: isOffsetOutsideBounds ? panelControl.activeText : panelControl.text,
              border: `1px solid ${isOffsetOutsideBounds ? zenPalette.gold : panelControl.border}`,
              borderRadius: 4, cursor: visualPositionControlsDisabled ? 'not-allowed' : 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em',
            }}
          >Snap to Fit</button>
        </div>

        {/* ── BUTTON ───────────────────────────────────────── */}
        <div style={exportSectionLabel}>Button</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, marginBottom: 6 }}>
          {[
            { key: 'circle',  label: 'Kreis',   br: '50%', cp: undefined },
            { key: 'square',  label: 'Quadrat', br: `${squareRadius}px`, cp: undefined },
            { key: 'polygon', label: `${polygonSides}-Eck`, br: 0, cp: ngonPath(polygonSides, 0) },
          ].map(({ key, label, br, cp }) => (
            <button
              key={key}
              title={label}
              onClick={() => setButtonShape(key)}
              style={{
                width: '100%', aspectRatio: '1 / 1', padding: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                backgroundColor: buttonShape === key ? panelControl.activeBg : panelControl.bg,
                border: `1px solid ${buttonShape === key ? zenPalette.gold : panelControl.border}`,
                borderRadius: 4, cursor: 'pointer',
              }}
            >
              <div style={{
                width: '52%', height: '52%',
                backgroundColor: buttonShape === key ? zenPalette.gold : (isDark ? '#9f988c' : '#7b7265'),
                borderRadius: br, clipPath: cp,
              }} />
              <span style={{ fontSize: 8, fontFamily: 'monospace', color: buttonShape === key ? panelControl.activeText : panelControl.text, lineHeight: 1 }}>{label}</span>
            </button>
          ))}
        </div>
        {buttonShape === 'square' && (
          <SliderRow label="Corner Radius" value={squareRadius} min={0} max={50} onChange={e => setSquareRadius(+e.target.value)} unit="px" palette={zenPalette} />
        )}
        {buttonShape === 'polygon' && (
          <>
            <SliderRow label="Seiten" value={polygonSides} min={3} max={12} onChange={e => setPolygonSides(+e.target.value)} palette={zenPalette} />
            <SliderRow label="Ecken Rundung" value={polygonCorner} min={0} max={30} onChange={e => setPolygonCorner(+e.target.value)} unit="%" palette={zenPalette} />
          </>
        )}

        <InlineSectionCard
          title="Item Text"
          hint="Schrift und Vorschau fuer die Labels der Orbit-Items."
          palette={zenPalette}
        >
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            marginBottom: 10,
          }}>
            {menuItems.slice(0, 3).map((item) => (
              <div
                key={`item-text-preview-${item.id}`}
                style={{
                  padding: '5px 8px',
                  borderRadius: 999,
                  backgroundColor: menuItemBgColor,
                  color: menuItemTextColor,
                  border: `${Math.max(1, menuItemOutlineWidth)}px solid ${menuItemOutlineColor}`,
                  fontSize: Math.max(8, menuItemFontSize),
                  fontFamily: itemFontFamily,
                  lineHeight: 1,
                }}
              >
                {item.label}
              </div>
            ))}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <label style={{ fontSize: 10, color: zenPalette.textMuted, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.04em' }}>Label Size</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  onClick={() => {
                    const next = !autoFontSize;
                    setAutoFontSize(next);
                    if (next) {
                      setMenuItemFontSize(Math.max(8, Math.min(14, Math.round(buttonSize * 10 / 64))));
                    }
                  }}
                  style={{
                    fontSize: 8, fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700,
                    padding: '2px 6px', borderRadius: 3, cursor: 'pointer',
                    border: `1px solid ${autoFontSize ? zenPalette.gold : zenPalette.border}`,
                    backgroundColor: autoFontSize ? `${zenPalette.gold}22` : 'transparent',
                    color: autoFontSize ? zenPalette.gold : zenPalette.textMuted,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                  }}
                >
                  {autoFontSize ? 'auto' : 'manual'}
                </button>
                <span style={{ fontSize: 11, color: autoFontSize ? zenPalette.textMuted : zenPalette.gold, fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700 }}>
                  {menuItemFontSize}px
                </span>
              </div>
            </div>
            <input
              className="zen-slider"
              type="range"
              min={8}
              max={14}
              step={1}
              value={menuItemFontSize}
              disabled={autoFontSize}
              onChange={e => setMenuItemFontSize(+e.target.value)}
              style={{
                width: '100%', accentColor: zenPalette.gold,
                cursor: autoFontSize ? 'not-allowed' : 'pointer',
                display: 'block', opacity: autoFontSize ? 0.4 : 1,
              }}
            />
          </div>
          <div style={{ marginBottom: 0 }}>
            <FontSourceField
              palette={{
                text: zenPalette.text,
                textDim: zenPalette.textMuted,
                border: zenPalette.border,
                bgInput: zenPalette.panelSoft,
                bgCard: zenPalette.panel,
              }}
              presetOptions={TYPE_FAMILY_OPTIONS}
              familyValue={itemFontFamily}
              fontUrlValue={itemFontUrl}
              onFamilyChange={setItemFontFamily}
              onFontUrlChange={setItemFontUrl}
            />
          </div>
        </InlineSectionCard>
        {/* ── BACKDROP ─────────────────────────────────────── */}
        <div style={{ ...exportSectionLabel }}>Backdrop</div>
        <SliderRow label="Blur" value={backdropBlur} min={0} max={20} onChange={e => setBackdropBlur(+e.target.value)} unit="px" palette={zenPalette} />
        <input
          type="text"
          value={backdropImageDraft}
          onChange={(e) => handleBackdropUrlChange(e.target.value)}
          placeholder="https://example.com/screenshot.png"
          style={{
            width: '100%', padding: '5px 8px', fontFamily: 'monospace', fontSize: 10,
            backgroundColor: zenPalette.panelSoft, color: zenPalette.text,
            border: `1px solid ${zenPalette.border}`, borderRadius: 4, boxSizing: 'border-box',
            marginBottom: 6,
          }}
        />
        <input ref={backdropFileInputRef} type="file" accept="image/*" onChange={handleBackdropImageUpload} style={{ display: 'none' }} />
        <div
          onClick={() => backdropFileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsBackdropDragOver(true); }}
          onDragEnter={(e) => { e.preventDefault(); setIsBackdropDragOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsBackdropDragOver(false); }}
          onDrop={handleBackdropDrop}
          style={{
            border: `1px dashed ${isBackdropDragOver ? zenPalette.gold : zenPalette.border}`,
            backgroundColor: isBackdropDragOver ? `${zenPalette.gold}1f` : zenPalette.panelSoft,
            borderRadius: 4, padding: '8px', textAlign: 'center', cursor: 'pointer', marginBottom: 6,
          }}
        >
          <div style={{ fontSize: 10, color: isBackdropDragOver ? '#d0cbb8' : zenPalette.textMuted, fontFamily: 'monospace' }}>
            Screenshot / Image drop
          </div>
          <div style={{ fontSize: 9, color: zenPalette.textMuted, fontFamily: 'monospace', marginTop: 3 }}>
            oder klicken zum Auswaehlen
          </div>
        </div>
        <button
          onClick={() => { setBackdropImage(''); setBackdropImageDraft(''); }}
          style={{
            width: '100%', padding: '4px 8px', marginBottom: 8,
            backgroundColor: 'transparent', color: zenPalette.textMuted,
            border: `1px solid ${zenPalette.border}`, borderRadius: 4,
            cursor: 'pointer', fontSize: 9, fontFamily: 'monospace',
          }}
        >Remove Backdrop Image</button>

        {/* ── LOGO ─────────────────────────────────────────── */}
        <div style={exportSectionLabel}>Logo Menu Center</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          {['text', 'icon', 'image'].map(t => (
            <button
              key={t}
              onClick={() => setLogoType(t)}
              style={{
                flex: 1, padding: '4px 0', fontSize: 9, fontFamily: 'monospace', fontWeight: 600,
                backgroundColor: logoType === t ? 'rgba(184,151,106,0.18)' : 'transparent',
                color: logoType === t ? zenPalette.textMenu1 : zenPalette.textMuted,
                border: `1px solid ${logoType === t ? zenPalette.gold : zenPalette.border}`,
                borderRadius: 4, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em',
              }}
            >{t}</button>
          ))}
        </div>
        {logoType === 'text' && (
          <InlineSectionCard
            title="Logo Typography"
            hint="Diese Typo betrifft nur das Zentrum, nicht die Orbit-Items."
            palette={zenPalette}
          >
          <div style={{ marginBottom: 0 }}>
            <input
              maxLength={3}
              value={logoText}
              onChange={e => setLogoText(e.target.value)}
              placeholder="max 3 chars"
              style={{
                width: '100%', padding: '5px 8px', fontFamily: 'monospace', fontSize: 12,
                backgroundColor: zenPalette.panelSoft, color: zenPalette.text,
                border: `1px solid ${zenPalette.border}`, borderRadius: 4, boxSizing: 'border-box',
                marginBottom: 6,
              }}
            />
            <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
              <select
                value={logoFontFamily}
                onChange={(e) => setLogoFontFamily(e.target.value)}
                style={{
                  flex: 1, padding: '4px 6px', fontSize: 9, fontFamily: 'monospace',
                  backgroundColor: zenPalette.bg, color: zenPalette.textMuted,
                  border: `1px solid ${zenPalette.border}`, borderRadius: 3,
                }}
              >
                {LOGO_FONT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <input
                type="number"
                min={100}
                max={900}
                step={100}
                value={logoFontWeight}
                onChange={(e) => setLogoFontWeight(Math.max(100, Math.min(900, +e.target.value || 700)))}
                style={{
                  width: 68, padding: '4px 6px', fontSize: 9, fontFamily: 'monospace',
                  backgroundColor: zenPalette.bg, color: zenPalette.gold,
                  border: `1px solid ${zenPalette.border}`, borderRadius: 3, textAlign: 'center',
                }}
              />
            </div>
          </div>
          </InlineSectionCard>
        )}
        {logoType === 'icon' && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 8, color: zenPalette.textMuted, fontFamily: 'monospace', marginBottom: 5, opacity: 0.75 }}>
              Top Picks
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5, marginBottom: 6 }}>
              {LOGO_ICON_PRESETS.map((preset) => {
                const presetIsActive = resolvedLogoIconName === preset.icon;
                return (
                  <button
                    key={preset.icon}
                    onClick={() => {
                      setLogoIconKey(preset.icon);
                      setLogoIconInput(preset.icon);
                    }}
                    style={{
                      padding: '5px 0',
                      borderRadius: 4,
                      cursor: 'pointer',
                      border: `1px solid ${presetIsActive ? zenPalette.gold : panelControl.border}`,
                      backgroundColor: presetIsActive ? panelControl.activeBg : panelControl.bg,
                      color: presetIsActive ? panelControl.activeText : panelControl.text,
                      fontSize: 8,
                      fontWeight: presetIsActive ? 700 : 600,
                      letterSpacing: '0.04em',
                      fontFamily: 'monospace',
                    }}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              value={logoIconInput}
              onChange={(e) => setLogoIconInput(e.target.value)}
              onBlur={() => {
                if (FaIcons[normalizedLogoIconInput]) {
                  setLogoIconKey(normalizedLogoIconInput);
                  setLogoIconInput(normalizedLogoIconInput);
                }
              }}
              placeholder="FaDesktop"
              style={{
                width: '100%', padding: '5px 8px', fontFamily: 'monospace', fontSize: 10,
                backgroundColor: zenPalette.panelSoft, color: zenPalette.text,
                border: `1px solid ${FaIcons[normalizedLogoIconInput] ? zenPalette.gold : zenPalette.border}`,
                borderRadius: 4, boxSizing: 'border-box', marginBottom: 6,
              }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5 }}>
              {LOGO_ICONS.map((iconItem) => {
                const IconCmp = FaIcons[iconItem.key];
                return (
                  <button
                    key={iconItem.key}
                    title={iconItem.label}
                    onClick={() => {
                      setLogoIconKey(iconItem.key);
                      setLogoIconInput(iconItem.key);
                    }}
                    style={{
                      padding: '6px 0',
                      borderRadius: 4,
                      cursor: 'pointer',
                      border: `1px solid ${resolvedLogoIconName === iconItem.key ? zenPalette.gold : panelControl.border}`,
                      backgroundColor: resolvedLogoIconName === iconItem.key ? panelControl.activeBg : panelControl.bg,
                      color: resolvedLogoIconName === iconItem.key ? panelControl.activeText : panelControl.text,
                      boxShadow: resolvedLogoIconName === iconItem.key ? `0 0 0 1px ${zenPalette.gold}33 inset` : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {IconCmp ? <IconCmp size={14} /> : null}
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: 8, color: zenPalette.textMuted, fontFamily: 'monospace', marginTop: 5, opacity: 0.7 }}>
              Icon Name eingeben, z.B. `FaDesktop`, `FaHouse`, `FaRobot`.
            </div>
          </div>
        )}
        {logoType === 'image' && (
          <div style={{ marginBottom: 8 }}>
            <input
              type="text"
              value={logoUrlDraft}
              onChange={e => handleLogoUrlChange(e.target.value)}
              placeholder="https://example.com/logo.png"
              style={{
                width: '100%', padding: '5px 8px', fontFamily: 'monospace', fontSize: 10,
                backgroundColor: zenPalette.panelSoft, color: zenPalette.text,
                border: `1px solid ${zenPalette.border}`, borderRadius: 4, boxSizing: 'border-box',
                marginBottom: 6,
              }}
            />
            <input
              ref={logoFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoImageUpload}
              style={{ display: 'none' }}
            />
            <div
              onClick={() => logoFileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsLogoDragOver(true); }}
              onDragEnter={(e) => { e.preventDefault(); setIsLogoDragOver(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsLogoDragOver(false); }}
              onDrop={handleLogoDrop}
              style={{
                border: `1px dashed ${isLogoDragOver ? zenPalette.gold : zenPalette.border}`,
                backgroundColor: isLogoDragOver ? `${zenPalette.gold}1f` : zenPalette.panelSoft,
                borderRadius: 4,
                padding: '10px 8px',
                textAlign: 'center',
                cursor: 'pointer',
                marginBottom: 6,
              }}
            >
              <div style={{ fontSize: 10, color: isLogoDragOver ? '#d0cbb8' : zenPalette.textMuted, fontFamily: 'monospace' }}>
                Drag & Drop image hier
              </div>
              <div style={{ fontSize: 9, color: zenPalette.textMuted, fontFamily: 'monospace', marginTop: 3 }}>
                oder klicken zum Auswaehlen
              </div>
            </div>
            {logoImage && (
              <img
                src={logoImage}
                alt="preview"
                style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: '50%', marginTop: 6, border: `1px solid ${zenPalette.border}` }}
              />
            )}
          </div>
        )}
        <SliderRow label="Logo Size" value={logoSize} min={30} max={100} onChange={e => setLogoSize(+e.target.value)} unit="%" palette={zenPalette} />
        {logoType === 'image' && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
            {['contain', 'cover'].map(f => (
              <button
                key={f}
                onClick={() => setLogoFit(f)}
                style={{
                  flex: 1, padding: '4px 0', fontSize: 9, fontFamily: 'monospace', fontWeight: 600,
                  backgroundColor: logoFit === f ? 'rgba(184,151,106,0.18)' : 'transparent',
                  color: logoFit === f ? zenPalette.textMenu1 : zenPalette.textMuted,
                  border: `1px solid ${logoFit === f ? zenPalette.gold : zenPalette.border}`,
                  borderRadius: 4, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em',
                }}
              >{f}</button>
            ))}
          </div>
        )}
      </AccordionSection>

      {/* COLORS */}
      <AccordionSection title="Colors" isOpen={openPanels.colors} onToggle={() => togglePanel('colors')} palette={zenPalette}>
        <SectionLabel palette={zenPalette}>Menu Center Button</SectionLabel>
        <InlineColorPicker label="Background" color={buttonBgColor} onChange={setButtonBgColor} palette={zenPalette} />
        <InlineColorPicker label="Outline" color={buttonOutlineColor} onChange={setButtonOutlineColor} palette={zenPalette} />
        <SliderRow label="Outline Width" value={buttonOutlineWidth} min={0} max={5} onChange={e => setButtonOutlineWidth(+e.target.value)} unit="px" palette={zenPalette} />

        <SectionLabel palette={zenPalette}>Menu Item Buttons</SectionLabel>
        <InlineColorPicker label="Background" color={menuItemBgColor} onChange={setMenuItemBgColor} palette={zenPalette} />
        <InlineColorPicker label="Text" color={menuItemTextColor} onChange={setMenuItemTextColor} palette={zenPalette} />
        <InlineColorPicker label="Outline" color={menuItemOutlineColor} onChange={setMenuItemOutlineColor} palette={zenPalette} />
        <SliderRow label="Outline Width" value={menuItemOutlineWidth} min={0} max={5} onChange={e => setMenuItemOutlineWidth(+e.target.value)} unit="px" palette={zenPalette} />

        <SectionLabel palette={zenPalette}>Backdrop</SectionLabel>
        <InlineColorPicker label="Tint Color" color={backdropTintColor} onChange={setBackdropTintColor} palette={zenPalette} />
        <SliderRow
          label="Tint Opacity"
          value={backdropTintOpacity}
          min={0}
          max={85}
          onChange={e => setBackdropTintOpacity(+e.target.value)}
          unit="%"
          palette={zenPalette}
        />
      </AccordionSection>

      {/* ANIMATION */}
      <AccordionSection title="Animation" isOpen={openPanels.animation} onToggle={() => togglePanel('animation')} palette={zenPalette}>
        <SectionLabel palette={zenPalette}>Center Rotation</SectionLabel>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <button
            onClick={() => {
              setCenterButtonRotates(true);
              scheduleAnimationPreview();
            }}
            style={{
              flex: 1, padding: '4px 0', fontSize: 9, fontFamily: 'monospace', fontWeight: 600,
              backgroundColor: centerButtonRotates ? panelControl.activeBg : panelControl.bg,
              color: centerButtonRotates ? panelControl.activeText : panelControl.text,
              border: `1px solid ${centerButtonRotates ? zenPalette.gold : panelControl.border}`,
              borderRadius: 4, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em',
            }}
          >
            On
          </button>
          <button
            onClick={() => {
              setCenterButtonRotates(false);
              scheduleAnimationPreview();
            }}
            style={{
              flex: 1, padding: '4px 0', fontSize: 9, fontFamily: 'monospace', fontWeight: 600,
              backgroundColor: !centerButtonRotates ? panelControl.activeBg : panelControl.bg,
              color: !centerButtonRotates ? panelControl.activeText : panelControl.text,
              border: `1px solid ${!centerButtonRotates ? zenPalette.gold : panelControl.border}`,
              borderRadius: 4, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em',
            }}
          >
            Off
          </button>
        </div>
        <SliderRow
          label="Logo Stiffness"
          value={logoStiffness}
          min={100}
          max={500}
          onChange={e => {
            setLogoStiffness(+e.target.value);
            scheduleAnimationPreview();
          }}
          palette={zenPalette}
        />
        <SliderRow
          label="Logo Damping"
          value={logoDamping}
          min={10}
          max={80}
          onChange={e => {
            setLogoDamping(+e.target.value);
            scheduleAnimationPreview();
          }}
          palette={zenPalette}
        />
        <SectionLabel palette={zenPalette}>Item Motion</SectionLabel>
        <ItemMotionControls
          palette={zenPalette}
          duration={itemMotionDuration}
          stagger={itemMotionStagger}
          curvePreset={itemMotionCurvePreset}
          curveBezier={resolvedItemMotionBezier}
          onDurationChange={setItemMotionDuration}
          onStaggerChange={setItemMotionStagger}
          onCurvePresetChange={setItemMotionCurvePreset}
          onCurveBezierChange={setItemMotionBezier}
          onPreview={scheduleAnimationPreview}
        />
        <div style={{ fontSize: 9, color: zenPalette.textMuted, fontFamily: 'monospace', marginTop: 4, lineHeight: 1.5 }}>
          Tipp: `Open` und `Close` unten zeigen die aktuellen Werte sofort.
        </div>
        <div style={{ fontSize: 9, color: zenPalette.textMuted, fontFamily: 'monospace', padding: '4px 0', opacity: 0.7 }}>
          Performance Monitor → ⚡ in der Live Preview.
        </div>
      </AccordionSection>

      <AccordionSection title="Adaptive Intent" isOpen={openPanels.intent} onToggle={() => togglePanel('intent')} palette={zenPalette}>
        <IntentScenarioPanel
          palette={intentPanelPalette}
          enabled={intentPreviewEnabled}
          scenarioKey={intentScenarioKey}
          scenarios={INTENT_PREVIEW_SCENARIOS}
          context={activeIntentScenario?.context}
          decision={intentDecision}
          onEnabledChange={(next) => {
            setIntentPreviewEnabled(next);
            scheduleAnimationPreview();
          }}
          onScenarioChange={(next) => {
            setIntentScenarioKey(next);
            setIntentPreviewEnabled(true);
            scheduleAnimationPreview();
          }}
          onApplyDecision={applyIntentDecisionToMenu}
        />
      </AccordionSection>


        {/* SCROLLING */}
      <div id="customizer-scrolling-panel">
      <AccordionSection title="Scrolling" isOpen={openPanels.scrolling} onToggle={() => togglePanel('scrolling')} palette={zenPalette}>

        {/* Master ON/OFF */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 10, color: zenPalette.textMuted, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.04em' }}>
            Scroll-Verhalten
          </span>
          <button
            onClick={() => {
              const next = !scrollEnabled;
              setScrollEnabled(next);
              setScrollSimActive(next);
            }}
            style={{
              padding: '3px 12px', borderRadius: 20, cursor: 'pointer',
              border: `1px solid ${scrollEnabled ? zenPalette.gold : panelControl.border}`,
              backgroundColor: scrollEnabled ? `${zenPalette.gold}22` : panelControl.bg,
              color: scrollEnabled ? zenPalette.gold : panelControl.text,
              fontSize: 9, fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'all 0.18s',
            }}
          >{scrollEnabled ? 'ON' : 'OFF'}</button>
        </div>

        {!scrollEnabled && (
          <div style={{ fontSize: 9, color: zenPalette.textMuted, fontFamily: 'monospace', lineHeight: 1.6, padding: '6px 8px', borderRadius: 4, background: zenPalette.panelSoft, border: `1px solid ${zenPalette.border}` }}>
            OFF — Scroll-Verhalten wird nicht exportiert (React / CSS / JSON).
          </div>
        )}

        {scrollEnabled && (<>
          <div style={{
            marginBottom: 12,
            borderRadius: 6,
            overflow: 'hidden',
            border: `1px solid ${openLayoutOutsideBounds ? zenPalette.danger + '55' : zenPalette.success + '55'}`,
            background: openLayoutOutsideBounds ? `${zenPalette.danger}12` : `${zenPalette.success}12`,
          }}>
            <div style={{
              height: 6,
              background: openLayoutOutsideBounds ? zenPalette.danger : zenPalette.success,
            }} />
            <div style={{
              padding: '7px 9px',
              fontSize: 10,
              fontFamily: '"IBM Plex Mono", monospace',
              color: openLayoutOutsideBounds ? zenPalette.danger : zenPalette.success,
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              {openLayoutOutsideBounds ? 'Open state outside frame' : 'Open state fits frame'}
            </div>
          </div>
          <div style={{ fontSize: 9, color: zenPalette.textMuted, fontFamily: 'monospace', marginBottom: 10, lineHeight: 1.5 }}>
            Wird in React, CSS &amp; JSON exportiert. SCROLL in der Preview aktivieren zum Testen.
          </div>

          <div style={exportSectionLabel}>Position &amp; Seite</div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: 10, color: zenPalette.textMuted, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>Seite</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {[{ v: 'left', l: 'Links' }, { v: 'right', l: 'Rechts' }].map(({ v, l }) => (
                <button key={v} onClick={() => setScrollCorner(v)} style={{
                  padding: '5px 0', borderRadius: 4, fontFamily: 'monospace', fontSize: 9, cursor: 'pointer',
                  border: `1px solid ${scrollCorner === v ? zenPalette.gold : panelControl.border}`,
                  backgroundColor: scrollCorner === v ? panelControl.activeBg : panelControl.bg,
                  color: scrollCorner === v ? panelControl.activeText : panelControl.text,
                }}>{l}</button>
              ))}
            </div>
          </div>

          <div style={exportSectionLabel}>Browser &amp; Layout-Zonen</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            <button
              onClick={() => setScrollHeaderEnabled((prev) => !prev)}
              style={{
                padding: '7px 10px',
                borderRadius: 6,
                cursor: 'pointer',
                border: `1px solid ${scrollHeaderEnabled ? zenPalette.gold : panelControl.border}`,
                backgroundColor: scrollHeaderEnabled ? panelControl.activeBg : panelControl.bg,
                color: scrollHeaderEnabled ? panelControl.activeText : panelControl.text,
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >Header-Zone {scrollHeaderEnabled ? 'Aktiv' : 'Aus'}</button>
            <button
              onClick={() => setScrollFooterEnabled((prev) => !prev)}
              style={{
                padding: '7px 10px',
                borderRadius: 6,
                cursor: 'pointer',
                border: `1px solid ${scrollFooterEnabled ? zenPalette.gold : panelControl.border}`,
                backgroundColor: scrollFooterEnabled ? panelControl.activeBg : panelControl.bg,
                color: scrollFooterEnabled ? panelControl.activeText : panelControl.text,
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >Footer-Stop {scrollFooterEnabled ? 'Aktiv' : 'Aus'}</button>
          </div>

          <SliderRow label="Header-Zone Höhe" value={scrollHeaderHeight} min={0} max={260} onChange={e => setScrollHeaderHeightForDevice(+e.target.value)} unit="px" palette={zenPalette} disabled={!scrollHeaderEnabled} />
          <SliderRow label="Top-Stop über Header" value={scrollTopStopOverHeader} min={0} max={160} onChange={e => setScrollTopStopOverHeaderForDevice(+e.target.value)} unit="px" palette={zenPalette} disabled={!scrollHeaderEnabled} />
          <SliderRow label="Footer-Stop Höhe" value={scrollFooterHeight} min={0} max={260} onChange={e => setScrollFooterHeightForDevice(+e.target.value)} unit="px" palette={zenPalette} disabled={!scrollFooterEnabled} />
          <SliderRow label="Start unter Header" value={scrollStartTop} min={20} max={400} onChange={e => setScrollStartTopForDevice(+e.target.value)} unit="px" palette={zenPalette} alert={openLayoutTopWarning} />
          <SliderRow label="Abstand Rand" value={scrollEdgeGap} min={4} max={200} onChange={e => setScrollEdgeGapForDevice(+e.target.value)} unit="px" palette={zenPalette} alert={openLayoutSideWarning} />
          <SliderRow label="Scroll Geschwindigkeit" value={scrollSpeedFactor} min={0.1} max={2.0} step={0.05} onChange={e => setScrollSpeedFactor(+e.target.value)} palette={zenPalette} />

          <div style={exportSectionLabel}>Buffer &amp; Open-Verhalten</div>

          <SliderRow label="Buffer unten (geschlossen)" value={scrollBottomBuffer} min={40} max={400} onChange={e => setScrollBottomBufferForDevice(+e.target.value)} unit="px" palette={zenPalette} alert={openLayoutBottomWarning} />
          <SliderRow label="Buffer unten (offen)" value={scrollBottomBufferOpen} min={40} max={500} onChange={e => setScrollBottomBufferOpenForDevice(+e.target.value)} unit="px" palette={zenPalette} alert={openLayoutBottomWarning} />
          <SliderRow label="Shift oben bei Öffnen (+↓)" value={scrollOpenShiftTop} min={0} max={200} onChange={e => setScrollOpenShiftTopForDevice(+e.target.value)} unit="px" palette={zenPalette} alert={openLayoutTopWarning} />
          <SliderRow label="Shift unten bei Öffnen (−↑)" value={scrollOpenShiftBottom} min={-200} max={0} onChange={e => setScrollOpenShiftBottomForDevice(+e.target.value)} unit="px" palette={zenPalette} alert={openLayoutBottomWarning} />

          <div style={{ marginTop: 8, padding: '6px 8px', borderRadius: 4, background: zenPalette.panelSoft, border: `1px solid ${zenPalette.gold}44`, fontSize: 9, fontFamily: 'monospace', color: zenPalette.textMuted, lineHeight: 1.6 }}>

               {openLayoutOutsideBounds && (
              <div style={{ marginTop: 6, color: zenPalette.danger, fontWeight: 700 }}>
                Warnung: <br/> Offen liegt das Menü teilweise außerhalb des sichtbaren Bereichs.
              </div>
            )}
              
            <div style={{ color: zenPalette.gold, fontWeight: 700, marginBottom: 2 }}>Export-Preview</div>
            <div>position: fixed · {scrollCorner}: {scrollEdgeGap}px · start: {scrollStartTop}px unter Header-Zone</div>
            <div>Header-Zone {scrollHeaderEnabled ? `aktiv ${scrollHeaderHeight}px` : 'aus 0px'} · Top-Stop {scrollHeaderEnabled ? `${scrollTopStopOverHeader}px` : '0px'} · Footer-Stop {scrollFooterEnabled ? `aktiv ${scrollFooterHeight}px` : 'aus 0px'}</div>
            <div>buffer ↓ {scrollBottomBuffer}px · open ↓ {scrollBottomBufferOpen}px</div>
            <div>shift oben: +{scrollOpenShiftTop}px · shift unten: {scrollOpenShiftBottom}px · speed: ×{scrollSpeedFactor.toFixed(2)}</div>
           
          </div>
        </>)}
      </AccordionSection>
      </div>

      {/* ITEMS */}
      <AccordionSection title="Items & Angles" badge={menuItems.length} isOpen={openPanels.items} onToggle={() => togglePanel('items')} palette={zenPalette}>
        {/* Visual Angle Adjuster */}
        <div style={{
          backgroundColor: zenPalette.panelSoft,
          borderRadius: 6,
          padding: '10px 8px 8px',
          marginBottom: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <div style={{ 
            fontSize: 9, 
            color: zenPalette.textMuted, 
            fontFamily: 'monospace', 
            letterSpacing: '0.1em', 
            textTransform: 'uppercase', 
            marginBottom: 1, 
            opacity: 0.8 }}>
            Visual Angle Adjuster 
          </div>
          <svg width="100%" height="auto" viewBox="0 0 200 200" style={{ display: 'block', maxWidth: 200 }}>
            <circle cx="100" cy="100" r="80" fill="none" stroke={zenPalette.border} strokeWidth="1.5" />
            <circle cx="100" cy="100" r="6" fill={zenPalette.textMuted} />
            {menuItems.map((item) => {
              const visualAngle = normalizeAngle((item.angle || 0) + startAngle);
              const rad = visualAngle * (Math.PI / 180);
              const x = 100 + Math.cos(rad) * 80;
              const y = 100 + Math.sin(rad) * 80;
              return (
                <g key={item.id}>
                  <line x1="100" y1="100" x2={x} y2={y} stroke={zenPalette.border} strokeWidth="1" strokeDasharray="3,3" />
                  <circle
                    cx={x} cy={y} r="11"
                    fill={zenPalette.textMuted}
                    stroke={zenPalette.bg}
                    strokeWidth="2"
                    style={{ cursor: 'grab' }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      const handleMouseMove = (me) => {
                        const svg = e.target.closest('svg');
                        const rect = svg.getBoundingClientRect();
                        const sx = 200 / rect.width;
                        const sy = 200 / rect.height;
                        const mx = (me.clientX - rect.left) * sx - 100;
                        const my = (me.clientY - rect.top) * sy - 100;
                        const absoluteAngle = normalizeAngle(Math.atan2(my, mx) * (180 / Math.PI));
                        const relativeAngle = normalizeAngle(Math.round(absoluteAngle - startAngle));
                        updateMenuItem(item.id, 'angle', relativeAngle);
                      };
                      const handleMouseUp = () => {
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                      };
                      document.addEventListener('mousemove', handleMouseMove);
                      document.addEventListener('mouseup', handleMouseUp);
                    }}
                  />
                  <text x={x} y={y - 16} textAnchor="middle" fontSize="8" fill={zenPalette.text} fontFamily="monospace" fontWeight="600">
                    {item.label}
                  </text>
                  <text x={x} y={y + 24} textAnchor="middle" fontSize="7" fill={zenPalette.gold} fontFamily="monospace">
                    {visualAngle}°
                  </text>
                </g>
              );
            })}
          </svg>
          <div style={{ fontSize: 8, color: zenPalette.textMuted, fontFamily: 'monospace', marginTop: 5, opacity: 0.6 }}>
            Punkte ziehen · Winkel anpassen
          </div>
        </div>

        <SliderRow
          label="Start Angle"
          value={startAngle}
          min={-180}
          max={180}
          onChange={e => setStartAngleNormalized(+e.target.value)}
          unit="°"
          palette={zenPalette}
        />
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          <input
            type="number"
            value={startAngle}
            min={-180}
            max={180}
            step={1}
            onChange={(e) => setStartAngleNormalized(+e.target.value)}
            style={{
              width: 72, padding: '3px 6px', fontSize: 10, fontFamily: 'monospace',
              backgroundColor: panelControl.bg, color: panelControl.text,
              border: `1px solid ${panelControl.border}`, borderRadius: 3, textAlign: 'center',
            }}
          />
          {[-90, 0, 45, 90, 180].map((preset) => (
            <button
              key={preset}
              onClick={() => setStartAngleNormalized(preset)}
              style={{
                padding: '3px 7px', fontSize: 9, fontFamily: 'monospace',
                borderRadius: 3, cursor: 'pointer',
                border: `1px solid ${startAngle === preset ? zenPalette.gold : panelControl.border}`,
                color: startAngle === preset ? panelControl.activeText : panelControl.text,
                backgroundColor: startAngle === preset ? panelControl.activeBg : panelControl.bg,
              }}
            >
              {preset}°
            </button>
          ))}
        </div>
        <div
          style={{
            marginBottom: 8,
            paddingTop: 8,
            borderTop: `1px solid ${zenPalette.border}`,
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
            <button
              onClick={rebalanceMenuItemAngles}
              style={{
                width: '100%',
                padding: '5px',
                fontSize: 9,
                fontFamily: 'monospace',
                fontWeight: 600,
                backgroundColor: panelControl.bg,
                color: panelControl.text,
                border: `1px solid ${panelControl.border}`,
                borderRadius: 4,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Rebalance Angles
            </button>
            <button
              onClick={distributeLeftArc}
              style={{
                width: '100%',
                padding: '5px',
                fontSize: 9,
                fontFamily: 'monospace',
                fontWeight: 600,
                backgroundColor: panelControl.bg,
                color: panelControl.text,
                border: `1px solid ${panelControl.border}`,
                borderRadius: 4,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Left Arc
            </button>
            <button
              onClick={distributeRightArc}
              style={{
                width: '100%',
                padding: '5px',
                fontSize: 9,
                fontFamily: 'monospace',
                fontWeight: 600,
                backgroundColor: panelControl.bg,
                color: panelControl.text,
                border: `1px solid ${panelControl.border}`,
                borderRadius: 4,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Right Arc
            </button>
            <button
              onClick={addMenuItem}
              style={{
                width: '100%',
                padding: '5px',
                fontSize: 9,
                fontFamily: 'monospace',
                fontWeight: 600,
                backgroundColor: panelControl.bg,
                color: panelControl.activeText,
                border: `1px dashed ${zenPalette.gold}55`,
                borderRadius: 4,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                gridColumn: '1 / -1',
              }}
            >
              + Add Item
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {menuItems.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: zenPalette.panelSoft,
                border: `1px solid ${zenPalette.border}`,
                borderRadius: 5,
                padding: '6px 8px',
              }}
            >
              <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                <input
                  value={item.label}
                  onChange={e => updateMenuItem(item.id, 'label', e.target.value)}
                  style={{
                    flex: 1, padding: '3px 6px', fontSize: 10, fontFamily: 'monospace',
                    backgroundColor: zenPalette.bg, color: zenPalette.text,
                    border: `1px solid ${zenPalette.border}`, borderRadius: 3,
                  }}
                />
                <input
                  type="number"
                  value={item.angle}
                  onChange={e => updateMenuItem(item.id, 'angle', +e.target.value)}
                  style={{
                    width: 52, padding: '3px 4px', fontSize: 10, fontFamily: 'monospace',
                    backgroundColor: panelControl.bg, color: panelControl.text,
                    border: `1px solid ${panelControl.border}`, borderRadius: 3, textAlign: 'center',
                  }}
                />
                <button
                  onClick={() => removeMenuItem(item.id)}
                  style={{
                    padding: '3px 7px', backgroundColor: panelControl.bg,
                    color: '#ef9c9c', border: `1px solid ${zenPalette.danger}77`,
                    borderRadius: 3, cursor: 'pointer', fontSize: 12,
                  }}
                >×</button>
              </div>
              <select
                value={item.action}
                onChange={e => updateMenuItem(item.id, 'action', e.target.value)}
                style={{
                  width: '100%', padding: '3px 5px', fontSize: 9, fontFamily: 'monospace',
                  backgroundColor: zenPalette.bg, color: zenPalette.textMuted,
                  border: `1px solid ${zenPalette.border}`, borderRadius: 3,
                  marginBottom: item.action === 'route' ? 4 : 0,
                }}
              >
                <option value="route">Route</option>
                <option value="submenu">Submenu</option>
                <option value="openOverlay">Overlay</option>
              </select>
              {item.action === 'route' && (
                <input
                  value={item.route || ''}
                  onChange={e => updateMenuItem(item.id, 'route', e.target.value)}
                  placeholder="/path"
                  style={{
                    width: '100%', padding: '3px 6px', fontSize: 9, fontFamily: 'monospace',
                    backgroundColor: zenPalette.bg, color: zenPalette.textMuted,
                    border: `1px solid ${zenPalette.border}`, borderRadius: 3, boxSizing: 'border-box',
                  }}
                />
              )}
              {item.action === 'submenu' && (
                <button
                  onClick={() => setEditingSubmenu(item.submenu || String(item.id))}
                  style={{
                    width: '100%', padding: '3px 8px', fontSize: 9, fontFamily: 'monospace',
                    backgroundColor: panelControl.bg, color: panelControl.activeText,
                    border: `1px solid ${zenPalette.gold}77`, borderRadius: 3,
                    cursor: 'pointer', textAlign: 'left', marginTop: 3,
                  }}
                >Edit Submenu →</button>
              )}
            </div>
          ))}
        </div>
      </AccordionSection>

    

      {/* EXPORT */}
      <AccordionSection title="Delivery Studio" isOpen={openPanels.export} onToggle={() => togglePanel('export')} palette={zenPalette}>

        {/* ── SAVE / LOAD ───────────────────────────────────── */}
        <div style={exportSectionLabel}>Snapshots</div>
        <input
          ref={projectJsonInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleImportProjectJson}
          style={{ display: 'none' }}
        />
        <input
          type="text"
          value={snapshotName}
          onChange={(e) => setSnapshotName(e.target.value)}
          placeholder="Snapshot Name (optional)"
          style={{
            width: '100%', padding: '5px 8px', fontSize: 10, fontFamily: 'monospace',
            backgroundColor: zenPalette.bg, color: zenPalette.text,
            border: `1px solid ${zenPalette.border}`, borderRadius: 4, boxSizing: 'border-box',
            marginBottom: 5,
          }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 6 }}>
          <button
            onClick={saveSnapshot}
            style={{
              width: '100%', padding: '6px 0', fontSize: 10, fontFamily: 'monospace', fontWeight: 600,
              backgroundColor: 'transparent', color: zenPalette.gold,
              border: `1px solid ${zenPalette.gold}`, borderRadius: 4, cursor: 'pointer',
            }}
          >Save Signature</button>
          <button
            onClick={() => setShowSnapshotOverlay(true)}
            style={{
              width: '100%', padding: '6px 0', fontSize: 10, fontFamily: 'monospace', fontWeight: 600,
              backgroundColor: 'transparent', color: zenPalette.textMuted,
              border: `1px solid ${zenPalette.border}`, borderRadius: 4, cursor: 'pointer',
            }}
          >Library ({snapshots.length})</button>
        </div>
        <button
          onClick={() => projectJsonInputRef.current?.click()}
          style={{
            width: '100%', padding: '7px 10px',
            backgroundColor: 'transparent', color: zenPalette.textMuted,
            border: `1px solid ${zenPalette.border}`, borderRadius: 4,
            cursor: 'pointer', fontSize: 10, fontFamily: 'monospace', textAlign: 'left',
          }}
        >↑  Project JSON importieren</button>
        {jsonImportHint && (
          <div style={{ marginTop: 3, fontSize: 9, color: zenPalette.gold, fontFamily: 'monospace' }}>{jsonImportHint}</div>
        )}

        <div style={exportSectionLabel}>Branding Notice</div>
        <div style={{
          marginBottom: 8,
          padding: '8px 10px',
          borderRadius: 4,
          border: `1px solid ${isPro ? zenPalette.gold : zenPalette.border}`,
          backgroundColor: isPro ? `${zenPalette.gold}12` : zenPalette.panelSoft,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 5 }}>
            <span style={{ fontSize: 10, color: zenPalette.textMenu1, fontFamily: 'monospace', letterSpacing: '0.04em' }}>
              Export ohne Branding-Hinweis
            </span>
            <button
              onClick={() => {
                if (!isPro) return;
                setExportIncludeBranding((prev) => !prev);
              }}
              style={{
                padding: '3px 12px',
                borderRadius: 20,
                cursor: isPro ? 'pointer' : 'not-allowed',
                border: `1px solid ${isPro ? zenPalette.gold : zenPalette.border}`,
                backgroundColor: isPro
                  ? (exportIncludeBranding ? 'transparent' : `${zenPalette.gold}22`)
                  : 'transparent',
                color: isPro
                  ? (exportIncludeBranding ? zenPalette.textMuted : zenPalette.gold)
                  : zenPalette.textMuted,
                fontSize: 9,
                fontFamily: '"IBM Plex Mono", monospace',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                opacity: isPro ? 1 : 0.6,
                transition: 'all 0.18s',
              }}
            >
              {!isPro ? 'PRO' : exportIncludeBranding ? 'ON' : 'OFF'}
            </button>
          </div>
          <div style={{ fontSize: 9, color: zenPalette.textMuted, fontFamily: 'monospace', lineHeight: 1.6 }}>
            {isPro
              ? (exportIncludeBranding
                ? 'ON — Generated-with Hinweise bleiben im Export enthalten.'
                : 'OFF — Generated-with Hinweise werden aus React, CSS, HTML, Guide und Project JSON entfernt.')
              : 'Free — Branding-Hinweis bleibt aktiv. Pro schaltet den Export ohne Branding-Hinweis frei.'}
          </div>
        </div>

        {/* ── PRESETS ──────────────────────────────────────── */}
        <div style={{ ...exportSectionLabel}}>Refinement Presets</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5, marginBottom: 8 }}>
          {[
            { key: 'light', label: 'Light' },
            { key: 'balanced', label: 'Balanced' },
            { key: 'aggressive', label: 'Aggressive' },
          ].map((p) => (
            <button
              key={p.key}
              onClick={() => runZenClean(p.key)}
              style={{
                width: '100%', padding: '6px 0', fontSize: 9, fontFamily: 'monospace', fontWeight: 600,
                backgroundColor: 'transparent', color: zenPalette.gold,
                border: `1px solid ${zenPalette.gold}55`, borderRadius: 4, cursor: 'pointer',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}
            >{p.label}</button>
          ))}
        </div>
        {cleaningReport && (
          <div style={{
            marginBottom: 8, padding: '6px 8px', borderRadius: 4,
            border: `1px solid ${zenPalette.border}`, backgroundColor: zenPalette.panelSoft,
            fontSize: 9, fontFamily: 'monospace', color: zenPalette.textMuted, lineHeight: 1.5,
          }}>
            <div style={{ color: zenPalette.gold, fontWeight: 700, marginBottom: 2 }}>
              {new Date(cleaningReport.timestamp).toLocaleTimeString()} · {cleaningReport.mode}
            </div>
            <div>Blur {cleaningReport.before.blur}px → {cleaningReport.after.blur}px</div>
            <div>Button {cleaningReport.before.size}px → {cleaningReport.after.size}px</div>
            <div>Radius {cleaningReport.before.radius}px → {cleaningReport.after.radius}px</div>
          </div>
        )}
        <select
          value={selectedPresetName}
          onChange={(e) => setSelectedPresetName(e.target.value)}
          style={{
            width: '100%', padding: '5px 8px', fontSize: 10, fontFamily: 'monospace',
            backgroundColor: zenPalette.bg, color: zenPalette.text,
            border: `1px solid ${zenPalette.border}`, borderRadius: 4, boxSizing: 'border-box',
            marginBottom: 5,
          }}
        >
          {Object.keys(orbitMenuPresets).map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
          <button
            onClick={() => applyBasePresetToLocalState(selectedPresetName, 'style')}
            style={{
              width: '100%', padding: '6px 0', fontSize: 10, fontFamily: 'monospace', fontWeight: 600,
              backgroundColor: 'transparent', color: zenPalette.gold,
              border: `1px solid ${zenPalette.gold}`, borderRadius: 4, cursor: 'pointer',
            }}
          >Apply Tone</button>
          <button
            onClick={() => applyBasePresetToLocalState(selectedPresetName, 'full')}
            style={{
              width: '100%', padding: '6px 0', fontSize: 10, fontFamily: 'monospace', fontWeight: 600,
              backgroundColor: 'transparent', color: zenPalette.textMuted,
              border: `1px solid ${zenPalette.border}`, borderRadius: 4, cursor: 'pointer',
            }}
          >Apply Complete</button>
        </div>
        {presetHint && (
          <div style={{ marginTop: 3, fontSize: 9, color: zenPalette.gold, fontFamily: 'monospace' }}>{presetHint}</div>
        )}

        {/* ── EXPORT ───────────────────────────────────────── */}
        <div style={{ ...exportSectionLabel, marginTop: 12 }}>Production Export</div>
        <button
          onClick={handleHTMLExport}
          style={{
            width: '100%', padding: '8px 10px', marginBottom: 6,
            backgroundColor: zenPalette.gold + '18', color: zenPalette.textMenu1,
            border: `1px solid ${zenPalette.gold}`, borderRadius: 4, cursor: 'pointer',
            fontSize: 10, fontFamily: 'monospace', fontWeight: 700,
            textAlign: 'left', letterSpacing: '0.04em',
          }}
        >↓  HTML Delivery Package</button>
        <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
          {[
            { key: 'react', label: 'React' },
            { key: 'guide', label: 'Delivery Guide' },
            { key: 'css',   label: 'CSS' },
            { key: 'json',  label: 'JSON' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setExportTab(exportTab === key ? null : key)}
              style={{
                flex: 1, padding: '5px 0', fontSize: 9, fontFamily: 'monospace', fontWeight: 700,
                backgroundColor: exportTab === key ? 'rgba(184,151,106,0.18)' : 'transparent',
                color: exportTab === key ? zenPalette.textMenu1 : zenPalette.textMuted,
                border: `1px solid ${exportTab === key ? zenPalette.gold : zenPalette.border}`,
                borderRadius: 4, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em',
              }}
            >{label}</button>
          ))}
        </div>
        {exportTab && (
          <>
            <pre style={{
              backgroundColor: zenPalette.bg,
              border: `1px solid ${zenPalette.border}`,
              borderRadius: 5, padding: '8px 10px', fontSize: 9, fontFamily: 'monospace',
              color: zenPalette.textMuted, overflowX: 'auto', overflowY: 'auto',
              maxHeight: 200, whiteSpace: 'pre', margin: 0, lineHeight: 1.5,
            }}>
              {getExportContent(exportTab)}
            </pre>
            <button
              onClick={() => handleCopyExport(exportTab)}
              style={{
                width: '100%', marginTop: 5, padding: '6px 0',
                backgroundColor: copiedTab === exportTab ? zenPalette.success : 'transparent',
                color: copiedTab === exportTab ? '#fff' : zenPalette.textMenu1,
                border: `1px solid ${copiedTab === exportTab ? zenPalette.success : zenPalette.gold}`,
                borderRadius: 4, cursor: 'pointer', fontSize: 10, fontFamily: 'monospace', fontWeight: 600,
                transition: 'all 0.2s',
              }}
            >{copiedTab === exportTab ? '✓ Copied' : '⎘  Copy'}</button>
          </>
        )}
        <button
          onClick={handleExport}
          style={{
            width: '100%', marginTop: 6, padding: '7px 10px',
            backgroundColor: 'transparent', color: zenPalette.textMuted,
            border: `1px solid ${zenPalette.border}`, borderRadius: 4,
            cursor: 'pointer', fontSize: 10, fontFamily: 'monospace', textAlign: 'left',
          }}
        >↓  {getDownloadMeta(exportTab || 'json').label}</button>

        <button
          onClick={handleShareConfig}
          style={{
            width: '100%', marginTop: 4, padding: '7px 10px',
            backgroundColor: `${zenPalette.gold}12`,
            color: zenPalette.gold,
            border: `1px solid ${zenPalette.gold}55`,
            borderRadius: 4, cursor: 'pointer',
            fontSize: 10, fontFamily: 'monospace', fontWeight: 600,
            textAlign: 'left', letterSpacing: '0.03em',
          }}
        >⬆  Signature teilen · AirDrop / Mail</button>
        <button
          onClick={syncCustomizerToGlobalConfig}
          style={{
            width: '100%', marginTop: 6, padding: '7px 10px',
            backgroundColor: 'transparent', color: zenPalette.textMuted,
            border: `1px solid ${zenPalette.border}`, borderRadius: 4,
            cursor: 'pointer', fontSize: 10, fontFamily: 'monospace', textAlign: 'left',
          }}
        >↻  Sync to Global Configuration</button>
        {syncHint && (
          <div style={{ marginTop: 3, fontSize: 9, color: zenPalette.gold, fontFamily: 'monospace' }}>{syncHint}</div>
        )}

      </AccordionSection>
    </div>
  );

  const navInlineSlot = typeof document !== 'undefined'
    ? document.getElementById('zo-nav-inline-slot')
    : null;

  const inlineHeader = (
    <div style={{
      width: '100%',
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      fontFamily: '"IBM Plex Mono", monospace',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      fontSize: 10,
      color: zenPalette.textMenu1,
      minWidth: 0,
    }}>
     
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', padding: '0.75rem', backgroundColor: zenPalette.bgCreme }}>
      <SeoHelmet
        title="Signature Customizer"
        description="Präzises Feintuning für deine ZenOrbit Signature: Geometrie, Motion, Farbwelt, Menühierarchie und Production Export."
        path="/customizer"
        type="website"
        keywords="ZenOrbit Signature Customizer, Orbit UI Design, Motion Tuning, Navigation Identity, Production Export"
      />
      {!isMobile && navInlineSlot && createPortal(inlineHeader, navInlineSlot)}
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Page header */}
        {(isMobile || !navInlineSlot) && (
          <div style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 9,
            color: '#6c5a43',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: 10,
            paddingBottom: 8,
            borderBottom: `1px solid ${zenPalette.border}`,
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            fontWeight: 600,
          }}>
            <span>Jede Anpassung wirkt sofort in der Signature Preview</span>
          </div>
        )}

        {/* Main layout */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '0.75rem',
          alignItems: isMobile ? 'stretch' : 'flex-start',
        }}>
          {/* Preview — sticky on desktop */}
          <div style={{
            flex: 1,
            position: isMobile ? 'relative' : 'sticky',
            top: isMobile ? undefined : 116,
            height: isMobile ? 320 : 'calc(100vh - 128px)',
            display: 'flex',
          }}>
            {PreviewPanel}
          </div>

          {/* Controls — sticky scrollable column */}
          <div style={{
            width: isMobile ? '100%' : 420,
            flexShrink: 0,
            position: isMobile ? 'static' : 'sticky',
            top: isMobile ? undefined : 116,
            height: isMobile ? undefined : 'calc(100vh - 128px)',
            overflowY: isMobile ? undefined : 'auto',
          }}>
            {ControlsPanel}
          </div>
        </div>
      </div>

      {/* Snapshot modal */}
      {showSnapshotOverlay && (
        <div
          onClick={() => setShowSnapshotOverlay(false)}
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1100,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: zenPalette.panel,
              border: `1px solid ${zenPalette.borderStrong}`,
              borderRadius: 10,
              padding: '1rem',
              width: '92%',
              maxWidth: 560,
              maxHeight: '75vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: zenPalette.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Signature Library
              </span>
              <button
                onClick={() => setShowSnapshotOverlay(false)}
                style={{ background: 'none', border: 'none', color: zenPalette.textMuted, cursor: 'pointer', fontSize: 18 }}
              >
                ×
              </button>
            </div>

            {snapshots.length === 0 ? (
              <div style={{ fontSize: 10, color: zenPalette.textMuted, fontFamily: 'monospace', opacity: 0.7 }}>
                Noch keine Snapshots vorhanden. Speichere deine erste Signature in der Delivery Studio Section.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {snapshots.map((snapshot) => (
                  <div
                    key={snapshot.id}
                    style={{
                      border: `1px solid ${zenPalette.border}`,
                      borderRadius: 6,
                      padding: '7px 8px',
                      backgroundColor: zenPalette.panelSoft,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 10, color: zenPalette.text, fontFamily: 'monospace', fontWeight: 600 }}>
                          {snapshot.name}
                        </div>
                        <div style={{ fontSize: 9, color: zenPalette.textMuted, fontFamily: 'monospace', opacity: 0.7 }}>
                          {new Date(snapshot.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button
                          onClick={() => loadSnapshot(snapshot)}
                          style={{
                            padding: '4px 10px', fontSize: 9, fontFamily: 'monospace', fontWeight: 600,
                            backgroundColor: zenPalette.gold, color: '#000',
                            border: `1px solid ${zenPalette.gold}`, borderRadius: 4, cursor: 'pointer',
                          }}
                        >
                          Load
                        </button>
                        <button
                          onClick={() => deleteSnapshot(snapshot.id)}
                          style={{
                            padding: '4px 10px', fontSize: 9, fontFamily: 'monospace', fontWeight: 600,
                            backgroundColor: 'transparent', color: zenPalette.danger,
                            border: `1px solid ${zenPalette.danger}66`, borderRadius: 4, cursor: 'pointer',
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submenu modal */}
      {editingSubmenu !== null && (
        <div
          onClick={() => setEditingSubmenu(null)}
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: zenPalette.panel,
              border: `1px solid ${zenPalette.borderStrong}`,
              borderRadius: 10,
              padding: '1rem',
              width: '90%', maxWidth: 420,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: zenPalette.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Submenu: <span style={{ color: zenPalette.gold }}>{editingSubmenu}</span>
              </span>
              <button
                onClick={() => setEditingSubmenu(null)}
                style={{ background: 'none', border: 'none', color: zenPalette.textMuted, cursor: 'pointer', fontSize: 18 }}
              >×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {(submenus[editingSubmenu] || []).map((sub) => (
                <div key={sub.id} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <input
                    value={sub.label}
                    onChange={e => setSubmenus(prev => ({
                      ...prev,
                      [editingSubmenu]: prev[editingSubmenu].map(s => s.id === sub.id ? { ...s, label: e.target.value } : s),
                    }))}
                    style={{ flex: 1, padding: '4px 6px', fontSize: 10, fontFamily: 'monospace', backgroundColor: zenPalette.bg, color: zenPalette.text, border: `1px solid ${zenPalette.border}`, borderRadius: 3 }}
                  />
                  <input
                    value={sub.route || ''}
                    onChange={e => setSubmenus(prev => ({
                      ...prev,
                      [editingSubmenu]: prev[editingSubmenu].map(s => s.id === sub.id ? { ...s, route: e.target.value } : s),
                    }))}
                    placeholder="/path"
                    style={{ flex: 1, padding: '4px 6px', fontSize: 10, fontFamily: 'monospace', backgroundColor: zenPalette.bg, color: zenPalette.textMuted, border: `1px solid ${zenPalette.border}`, borderRadius: 3 }}
                  />
                  <button
                    onClick={() => setSubmenus(prev => ({
                      ...prev,
                      [editingSubmenu]: prev[editingSubmenu].filter(s => s.id !== sub.id),
                    }))}
                    style={{ padding: '4px 8px', backgroundColor: 'transparent', color: zenPalette.danger, border: `1px solid ${zenPalette.danger}44`, borderRadius: 3, cursor: 'pointer' }}
                  >×</button>
                </div>
              ))}
              <button
                onClick={() => setSubmenus(prev => ({
                  ...prev,
                  [editingSubmenu]: [...(prev[editingSubmenu] || []), { id: Date.now(), angle: -90, label: 'Neu', action: 'route', route: '/' }],
                }))}
                style={{ padding: 5, fontSize: 9, fontFamily: 'monospace', backgroundColor: 'transparent', color: zenPalette.gold, border: `1px dashed ${zenPalette.gold}55`, borderRadius: 4, cursor: 'pointer', marginTop: 4 }}
              >+ Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrbitCustomizer;
