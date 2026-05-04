import React, { useState } from 'react' // useState used by NpmBlock + HeroOrbit
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaBoxOpen, FaRobot, FaTools, FaMobileAlt,
  FaCode, FaEye, FaDownload,
} from 'react-icons/fa'
import SeoHelmet from '../components/seo/SeoHelmet'
import { useTheme } from '../contexts/ThemeContext'

// ─── Palettes ─────────────────────────────────────────────────────────────────

const dark = {
  bg: '#0d0d0f',
  bgMid: '#131316',
  bgCard: '#18181c',
  bgCardHover: '#1e1e23',
  border: '#28282d',
  borderSoft: '#1e1e22',
  text: '#b0ac9b',
  textSub: '#a8a299',
  textDim: '#5e574e',
  byline: '#d0cbb8',
  gold: '#d0cbb8',
  goldBright: '#d4ae7e',
  goldDim: '#5a4428',
  accentLink: '#d4ae7e',
  buttonText: '#0d0d0f',
  glow: 'rgba(184,151,106,0.13)',
  heroGradient: 'radial-gradient(1200px 500px at 50% -10%, rgba(212,174,126,0.18), transparent 60%)',
  surfaceGradient: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.0))',
}

const light = {
  bg: '#e8e3d8',
  bgMid: '#d8d1c4',
  bgCard: '#d2cabd',
  bgCardHover: '#c9c0b1',
  border: 'rgba(30,24,16,0.22)',
  borderSoft: 'rgba(30,24,16,0.12)',
  text: '#1a1710',
  textSub: '#4a4438',
  textDim: '#6f6658',
  byline: '#7a6c58',
  gold: '#8e7657',
  goldBright: '#7a5d39',
  goldDim: 'rgba(122,94,48,0.3)',
  accentLink: '#6f5332',
  buttonText: '#f7f1e6',
  glow: 'rgba(122,94,48,0.1)',
  heroGradient: 'radial-gradient(1200px 520px at 50% -10%, rgba(142,118,87,0.22), transparent 62%)',
  surfaceGradient: 'linear-gradient(180deg, rgba(255,255,255,0.25), rgba(255,255,255,0.0))',
}

const npm = 'npm install @denisbitter/bitter-button-menu framer-motion'

const STRIP = [
  { icon: FaEye,      label: 'Präzision' },
  { icon: FaDownload, label: 'Substanz' },
  { icon: FaRobot,    label: 'Intelligenz' },
  { icon: FaCode,     label: 'Integrität' },
  { icon: FaTools,    label: 'Kontrolle' },
  { icon: FaMobileAlt,label: 'Souveränität' },
]

const STEPS = [
  { n: '01', title: 'Richtung wählen', desc: 'Jede starke Marke beginnt mit einer klaren gestalterischen Haltung.' },
  { n: '02', title: 'Charakter formen',   desc: 'Bewegung, Proportion und Rhythmus werden zu einer unverwechselbaren Oberfläche.' },
  { n: '03', title: 'Signatur verfeinern', desc: 'Feintuning bis jede Interaktion dieselbe Sprache spricht.' },
  { n: '04', title: 'Identität ausliefern',desc: 'Production-ready React-Code als präziser Ausdruck deiner Marke.' },
]

