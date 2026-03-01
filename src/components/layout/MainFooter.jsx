import React, { useEffect, useRef, useState } from 'react';
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

const socialLinks = [
  { href: 'https://www.linkedin.com', Icon: FaLinkedin, label: 'LinkedIn' },
  { href: 'https://www.youtube.com', Icon: FaYoutube, label: 'YouTube' },
  { href: 'https://www.instagram.com', Icon: FaInstagram, label: 'Instagram' },
  { href: 'https://github.com', Icon: FaGithub, label: 'GitHub' },
  { href: 'https://stackoverflow.com', Icon: FaStackOverflow, label: 'Stack Overflow' },
];

function MainFooter() {
  const [showMiniFooter, setShowMiniFooter] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 900 : false
  );
  const footerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowMiniFooter(!entry.isIntersecting);
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    if (footerRef.current) observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <>
      {showMiniFooter && (
        <div style={styles.miniFooter} className="zo-footer-mini text-[10px]">
          {isMobile ? (
            <div style={styles.miniRoleMobile}>ZenOrbit by Denis Bitter</div>
          ) : (
            <>
              <div style={styles.miniName}>
                ZenOrbit
                <span style={styles.miniRole}> by Denis Bitter</span>
              </div>
              <div style={styles.miniIcons}>
                {socialLinks.map((social) => {
                  const IconComp = social.Icon;
                  return (
                    <a key={social.label} href={social.href} target="_blank" rel="noreferrer" style={styles.miniIconLink} className="zo-social-btn" aria-label={social.label}>
                      <IconComp size={14} />
                    </a>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      <footer ref={footerRef} style={styles.footer} className="zo-footer-root">
        <div style={styles.content} className="zo-footer-content zo-container">
          <div>
            <p style={styles.headline}>Denis Bitter</p>
            <p style={styles.meta}>Software Architect & Full-Stack Engineering Instructor</p>
            <p style={styles.meta}>Design + Code | Entwickler + Dozent</p>
            <p style={styles.contactLine}>
              <FaEnvelope size={10} /> saghallo@denisbitter.de
            </p>
            <p style={styles.contactLine}>
              <FaPhoneAlt size={10} /> 0151 53 23 17 91
            </p>
          </div>

          <div className='zo-footer-spacer' />

          <div>
            <h4 style={styles.sectionTitle}>Cockpit</h4>
            <div style={styles.linkList}>
              <Link to="/builder" style={styles.link}>Builder</Link>
              <Link to="/customizer" style={styles.link}>Customizer</Link>
              <Link to="/guide" style={styles.link}>Guide / Hilfe</Link>
              <Link to="/pro" style={styles.link}>ZenOrbit Pro</Link>
      
              <a href="https://denisbitter.de/impressum" target="_blank" rel="noreferrer" style={styles.link}>Impressum</a>
              <a href="https://denisbitter.de/datenschutz" target="_blank" rel="noreferrer" style={styles.link}>Datenschutz</a>
                      <a href="https://denisbitter.de" target="_blank" rel="noreferrer" style={styles.link}>Denis Bitter Code + Design</a>

           
            </div>
          </div>

          <div>
            <h4 style={styles.sectionTitle}>Social</h4>
            <div style={styles.iconRow}>
              {socialLinks.map((social) => {
                const IconComp = social.Icon;
                return (
                  <a key={social.label} href={social.href} target="_blank" rel="noreferrer" style={styles.iconLink} className="zo-social-btn" aria-label={social.label}>
                    <IconComp size={14} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div style={styles.bottomBar} className="zo-footer-bottom zo-container">
          <span>© {new Date().getFullYear()} Denis Bitter. All rights reserved.</span>
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={styles.topButton}>
            Nach oben
          </button>
        </div>
      </footer>
    </>
  );
}

const styles = {
  miniFooter: {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 60,
    backgroundColor: '#d9d4c5',
    borderTop: '1px solid rgba(21, 21, 21, 0.15)',
    boxShadow: '0 -8px 20px rgba(15, 15, 15, 0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.8rem',
    paddingInline: 'clamp(0.9rem, 2vw, 1.25rem)',
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: 10,
  },
  miniName: {
    fontWeight: 400,
    color: '#1d1d1f',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  miniRole: {
    fontWeight: 400,
  },
  miniRoleMobile: {
    width: '100%',
    textAlign: 'center',
    color: '#1d1d1f',
    fontWeight: 500,
  },
  miniIcons: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
  },
  miniIconLink: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    border: '1px solid rgba(21, 21, 21, 0.25)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#1d1d1f',
    textDecoration: 'none',
    background: 'rgba(255, 255, 255, 0.35)',
  },
  footer: {
    backgroundColor: '#d9d4c5',
    color: '#1a1a1a',
    fontFamily: '"IBM Plex Mono", monospace',
    borderTop: '1px solid rgba(21, 21, 21, 0.15)',
    boxShadow: 'inset 0 8px 24px rgba(0, 0, 0, 0.08)',
  },
  content: {
    display: 'grid',
    gap: '1.5rem',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  },
  headline: {
    margin: 0,
    fontSize: 10,
    fontWeight: 700,
  },
  meta: {
    margin: '0.35rem 0',
    fontSize: 10,
    opacity: 0.8,
    lineHeight: 1.4,
  },
  contactLine: {
    margin: '0.35rem 0',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 10,
  },
  sectionTitle: {
    margin: 0,
    marginBottom: '0.6rem',
    fontSize: 10,
    fontWeight: 700,
  },
  linkList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.45rem',
  },
  link: {
    color: '#1d1d1f',
    textDecoration: 'none',
    fontSize: 10,
  },
  iconRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
  },
  iconLink: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    border: '1px solid rgba(21, 21, 21, 0.25)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#1d1d1f',
    textDecoration: 'none',
    background: 'rgba(255, 255, 255, 0.35)',
  },
  bottomBar: {
    borderTop: '1px solid rgba(21, 21, 21, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    fontSize: 9,
  },
  topButton: {
    border: '1px solid rgba(21, 21, 21, 0.25)',
    background: 'transparent',
    color: '#1d1d1f',
    borderRadius: 8,
    padding: '4px 10px',
    fontFamily: '"IBM Plex Mono", monospace',
    cursor: 'pointer',
    fontSize: 11,
  },
};

export default MainFooter;
