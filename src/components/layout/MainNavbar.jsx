import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaSun, FaMoon, FaLinkedin, FaGithub, FaInstagram, FaYoutube, FaStackOverflow, FaEnvelope, FaPhoneAlt } from 'react-icons/fa'
import { zenPalette } from '../../styles/zenPalette'
import { useTheme } from '../../contexts/ThemeContext'

const socialLinks = [
  { href: 'https://www.linkedin.com',    Icon: FaLinkedin,     label: 'LinkedIn' },
  { href: 'https://www.youtube.com',     Icon: FaYoutube,      label: 'YouTube' },
  { href: 'https://www.instagram.com',   Icon: FaInstagram,    label: 'Instagram' },
  { href: 'https://github.com',          Icon: FaGithub,       label: 'GitHub' },
  { href: 'https://stackoverflow.com',   Icon: FaStackOverflow,label: 'Stack Overflow' },
]

// ─── Theme tokens ─────────────────────────────────────────────────────────────

const T = {
  dark: {
    header:      '#0d0d0f',
    topBar:      '#0d0d0f',
    topBorder:   'rgba(255,255,255,0.07)',
    nav:         '#111114',
    navBorder:   'rgba(255,255,255,0.07)',
    brand:       '#d0cab8',
    tagline:     '#5e574e',
    social:      '#a09890',
    contact:     '#8a8078',
    pageLabel:   '#d0cbb8',
    guideText:   '#e6dfd0',
    guideBg:     'rgba(255,255,255,0.08)',
    guideBorder: 'rgba(255,255,255,0.2)',
    proText:     '#0d0d0f',
    proBg:       '#d0cbb8',
    proBorder:   '#d0cbb8',
    toggleText:  '#d0cbb8',
    toggleBg:    'rgba(255,255,255,0.04)',
    toggleBorder:'rgba(255,255,255,0.1)',
    shadow:      '0 2px 16px rgba(0,0,0,0.5)',
  },
  light: {
    header:      '#d9d4c5',
    topBar:      '#d9d4c5',
    topBorder:   'rgba(21,21,21,0.15)',
    nav:         '#d9d4c5',
    navBorder:   'rgba(21,21,21,0.15)',
    brand:       '#1a1a1a',
    tagline:     '#6a6355',
    social:      '#6a6355',
    contact:     '#6a6355',
    guideText:   '#1a1a1a',
    guideBg:     'rgba(21,21,21,0.08)',
    guideBorder: 'rgba(21,21,21,0.25)',
    proText:     '#e8e3d7',
    proBg:       '#3e362c',
    proBorder:   '#3e362c',
    pageLabel:   '#3e362c',
    toggleText:  '#4a4038',
    toggleBg:    'rgba(21,21,21,0.08)',
    toggleBorder:'rgba(21,21,21,0.25)',
    shadow:      '0 2px 12px rgba(0,0,0,0.12)',
  },
}

// ─── Component ────────────────────────────────────────────────────────────────

