import React from 'react';

const statusConfig = {
  'Submitted': { class: 'badge-submitted', label: 'Submitted' },
  'Acknowledged': { class: 'badge-acknowledged', label: 'Acknowledged' },
  'Assigned': { class: 'badge-assigned', label: 'Assigned' },
  'In Progress': { class: 'badge-in-progress', label: 'In Progress' },
  'Resolved': { class: 'badge-resolved', label: 'Resolved' },
  'Closed': { class: 'badge-closed', label: 'Closed' },
  'Alert Sent': { class: 'badge-priority-emergency', label: 'Alert Sent' },
  'Response in Progress': { class: 'badge-in-progress', label: 'Responding' }
};

export const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || { class: 'badge-submitted', label: status || 'Unknown' };
  return (
    <span className={`badge ${config.class}`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor' }} />
      {config.label}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const p = (priority || 'Medium').toLowerCase();
  let badgeClass = 'badge-priority-medium';
  if (p === 'low') badgeClass = 'badge-priority-low';
  if (p === 'high') badgeClass = 'badge-priority-high';
  if (p === 'emergency') badgeClass = 'badge-priority-emergency';

  return (
    <span className={`badge ${badgeClass}`}>
      {priority}
    </span>
  );
};
