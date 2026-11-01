import React from 'react';
import './Card.css';

export const Card = ({
  children,
  className = '',
  hover = false,
  onClick,
  ...props
}) => {
  return (
    <div
      className={`card ${hover ? 'card-hover' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({
  title,
  subtitle,
  badge,
  action,
  className = '',
  children,
}) => {
  return (
    <div className={`card-header ${className}`}>
      {(title || subtitle || badge) ? (
        <div className="card-header-main">
          <div className="card-header-title-row">
            {title && <h3 className="card-title">{title}</h3>}
            {badge && <div className="card-badge">{badge}</div>}
          </div>
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      ) : null}
      {children}
      {action && <div className="card-header-action">{action}</div>}
    </div>
  );
};

export const CardBody = ({ children, className = '', noPadding = false }) => {
  return (
    <div className={`card-body ${noPadding ? 'card-body-no-padding' : ''} ${className}`}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '' }) => {
  return <div className={`card-footer ${className}`}>{children}</div>;
};
