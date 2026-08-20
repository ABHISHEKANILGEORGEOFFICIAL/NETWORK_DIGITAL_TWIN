import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Router, Network, Shield, Server, Wifi, Cpu, Laptop,
  Globe, AlertCircle, CheckCircle2, AlertTriangle, XCircle
} from 'lucide-react';
import { getStatusColor } from '../../utils/formatters';

const iconMap = {
  router: Router,
  switch: Network,
  firewall: Shield,
  server: Server,
  access_point: Wifi,
  gateway: Globe,
  load_balancer: Cpu,
  endpoint: Laptop,
};

export const CustomDeviceNode = memo(({ data, selected }: { data: any; selected?: boolean }) => {
  const devType = data.device_type || 'router';
  const Icon = iconMap[devType as keyof typeof iconMap] || Server;
  const status = data.status || 'healthy';
  const colors = getStatusColor(status);

  return (
    <div
      className={`relative min-w-[170px] bg-slate-900/95 border rounded-xl p-3 shadow-xl backdrop-blur-md transition-all duration-200 cursor-pointer ${
        selected ? 'ring-2 ring-cyan-400 border-cyan-400 scale-105' : colors.border
      } ${status === 'critical' ? 'glow-red' : status === 'warning' ? 'glow-amber' : ''}`}
    >
      {/* React Flow Handles for top/bottom/left/right connections */}
      <Handle type="target" position={Position.Top} className="!bg-cyan-500 !w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-cyan-500 !w-2 !h-2" />
      <Handle type="target" position={Position.Left} id="left" className="!bg-cyan-500 !w-2 !h-2" />
      <Handle type="source" position={Position.Right} id="right" className="!bg-cyan-500 !w-2 !h-2" />

      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg border ${colors.bg} ${colors.text} ${colors.border}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 leading-tight truncate max-w-[95px]">
              {data.name || data.id}
            </h4>
            <span className="text-[9px] uppercase font-mono text-slate-400">
              {data.ip_address}
            </span>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center">
          <span className={`w-2 h-2 rounded-full ${colors.dot} ${status === 'critical' ? 'animate-ping' : ''}`} />
        </div>
      </div>

      {/* Mini Metric Bars */}
      <div className="mt-2.5 pt-2 border-t border-surface-border/60 space-y-1 text-[10px]">
        {/* CPU utilization */}
        <div className="flex items-center justify-between text-slate-400">
          <span>CPU</span>
          <span className="font-mono text-slate-200">{data.cpu || 0}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              (data.cpu || 0) > 85 ? 'bg-rose-500' : (data.cpu || 0) > 60 ? 'bg-amber-500' : 'bg-cyan-500'
            }`}
            style={{ width: `${Math.min(100, data.cpu || 0)}%` }}
          />
        </div>

        {/* Health Score */}
        <div className="flex items-center justify-between text-slate-400 pt-0.5">
          <span>Health</span>
          <span className="font-mono text-emerald-400 font-semibold">{data.health_score || 100}%</span>
        </div>
      </div>

      {/* Alert Count Pill */}
      {(data.alerts_count || 0) > 0 && (
        <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-md animate-bounce">
          {data.alerts_count}
        </span>
      )}
    </div>
  );
});
