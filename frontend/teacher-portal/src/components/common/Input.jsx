import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon } from './Icons';
import './Input.css';

export const Input = ({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  error = '',
  helperText = '',
  disabled = false,
  icon: Icon = null,
  isPassword = false,
  className = '',
  autoComplete,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`input-field-group ${error ? 'has-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span className="input-required-star">*</span>}
        </label>
      )}

      <div className={`input-wrapper ${Icon ? 'has-prefix-icon' : ''} ${isPassword ? 'has-suffix-action' : ''}`}>
        {Icon && (
          <span className="input-prefix-icon" aria-hidden="true">
            <Icon size={16} />
          </span>
        )}

        <input
          id={inputId}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          className="input-control"
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            className="input-suffix-btn"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex="-1"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
          </button>
        )}
      </div>

      {error ? (
        <p className="input-error-msg">{error}</p>
      ) : helperText ? (
        <p className="input-helper-msg">{helperText}</p>
      ) : null}
    </div>
  );
};
