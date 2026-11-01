import React from 'react';
import { Card } from './Card';
import './StatCard.css';

export const StatCard = ({
  title,
  value,
  subvalue,
  trend,
  trendDirection = 'neutral', // 'positive' | 'negative' | 'neutral' | 'live'
  icon: Icon = null,
  badgeText = '',
  onClick,
  className = '',
}) => {
  return (
    <Card hover={!!onClick} onClick={onClick} className={`stat-card ${className}`}>
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {Icon && (
          <div className="stat-card-icon-wrapper">
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="stat-card-body">
        <div className="stat-card-value-row">
          <span className="stat-card-value">{value}</span>
          {badgeText && <span className="stat-card-badge">{badgeText}</span>}
        </div>

        {(subvalue || trend) && (
          <div className="stat-card-meta">
            {trend && (
              <span className={`stat-card-trend trend-${trendDirection}`}>
                {trend}
              </span>
            )}
            {subvalue && <span className="stat-card-subvalue">{subvalue}</span>}
          </div>
        )}
      </div>
    </Card>
  );
};
