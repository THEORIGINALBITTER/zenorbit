import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaLinkedin,
  FaGithub,
  FaInstagram,
  FaYoutube,
  FaStackOverflow,
  FaEnvelope,
  FaPhoneAlt,
} from 'react-icons/fa';
import { zenPalette } from '../../styles/zenPalette';

const socialLinks = [
  { href: 'https://www.linkedin.com', Icon: FaLinkedin, label: 'LinkedIn' },
  { href: 'https://www.youtube.com', Icon: FaYoutube, label: 'YouTube' },
  { href: 'https://www.instagram.com', Icon: FaInstagram, label: 'Instagram' },
  { href: 'https://github.com', Icon: FaGithub, label: 'GitHub' },
  { href: 'https://stackoverflow.com', Icon: FaStackOverflow, label: 'Stack Overflow' },
];

function MainNavbar() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 900 : false
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <header style={styles.header} className="zo-nav-root">
      {isMobile ? (
        <div style={styles.mobileTopBar} className="zo-nav-mobile-top">
          <div style={styles.mobileTopLeft} className="zo-nav-mobile-left">
            {socialLinks.map((social) => {
              const IconComp = social.Icon;
              return (
                <a key={social.label} href={social.href} target="_blank" rel="noreferrer" style={styles.mobileIconLink} className="zo-social-btn" aria-label={social.label}>
                  <IconComp size={14} />
                </a>
              );
            })}
          </div>

        </div>
      ) : (
        <div style={styles.topBar} className="zo-nav-topbar">
          <div style={styles.topBarContent} className="zo-container">
            <div style={styles.topBarLeft} className="zo-nav-icons">
              {socialLinks.map((social) => {
                const IconComp = social.Icon;
                return (
                  <a key={social.label} href={social.href} target="_blank" rel="noreferrer" style={styles.socialLink} className="zo-social-btn" aria-label={social.label}>
                    <IconComp size={14} />
                  </a>
                );
              })}
            </div>
            <div style={styles.topBarRight} className="zo-nav-contact">
              <a href="mailto:saghallo@denisbitter.de" style={styles.contactLink}>
                <FaEnvelope size={10} />
                saghallo@denisbitter.de
              </a>
              <a href="tel:+4915153231791" style={styles.contactLink}>
                <FaPhoneAlt size={10} />
                0151 53 23 17 91
              </a>
            </div>
          </div>
        </div>
      )}

      {!isMobile && (
        <nav style={styles.nav} className="zo-nav-main zo-container">
          <Link to="/" style={styles.brand}>
            <img src="/ZenLogo_B.png" alt="ZenOrbit Logo" style={styles.logo} />
            <span style={styles.brandText}>ZenOrbit</span>
          </Link>
          <div id="zo-nav-inline-slot" style={styles.inlineSlot} />
          <div style={styles.quickLinks}>
            <Link to="/guide" style={styles.guideLink}>Guide</Link>
            <Link to="/pro" style={styles.proLink}>✦ Pro</Link>
          </div>
        </nav>
      )}
    </header>
  );
}

const styles = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 70,
    borderBottom: `1px solid ${zenPalette.border}`,
    backgroundColor: zenPalette.bgMuted,
    boxShadow: '0 6px 14px rgba(0, 0, 0, 0.35)',
  },
  topBar: {
    background: 'linear-gradient(90deg, #121214 0%, #18181d 100%)',
    borderBottom: `1px solid ${zenPalette.border}`,
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: 12,
  },
  topBarContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
  },
  mobileTopBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.75rem',
    backgroundColor: '#d9d4c5',
    borderBottom: `1px solid ${zenPalette.border}`,
  },
  mobileTopLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    overflowX: 'auto',
    paddingBottom: 2,
  },
  mobileIconLink: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: '1px solid rgba(172, 142, 102, 0.45)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#151515',
    textDecoration: 'none',
    flex: '0 0 auto',
    background: 'rgba(255, 255, 255, 0.25)',
  },
  mobileBrandLink: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
  },
  mobileBrandLogo: {
    width: 34,
    height: 34,
    objectFit: 'contain',
  },
  topBarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.9rem',
  },
  topBarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.9rem',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  socialLink: {
    color: zenPalette.textMuted,
    display: 'inline-flex',
    alignItems: 'center',
    textDecoration: 'none',
  },
  contactLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    color: zenPalette.textMuted,
    textDecoration: 'none',
    patternTop: '1px',
    fontSize: 10,
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
  },
  inlineSlot: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  proLink: {
    display: 'inline-flex',
    alignItems: 'center',
    textDecoration: 'none',
    padding: '6px 14px',
    backgroundColor: '#AC8E6622',
    border: '1px solid #AC8E6688',
    borderRadius: 8,
    color: '#C8AD84',
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
  },
  quickLinks: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  guideLink: {
    display: 'inline-flex',
    alignItems: 'center',
    textDecoration: 'none',
    padding: '6px 12px',
    backgroundColor: zenPalette.panel,
    border: `1px solid ${zenPalette.borderStrong}`,
    borderRadius: 8,
    color: zenPalette.textMuted,
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.04em',
    whiteSpace: 'nowrap',
  },
  navMobile: {
    justifyContent: 'center',
    padding: '0.9rem 0.9rem',
  },
  brand: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    textDecoration: 'none',
  },
  logo: {
    width: 30,
    height: 30,
    objectFit: 'contain',
  },
  brandText: {
    color: zenPalette.text,
    fontFamily: '"IBM Plex Mono", monospace',
    fontWeight: 400,
    fontSize: 12,
    letterSpacing: '0.5px',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  navLinksMobile: {
    gap: 8,
    justifyContent: 'center',
    width: '100%',
  },
  navLink: {
    textDecoration: 'none',
    color: zenPalette.textMuted,
    border: `1px solid ${zenPalette.border}`,
    borderRadius: 10,
    padding: '8px 15px',
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: 14,
    fontWeight: 600,
    backgroundColor: zenPalette.panel,
  },
  navLinkMobile: {
    fontSize: 12,
    padding: '7px 11px',
    whiteSpace: 'nowrap',
    flex: '0 0 auto',
  },
  navLinkActive: {
    backgroundColor: zenPalette.gold,
    borderColor: zenPalette.gold,
    color: '#121212',
  },
};

export default MainNavbar;
