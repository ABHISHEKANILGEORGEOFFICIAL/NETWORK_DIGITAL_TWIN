import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Server, ArrowLeft, RefreshCw, Power, Terminal, Activity,
  Cpu, Thermometer, Shield, EthernetPort, Clock, Layers,
  FileCode, CheckCircle2, AlertTriangle, XCircle, HardDrive
} from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';
import { api } from '../services/api';
import { DeviceDetail, TelemetryPoint } from '../types';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { formatUptime, formatBits } from '../utils/formatters';

export const DeviceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [device, setDevice] = useState<DeviceDetail | null>(null);
  const [history, setHistory] = useState<TelemetryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'metrics' | 'interfaces' | 'config' | 'events'>('metrics');
  const [actionOutput, setActionOutput] = useState<string | null>(null);
  const [actionExecuting, setActionExecuting] = useState(false);

  const loadData = async () => {
    if (!id) return;
    try {
      const [dev, hist] = await Promise.all([
        api.getDeviceDetail(id),
        api.getDeviceTelemetryHistory(id, 30),
      ]);
      setDevice(dev);
      setHistory(hist.points || []);
    } catch (e) {
      console.error('Failed to load device details:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const handleAction = async (action: string) => {
    if (!id) return;
    setActionExecuting(true);
    setActionOutput(null);
    try {
      const res = await api.executeDeviceAction(id, action);
      setActionOutput(res.output || res.message || `Command '${action}' completed successfully.`);
      loadData();
    } catch (err: any) {
      setActionOutput(`Error: ${err.message}`);
    } finally {
      setActionExecuting(false);
    }
  };

  if (loading && !device) {
    return (
      <div className="py-24 flex items-center justify-center text-cyan-400 font-mono gap-3">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span>Loading Digital Twin Telemetry...</span>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-400">Device not found in Digital Twin state.</p>
        <button
          onClick={() => navigate('/devices')}
          className="px-4 py-2 bg-slate-800 text-cyan-400 rounded-lg text-xs font-semibold"
        >
          Back to Devices
        </button>
      </div>
    );
  }

  const chartData = history.map((pt) => ({
    time: pt.timestamp ? new Date(pt.timestamp).toLocaleTimeString() : '',
    cpu: pt.cpu,
    memory: pt.memory,
    bandwidth: pt.bandwidth_in_mbps,
    latency: pt.latency_ms,
    temp: pt.temperature_celsius,
  }));

  return (
    <div className="space-y-6">
      {/* Back Button & Top Device Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/devices')}
            className="p-2 bg-surface hover:bg-slate-800 border border-surface-border text-slate-300 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-white tracking-tight">{device.name}</h1>
              <Badge status={device.status}>{device.status.toUpperCase()}</Badge>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                {device.ip_address}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {device.vendor} {device.model} • OS: {device.os_version} • Rack {device.rack_unit} ({device.location})
            </p>
          </div>
        </div>

        {/* Quick Operations Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            disabled={actionExecuting}
            onClick={() => handleAction('restart')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${actionExecuting ? 'animate-spin' : ''}`} />
            <span>Restart</span>
          </button>
          <button
            disabled={actionExecuting}
            onClick={() => handleAction('shutdown')}
            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Power className="w-3.5 h-3.5" />
            <span>Simulate Outage</span>
          </button>
          <button
            disabled={actionExecuting}
            onClick={() => handleAction('ping')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Ping</span>
          </button>
        </div>
      </div>

      {/* Action Output Console */}
      {actionOutput && (
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-cyan-300 whitespace-pre-wrap shadow-inner">
          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1 border-b border-slate-800 pb-1">
            <span>TERMINAL DIAGNOSTIC RESPONSE</span>
            <button onClick={() => setActionOutput(null)} className="text-slate-400 hover:text-white">
              ✕
            </button>
          </div>
          {actionOutput}
        </div>
      )}

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-4">
          <p className="text-[10px] font-semibold uppercase text-slate-400">Health Score</p>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{device.health_score}%</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Composite Metric</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] font-semibold uppercase text-slate-400">CPU Load</p>
          <p className="text-2xl font-bold font-mono text-cyan-400 mt-1">{device.cpu_utilization.toFixed(1)}%</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Control Plane</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] font-semibold uppercase text-slate-400">Memory</p>
          <p className="text-2xl font-bold font-mono text-purple-400 mt-1">{device.memory_utilization.toFixed(1)}%</p>
          <p className="text-[10px] text-slate-500 mt-0.5">RAM Allocated</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] font-semibold uppercase text-slate-400">Temperature</p>
          <p className="text-2xl font-bold font-mono text-amber-400 mt-1">{device.temperature_celsius.toFixed(0)}°C</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Chassis Thermal</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] font-semibold uppercase text-slate-400">Uptime</p>
          <p className="text-lg font-bold font-mono text-slate-200 mt-1 truncate">
            {formatUptime(device.uptime_seconds)}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Continuous Operation</p>
        </Card>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-surface-border gap-6 text-sm font-medium">
        {[
          { id: 'metrics', name: 'Real-Time Telemetry', icon: Activity },
          { id: 'interfaces', name: `Interfaces (${device.interfaces?.length || 0})`, icon: EthernetPort },
          { id: 'config', name: 'Running Configuration', icon: FileCode },
          { id: 'events', name: 'Events & Logs', icon: Clock },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 flex items-center gap-2 transition-colors relative ${
              activeTab === tab.id
                ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'metrics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CPU & Memory Chart */}
          <Card title="CPU & Memory Utilization History" subtitle="Streaming time-series telemetry (%)">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#475569" fontSize={10} />
                  <YAxis domain={[0, 100]} stroke="#475569" fontSize={10} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  />
                  <Line type="monotone" dataKey="cpu" name="CPU %" stroke="#06b6d4" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="memory" name="RAM %" stroke="#a855f7" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Bandwidth & Thermal Chart */}
          <Card title="Traffic Bandwidth & Temperature" subtitle="Throughput (Mbps) and Thermal (°C)">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#475569" fontSize={10} />
                  <YAxis stroke="#475569" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  />
                  <Line type="monotone" dataKey="bandwidth" name="Throughput (Mbps)" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="temp" name="Temp (°C)" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'interfaces' && (
        <Card title="Physical & Virtual Network Interfaces" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-[10px] uppercase font-bold text-slate-400 border-b border-surface-border">
                <tr>
                  <th className="py-3 px-4">Interface</th>
                  <th className="py-3 px-4">Speed</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Utilization</th>
                  <th className="py-3 px-4">RX Packets</th>
                  <th className="py-3 px-4">TX Packets</th>
                  <th className="py-3 px-4">Errors / Drops</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/50">
                {device.interfaces?.map((iface) => (
                  <tr key={iface.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                      {iface.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {formatBits(iface.speed_mbps)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                          iface.status === 'up'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {iface.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-cyan-400">
                      {iface.utilization_pct.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {iface.rx_packets.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {iface.tx_packets.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {iface.rx_errors + iface.tx_errors} err / {iface.rx_drops + iface.tx_drops} drop
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'config' && (
        <Card title="Active Configuration Snippet" subtitle="Cisco IOS-XE / Junos syntax representation">
          <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed">
            {device.active_config_snippet || '! No active config record loaded.'}
          </pre>
        </Card>
      )}

      {activeTab === 'events' && (
        <Card title="Recent Device Events" subtitle="Digital Twin event chronicle">
          <div className="space-y-3">
            {device.recent_events?.map((ev, idx) => (
              <div key={idx} className="p-3 bg-slate-900 border border-surface-border rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="text-slate-200">{ev.message}</span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">{ev.timestamp}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
