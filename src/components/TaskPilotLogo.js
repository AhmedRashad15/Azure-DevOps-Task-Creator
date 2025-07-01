import React from 'react';

const TaskPilotLogo = ({ width = 180, height = 40 }) => (
  <svg width={width} height={height} viewBox="0 0 180 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g>
      {/* Paper plane */}
      <polygon points="10,30 40,20 10,10 15,20" fill="#2563eb"/>
      <polygon points="15,20 22,18 18,24" fill="#60a5fa"/>
      {/* Checklist */}
      <rect x="50" y="12" width="18" height="16" rx="3" fill="#f1f5f9" stroke="#2563eb" strokeWidth="2"/>
      {/* Checkmark inside checklist */}
      <polyline points="54,20 57,23 62,16" fill="none" stroke="#22c55e" strokeWidth="2"/>
      {/* Text */}
      <text x="75" y="26" fontFamily="Segoe UI, Arial, sans-serif" fontSize="22" fill="#2563eb" fontWeight="bold">Task Pilot</text>
    </g>
  </svg>
);

export default TaskPilotLogo; 