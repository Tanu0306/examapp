import React from 'react';
import { ChevronDownIcon } from './Icons';
import './Select.css';

export const Select = ({
  label,
  id,
  value,
  onChange,
  options = [],
  required = false,
  error = '',
  helperText = '',
  disabled = false,
  className = '',
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`select-field-group ${error ? 'has-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={selectId} className="select-label">
          {label}
          {required && <span className="select-required-star">*</span>}
        </label>
      )}

      <div className="select-wrapper">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className="select-control"
          {...props}
        >
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const lbl = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val}>
                {lbl}
              </option>
            );
          })}
        </select>
        <span className="select-chevron" aria-hidden="true">
          <ChevronDownIcon size={16} />
        </span>
      </div>

      {error ? (
        <p className="select-error-msg">{error}</p>
      ) : helperText ? (
        <p className="select-helper-msg">{helperText}</p>
      ) : null}
    </div>
  );
};