const CARDS = [
  { icon: FaRobot,     title: 'Kuratiert durch AI',   desc: 'KI als Creative Assistant, nicht als Ersatz. Du behältst die Richtung.', link: '/builder' },
  { icon: FaBoxOpen,   title: 'Code mit Substanz',      desc: 'Sauberer React-Output, der der Ästhetik in der Oberfläche gerecht wird.', link: '/builder' },
  { icon: FaTools,     title: 'Absolute Kontrolle',desc: 'Präzises Feintuning für Teams, die keine Kompromisse im Detail akzeptieren.', link: '/customizer' },
  { icon: FaMobileAlt, title: 'Plattformübergreifend',      desc: 'Konsequente Wirkung auf Desktop, Tablet und Mobile.', link: '/builder' },
  { icon: FaCode,      title: 'Technische Integrität',     desc: 'React-nativ mit framer-motion. Keine Workarounds, keine Abkürzungen.', link: '/guide' },
  { icon: FaEye,       title: 'Visuelle Autorität',   desc: 'Live-Vorschau mit klarem Anspruch: Was du siehst, ist deine zukünftige Marke.', link: '/builder' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const p = isDark ? dark : light

  return (
    <div style={{ fontFamily: '"IBM Plex Sans", "Avenir Next", "Helvetica Neue", sans-serif', background: p.bg, color: p.text, transition: 'background 0.35s, color 0.35s' }}>
      <SeoHelmet
        title="ZenOrbit - High Class Orbit Navigation"
        description="ZenOrbit ist die High-Class-Plattform für radiale Navigation in React. Für Marken, die in Interaktion, Präzision und Identität führen wollen."
        path="/"
        keywords="ZenOrbit, React radial menu, Orbit Menü, Menu Builder, UI Navigation, React Navigation"
        jsonLd={{
          '@context': 'https://schema.org', '@type': 'SoftwareApplication',
          name: 'ZenOrbit', applicationCategory: 'DeveloperApplication', operatingSystem: 'Web',
          description: 'Visueller Builder fuer radiale Orbit-Menues in React.',
          url: 'https://zenorbit.denisbitter.de/',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
        }}
      />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5.5rem 1.5rem 3.5rem', position: 'relative', overflow: 'hidden' }}>

        <div style={{ position: 'absolute', inset: 0, background: p.heroGradient, pointerEvents: 'none' }} />

        {/* Glow behind orbit */}
        <div style={{ position: 'absolute', top: '52%', left: '50%', transform: 'translate(-50%,-50%)', width: 560, height: 560, background: `radial-gradient(circle, ${p.glow} 0%, transparent 70%)`, pointerEvents: 'none' }} />

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>

          <div style={{ fontSize: 10, color: p.byline, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 22, fontFamily: '"IBM Plex Mono", monospace' }}>
            by Denis Bitter · Code + Design
          </div>

          <h1 style={{ fontFamily: '"IBM Plex Sans", "Avenir Next", "Helvetica Neue", sans-serif', fontSize: 'clamp(2.8rem, 8vw, 5.2rem)', fontWeight: 800, letterSpacing: '-1.8px', lineHeight: 0.92, margin: '0 0 1.6rem' }}>
            ZenOrbit.<br />
            <span style={{ color: p.gold }}>Identity in Motion.</span>
          </h1>

          <p style={{ fontSize: 14, color: p.textSub, maxWidth: 560, margin: '0 auto 2.8rem', lineHeight: 1.9, letterSpacing: '0.01em' }}>
            Keine laute Feature-Rhetorik. Keine austauschbare UI.
            Nur präzise Navigation für Marken mit Haltung.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/builder')}
              style={{ background: p.gold, color: p.buttonText, border: 'none', padding: '14px 34px', borderRadius: 50, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.08em', transition: 'opacity 0.2s' }}>
              Experience starten →
            </button>
            <button onClick={() => navigate('/customizer')}
              style={{ background: 'transparent', color: p.accentLink, border: 'none', padding: '13px 4px', fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.05em' }}>
              Signature Customizer »
            </button>
          </div>
        </motion.div>

        {/* Large orbit – no card, floating */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          style={{ marginTop: '4rem', position: 'relative', zIndex: 1 }}
        >
          <HeroOrbit palette={p} />
        </motion.div>
      </section>

      {/* ── FEATURE STRIP ───────────────────────────────────────────────────── */}
      <section style={{ borderTop: `1px solid ${p.borderSoft}`, borderBottom: `1px solid ${p.borderSoft}`, padding: '1.5rem 2rem', background: p.bgMid, backgroundImage: p.surfaceGradient, transition: 'background 0.35s' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1.5rem 2.5rem' }}>
          {STRIP.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, color: p.textSub, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: '"IBM Plex Mono", monospace' }}>
                <Icon size={12} color={p.gold} />
                {item.label}
              </div>
            )
          })}
        </div>
      </section>

      {/* ── NPM INSTALL ─────────────────────────────────────────────────────── */}
      <section style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
        <NpmBlock text={npm} palette={p} />
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section style={{ padding: '5.2rem 1.5rem', maxWidth: 940, margin: '0 auto', borderTop: `1px solid ${p.borderSoft}` }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: 9, color: p.byline, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 10 }}>Brand Process</div>
          <h2 style={{ fontFamily: '"IBM Plex Sans", "Avenir Next", "Helvetica Neue", sans-serif', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>
            Vier Akte einer starken Identität.
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, alignItems: 'stretch' }}>
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.45 }}
              style={{ background: p.bgCard, border: `1px solid ${p.border}`, borderRadius: 12, padding: '1.9rem', minHeight: 238, transition: 'background 0.3s', backgroundImage: p.surfaceGradient }}
            >
              <div style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 900, color: p.gold, letterSpacing: '-1px', lineHeight: 1, marginBottom: 16 }}>
                {s.n}
              </div>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: p.text, letterSpacing: '0.02em' }}>{s.title}</div>
              <div style={{ fontSize: 12, color: p.textSub, lineHeight: 1.75 }}>{s.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURE GRID ────────────────────────────────────────────────────── */}
      <section style={{ padding: '5.2rem 1.5rem', maxWidth: 940, margin: '0 auto', borderTop: `1px solid ${p.borderSoft}` }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: 9, color: p.byline, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 10 }}>ZenOrbit Standards</div>
          <h2 style={{ fontFamily: '"IBM Plex Sans", "Avenir Next", "Helvetica Neue", sans-serif', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>
            Was High-Class im Interface bedeutet.
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, alignItems: 'stretch' }}>
          {CARDS.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.4 }}
              style={{ background: p.bgCard, border: `1px solid ${p.border}`, borderRadius: 12, padding: '1.6rem', minHeight: 230, transition: 'background 0.3s', backgroundImage: p.surfaceGradient }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: p.bgMid, border: `1px solid ${p.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, transition: 'background 0.3s' }}>
                <c.icon size={15} color={p.gold} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 7, color: p.text, letterSpacing: '0.02em' }}>{c.title}</div>
              <div style={{ fontSize: 12, color: p.textSub, lineHeight: 1.7, marginBottom: 14 }}>{c.desc}</div>
              <button onClick={() => navigate(c.link)} style={{ background: 'none', border: 'none', color: p.accentLink, fontSize: 11, cursor: 'pointer', fontFamily: '"IBM Plex Mono", monospace', padding: 0, fontWeight: 600, letterSpacing: '0.06em' }}>
                Entdecken »
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section style={{ textAlign: 'center', padding: '4rem 1.5rem 3rem', borderTop: `1px solid ${p.borderSoft}`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 400, background: `radial-gradient(circle, ${p.glow} 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <div style={{ fontSize: 9, color: p.byline, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 16 }}>ZenOrbit</div>
          <h2 style={{ fontFamily: '"IBM Plex Sans", "Avenir Next", "Helvetica Neue", sans-serif', fontSize: 'clamp(1.85rem, 4vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.7px', margin: '0 0 1rem', lineHeight: 1.08 }}>
            Ready to lead?
          </h2>
          <p style={{ color: p.textSub, marginBottom: '2.5rem', fontSize: 12, lineHeight: 1.7 }}>
            Für Marken, die nicht erklären, sondern ausstrahlen.
          </p>
          <button onClick={() => navigate('/builder')}
            style={{ background: p.gold, color: p.buttonText, border: 'none', padding: '14px 36px', borderRadius: 50, fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.04em', transition: 'opacity 0.2s' }}>
            Enter ZenOrbit →
          </button>
          <div style={{ marginTop: 32, fontSize: 10, color: p.byline }}>
            crafted by{' '}
            <a href="https://denisbitter.de" target="_blank" rel="noreferrer" style={{ color: p.accentLink, textDecoration: 'none' }}>
              Denis Bitter
            </a>
            {' '}· Software Architect & Instructor
          </div>
        </motion.div>
      </section>
    </div>
  )
}

// ─── npm block ────────────────────────────────────────────────────────────────

function NpmBlock({ text, palette: p }) {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, background: p.bgCard, border: `1px solid ${p.border}`, borderRadius: 10, padding: '12px 20px', flexWrap: 'wrap', justifyContent: 'center', transition: 'background 0.3s' }}>
      <span style={{ color: p.textDim, fontSize: 10, letterSpacing: '0.06em', userSelect: 'none' }}>$</span>
      <code style={{ color: p.textSub, fontSize: 11, letterSpacing: '0.02em', flex: 1, minWidth: 0 }}>{text}</code>
      <button onClick={copy} style={{ background: copied ? '#1a3d2b' : p.bgMid, border: `1px solid ${copied ? '#2f6f4e' : p.border}`, color: copied ? '#6fcf97' : p.textSub, padding: '4px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 10, fontFamily: 'inherit', transition: 'all 0.2s', whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>
        {copied ? '✓ Kopiert' : 'Kopieren'}
      </button>
    </div>
  )
}

// ─── Hero Orbit (large, no card) ──────────────────────────────────────────────

const ORBIT_ITEMS = [
  { label: 'Builder',    angle: -90  },
  { label: 'AI',         angle: -30  },
  { label: 'Export',     angle:  30  },
  { label: 'Styles',     angle:  90  },
  { label: 'Guide',      angle:  150 },
  { label: 'Pro',        angle: -150 },
]

function HeroOrbit({ palette: p }) {
  const [open, setOpen] = useState(false)
  const radius = 130

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      <div style={{ position: 'relative', width: 320, height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        {/* Subtle ring */}
        <div style={{ position: 'absolute', width: radius * 2 + 52, height: radius * 2 + 52, borderRadius: '50%', border: `1px dashed ${p.goldDim}`, opacity: open ? 0.6 : 0.25, transition: 'opacity 0.4s' }} />

        {/* Center */}
        <motion.button
          onClick={() => setOpen(!open)}
          animate={{ rotate: open ? 135 : 0, scale: open ? 1.08 : 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          style={{ width: 64, height: 64, borderRadius: '50%', background: 'transparent', border: '0.5px solid #3e362c', cursor: 'pointer', zIndex: 2, position: 'relative', boxShadow: `0 0 32px ${p.glow}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
        >
          <img
            src="/zenorbit-logo.svg"
            alt="ZenOrbit"
            style={{ width: '72%', height: '72%', objectFit: 'contain', display: 'block' }}
          />
        </motion.button>

        {/* Items */}
        {ORBIT_ITEMS.map((item, i) => {
          const rad = (item.angle - 90) * (Math.PI / 180)
          const x = Math.cos(rad) * radius
          const y = Math.sin(rad) * radius
          return (
            <motion.div
              key={item.label}
              initial={false}
              animate={{ x: open ? x : 0, y: open ? y : 0, scale: open ? 1 : 0, opacity: open ? 1 : 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22, delay: i * 0.04 }}
              style={{ position: 'absolute', width: 58, height: 58, borderRadius: '50%', background: p.bgCard, border: `1px solid ${p.goldBright}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: p.text, fontFamily: 'monospace', cursor: 'pointer', textAlign: 'center', letterSpacing: '0.02em', transition: 'background 0.3s' }}
            >
              {item.label}
            </motion.div>
          )
        })}
      </div>

      <p style={{ color: p.text, fontSize: 10, margin: 0, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {open ? '— klick zum schließen —' : '— klick zum öffnen —'}
      </p>
    </div>
  )
}
