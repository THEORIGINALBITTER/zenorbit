import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiMail, FiClock, FiShield } from 'react-icons/fi';
import { zenPalette } from '../styles/zenPalette';
import SeoHelmet from '../components/seo/SeoHelmet';

const BUY_URL = import.meta.env.VITE_PRO_BUY_URL || 'https://YOUR_CHECKOUT_URL';
const SUPPORT_EMAIL = 'saghallo@denisbitter.de';
const PRICE = '€29';
const mono = '"IBM Plex Mono", monospace';

const proFeatures = [
  'Unbegrenzte Menu-Items',
  'Alle Templates + zukünftige Pro-Erweiterungen',
  'Export ohne Branding-Hinweis',
  'Priorisierter E-Mail Support',
  'Lifetime Nutzung, kein Abo',
];

const steps = [
  {
    icon: FiCheck,
    title: '1. Kauf abschließen',
    text: 'Du kaufst ZenOrbit Pro über den Checkout.',
  },
  {
    icon: FiMail,
    title: '2. Bestätigung erhalten',
    text: 'Direkt nach dem Kauf erhältst du eine Bestellbestätigung.',
  },
  {
    icon: FiClock,
    title: '3. Key per E-Mail',
    text: 'Dein Lizenz-Key kommt manuell per E-Mail (meist < 12h, spätestens 24h).',
  },
];

