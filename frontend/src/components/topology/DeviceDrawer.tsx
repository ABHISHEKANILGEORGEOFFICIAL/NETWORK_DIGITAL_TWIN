import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, RefreshCw, Power, AlertTriangle, Terminal,
  ExternalLink, Activity, Network, Shield, Cpu, Thermometer,
  Layers, HardDrive, Wifi, Server, CheckCircle2, Clock
} from 'lucide-react';
import { DeviceDetail } from '../../types';
import { api } from '../../services/api';
import { Badge } from '../common/Badge';
import { formatUptime, formatBits } from '../../utils/formatters';

interface DeviceDrawerProps {
  deviceId: string | null;
  onClose: () => void;
  onRefresh?: () => void;
}

export const DeviceDrawer: React.FC<DeviceDrawerProps> = ({ deviceId, onClose, onRefresh }) => {
  const [device, setDevice] = useState<DeviceDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionOutput, setActionOutput] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!deviceId) {
      setDevice(null);
      setActionOutput(null);
      return;
    }
    async function loadDetail() {
      setLoading(true);
      try {
        const data = await api.getDeviceDetail(deviceId!);
        setDevice(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
    const interval = setInterval(loadDetail, 3000);
    return () => clearInterval(interval);
  }, [deviceId]);

  if (!deviceId) return null;

  const handleAction = async (action: string) => {
    setIsExecuting(true);
    setActionOutput(null);
    try {
      const res = await api.executeDeviceAction(deviceId, action);
      if (res.output) {
        setActionOutput(res.output);
      } else {
        setActionOutput(res.message || `Action '${action}' executed successfully.`);
      }
      if (onRefresh) onRefresh();
    } catch (e: any) {
      setActionOutput(`Error: ${e.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-slate-900 border-l border-surface-border shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
      {/* Header */}
      <div className="p-4 border-b border-surface-border flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">{device?.name || deviceId}</h3>
            <p className="text-[11px] font-mono text-slate-400">{device?.ip_address}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {loading && !device ? (
          <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Loading telemetry...</span>
          </div>
        ) : device ? (
          <>
            {/* Status & Health Summary */}
            <div className="bg-surface border border-surface-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Current Status</span>
                <Badge status={device.status}>{device.status.toUpperCase()}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Health Score</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  {device.health_score}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Uptime</span>
                <span className="text-xs font-mono text-slate-200">
                  {formatUptime(device.uptime_seconds)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Location / Rack</span>
                <span className="text-xs text-slate-200">{device.location} ({device.rack_unit})</span>
              </div>
            </div>

            {/* Performance Gauges */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Live Telemetry
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-surface border border-surface-border rounded-lg p-3 text-center">
                  <Cpu className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-400 uppercase">CPU</p>
                  <p className="text-sm font-bold text-slate-100 font-mono mt-0.5">
                    {device.cpu_utilization.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-surface border border-surface-border rounded-lg p-3 text-center">
                  <Activity className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-400 uppercase">Memory</p>
                  <p className="text-sm font-bold text-slate-100 font-mono mt-0.5">
                    {device.memory_utilization.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-surface border border-surface-border rounded-lg p-3 text-center">
                  <Thermometer className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-400 uppercase">Temp</p>
                  <p className="text-sm font-bold text-slate-100 font-mono mt-0.5">
                    {device.temperature_celsius.toFixed(0)}°C
                  </p>
                </div>
              </div>
            </div>

            {/* Interfaces List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Interfaces ({device.interfaces?.length || 0})
                </h4>
                <span className="text-[10px] text-cyan-400 font-mono">10G/40G/100G</span>
              </div>
              <div className="bg-surface border border-surface-border rounded-xl divide-y divide-surface-border/50 max-h-48 overflow-y-auto">
                {device.interfaces?.map((iface) => (
                  <div key={iface.id} className="p-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          iface.status === 'up' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                      <span className="font-mono text-slate-200 font-semibold">{iface.name}</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-slate-400 text-[11px]">
                      <span>{formatBits(iface.speed_mbps)}</span>
                      <span className="text-slate-300">{iface.utilization_pct.toFixed(0)}% util</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Neighbors */}
            {device.neighbors && device.neighbors.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Direct Neighbors ({device.neighbors.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {device.neighbors.map((n) => (
                    <span
                      key={n}
                      className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded text-xs font-mono text-slate-300"
                    >
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="space-y-2 pt-2 border-t border-surface-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Digital Twin Operations
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={isExecuting}
                  onClick={() => handleAction('restart')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin' : ''}`} />
                  Restart Device
                </button>
                <button
                  disabled={isExecuting}
                  onClick={() => handleAction('shutdown')}
                  className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg text-xs font-medium text-rose-400 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Power className="w-3.5 h-3.5" />
                  Simulate Outage
                </button>
                <button
                  disabled={isExecuting}
                  onClick={() => handleAction('ping')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  ICMP Ping
                </button>
                <button
                  disabled={isExecuting}
                  onClick={() => handleAction('traceroute')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Activity className="w-3.5 h-3.5" />
                  Traceroute
                </button>
              </div>

              {actionOutput && (
                <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-[11px] text-cyan-300 whitespace-pre-wrap">
                  {actionOutput}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>

      {/* Footer Details Button */}
      <div className="p-4 border-t border-surface-border bg-slate-950/80 flex items-center justify-between">
        <button
          onClick={() => {
            navigate(`/devices/${deviceId}`);
            onClose();
          }}
          className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition-all"
        >
          <span>View Deep Telemetry & Config</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
