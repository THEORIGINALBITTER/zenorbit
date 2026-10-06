import { useLicense } from '../../hooks/useLicense';
import { canUseTemplate } from '../../config/licensePolicy';
import React, { useState } from 'react'
import { FiLock } from 'react-icons/fi'
import { getAllTemplates } from '../../templates/menuTemplates'
import { useBuilderPalette } from './builderTheme'

const R = 50 // orbit radius in SVG space

function OrbitPreview({ template, palette }) {
  const items = template.menuItems.slice(0, 6)
  const accent = template.accentColor
  const btnR = Math.max(10, Math.round((template.config.visual.button?.width || 60) / 5.5))

  return (
    <svg
      width="130" height="130"
      viewBox="-65 -65 130 130"
      style={{ display: 'block', overflow: 'visible' }}
    >
      {/* Dashed orbit ring */}
      <circle r={R} fill="none" stroke={accent + '30'} strokeWidth="1.5" strokeDasharray="4 6" />

      {/* Menu items */}
      {items.map((item, i) => {
        const angle = ((item.angle ?? (i * (360 / items.length))) - 90) * (Math.PI / 180)
        const x = Math.cos(angle) * R
        const y = Math.sin(angle) * R
        return (
          <circle
            key={item.id ?? i}
            cx={x} cy={y} r={11}
            fill={palette.bgPanel}
            stroke={accent}
            strokeWidth="1.5"
          />
        )
      })}

      {/* Center button */}
      <circle r={btnR} fill={accent} />
    </svg>
  )
}

export default function TemplateSelector({ onSelectTemplate }) {
  const { tier } = useLicense();
  const templates = getAllTemplates()
  const [hovered, setHovered] = useState(null)
  const palette = useBuilderPalette()

  return (
    <div style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))',
        gap: 14,
      }}>
        {templates.map((t) => {
          const locked = !canUseTemplate(t.id, tier)
          return (
            <button
              key={t.id}
              onClick={() => onSelectTemplate(t.id)}
              onMouseEnter={() => setHovered(t.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                all: 'unset',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
                padding: '1.75rem 1rem 1.5rem',
                background: hovered === t.id ? palette.bgCardHover : palette.bgCard,
                border: `1px solid ${hovered === t.id ? t.accentColor + '70' : palette.border}`,
                borderRadius: 14,
                cursor: 'pointer',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease',
                transform: hovered === t.id ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: hovered === t.id
                  ? `0 16px 40px ${palette.overlay}, 0 0 0 1px ${t.accentColor}25`
                  : palette.shadow,
                textAlign: 'center',
                opacity: locked ? 0.55 : 1,
              }}
            >
              {locked && (
                <div style={{
                  position: 'absolute', top: 10, right: 10,
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '3px 7px', borderRadius: 99,
                  background: palette.goldSoft, color: palette.gold,
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.04em',
                }}>
                  <FiLock size={9} /> PRO
                </div>
              )}
              <OrbitPreview template={t} palette={palette} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: palette.text, marginBottom: 5, letterSpacing: '0.01em' }}>
                  {t.name}
                </div>
                <div style={{ fontSize: 9, color: palette.gold, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
                  Signature Template
                </div>
                <div style={{ fontSize: 10, color: palette.textDim, lineHeight: 1.6, maxWidth: 150 }}>
                  {t.description}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