function MainNavbar() {
  const location   = useLocation()
  const { isDark, toggle } = useTheme()
  const t = isDark ? T.dark : T.light

  const isCustomizer = location.pathname === '/customizer'
  const isBuilder    = location.pathname === '/builder'

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 900 : false
  )
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 900)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 70, backgroundColor: t.header, boxShadow: t.shadow, transition: 'background 0.3s, box-shadow 0.3s' }} className="zo-nav-root">

      {/* ── Mobile header (logo + toggle only) ── */}
      {isMobile && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.9rem', minHeight: 52, backgroundColor: t.header, borderBottom: `1px solid ${t.topBorder}`, transition: 'background 0.3s' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <img src="/zenorbit-logo.svg" alt="ZenOrbit" style={{ width: 22, height: 22, objectFit: 'contain' }} />
            <span style={{ color: t.brand, fontFamily: '"IBM Plex Mono", monospace', fontSize: 12, fontWeight: 400, letterSpacing: '0.5px', transition: 'color 0.3s' }}>ZenOrbit</span>
          </Link>
          <ThemeBtn isDark={isDark} toggle={toggle} t={t} />
        </div>
      )}

      {/* ── Desktop top bar ── */}
      {!isMobile && (
        <div style={{ background: t.topBar, borderBottom: `1px solid ${t.topBorder}`, fontFamily: '"IBM Plex Mono", monospace', fontSize: 12, transition: 'background 0.3s' }} className="zo-nav-topbar">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }} className="zo-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
              {socialLinks.map(({ href, Icon, label }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
                  style={{ color: t.social, display: 'inline-flex', alignItems: 'center', textDecoration: 'none', transition: 'color 0.3s' }}>
                  <Icon size={13} />
                </a>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <a href="mailto:saghallo@denisbitter.de" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: t.contact, textDecoration: 'none', fontSize: 10, transition: 'color 0.3s' }}>
                <FaEnvelope size={10} /> saghallo@denisbitter.de
              </a>
              <a href="tel:+4915153231791" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: t.contact, textDecoration: 'none', fontSize: 10, transition: 'color 0.3s' }}>
                <FaPhoneAlt size={10} /> 0151 53 23 17 91
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── Main nav ── */}
      {!isMobile && (
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', background: t.nav, borderBottom: `1px solid ${t.navBorder}`, transition: 'background 0.3s' }} className="zo-nav-main zo-container">

          {/* Brand */}
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <img src="/zenorbit-logo.svg" alt="ZenOrbit Logo" style={{ width: 24, height: 24, objectFit: 'contain' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: t.brand, fontFamily: '"IBM Plex Mono", monospace', fontWeight: 400, fontSize: 12, letterSpacing: '0.5px', transition: 'color 0.3s' }}>
                  ZenOrbit
                </span>
                {isCustomizer && <span style={{ color: t.pageLabel, fontFamily: '"IBM Plex Mono", monospace', fontWeight: 600, fontSize: 12, letterSpacing: '0.04em', transition: 'color 0.3s' }}>Customizer</span>}
                {isBuilder    && <span style={{ color: t.pageLabel, fontFamily: '"IBM Plex Mono", monospace', fontWeight: 600, fontSize: 12, letterSpacing: '0.04em', transition: 'color 0.3s' }}>Builder</span>}
              </div>
      
            </div>
          </Link>

          {/* Inline slot (used by builder/customizer) */}
          <div id="zo-nav-inline-slot" style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }} />

          {/* Right actions */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <ThemeBtn isDark={isDark} toggle={toggle} t={t} />
            <Link to="/builder" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none', padding: '6px 14px', backgroundColor: t.guideBg, border: `1px solid ${t.guideBorder}`, borderRadius: 8, color: t.guideText, fontFamily: '"IBM Plex Mono", monospace', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', whiteSpace: 'nowrap', transition: 'background 0.3s, color 0.3s, border 0.3s' }}>
              Builder
            </Link>
            <Link to="/guide" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none', padding: '6px 14px', backgroundColor: t.guideBg, border: `1px solid ${t.guideBorder}`, borderRadius: 8, color: t.guideText, fontFamily: '"IBM Plex Mono", monospace', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', whiteSpace: 'nowrap', transition: 'background 0.3s, color 0.3s, border 0.3s' }}>
              Guide
            </Link>
            <Link to="/pro" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none', padding: '6px 14px', backgroundColor: t.proBg, border: `1px solid ${t.proBorder}`, borderRadius: 8, color: t.proText, fontFamily: '"IBM Plex Mono", monospace', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', whiteSpace: 'nowrap', transition: 'background 0.3s' }}>
              ✦ Pro
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}

// ─── Theme toggle button ──────────────────────────────────────────────────────

function ThemeBtn({ isDark, toggle, t }) {
  return (
    <button
      onClick={toggle}
      title={isDark ? 'Light Mode' : 'Dark Mode'}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, background: t.toggleBg, border: `1px solid ${t.toggleBorder}`, color: t.toggleText, cursor: 'pointer', flexShrink: 0, transition: 'background 0.3s, color 0.3s, border 0.3s' }}
    >
      {isDark ? <FaSun size={13} /> : <FaMoon size={13} />}
    </button>
  )
}

export default MainNavbar
