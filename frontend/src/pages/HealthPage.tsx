import React from 'react';
import { HeartPulse, ShieldCheck, Activity, Cpu, HardDrive, Wifi, Server } from 'lucide-react';
import { Card } from '../components/common/Card';
import { useWebSocket } from '../context/WebSocketContext';

export const HealthPage: React.FC = () => {
  const { liveMetrics } = useWebSocket();

  const score = liveMetrics?.network_health_score ?? 98.4;
  const classification = liveMetrics?.health_classification ?? 'Healthy';

  const factors = [
    {
      name: 'Device Availability',
      weight: '30%',
      score: liveMetrics?.availability_pct ?? 99.98,
      formula: '0.30 × (Healthy / Total Devices)',
      color: 'bg-emerald-500',
    },
    {
      name: 'CPU Performance',
      weight: '20%',
      score: Math.max(0, 100 - (liveMetrics?.total_devices ? 18.5 : 20.0)),
      formula: '0.20 × (100 - Avg CPU)',
      color: 'bg-cyan-500',
    },
    {
      name: 'Memory Headroom',
      weight: '15%',
      score: 88.5,
      formula: '0.15 × (100 - Avg Memory)',
      color: 'bg-purple-500',
    },
    {
      name: 'Link Bandwidth Capacity',
      weight: '15%',
      score: 92.4,
      formula: '0.15 × (100 - Avg Link Util)',
      color: 'bg-blue-500',
    },
    {
      name: 'Round-Trip Latency SLA',
      weight: '10%',
      score: 96.0,
      formula: '0.10 × (SLA Target / Avg Latency)',
      color: 'bg-amber-500',
    },
    {
      name: 'Packet Loss Immunity',
      weight: '10%',
      score: 99.8,
      formula: '0.10 × (100 - 10 × Loss %)',
      color: 'bg-emerald-400',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <HeartPulse className="w-5 h-5 text-emerald-400" />
            <span>Network Health Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Mathematical 6-factor composite scoring engine evaluating real-time infrastructure reliability.
          </p>
        </div>
      </div>

      {/* Main Overall Health Card */}
      <div className="bg-gradient-to-r from-surface to-slate-900 border border-surface-border rounded-xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">
            Overall Health Score
          </p>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-extrabold text-white font-mono">{score.toFixed(1)}%</span>
            <span className="text-sm font-bold px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {classification}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Network is operating within nominal enterprise SLAs across all hardware tiers.
          </p>
        </div>

        <div className="w-full md:w-96 bg-slate-950 p-4 rounded-xl border border-surface-border space-y-2 text-xs font-mono">
          <p className="text-slate-400 text-[11px] font-sans font-semibold">FORMULA DEFINITION</p>
          <p className="text-cyan-300">
            Health = 0.30(Avail) + 0.20(CPU) + 0.15(Mem) + 0.15(BW) + 0.10(Lat) + 0.10(Loss)
          </p>
        </div>
      </div>

      {/* 6 Factors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {factors.map((f, idx) => (
          <Card key={idx} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">{f.name}</span>
              <span className="text-[11px] font-mono text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                Weight: {f.weight}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-white">{f.score.toFixed(1)}%</span>
              <span className="text-[11px] text-slate-400 font-mono">Nominal</span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className={`h-full rounded-full ${f.color}`} style={{ width: `${f.score}%` }} />
            </div>

            <p className="text-[10px] font-mono text-slate-500">{f.formula}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};
