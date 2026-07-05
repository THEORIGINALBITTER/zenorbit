import React, { useMemo, useState } from 'react';

function AdaptiveIntentDebugPanel({
  context,
  decision,
  accentColor = '#d0cbb8',
  dark = true,
}) {
  const [open, setOpen] = useState(false);

  const activeSignals = useMemo(
    () => Object.entries(decision?.signals || {}).filter(([, value]) => Boolean(value)),
    [decision]
  );

  const panelTheme = dark
    ? {
        bg: 'rgba(18, 17, 15, 0.96)',
        bgSoft: 'rgba(28, 26, 23, 0.96)',
        border: 'rgba(208,203,184,0.18)',
        text: '#e8e3d7',
        textMuted: '#bdb4a2',
        color: '#e8e3d7'
      }
    : {
        bg: 'rgba(250, 245, 237, 0.3)',
        bgSoft: 'rgba(241, 234, 223, 0.96)',
        border: 'rgba(62, 54, 44, 0.18)',
        text: '#1f1a14',
        textMuted: '#6e6255',
        color: '#1f1a14'

      };

  return (
    <div style={{ 
      position: 'absolute', top: 15, 
    right: '3.45rem', 
    zIndex: 120, 
    width: open ? 320 : '320' }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          marginLeft: 'auto',
          display: 'block',
          padding: '6px 10px',
          borderRadius: 3 ,
          border: `1px solid ${panelTheme.border}`,
          backgroundColor: panelTheme.bg,
          color: panelTheme.color,
          fontSize: 10,
          fontFamily: '"IBM Plex Mono", monospace',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: '1'
        }}
      >
        Intent Debug
      </button>

      {open && (
        <div
          style={{
            marginTop: 8,
            padding: '0.8rem',
            borderRadius: 12,
            border: `1px solid ${panelTheme.border}`,
            backgroundColor: panelTheme.bg,
            color: panelTheme.text,
            fontFamily: '"IBM Plex Mono", monospace',
            boxShadow: '0 16px 40px rgba(0,0,0,0.28)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <Section title="UserContext" accentColor={panelTheme.color} theme={panelTheme}>
            <PreBlock value={context} theme={panelTheme} />
          </Section>

          <Section title="Signals" accentColor={panelTheme.color} theme={panelTheme}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {activeSignals.length === 0 && <span style={{ color: panelTheme.textMuted, fontSize: 10 }}>keine aktiven Signale</span>}
              {activeSignals.map(([key, value]) => (
                <span
                  key={key}
                  style={{
                    padding: '3px 7px',
                    borderRadius: 999,
                    border: `1px solid ${panelTheme.border}`,
                    backgroundColor: panelTheme.bgSoft,
                    color: panelTheme.color,
                    fontSize: 9,
                  }}
                >
                  {key}{typeof value === 'number' ? `:${value}` : ''}
                </span>
              ))}
            </div>
          </Section>

          <Section title="Matched Rules" accentColor={panelTheme.color} theme={panelTheme}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(decision?.matchedRules || []).length === 0 && <span style={{ color: panelTheme.textMuted, fontSize: 10 }}>keine Regel</span>}
              {(decision?.matchedRules || []).map((ruleId) => (
                <span
                  key={ruleId}
                  style={{
                    padding: '3px 7px',
                    borderRadius: 999,
                    border: `1px solid ${accentColor}44`,
                    backgroundColor: `${accentColor}14`,
                    color: panelTheme.color,
                    fontSize: 9,
                    fontWeight: 700,
                  }}
                >
                  {ruleId}
                </span>
              ))}
            </div>
          </Section>

          <Section title="Decision" accentColor={panelTheme.color} theme={panelTheme}>
            <PreBlock
              value={{
                layout: decision?.layout,
                priorityItem: decision?.priorityItem,
                reason: decision?.reason,
                items: (decision?.items || []).map((item) => ({
                  id: item.id,
                  label: item.label,
                  route: item.route,
                })),
              }}
              theme={panelTheme}
            />
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({ title, accentColor, theme, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          marginBottom: 6,
          color: accentColor,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        {title}
      </div>
      <div
        style={{
          padding: '0.55rem',
          borderRadius: 8,
          border: `1px solid ${theme.border}`,
          backgroundColor: theme.bgSoft,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function PreBlock({ value, theme }) {
  return (
    <pre
      style={{
        margin: 0,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        fontSize: 9,
        lineHeight: 1.55,
        color: theme.textMuted,
      }}
    >
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export default AdaptiveIntentDebugPanel;
