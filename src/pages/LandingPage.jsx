import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const features = [
  {
    icon: '⚙️',
    title: '3-Step Builder',
    desc: 'Template wählen, Design anpassen, Code exportieren – in Minuten.',
  },
  {
    icon: '🎨',
    title: 'Live-Vorschau',
    desc: 'Jede Änderung siehst du sofort. Kein Raten mehr.',
  },
  {
    icon: '📦',
    title: 'ZIP-Export',
    desc: 'Fertiger React-Komponenten-Code, direkt in dein Projekt einfügen.',
  },
  {
    icon: '🤖',
    title: 'AI-Generator',
    desc: 'Beschreib dein Menü auf Deutsch – KI generiert Struktur und Farben.',
  },
  {
    icon: '🔧',
    title: 'Profi-Customizer',
    desc: 'Radius, Farben, Animationen, Submenüs – alles konfigurierbar.',
  },
  {
    icon: '📱',
    title: 'Responsive',
    desc: 'Funktioniert auf Desktop und Mobile, Touch-optimiert.',
  },
]

const npmInstall = 'npm install @denisbitter/bitter-button-menu framer-motion'

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
        background: copied ? '#16a34a' : '#374151',
        border: 'none',
        color: '#fff',
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
    <div style={{ background: '#0f172a', minHeight: '100vh', color: '#f1f5f9', fontFamily: 'system-ui, sans-serif' }}>

      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', borderBottom: '1px solid #1e293b' }}>
        <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: '-0.5px' }}>
          <span style={{ color: '#f97316' }}>Zen</span>Orbit
        </span>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/builder')} style={navBtn('#1e293b', '#94a3b8')}>Builder</button>
          <button onClick={() => navigate('/customizer')} style={navBtn('#f97316', '#fff')}>Customizer</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '5rem 2rem 3rem' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ display: 'inline-block', background: '#f97316', color: '#fff', borderRadius: 20, padding: '4px 14px', fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
            Radial Menu Builder
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, letterSpacing: '-1px', margin: '0 0 1rem', lineHeight: 1.1 }}>
            Dein Orbit-Menü,<br />
            <span style={{ color: '#f97316' }}>in Minuten gebaut.</span>
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#94a3b8', maxWidth: 560, margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
            Erstelle ein radiales Navigationsmenü für React – visuell, ohne Code-Kenntnisse,
            mit Live-Vorschau und ZIP-Export.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/builder')} style={heroBtn('#f97316', '#fff')}>
              Builder starten →
            </button>
            <button onClick={() => navigate('/customizer')} style={heroBtn('transparent', '#f97316', '2px solid #f97316')}>
              Profi-Customizer
            </button>
          </div>
        </motion.div>

        {/* Live Demo Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          style={{ margin: '4rem auto 0', maxWidth: 700, background: '#1e293b', borderRadius: 16, padding: '2.5rem', border: '1px solid #334155', position: 'relative' }}
        >
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>— Live Demo —</div>
          <DemoOrbit />
        </motion.div>
      </section>

      {/* npm install */}
      <section style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: '10px 18px' }}>
          <code style={{ color: '#94a3b8', fontSize: 14 }}>{npmInstall}</code>
          <CopyButton text={npmInstall} />
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '4rem 2rem', maxWidth: 1000, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.75rem', fontWeight: 700, marginBottom: '2.5rem' }}>
          Was ZenOrbit kann
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {features.map((f) => (
            <div key={f.title} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '1.5rem' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{f.title}</div>
              <div style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '4rem 2rem 6rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem' }}>Bereit loszulegen?</h2>
        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Kein Account erforderlich. Kostenlos starten.</p>
        <button onClick={() => navigate('/builder')} style={heroBtn('#f97316', '#fff')}>
          Jetzt Builder starten →
        </button>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1e293b', padding: '1.5rem 2rem', textAlign: 'center', color: '#475569', fontSize: 13 }}>
        ZenOrbit by <a href="https://denisbitter.de" style={{ color: '#f97316', textDecoration: 'none' }}>Denis Bitter</a>
        {' · '}
        <a href="https://github.com/denisbitter" style={{ color: '#64748b', textDecoration: 'none' }}>GitHub</a>
      </footer>
    </div>
  )
}

// ─── Helper styles ────────────────────────────────────────────────────────────

function navBtn(bg, color) {
  return {
    background: bg, color, border: 'none', padding: '8px 16px',
    borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14, transition: 'opacity 0.2s',
  }
}

function heroBtn(bg, color, border = 'none') {
  return {
    background: bg, color, border, padding: '14px 28px',
    borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 16, transition: 'opacity 0.2s',
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
            width: 56, height: 56, borderRadius: '50%', background: '#f97316',
            border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer',
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
                background: '#1f2937', border: '1px solid #f97316',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, color: '#fef3c7', fontFamily: 'monospace',
                cursor: 'pointer', textAlign: 'center', padding: 4,
              }}
            >
              {item.label}
            </motion.div>
          )
        })}
      </div>
      <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
        {open ? 'Klick auf einen Punkt zum Schließen' : 'Klick auf ☰ zum Öffnen'}
      </p>
    </div>
  )
}
