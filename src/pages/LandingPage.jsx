import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaCogs, FaPaintBrush, FaBoxOpen, FaRobot, FaTools, FaMobileAlt } from 'react-icons/fa'
import SeoHelmet from '../components/seo/SeoHelmet'

const features = [
  {
    icon: FaCogs,
    title: '3-Step Builder',
    desc: 'Template wählen, Design anpassen, Code exportieren – in Minuten.',
  },
  {
    icon: FaPaintBrush,
    title: 'Live-Vorschau',
    desc: 'Jede Änderung siehst du sofort. Kein Raten mehr.',
  },
  {
    icon: FaBoxOpen,
    title: 'ZIP-Export',
    desc: 'Fertiger React-Komponenten-Code, direkt in dein Projekt einfügen.',
  },
  {
    icon: FaRobot,
    title: 'AI-Generator',
    desc: 'Beschreib dein Menü auf Deutsch – KI generiert Struktur und Farben.',
  },
  {
    icon: FaTools,
    title: 'Profi-Customizer',
    desc: 'Radius, Farben, Animationen, Submenüs – alles konfigurierbar.',
  },
  {
    icon: FaMobileAlt,
    title: 'Responsive',
    desc: 'Funktioniert auf Desktop und Mobile, Touch-optimiert.',
  },
]

const npmInstall = 'npm install @denisbitter/bitter-button-menu framer-motion'
const zenPalette = {
  bg: '#0f0f10',
  bgMuted: '#17171a',
  border: '#2a2a2d',
  text: '#e8e3d7',
  textMuted: '#9f9688',
  gold: '#AC8E66',
  goldSoft: '#C8AD84',
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      style={{
        background: copied ? '#2f6f4e' : '#222227',
        border: 'none',
        color: zenPalette.text,
        padding: '4px 12px',
        borderRadius: 6,
        cursor: 'pointer',
        fontSize: 13,
        transition: 'background 0.2s',
      }}
    >
      {copied ? '✓ Kopiert' : 'Kopieren'}
    </button>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={{ background: zenPalette.bg, minHeight: '100vh', color: zenPalette.text, fontFamily: '"IBM Plex Mono", "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>
      <SeoHelmet
        title="Radial Menu Builder"
        description="ZenOrbit ist ein visueller React Builder für Orbit-Menüs mit Live-Vorschau, KI-Generator und ZIP-Export."
        path="/"
        keywords="ZenOrbit, React radial menu, Orbit Menü, Menu Builder, UI Navigation"
      />

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '2rem 1.5rem 1.5rem' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ display: 'inline-block', background: zenPalette.gold, color: '#121212', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, marginBottom: 14 }}>
            Radial Menu Builder
          </div>
          <h1 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2.2rem)', fontWeight: 800, letterSpacing: '-1px', margin: '0 0 0.6rem', lineHeight: 1.1 }}>
            Dein Orbit-Menü,<br />
            <span style={{ color: zenPalette.gold }}>in Minuten gebaut.</span>
          </h1>
          <p style={{ fontSize: '10px', color: zenPalette.textMuted, maxWidth: 400, margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            Erstelle ein radiales Navigationsmenü für React – visuell, ohne Code-Kenntnisse,
            mit Live-Vorschau und ZIP-Export.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/builder')} style={heroBtn(zenPalette.gold, '#121212')}>
              Builder starten →
            </button>
            <button onClick={() => navigate('/customizer')} style={heroBtn('transparent', zenPalette.gold, `2px solid ${zenPalette.gold}`)}>
              Profi-Customizer
            </button>
          </div>
        </motion.div>

        {/* Live Demo Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          style={{ margin: '2rem auto 0', maxWidth: 440, background: zenPalette.bgMuted, borderRadius: 16, padding: '1.5rem', border: `1px solid ${zenPalette.border}`, position: 'relative' }}
        >
          <div style={{ fontSize: 10, color: zenPalette.textMuted, marginBottom: 16 }}>— Live Demo —</div>
          <DemoOrbit />
        </motion.div>
      </section>

      {/* npm install */}
      <section style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: zenPalette.bgMuted, border: `1px solid ${zenPalette.border}`, borderRadius: 10, padding: '10px 18px' }}>
          <code style={{ color: zenPalette.textMuted, fontSize: 10 }}>{npmInstall}</code>
          <CopyButton text={npmInstall} />
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '2rem 1.5rem', maxWidth: 720, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '13px', fontWeight: 700, marginBottom: '1.5rem' }}>
          Was ZenOrbit kann
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {features.map((f) => (
            <div key={f.title} style={{ background: zenPalette.bgMuted, border: `1px solid ${zenPalette.border}`, borderRadius: 12, padding: '1.5rem' }}>
              <div style={{ color: zenPalette.gold, marginBottom: 12 }}>
                <f.icon size={18} />
              </div>
              <div style={{ fontWeight: 700, marginBottom: 6, fontSize: '12px' }}>{f.title}</div>
              <div style={{ color: zenPalette.textMuted, fontSize: '10px', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '2rem 1.5rem 3rem' }}>
        <h2 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '1rem' }}>Bereit loszulegen?</h2>
        <p style={{ color: zenPalette.textMuted, marginBottom: '2rem', fontSize: '10px' }}>Kein Account erforderlich. Kostenlos starten.</p>
        <button onClick={() => navigate('/builder')} style={heroBtn(zenPalette.gold, '#121212')}>
          Jetzt Builder starten →
        </button>
      </section>

    </div>
  )
}

// ─── Helper styles ────────────────────────────────────────────────────────────

function heroBtn(bg, color, border = 'none') {
  return {
    background: bg, color, border, padding: '9px 18px',
    borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13, transition: 'opacity 0.2s',
  }
}

// ─── Minimal Demo Orbit ───────────────────────────────────────────────────────

const DEMO_ITEMS = [
  { label: 'Home', angle: -90 },
  { label: 'Blog', angle: -30 },
  { label: 'Kontakt', angle: -150 },
  { label: 'Über', angle: 30 },
  { label: 'Kurse', angle: 150 },
]

function DemoOrbit() {
  const [open, setOpen] = useState(false)
  const radius = 100

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <div style={{ position: 'relative', width: 240, height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Center Button */}
        <motion.button
          onClick={() => setOpen(!open)}
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          style={{
            width: 56, height: 56, borderRadius: '50%', background: zenPalette.gold,
            border: 'none', color: '#121212', fontSize: 22, cursor: 'pointer',
            zIndex: 2, position: 'relative',
          }}
        >
          ☰
        </motion.button>

        {/* Menu Items */}
        {DEMO_ITEMS.map((item, i) => {
          const rad = (item.angle - 90) * (Math.PI / 180)
          const x = Math.cos(rad) * radius
          const y = Math.sin(rad) * radius
          return (
            <motion.div
              key={item.label}
              initial={false}
              animate={{ x: open ? x : 0, y: open ? y : 0, scale: open ? 1 : 0, opacity: open ? 1 : 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: i * 0.05 }}
              style={{
                position: 'absolute', width: 52, height: 52, borderRadius: '50%',
                background: '#1c1c1f', border: `1px solid ${zenPalette.goldSoft}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, color: '#ece1cf', fontFamily: 'monospace',
                cursor: 'pointer', textAlign: 'center', padding: 4,
              }}
            >
              {item.label}
            </motion.div>
          )
        })}
      </div>
      <p style={{ color: zenPalette.textMuted, fontSize: 13, margin: 0 }}>
        {open ? 'Klick auf einen Punkt zum Schließen' : 'Klick auf ☰ zum Öffnen'}
      </p>
    </div>
  )
}
