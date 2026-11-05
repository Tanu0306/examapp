import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { XIcon, CheckIcon } from './Icons';

/**
 * Modal for creating or renaming a folder.
 * Props:
 *   isOpen: boolean – whether the modal is visible
 *   onClose: () => void – close handler
 *   onSave: (name: string) => void – called when user confirms
 *   initialName?: string – pre‑fill for edit mode
 */
export const FolderModal = ({
  isOpen,
  onClose,
  onSave,
  initialName = '',
}) => {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState('');

  // Reset fields when the modal opens/closes or initial values change
  useEffect(() => {
    setName(initialName);
    setError('');
  }, [isOpen, initialName]);

  const handleSave = () => {
    if (!name.trim()) {
      setError('Folder name cannot be empty');
      return;
    }
    onSave(name.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-header">
          <h3 className="modal-title"> {initialName ? 'Rename Folder' : 'Create Folder'} </h3>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <XIcon size={16} />
          </button>
        </div>
        <div className="modal-body-padding">
          {error && (
            <div className="authoring-form-error">
              <span>{error}</span>
            </div>
          )}
          <div className="form-group">
            <label htmlFor="folder-name" style={{ fontWeight: 500 }}>
              Folder Name
            </label>
            <input
              id="folder-name"
              type="text"
              className="toolbar-search-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter folder name"
            />
          </div>
        </div>
        <div className="modal-footer">
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSave} icon={CheckIcon}>Save</Button>
        </div>
      </div>
    </div>
  );
};

