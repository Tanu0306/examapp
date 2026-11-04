import React from 'react';
import './StatusBadge.css';

/**
 * Simple badge component to display a status with a colour.
 * Accepted statuses: 'Online', 'Offline', 'Never Logged In'.
 * Any other string will be rendered with a neutral style.
 */
const StatusBadge = ({ status }) => {
  let colorClass = 'badge-neutral';
  if (status === 'Online') colorClass = 'badge-online';
  else if (status === 'Offline') colorClass = 'badge-offline';
  else if (status === 'Never Logged In') colorClass = 'badge-never';

  return (
    <span className={`status-badge ${colorClass}`}>{status}</span>
  );
};

export default StatusBadge;

