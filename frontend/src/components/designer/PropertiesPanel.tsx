import React from 'react';
import { X, Settings } from 'lucide-react';
import { getComponentDef } from './componentTypes';
import { DesignerComponentType } from '../../types';

interface PropertyField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select';
  options?: string[];
  suffix?: string;
}

const FIELD_MAP: Record<string, PropertyField[]> = {
  router: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'ip_address', label: 'IP Address', type: 'text' },
    { key: 'description', label: 'Description', type: 'text' },
    { key: 'speed_mbps', label: 'Speed', type: 'number', suffix: 'Mbps' },
    { key: 'ports', label: 'Ports', type: 'number' },
  ],
  switch_l2: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'ip_address', label: 'IP Address', type: 'text' },
    { key: 'description', label: 'Description', type: 'text' },
    { key: 'speed_mbps', label: 'Speed', type: 'number', suffix: 'Mbps' },
    { key: 'ports', label: 'Ports', type: 'number' },
    { key: 'vlan', label: 'VLAN ID', type: 'number' },
  ],
  switch_l3: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'ip_address', label: 'IP Address', type: 'text' },
    { key: 'description', label: 'Description', type: 'text' },
    { key: 'speed_mbps', label: 'Speed', type: 'number', suffix: 'Mbps' },
    { key: 'ports', label: 'Ports', type: 'number' },
  ],
  firewall: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'ip_address', label: 'IP Address', type: 'text' },
    { key: 'description', label: 'Description', type: 'text' },
    { key: 'speed_mbps', label: 'Throughput', type: 'number', suffix: 'Mbps' },
    { key: 'ports', label: 'Interfaces', type: 'number' },
  ],
  server: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'ip_address', label: 'IP Address', type: 'text' },
    { key: 'description', label: 'Description', type: 'text' },
    { key: 'speed_mbps', label: 'NIC Speed', type: 'number', suffix: 'Mbps' },
    { key: 'os', label: 'OS', type: 'select', options: ['Linux', 'Windows', 'macOS', 'FreeBSD'] },
    { key: 'role', label: 'Role', type: 'select', options: ['web', 'database', 'api', 'cache', 'dns', 'mail', 'file'] },
  ],
  access_point: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'ip_address', label: 'IP Address', type: 'text' },
    { key: 'description', label: 'Description', type: 'text' },
    { key: 'speed_mbps', label: 'Speed', type: 'number', suffix: 'Mbps' },
    { key: 'ssid', label: 'SSID', type: 'text' },
  ],
  load_balancer: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'ip_address', label: 'VIP Address', type: 'text' },
    { key: 'description', label: 'Description', type: 'text' },
    { key: 'speed_mbps', label: 'Throughput', type: 'number', suffix: 'Mbps' },
  ],
  cloud: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'ip_address', label: 'CIDR / IP', type: 'text' },
    { key: 'description', label: 'Description', type: 'text' },
    { key: 'speed_mbps', label: 'Bandwidth', type: 'number', suffix: 'Mbps' },
    { key: 'subnet', label: 'Subnet', type: 'text' },
  ],
  workstation: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'ip_address', label: 'IP Address', type: 'text' },
    { key: 'description', label: 'Description', type: 'text' },
    { key: 'speed_mbps', label: 'NIC Speed', type: 'number', suffix: 'Mbps' },
    { key: 'os', label: 'OS', type: 'select', options: ['Windows', 'macOS', 'Linux'] },
  ],
  internet: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'ip_address', label: 'Public IP', type: 'text' },
    { key: 'description', label: 'Description', type: 'text' },
    { key: 'speed_mbps', label: 'Link Speed', type: 'number', suffix: 'Mbps' },
  ],
};

interface PropertiesPanelProps {
  nodeId: string | null;
  componentType: DesignerComponentType | null;
  config: Record<string, any>;
  onConfigChange: (nodeId: string, key: string, value: any) => void;
  onClose: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  nodeId,
  componentType,
  config,
  onConfigChange,
  onClose,
}) => {
  if (!nodeId || !componentType) return null;

  const def = getComponentDef(componentType);
  const fields = FIELD_MAP[componentType] || FIELD_MAP.router;
  const Icon = def.icon;

  return (
    <div className="w-72 bg-surface border-l border-surface-border flex flex-col h-full overflow-hidden flex-shrink-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-surface-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg border ${def.bgColor} ${def.color} ${def.borderColor}`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-200">Properties</h3>
            <p className="text-[10px] text-slate-500">{def.label}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              {field.label}
            </label>
            {field.type === 'select' ? (
              <select
                value={config[field.key] || ''}
                onChange={(e) => onConfigChange(nodeId, field.key, e.target.value)}
                className="w-full bg-slate-900 border border-surface-border rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
              >
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <div className="relative">
                <input
                  type={field.type}
                  value={config[field.key] ?? ''}
                  onChange={(e) =>
                    onConfigChange(
                      nodeId,
                      field.key,
                      field.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value
                    )
                  }
                  className="w-full bg-slate-900 border border-surface-border rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 font-mono"
                />
                {field.suffix && (
                  <span className="absolute right-3 top-1.5 text-[10px] text-slate-500 font-mono">
                    {field.suffix}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-surface-border bg-slate-950/40">
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <Settings className="w-3 h-3" />
          <span>Component ID: {nodeId}</span>
        </div>
      </div>
    </div>
  );
};
