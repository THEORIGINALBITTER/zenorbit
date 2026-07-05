import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaSun, FaMoon, FaLinkedin, FaGithub, FaInstagram, FaYoutube, FaStackOverflow, FaEnvelope, FaPhoneAlt } from 'react-icons/fa'

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
    nav:         '#1a1a1a',
    navBorder:   'rgba(255,255,255,0.07)',
    brand:       '#d0cab8',
    tagline:     '#5e574e',
    social:      '#a09890',
    contact:     '#d0cbb8',
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
    tagline:     '#d0cbb8',
    social:      '#d0cbb8',
    contact:     '#d0cbb8',
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

      {/* ── Mobile header: Logo + Theme only — Navigation via Orbit Menu ── */}
      {isMobile && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.9rem', minHeight: 48, backgroundColor: t.header, borderBottom: `1px solid ${t.topBorder}`, transition: 'background 0.3s' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <span style={{ fontSize: 18, fontFamily: 'serif', color: t.brand, lineHeight: 1, userSelect: 'none' }}>軌</span>
            <span style={{ color: t.brand, fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, fontWeight: 400, letterSpacing: '0.5px', transition: 'color 0.3s' }}>ZenOrbit</span>
          </Link>
          <ThemeBtn isDark={isDark} toggle={toggle} t={t} />
        </div>
      )}

      {/* ── Desktop top bar ── */}
      {!isMobile && (
        <div style={{ background: '#1a1a1a', 
        fontFamily: '"IBM Plex Mono", monospace', 
        fontSize: 12, transition: 'background 0.3s' }} 
        className="zo-nav-topbar">
          <div style={{ display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: '10px',
            alignItems: 'center', gap: '1rem' }} className="zo-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
              {socialLinks.map(({ href, Icon, label }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
                  style={{ color: t.social, display: 'inline-flex', alignItems: 'center', textDecoration: 'none', transition: 'color 0.3s' }}>
                  <Icon size={13} />
                </a>
              ))}
            </div>
            <div style={{ display: 'flex', 
              alignItems: 'center', 
              gap: '0.9rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <a href="mailto:saghallo@denisbitter.de" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: t.contact, textDecoration: 'none', fontSize: 10, transition: 'color 0.3s' }}>
                <FaEnvelope size={10} /> saghallo@denisbitter.de
              </a>
              <a href="tel:+4915153231791" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, 
                color: t.contact, textDecoration: 'none', fontSize: 10, transition: 'color 0.3s' }}>
                <FaPhoneAlt size={10} /> 0151 53 23 17 91
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── Main nav ── */}
      {!isMobile && (
        <div style={{ background: t.nav,  transition: 'background 0.3s' }}>
          <nav style={{ display: 'flex', alignItems: 'center', 
          justifyContent: 'space-between', gap: '1rem' }} 
          className="zo-nav-main zo-container">

            {/* Brand */}
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
              <span style={{ fontSize: 22, fontFamily: 'serif', color: t.brand, lineHeight: 1, userSelect: 'none', transition: 'color 0.3s' }}>軌</span>
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
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <ThemeBtn isDark={isDark} toggle={toggle} t={t} />
            
            </div>
          </nav>
        </div>
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
