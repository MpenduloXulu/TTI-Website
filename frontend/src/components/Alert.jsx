import React from 'react';
import '../styles/components.css';

const Alert = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  const iconMap = {
    danger: '⚠️',
    error: '❌',
    warning: '⚡',
    success: '✓',
    info: 'ℹ️'
  };

  const icon = iconMap[type] || iconMap.info;
  const alertClass = `alert alert-${type}`;

  return (
    <div className={alertClass} role="alert">
      <div className="alert-icon">{icon}</div>
      <div className="alert-content">
        <span>{message}</span>
      </div>
      {onClose && (
        <button className="alert-close" onClick={onClose} aria-label="Close alert">×</button>
      )}
    </div>
  );
};

export default Alert;
