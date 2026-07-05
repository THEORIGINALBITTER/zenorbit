import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SeoHelmet from '../components/seo/SeoHelmet';
import { useTheme } from '../contexts/ThemeContext';

const mono = '"IBM Plex Mono", monospace';

const dark = {
  pageBg: 'linear-gradient(180deg, #0e0f12 0%, #12141a 60%, #161921 100%)',
  shellBg: '#111319',
  sidebarBg: 'radial-gradient(circle at top left, #161924 0%, #0f1015 60%)',
  contentBg: '#16181f',
  panelBg: '#1b1e26',
  panelSoft: '#14171d',
  border: '#2b2f38',
  borderStrong: '#3a3f4c',
  text: '#ddd6c8',
  textMuted: '#a9a191',
  textDim: '#7b7264',
  heading: '#f2ebde',
  gold: '#b49366',
  goldSoft: 'rgba(180, 147, 102, 0.16)',
  buttonText: '#151515',
  link: '#d4ae7e',
  codeBg: '#101319',
  codeBorder: '#2d3342',
  codeText: '#e2d8c2',
};

const light = {
  pageBg: 'linear-gradient(180deg, #efe9dc 0%, #e8e1d4 58%, #e2dacb 100%)',
  shellBg: '#e7dfd1',
  sidebarBg: 'linear-gradient(180deg, #ddd5c7 0%, #d4ccbd 100%)',
  contentBg: '#f3ede2',
  panelBg: '#e1d8ca',
  panelSoft: '#ebe4d8',
  border: 'rgba(31, 26, 18, 0.14)',
  borderStrong: 'rgba(31, 26, 18, 0.22)',
  text: '#2f291f',
  textMuted: '#605648',
  textDim: '#857867',
  heading: '#1a1710',
  gold: '#8e7657',
  goldSoft: 'rgba(142, 118, 87, 0.14)',
  buttonText: '#f7f1e6',
  link: '#6f5332',
  codeBg: '#1a1c22',
  codeBorder: '#343847',
  codeText: '#efe7dc',
};

const navGroups = [
  {
    title: 'Signature Start',
    links: [
      { id: 'willkommen', label: 'Willkommen' },
      { id: 'erste-schritte', label: 'Signature Einstieg' },
      { id: 'installation', label: 'Environment Setup' },
    ],
  },
  {
    title: 'Product Flow',
    links: [
      { id: 'ueberblick', label: 'Ueberblick' },
      { id: 'builder-flow', label: 'Builder Flow' },
      { id: 'customizer-flow', label: 'Customizer Refinement' },
      { id: 'export-flow', label: 'Delivery & Integration' },
    ],
  },
  {
    title: 'Commercial',
    links: [
      { id: 'pro-guide', label: 'ZenOrbit Pro' },
      { id: 'seo-guide', label: 'SEO Setup' },
      { id: 'troubleshooting', label: 'Operations' },
    ],
  },
  {
    title: 'AI Generator',
    links: [
      { id: 'ai-provider', label: 'AI Provider Setup' },
      { id: 'ai-claude', label: 'Claude (Anthropic)' },
      { id: 'ai-openai', label: 'OpenAI' },
      { id: 'ai-ollama', label: 'Ollama (lokal)' },
      { id: 'ai-custom', label: 'Custom API' },
    ],
  },
];

const platformRows = [
  ['Landing', 'Brand Entry Surface', 'Direkter Zugang zu Builder, Guide und Pro'],
  ['Builder', 'Signature Composition', 'Template -> Design -> Delivery'],
  ['Customizer', 'Precision Refinement', 'Motion, Radius, Palette, Submenus'],
  ['Guide', 'Operational Standard', 'Playbook direkt in der App'],
  ['Pro', 'Commercial Layer', 'Lizenz, Anfrage, Upgrade-Rahmen'],
];

