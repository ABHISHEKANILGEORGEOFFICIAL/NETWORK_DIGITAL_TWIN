import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Trash2 } from 'lucide-react';
import { getComponentDef } from './componentTypes';
import { DesignerComponentType } from '../../types';

interface DesignerNodeData {
  id: string;
  componentType: DesignerComponentType;
  label: string;
  config: {
    name: string;
    ip_address: string;
    description: string;
    speed_mbps: number;
    vlan?: number;
    ports?: number;
    ssid?: string;
    os?: string;
  };
  isSelected?: boolean;
  onDelete?: (id: string) => void;
}

export const DesignerNode = memo(({ data, selected }: { data: DesignerNodeData; selected?: boolean }) => {
  const def = getComponentDef(data.componentType);
  const Icon = def.icon;

  return (
    <div
      className={`relative min-w-[160px] bg-slate-900/95 border rounded-xl p-3 shadow-xl backdrop-blur-md transition-all duration-200 cursor-pointer group ${
        selected ? 'ring-2 ring-cyan-400 border-cyan-400 scale-105' : def.borderColor
      }`}
    >
      {/* Handles */}
      <Handle type="target" position={Position.Top} className="!bg-cyan-500 !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Bottom} className="!bg-cyan-500 !w-2.5 !h-2.5" />
      <Handle type="target" position={Position.Left} id="left" className="!bg-cyan-500 !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Right} id="right" className="!bg-cyan-500 !w-2.5 !h-2.5" />

      {/* Delete button */}
      {selected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onDelete?.(data.id);
          }}
          className="absolute -top-2 -right-2 bg-rose-500 hover:bg-rose-400 text-white p-1 rounded-full shadow-lg opacity-100 transition-all z-10"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}

      {/* Header */}
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-lg border ${def.bgColor} ${def.color} ${def.borderColor}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-bold text-slate-100 leading-tight truncate max-w-[100px]">
            {data.config.name || data.label}
          </h4>
          <span className="text-[9px] uppercase font-mono text-slate-400">
            {data.config.ip_address}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="mt-2 pt-2 border-t border-surface-border/60 space-y-0.5 text-[10px]">
        <div className="flex items-center justify-between text-slate-400">
          <span>Type</span>
          <span className="font-mono text-slate-300">{def.label}</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>Speed</span>
          <span className="font-mono text-slate-300">
            {data.config.speed_mbps >= 10000
              ? `${data.config.speed_mbps / 10000}0G`
              : `${data.config.speed_mbps}M`}
          </span>
        </div>
        {data.config.ports && (
          <div className="flex items-center justify-between text-slate-400">
            <span>Ports</span>
            <span className="font-mono text-slate-300">{data.config.ports}</span>
          </div>
        )}
        {data.config.vlan && (
          <div className="flex items-center justify-between text-slate-400">
            <span>VLAN</span>
            <span className="font-mono text-slate-300">{data.config.vlan}</span>
          </div>
        )}
        {data.config.ssid && (
          <div className="flex items-center justify-between text-slate-400">
            <span>SSID</span>
            <span className="font-mono text-slate-300 truncate max-w-[80px]">{data.config.ssid}</span>
          </div>
        )}
        {data.config.os && (
          <div className="flex items-center justify-between text-slate-400">
            <span>OS</span>
            <span className="font-mono text-slate-300">{data.config.os}</span>
          </div>
        )}
      </div>
    </div>
  );
});
