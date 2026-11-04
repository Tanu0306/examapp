import React from 'react';
import { EditIcon, TrashIcon } from './Icons';
import { Button } from './Button';

/**
 * Simple visual card for a question bank folder.
 * Displays name, optional description, and the number of questions it contains.
 * Clicking the card (except the action icons) selects the folder.
 */
export const FolderCard = ({
  folder,
  questionCount,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const cardStyle = {
    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-sm)',
    padding: '12px 16px',
    backgroundColor: 'var(--bg-surface)',
    cursor: 'pointer',
    flex: '1 1 200px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    position: 'relative',
  };

  const actionStyle = {
    position: 'absolute',
    top: '6px',
    right: '6px',
    display: 'flex',
    gap: '4px',
  };

  return (
    <div
      style={cardStyle}
      className="folder-card"
      onClick={() => onSelect(folder.id)}
    >
      <div style={actionStyle} className="folder-card-actions" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="folder-action-btn"
          title="Rename folder"
          onClick={() => onEdit(folder)}
        >
          <EditIcon size={14} />
        </button>
        <button
          type="button"
          className="folder-action-btn text-danger"
          title="Delete folder"
          onClick={() => onDelete(folder)}
        >
          <TrashIcon size={14} />
        </button>
      </div>
      <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
        {folder.name}
      </h4>
      {folder.description && (
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          {folder.description}
        </p>
      )}
      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
        {questionCount} question{questionCount !== 1 ? 's' : ''}
      </span>
    </div>
  );
};

