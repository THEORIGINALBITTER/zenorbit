import { useState } from 'react';
import { FiLock, FiX, FiCheck } from 'react-icons/fi';
import { useLicense } from '../../hooks/useLicense';
import { useBuilderPalette } from './builderTheme';
import { OFFERS, SUPPORT_EMAIL } from '../../config/offers';

const PAID_OFFERS = OFFERS.filter((item) => item.id === 'creator' || item.id === 'studio');

/**
 * Zeigt einen Grund, warum ein Feature gesperrt ist, direkt im Builder an —
 * inklusive Demo-Key-Option und Preisübersicht. Ersetzt ein hartes
 * navigate('/pro'), das sonst den unsaved Builder-Fortschritt verwirft.
 */
function UpgradeModal({ open, onClose, reason }) {
  const palette = useBuilderPalette();
  const { activateDemoKey, demoDaysLeft, tier } = useLicense();
  const [demoKeyGenerated, setDemoKeyGenerated] = useState('');

  if (!open) return null;

  const handleActivateDemoKey = () => {
    const key = activateDemoKey();
    setDemoKeyGenerated(key);
  };

  return (
    <div style={styles.overlay(palette)} onClick={onClose}>
      <div style={styles.modal(palette)} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <FiLock size={18} />
          <span style={styles.title(palette)}>Feature gesperrt</span>
          <button style={styles.closeBtn(palette)} onClick={onClose} aria-label="Schließen">
            <FiX size={16} />
          </button>
        </div>

        {reason && <p style={styles.reason(palette)}>{reason}</p>}

        {demoKeyGenerated ? (
          <p style={styles.demoConfirm(palette)}>
            Demo-Key aktiviert, gültig für {demoDaysLeft ?? 14} Tage: <strong>{demoKeyGenerated}</strong>
          </p>
        ) : tier === 'demo' ? (
          <p style={styles.demoConfirm(palette)}>
            Dein Demo-Key ist aktiv, noch {demoDaysLeft} Tage gültig. Nach Ablauf brauchst du eine reguläre Lizenz, um weiter darauf zuzugreifen.
          </p>
        ) : (
          <button onClick={handleActivateDemoKey} style={styles.demoBtn(palette)}>
            14 Tage Demo-Key generieren — sofort alle Studio-Funktionen testen
          </button>
        )}

        <div style={styles.divider(palette)} />

        <p style={styles.pricingIntro(palette)}>Oder direkt freischalten:</p>
        <div style={styles.offerGrid}>
          {PAID_OFFERS.map((offer) => (
            <div key={offer.id} style={styles.offerCard(palette)}>
              <div style={styles.offerName(palette)}>{offer.name}</div>
              <div style={styles.offerPrice(palette)}>{offer.price}</div>
              <div style={styles.offerBilling(palette)}>{offer.billing}</div>
            </div>
          ))}
        </div>

        <a
          href="/pro"
          target="_blank"
          rel="noreferrer"
          style={styles.buyBtn(palette)}
        >
          <FiCheck size={14} /> Tarife im Detail ansehen ↗
        </a>
        <p style={styles.hint(palette)}>
          Öffnet in einem neuen Tab — dein Builder-Fortschritt hier bleibt erhalten. Fragen? <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: palette.gold }}>{SUPPORT_EMAIL}</a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  overlay: (palette) => ({
    position: 'fixed',
    inset: 0,
    zIndex: 3000,
    background: palette.overlay,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '48px 20px',
    overflowY: 'auto',
  }),
  modal: (palette) => ({
    width: '100%',
    maxWidth: 460,
    background: palette.bgPanel,
    border: `1px solid ${palette.borderStrong}`,
    borderRadius: 14,
    boxShadow: palette.shadowElevated,
    padding: 24,
    color: palette.text,
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: 12,
  }),
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: (palette) => ({
    flex: 1,
    fontWeight: 700,
    fontSize: 13,
    color: palette.text,
  }),
  closeBtn: (palette) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 7,
    border: `1px solid ${palette.border}`,
    background: 'transparent',
    color: palette.textDim,
    cursor: 'pointer',
  }),
  reason: (palette) => ({
    margin: '0 0 16px',
    lineHeight: 1.6,
    color: palette.textSub,
  }),
  demoBtn: (palette) => ({
    display: 'block',
    width: '100%',
    padding: '0.7rem',
    marginBottom: 14,
    background: 'transparent',
    color: palette.text,
    border: `1px solid ${palette.border}`,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 1.4,
    cursor: 'pointer',
    fontFamily: 'inherit',
  }),
  demoConfirm: (palette) => ({
    margin: '0 0 14px',
    fontSize: 11,
    lineHeight: 1.6,
    color: palette.textSub,
    wordBreak: 'break-all',
  }),
  divider: (palette) => ({
    borderTop: `1px solid ${palette.borderSoft}`,
    margin: '4px 0 14px',
  }),
  pricingIntro: (palette) => ({
    margin: '0 0 10px',
    color: palette.textDim,
    fontSize: 11,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  }),
  offerGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
    marginBottom: 16,
  },
  offerCard: (palette) => ({
    border: `1px solid ${palette.border}`,
    borderRadius: 8,
    padding: '10px 12px',
    background: palette.bgCard,
  }),
  offerName: (palette) => ({
    color: palette.gold,
    fontWeight: 700,
    fontSize: 12,
    marginBottom: 4,
  }),
  offerPrice: (palette) => ({
    fontSize: 15,
    fontWeight: 700,
    color: palette.text,
  }),
  offerBilling: (palette) => ({
    fontSize: 10,
    color: palette.textDim,
    marginTop: 2,
  }),
  buyBtn: (palette) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '0.7rem',
    background: palette.gold,
    color: palette.buttonText,
    border: 'none',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 700,
    textDecoration: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
  }),
  hint: (palette) => ({
    margin: '10px 0 0',
    fontSize: 10,
    lineHeight: 1.6,
    color: palette.textDim,
  }),
};

export default UpgradeModal;
