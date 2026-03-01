import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { zenPalette } from '../styles/zenPalette';
import SeoHelmet from '../components/seo/SeoHelmet';

const mono = '"IBM Plex Mono", monospace';

const navGroups = [
  {
    title: 'Getting Started',
    links: [
      { id: 'willkommen', label: 'Willkommen' },
      { id: 'erste-schritte', label: 'Erste Schritte' },
      { id: 'installation', label: 'Installation' },
    ],
  },
  {
    title: 'Arbeiten Mit ZenOrbit',
    links: [
      { id: 'ueberblick', label: 'Ueberblick' },
      { id: 'builder-flow', label: 'Builder Flow (3 Schritte)' },
      { id: 'customizer-flow', label: 'Customizer Flow' },
      { id: 'export-flow', label: 'Export & Integration' },
    ],
  },
  {
    title: 'Pro & SEO',
    links: [
      { id: 'pro-guide', label: 'ZenOrbit Pro' },
      { id: 'seo-guide', label: 'SEO Setup' },
      { id: 'troubleshooting', label: 'Troubleshooting' },
    ],
  },
];

const platformRows = [
  ['Landing', 'Produktseite mit Einstieg', 'CTA zum Builder, Guide und Pro'],
  ['Builder', 'Schneller 3-Step Workflow', 'Template -> Design -> Export'],
  ['Customizer', 'Detail-Feintuning', 'Animation, Radius, Farben, Submenus'],
  ['Guide', 'Schritt-fuer-Schritt Hilfe', 'Dokumentation direkt in der App'],
  ['Pro', 'Lizenz und Support', 'Kauf, Anfrage, Upgrade Informationen'],
];

