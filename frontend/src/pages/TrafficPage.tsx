import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, BarChart2, TrendingUp, Layers } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, CartesianGrid
} from 'recharts';
import { api } from '../services/api';
import { Card } from '../components/common/Card';
import { formatBits } from '../utils/formatters';

export const TrafficPage: React.FC = () => {
  const [trafficData, setTrafficData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'1h' | '6h' | '24h'>('1h');

  const loadTraffic = async () => {
    try {
      const data = await api.getTrafficAnalytics(timeframe);
      setTrafficData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTraffic();
  }, [timeframe]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span>Traffic & Protocol Analytics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Deep packet protocol distribution, top bandwidth generators, and line-rate time-series.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900 border border-surface-border rounded-lg p-0.5 text-xs">
            {(['1h', '6h', '24h'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded capitalize font-medium transition-colors ${
                  timeframe === tf
                    ? 'bg-cyan-500/20 text-cyan-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
          <button
            onClick={loadTraffic}
            className="p-2 bg-surface hover:bg-slate-800 border border-surface-border text-slate-300 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Bandwidth Series Chart */}
      <Card
        title="Aggregate Line-Rate Traffic Series"
        subtitle={`Total Throughput: ${trafficData?.total_traffic_gbps ?? 4.8} Gbps`}
      >
        <div className="h-72 w-full">
          {trafficData?.traffic_series ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData.traffic_series}>
                <defs>
                  <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#475569" fontSize={10} />
                <YAxis stroke="#475569" fontSize={10} unit="G" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Area type="monotone" dataKey="inbound_gbps" name="Inbound (Gbps)" stroke="#06b6d4" fill="url(#colorInbound)" strokeWidth={2} />
                <Area type="monotone" dataKey="outbound_gbps" name="Outbound (Gbps)" stroke="#3b82f6" fill="url(#colorOutbound)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Protocol Distribution */}
        <Card title="Application Protocol Breakdown" subtitle="L4-L7 Traffic Classification">
          <div className="space-y-3">
            {trafficData?.protocol_distribution?.map((p: any, idx: number) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-200">{p.name}</span>
                  <span className="font-mono text-cyan-400">{p.pct}% ({p.bandwidth_gbps} Gbps)</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${p.pct}%`, backgroundColor: p.color }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Talkers */}
        <Card title="Top Talkers & Bandwidth Generators" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-[10px] uppercase font-bold text-slate-400 border-b border-surface-border">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Device</th>
                  <th className="py-3 px-4">Inbound</th>
                  <th className="py-3 px-4">Outbound</th>
                  <th className="py-3 px-4 text-right">Flows</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/50">
                {trafficData?.top_talkers?.map((tt: any) => (
                  <tr key={tt.rank} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono font-bold text-slate-400">#{tt.rank}</td>
                    <td className="py-3 px-4 font-semibold text-slate-200">{tt.device}</td>
                    <td className="py-3 px-4 font-mono text-cyan-400">{formatBits(tt.in_mbps)}</td>
                    <td className="py-3 px-4 font-mono text-blue-400">{formatBits(tt.out_mbps)}</td>
                    <td className="py-3 px-4 font-mono text-slate-300 text-right">{tt.flows.toLocaleString()}</td>
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
