import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'
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

const STEPS = [
  { n: '01', eyebrow: 'Stil wählen', title: 'Beginne mit einer klaren Richtung.', desc: 'Wähle eine Gestaltung, die zu deinem Auftritt passt. Dein Menü ist sofort sichtbar.' },
  { n: '02', eyebrow: 'Gestalten', title: 'Jede Änderung wirkt direkt.', desc: 'Passe Farbe, Logo, Bewegung und Ziele an. Die Vorschau zeigt dir unmittelbar das Ergebnis.' },
  { n: '03', eyebrow: 'Übernehmen', title: 'Bereit für deine Website.', desc: 'Lade dein fertiges Orbit-Menü als React-Paket herunter und setze es in deinem Projekt ein.' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const p = isDark ? dark : light
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  )
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  return (
    <div style={{ fontFamily: '"IBM Plex Sans", "Avenir Next", "Helvetica Neue", sans-serif', background: p.bg, color: p.text, transition: 'background 0.35s, color 0.35s' }}>
      <SeoHelmet
        title="ZenOrbit - Interaktive Navigation gestalten"
        description="Gestalte mit ZenOrbit ein interaktives Orbit-Menü für deine Website. Stil wählen, live anpassen und als React-Paket übernehmen."
        path="/"
        type="website"
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
      <section style={{ minHeight: isMobile ? 'calc(100svh - 48px)' : 'calc(100svh - 112px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '3rem 1.25rem 1.5rem' : '3.5rem 1.5rem 2rem', position: 'relative', overflow: 'hidden' }}>

        <div style={{ position: 'absolute', inset: 0, background: p.heroGradient, pointerEvents: 'none' }} />

        {/* Glow behind orbit */}
        <div style={{ position: 'absolute', top: '52%', left: '50%', transform: 'translate(-50%,-50%)', width: isMobile ? 300 : 560, height: isMobile ? 300 : 560, background: `radial-gradient(circle, ${p.glow} 0%, transparent 70%)`, pointerEvents: 'none' }} />

        <Motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>

          <div style={{ fontSize: 10, color: p.byline, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 22, fontFamily: '"IBM Plex Mono", monospace' }}>
            crafted by Denis Bitter · Software Systems Engineer
          </div>

          <h1 style={{ fontFamily: '"IBM Plex Sans", "Avenir Next", "Helvetica Neue", sans-serif', fontSize: 'clamp(2.8rem, 8vw, 5.2rem)', fontWeight: 800, letterSpacing: '-1.8px', lineHeight: 0.92, margin: '0 0 1.6rem' }}>
            ZenOrbit.<br />
            <span style={{ color: p.gold }}>Identity in Motion.</span>
          </h1>

          <p style={{ fontSize: 15, color: p.textSub, maxWidth: 600, margin: '0 auto 2.2rem', lineHeight: 1.7, letterSpacing: '0.01em' }}>
            Gestalte ein interaktives Menü, das deine Inhalte verbindet<br />
            und deinem Auftritt Charakter gibt.
          </p>

          <div style={{ display: 'flex', gap: isMobile ? 10 : 14, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/builder')}
              style={{ background: p.gold, color: p.buttonText, border: 'none', padding: isMobile ? '12px 28px' : '14px 34px', borderRadius: 50, fontWeight: 700, fontSize: isMobile ? 12 : 13, cursor: 'pointer', fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.08em', transition: 'opacity 0.2s' }}>
              Dein Menü gestalten
            </button>
            {!isMobile && (
              <button onClick={() => document.getElementById('produkt')?.scrollIntoView({ behavior: 'smooth' })}
                style={{ background: 'transparent', color: p.accentLink, border: 'none', padding: '13px 4px', fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.05em' }}>
                Ansehen ↓
              </button>
            )}
          </div>
        </Motion.div>

        {/* Large orbit – no card, floating */}
        <div
          style={{ marginTop: isMobile ? '1.25rem' : '2rem', position: 'relative', zIndex: 1, transform: isMobile ? 'scale(0.72)' : 'scale(0.82)', transformOrigin: 'top center', marginBottom: isMobile ? '-4.5rem' : '-3rem' }}
        >
          <HeroOrbit palette={p} />
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section id="produkt" style={{ padding: isMobile ? '4rem 1.25rem' : '7rem 1.5rem', maxWidth: 1040, margin: '0 auto', borderTop: `1px solid ${p.borderSoft}` }}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '4rem' : '6rem' }}>
          <div style={{ fontSize: 9, color: p.byline, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 14 }}>So entsteht dein Orbit</div>
          <h2 style={{ fontFamily: '"IBM Plex Sans", "Avenir Next", "Helvetica Neue", sans-serif', fontSize: 'clamp(2rem, 5vw, 3.6rem)', fontWeight: 800, letterSpacing: '-0.5px', margin: 0, lineHeight: 1.05 }}>
            Von der Idee zum fertigen Menü.
          </h2>
        </div>
        <div>
          {STEPS.map((s) => (
            <div
              key={s.n}
              style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '120px minmax(0, 1fr)', gap: isMobile ? 12 : 36, padding: isMobile ? '2.5rem 0' : '4rem 0', borderTop: `1px solid ${p.borderSoft}`, alignItems: 'start' }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: p.gold, letterSpacing: '0.12em', lineHeight: 1, fontFamily: '"IBM Plex Mono", monospace' }}>
                {s.n}
              </div>
              <div>
                <div style={{ fontSize: 10, color: p.byline, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 12, fontFamily: '"IBM Plex Mono", monospace' }}>{s.eyebrow}</div>
                <h3 style={{ fontSize: 'clamp(1.65rem, 4vw, 3rem)', color: p.text, lineHeight: 1.08, margin: '0 0 1rem', fontWeight: 800 }}>{s.title}</h3>
                <p style={{ fontSize: isMobile ? 14 : 16, color: p.textSub, lineHeight: 1.7, maxWidth: 620, margin: 0 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section style={{ textAlign: 'center', padding: isMobile ? '2.5rem 1.1rem 2rem' : '4rem 1.5rem 3rem', borderTop: `1px solid ${p.borderSoft}`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 400, background: `radial-gradient(circle, ${p.glow} 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 9, color: p.byline, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 16 }}>Dein Orbit</div>
          <h2 style={{ fontFamily: '"IBM Plex Sans", "Avenir Next", "Helvetica Neue", sans-serif', fontSize: 'clamp(1.85rem, 4vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.7px', margin: '0 0 1rem', lineHeight: 1.08 }}>
            Bereit, deinen Auftritt zu bewegen?
          </h2>
          <p style={{ color: p.textSub, marginBottom: '2.5rem', fontSize: 12, lineHeight: 1.7 }}>
            Wähle einen Stil und sieh dein Menü sofort in Bewegung.
          </p>
          <button onClick={() => navigate('/builder')}
            style={{ background: p.gold, color: p.buttonText, border: 'none', padding: '14px 36px', borderRadius: 50, fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.04em', transition: 'opacity 0.2s' }}>
            Dein Menü gestalten
          </button>
          <details style={{ maxWidth: 620, margin: '2.5rem auto 0', color: p.textDim, fontFamily: '"IBM Plex Mono", monospace' }}>
            <summary style={{ cursor: 'pointer', color: p.accentLink, fontSize: 10, letterSpacing: '0.08em' }}>
              Für Entwickler
            </summary>
            <div style={{ marginTop: 18 }}>
              <NpmBlock text={npm} palette={p} isMobile={isMobile} />
            </div>
          </details>
          <div style={{ marginTop: 32, fontSize: 10, color: p.byline }}>
            crafted by{' '}
            <a href="https://denisbitter.de" target="_blank" rel="noreferrer" style={{ color: p.accentLink, textDecoration: 'none' }}>
              Denis Bitter
            </a>
            {' '}· Software Systems Engineer
          </div>
        </div>
      </section>
    </div>
  )
}

// ─── npm block ────────────────────────────────────────────────────────────────

function NpmBlock({ text, palette: p, isMobile }) {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: isMobile ? 10 : 16, background: p.bgCard, border: `1px solid ${p.border}`, borderRadius: 10, padding: isMobile ? '10px 14px' : '12px 20px', flexWrap: 'wrap', justifyContent: 'center', transition: 'background 0.3s', maxWidth: isMobile ? '100%' : undefined, boxSizing: 'border-box' }}>
      <span style={{ color: p.textDim, fontSize: 10, letterSpacing: '0.06em', userSelect: 'none' }}>$</span>
      <code style={{ color: p.textSub, fontSize: isMobile ? 9 : 11, letterSpacing: '0.02em', flex: 1, minWidth: 0, wordBreak: 'break-all' }}>{text}</code>
      <button onClick={copy} style={{ background: copied ? '#1a3d2b' : p.bgMid, border: `1px solid ${copied ? '#2f6f4e' : p.border}`, color: copied ? '#6fcf97' : p.textSub, padding: '4px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 10, fontFamily: '"IBM Plex Mono", monospace', transition: 'all 0.2s', whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>
        {copied ? '✓' : 'Copy'}
      </button>
    </div>
  )
}

// ─── Hero Orbit (large, no card) ──────────────────────────────────────────────

const ORBIT_ITEMS = [
  { label: 'Stile', angle: -90, link: '/builder' },
  { label: 'KI', angle: -30, link: '/builder' },
  { label: 'Export', angle: 30, link: '/builder' },
  { label: 'Details', angle: 90, link: '/customizer' },
  { label: 'Hilfe', angle: 150, link: '/guide' },
  { label: 'Pro', angle: -150, link: '/pro' },
]

function HeroOrbit({ palette: p }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(true)
  const radius = 130

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      <div style={{ position: 'relative', width: 320, height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        {/* Subtle ring */}
        <div style={{ position: 'absolute', width: radius * 2 + 52, height: radius * 2 + 52, borderRadius: '50%', border: `1px dashed ${p.goldDim}`, opacity: open ? 0.6 : 0.25, transition: 'opacity 0.4s' }} />

        {/* Center */}
        <Motion.button
          onClick={() => setOpen(!open)}
          animate={{ rotate: open ? 180 : 0, scale: open ? 1.08 : 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          style={{
            width: 64,
            height: 64,
            borderRadius: '999px',
            background: p.bgCard,
            border: `1px solid ${p.border}`,
            cursor: 'pointer',
            zIndex: 2,
            position: 'relative',
            boxShadow: `0 0 32px ${p.glow}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.3s, border-color 0.3s',
          }}
        >
          <span style={{ fontSize: 26, fontFamily: 'serif', color: p.gold, lineHeight: 1, userSelect: 'none' }}>軌</span>
        </Motion.button>

        {/* Items */}
        {ORBIT_ITEMS.map((item, i) => {
          const rad = (item.angle - 90) * (Math.PI / 180)
          const x = Math.cos(rad) * radius
          const y = Math.sin(rad) * radius
          return (
            <Motion.button
              key={item.label}
              initial={false}
              animate={{ x: open ? x : 0, y: open ? y : 0, scale: open ? 1 : 0, opacity: open ? 1 : 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22, delay: i * 0.04 }}
              onClick={() => navigate(item.link)}
              style={{
                position: 'absolute',
                minWidth: 68,
                height: 34,
                borderRadius: '999px',
                padding: '0 12px',
                background: p.bgCard,
                border: `1px solid ${p.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                color: p.textSub,
                fontFamily: '"IBM Plex Mono", monospace',
                cursor: 'pointer',
                textAlign: 'center',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                transition: 'background 0.3s, border-color 0.3s, color 0.3s',
                boxShadow: open ? `0 0 0 1px ${p.goldDim}` : 'none',
                outline: 'none',
              }}
            >
              {item.label}
            </Motion.button>
          )
        })}
      </div>

      <p style={{ color: p.text, fontSize: 10, margin: 0, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {open ? 'Menü schließen' : 'Menü öffnen'}
      </p>
    </div>
  )
}
