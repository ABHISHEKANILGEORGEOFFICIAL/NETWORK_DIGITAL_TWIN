import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, HeartPulse, Server, Bell, AlertTriangle, ArrowUpRight,
  ShieldCheck, Zap, RefreshCw, Layers, CheckCircle2, ChevronRight,
  Radio, HardDrive, Wifi, TrendingUp, Clock, Flame
} from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { useWebSocket } from '../context/WebSocketContext';
import { api } from '../services/api';
import { KpiCard } from '../components/common/KpiCard';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { TopologyCanvas } from '../components/topology/TopologyCanvas';
import { formatBits, formatUptime } from '../utils/formatters';

export const DashboardPage: React.FC = () => {
  const { liveMetrics, activeAlerts, isConnected, refreshData } = useWebSocket();
  const navigate = useNavigate();

  const [trafficData, setTrafficData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deviceSample, setDeviceSample] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [traffic, devices] = await Promise.all([
          api.getTrafficAnalytics('1h'),
          api.getDevices(),
        ]);
        setTrafficData(traffic);
        setDeviceSample(devices.slice(0, 5));
      } catch (e) {
        console.error('Failed to load dashboard metrics:', e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const healthScore = liveMetrics?.network_health_score ?? 98.4;
  const healthClass = liveMetrics?.health_classification ?? 'Healthy';

  // Device status counts
  const totalDevs = liveMetrics?.total_devices ?? 36;
  const healthyDevs = liveMetrics?.healthy_devices ?? 34;
  const warningDevs = liveMetrics?.warning_devices ?? 1;
  const criticalDevs = liveMetrics?.critical_devices ?? 1;
  const offlineDevs = liveMetrics?.offline_devices ?? 0;

  const handleAcknowledge = async (alertId: string) => {
    await api.updateAlertStatus(alertId, 'acknowledged');
    refreshData();
  };

  const handleResolve = async (alertId: string) => {
    await api.updateAlertStatus(alertId, 'resolved');
    refreshData();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Breadcrumb & Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span>Network Operations Center</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Live Digital Twin
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time telemetry, automated health scoring, topology state, and active alert engine.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/simulation')}
            className="px-3.5 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Simulation Center</span>
          </button>
          <button
            onClick={() => refreshData()}
            className="p-2 bg-surface hover:bg-slate-800 border border-surface-border text-slate-300 rounded-lg transition-colors"
            title="Refresh All Telemetry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Row (8 High-Impact Metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="col-span-2 bg-gradient-to-br from-surface to-slate-900 border border-surface-border rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Network Health
            </p>
            <div className="flex items-baseline gap-2 mt-1.5">
              <h2 className="text-3xl font-extrabold text-white font-mono">
                {healthScore.toFixed(1)}%
              </h2>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  healthScore >= 90
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : healthScore >= 70
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {healthClass}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">6-Factor Weighted Composite</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <HeartPulse className="w-6 h-6" />
          </div>
        </div>

        <KpiCard
          title="Devices"
          value={totalDevs}
          subtitle={`${healthyDevs} Up • ${criticalDevs + offlineDevs} Down`}
          icon={Server}
          color="cyan"
          onClick={() => navigate('/devices')}
        />

        <KpiCard
          title="Active Alerts"
          value={activeAlerts.length}
          subtitle={`${liveMetrics?.critical_alerts_count || 0} Critical`}
          icon={Bell}
          color={activeAlerts.length > 0 ? 'red' : 'green'}
          onClick={() => navigate('/alerts')}
        />

        <KpiCard
          title="Throughput"
          value={`${liveMetrics?.total_bandwidth_gbps ?? 4.8}G`}
          subtitle="Aggregate Core"
          icon={Activity}
          color="blue"
          onClick={() => navigate('/traffic')}
        />

        <KpiCard
          title="Latency"
          value={`${(liveMetrics?.avg_latency_ms ?? 2.8).toFixed(1)}ms`}
          subtitle="Avg Round-Trip"
          icon={TrendingUp}
          color="purple"
          onClick={() => navigate('/health')}
        />

        <KpiCard
          title="Packet Loss"
          value={`${(liveMetrics?.avg_packet_loss_pct ?? 0.02).toFixed(2)}%`}
          subtitle="SLA < 0.1%"
          icon={AlertTriangle}
          color="amber"
          onClick={() => navigate('/health')}
        />

        <KpiCard
          title="Availability"
          value={`${(liveMetrics?.availability_pct ?? 99.98).toFixed(2)}%`}
          subtitle="Last 24h Uptime"
          icon={ShieldCheck}
          color="green"
          statusDot
        />
      </div>

      {/* Main Grid: Mini Topology & Traffic Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Live Topology Preview (2 Cols) */}
        <div className="lg:col-span-2 bg-surface border border-surface-border rounded-xl shadow-lg flex flex-col h-[520px] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-surface-border flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">Live Network Graph</h3>
            </div>
            <button
              onClick={() => navigate('/topology')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
            >
              <span>Fullscreen Canvas</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 w-full h-full relative">
            <TopologyCanvas />
          </div>
        </div>

        {/* Right Column: Active Alerts Stream & Health Breakdown */}
        <div className="space-y-6 flex flex-col justify-between">
          {/* Active Alerts Feed */}
          <Card
            title="Real-Time Alerts"
            subtitle={`${activeAlerts.length} Active Conditions`}
            action={
              <button
                onClick={() => navigate('/alerts')}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-0.5"
              >
                <span>View All</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            }
            className="flex-1 flex flex-col"
            bodyClassName="p-0 flex-1 overflow-y-auto max-h-[240px] divide-y divide-surface-border/60"
          >
            {activeAlerts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2 opacity-80" />
                <p className="font-semibold text-slate-200">All Systems Nominal</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  No active alarms or threshold violations.
                </p>
              </div>
            ) : (
              activeAlerts.map((alert) => (
                <div key={alert.id} className="p-3 hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <Badge status={alert.severity}>{alert.severity.toUpperCase()}</Badge>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(alert.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200 mt-1.5 leading-snug">
                    {alert.title}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    {alert.description}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    {alert.status !== 'acknowledged' && (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-medium border border-slate-700 transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="px-2 py-0.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded text-[10px] font-medium border border-emerald-500/30 transition-colors"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              ))
            )}
          </Card>

          {/* Device Health Breakdown Distribution */}
          <Card title="Infrastructure Tier Breakdown" subtitle="36 Monitored Hardware Assets">
            <div className="space-y-2.5">
              {[
                { name: 'Perimeter & Firewalls', count: 2, status: '100% Up', color: 'bg-emerald-500' },
                { name: 'Core Backbone Tier', count: 4, status: '100% Up', color: 'bg-emerald-500' },
                { name: 'Distribution Switches', count: 4, status: '100% Up', color: 'bg-emerald-500' },
                { name: 'Access Layer Switches', count: 6, status: '100% Up', color: 'bg-emerald-500' },
                { name: 'Data Center Workloads', count: 12, status: '100% Up', color: 'bg-emerald-500' },
                { name: 'Wireless Access Points', count: 6, status: '100% Up', color: 'bg-emerald-500' },
              ].map((tier, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${tier.color}`} />
                    <span className="text-slate-300 font-medium">{tier.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-400">{tier.count} nodes</span>
                    <span className="text-emerald-400 font-semibold">{tier.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Traffic Analytics & Telemetry Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Bandwidth Chart */}
        <Card
          title="Real-Time Network Bandwidth"
          subtitle="Inbound vs Outbound line-rate telemetry (Gbps)"
          action={
            <span className="text-xs font-mono text-cyan-400 font-medium">
              Live Stream
            </span>
          }
        >
          <div className="h-64 w-full">
            {trafficData?.traffic_series ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trafficData.traffic_series}>
                  <defs>
                    <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} unit="G" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="inbound_gbps"
                    name="Inbound"
                    stroke="#06b6d4"
                    fill="url(#colorIn)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="outbound_gbps"
                    name="Outbound"
                    stroke="#3b82f6"
                    fill="url(#colorOut)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Loading telemetry series...
              </div>
            )}
          </div>
        </Card>

        {/* Top Talkers Table */}
        <Card
          title="Top Talkers & Traffic Generators"
          subtitle="Highest bandwidth volume endpoints"
          action={
            <button
              onClick={() => navigate('/traffic')}
              className="text-xs text-cyan-400 hover:underline"
            >
              Full Analytics
            </button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-surface-border">
                <tr>
                  <th className="pb-2">Node</th>
                  <th className="pb-2">IP Address</th>
                  <th className="pb-2">Inbound</th>
                  <th className="pb-2">Outbound</th>
                  <th className="pb-2 text-right">Flows</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/50">
                {trafficData?.top_talkers?.map((tt: any) => (
                  <tr key={tt.rank} className="hover:bg-slate-800/30">
                    <td className="py-2.5 font-semibold text-slate-200">{tt.device}</td>
                    <td className="py-2.5 font-mono text-slate-400">{tt.ip}</td>
                    <td className="py-2.5 font-mono text-cyan-400">{formatBits(tt.in_mbps)}</td>
                    <td className="py-2.5 font-mono text-blue-400">{formatBits(tt.out_mbps)}</td>
                    <td className="py-2.5 font-mono text-slate-300 text-right">
                      {tt.flows.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
