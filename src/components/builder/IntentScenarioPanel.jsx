import React, { useMemo } from 'react';
import ZenSelect from '../ui/ZenSelect';

const ROLE_OPTIONS = [
  { value: 'guest', label: 'Gast' },
  { value: 'student', label: 'Student' },
  { value: 'customer', label: 'Kunde' },
  { value: 'admin', label: 'Admin' },
];

const INTENT_OPTIONS = [
  { value: 'explore', label: 'Explore' },
  { value: 'buy', label: 'Buy' },
  { value: 'learn', label: 'Learn' },
  { value: 'support', label: 'Support' },
  { value: 'manage', label: 'Manage' },
];

const DEVICE_OPTIONS = [
  { value: 'desktop', label: 'Desktop' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'mobile', label: 'Mobile' },
];

const clampNumber = (value, min, max, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
};

const parseList = (value) => String(value || '')
  .split(',')
  .map((entry) => entry.trim())
  .filter(Boolean);

function IntentScenarioPanel({
  palette,
  enabled,
  scenarioKey,
  scenarios,
  context,
  decision,
  onEnabledChange,
  onScenarioChange,
  onContextChange,
  onApplyDecision,
}) {
  const activeScenario = useMemo(
    () => scenarios.find((entry) => entry.key === scenarioKey) || scenarios[0],
    [scenarios, scenarioKey]
  );
  const scenarioOptions = useMemo(
    () => scenarios.map((scenario) => ({ value: scenario.key, label: scenario.label })),
    [scenarios]
  );
  const resolvedContext = context || activeScenario?.context || {};
  const signalChips = Object.entries(decision?.signals || {})
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => `${key}: ${String(value)}`);

  const updateContext = (patch) => {
    onContextChange?.({ ...resolvedContext, ...patch });
  };

  return (
    <div style={{ display: 'grid', gap: '0.8rem' }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {[
          { key: true, label: 'Adaptive On' },
          { key: false, label: 'Preview Off' },
        ].map((option) => {
          const active = enabled === option.key;
          return (
            <button
              key={String(option.key)}
              type="button"
              onClick={() => onEnabledChange?.(option.key)}
              style={{
                flex: 1,
                padding: '5px 0',
                borderRadius: 6,
                border: `1px solid ${active ? palette.gold : palette.border}`,
                background: active ? palette.goldSoft : 'transparent',
                color: active ? palette.gold : palette.textDim,
                fontSize: 11,
                fontFamily: '"IBM Plex Mono", monospace',
                cursor: 'pointer',
                fontWeight: active ? 700 : 400,
                letterSpacing: '0.04em',
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div>
        <label style={styles.label(palette)}>Szenario</label>
        <ZenSelect
          value={scenarioKey}
          onChange={onScenarioChange}
          options={scenarioOptions}
          style={{ marginTop: 4 }}
        />
        <p style={styles.hint(palette)}>{activeScenario?.description}</p>
      </div>

      <div style={styles.panel(palette)}>
        <div style={styles.panelTitle(palette)}>Context</div>
        <div style={styles.gridTwo}>
          <div>
            <label style={styles.fieldLabel(palette)}>Role</label>
            <ZenSelect
              value={resolvedContext.role || 'guest'}
              onChange={(value) => updateContext({ role: value })}
              options={ROLE_OPTIONS}
              style={styles.select}
            />
          </div>
          <div>
            <label style={styles.fieldLabel(palette)}>Intent</label>
            <ZenSelect
              value={resolvedContext.intent || 'explore'}
              onChange={(value) => updateContext({ intent: value })}
              options={INTENT_OPTIONS}
              style={styles.select}
            />
          </div>
          <div>
            <label style={styles.fieldLabel(palette)}>Device</label>
            <ZenSelect
              value={resolvedContext.device || 'desktop'}
              onChange={(value) => updateContext({ device: value })}
              options={DEVICE_OPTIONS}
              style={styles.select}
            />
          </div>
          <label style={styles.switchRow(palette)}>
            <input
              type="checkbox"
              checked={Boolean(resolvedContext.returning)}
              onChange={(event) => updateContext({ returning: event.target.checked })}
            />
            <span>Returning visitor</span>
          </label>
        </div>

        <div style={styles.gridTwo}>
          <div>
            <label style={styles.fieldLabel(palette)}>Page</label>
            <input
              value={resolvedContext.page || '/'}
              onChange={(event) => updateContext({ page: event.target.value })}
              style={styles.input(palette)}
              placeholder="/pricing"
            />
          </div>
          <div>
            <label style={styles.fieldLabel(palette)}>Campaign</label>
            <input
              value={resolvedContext.campaign || ''}
              onChange={(event) => updateContext({ campaign: event.target.value })}
              style={styles.input(palette)}
              placeholder="utm_campaign"
            />
          </div>
        </div>

        <div style={styles.gridThree}>
          <div>
            <label style={styles.fieldLabel(palette)}>Scroll</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={Number(resolvedContext.scrollDepth ?? 0)}
              onChange={(event) => updateContext({ scrollDepth: clampNumber(event.target.value, 0, 1, 0) })}
              style={styles.range}
            />
            <div style={styles.rangeValue(palette)}>{Math.round(Number(resolvedContext.scrollDepth ?? 0) * 100)}%</div>
          </div>
          <div>
            <label style={styles.fieldLabel(palette)}>Hour</label>
            <input
              type="number"
              min="0"
              max="23"
              value={resolvedContext.hour ?? 12}
              onChange={(event) => updateContext({ hour: clampNumber(event.target.value, 0, 23, 12) })}
              style={styles.input(palette)}
            />
          </div>
          <div>
            <label style={styles.fieldLabel(palette)}>Aborts</label>
            <input
              type="number"
              min="0"
              max="12"
              value={resolvedContext.abortedInteractions ?? 0}
              onChange={(event) => updateContext({ abortedInteractions: clampNumber(event.target.value, 0, 12, 0) })}
              style={styles.input(palette)}
            />
          </div>
        </div>

        <div style={styles.gridTwo}>
          <div>
            <label style={styles.fieldLabel(palette)}>Recent clicks</label>
            <input
              value={(resolvedContext.recentClicks || []).join(', ')}
              onChange={(event) => updateContext({ recentClicks: parseList(event.target.value) })}
              style={styles.input(palette)}
              placeholder="pricing, faq, kontakt"
            />
          </div>
          <div>
            <label style={styles.fieldLabel(palette)}>Ignored items</label>
            <input
              value={(resolvedContext.ignoredItems || []).join(', ')}
              onChange={(event) => updateContext({ ignoredItems: parseList(event.target.value) })}
              style={styles.input(palette)}
              placeholder="checkout, pricing"
            />
          </div>
        </div>
      </div>

      {decision && (
        <div style={styles.card(palette)}>
          <div style={styles.cardTitle(palette)}>Decision</div>
          <div style={styles.metaGrid}>
            <div style={styles.metaItem(palette)}>
              <span style={styles.metaLabel(palette)}>Layout</span>
              <span style={styles.metaValue(palette)}>{decision.layout}</span>
            </div>
            <div style={styles.metaItem(palette)}>
              <span style={styles.metaLabel(palette)}>Priority</span>
              <span style={styles.metaValue(palette)}>{decision.priorityItem || '—'}</span>
            </div>
          </div>

          <p style={styles.reason(palette)}>{decision.reason}</p>

          <div style={styles.chipRow}>
            {(decision.matchedRules || []).map((ruleId) => (
              <span key={ruleId} style={styles.ruleChip(palette)}>
                {ruleId}
              </span>
            ))}
            {signalChips.map((chip) => (
              <span key={chip} style={styles.signalChip(palette)}>
                {chip}
              </span>
            ))}
          </div>

          <div style={styles.itemList}>
            {decision.items.map((item) => (
              <div key={item.id} style={styles.itemRow(palette)}>
                <span style={styles.itemLabel(palette)}>{item.label}</span>
                <span style={styles.itemRoute(palette)}>{item.route}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={onApplyDecision}
            style={styles.applyBtn(palette)}
          >
            Decision als Menü übernehmen
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  label: (palette) => ({
    display: 'block',
    fontSize: 10,
    color: palette.textDim,
    fontFamily: '"IBM Plex Mono", monospace',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  }),
  hint: (palette) => ({
    margin: '6px 0 0',
    fontSize: 11,
    color: palette.textSub,
    lineHeight: 1.5,
  }),
  panel: (palette) => ({
    border: `1px solid ${palette.border}`,
    borderRadius: 10,
    backgroundColor: palette.bgInput,
    padding: '0.75rem',
    display: 'grid',
    gap: '0.7rem',
  }),
  panelTitle: (palette) => ({
    fontSize: 11,
    color: palette.gold,
    fontFamily: '"IBM Plex Mono", monospace',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  }),
  fieldLabel: (palette) => ({
    display: 'block',
    marginBottom: 4,
    fontSize: 9,
    color: palette.textDim,
    fontFamily: '"IBM Plex Mono", monospace',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  }),
  select: {
    width: '100%',
  },
  input: (palette) => ({
    width: '100%',
    boxSizing: 'border-box',
    borderRadius: 8,
    border: `1px solid ${palette.border}`,
    backgroundColor: palette.bgCard,
    color: palette.text,
    padding: '0.45rem 0.55rem',
    fontSize: 12,
    fontFamily: '"IBM Plex Mono", monospace',
  }),
  switchRow: (palette) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
    color: palette.text,
    fontSize: 11,
    fontFamily: '"IBM Plex Mono", monospace',
  }),
  gridTwo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 8,
  },
  gridThree: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.7fr 0.7fr',
    gap: 8,
  },
  range: {
    width: '100%',
    margin: '6px 0 0',
  },
  rangeValue: (palette) => ({
    marginTop: 4,
    fontSize: 10,
    color: palette.textDim,
    fontFamily: '"IBM Plex Mono", monospace',
  }),
  card: (palette) => ({
    border: `1px solid ${palette.border}`,
    borderRadius: 10,
    backgroundColor: palette.bgInput,
    padding: '0.8rem',
    display: 'grid',
    gap: '0.7rem',
  }),
  cardTitle: (palette) => ({
    fontSize: 11,
    color: palette.gold,
    fontFamily: '"IBM Plex Mono", monospace',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  }),
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
  },
  metaItem: (palette) => ({
    border: `1px solid ${palette.border}`,
    borderRadius: 8,
    padding: '0.45rem 0.55rem',
    backgroundColor: palette.bgCard,
    display: 'grid',
    gap: 3,
  }),
  metaLabel: (palette) => ({
    fontSize: 9,
    color: palette.textDim,
    fontFamily: '"IBM Plex Mono", monospace',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  }),
  metaValue: (palette) => ({
    fontSize: 12,
    color: palette.text,
    fontFamily: '"IBM Plex Mono", monospace',
    fontWeight: 700,
  }),
  reason: (palette) => ({
    margin: 0,
    fontSize: 11,
    color: palette.text,
    lineHeight: 1.6,
  }),
  chipRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  ruleChip: (palette) => ({
    padding: '3px 7px',
    borderRadius: 999,
    border: `1px solid ${palette.border}`,
    backgroundColor: palette.goldSoft,
    color: palette.gold,
    fontSize: 9,
    fontFamily: '"IBM Plex Mono", monospace',
    fontWeight: 700,
    letterSpacing: '0.06em',
  }),
  signalChip: (palette) => ({
    padding: '3px 7px',
    borderRadius: 999,
    border: `1px solid ${palette.border}`,
    backgroundColor: palette.bgCard,
    color: palette.textDim,
    fontSize: 9,
    fontFamily: '"IBM Plex Mono", monospace',
    fontWeight: 700,
    letterSpacing: '0.04em',
  }),
  itemList: {
    display: 'grid',
    gap: 6,
  },
  itemRow: (palette) => ({
    display: 'flex',
    justifyContent: 'space-between',
    gap: 10,
    padding: '0.45rem 0.55rem',
    borderRadius: 8,
    border: `1px solid ${palette.border}`,
    backgroundColor: palette.bgCard,
  }),
  itemLabel: (palette) => ({
    fontSize: 11,
    color: palette.text,
    fontWeight: 700,
  }),
  itemRoute: (palette) => ({
    fontSize: 10,
    color: palette.textDim,
    fontFamily: '"IBM Plex Mono", monospace',
  }),
  applyBtn: (palette) => ({
    borderRadius: 8,
    border: `1px solid ${palette.gold}`,
    backgroundColor: palette.gold,
    color: palette.buttonText,
    padding: '0.6rem 0.8rem',
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '0.04em',
  }),
};

export default IntentScenarioPanel;
