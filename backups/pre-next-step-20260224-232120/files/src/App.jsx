import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import BuilderPage from './pages/BuilderPage'
import CustomizerPage from './pages/CustomizerPage'
import MainNavbar from './components/layout/MainNavbar'
import MainFooter from './components/layout/MainFooter'
import BitterButtonWithMenu from './components/BitterButtonWithMenu'
import { orbitMenuConfig } from './config/orbitMenuConfig'

const navMenuItems = [
  { label: 'Start', angle: 0, route: '/' },
  { label: 'Builder', angle: -90, route: '/builder' },
  { label: 'Custom', angle: 180, route: '/customizer' },
]

// Fixed config for nav button — never affected by builder's global state
const navConfig = {
  ...orbitMenuConfig,
  visual: {
    ...orbitMenuConfig.visual,
    radius: 100,
    button: { ...orbitMenuConfig.visual.button, width: 56, height: 56 },
  },
}

function App() {
  return (
    <>
      <MainNavbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/builder" element={<BuilderPage />} />
        <Route path="/customizer" element={<CustomizerPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <MainFooter />
      <BitterButtonWithMenu
        logoSrc="/ZenLogo_B.png"
        logoAlt="ZenOrbit Navigation"
        mainMenuItems={navMenuItems}
        accentColor="#AC8E66"
        tooltipText="Navigation öffnen"
        config={navConfig}
      />
    </>
  )
}

export default App
