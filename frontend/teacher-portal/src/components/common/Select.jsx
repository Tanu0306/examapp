import React from 'react';

// Simple reusable select component
// Props: label, value, onChange, options (array of {value, label}), required, className
export const Select = ({ label, value, onChange, options = [], required = false, className = '' }) => (
  <div className={`form-group ${className}`.trim()}>
    {label && <label className="form-label">{label}{required && <span className="req">*</span>}</label>}
    <select className="form-select" value={value} onChange={(e) => onChange(e.target.value)} required={required}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);
