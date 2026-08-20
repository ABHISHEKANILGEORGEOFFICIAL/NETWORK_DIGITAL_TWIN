import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  color?: 'cyan' | 'green' | 'amber' | 'red' | 'blue' | 'purple';
  statusDot?: boolean;
  onClick?: () => void;
}

const colorMap = {
  cyan: {
    iconBg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    glow: 'group-hover:border-cyan-500/40',
  },
  green: {
    iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    glow: 'group-hover:border-emerald-500/40',
  },
  amber: {
    iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    glow: 'group-hover:border-amber-500/40',
  },
  red: {
    iconBg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    glow: 'group-hover:border-rose-500/40',
  },
  blue: {
    iconBg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    glow: 'group-hover:border-blue-500/40',
  },
  purple: {
    iconBg: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    glow: 'group-hover:border-purple-500/40',
  },
};

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  change,
  changeType = 'neutral',
  icon: Icon,
  color = 'cyan',
  statusDot = false,
  onClick,
}) => {
  const styles = colorMap[color];

  return (
    <div
      onClick={onClick}
      className={`group relative bg-surface border border-surface-border rounded-xl p-5 shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-0.5 ${styles.glow} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h2 className="text-2xl font-bold text-slate-100 tracking-tight">{value}</h2>
            {statusDot && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>

        <div className={`p-3 rounded-lg border ${styles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {change && (
        <div className="mt-3 pt-3 border-t border-surface-border/50 flex items-center justify-between text-xs">
          <span
            className={
              changeType === 'positive'
                ? 'text-emerald-400 font-medium'
                : changeType === 'negative'
                ? 'text-rose-400 font-medium'
                : 'text-slate-400'
            }
          >
            {change}
          </span>
          <span className="text-slate-500">vs last hour</span>
        </div>
      )}
    </div>
  );
};
