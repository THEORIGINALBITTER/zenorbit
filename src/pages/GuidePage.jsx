import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SeoHelmet from '../components/seo/SeoHelmet';
import { useTheme } from '../contexts/ThemeContext';
import { OFFERS } from '../config/offers';

const mono = '"IBM Plex Mono", monospace';

// Erkennt volle URLs sowie bekannte nackte Domains in Setup-Texten
// (z. B. "console.x.ai") und verwandelt sie in klickbare Links.
const LINK_PATTERN = /(https?:\/\/[^\s,)]+)|(\b(?:console\.x\.ai|console\.anthropic\.com|platform\.openai\.com|ollama\.com\/download)\b)/g;

function linkify(text, linkColor) {
  if (typeof text !== 'string') return text;
  const parts = [];
  let lastIndex = 0;
  let match;
  LINK_PATTERN.lastIndex = 0;
  while ((match = LINK_PATTERN.exec(text))) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    const raw = match[0];
    const href = raw.startsWith('http') ? raw : `https://${raw}`;
    parts.push(
      <a
        key={match.index}
        href={href}
        target="_blank"
        rel="noreferrer"
        style={{ color: linkColor, textDecoration: 'underline', textUnderlineOffset: 2 }}
      >
        {raw}
      </a>
    );
    lastIndex = match.index + raw.length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

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
      { id: 'installation', label: 'Export einbinden' },
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
    title: 'Delivery Studio',
    links: [
      { id: 'delivery-html', label: 'HTML' },
      { id: 'delivery-react', label: 'React' },
      { id: 'delivery-css', label: 'CSS' },
      { id: 'delivery-json', label: 'JSON' },
    ],
  },
  {
    title: 'Support',
    links: [
      { id: 'pro-guide', label: 'ZenOrbit Pro' },
      { id: 'troubleshooting', label: 'Häufige Fragen' },
    ],
  },
  {
    title: 'AI Generator',
    links: [
      { id: 'ai-provider', label: 'AI Provider Setup' },
      { id: 'ai-claude', label: 'Claude (Anthropic)' },
      { id: 'ai-openai', label: 'OpenAI' },
      { id: 'ai-grok', label: 'xAI Grok' },
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

const BUILDER_FLOW_STEPS = [
  { title: 'Mit KI bauen (optional)', desc: 'Markencharakter im AI-Generator beschreiben und „Mit KI bauen" klicken — ZenOrbit übersetzt ihn in eine erste Orbit-Struktur.' },
  { title: 'Vorlage wählen', desc: 'Eine Signature-Vorlage als gestalterische Basis wählen oder „Ohne Vorgabe starten" für einen leeren Entwurf.' },
  { title: 'Menüelemente bearbeiten', desc: 'Im Schritt „Signature Design" Label, Route und Winkel jedes Elements festlegen; per Visual Angle Adjuster fein justieren.' },
  { title: 'Logo & Design verfeinern', desc: 'Bild- oder Text-Logo hinterlegen, Farbe, Schrift und Größe einstellen; Radius, Motion und Farbpalette im Design-Panel anpassen.' },
  { title: 'Adaptive Intent testen (optional)', desc: 'Kontext-Szenarien simulieren (Rolle, Intent, Gerät) und die passende Decision direkt als Menü übernehmen.' },
  { title: 'Production Export', desc: 'Export-Modus wählen (Tailwind, Pure CSS oder HTML-Standalone) und das fertige Delivery-Paket herunterladen.' },
];

const DELIVERY_FORMATS = [
  {
    id: 'delivery-html',
    name: 'HTML',
    color: '#8A9AA8',
    description: 'Ein eigenständiges Paket ohne React- oder Build-Abhängigkeit: index.html, ein Bundle-Setup (orbit.iife.js) und eine README mit Installationsschritten.',
    usage: 'Statische Websites, CMS-Umgebungen (WordPress, Webflow-Embed) oder jedes Projekt ohne eigenen React-Build. Enthalten ab Studio als vollständig branding-freies Delivery-Paket.',
  },
  {
    id: 'delivery-react',
    name: 'React',
    color: '#74AA9C',
    description: 'Eine fertige React-Komponente (Tailwind- oder Pure-CSS-Variante, je nach Einstellung) mit deiner kompletten Konfiguration — Menüelemente, Farben, Motion.',
    usage: 'Direkte Integration in ein bestehendes React-Projekt. Benötigt framer-motion als Abhängigkeit, siehe Delivery & Integration oben.',
  },
  {
    id: 'delivery-css',
    name: 'CSS',
    color: '#A889C8',
    description: 'Dieselbe Komponente wie beim React-Export, aber mit eigenständigem CSS statt Tailwind-Klassen.',
    usage: 'Projekte ohne Tailwind-Setup, z. B. Tauri-Apps oder React-Codebasen mit eigenem Styling-System.',
  },
  {
    id: 'delivery-json',
    name: 'JSON',
    color: '#C8A96E',
    description: 'Ein vollständiger Snapshot deiner Navigation als JSON: Menüelemente, Farben, Motion-Werte und Adaptive-Intent-Regeln — kein Code, nur Konfiguration.',
    usage: 'Entwürfe sichern, zwischen Builder und Customizer übertragen oder mit anderen teilen. Import ist ab Creator verfügbar.',
  },
];

const EXPORT_FLOW_STEPS = [
  { title: 'Paket entpacken', desc: 'Das heruntergeladene ZIP entpacken und in dein Projekt kopieren, z. B. nach src/components/.' },
  { title: 'Abhängigkeiten installieren', desc: 'npm install framer-motion ausführen — Details stehen zusätzlich im README innerhalb des Exports.' },
  { title: 'Komponente einbinden', desc: 'Die Navigation importieren und einmalig im App-Layout platzieren, typischerweise außerhalb des eigentlichen Routen-Contents.' },
  { title: 'Routen & Actions verbinden', desc: 'Menüpunkte auf die echten Routen bzw. Aktionen deines Projekts abbilden und im Live-Betrieb testen.' },
  { title: 'Barrierefreiheit prüfen', desc: 'Tastaturbedienung, reduzierte Bewegung und deine Zielgeräte vor dem Go-Live verifizieren.' },
  { title: 'Release', desc: 'Nach finaler Prüfung ausrollen — die Navigation läuft eigenständig in deinem Projekt, ohne Abhängigkeit zu ZenOrbit.' },
];

function StepList({ steps, color, isMobile, headingColor, textColor }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 10 }}>
      {steps.map((step, i) => (
        <div key={step.title} style={{ display: 'flex', gap: isMobile ? 10 : 12, alignItems: 'flex-start' }}>
          <div style={{
            flexShrink: 0, width: isMobile ? 24 : 26, height: isMobile ? 24 : 26, borderRadius: '50%',
            background: color + '22', color,
            fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${color}44`,
          }}>{i + 1}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: isMobile ? 12 : 13, fontWeight: 700, color: headingColor, marginBottom: 2 }}>{step.title}</div>
            <div style={{ fontSize: isMobile ? 12 : 13, color: textColor, lineHeight: 1.55, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{step.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

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
        description="ZenOrbit Guide: Builder Flow, Customizer, Export-Integration, Lizenz und AI-Provider Setup."
        path={isHelpRoute ? '/hilfe' : '/guide'}
        type="website"
        canonicalPath="/guide"
        robots={isHelpRoute ? 'noindex,follow' : 'index,follow'}
        keywords="ZenOrbit Guide, Builder Flow, Customizer, Export Integration, Lizenz, AI Provider Setup"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: 'ZenOrbit Guide',
          description: 'Guide für Signature Composition, Refinement und Export-Integration.',
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
          <div style={styles.sidebarSticky}>
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
          </div>
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
            <h2 style={styles.h2}>Export in dein Projekt einbinden</h2>
            <div style={styles.rule} />
            <p style={styles.p}>
              Nach dem Export im Builder erhältst du deine Navigation als React-Komponente (oder als HTML-Paket in Studio). So bindest du sie ein:
            </p>
            <pre style={styles.codeBlock}><code>npm install framer-motion</code></pre>
            <ol style={styles.list}>
              <li>Entpacke den Export in dein Projekt, z. B. nach <code style={styles.inlineCode}>src/components/</code>.</li>
              <li>Importiere die Komponente und binde sie einmalig in dein App-Layout ein.</li>
              <li>Prüfe Routen, Klick-Aktionen und Tastaturbedienung in deiner eigenen Umgebung.</li>
            </ol>
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
            <video
              src="/guide/builder-flow.mp4"
              style={styles.demoVideo}
              autoPlay loop muted playsInline
              aria-label="Aufnahme: Vorlage wählen, Logo anpassen, Menüelement per Drag verschieben, Production Export"
            />
            <StepList steps={BUILDER_FLOW_STEPS} color={p.gold} isMobile={isMobile} headingColor={p.heading} textColor={p.textMuted} />
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
            <StepList steps={EXPORT_FLOW_STEPS} color={p.gold} isMobile={isMobile} headingColor={p.heading} textColor={p.textMuted} />
          </section>

          <section style={{ marginTop: '2.5rem' }}>
            <h2 style={styles.h2}>Delivery Studio</h2>
            <div style={styles.rule} />
            <p style={styles.p}>
              Im letzten Builder-Schritt bzw. im Customizer unter „Delivery Studio" wählst du eines von vier Export-Formaten. Welches passt zu deinem Projekt?
            </p>
          </section>

          {DELIVERY_FORMATS.map((format) => (
            <section key={format.id} id={format.id} style={{ marginTop: '1.6rem' }}>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: 'clamp(1rem, 1.5vw, 1.35rem)', color: format.color, fontWeight: 700, letterSpacing: '0.02em' }}>
                {format.name}
              </h3>
              <div style={styles.rule} />
              <p style={styles.p}>{format.description}</p>
              <div style={{ background: format.color + '14', border: `1px solid ${format.color}44`, borderRadius: 8, padding: '0.6rem 0.8rem', fontSize: 12, color: p.textMuted, lineHeight: 1.5 }}>
                Wann nutzen: {format.usage}
              </div>
            </section>
          ))}

          <section id="pro-guide">
            <h2 style={styles.h2}>ZenOrbit Pro</h2>
            <div style={styles.rule} />
            <p style={styles.p}>
              Vom kostenlosen Ausprobieren bis zur individuell entwickelten Marken-Navigation. Creator und Studio kaufst du einmalig — ohne Abo.
            </p>

            <div style={styles.tierGrid}>
              {OFFERS.map((offer) => (
                <div key={offer.id} style={styles.tierCard}>
                  <div style={styles.tierName}>{offer.name}</div>
                  <div style={styles.tierPrice}>{offer.price}</div>
                  <div style={styles.tierBilling}>{offer.billing}</div>
                  <div style={styles.tierAudience}>{offer.audience}</div>
                </div>
              ))}
            </div>

            <h3 style={{ ...styles.h2, fontSize: 'clamp(1rem, 1.5vw, 1.2rem)', marginTop: '1.6rem' }}>So aktivierst du deine Lizenz</h3>
            <div style={styles.rule} />
            <ol style={styles.list}>
              <li>Passendes Angebot auf der Pro-Seite auswählen und Anfrage senden — oder direkt einen 14-Tage-Demo-Key im Builder generieren.</li>
              <li>Nach Abstimmung erhältst du deinen Lizenz-Key per E-Mail (Format <code style={styles.inlineCode}>ZNCRT-XXXX-XXXX-XX</code> bzw. <code style={styles.inlineCode}>ZNSTU-XXXX-XXXX-XX</code>).</li>
              <li>Im Builder unter „Lizenz aktivieren / wechseln" den Key eintragen und bestätigen.</li>
              <li>Freigeschaltete Funktionen (Menüelemente, Export, Branding-frei, …) sind sofort aktiv, ohne Neuladen.</li>
            </ol>

            <Link to="/pro" style={styles.inlineLink}>Vollständige Preise & Vergleichstabelle ansehen →</Link>
          </section>

          <section id="troubleshooting">
            <h2 style={styles.h2}>Häufige Fragen &amp; Problemlösung</h2>
            <div style={styles.rule} />
            <ul style={styles.list}>
              <li>Menü wird nicht angezeigt: z-index in deinem Layout prüfen, die Navigation muss über anderen Elementen liegen.</li>
              <li>Lizenz-Key wird nicht akzeptiert: Format genau prüfen (z. B. <code style={styles.inlineCode}>ZNCRT-XXXX-XXXX-XX</code>), Groß-/Kleinschreibung spielt keine Rolle.</li>
              <li>AI-Generator antwortet nicht: Provider und API-Key im Builder prüfen, Verbindung mit „Test" checken.</li>
              <li>Export enthält kein vollständiges React-Setup: Explore hat einen eingeschränkten Export, ab Creator ist der vollständige Export enthalten.</li>
              <li>Weitere Fragen? <a href="mailto:saghallo@denisbitter.de" style={styles.inlineLink}>saghallo@denisbitter.de</a></li>
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
              id: 'ai-grok',
              name: 'xAI Grok',
              color: '#8A9AA8',
              steps: [
                { title: 'Account Foundation', desc: 'Richte den Zugriff über console.x.ai ein.' },
                { title: 'Key Provisioning', desc: 'Erzeuge einen API-Key und sichere ihn sofort.' },
                { title: 'Provider Mapping', desc: 'Im Builder: AI-Provider konfigurieren -> xAI Grok.' },
                { title: 'Credential Binding', desc: 'Hinterlege den Key im Feld "API Key".' },
                { title: 'Model Profile', desc: 'Grok 4.6 für aktuelle Qualität und Kontextgröße wählen.' },
                { title: 'Endpoint Policy', desc: 'Endpoint leer lassen, ZenOrbit setzt https://api.x.ai/v1/chat/completions automatisch.' },
                { title: 'Verbindung', desc: 'Mit Test prüfen. Die Nutzung der xAI API wird separat abgerechnet.' },
              ],
              hint: 'Aktueller Grok-Reasoning-Stand für Live-Kontext und schnelle Iterationen.',
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
                      <div style={{ fontSize: isMobile ? 12 : 13, color: p.textMuted, lineHeight: 1.55, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{linkify(step.desc, provider.color)}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: provider.color + '14', border: `1px solid ${provider.color}44`, borderRadius: 8, padding: '0.6rem 0.8rem', fontSize: 12, color: p.textMuted, lineHeight: 1.5 }}>
                Note: {linkify(provider.hint, provider.color)}
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
    // 'overflowX: hidden' allein zwingt overflow-y implizit auf 'auto' (CSS-Quirk),
    // was hier den Sticky-Kontext der Sidebar zerstört hatte. 'clip' vermeidet das.
    overflowX: 'clip',
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
  sidebarSticky: {
    position: 'sticky',
    top: 0,
    alignSelf: 'start',
    height: '100vh',
  },
  sidebar: {
    height: '100%',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
    borderRight: `1px solid ${p.border}`,
    padding: '1.15rem 1rem 1.4rem',
    boxSizing: 'border-box',
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
  tierGrid: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5, 1fr)',
    gap: 10,
    margin: '0.9rem 0',
  },
  tierCard: {
    border: `1px solid ${p.borderStrong}`,
    borderRadius: 10,
    padding: '0.7rem 0.8rem',
    background: p.panelBg,
  },
  tierName: {
    color: p.gold,
    fontWeight: 700,
    fontSize: isMobile ? 12 : 13,
    marginBottom: 4,
  },
  tierPrice: {
    fontSize: isMobile ? 14 : 16,
    fontWeight: 700,
    color: p.heading,
  },
  tierBilling: {
    fontSize: 10,
    color: p.textDim,
    marginBottom: 6,
  },
  tierAudience: {
    fontSize: isMobile ? 10 : 11,
    color: p.textMuted,
    lineHeight: 1.5,
  },
  demoVideo: {
    display: 'block',
    width: '100%',
    maxWidth: 720,
    borderRadius: 12,
    border: `1px solid ${p.borderStrong}`,
    margin: '0.9rem 0 1.3rem',
    background: p.panelBg,
  },
  inlineCode: {
    background: p.codeBg,
    color: p.codeText,
    border: `1px solid ${p.codeBorder}`,
    borderRadius: 5,
    padding: '1px 6px',
    fontSize: '0.92em',
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
