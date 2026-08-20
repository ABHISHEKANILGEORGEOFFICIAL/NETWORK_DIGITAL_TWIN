import React, { useState, useEffect } from 'react';
import { Cpu, ShieldCheck, Activity, RefreshCw, CheckCircle2, Clock, Layers } from 'lucide-react';
import { Card } from '../components/common/Card';
import { api } from '../services/api';
import { useWebSocket } from '../context/WebSocketContext';

export const DigitalTwinPage: React.FC = () => {
  const { liveMetrics, lastUpdate } = useWebSocket();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadEvents = async () => {
    try {
      const data = await api.getEvents();
      setEvents(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [lastUpdate]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span>Digital Twin State Model</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Autonomous software mirror representing physical network devices, links, interfaces, metrics, and discrete events.
          </p>
        </div>

        <button
          onClick={loadEvents}
          className="p-2 bg-surface hover:bg-slate-800 border border-surface-border text-slate-300 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* High-Fidelity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-slate-400 font-semibold uppercase">Twin Synchronization</p>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">99.8%</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Sub-second state mirroring</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-400 font-semibold uppercase">Fidelity Accuracy</p>
          <p className="text-2xl font-bold font-mono text-cyan-400 mt-1">98.7%</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Physics-based telemetry convergence</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-400 font-semibold uppercase">Active Model Entities</p>
          <p className="text-2xl font-bold font-mono text-white mt-1">
            {(liveMetrics?.total_devices || 36) + (liveMetrics?.total_links || 60)}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Nodes + Links + Interfaces</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-400 font-semibold uppercase">Discrete Events Logged</p>
          <p className="text-2xl font-bold font-mono text-purple-400 mt-1">{events.length}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Total recorded state transitions</p>
        </Card>
      </div>

      {/* Digital Twin State Pillars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Schema */}
        <Card title="Digital State Schema" className="lg:col-span-1">
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-900 border border-surface-border rounded-lg">
              <span className="font-bold text-cyan-400 font-mono">1. Devices Model (36 Nodes)</span>
              <p className="text-[11px] text-slate-400 mt-1">
                Chassis telemetry, control-plane CPU/RAM, thermal, uptime, and vendor OS profiles.
              </p>
            </div>
            <div className="p-3 bg-slate-900 border border-surface-border rounded-lg">
              <span className="font-bold text-cyan-400 font-mono">2. Interfaces Model (60+ Ports)</span>
              <p className="text-[11px] text-slate-400 mt-1">
                Port operational status, line-rate byte counters, CRC errors, and admin state.
              </p>
            </div>
            <div className="p-3 bg-slate-900 border border-surface-border rounded-lg">
              <span className="font-bold text-cyan-400 font-mono">3. Links & Topologies (60+ Edges)</span>
              <p className="text-[11px] text-slate-400 mt-1">
                Interconnect capacities, live utilization, latency SLA, packet drop rates, and jitter.
              </p>
            </div>
            <div className="p-3 bg-slate-900 border border-surface-border rounded-lg">
              <span className="font-bold text-cyan-400 font-mono">4. Health & Anomaly Rules</span>
              <p className="text-[11px] text-slate-400 mt-1">
                6-factor continuous health scoring and deterministic multi-condition alarm correlation.
              </p>
            </div>
          </div>
        </Card>

        {/* Live Digital Twin Event Stream */}
        <Card
          title="Digital Twin Discrete Events Chronicle"
          subtitle="Real-time timeline of topology mutations, alarm states, and failovers"
          className="lg:col-span-2"
          bodyClassName="p-0 max-h-[420px] overflow-y-auto divide-y divide-surface-border/50"
        >
          {events.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No recent discrete events recorded.
            </div>
          ) : (
            events.map((ev) => (
              <div key={ev.id} className="p-3.5 hover:bg-slate-800/30 flex items-start justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <span
                    className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      ev.severity === 'critical'
                        ? 'bg-rose-500'
                        : ev.severity === 'warning'
                        ? 'bg-amber-500'
                        : 'bg-cyan-400'
                    }`}
                  />
                  <div>
                    <p className="font-semibold text-slate-100">{ev.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-[10px] uppercase bg-slate-900 px-1.5 py-0.5 rounded text-slate-400 border border-slate-800">
                        {ev.type}
                      </span>
                      {ev.entity_id && (
                        <span className="font-mono text-[10px] text-cyan-400">
                          {ev.entity_id}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-slate-500 flex-shrink-0">
                  {new Date(ev.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
};