export default function GuidePage() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 1080 : false
  );
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const { isDark } = useTheme();
  const p = isDark ? dark : light;
  const styles = createStyles(p, isMobile);
  const isHelpRoute = location.pathname === '/hilfe';
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredNavGroups = normalizedQuery
    ? navGroups
      .map((group) => ({
        ...group,
        links: group.links.filter((link) => link.label.toLowerCase().includes(normalizedQuery)),
      }))
      .filter((group) => group.links.length > 0)
    : navGroups;
  const flatFilteredLinks = filteredNavGroups.flatMap((group) => group.links);

  const handleSearchKeyDown = (event) => {
    if (event.key !== 'Enter') return;
    const first = flatFilteredLinks[0];
    if (!first) return;
    const target = document.getElementById(first.id);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1080);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div style={styles.page}>
      <SeoHelmet
        title={isHelpRoute ? 'Hilfe' : 'Guide'}
        description="ZenOrbit Signature Guide: Product Flow, Delivery Standard, Pro Layer, SEO und AI-Provider Setup."
        path={isHelpRoute ? '/hilfe' : '/guide'}
        type="website"
        canonicalPath="/guide"
        robots={isHelpRoute ? 'noindex,follow' : 'index,follow'}
        keywords="ZenOrbit Guide, Signature Guide, Product Flow, Delivery Standard, SEO Setup, AI Provider Setup"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: 'ZenOrbit Guide',
          description: 'Operational Guide fuer Signature Composition, Refinement, Delivery und SEO.',
          step: [
            'Builder oeffnen',
            'Template waehlen',
            'Design anpassen',
            'Customizer Feintuning',
            'Code exportieren',
          ].map((step) => ({
            '@type': 'HowToStep',
            name: step,
            text: step,
          })),
        }}
      />

      <div style={{ ...styles.shell, ...(isMobile ? styles.shellMobile : {}) }}>
        {!isMobile && (
          <aside style={styles.sidebar}>
            <div style={styles.sidebarBrand}>ZenOrbit - Studio</div>
            <input
              style={styles.search}
              placeholder="Suche..."
              aria-label="Guide durchsuchen"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            {filteredNavGroups.map((group) => (
              <div key={group.title} style={styles.navGroup}>
                <div style={styles.navTitle}>{group.title}</div>
                <div style={styles.navList}>
                  {group.links.map((link) => (
                    <a key={link.id} href={`#${link.id}`} style={styles.navItem}>
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </aside>
        )}

        <main style={styles.content}>
          {isMobile && (
            <section style={styles.mobileToc}>
              <div style={styles.mobileTocTitle}>Signature Navigation</div>
              <input
                style={{ ...styles.search, marginBottom: '0.7rem', padding: '0.55rem 0.65rem' }}
                placeholder="Suche..."
                aria-label="Guide durchsuchen"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
              <div style={styles.mobileTocList}>
                {flatFilteredLinks.map((link) => (
                  <a key={link.id} href={`#${link.id}`} style={styles.mobileTocItem}>
                    {link.label}
                  </a>
                ))}
              </div>
            </section>
          )}

          <section id="willkommen">
            <h1 style={styles.h1}>ZenOrbit Signature Guide</h1>
            <p style={styles.intro}>
              Das operative System für ZenOrbit: von Brand Direction bis zur produktionsreifen Integration.
            </p>
        
          </section>

          <section id="erste-schritte">
            <h3 style={styles.h2}>Signature Einstieg</h3>
            <div style={styles.rule} />
            <ol style={styles.list}>
              <li>Wähle im Builder eine Basis, die zur Markenarchitektur passt.</li>
              <li>Definiere Form, Rhythmus und Label-Logik als konsistente Signatur.</li>
              <li>Validiere im Live-Preview und überführe in den Delivery-Export.</li>
            </ol>
          </section>

          <section id="installation">
            <h2 style={styles.h2}>Installation</h2>
            <div style={styles.rule} />
            <pre style={styles.codeBlock}><code>npm install{'\n'}npm run dev</code></pre>
            <p style={styles.p}>Optional fuer SEO mit absoluten URLs:</p>
            <pre style={styles.codeBlock}><code>VITE_SITE_URL=https://zenorbit.denisbitter.de</code></pre>
          </section>

          <section id="ueberblick">
            <h2 style={styles.h2}>System Ueberblick</h2>
            <div style={styles.rule} />
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Bereich</th>
                    <th style={styles.th}>Beschreibung</th>
                    <th style={styles.th}>Besonderheiten</th>
                  </tr>
                </thead>
                <tbody>
                  {platformRows.map((row) => (
                    <tr key={row[0]}>
                      <td style={styles.tdStrong}>{row[0]}</td>
                      <td style={styles.td}>{row[1]}</td>
                      <td style={styles.td}>{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="builder-flow">
            <h2 style={styles.h2}>Builder Flow</h2>
            <div style={styles.rule} />
            <ol style={styles.list}>
              <li>Brand Direction: Template und Navigationsstruktur definieren.</li>
              <li>Signature Design: Form, Typografie, Motion und Label-System schärfen.</li>
              <li>Production Delivery: React-Code oder ZIP für Integration exportieren.</li>
            </ol>
          </section>

          <section id="customizer-flow">
            <h2 style={styles.h2}>Customizer Refinement</h2>
            <div style={styles.rule} />
            <ul style={styles.list}>
              <li>Präzise Kontrolle über Radius, Motion, Offsets und Kontrastverhalten.</li>
              <li>Submenu-Logik und visuelle Gewichtung im Kontext verifizieren.</li>
              <li>Signature Snapshots für Variantenvergleich und konsistente Iteration.</li>
            </ul>
          </section>

          <section id="export-flow">
            <h2 style={styles.h2}>Delivery & Integration</h2>
            <div style={styles.rule} />
            <ul style={styles.list}>
              <li>Export Assets in dein React-Produktionsprojekt übernehmen.</li>
              <li>Komponente einbinden und als festen Navigations-Layer ausrollen.</li>
              <li>Routen und Actions final prüfen, bevor das Release live geht.</li>
            </ul>
          </section>

          <section id="pro-guide">
            <h2 style={styles.h2}>ZenOrbit Pro</h2>
            <div style={styles.rule} />
            <p style={styles.p}>
              Pro öffnet den Commercial Layer: Lizenzrahmen, Prioritäts-Support und individuelle Delivery-Begleitung.
            </p>
            <Link to="/pro" style={styles.inlineLink}>Zur Pro Seite</Link>
          </section>

          <section id="seo-guide">
            <h2 style={styles.h2}>SEO Setup</h2>
            <div style={styles.rule} />
            <ul style={styles.list}>
              <li>Route-spezifische Meta-Daten ueber `SeoHelmet`.</li>
              <li>`robots.txt` und `sitemap.xml` liegen in `public/`.</li>
              <li>Server-Rewrite liefert route-spezifische HTML-Einstiege aus.</li>
            </ul>
          </section>

          <section id="troubleshooting">
            <h2 style={styles.h2}>Operations</h2>
            <div style={styles.rule} />
            <ul style={styles.list}>
              <li>404 auf direkter Route: `.htaccess` Deployment pruefen.</li>
              <li>Falsche Link-Preview: `VITE_SITE_URL` setzen.</li>
              <li>Build-Fehler lokal: `node_modules` neu installieren.</li>
            </ul>
          </section>

          {/* ── AI Provider Setup ───────────────────────────────────── */}
          <section id="ai-provider" style={{ marginTop: '2.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#d0cbb822', border: '1px solid #d0cbb866', borderRadius: 99, padding: '4px 12px', fontSize: 10, color: '#8f7249', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.6rem' }}>
              AI Generator
            </div>
            <h2 style={{ ...styles.h2, marginTop: 0 }}>AI Provider Setup</h2>
            <div style={styles.rule} />
            <p style={styles.p}>
              Der AI Layer übersetzt strategische Prompts in belastbare Orbit-Strukturen.
              Wähle den Provider, der zu deiner Delivery-Umgebung und Qualitätsanforderung passt.
            </p>
          </section>

          {[
            {
              id: 'ai-claude',
              name: 'Claude (Anthropic)',
              color: '#C8A96E',
              steps: [
                { title: 'Account Foundation', desc: 'Richte den Zugriff über console.anthropic.com ein.' },
                { title: 'Key Provisioning', desc: 'Erzeuge unter "API Keys" einen neuen Key und sichere ihn sofort.' },
                { title: 'Provider Mapping', desc: 'Im Builder: AI-Provider konfigurieren -> Claude (Anthropic).' },
                { title: 'Credential Binding', desc: 'Hinterlege den Key im Feld "API Key".' },
                { title: 'Model Profile', desc: 'Empfohlen: Sonnet für maximale Qualität, Haiku für schnelle Iterationen.' },
                { title: 'Endpoint Policy', desc: 'Endpoint leer lassen, ZenOrbit setzt den Anthropic-Standard automatisch.' },
              ],
              hint: 'Starker Qualitätsstandard für anspruchsvolle Informationsarchitekturen.',
            },
            {
              id: 'ai-openai',
              name: 'OpenAI',
              color: '#74AA9C',
              steps: [
                { title: 'Account Foundation', desc: 'Zugang über platform.openai.com aktivieren.' },
                { title: 'Key Provisioning', desc: 'Einen Secret Key erstellen und sicher verwahren.' },
                { title: 'Billing Readiness', desc: 'Abrechnung aktivieren, damit produktive Requests stabil laufen.' },
                { title: 'Provider Mapping', desc: 'Im Builder den Provider OpenAI wählen.' },
                { title: 'Model Strategy', desc: 'gpt-4o für Premium-Qualität, gpt-4o-mini für effiziente Produktion.' },
                { title: 'Endpoint Policy', desc: 'Endpoint leer lassen, ZenOrbit verwendet den offiziellen Standard.' },
              ],
              hint: 'Ausgewogene Option für Qualität, Geschwindigkeit und Skalierung.',
            },
            {
              id: 'ai-ollama',
              name: 'Ollama (lokal)',
              color: '#7EB8D4',
              steps: [
                { title: 'Voraussetzung', desc: 'macOS-Computer mit installiertem Ollama (ollama.com/download). Internet für den ngrok-Tunnel erforderlich.' },
                { title: 'Setup Installer', desc: 'Im Builder AI-Einstellungen öffnen → Provider Ollama wählen → im Fehler-Overlay „ZenOrbit Ollama Setup herunterladen (.pkg)" klicken und den Installer öffnen.' },
                { title: 'Session starten', desc: '„ZenOrbit Ollama Start" auf dem Desktop per Doppelklick öffnen. Terminal startet automatisch, Ollama und ngrok-Tunnel werden hochgefahren.' },
                { title: 'URL kopieren', desc: 'Die im Terminal angezeigte https://…ngrok-free.app/v1/chat/completions URL kopieren.' },
                { title: 'Provider konfigurieren', desc: 'Im Builder: Provider → Custom API, kopierte URL als Endpoint eintragen. API-Key leer lassen.' },
                { title: 'Model Binding', desc: 'Den Modellnamen eintragen, der beim Start geladen wurde — z. B. llama3.2:3b.' },
              ],
              hint: 'Free-URL ändert sich bei jedem Neustart — Endpoint nach jeder neuen Session aktualisieren. Keine API-Kosten, volle lokale Datenkontrolle.',
            },
            {
              id: 'ai-custom',
              name: 'Custom API',
              color: '#A889C8',
              steps: [
                { title: 'Provider Mapping', desc: 'Im Builder den Provider Custom API auswählen.' },
                { title: 'Endpoint Binding', desc: 'Vollständige Endpoint-URL deiner Zielplattform hinterlegen.' },
                { title: 'Protocol Fit', desc: 'API-Style passend wählen: OpenAI-kompatibel oder Anthropic.' },
                { title: 'Credential Binding', desc: 'API-Key des Anbieters hinterlegen, falls erforderlich.' },
                { title: 'Model Binding', desc: 'Exakte Model-ID des gewünschten Runtime-Profils eintragen.' },
              ],
              hint: 'Ideal für Enterprise-Gateways und proprietäre Provider-Stacks.',
            },
          ].map((provider) => (
            <section key={provider.id} id={provider.id} style={{ marginTop: '1.8rem' }}>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: 'clamp(1rem, 1.5vw, 1.35rem)', color: provider.color, fontWeight: 700, letterSpacing: '0.02em' }}>
                {provider.name}
              </h3>
              <div style={styles.rule} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 10, marginBottom: '0.8rem' }}>
                {provider.steps.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: isMobile ? 10 : 12, alignItems: 'flex-start' }}>
                    <div style={{
                      flexShrink: 0, width: isMobile ? 24 : 26, height: isMobile ? 24 : 26, borderRadius: '50%',
                      background: provider.color + '22', color: provider.color,
                      fontSize: 10, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: `1px solid ${provider.color}44`,
                    }}>{i + 1}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: isMobile ? 12 : 13, fontWeight: 700, color: p.heading, marginBottom: 2 }}>{step.title}</div>
                      <div style={{ fontSize: isMobile ? 12 : 13, color: p.textMuted, lineHeight: 1.55, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: provider.color + '14', border: `1px solid ${provider.color}44`, borderRadius: 8, padding: '0.6rem 0.8rem', fontSize: 12, color: p.textMuted, lineHeight: 1.5 }}>
                Note: {provider.hint}
              </div>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}

const createStyles = (p, isMobile) => ({
  page: {
    minHeight: '100vh',
    background: p.pageBg,
    color: p.text,
    fontFamily: mono,
    overflowX: 'hidden',
  },
  shell: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '280px 1fr',
    gap: 0,
    minHeight: 'calc(100vh - 120px)',
    maxWidth: 1440,
    width: '100%',
    margin: '0 auto',
    background: p.shellBg,
    boxShadow: isMobile ? 'none' : '0 28px 60px rgba(0,0,0,0.08)',
  },
  shellMobile: {
    gridTemplateColumns: '1fr',
  },
  sidebar: {
    position: 'sticky',
    top: 0,
    alignSelf: 'start',
    height: 'calc(100vh)',
    overflowY: 'auto',
    borderRight: `1px solid ${p.border}`,

    padding: '1.15rem 1rem 1.4rem',
  },
  sidebarBrand: {
    fontSize: 13,
    color: p.gold,
    letterSpacing: '0.08em',
    fontWeight: 100,
    marginBottom: '0.9rem',
    textTransform: 'uppercase',
  },
  search: {
    width: '100%',
    boxSizing: 'border-box',
    borderRadius: 10,
    border: `1px solid ${p.borderStrong}`,
    background: p.panelSoft,
    color: p.text,
    padding: '0.6rem 0.75rem',
    fontSize: 10,
    marginBottom: '1rem',
    fontFamily: mono,
    fontWeight: '200',
  },
  navGroup: {
    marginBottom: '1rem',
  },
  navTitle: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: '0.11em',
    color: p.textDim,
    marginBottom: '0.5rem',
  },
  navList: {
    display: 'grid',
    gap: '0.35rem',
  },
  navItem: {
    color: p.textMuted,
    textDecoration: 'none',
    fontSize: 12,
    padding: '0.32rem 0.55rem',
    borderLeft: `2px solid transparent`,
    borderRadius: 6,
  },
  content: {
    background: p.contentBg,
    color: p.text,
    minWidth: 0,
    padding: isMobile
      ? '1.2rem 0.9rem 2.5rem'
      : '2.25rem clamp(1rem, 3vw, 2.75rem) 4.5rem',
  },
  mobileToc: {
    marginBottom: '1.1rem',
    padding: '0.7rem',
    border: `1px solid ${p.borderStrong}`,
    borderRadius: 10,
    background: p.panelSoft,
  },
  mobileTocTitle: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: p.textDim,
    marginBottom: '0.55rem',
  },
  mobileTocList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  mobileTocItem: {
    textDecoration: 'none',
    color: p.textMuted,
    border: `1px solid ${p.border}`,
    borderRadius: 999,
    fontSize: 11,
    padding: '0.32rem 0.55rem',
    whiteSpace: 'nowrap',
  },
  h1: {
    margin: 0,
    fontSize: 'clamp(0.8rem, 2vw, 2.5rem)',
    fontWeight: 400,
    color: p.heading,
    letterSpacing: '0.02em',
  },
  intro: {
    fontSize: isMobile ? 10 : 11,
    lineHeight: 1.65,
    maxWidth: 900,
    color: p.textMuted,
    marginTop: '0.3rem',
  },
  quickActions: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    marginTop: '1.1rem',
    marginBottom: '1.4rem',
  },
  actionBtn: {
    background: p.gold,
    color: p.buttonText,
    textDecoration: 'none',
    border: `1px solid ${p.gold}`,
    padding: '0.55rem 0.95rem',
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 700,
  },
  actionBtnGhost: {
    background: p.goldSoft,
    color: p.text,
    textDecoration: 'none',
    border: `1px solid ${p.borderStrong}`,
    padding: '0.55rem 0.95rem',
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 700,
  },
  h2: {
    marginTop: '2rem',
    marginBottom: '0.55rem',
    fontSize: 'clamp(1rem, 1vw, 1.5rem)',
    color: p.heading,
    letterSpacing: '0.02em',
    fontWeight: 100,
  },
  rule: {
    width: '100%',
    height: 1,
    background: p.borderStrong,
    marginBottom: '0.95rem',
  },
  p: {
    fontSize: isMobile ? 11 : 12,
    lineHeight: 1.65,
    color: p.textMuted,
    margin: 0,
  },
  list: {
    marginTop: 0,
    color: p.textMuted,
    fontSize: isMobile ? 11 : 12,
    lineHeight: 1.7,
    paddingLeft: '1.2rem',
  },
  codeBlock: {
    margin: '0.6rem 0',
    background: p.codeBg,
    color: p.codeText,
    border: `1px solid ${p.codeBorder}`,
    borderRadius: 10,
    padding: isMobile ? '0.6rem 0.7rem' : '0.85rem 0.95rem',
    fontSize: isMobile ? 10 : 12,
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    border: `1px solid ${p.borderStrong}`,
    borderRadius: 12,
    overflow: 'hidden',
    background: p.panelBg,
    marginTop: '0.5rem',
  },
  tableWrap: {
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
  th: {
    textAlign: 'left',
    fontSize: isMobile ? 10 : 11,
    color: p.heading,
    background: p.goldSoft,
    padding: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: `1px solid ${p.borderStrong}`,
    fontWeight: 600,
  },
  tdStrong: {
    padding: '0.75rem',
    borderBottom: `1px solid ${p.border}`,
    borderRight: `1px solid ${p.border}`,
    fontSize: isMobile ? 10 : 11,
    color: p.text,
    fontWeight: 700,
    verticalAlign: 'top',
  },
  td: {
    padding: '0.75rem',
    borderBottom: `1px solid ${p.border}`,
    borderRight: `1px solid ${p.border}`,
    fontSize: isMobile ? 10 : 11,
    color: p.textMuted,
    verticalAlign: 'top',
  },
  inlineLink: {
    color: p.link,
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 700,
  },
});
