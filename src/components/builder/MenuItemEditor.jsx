import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiTrash2, FiEdit2, FiMove, FiLock, FiCheck, FiX } from 'react-icons/fi';
import { zenPalette } from '../../styles/zenPalette';
import { useLicense } from '../../hooks/useLicense';

const TYPO_SCALE = 0.8;
const fs = (px) => `${Math.round(px * TYPO_SCALE * 10) / 10}px`;
const SVG_LABEL_SIZE = Math.round(10 * TYPO_SCALE);
const FREE_ITEM_LIMIT = 3;


/**
 * Menu Item Editor Component
 * Allows adding, editing, and removing menu items
 * Includes visual angle adjuster
 */
function MenuItemEditor({ menuItems, onMenuItemsChange }) {
  const [editingId, setEditingId] = useState(null);
  const [showProModal, setShowProModal] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [keyError, setKeyError] = useState('');
  const { isPro, activateKey, deactivate } = useLicense();
  const navigate = useNavigate();

  const handleAdd = () => {
    if (!isPro && menuItems.length >= FREE_ITEM_LIMIT) {
      setShowProModal(true);
      return;
    }
    const newItem = {
      id: `item-${Date.now()}`,
      label: 'New Item',
      angle: -45,
      route: '/new',
    };
    onMenuItemsChange([...menuItems, newItem]);
    setEditingId(newItem.id);
  };

  const handleUpdate = (id, field, value) => {
    const updated = menuItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onMenuItemsChange(updated);
  };

  const handleDelete = (id) => {
    onMenuItemsChange(menuItems.filter(item => item.id !== id));
    if (editingId === id) {
      setEditingId(null);
    }
  };

  const handleAngleDrag = (id, angle) => {
    handleUpdate(id, 'angle', angle);
  };

  const handleActivateKey = () => {
    setKeyError('');
    const result = activateKey(keyInput);
    if (result === 'ok') {
      setShowProModal(false);
      setKeyInput('');
    } else {
      setKeyError('Invalid license key. Please check and try again.');
    }
  };

  const isAtLimit = !isPro && menuItems.length >= FREE_ITEM_LIMIT;

  return (
    <div style={styles.container}>
      {/* Pro Key Modal */}
      {showProModal && (
        <div style={styles.modalOverlay} onClick={() => setShowProModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <FiLock size={18} />
              <span style={styles.modalTitle}>Pro Feature</span>
              <button style={styles.modalClose} onClick={() => setShowProModal(false)}>
                <FiX size={16} />
              </button>
            </div>
            <p style={styles.modalDesc}>
              More than {FREE_ITEM_LIMIT} menu items require a <strong>Pro license</strong>.
            </p>
            <button onClick={() => { setShowProModal(false); navigate('/pro'); }} style={styles.buyBtn}>
              Get Pro License →
            </button>
            <div style={styles.divider}>
              <span style={styles.dividerText}>already have a key?</span>
            </div>
            <input
              type="text"
              placeholder="ZNPRO-XXXX-XXXX-XX"
              value={keyInput}
              onChange={(e) => { setKeyInput(e.target.value); setKeyError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleActivateKey()}
              style={{ ...styles.keyInput, ...(keyError ? styles.keyInputError : {}) }}
            />
            {keyError && <p style={styles.errorText}>{keyError}</p>}
            <button onClick={handleActivateKey} style={styles.activateBtn}>
              <FiCheck size={14} /> Activate Pro
            </button>
          </div>
        </div>
      )}

      <div style={styles.quickPanel}>
        <div style={styles.header}>
          <div style={styles.quickLabel}>
            Menu Items
            {isPro && <span style={styles.proBadge}>PRO</span>}
          </div>
          <button
            onClick={handleAdd}
            style={{ ...styles.addButton, ...(isAtLimit ? styles.addButtonLocked : {}) }}
          >
            {isAtLimit ? <FiLock size={15} /> : <FiPlus size={16} />}
            {isAtLimit ? 'Pro required' : 'Add Item'}
          </button>
          <p style={styles.quickHint}>Items unten bearbeiten und Winkel anpassen.</p>
          {isPro && (
            <button style={styles.deactivateBtn} onClick={deactivate}>
              Remove license
            </button>
          )}
        </div>
      </div>

      <div style={styles.contentPanel}>
        {/* Visual Angle Adjuster */}
        <div style={styles.visualAdjuster}>
          <div style={styles.adjusterTitle}>Visual Angle Adjuster</div>
          <div style={styles.circleContainer}>
            <svg width="200" height="200" viewBox="0 0 200 200">
              {/* Circle outline */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke={zenPalette.border}
                strokeWidth="2"
              />

              {/* Center point */}
              <circle
                cx="100"
                cy="100"
                r="8"
                fill={zenPalette.textMuted}
              />

              {/* Menu items as draggable points */}
              {menuItems.map((item) => {
                const rad = ((item.angle || 0) - 90) * (Math.PI / 180);
                const x = 100 + Math.cos(rad) * 80;
                const y = 100 + Math.sin(rad) * 80;

                return (
                  <g key={item.id}>
                    {/* Line to center */}
                    <line
                      x1="100"
                      y1="100"
                      x2={x}
                      y2={y}
                      stroke={zenPalette.border}
                      strokeWidth="1"
                      strokeDasharray="3,3"
                    />

                    {/* Draggable point */}
                    <circle
                      cx={x}
                      cy={y}
                      r="12"
                      fill={editingId === item.id ? zenPalette.gold : zenPalette.textMuted}
                      stroke="#121212"
                      strokeWidth="2"
                      style={{ cursor: 'grab' }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setEditingId(item.id);

                        const handleMouseMove = (moveEvent) => {
                          const svg = e.target.closest('svg');
                          const rect = svg.getBoundingClientRect();
                          const centerX = rect.left + 100;
                          const centerY = rect.top + 100;
                          const mouseX = moveEvent.clientX - centerX;
                          const mouseY = moveEvent.clientY - centerY;

                          let angle = Math.atan2(mouseY, mouseX) * (180 / Math.PI) + 90;
                          // Normalize to -180 to 180
                          if (angle > 180) angle -= 360;

                          handleAngleDrag(item.id, Math.round(angle));
                        };

                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };

                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    />

                    {/* Label */}
                    <text
                      x={x}
                      y={y - 20}
                      textAnchor="middle"
                      fontSize={SVG_LABEL_SIZE}
                      fill={zenPalette.text}
                      fontWeight="600"
                    >
                      {item.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        <div style={styles.adjusterHint}>
          <FiMove size={14} />
          Drag the dots to adjust angles
        </div>
      </div>

        <h4 style={styles.itemsSectionTitle}>Menu Items</h4>

        {/* Menu Items List */}
        <div style={styles.itemsList}>
          {menuItems.map((item) => (
            <div
              key={item.id}
              style={{
                ...styles.item,
                ...(editingId === item.id ? styles.itemActive : {}),
              }}
              onClick={() => setEditingId(item.id)}
            >
              <div style={styles.itemHeader}>
                <div style={styles.itemLabel}>
                  <FiEdit2 size={14} />
                  {item.label}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  style={styles.deleteButton}
                >
                  <FiTrash2 size={14} />
                </button>
              </div>

              {editingId === item.id && (
                <div style={styles.itemForm}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Label</label>
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => handleUpdate(item.id, 'label', e.target.value)}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Route/Link</label>
                    <input
                      type="text"
                      value={item.route || ''}
                      onChange={(e) => handleUpdate(item.id, 'route', e.target.value)}
                      placeholder="/about"
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Angle: {item.angle}°</label>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={item.angle || 0}
                      onChange={(e) => handleUpdate(item.id, 'angle', parseInt(e.target.value))}
                      style={styles.slider}
                    />
                    <div style={styles.rangeIndicators}>
                      <span>-180°</span>
                      <span>0°</span>
                      <span>180°</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {menuItems.length === 0 && (
          <div style={styles.emptyState}>
            <p>No menu items yet. Click "Add Item" to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  quickPanel: {
    padding: '0.8rem',
    backgroundColor: zenPalette.panel,
    borderRadius: '12px',
    border: `1px solid ${zenPalette.border}`,
    minHeight: '112px',
    display: 'flex',
  },
  contentPanel: {
    padding: '1rem',
    backgroundColor: zenPalette.panel,
    borderRadius: '12px',
    border: `1px solid ${zenPalette.border}`,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
    minHeight: '540px',
    maxHeight: '540px',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    gap: '0.55rem',
    width: '100%',
  },
  quickLabel: {
    fontSize: fs(12),
    color: zenPalette.textMuted,
    fontFamily: '"IBM Plex Mono", monospace',
    margin: 0,
  },
  quickHint: {
    fontSize: fs(11),
    color: zenPalette.textMuted,
    margin: 0,
    fontFamily: '"IBM Plex Mono", monospace',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '0.52rem 0.75rem',
    backgroundColor: zenPalette.gold,
    color: '#121212',
    border: 'none',
    borderRadius: '8px',
    fontSize: fs(13),
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  addButtonLocked: {
    backgroundColor: zenPalette.panelSoft,
    color: zenPalette.textMuted,
    border: `1px solid ${zenPalette.border}`,
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: zenPalette.panel,
    border: `1px solid ${zenPalette.border}`,
    borderRadius: '12px',
    padding: '1.5rem',
    width: '320px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
    boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: zenPalette.gold,
  },
  modalTitle: {
    flex: 1,
    fontFamily: '"IBM Plex Mono", monospace',
    fontWeight: 700,
    fontSize: fs(14),
    letterSpacing: '0.05em',
  },
  modalClose: {
    background: 'none',
    border: 'none',
    color: zenPalette.textMuted,
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
  },
  modalDesc: {
    margin: 0,
    fontSize: fs(13),
    color: zenPalette.textMuted,
    lineHeight: 1.5,
  },
  keyInput: {
    width: '100%',
    padding: '0.6rem 0.75rem',
    fontSize: fs(13),
    fontFamily: '"IBM Plex Mono", monospace',
    letterSpacing: '0.05em',
    border: `1px solid ${zenPalette.border}`,
    borderRadius: '8px',
    backgroundColor: '#141417',
    color: zenPalette.text,
    outline: 'none',
    boxSizing: 'border-box',
  },
  keyInputError: {
    borderColor: zenPalette.danger,
  },
  errorText: {
    margin: 0,
    fontSize: fs(11),
    color: zenPalette.danger,
    fontFamily: '"IBM Plex Mono", monospace',
  },
  buyBtn: {
    display: 'block',
    textAlign: 'center',
    padding: '0.75rem',
    backgroundColor: zenPalette.gold,
    color: '#121212',
    borderRadius: '8px',
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: fs(13),
    fontWeight: 700,
    textDecoration: 'none',
    letterSpacing: '0.03em',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  dividerText: {
    flex: 1,
    textAlign: 'center',
    fontSize: fs(11),
    color: zenPalette.textMuted,
    fontFamily: '"IBM Plex Mono", monospace',
    borderTop: `1px solid ${zenPalette.border}`,
    paddingTop: '0.6rem',
  },
  activateBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.65rem',
    backgroundColor: zenPalette.gold,
    color: '#121212',
    border: 'none',
    borderRadius: '8px',
    fontSize: fs(13),
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: '"IBM Plex Mono", monospace',
  },
  activateBtnLoading: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  proBadge: {
    marginLeft: '0.5rem',
    fontSize: fs(9),
    padding: '1px 6px',
    backgroundColor: zenPalette.gold + '33',
    color: zenPalette.gold,
    borderRadius: 99,
    fontWeight: 700,
    letterSpacing: '0.08em',
    verticalAlign: 'middle',
  },
  deactivateBtn: {
    background: 'none',
    border: 'none',
    color: zenPalette.textMuted,
    fontSize: fs(10),
    fontFamily: '"IBM Plex Mono", monospace',
    cursor: 'pointer',
    padding: 0,
    textDecoration: 'underline',
    textAlign: 'left',
  },
  visualAdjuster: {
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: zenPalette.panelSoft,
    borderRadius: '8px',
  },
  adjusterTitle: {
    fontSize: fs(14),
    fontWeight: '600',
    color: zenPalette.text,
    marginBottom: '1rem',
    textAlign: 'center',
  },
  circleContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '0.5rem',
  },
  adjusterHint: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontSize: fs(12),
    color: zenPalette.textMuted,
  },
  itemsSectionTitle: {
    fontSize: fs(16),
    fontWeight: '600',
    color: zenPalette.text,
    margin: '0 0 0.9rem 0',
    paddingTop: '0.9rem',
    borderTop: `1px solid ${zenPalette.border}`,
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  item: {
    padding: '1rem',
    backgroundColor: zenPalette.panelSoft,
    borderRadius: '8px',
    border: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  itemActive: {
    backgroundColor: '#272329',
    borderColor: zenPalette.gold,
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: fs(14),
    fontWeight: '500',
    color: zenPalette.text,
  },
  deleteButton: {
    padding: '0.25rem',
    backgroundColor: 'transparent',
    color: zenPalette.danger,
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  itemForm: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: `1px solid ${zenPalette.border}`,
  },
  formGroup: {
    marginBottom: '1rem',
  },
  formLabel: {
    display: 'block',
    fontSize: fs(12),
    fontWeight: '500',
    color: zenPalette.textMuted,
    marginBottom: '0.25rem',
  },
  input: {
    width: '100%',
    padding: '0.5rem',
    fontSize: fs(14),
    border: `1px solid ${zenPalette.border}`,
    borderRadius: '6px',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#141417',
    color: zenPalette.text,
  },
  slider: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    outline: 'none',
    background: zenPalette.border,
    WebkitAppearance: 'none',
    appearance: 'none',
  },
  rangeIndicators: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '0.25rem',
    fontSize: fs(11),
    color: zenPalette.textMuted,
  },
  emptyState: {
    padding: '2rem',
    textAlign: 'center',
    color: zenPalette.textMuted,
    fontSize: fs(14),
  },
};

export default MenuItemEditor;