export default function GuidePage() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 1080 : false
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1080);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div style={styles.page}>
      <SeoHelmet
        title="Guide"
        description="ZenOrbit Guide im Doku-Stil: Einstieg, Builder, Customizer, Export, Pro und SEO Setup."
        path="/guide"
        keywords="ZenOrbit Guide, ZenOrbit Hilfe, Builder Anleitung, Customizer Anleitung, SEO Setup"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: 'ZenOrbit Guide',
          description: 'Schritt-fuer-Schritt Anleitung fuer Builder, Customizer, Export und SEO.',
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
            <input style={styles.search} placeholder="Suche..." aria-label="Guide durchsuchen" />
            {navGroups.map((group) => (
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
          <section id="willkommen">
            <h1 style={styles.h1}>ZenOrbit Guide</h1>
            <p style={styles.intro}>
              So geht das: Von der ersten Vorlage im Builder bis zur sauberen Integration als React Komponente.
            </p>
            <div style={styles.quickActions}>
              <Link to="/builder" style={styles.actionBtn}>Builder starten</Link>
              <Link to="/customizer" style={styles.actionBtnGhost}>Customizer</Link>
              <Link to="/pro" style={styles.actionBtnGhost}>Pro</Link>
            </div>
          </section>

          <section id="erste-schritte">
            <h2 style={styles.h2}>Erste Schritte</h2>
            <div style={styles.rule} />
            <ol style={styles.list}>
              <li>Builder oeffnen und ein passendes Template auswaehlen.</li>
              <li>Farben, Radius und Menuepunkte im Editor anpassen.</li>
              <li>Live Vorschau pruefen und danach exportieren.</li>
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
            <h2 style={styles.h2}>Ueberblick</h2>
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
            <h2 style={styles.h2}>Builder Flow (3 Schritte)</h2>
            <div style={styles.rule} />
            <ol style={styles.list}>
              <li>Schritt 1: Template waehlen.</li>
              <li>Schritt 2: Design einstellen (Farben, Form, Label, Routen).</li>
              <li>Schritt 3: Export als React Code oder ZIP.</li>
            </ol>
          </section>

          <section id="customizer-flow">
            <h2 style={styles.h2}>Customizer Flow</h2>
            <div style={styles.rule} />
            <ul style={styles.list}>
              <li>Layout, Radius und Animation fuer Praezisions-Feintuning.</li>
              <li>Submenu-Strukturen und visuelle Details direkt pruefen.</li>
              <li>Snapshots nutzen, um Varianten schnell zu vergleichen.</li>
            </ul>
          </section>

          <section id="export-flow">
            <h2 style={styles.h2}>Export & Integration</h2>
            <div style={styles.rule} />
            <ul style={styles.list}>
              <li>Exportierte Dateien in dein React Projekt uebernehmen.</li>
              <li>Komponente importieren und im Zielscreen einsetzen.</li>
              <li>Routen pruefen, damit alle Menuepunkte korrekt navigieren.</li>
            </ul>
          </section>

          <section id="pro-guide">
            <h2 style={styles.h2}>ZenOrbit Pro</h2>
            <div style={styles.rule} />
            <p style={styles.p}>
              Pro aktiviert erweiterte Nutzung. Kauf und Kontakt laufen ueber die Pro-Seite.
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
            <h2 style={styles.h2}>Troubleshooting</h2>
            <div style={styles.rule} />
            <ul style={styles.list}>
              <li>404 auf direkter Route: `.htaccess` Deployment pruefen.</li>
              <li>Falsche Link-Preview: `VITE_SITE_URL` setzen.</li>
              <li>Build-Fehler lokal: `node_modules` neu installieren.</li>
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0e0f12 0%, #12141a 60%, #161921 100%)',
    color: zenPalette.text,
    fontFamily: mono,
  },
  shell: {
    display: 'grid',
    gridTemplateColumns: '320px 1fr',
    gap: 0,
    minHeight: 'calc(100vh - 120px)',
  },
  shellMobile: {
    gridTemplateColumns: '1fr',
  },
  sidebar: {
    position: 'sticky',
    top: 84,
    alignSelf: 'start',
    height: 'calc(100vh - 96px)',
    overflowY: 'auto',
    borderRight: `1px solid ${zenPalette.border}`,
    background: 'radial-gradient(circle at top left, #161924 0%, #0f1015 60%)',
    padding: '1.1rem 1rem',
  },
  sidebarBrand: {
    fontSize: 13,
    color: '#c5a37a',
    letterSpacing: '0.05em',
    fontWeight: 700,
    marginBottom: '0.8rem',
  },
  search: {
    width: '100%',
    boxSizing: 'border-box',
    borderRadius: 10,
    border: '1px solid #3b3228',
    background: '#13161f',
    color: zenPalette.text,
    padding: '0.5rem 0.7rem',
    fontSize: 12,
    marginBottom: '1rem',
    fontFamily: mono,
  },
  navGroup: {
    marginBottom: '1rem',
  },
  navTitle: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: '0.11em',
    color: '#8d826f',
    marginBottom: '0.5rem',
  },
  navList: {
    display: 'grid',
    gap: '0.35rem',
  },
  navItem: {
    color: '#d5d1c8',
    textDecoration: 'none',
    fontSize: 12,
    padding: '0.15rem 0',
    borderLeft: '1px solid transparent',
    paddingLeft: 8,
  },
  content: {
    background: '#d2c8b6',
    color: '#3e3b35',
    padding: '2.1rem clamp(1rem, 3vw, 2.5rem) 4rem',
  },
  h1: {
    margin: 0,
    fontSize: 'clamp(1.7rem, 4vw, 3rem)',
    fontWeight: 700,
    color: '#2d4a68',
    letterSpacing: '0.02em',
  },
  intro: {
    fontSize: 16,
    lineHeight: 1.65,
    maxWidth: 900,
    color: '#6b6456',
    marginTop: '1rem',
  },
  quickActions: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    marginTop: '1.1rem',
    marginBottom: '1.4rem',
  },
  actionBtn: {
    background: '#b49366',
    color: '#151515',
    textDecoration: 'none',
    border: '1px solid #8f724f',
    padding: '0.45rem 0.8rem',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
  },
  actionBtnGhost: {
    background: 'transparent',
    color: '#3e3b35',
    textDecoration: 'none',
    border: '1px solid #9d8e74',
    padding: '0.45rem 0.8rem',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
  },
  h2: {
    marginTop: '2rem',
    marginBottom: '0.55rem',
    fontSize: 'clamp(1.2rem, 2vw, 2rem)',
    color: '#2d4a68',
    letterSpacing: '0.02em',
  },
  rule: {
    width: '100%',
    height: 1,
    background: '#c2b398',
    marginBottom: '0.8rem',
  },
  p: {
    fontSize: 15,
    lineHeight: 1.5,
    color: '#5f584d',
    margin: 0,
  },
  list: {
    marginTop: 0,
    color: '#5f584d',
    fontSize: 15,
    lineHeight: 1.7,
    paddingLeft: '1.2rem',
  },
  codeBlock: {
    margin: '0.6rem 0',
    background: '#151821',
    color: '#e2d8c2',
    border: '1px solid #2d3342',
    borderRadius: 8,
    padding: '0.75rem',
    fontSize: 12,
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    border: '1px solid #b9a886',
    borderRadius: 10,
    overflow: 'hidden',
    background: '#d9cfbe',
    marginTop: '0.5rem',
  },
  tableWrap: {
    overflowX: 'auto',
  },
  th: {
    textAlign: 'left',
    fontSize: 12,
    color: '#79684f',
    background: '#b89d73',
    padding: '0.65rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid #ae9a76',
  },
  tdStrong: {
    padding: '0.65rem',
    borderBottom: '1px solid #c6b79c',
    borderRight: '1px solid #c6b79c',
    fontSize: 14,
    color: '#3d3a34',
    fontWeight: 700,
    verticalAlign: 'top',
  },
  td: {
    padding: '0.65rem',
    borderBottom: '1px solid #c6b79c',
    borderRight: '1px solid #c6b79c',
    fontSize: 14,
    color: '#5f584d',
    verticalAlign: 'top',
  },
  inlineLink: {
    color: '#2d4a68',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 700,
  },
};
