import React, { useState } from 'react';
import { FiPlus, FiTrash2, FiEdit2, FiMove } from 'react-icons/fi';

/**
 * Menu Item Editor Component
 * Allows adding, editing, and removing menu items
 * Includes visual angle adjuster
 */
function MenuItemEditor({ menuItems, onMenuItemsChange }) {
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAdd = () => {
    const newItem = {
      id: `item-${Date.now()}`,
      label: 'New Item',
      angle: -45,
      route: '/new',
    };
    onMenuItemsChange([...menuItems, newItem]);
    setEditingId(newItem.id);
    setShowAddForm(false);
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

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Menu Items</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={styles.addButton}
        >
          <FiPlus size={16} />
          Add Item
        </button>
      </div>

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
              stroke="#e5e7eb"
              strokeWidth="2"
            />

            {/* Center point */}
            <circle
              cx="100"
              cy="100"
              r="8"
              fill="#9ca3af"
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
                    stroke="#d1d5db"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                  />

                  {/* Draggable point */}
                  <circle
                    cx={x}
                    cy={y}
                    r="12"
                    fill={editingId === item.id ? '#3b82f6' : '#6b7280'}
                    stroke="#fff"
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
                    fontSize="10"
                    fill="#374151"
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
  );
}

const styles = {
  container: {
    padding: '1.5rem',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    maxHeight: '600px',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  visualAdjuster: {
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
  },
  adjusterTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
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
    fontSize: '12px',
    color: '#6b7280',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  item: {
    padding: '1rem',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  itemActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
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
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  deleteButton: {
    padding: '0.25rem',
    backgroundColor: 'transparent',
    color: '#ef4444',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  itemForm: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e5e7eb',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  formLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: '0.25rem',
  },
  input: {
    width: '100%',
    padding: '0.5rem',
    fontSize: '14px',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  slider: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    outline: 'none',
    background: '#e5e7eb',
    WebkitAppearance: 'none',
    appearance: 'none',
  },
  rangeIndicators: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '0.25rem',
    fontSize: '11px',
    color: '#9ca3af',
  },
  emptyState: {
    padding: '2rem',
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '14px',
  },
};

export default MenuItemEditor;
