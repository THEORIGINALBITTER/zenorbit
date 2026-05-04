import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { zenPalette } from '../../styles/zenPalette';

const itemStyle = {
  width: '100%',
  border: 'none',
  background: 'transparent',
  color: zenPalette.text,
  padding: '0.5rem 0.6rem',
  textAlign: 'left',
  cursor: 'pointer',
  fontFamily: '"IBM Plex Mono", monospace',
  fontSize: 12,
  lineHeight: 1.35,
};

function ZenSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Auswaehlen',
  disabled = false,
  menuMaxHeight = 240,
  style,
}) {
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) || null,
    [options, value]
  );

  useEffect(() => {
    if (!open) return;
    const updatePos = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
      });
    };
    updatePos();
    window.addEventListener('resize', updatePos);
    window.addEventListener('scroll', updatePos, true);
    return () => {
      window.removeEventListener('resize', updatePos);
      window.removeEventListener('scroll', updatePos, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const selectedIndex = options.findIndex((option) => option.value === value);
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [open, options, value]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event) => {
      if (containerRef.current?.contains(event.target)) return;
      if (menuRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown, { passive: true });
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const selectValue = (nextValue) => {
    if (disabled) return;
    onChange?.(nextValue);
    setOpen(false);
  };

  const onTriggerKeyDown = (event) => {
    if (disabled) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setOpen((prev) => !prev);
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setHighlightedIndex((prev) => Math.min(options.length - 1, prev + 1));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setHighlightedIndex((prev) => Math.max(0, prev - 1));
      return;
    }
    if (event.key === 'Tab') {
      setOpen(false);
    }
  };

  const onMenuKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((prev) => Math.min(options.length - 1, prev + 1));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((prev) => Math.max(0, prev - 1));
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const option = options[highlightedIndex];
      if (option) selectValue(option.value);
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', ...style }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => !disabled && setOpen((prev) => !prev)}
        onKeyDown={onTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        style={{
          width: '100%',
          minHeight: 34,
          padding: '0.5rem 0.6rem',
          borderRadius: 8,
          border: `1px solid ${open ? zenPalette.borderStrong : zenPalette.border}`,
          backgroundColor: '#141417',
          color: zenPalette.text,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 12,
          lineHeight: 1.2,
          textAlign: 'left',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          boxShadow: open ? `0 0 0 1px ${zenPalette.gold}2a` : 'none',
          transition: 'border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption?.label || placeholder}
        </span>
        <span style={{ color: zenPalette.gold, fontSize: 10, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>▾</span>
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          tabIndex={-1}
          onKeyDown={onMenuKeyDown}
          style={{
            position: 'fixed',
            top: menuPos.top,
            left: menuPos.left,
            width: menuPos.width,
            maxHeight: menuMaxHeight,
            overflowY: 'auto',
            backgroundColor: '#0f1218',
            border: `1px solid ${zenPalette.borderStrong}`,
            borderRadius: 10,
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45)',
            zIndex: 2000,
            padding: '0.25rem',
          }}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isHighlighted = index === highlightedIndex;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => selectValue(option.value)}
                style={{
                  ...itemStyle,
                  borderRadius: 7,
                  backgroundColor: isHighlighted ? `${zenPalette.gold}1f` : 'transparent',
                  color: isSelected ? zenPalette.gold : zenPalette.text,
                  fontWeight: isSelected ? 700 : 500,
                  boxShadow: isHighlighted ? `inset 0 0 0 1px ${zenPalette.gold}3d` : 'none',
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}

export default ZenSelect;
