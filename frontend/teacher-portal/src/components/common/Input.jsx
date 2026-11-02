import React from 'react';

// Simple reusable input component
// Props: label, value, onChange, placeholder, type, required, disabled, className
export const Input = ({ label, value, onChange, placeholder = '', type = 'text', required = false, disabled = false, readOnly = false, className = '' }) => (
  <div className={`form-group ${className}`.trim()}>
    {label && <label className="form-label">{label}{required && <span className="req">*</span>}</label>}
    <input
      type={type}
      className="form-input"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
    />
  </div>
);
