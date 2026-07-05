import React from 'react';
import ZenSelect from '../ui/ZenSelect';

function IntentScenarioPanel({
  palette,
  enabled,
  scenarioKey,
  scenarios,
  context,
  decision,
  onEnabledChange,
  onScenarioChange,
  onApplyDecision,
}) {
  const activeScenario = scenarios.find((entry) => entry.key === scenarioKey) || scenarios[0];
  const scenarioOptions = scenarios.map((scenario) => ({
    value: scenario.key,
    label: scenario.label,
  }));

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

          <div style={styles.ruleChips}>
            {(decision.matchedRules || []).map((ruleId) => (
              <span key={ruleId} style={styles.ruleChip(palette)}>
                {ruleId}
              </span>
            ))}
          </div>

          <div style={styles.debugGrid}>
            <div style={styles.debugBlock(palette)}>
              <div style={styles.debugTitle(palette)}>UserContext</div>
              <pre style={styles.debugPre(palette)}>{JSON.stringify(context || activeScenario?.context || {}, null, 2)}</pre>
            </div>
            <div style={styles.debugBlock(palette)}>
              <div style={styles.debugTitle(palette)}>Signals</div>
              <pre style={styles.debugPre(palette)}>
                {JSON.stringify(
                  Object.fromEntries(
                    Object.entries(decision.signals || {}).filter(([, value]) => Boolean(value))
                  ),
                  null,
                  2
                )}
              </pre>
            </div>
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
  ruleChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  debugGrid: {
    display: 'grid',
    gap: 8,
  },
  debugBlock: (palette) => ({
    border: `1px solid ${palette.border}`,
    borderRadius: 8,
    padding: '0.5rem 0.55rem',
    backgroundColor: palette.bgCard,
  }),
  debugTitle: (palette) => ({
    marginBottom: 5,
    fontSize: 9,
    color: palette.gold,
    fontFamily: '"IBM Plex Mono", monospace',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  }),
  debugPre: (palette) => ({
    margin: 0,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontSize: 9,
    lineHeight: 1.5,
    color: palette.textDim,
    fontFamily: '"IBM Plex Mono", monospace',
  }),
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
