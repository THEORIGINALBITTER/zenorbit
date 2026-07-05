import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './App.css'
import LandingPage from './pages/LandingPage'
import BuilderPage from './pages/BuilderPage'
import CustomizerPage from './pages/CustomizerPage'
import PricingPage from './pages/PricingPage'
import GuidePage from './pages/GuidePage'
import MainNavbar from './components/layout/MainNavbar'
import MainFooter from './components/layout/MainFooter'
import BitterButtonWithMenu from './components/BitterButtonWithMenu'
import { orbitMenuConfig } from './config/orbitMenuConfig'
import { ThemeProvider } from './contexts/ThemeContext'

function DesktopOnlyGate({ children }) {
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 900 : false
  )
  const [copied, setCopied] = useState(false)
  const url = typeof window !== 'undefined' ? window.location.href : ''
  const canShare = typeof navigator !== 'undefined' && !!navigator.share

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 900)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  const handleShare = () => {
    navigator.share({
      title: 'ZenOrbit Customizer',
      text: 'Öffne den ZenOrbit Signature Customizer am Desktop:',
      url,
    }).catch(() => {})
  }

  if (!isMobile) return children

  return (
    <div style={{
      minHeight: '80vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '2.5rem 1.25rem', textAlign: 'center',
      fontFamily: '"IBM Plex Mono", monospace',
    }}>
      {/* Icon */}
      <span style={{ fontSize: 16, fontFamily: 'serif', color: '#d0cbb8', lineHeight: 1, marginBottom: 20 }}>軌</span>

      <h2 style={{ fontSize: 17, 
        fontWeight: 700, marginBottom: 10, 
        letterSpacing: '-0.3px', 
        color: '#e8e3d7' }}>
        ZenOribt Customizer <br /> läuft auf Desktop
      </h2>
      <p style={{ fontSize: 11, color: '#d0cbb8', 
        lineHeight: 1.8, maxWidth: 280, 
        marginBottom: 32 }}>
        Präzises Feintuning braucht Platz.<br />
        Öffne diese URL am Laptop oder Desktop.
      </p>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280 }}>

        {/* Share — iOS AirDrop / Android */}
        {canShare && (
          <button
            onClick={handleShare}
            style={{
              padding: '13px 20px', borderRadius: 12,
              background: '#d0cbb8', color: '#0d0d0f',
              border: 'none', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', letterSpacing: '0.05em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <span style={{ fontSize: 16 }}></span>
            Teilen · AirDrop
          </button>
        )}

        {/* Copy URL */}
        <button
          onClick={handleCopy}
          style={{
            padding: '13px 20px', borderRadius: 12,
            background: copied ? 'rgba(47,111,78,0.25)' : 'rgba(208,203,184,0.1)',
            color: copied ? '#6fcf97' : '#d0cbb8',
            border: `1px solid ${copied ? 'rgba(47,111,78,0.5)' : 'rgba(208,203,184,0.2)'}`,
            fontSize: 12, fontWeight: 600,
            cursor: 'pointer', letterSpacing: '0.05em',
            transition: 'all 0.25s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >

          {copied ? 'URL kopiert!' : 'URL kopieren'}
        </button>

        {/* E-Mail */}
        <a
          href={`mailto:?subject=ZenOrbit%20Customizer&body=Öffne%20den%20Customizer%20am%20Desktop%3A%0A${encodeURIComponent(url)}`}
          style={{
            padding: '13px 20px', borderRadius: 12,
            background: 'transparent', color: '#8a8078',
            border: '1px solid rgba(208,203,184,0.12)',
            fontSize: 12, fontWeight: 600,
            cursor: 'pointer', letterSpacing: '0.05em', textDecoration: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
        
          Per E-Mail senden
        </a>
      </div>

      {/* Builder fallback */}
      <button
        onClick={() => navigate('/builder')}
        style={{
          marginTop: 32, background: 'none', border: 'none',
          color: '#d0cbb8', fontSize: 10, cursor: 'pointer',
          fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.06em',
          textDecoration: 'underline', textUnderlineOffset: 3,
        }}
      >
        Stattdessen Builder öffnen →
      </button>
    </div>
  )
}

const navMenuItems = [
  { id: 'start', label: 'Start', route: '/', tags: ['start', 'home', 'explore', 'overview'], audiences: ['guest'], intents: ['explore'] },
  { id: 'builder', label: 'Builder', route: '/builder', tags: ['builder', 'studio', 'manage', 'admin'], audiences: ['admin'], intents: ['manage'], mobilePriority: 10 },
  { id: 'guide', label: 'Guide', route: '/guide', newTab: true, tags: ['guide', 'hilfe', 'faq', 'support', 'learn'], audiences: ['guest', 'student', 'customer'], intents: ['support', 'learn'], mobilePriority: 24 },
  { id: 'custom', label: 'Custom', route: '/customizer', tags: ['customizer', 'export', 'manage', 'dashboard'], audiences: ['customer', 'admin'], intents: ['manage'], mobilePriority: 16 },
  { id: 'pro', label: 'Pro', route: '/pro', tags: ['pricing', 'buy', 'checkout', 'demo'], audiences: ['guest', 'customer'], intents: ['buy'], mobilePriority: 28 },
]

// Fixed config for nav button — never affected by builder's global state
const navConfig = {
  ...orbitMenuConfig,
  visual: {
    ...orbitMenuConfig.visual,
    radius: 118,
    button: { ...orbitMenuConfig.visual.button, width: 56, height: 56 },
  },
}

function App() {
  return (
    <ThemeProvider>
      <div className="zo-app-shell">
        <MainNavbar />
        <main className="zo-app-main">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/builder" element={<BuilderPage />} />
            <Route path="/customizer" element={<DesktopOnlyGate><CustomizerPage /></DesktopOnlyGate>} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="/hilfe" element={<GuidePage />} />
            <Route path="/pro" element={<PricingPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <MainFooter />
        <BitterButtonWithMenu
          logoAlt="ZenOrbit Navigation"
          mainMenuItems={navMenuItems}
          accentColor="#d0cbb8"
          tooltipText="Navigation öffnen"
          config={navConfig}
          adaptiveNavigation={{
            enabled: true,
            itemCatalog: navMenuItems,
            maxItems: 4,
          }}
        />
      </div>
    </ThemeProvider>
  )
}

export default App
