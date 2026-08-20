import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Server, Search, Filter, RefreshCw, Power, Terminal,
  ExternalLink, Layers, CheckCircle2, AlertTriangle, XCircle,
  Cpu, Activity, Thermometer, Shield
} from 'lucide-react';
import { api } from '../services/api';
import { Device } from '../types';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { DeviceDrawer } from '../components/topology/DeviceDrawer';
import { formatUptime } from '../utils/formatters';
import { useWebSocket } from '../context/WebSocketContext';

export const DevicesPage: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const { lastUpdate } = useWebSocket();
  const navigate = useNavigate();

  const loadDevices = async () => {
    try {
      const data = await api.getDevices();
      setDevices(data);
    } catch (e) {
      console.error('Failed to load devices:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, [lastUpdate]);

  const filteredDevices = devices.filter((d) => {
    if (selectedTier !== 'all' && d.tier !== selectedTier) return false;
    if (selectedStatus !== 'all' && d.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        d.ip_address.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        d.vendor.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Server className="w-5 h-5 text-cyan-400" />
            <span>Hardware Device Inventory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time digital twin telemetry, health scores, and diagnostics across {devices.length} hardware nodes.
          </p>
        </div>

        <button
          onClick={loadDevices}
          className="p-2 bg-surface hover:bg-slate-800 border border-surface-border text-slate-300 rounded-lg transition-colors self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface border border-surface-border rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          {/* Search Input */}
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, IP, vendor, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-surface-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Tier Filter */}
          <div className="flex items-center bg-slate-900 border border-surface-border rounded-lg p-0.5 text-xs">
            {['all', 'perimeter', 'core', 'distribution', 'access', 'workload'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTier(t)}
                className={`px-2.5 py-1 rounded capitalize font-medium transition-colors ${
                  selectedTier === t
                    ? 'bg-cyan-500/20 text-cyan-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center bg-slate-900 border border-surface-border rounded-lg p-0.5 text-xs">
            {['all', 'healthy', 'warning', 'critical', 'offline'].map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStatus(s)}
                className={`px-2.5 py-1 rounded capitalize font-medium transition-colors ${
                  selectedStatus === s
                    ? 'bg-cyan-500/20 text-cyan-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs font-mono text-slate-400">
          Showing {filteredDevices.length} of {devices.length} nodes
        </span>
      </div>

      {/* Devices Table */}
      <Card className="overflow-hidden" bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-[10px] uppercase font-bold text-slate-400 border-b border-surface-border">
              <tr>
                <th className="py-3 px-4">Device Name</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Tier / Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">CPU Load</th>
                <th className="py-3 px-4">Memory</th>
                <th className="py-3 px-4">Health</th>
                <th className="py-3 px-4">Uptime</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50">
              {filteredDevices.map((d) => (
                <tr
                  key={d.id}
                  className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  onClick={() => setSelectedDeviceId(d.id)}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        <Server className="w-3.5 h-3.5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
                          {d.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {d.vendor} {d.model}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">{d.ip_address}</td>
                  <td className="py-3 px-4">
                    <span className="capitalize px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[10px] font-mono text-slate-300">
                      {d.tier} • {d.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge status={d.status}>{d.status.toUpperCase()}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="w-24 space-y-1">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-slate-400">CPU</span>
                        <span className="text-slate-200">{d.cpu_utilization.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            d.cpu_utilization > 85 ? 'bg-rose-500' : d.cpu_utilization > 60 ? 'bg-amber-500' : 'bg-cyan-500'
                          }`}
                          style={{ width: `${Math.min(100, d.cpu_utilization)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="w-24 space-y-1">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-slate-400">RAM</span>
                        <span className="text-slate-200">{d.memory_utilization.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            d.memory_utilization > 85 ? 'bg-rose-500' : d.memory_utilization > 60 ? 'bg-purple-500' : 'bg-purple-400'
                          }`}
                          style={{ width: `${Math.min(100, d.memory_utilization)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                    {d.health_score.toFixed(0)}%
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                    {formatUptime(d.uptime_seconds)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedDeviceId(d.id)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded text-xs font-medium transition-colors"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => navigate(`/devices/${d.id}`)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                        title="View Deep Telemetry"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Slide-over Device Drawer */}
      <DeviceDrawer
        deviceId={selectedDeviceId}
        onClose={() => setSelectedDeviceId(null)}
        onRefresh={loadDevices}
      />
    </div>
  );
};
