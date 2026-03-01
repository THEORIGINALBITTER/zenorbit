import { useState, useEffect, useRef, useMemo } from 'react';
import * as FaIcons from 'react-icons/fa';
import { useOrbitMenuConfig } from '../hooks/useOrbitMenuConfig';
import { generateStandaloneComponent, generateInstallationGuide, generateCSS } from '../utils/codeGenerator';
import { orbitMenuPresets } from '../config/orbitMenuConfig';
import { zenPalette } from '../styles/zenPalette';

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

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

const SliderRow = ({ label, value, min, max, step = 1, onChange, unit = '' }) => (
  <div style={{ marginBottom: '0.5rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
      <label style={{ fontSize: 10, color: zenPalette.textMuted, fontFamily: 'monospace' }}>{label}</label>
      <span style={{ fontSize: 10, color: zenPalette.gold, fontFamily: 'monospace', fontWeight: 600 }}>
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
      style={{ width: '100%', accentColor: zenPalette.gold, cursor: 'pointer', display: 'block' }}
    />
  </div>
);

const SectionLabel = ({ children }) => (
  <div style={{
    fontSize: 9,
    color: zenPalette.textMuted,
    fontFamily: 'monospace',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: 10,
    opacity: 0.6,
  }}>{children}</div>
);

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
  '#AC8E66', '#f97316', '#ef4444', '#10b981',
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

const InlineColorPicker = ({ label, color, onChange }) => {
  const [open, setOpen] = useState(false);
  const [hexInput, setHexInput] = useState(color);
  const hsl = hexToHsl(color || '#000000');
  const isDark = hsl.l < 55;

  useEffect(() => { setHexInput(color); }, [color]);

  return (
    <div style={{ marginBottom: 8 }}>
      {label && (
        <div style={{ fontSize: 9, color: zenPalette.textMuted, fontFamily: 'monospace', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {label}
        </div>
      )}
      {/* Swatch button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', height: 30, padding: '0 10px',
          backgroundColor: color,
          border: `1px solid ${open ? zenPalette.gold : zenPalette.border}`,
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
          backgroundColor: zenPalette.bg,
          border: `1px solid ${zenPalette.gold}`,
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
                  border: color === c ? '2px solid #fff' : `1px solid ${zenPalette.border}`,
                }}
              />
            ))}
          </div>

          {/* Hue slider */}
          <div style={{ marginBottom: 5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontFamily: 'monospace', color: zenPalette.textMuted, marginBottom: 2 }}>
              <span>Hue</span><span>{hsl.h}°</span>
            </div>
            <input className="zen-slider" type="range" min={0} max={359} value={hsl.h}
              onChange={e => onChange(hslToHex(+e.target.value, hsl.s, hsl.l))}
              style={{ width: '100%', accentColor: zenPalette.gold }}
            />
          </div>

          {/* Saturation slider */}
          <div style={{ marginBottom: 5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontFamily: 'monospace', color: zenPalette.textMuted, marginBottom: 2 }}>
              <span>Saturation</span><span>{hsl.s}%</span>
            </div>
            <input className="zen-slider" type="range" min={0} max={100} value={hsl.s}
              onChange={e => onChange(hslToHex(hsl.h, +e.target.value, hsl.l))}
              style={{ width: '100%', accentColor: zenPalette.gold }}
            />
          </div>

          {/* Lightness slider */}
          <div style={{ marginBottom: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontFamily: 'monospace', color: zenPalette.textMuted, marginBottom: 2 }}>
              <span>Lightness</span><span>{hsl.l}%</span>
            </div>
            <input className="zen-slider" type="range" min={0} max={100} value={hsl.l}
              onChange={e => onChange(hslToHex(hsl.h, hsl.s, +e.target.value))}
              style={{ width: '100%', accentColor: zenPalette.gold }}
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
              backgroundColor: zenPalette.panelSoft, color: zenPalette.text,
              border: `1px solid ${zenPalette.border}`, borderRadius: 3,
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
    visual: true, colors: false, animation: false, items: false, export: false,
  });
  const togglePanel = (key) => setOpenPanels((prev) => {
    const shouldOpen = !prev[key];
    return {
      visual: false,
      colors: false,
      animation: false,
      items: false,
      export: false,
      [key]: shouldOpen,
    };
  });

  // ── Visual state ───────────────────────────────────────────────────────────
  const [radius, setRadius] = useState(config.visual.radius);
  const [menuOffset, setMenuOffset] = useState(config.visual.menuOffset);
  const [menuOffsetX, setMenuOffsetX] = useState(0);
  const [buttonSize, setButtonSize] = useState(config.visual.button.width);
  const [startAngle, setStartAngle] = useState(0);
  const [menuItemFontSize, setMenuItemFontSize] = useState(10);
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
  const [logoStiffness, setLogoStiffness] = useState(config.animation.logo.stiffness);
  const [logoDamping, setLogoDamping] = useState(config.animation.logo.damping);
  const [centerButtonRotates, setCenterButtonRotates] = useState(true);
  const previewDebounceRef = useRef(null);
  const previewFrameRef = useRef(null);
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });

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
  const itemMotionDuration = Math.max(0.3, 0.85 - (stiffnessT * 0.35) + (dampingT * 0.08));
  const itemOvershootY = Math.max(1.02, 1.42 - (dampingT * 0.38));
  const itemMotionCurve = `cubic-bezier(0.34, ${itemOvershootY.toFixed(2)}, 0.64, 1)`;

  // ── Color state ────────────────────────────────────────────────────────────
  const [buttonBgColor, setButtonBgColor] = useState(config.visual.colors?.buttonBg || '#1a1a1a');
  const [buttonOutlineColor, setButtonOutlineColor] = useState(config.visual.colors?.buttonOutline || '#AC8E66');
  const [menuItemBgColor, setMenuItemBgColor] = useState(config.visual.colors?.menuItemBg || '#1a1a1a');
  const [menuItemOutlineColor, setMenuItemOutlineColor] = useState(config.visual.colors?.menuItemOutline || '#AC8E66');
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

  // ── Export preview state ───────────────────────────────────────────────────
  const [exportTab, setExportTab] = useState(null); // null | 'react' | 'guide' | 'css' | 'json'
  const [copiedTab, setCopiedTab] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [snapshotName, setSnapshotName] = useState('');
  const [showSnapshotOverlay, setShowSnapshotOverlay] = useState(false);
  const [jsonImportHint, setJsonImportHint] = useState('');
  const [presetHint, setPresetHint] = useState('');
  const [syncHint, setSyncHint] = useState('');
  const [selectedPresetName, setSelectedPresetName] = useState('compact');
  const projectJsonInputRef = useRef(null);

  // ── Transfer banner state ──────────────────────────────────────────────────
  const [transferBanner, setTransferBanner] = useState(false);

  const getExportContent = (tab) => {
    const cfg = buildExportConfig();
    if (tab === 'react') return generateStandaloneComponent(cfg);
    if (tab === 'guide') return generateInstallationGuide(cfg);
    if (tab === 'css') return generateCSS(cfg);
    if (tab === 'json') return JSON.stringify(buildSnapshotState(), null, 2);
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
      if (!stored) return;
      const t = JSON.parse(stored);
      localStorage.removeItem('customizerTransfer_v1');
      if (t.radius)        setRadius(t.radius);
      if (t.menuOffset)    setMenuOffset(t.menuOffset);
      if (t.menuOffsetX !== undefined) setMenuOffsetX(t.menuOffsetX);
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
      if (t.menuItems && t.menuItems.length > 0) setMenuItems(t.menuItems);
      setTransferBanner(true);
      setTimeout(() => setTransferBanner(false), 3500);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (animatePreview) return;
    const shouldOpen = openPanels.visual || openPanels.colors || openPanels.animation || openPanels.items;
    setIsManualOpen(shouldOpen);
    setShowMenuItems(shouldOpen);
    if (!shouldOpen) {
      setLogoRotation(0);
    } else if (centerButtonRotates) {
      setLogoRotation(180);
    }
  }, [openPanels.visual, openPanels.colors, openPanels.animation, openPanels.items, animatePreview, centerButtonRotates]);

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

  const offsetBounds = useMemo(() => {
    const maxOffsetLimit = 400;
    const width = previewSize.width || 0;
    const height = previewSize.height || 0;
    if (width <= 0 || height <= 0) {
      return {
        minX: -maxOffsetLimit,
        maxX: maxOffsetLimit,
        minY: -maxOffsetLimit,
        maxY: maxOffsetLimit,
      };
    }
    const sidePadding = 10;
    const topReserved = 30;
    const bottomReserved = 50;
    const ringExtent = radius + (buttonSize / 2);
    const halfW = width / 2;
    const halfH = height / 2;

    const minXRaw = -halfW + sidePadding + ringExtent;
    const maxXRaw = halfW - sidePadding - ringExtent;
    const minYRaw = -halfH + topReserved + ringExtent;
    const maxYRaw = halfH - bottomReserved - ringExtent;

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
  }, [previewSize.width, previewSize.height, radius, buttonSize]);

  const isOffsetOutsideBounds =
    menuOffsetX < offsetBounds.minX ||
    menuOffsetX > offsetBounds.maxX ||
    menuOffset < offsetBounds.minY ||
    menuOffset > offsetBounds.maxY;

  const snapOffsetsIntoBounds = () => {
    setMenuOffsetX(Math.max(offsetBounds.minX, Math.min(offsetBounds.maxX, menuOffsetX)));
    setMenuOffset(Math.max(offsetBounds.minY, Math.min(offsetBounds.maxY, menuOffset)));
  };

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
    radius, menuOffset, menuOffsetX, buttonSize, logoStiffness, logoDamping,
    centerButtonRotates,
    logoText, logoImage, logoType, logoFontFamily, logoFontWeight, logoIconKey: resolvedLogoIconName, logoSize, logoFit, menuItemFontSize,
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
    if (state.radius !== undefined) setRadius(state.radius);
    if (state.menuOffset !== undefined) setMenuOffset(state.menuOffset);
    if (state.menuOffsetX !== undefined) setMenuOffsetX(state.menuOffsetX);
    if (state.buttonSize !== undefined) setButtonSize(state.buttonSize);
    if (state.startAngle !== undefined) setStartAngleNormalized(state.startAngle);
    if (state.logoStiffness !== undefined) setLogoStiffness(state.logoStiffness);
    if (state.logoDamping !== undefined) setLogoDamping(state.logoDamping);
    if (state.centerButtonRotates !== undefined) setCenterButtonRotates(state.centerButtonRotates);
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
    if (Array.isArray(state.menuItems)) setMenuItems(state.menuItems);
    if (state.submenus && typeof state.submenus === 'object') setSubmenus(state.submenus);
    setEditingSubmenu(null);
    setAnimatePreview(false);
    setIsManualOpen(false);
    setShowMenuItems(false);
    setLogoRotation(0);
  };

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
    if (baseVisual.menuOffset !== undefined) setMenuOffset(baseVisual.menuOffset);
    if (baseVisual.startAngle !== undefined) setStartAngleNormalized(baseVisual.startAngle);
    if (logoAnim.stiffness !== undefined) setLogoStiffness(logoAnim.stiffness);
    if (logoAnim.damping !== undefined) setLogoDamping(logoAnim.damping);
    if (menuAnim.stiffness !== undefined) setLogoStiffness(menuAnim.stiffness);
    if (menuAnim.damping !== undefined) setLogoDamping(menuAnim.damping);

    setPresetHint(`Preset applied: ${presetName} (${mode})`);
    setTimeout(() => setPresetHint(''), 1800);
  };

  const syncCustomizerToGlobalConfig = () => {
    updateMany({
      visual: {
        radius,
        menuOffset,
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

  // ─────────────────────────────────────────────────────────────────────────
  // Preview Panel
  // ─────────────────────────────────────────────────────────────────────────
  const PreviewPanel = (
    <div style={{
      flex: 1,
      backgroundColor: zenPalette.bgMuted,
      border: `1px solid ${zenPalette.border}`,
      borderRadius: 8,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      minHeight: isMobile ? 320 : undefined,
    }} ref={previewFrameRef}>
      <div style={{
        position: 'absolute', top: 10, left: 12,
        fontSize: 9, color: zenPalette.textMuted, fontFamily: 'monospace',
        letterSpacing: '0.12em', textTransform: 'uppercase',
      }}>live preview</div>

      {transferBanner && (
        <div style={{
          position: 'absolute', top: 32, left: 12, right: 12, zIndex: 2,
          backgroundColor: zenPalette.gold + '18',
          border: `1px solid ${zenPalette.gold}66`,
          borderRadius: 5,
          padding: '5px 10px',
          fontSize: 9, fontFamily: 'monospace', color: zenPalette.gold,
          textAlign: 'center',
          letterSpacing: '0.06em',
        }}>
          ✓ Builder-Konfiguration übernommen
        </div>
      )}

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
        ZenOrbit Customizer
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
        width: radius * 2, height: radius * 2,
        border: `1px dashed ${zenPalette.border}`,
        borderRadius: '50%',
        pointerEvents: 'none',
        transform: `translate(${menuOffsetX}px, ${menuOffset}px)`,
      }} />

      {/* Menu items */}
      {menuItems.map((item, index) => {
        const angleRad = ((item.angle + startAngle) * Math.PI) / 180;
        const r = showMenuItems ? radius : 0;
        const x = Math.cos(angleRad) * r;
        const y = Math.sin(angleRad) * r;
        return (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              zIndex: 4,
              left: `calc(50% + ${menuOffsetX}px)`, top: `calc(50% + ${menuOffset}px)`,
              transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${showMenuItems ? 1 : 0.3})`,
              width: buttonSize, height: buttonSize,
              backgroundColor: menuItemBgColor,
              border: shapeStyle.clipPath === 'none' ? `${menuItemOutlineWidth}px solid ${menuItemOutlineColor}` : 'none',
              borderRadius: shapeStyle.borderRadius,
              clipPath: shapeStyle.clipPath !== 'none' ? shapeStyle.clipPath : undefined,
              backdropFilter: `blur(${backdropBlur}px)`,
              WebkitBackdropFilter: `blur(${backdropBlur}px)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: menuItemFontSize, color: menuItemTextColor,
              fontFamily: 'monospace', textAlign: 'center', padding: 4,
              opacity: showMenuItems ? 1 : 0,
              transition: `transform ${itemMotionDuration.toFixed(2)}s ${itemMotionCurve} ${index * 0.05}s, opacity 0.3s ease ${index * 0.05}s`,
              pointerEvents: 'none',
            }}
          >{item.label}</div>
        );
      })}

      {/* Center button */}
      <div
        onClick={animatePreview ? undefined : togglePreview}
        style={{
          position: 'relative', zIndex: 10,
          width: buttonSize, height: buttonSize,
          backgroundColor: buttonBgColor,
          border: shapeStyle.clipPath === 'none' ? (buttonOutlineWidth > 0 ? `${buttonOutlineWidth}px solid ${buttonOutlineColor}` : 'none') : 'none',
          borderRadius: shapeStyle.borderRadius,
          clipPath: shapeStyle.clipPath !== 'none' ? shapeStyle.clipPath : undefined,
          backdropFilter: `blur(${backdropBlur}px)`,
          WebkitBackdropFilter: `blur(${backdropBlur}px)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: animatePreview ? 'not-allowed' : 'pointer',
          transform: `translate(${menuOffsetX}px, ${menuOffset}px) rotate(${
            centerButtonRotates ? (animatePreview ? logoRotation : (isManualOpen ? 180 : 0)) : 0
          }deg)`,
          transition: `transform ${centerMotionDuration.toFixed(2)}s ${itemMotionCurve}`,
          overflow: 'hidden',
          userSelect: 'none',
        }}
      >
        {logoType === 'image' && logoImage ? (
          <img src={logoImage} alt="Logo" style={{ width: `${logoSize}%`, height: `${logoSize}%`, objectFit: logoFit }} />
        ) : logoType === 'icon' ? (
          <span style={{ color: menuItemTextColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SelectedLogoIcon size={Math.max(12, buttonSize * (logoSize / 100) * 0.78)} />
          </span>
        ) : (
          <span style={{
            fontSize: Math.max(12, buttonSize * (logoSize / 100)),
            fontWeight: logoFontWeight,
            fontFamily: logoFontFamily,
            color: menuItemTextColor,
          }}>
            {logoText}
          </span>
        )}
      </div>

      {/* Controls bar */}
      <div style={{
        position: 'absolute', bottom: 10, left: 12, right: 12,
        zIndex: 12,
        display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
      }}>
        <button
          onClick={togglePreview}
          style={{
            padding: '4px 12px',
            backgroundColor: isManualOpen ? zenPalette.gold : 'transparent',
            color: isManualOpen ? '#000' : zenPalette.gold,
            border: `1px solid ${zenPalette.gold}`,
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 10, fontFamily: 'monospace', fontWeight: 600,
          }}
        >{isManualOpen ? 'CLOSE' : 'OPEN'}</button>
        <span style={{ fontSize: 9, color: zenPalette.textMuted, fontFamily: 'monospace' }}>
          {buttonSize}px · r{radius}
        </span>
      </div>
    </div>
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
      <AccordionSection title="Visual" isOpen={openPanels.visual} onToggle={() => togglePanel('visual')}>
        <SliderRow label="Radius" value={radius} min={50} max={250} onChange={e => setRadius(+e.target.value)} unit="px" />
        <SliderRow label="Button Size" value={buttonSize} min={40} max={96} onChange={e => setButtonSize(+e.target.value)} unit="px" />
        <SliderRow label="Menu Offset X" value={menuOffsetX} min={-400} max={400} onChange={e => setMenuOffsetX(+e.target.value)} unit="px" />
        <SliderRow label="Menu Offset Y" value={menuOffset} min={-400} max={400} onChange={e => setMenuOffset(+e.target.value)} unit="px" />
        <div style={{
          marginBottom: 8,
          padding: '6px 8px',
          border: `1px solid ${isOffsetOutsideBounds ? `${zenPalette.danger}66` : zenPalette.border}`,
          borderRadius: 4,
          backgroundColor: zenPalette.panelSoft,
        }}>
          <div style={{ fontSize: 9, fontFamily: 'monospace', color: zenPalette.textMuted, marginBottom: 4 }}>
            Safe Frame X: {offsetBounds.minX}px .. {offsetBounds.maxX}px
          </div>
          <div style={{ fontSize: 9, fontFamily: 'monospace', color: zenPalette.textMuted, marginBottom: 6 }}>
            Safe Frame Y: {offsetBounds.minY}px .. {offsetBounds.maxY}px
          </div>
          {isOffsetOutsideBounds && (
            <div style={{ fontSize: 9, fontFamily: 'monospace', color: zenPalette.danger, marginBottom: 6 }}>
              Preview außerhalb des sichtbaren Bereichs.
            </div>
          )}
          <button
            onClick={snapOffsetsIntoBounds}
            style={{
              width: '100%',
              padding: '4px 8px',
              fontSize: 9,
              fontFamily: 'monospace',
              fontWeight: 600,
              backgroundColor: isOffsetOutsideBounds ? zenPalette.gold : 'transparent',
              color: isOffsetOutsideBounds ? '#000' : zenPalette.textMuted,
              border: `1px solid ${isOffsetOutsideBounds ? zenPalette.gold : zenPalette.border}`,
              borderRadius: 4,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Snap to Fit
          </button>
        </div>
        <SliderRow label="Item Font Size" value={menuItemFontSize} min={8} max={14} onChange={e => setMenuItemFontSize(+e.target.value)} unit="px" />
        <SliderRow label="Backdrop Blur" value={backdropBlur} min={0} max={20} onChange={e => setBackdropBlur(+e.target.value)} unit="px" />
        <SectionLabel>Backdrop Source</SectionLabel>
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
        <input
          ref={backdropFileInputRef}
          type="file"
          accept="image/*"
          onChange={handleBackdropImageUpload}
          style={{ display: 'none' }}
        />
        <div
          onClick={() => backdropFileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsBackdropDragOver(true); }}
          onDragEnter={(e) => { e.preventDefault(); setIsBackdropDragOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsBackdropDragOver(false); }}
          onDrop={handleBackdropDrop}
          style={{
            border: `1px dashed ${isBackdropDragOver ? zenPalette.gold : zenPalette.border}`,
            backgroundColor: isBackdropDragOver ? `${zenPalette.gold}1f` : zenPalette.panelSoft,
            borderRadius: 4,
            padding: '8px',
            textAlign: 'center',
            cursor: 'pointer',
            marginBottom: 6,
          }}
        >
          <div style={{ fontSize: 10, color: isBackdropDragOver ? zenPalette.gold : zenPalette.textMuted, fontFamily: 'monospace' }}>
            Screenshot / Image drop
          </div>
          <div style={{ fontSize: 9, color: zenPalette.textMuted, fontFamily: 'monospace', marginTop: 3 }}>
            oder klicken zum Auswaehlen
          </div>
        </div>
        <button
          onClick={() => {
            setBackdropImage('');
            setBackdropImageDraft('');
          }}
          style={{
            width: '100%',
            padding: '4px 8px',
            marginBottom: 8,
            backgroundColor: 'transparent',
            color: zenPalette.textMuted,
            border: `1px solid ${zenPalette.border}`,
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 9,
            fontFamily: 'monospace',
          }}
        >
          Remove Backdrop Image
        </button>

        <SectionLabel>Form</SectionLabel>

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
                backgroundColor: buttonShape === key ? zenPalette.gold + '22' : 'transparent',
                border: `1px solid ${buttonShape === key ? zenPalette.gold : zenPalette.border}`,
                borderRadius: 4, cursor: 'pointer',
              }}
            >
              <div style={{
                width: '52%', height: '52%',
                backgroundColor: buttonShape === key ? zenPalette.gold : zenPalette.textMuted + 'bb',
                borderRadius: br, clipPath: cp,
              }} />
              <span style={{ fontSize: 8, fontFamily: 'monospace', color: buttonShape === key ? zenPalette.gold : zenPalette.textMuted, lineHeight: 1 }}>{label}</span>
            </button>
          ))}
        </div>

        {/* Contextual shape controls */}
        {buttonShape === 'square' && (
          <SliderRow label="Corner Radius" value={squareRadius} min={0} max={50} onChange={e => setSquareRadius(+e.target.value)} unit="px" />
        )}
        {buttonShape === 'polygon' && (
          <>
            <SliderRow label="Seiten" value={polygonSides} min={3} max={12} onChange={e => setPolygonSides(+e.target.value)} />
            <SliderRow label="Ecken Rundung" value={polygonCorner} min={0} max={30} onChange={e => setPolygonCorner(+e.target.value)} unit="%" />
          </>
        )}

        <SectionLabel>Logo</SectionLabel>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          {['text', 'icon', 'image'].map(t => (
            <button
              key={t}
              onClick={() => setLogoType(t)}
              style={{
                flex: 1, padding: '4px 0', fontSize: 9, fontFamily: 'monospace', fontWeight: 600,
                backgroundColor: logoType === t ? zenPalette.gold : 'transparent',
                color: logoType === t ? '#000' : zenPalette.textMuted,
                border: `1px solid ${logoType === t ? zenPalette.gold : zenPalette.border}`,
                borderRadius: 4, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em',
              }}
            >{t}</button>
          ))}
        </div>
        {logoType === 'text' && (
          <div style={{ marginBottom: 8 }}>
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
                min={300}
                max={900}
                step={100}
                value={logoFontWeight}
                onChange={(e) => setLogoFontWeight(Math.max(300, Math.min(900, +e.target.value || 700)))}
                style={{
                  width: 68, padding: '4px 6px', fontSize: 9, fontFamily: 'monospace',
                  backgroundColor: zenPalette.bg, color: zenPalette.gold,
                  border: `1px solid ${zenPalette.border}`, borderRadius: 3, textAlign: 'center',
                }}
              />
            </div>
          </div>
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
                      border: `1px solid ${presetIsActive ? zenPalette.gold : zenPalette.border}`,
                      backgroundColor: presetIsActive ? `${zenPalette.gold}22` : zenPalette.panelSoft,
                      color: presetIsActive ? zenPalette.gold : zenPalette.textMuted,
                      fontSize: 8,
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
                      border: `1px solid ${resolvedLogoIconName === iconItem.key ? zenPalette.gold : zenPalette.border}`,
                      backgroundColor: resolvedLogoIconName === iconItem.key ? `${zenPalette.gold}22` : zenPalette.panelSoft,
                      color: resolvedLogoIconName === iconItem.key ? zenPalette.gold : zenPalette.textMuted,
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
              <div style={{ fontSize: 10, color: isLogoDragOver ? zenPalette.gold : zenPalette.textMuted, fontFamily: 'monospace' }}>
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
        <SliderRow label="Logo Size" value={logoSize} min={30} max={100} onChange={e => setLogoSize(+e.target.value)} unit="%" />
        {logoType === 'image' && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
            {['contain', 'cover'].map(f => (
              <button
                key={f}
                onClick={() => setLogoFit(f)}
                style={{
                  flex: 1, padding: '4px 0', fontSize: 9, fontFamily: 'monospace', fontWeight: 600,
                  backgroundColor: logoFit === f ? zenPalette.gold : 'transparent',
                  color: logoFit === f ? '#000' : zenPalette.textMuted,
                  border: `1px solid ${logoFit === f ? zenPalette.gold : zenPalette.border}`,
                  borderRadius: 4, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em',
                }}
              >{f}</button>
            ))}
          </div>
        )}
      </AccordionSection>

      {/* COLORS */}
      <AccordionSection title="Colors" isOpen={openPanels.colors} onToggle={() => togglePanel('colors')}>
        <SectionLabel>Center Button</SectionLabel>
        <InlineColorPicker label="Background" color={buttonBgColor} onChange={setButtonBgColor} />
        <InlineColorPicker label="Outline" color={buttonOutlineColor} onChange={setButtonOutlineColor} />
        <SliderRow label="Outline Width" value={buttonOutlineWidth} min={0} max={5} onChange={e => setButtonOutlineWidth(+e.target.value)} unit="px" />

        <SectionLabel>Menu Items</SectionLabel>
        <InlineColorPicker label="Background" color={menuItemBgColor} onChange={setMenuItemBgColor} />
        <InlineColorPicker label="Text" color={menuItemTextColor} onChange={setMenuItemTextColor} />
        <InlineColorPicker label="Outline" color={menuItemOutlineColor} onChange={setMenuItemOutlineColor} />
        <SliderRow label="Outline Width" value={menuItemOutlineWidth} min={0} max={5} onChange={e => setMenuItemOutlineWidth(+e.target.value)} unit="px" />

        <SectionLabel>Backdrop</SectionLabel>
        <InlineColorPicker label="Tint Color" color={backdropTintColor} onChange={setBackdropTintColor} />
        <SliderRow
          label="Tint Opacity"
          value={backdropTintOpacity}
          min={0}
          max={85}
          onChange={e => setBackdropTintOpacity(+e.target.value)}
          unit="%"
        />
      </AccordionSection>

      {/* ANIMATION */}
      <AccordionSection title="Animation" isOpen={openPanels.animation} onToggle={() => togglePanel('animation')}>
        <SectionLabel>Center Rotation</SectionLabel>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <button
            onClick={() => {
              setCenterButtonRotates(true);
              scheduleAnimationPreview();
            }}
            style={{
              flex: 1, padding: '4px 0', fontSize: 9, fontFamily: 'monospace', fontWeight: 600,
              backgroundColor: centerButtonRotates ? zenPalette.gold : 'transparent',
              color: centerButtonRotates ? '#000' : zenPalette.textMuted,
              border: `1px solid ${centerButtonRotates ? zenPalette.gold : zenPalette.border}`,
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
              backgroundColor: !centerButtonRotates ? zenPalette.gold : 'transparent',
              color: !centerButtonRotates ? '#000' : zenPalette.textMuted,
              border: `1px solid ${!centerButtonRotates ? zenPalette.gold : zenPalette.border}`,
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
        />
        <div style={{ fontSize: 9, color: zenPalette.textMuted, fontFamily: 'monospace', marginTop: 4 }}>
          Tipp: OPEN/CLOSE unten zeigt die aktuellen Werte sofort.
        </div>
      </AccordionSection>

      {/* ITEMS */}
      <AccordionSection title="Items & Angles" badge={menuItems.length} isOpen={openPanels.items} onToggle={() => togglePanel('items')}>
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
          <div style={{ fontSize: 9, color: zenPalette.textMuted, fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6, opacity: 0.8 }}>
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
              backgroundColor: zenPalette.bg, color: zenPalette.gold,
              border: `1px solid ${zenPalette.border}`, borderRadius: 3, textAlign: 'center',
            }}
          />
          {[-90, 0, 45, 90, 180].map((preset) => (
            <button
              key={preset}
              onClick={() => setStartAngleNormalized(preset)}
              style={{
                padding: '3px 7px', fontSize: 9, fontFamily: 'monospace',
                borderRadius: 3, cursor: 'pointer',
                border: `1px solid ${startAngle === preset ? zenPalette.gold : zenPalette.border}`,
                color: startAngle === preset ? '#000' : zenPalette.textMuted,
                backgroundColor: startAngle === preset ? zenPalette.gold : 'transparent',
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
                backgroundColor: 'transparent',
                color: zenPalette.textMuted,
                border: `1px solid ${zenPalette.border}`,
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
                backgroundColor: 'transparent',
                color: zenPalette.textMuted,
                border: `1px solid ${zenPalette.border}`,
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
                backgroundColor: 'transparent',
                color: zenPalette.textMuted,
                border: `1px solid ${zenPalette.border}`,
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
                backgroundColor: 'transparent',
                color: zenPalette.gold,
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
                    backgroundColor: zenPalette.bg, color: zenPalette.gold,
                    border: `1px solid ${zenPalette.border}`, borderRadius: 3, textAlign: 'center',
                  }}
                />
                <button
                  onClick={() => removeMenuItem(item.id)}
                  style={{
                    padding: '3px 7px', backgroundColor: 'transparent',
                    color: zenPalette.danger, border: `1px solid ${zenPalette.danger}44`,
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
                    backgroundColor: 'transparent', color: zenPalette.gold,
                    border: `1px solid ${zenPalette.gold}33`, borderRadius: 3,
                    cursor: 'pointer', textAlign: 'left', marginTop: 3,
                  }}
                >Edit Submenu →</button>
              )}
            </div>
          ))}
        </div>
      </AccordionSection>

      {/* EXPORT */}
      <AccordionSection title="Export / Save / Load" isOpen={openPanels.export} onToggle={() => togglePanel('export')}>
        {/* Tab row */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          {[
            { key: 'react', label: 'React' },
            { key: 'guide', label: 'Guide' },
            { key: 'css',   label: 'CSS' },
            { key: 'json',  label: 'JSON' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setExportTab(exportTab === key ? null : key)}
              style={{
                flex: 1, padding: '5px 0', fontSize: 9, fontFamily: 'monospace', fontWeight: 600,
                backgroundColor: exportTab === key ? zenPalette.gold : zenPalette.panelSoft,
                color: exportTab === key ? '#000' : zenPalette.textMuted,
                border: `1px solid ${exportTab === key ? zenPalette.gold : zenPalette.border}`,
                borderRadius: 4, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em',
              }}
            >{label}</button>
          ))}
        </div>

        {/* Code preview */}
        {exportTab && (
          <div style={{ marginBottom: 8 }}>
            <pre style={{
              backgroundColor: zenPalette.bg,
              border: `1px solid ${zenPalette.border}`,
              borderRadius: 5,
              padding: '8px 10px',
              fontSize: 9,
              fontFamily: 'monospace',
              color: zenPalette.textMuted,
              overflowX: 'auto',
              overflowY: 'auto',
              maxHeight: 240,
              whiteSpace: 'pre',
              margin: 0,
              lineHeight: 1.5,
            }}>
              {getExportContent(exportTab)}
            </pre>
            <button
              onClick={() => handleCopyExport(exportTab)}
              style={{
                width: '100%', marginTop: 5, padding: '6px 0',
                backgroundColor: copiedTab === exportTab ? zenPalette.success : 'transparent',
                color: copiedTab === exportTab ? '#fff' : zenPalette.gold,
                border: `1px solid ${copiedTab === exportTab ? zenPalette.success : zenPalette.gold}`,
                borderRadius: 4, cursor: 'pointer',
                fontSize: 10, fontFamily: 'monospace', fontWeight: 600,
                transition: 'all 0.2s',
              }}
            >{copiedTab === exportTab ? '✓ Kopiert!' : '⎘  Kopieren'}</button>
          </div>
        )}

        {/* JSON download */}
        <button
          onClick={handleExport}
          style={{
            width: '100%', padding: '6px 10px',
            backgroundColor: 'transparent', color: zenPalette.textMuted,
            border: `1px solid ${zenPalette.border}`, borderRadius: 4,
            cursor: 'pointer', fontSize: 10, fontFamily: 'monospace', textAlign: 'left',
          }}
        >↓  {getDownloadMeta(exportTab || 'json').label}</button>

        <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${zenPalette.border}` }}>
          <div style={{ fontSize: 9, color: zenPalette.textMuted, fontFamily: 'monospace', marginBottom: 5, textTransform: 'uppercase' }}>
            Base Presets
          </div>
          <select
            value={selectedPresetName}
            onChange={(e) => setSelectedPresetName(e.target.value)}
            style={{
              width: '100%', padding: '5px 8px', fontSize: 10, fontFamily: 'monospace',
              backgroundColor: zenPalette.bg, color: zenPalette.text,
              border: `1px solid ${zenPalette.border}`, borderRadius: 4, boxSizing: 'border-box',
              marginBottom: 6,
            }}
          >
            {Object.keys(orbitMenuPresets).map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <button
              onClick={() => applyBasePresetToLocalState(selectedPresetName, 'style')}
              style={{
                width: '100%', padding: '6px 0', fontSize: 10, fontFamily: 'monospace', fontWeight: 600,
                backgroundColor: 'transparent', color: zenPalette.gold,
                border: `1px solid ${zenPalette.gold}`, borderRadius: 4, cursor: 'pointer',
              }}
            >
              Apply Style
            </button>
            <button
              onClick={() => applyBasePresetToLocalState(selectedPresetName, 'full')}
              style={{
                width: '100%', padding: '6px 0', fontSize: 10, fontFamily: 'monospace', fontWeight: 600,
                backgroundColor: 'transparent', color: zenPalette.textMuted,
                border: `1px solid ${zenPalette.border}`, borderRadius: 4, cursor: 'pointer',
              }}
            >
              Apply Full
            </button>
          </div>
          {presetHint && (
            <div style={{ marginTop: 4, fontSize: 9, color: zenPalette.gold, fontFamily: 'monospace' }}>
              {presetHint}
            </div>
          )}
        </div>

        <button
          onClick={syncCustomizerToGlobalConfig}
          style={{
            width: '100%', marginTop: 8, padding: '6px 10px',
            backgroundColor: 'transparent', color: zenPalette.textMuted,
            border: `1px solid ${zenPalette.border}`, borderRadius: 4,
            cursor: 'pointer', fontSize: 10, fontFamily: 'monospace', textAlign: 'left',
          }}
        >
          ↻  Sync to Global Config
        </button>
        {syncHint && (
          <div style={{ marginTop: 4, fontSize: 9, color: zenPalette.gold, fontFamily: 'monospace' }}>
            {syncHint}
          </div>
        )}

        <input
          ref={projectJsonInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleImportProjectJson}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => projectJsonInputRef.current?.click()}
          style={{
            width: '100%', marginTop: 6, padding: '6px 10px',
            backgroundColor: 'transparent', color: zenPalette.textMuted,
            border: `1px solid ${zenPalette.border}`, borderRadius: 4,
            cursor: 'pointer', fontSize: 10, fontFamily: 'monospace', textAlign: 'left',
          }}
        >
          ↑  Project JSON laden
        </button>
        {jsonImportHint && (
          <div style={{ marginTop: 4, fontSize: 9, color: zenPalette.gold, fontFamily: 'monospace' }}>
            {jsonImportHint}
          </div>
        )}
        <div style={{ marginTop: 4, fontSize: 9, color: zenPalette.textMuted, fontFamily: 'monospace', opacity: 0.75 }}>
          Speichere als Project JSON und lade spaeter weiter, ohne API.
        </div>

        <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${zenPalette.border}` }}>
          <input
            type="text"
            value={snapshotName}
            onChange={(e) => setSnapshotName(e.target.value)}
            placeholder="Snapshot Name (optional)"
            style={{
              width: '100%', padding: '5px 8px', fontSize: 10, fontFamily: 'monospace',
              backgroundColor: zenPalette.bg, color: zenPalette.text,
              border: `1px solid ${zenPalette.border}`, borderRadius: 4, boxSizing: 'border-box',
              marginBottom: 6,
            }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <button
              onClick={saveSnapshot}
              style={{
                width: '100%', padding: '6px 0', fontSize: 10, fontFamily: 'monospace', fontWeight: 600,
                backgroundColor: 'transparent', color: zenPalette.gold,
                border: `1px solid ${zenPalette.gold}`, borderRadius: 4, cursor: 'pointer',
              }}
            >
              Save Snapshot
            </button>
            <button
              onClick={() => setShowSnapshotOverlay(true)}
              style={{
                width: '100%', padding: '6px 0', fontSize: 10, fontFamily: 'monospace', fontWeight: 600,
                backgroundColor: 'transparent', color: zenPalette.textMuted,
                border: `1px solid ${zenPalette.border}`, borderRadius: 4, cursor: 'pointer',
              }}
            >
              Load Snapshot ({snapshots.length})
            </button>
          </div>
        </div>
      </AccordionSection>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ backgroundColor: zenPalette.bg, minHeight: '100vh', padding: '0.75rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Page header */}
        <div style={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 11,
          color: zenPalette.textMuted,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: 10,
          paddingBottom: 8,
          borderBottom: `1px solid ${zenPalette.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>Orbit <span style={{ color: zenPalette.gold }}>Customizer</span></span>
          <span style={{ fontSize: 9, opacity: 0.5 }}>Änderungen wirken sofort auf die Vorschau</span>
        </div>

        {/* Main layout */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '0.75rem',
          alignItems: 'flex-start',
        }}>
          {/* Preview — sticky on desktop */}
          <div style={{
            flex: 1,
            position: isMobile ? 'relative' : 'sticky',
            top: isMobile ? undefined : 80,
            minHeight: isMobile ? 320 : 'calc(100vh - 120px)',
            display: 'flex',
          }}>
            {PreviewPanel}
          </div>

          {/* Controls — sticky scrollable column */}
          <div style={{
            width: isMobile ? '100%' : 420,
            flexShrink: 0,
            position: isMobile ? 'static' : 'sticky',
            top: isMobile ? undefined : 80,
            height: isMobile ? undefined : 'calc(100vh - 120px)',
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
                Saved Snapshots
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
                No snapshots yet. Save one from the Export section.
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
                          Delete
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
