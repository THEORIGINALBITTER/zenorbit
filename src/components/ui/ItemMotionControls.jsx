import React, { useMemo } from 'react';

export const ITEM_MOTION_CURVE_PRESETS = [
  { value: 'snappy', label: 'Snappy', bezier: [0.34, 1.32, 0.64, 1] },
  { value: 'ease-out', label: 'Ease Out', bezier: [0.22, 1, 0.36, 1] },
  { value: 'ease-in-out', label: 'Ease In Out', bezier: [0.65, 0, 0.35, 1] },
  { value: 'ease-in', label: 'Ease In', bezier: [0.55, 0.06, 0.68, 0.19] },
  { value: 'custom', label: 'Custom', bezier: null },
];

export const DEFAULT_ITEM_MOTION_BEZIER = [0.34, 1.32, 0.64, 1];

export const resolveItemMotionBezier = (preset, bezier) => {
  if (preset === 'custom') return normalizeBezier(bezier);
  const match = ITEM_MOTION_CURVE_PRESETS.find((entry) => entry.value === preset);
  return normalizeBezier(match?.bezier || DEFAULT_ITEM_MOTION_BEZIER);
};

function normalizeBezier(bezier) {
  const source = Array.isArray(bezier) ? bezier : DEFAULT_ITEM_MOTION_BEZIER;
  return [
    clamp(Number(source[0]), 0, 1, DEFAULT_ITEM_MOTION_BEZIER[0]),
    clamp(Number(source[1]), -1, 2, DEFAULT_ITEM_MOTION_BEZIER[1]),
    clamp(Number(source[2]), 0, 1, DEFAULT_ITEM_MOTION_BEZIER[2]),
    clamp(Number(source[3]), -1, 2, DEFAULT_ITEM_MOTION_BEZIER[3]),
  ];
}

function clamp(value, min, max, fallback) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function ItemMotionControls({
  palette,
  duration = 0.72,
  stagger = 0.05,
  curvePreset = 'snappy',
  curveBezier = DEFAULT_ITEM_MOTION_BEZIER,
  onDurationChange,
  onStaggerChange,
  onCurvePresetChange,
  onCurveBezierChange,
  onPreview,
}) {
  const resolvedBezier = useMemo(
    () => resolveItemMotionBezier(curvePreset, curveBezier),
    [curvePreset, curveBezier]
  );

  const triggerPreview = () => {
    onPreview?.();
  };

  const setBezierIndex = (index, rawValue) => {
    const next = [...resolvedBezier];
    next[index] = Number(rawValue);
    onCurveBezierChange?.(next);
    triggerPreview();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <ControlGroup palette={palette} label="Open Dauer" value={`${Math.round(duration * 1000)}ms`}>
        <input
          className="zen-slider"
          type="range"
          min={0.18}
          max={1.2}
          step={0.01}
          value={duration}
          onChange={(e) => {
            onDurationChange?.(Number(e.target.value));
            triggerPreview();
          }}
          style={sliderStyle(palette)}
        />
      </ControlGroup>

      <ControlGroup palette={palette} label="Item Stagger" value={`${Math.round(stagger * 1000)}ms`}>
        <input
          className="zen-slider"
          type="range"
          min={0}
          max={0.2}
          step={0.005}
          value={stagger}
          onChange={(e) => {
            onStaggerChange?.(Number(e.target.value));
            triggerPreview();
          }}
          style={sliderStyle(palette)}
        />
      </ControlGroup>

      <div>
        <label style={labelStyle(palette)}>Curve Preset</label>
        <select
          value={curvePreset}
          onChange={(e) => {
            onCurvePresetChange?.(e.target.value);
            triggerPreview();
          }}
          style={selectStyle(palette)}
        >
          {ITEM_MOTION_CURVE_PRESETS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div style={curvePreviewStyle(palette)}>
        cubic-bezier({resolvedBezier.map((value) => value.toFixed(2)).join(', ')})
      </div>

      {curvePreset === 'custom' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 0.9rem' }}>
          <BezierSlider
            palette={palette}
            label="X1"
            value={resolvedBezier[0]}
            min={0}
            max={1}
            step={0.01}
            onChange={(value) => setBezierIndex(0, value)}
          />
          <BezierSlider
            palette={palette}
            label="Y1"
            value={resolvedBezier[1]}
            min={-1}
            max={2}
            step={0.01}
            onChange={(value) => setBezierIndex(1, value)}
          />
          <BezierSlider
            palette={palette}
            label="X2"
            value={resolvedBezier[2]}
            min={0}
            max={1}
            step={0.01}
            onChange={(value) => setBezierIndex(2, value)}
          />
          <BezierSlider
            palette={palette}
            label="Y2"
            value={resolvedBezier[3]}
            min={-1}
            max={2}
            step={0.01}
            onChange={(value) => setBezierIndex(3, value)}
          />
        </div>
      )}
    </div>
  );
}

function ControlGroup({ palette, label, value, children }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <label style={labelStyle(palette)}>{label}</label>
        <span style={valueStyle(palette)}>{value}</span>
      </div>
      {children}
    </div>
  );
}

function BezierSlider({ palette, label, value, min, max, step, onChange }) {
  return (
    <ControlGroup palette={palette} label={label} value={Number(value).toFixed(2)}>
      <input
        className="zen-slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        style={sliderStyle(palette)}
      />
    </ControlGroup>
  );
}

const labelStyle = (palette) => ({
  fontSize: 10,
  color: palette.textMuted,
  fontFamily: '"IBM Plex Mono", monospace',
  letterSpacing: '0.04em',
});

const valueStyle = (palette) => ({
  fontSize: 11,
  color: palette.gold,
  fontFamily: '"IBM Plex Mono", monospace',
  fontWeight: 700,
});

const selectStyle = (palette) => ({
  width: '100%',
  padding: '0.6rem',
  fontSize: 12,
  border: `1px solid ${palette.border}`,
  borderRadius: 6,
  outline: 'none',
  boxSizing: 'border-box',
  backgroundColor: palette.panelSoft,
  color: palette.text,
  fontFamily: '"IBM Plex Mono", monospace',
});

const sliderStyle = (palette) => ({
  width: '100%',
  accentColor: palette.gold,
  cursor: 'pointer',
  display: 'block',
});

const curvePreviewStyle = (palette) => ({
  padding: '0.55rem 0.65rem',
  borderRadius: 6,
  border: `1px solid ${palette.border}`,
  backgroundColor: palette.panelSoft,
  fontSize: 10,
  color: palette.textMuted,
  fontFamily: '"IBM Plex Mono", monospace',
  lineHeight: 1.45,
});

export default ItemMotionControls;
