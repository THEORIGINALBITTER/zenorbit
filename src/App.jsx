import { Routes, Route, Navigate } from 'react-router-dom'
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

const navMenuItems = [
  { label: 'Start', route: '/' },
  { label: 'Builder', route: '/builder' },
  { label: 'Guide', route: '/guide' },
  { label: 'Custom', route: '/customizer' },
  { label: 'Pro', route: '/pro' },
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
    <div className="zo-app-shell">
      <MainNavbar />
      <main className="zo-app-main">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/builder" element={<BuilderPage />} />
          <Route path="/customizer" element={<CustomizerPage />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route path="/hilfe" element={<GuidePage />} />
          <Route path="/pro" element={<PricingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <MainFooter />
      <BitterButtonWithMenu
        logoSrc="/ZenLogo_B.png"
        logoAlt="ZenOrbit Navigation"
        mainMenuItems={navMenuItems}
        accentColor="#AC8E66"
        tooltipText="Navigation öffnen"
        config={navConfig}
      />
    </div>
  )
}

export default App
