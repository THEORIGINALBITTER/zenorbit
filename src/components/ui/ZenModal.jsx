import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

function ZenModal({ open, onClose, title, palette, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKeyDown);
    const previouslyFocused = document.activeElement;
    dialogRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose?.(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 3000,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '48px 20px', overflowY: 'auto',
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        style={{
          width: '100%', maxWidth: 640,
          background: palette.panel, color: palette.text,
          border: `1px solid ${palette.borderStrong}`, borderRadius: 14,
          padding: 28, outline: 'none',
          fontFamily: '"IBM Plex Mono", monospace', fontSize: 13, lineHeight: 1.7,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <h2 style={{ margin: 0, color: palette.gold }}>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            style={{
              flexShrink: 0, width: 32, height: 32, borderRadius: 8,
              border: `1px solid ${palette.borderStrong}`, background: 'transparent',
              color: palette.text, cursor: 'pointer', font: 'inherit', fontSize: 16, lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

export default ZenModal;
