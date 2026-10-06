import { useLicense } from '../hooks/useLicense';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import SeoHelmet from '../components/seo/SeoHelmet';
import ZenSelect from '../components/ui/ZenSelect';
import ZenModal from '../components/ui/ZenModal';
import { OFFERS, COMPARISON_ROWS, SUPPORT_EMAIL } from '../config/offers';
const mono = '"IBM Plex Mono", monospace';
const dark = {
  pageBg: '#0f0f10',
  text: '#e8e3d7',
  textMuted: '#c1b8a8',
  textSoft: '#a79e8f',
  panel: '#1c1c1f',
  panelSoft: '#262830',
  border: '#343844',
  borderStrong: 'rgba(208,203,184,0.4)',
  gold: '#d0cbb8',
  goldTextOnFill: '#1a1a1a',
};

const light = {
  pageBg: '#f3ede2',
  text: '#2f291f',
  textMuted: '#605648',
  textSoft: '#7a6d5b',
  panel: '#ebe4d8',
  panelSoft: '#f6f0e6',
  border: 'rgba(31,26,18,0.16)',
  borderStrong: 'rgba(142,118,87,0.42)',
  gold: '#8e7657',
  goldTextOnFill: '#f7f1e6',
};


export default function PricingPage() {
  const { isDark } = useTheme();
  const p = isDark ? dark : light;
  const { tier, activateKey, deactivate } = useLicense();
  const [key, setKey] = useState('');
  const [keyMessage, setKeyMessage] = useState('');
  const [selected, setSelected] = useState('creator');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [detailsId, setDetailsId] = useState(null);
  const offer = OFFERS.find((item) => item.id === selected);
  const detailsOffer = OFFERS.find((item) => item.id === detailsId);
  const button = { display: 'inline-block', padding: '12px 18px', border: `1px solid ${p.gold}`, borderRadius: 8, background: p.gold, color: p.goldTextOnFill, font: 'inherit', textDecoration: 'none', cursor: 'pointer' };
  const outlineButton = { display: 'inline-block', padding: '12px 18px', border: `1px solid ${p.borderStrong}`, borderRadius: 8, background: 'transparent', color: p.text, font: 'inherit', textDecoration: 'none', cursor: 'pointer' };
  const input = { display: 'block', width: '100%', boxSizing: 'border-box', margin: '6px 0 16px', padding: 12, border: `1px solid ${p.borderStrong}`, borderRadius: 8, background: p.panelSoft, color: p.text, font: 'inherit' };
  const selectOffer = (id) => { setSelected(id); document.getElementById('anfrage')?.scrollIntoView({ behavior: 'smooth' }); };
  const submit = (event) => {
    event.preventDefault();
    const subject = `ZenOrbit ${offer.name} – Anfrage (${offer.price})`;
    const body = ['Hallo Denis,', '', `ich interessiere mich für ZenOrbit ${offer.name} (${offer.price}, ${offer.billing}).`, '', `Name: ${name}`, `E-Mail: ${email}`, `Firma / Team: ${company || '–'}`, '', 'Bitte sende mir die Angebots- und Zahlungsdetails.'].join('\n');
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemList',
        itemListElement: OFFERS.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Product',
            name: `ZenOrbit ${item.name}`,
            description: item.longDescription,
            brand: { '@type': 'Brand', name: 'ZenOrbit' },
            offers: {
              '@type': 'Offer',
              price: item.amount,
              priceCurrency: 'EUR',
              availability: 'https://schema.org/InStock',
              url: 'https://zenorbit.denisbitter.de/pro',
            },
          },
        })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: OFFERS.flatMap((item) => item.faq.map((entry) => ({
          '@type': 'Question',
          name: `${item.name}: ${entry.q}`,
          acceptedAnswer: { '@type': 'Answer', text: entry.a },
        }))),
      },
    ],
  };
  return <main style={{ minHeight: '100vh', background: p.pageBg, color: p.text, fontFamily: mono, fontSize: 13, lineHeight: 1.7 }}>
    <SeoHelmet title="ZenOrbit – Angebote & Preise" description="Explore kostenlos. Creator 99 € und Studio 299 € einmalig. Individuelle Marken-Navigation: Signature ab 2.500 €, Bespoke Experience ab 6.000 €. Figma-Plugin für Studio in Entwicklung." keywords="ZenOrbit Preise, Radial Menu Lizenz, ZenOrbit Figma Plugin, Orbit Navigation kaufen" path="/pro" jsonLd={jsonLd} />
    <div style={{ maxWidth: 1180, margin: 'auto', padding: '64px 24px' }}>
      <header style={{ maxWidth: 740, marginBottom: 48 }}>
        <p style={{ color: p.gold, letterSpacing: '0.16em', textTransform: 'uppercase' }}>ZenOrbit · Angebote & Preise</p>
        <h1 style={{ fontSize: 'clamp(30px, 5vw, 54px)', lineHeight: 1.15, fontWeight: 500 }}>Navigation mit Charakter.<br />Das passende Angebot für dein Projekt.</h1>
        <p style={{ color: p.textMuted }}>Vom ersten Experiment im Builder bis zur individuell entwickelten Marken-Navigation. Creator und Studio kaufst du einmalig – ohne Abo.</p>
      </header>
      <section aria-label="Software-Angebote" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 20 }}>
        {OFFERS.slice(0, 3).map((item) => <article key={item.id} style={{ padding: 26, borderRadius: 14, border: `1px solid ${item.id === 'studio' ? p.gold : p.borderStrong}`, background: item.id === 'studio' ? p.panelSoft : p.panel, display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ margin: 0, color: p.gold }}>{item.name}</h2>
          <p style={{ color: p.textMuted, minHeight: 48 }}>{item.audience}</p>
          <div style={{ fontSize: 36 }}>{item.price}</div><div style={{ color: p.textSoft }}>{item.billing}</div>
          <ul style={{ paddingLeft: 18, flex: 1, margin: '24px 0' }}>{item.features.map((feature) => <li key={feature} style={{ marginBottom: 10 }}>{feature}</li>)}</ul>
          {item.id === 'studio' && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginBottom: 16, padding: '4px 10px', borderRadius: 99, border: `1px solid ${p.borderStrong}`, color: p.textSoft, fontSize: 11 }}>
              Bald verfügbar · Figma-Plugin für Studio
            </div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {item.id === 'explore' ? <Link style={{ ...button, flex: '1 1 auto', textAlign: 'center' }} to="/builder">Builder ausprobieren</Link> : <button style={{ ...button, flex: '1 1 auto', textAlign: 'center' }} onClick={() => selectOffer(item.id)}>{item.name} anfragen</button>}
            <button style={{ ...outlineButton, flex: '1 1 auto', textAlign: 'center' }} onClick={() => setDetailsId(item.id)}>Details ansehen</button>
          </div>
        </article>)}
      </section>
      <h2 style={{ marginTop: 56, fontWeight: 500 }}>Individuell für deine Marke</h2>
      <section aria-label="Individuelle Leistungen" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: 20 }}>
        {OFFERS.slice(3).map((item) => <article key={item.id} style={{ padding: 28, border: `1px solid ${p.borderStrong}`, borderRadius: 14, background: p.panel, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <h3 style={{ fontSize: 23, color: p.gold, marginTop: 0 }}>{item.name}</h3><p style={{ minHeight: 48 }}>{item.audience}</p>
          <div style={{ fontSize: 32 }}>{item.price}</div><p style={{ color: p.textSoft }}>{item.billing}</p>
          <ul style={{ paddingLeft: 18, flex: 1 }}>{item.features.map((feature) => <li key={feature} style={{ marginBottom: 10 }}>{feature}</li>)}</ul>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
            <button style={{ ...button, flex: '1 1 auto', textAlign: 'center' }} onClick={() => selectOffer(item.id)}>Projekt besprechen</button>
            <button style={{ ...outlineButton, flex: '1 1 auto', textAlign: 'center' }} onClick={() => setDetailsId(item.id)}>Details ansehen</button>
          </div>
        </article>)}
      </section>
      <section style={{ marginTop: 56 }}>
        <h2>Angebote im Vergleich</h2>
        <style>{`
          .zo-compare-cards { display: none; }
          @media (max-width: 720px) {
            .zo-compare-table { display: none; }
            .zo-compare-cards { display: grid; gap: 16px; }
          }
        `}</style>
        <div className="zo-compare-table" style={{ overflowX: 'auto', border: `1px solid ${p.borderStrong}`, borderRadius: 14 }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 640 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '14px 16px', borderBottom: `1px solid ${p.borderStrong}`, color: p.textSoft, fontWeight: 500 }}></th>
                {OFFERS.map((item) => <th key={item.id} style={{ textAlign: 'left', padding: '14px 16px', borderBottom: `1px solid ${p.borderStrong}`, color: p.gold, fontWeight: 500, whiteSpace: 'nowrap' }}>{item.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, rowIndex) => <tr key={row.label} style={{ background: rowIndex % 2 === 1 ? p.panelSoft : 'transparent' }}>
                <th scope="row" style={{ textAlign: 'left', padding: '12px 16px', color: p.textMuted, fontWeight: 500, whiteSpace: 'nowrap' }}>{row.label}</th>
                {OFFERS.map((item) => <td key={item.id} style={{ padding: '12px 16px', color: p.text, whiteSpace: 'nowrap' }}>{row.values[item.id]}</td>)}
              </tr>)}
            </tbody>
          </table>
        </div>
        <div className="zo-compare-cards">
          {OFFERS.map((item) => <div key={item.id} style={{ border: `1px solid ${p.borderStrong}`, borderRadius: 14, padding: '18px 20px', background: p.panel }}>
            <h3 style={{ margin: '0 0 12px', color: p.gold, fontSize: 17 }}>{item.name}</h3>
            <dl style={{ margin: 0 }}>
              {COMPARISON_ROWS.map((row, rowIndex) => <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderTop: rowIndex === 0 ? 'none' : `1px solid ${p.border}` }}>
                <dt style={{ color: p.textMuted }}>{row.label}</dt>
                <dd style={{ margin: 0, textAlign: 'right', color: p.text }}>{row.values[item.id]}</dd>
              </div>)}
            </dl>
          </div>)}
        </div>
      </section>
      <section style={{ marginTop: 56 }}>
        <h2>Details &amp; häufige Fragen je Angebot</h2>
        {OFFERS.map((item) => <details key={item.id} style={{ border: `1px solid ${p.borderStrong}`, borderRadius: 14, padding: '16px 20px', marginBottom: 14, background: p.panel }}>
          <summary style={{ cursor: 'pointer', color: p.gold, fontWeight: 700, fontSize: 15 }}>{item.name} · {item.price}</summary>
          <p style={{ color: p.textMuted, marginTop: 14 }}>{item.longDescription}</p>
          <h3 style={{ color: p.gold, fontSize: 14, marginBottom: 6 }}>Passt gut, wenn…</h3>
          <ul style={{ paddingLeft: 18, margin: '0 0 16px' }}>{item.useCases.map((useCase) => <li key={useCase} style={{ marginBottom: 6 }}>{useCase}</li>)}</ul>
          <h3 style={{ color: p.gold, fontSize: 14, marginBottom: 6 }}>Häufige Fragen</h3>
          {item.faq.map((entry) => <div key={entry.q} style={{ marginBottom: 10 }}>
            <p style={{ margin: '0 0 2px', fontWeight: 700 }}>{entry.q}</p>
            <p style={{ margin: 0, color: p.textMuted }}>{entry.a}</p>
          </div>)}
        </details>)}
      </section>
      <section style={{ marginTop: 48 }}>
        <h2>Was du vor dem Kauf wissen solltest</h2>
        <p>Creator ist für eine Person und eigene kommerzielle Projekte gedacht. Studio umfasst Teamarbeit und Kundenprojekte. Beide enthalten zwölf Monate Updates; die erworbene Version bleibt danach nutzbar.</p>
        <p>Signature und Bespoke werden nach einem gemeinsamen Briefing angeboten. Umfang, Integration, Übergabe und Betreuung werden im Angebot festgehalten.</p>
        <p>KI verwendest du mit deinem eigenen API-Key. Kosten von xAI, Anthropic oder anderen Anbietern sind nicht im ZenOrbit-Preis enthalten.</p>
        <p>ZenOrbit eignet sich für fokussierte Navigation mit wenigen klaren Wegen. Umfangreiche Seitenstrukturen brauchen ergänzende Navigation. Prüfe Tastaturbedienung, reduzierte Bewegung und deine Zielgeräte vor dem Einsatz.</p>
        <Link to="/guide" style={{ ...outlineButton, marginTop: 14, textAlign: 'center' }}>
          Dokumentation und Integration ansehen →
        </Link>
      </section>
      <section style={{ marginTop: 40 }}>
        <h2>Deine Lizenz</h2><p>Aktueller Tarif: {tier}. Bestehende Pro-Lizenzen behalten ihre bisherigen Funktionen.</p>
        <form onSubmit={(event) => { event.preventDefault(); setKeyMessage(activateKey(key) === 'ok' ? 'Lizenz aktiviert.' : 'Der Lizenz-Key ist ungültig.'); }}>
          <label>Lizenz-Key<input required style={input} value={key} onChange={(event) => setKey(event.target.value)} placeholder="ZNCRT-… oder ZNSTU-…" /></label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <button style={{ ...button, flex: '1 1 200px', textAlign: 'center' }} type="submit">Lizenz aktivieren</button>
            {tier !== 'explore' && <button style={{ ...button, flex: '1 1 200px', textAlign: 'center' }} type="button" onClick={deactivate}>Deaktivieren</button>}
          </div>
          <p role="status">{keyMessage}</p>
        </form>
      </section>
      <section id="anfrage" style={{ marginTop: 48, padding: 28, border: `1px solid ${p.borderStrong}`, borderRadius: 14, background: p.panel }}>
        <h2>Angebot anfragen</h2><p>Du erhältst die Details zu Lizenz, Leistungsumfang und Zahlung per E-Mail. Diese Anfrage löst noch keinen Kauf aus.</p>
        <form onSubmit={submit} style={{ maxWidth: 600 }}>
          <label>Angebot
            <div style={{ margin: '6px 0 16px' }}>
              <ZenSelect
                value={selected}
                onChange={setSelected}
                options={OFFERS.slice(1).map((item) => ({ value: item.id, label: `${item.name} · ${item.price}` }))}
              />
            </div>
          </label>
          <label>Name<input required autoComplete="name" style={input} value={name} onChange={(e) => setName(e.target.value)} /></label>
          <label>E-Mail<input required type="email" autoComplete="email" style={input} value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label>Firma / Team (optional)<input autoComplete="organization" style={input} value={company} onChange={(e) => setCompany(e.target.value)} /></label>
          <button type="submit" style={{ ...button, width: '100%', boxSizing: 'border-box', textAlign: 'center' }}>{offer.name}: E-Mail-Anfrage öffnen</button>
        </form>
        <p style={{ color: p.textSoft, marginBottom: 12 }}>Nach Abstimmung erhältst du die Zahlungsdetails und deinen Lizenz-Key.</p>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          style={{ ...outlineButton, textAlign: 'center' }}
        >
          Support per E-Mail →
        </a>
      </section>
    </div>
    <ZenModal open={Boolean(detailsOffer)} onClose={() => setDetailsId(null)} title={detailsOffer?.name || ''} palette={p}>
      {detailsOffer && <>
        <p style={{ fontSize: 20 }}>{detailsOffer.price} <span style={{ color: p.textSoft, fontSize: 13 }}>· {detailsOffer.billing}</span></p>
        <p style={{ color: p.textMuted }}>{detailsOffer.longDescription}</p>
        <h3 style={{ color: p.gold, fontSize: 15, marginBottom: 8 }}>Passt gut, wenn…</h3>
        <ul style={{ paddingLeft: 18, margin: '0 0 20px' }}>{detailsOffer.useCases.map((useCase) => <li key={useCase} style={{ marginBottom: 8 }}>{useCase}</li>)}</ul>
        <h3 style={{ color: p.gold, fontSize: 15, marginBottom: 8 }}>Enthalten</h3>
        <ul style={{ paddingLeft: 18, margin: '0 0 20px' }}>{detailsOffer.features.map((feature) => <li key={feature} style={{ marginBottom: 8 }}>{feature}</li>)}</ul>
        <h3 style={{ color: p.gold, fontSize: 15, marginBottom: 8 }}>Häufige Fragen</h3>
        {detailsOffer.faq.map((entry) => <div key={entry.q} style={{ marginBottom: 14 }}>
          <p style={{ margin: '0 0 4px', fontWeight: 700 }}>{entry.q}</p>
          <p style={{ margin: 0, color: p.textMuted }}>{entry.a}</p>
        </div>)}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 20 }}>
          {detailsOffer.id === 'explore'
            ? <Link style={{ ...button, flex: '1 1 auto', textAlign: 'center' }} to="/builder" onClick={() => setDetailsId(null)}>Builder ausprobieren</Link>
            : <button style={{ ...button, flex: '1 1 auto', textAlign: 'center' }} onClick={() => { setDetailsId(null); selectOffer(detailsOffer.id); }}>{detailsOffer.id === 'signature' || detailsOffer.id === 'bespoke' ? 'Projekt besprechen' : `${detailsOffer.name} anfragen`}</button>}
        </div>
      </>}
    </ZenModal>
  </main>;
}