const faqItems = [
  {
    q: 'Warum wird der Key manuell versendet?',
    a: 'So können wir Bestellung, Support und Lizenzen sauber zuordnen und Missbrauch vermeiden.',
  },
  {
    q: 'Was, wenn ich nach 24h keinen Key habe?',
    a: `Schreib an ${SUPPORT_EMAIL} mit deiner Bestell-Mailadresse, wir kümmern uns sofort.`,
  },
  {
    q: 'Ist das ein Abo?',
    a: 'Nein. Einmal zahlen, dauerhaft nutzen.',
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${zenPalette.border}` }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          color: zenPalette.text,
          textAlign: 'left',
          padding: '0.9rem 0',
          fontFamily: mono,
          fontSize: 13,
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <span>{q}</span>
        <span style={{ color: zenPalette.gold, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
      </button>
      {open && (
        <p style={{ margin: '0 0 0.9rem', color: zenPalette.textMuted, fontFamily: mono, fontSize: 12, lineHeight: 1.65 }}>
          {a}
        </p>
      )}
    </div>
  );
}

export default function PricingPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');

  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent('ZenOrbit Pro Kaufanfrage');
    const body = encodeURIComponent(
      [
        'Hallo Denis,',
        '',
        'ich möchte ZenOrbit Pro kaufen.',
        '',
        `Name: ${name || '-'}`,
        `E-Mail: ${email || '-'}`,
        `Firma (optional): ${company || '-'}`,
        '',
        'Bitte sende mir die Zahlungsdetails / den Checkout-Link.',
      ].join('\n')
    );
    return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  }, [company, email, name]);

  return (
    <div style={{ background: zenPalette.bg, minHeight: '100vh', color: zenPalette.text, fontFamily: mono }}>
      <SeoHelmet
        title="Pro Pricing"
        description="ZenOrbit Pro für 29€ einmalig. Erhalte unbegrenzte Features, Export ohne Branding und priorisierten Support."
        path="/pro"
        keywords="ZenOrbit Pro, Pricing, Lifetime Lizenz, Radial Menu Tool"
      />
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '2rem 1rem 4rem' }}>
        <section style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            backgroundColor: zenPalette.gold + '1f',
            color: zenPalette.gold,
            border: `1px solid ${zenPalette.gold}55`,
            borderRadius: 999,
            padding: '4px 12px',
            fontSize: 10,
            marginBottom: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontWeight: 700,
          }}>
            <FiShield size={12} />
            ZenOrbit Pro
          </div>
          <h1 style={{ margin: '0 0 0.45rem', fontSize: 'clamp(1.5rem, 4vw, 2.35rem)', lineHeight: 1.2 }}>
            Pro freischalten
          </h1>
          <p style={{ margin: 0, color: zenPalette.textMuted, fontSize: 12 }}>
            Einmalig {PRICE}. Lizenz-Key wird manuell per E-Mail versendet.
          </p>
        </section>

        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '0.9rem',
          marginBottom: '1rem',
        }}>
          <div style={{
            border: `1px solid ${zenPalette.gold}66`,
            background: `linear-gradient(145deg, ${zenPalette.panel}, #211d17)`,
            borderRadius: 14,
            padding: '1rem',
          }}>
            <div style={{ fontSize: 11, color: zenPalette.textMuted, marginBottom: '0.35rem' }}>ZenOrbit Pro</div>
            <div style={{ fontSize: 34, fontWeight: 700, color: zenPalette.gold, marginBottom: '0.6rem' }}>{PRICE}</div>
            <div style={{ marginTop: '1.3rem' }}>
              {proFeatures.map((feature) => (
                <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7, color: zenPalette.textMuted, fontSize: 12 }}>
                  <FiCheck size={13} style={{ color: zenPalette.gold, flexShrink: 0 }} />
                  {feature}
                </div>
              ))}
            </div>
            
          </div>

          <div style={{ border: `1px solid ${zenPalette.border}`, backgroundColor: zenPalette.panel, borderRadius: 14, padding: '1rem' }}>
            <div style={{ fontSize: 11, color: zenPalette.textMuted, marginBottom: '0.6rem' }}>Rechnungsadresse</div>
            <label style={{ display: 'block', fontSize: 10, color: zenPalette.textMuted, marginBottom: 4 }}>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="Max Mustermann" />
            <label style={{ display: 'block', fontSize: 10, color: zenPalette.textMuted, marginBottom: 4, marginTop: 8 }}>E-Mail</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} placeholder="max@firma.de" />
            <label style={{ display: 'block', fontSize: 10, color: zenPalette.textMuted, marginBottom: 4, marginTop: 8 }}>Firma (optional)</label>
            <input value={company} onChange={(e) => setCompany(e.target.value)} style={inputStyle} placeholder="Firma GmbH" />
            <a
              href={mailtoHref}
              style={{
                marginTop: 10,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                textDecoration: 'none',
                width: '100%',
                backgroundColor: 'transparent',
                color: zenPalette.text,
                border: `1px solid ${zenPalette.borderStrong}`,
                borderRadius: 10,
                padding: '0.62rem 0.75rem',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <FiMail size={13} />
              Kaufanfrage per E-Mail
            </a>
          </div>
        </section>

        <section style={{
          border: `1px solid ${zenPalette.border}`,
          backgroundColor: zenPalette.panel,
          borderRadius: 14,
          padding: '1rem',
          marginBottom: '1rem',
        }}>
          <div style={{ fontSize: 11, color: zenPalette.textMuted, marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            So läuft es ab
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.7rem' }}>
            {steps.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} style={{ border: `1px solid ${zenPalette.border}`, borderRadius: 10, padding: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: zenPalette.gold, marginBottom: 4 }}>
                    <Icon size={13} />
                    <span style={{ fontSize: 11, color: zenPalette.text }}>{item.title}</span>
                  </div>
                  <div style={{ fontSize: 11, color: zenPalette.textMuted, lineHeight: 1.55 }}>{item.text}</div>
                </div>
              );
            })}
          </div>
        </section>

        <section style={{ border: `1px solid ${zenPalette.border}`, backgroundColor: zenPalette.panel, borderRadius: 14, padding: '1rem' }}>
          <h2 style={{ margin: '0 0 0.35rem', fontSize: 14 }}>FAQ</h2>
          {faqItems.map((item) => (
            <FaqItem key={item.q} {...item} />
          ))}
          <div style={{ marginTop: '0.9rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/builder')} style={ghostBtn}>Builder öffnen</button>
            <a href={`mailto:${SUPPORT_EMAIL}`} style={{ ...ghostBtn, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
              Support kontaktieren
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  borderRadius: 8,
  border: `1px solid ${zenPalette.border}`,
  backgroundColor: zenPalette.panelSoft,
  color: zenPalette.text,
  fontFamily: mono,
  fontSize: 12,
  padding: '0.58rem 0.65rem',
  boxSizing: 'border-box',
  outline: 'none',
};

const ghostBtn = {
  backgroundColor: 'transparent',
  color: zenPalette.textMuted,
  border: `1px solid ${zenPalette.border}`,
  borderRadius: 9,
  padding: '0.55rem 0.8rem',
  fontFamily: mono,
  fontSize: 11,
  cursor: 'pointer',
};
