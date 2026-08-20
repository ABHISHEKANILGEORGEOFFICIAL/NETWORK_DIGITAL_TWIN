import React from 'react';
import { getStatusColor } from '../../utils/formatters';

interface BadgeProps {
  status?: string;
  variant?: 'status' | 'default' | 'outline' | 'severity';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status = 'healthy', children, className = '' }) => {
  const colors = getStatusColor(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {children}
    </span>
  );
};
