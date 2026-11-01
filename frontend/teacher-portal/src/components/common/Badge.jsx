import React from 'react';
import './Badge.css';

export const Badge = ({
  children,
  variant = 'neutral', // 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  size = 'md',        // 'sm' | 'md'
  dot = false,
  pulse = false,
  className = '',
}) => {
  return (
    <span className={`badge badge-${variant} badge-${size} ${className}`}>
      {dot && <span className={`badge-dot ${pulse ? 'badge-pulse' : ''}`} />}
      <span>{children}</span>
    </span>
  );
};
