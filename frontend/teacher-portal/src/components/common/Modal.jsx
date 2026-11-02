// src/components/common/Modal.jsx
import React from 'react';
import ReactDOM from 'react-dom';
import './Modal.css';

export const Modal = ({ onClose, title, children }) => {
    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                {title && <h3 className="modal-title">{title}</h3>}
                <div className="modal-body">{children}</div>
                <button className="modal-close" onClick={onClose}>✕</button>
            </div>
        </div>,
        document.body
    );
};

export default Modal;

