import React, { useState } from 'react';
import { HelpCircle, Play, ShieldAlert, CheckCircle2, ArrowRight, Route, Clock } from 'lucide-react';
import { api } from '../services/api';
import { Card } from '../components/common/Card';

export const WhatIfPage: React.FC = () => {
  const [targetType, setTargetType] = useState<'device' | 'link'>('device');
  const [targetId, setTargetId] = useState('CORE-RTR-01');
  const [failureType, setFailureType] = useState('offline');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleRunWhatIf = async () => {
    setLoading(true);
    try {
      const data = await api.runWhatIfAnalysis({
        target_type: targetType,
        target_id: targetId,
        failure_type: failureType,
      });
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <HelpCircle className="w-5 h-5 text-cyan-400" />
          <span>What-If Sandbox Simulation</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Execute hypothetical failure impact simulations in an isolated memory clone without mutating live production state.
        </p>
      </div>

      {/* Configuration Form */}
      <Card title="Hypothetical Failure Parameters">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Type</label>
            <select
              value={targetType}
              onChange={(e) => {
                const tt = e.target.value as any;
                setTargetType(tt);
                setTargetId(tt === 'device' ? 'CORE-RTR-01' : 'LINK-INET-GW-01-FW-CORE-01');
              }}
              className="w-full bg-slate-900 border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="device">Device Chassis</option>
              <option value="link">Link Interconnect</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Identifier</label>
            <input
              type="text"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full bg-slate-900 border border-surface-border rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Failure Mode</label>
            <select
              value={failureType}
              onChange={(e) => setFailureType(e.target.value)}
              className="w-full bg-slate-900 border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="offline">Complete Hardware Failure / Cut</option>
              <option value="congested">Severe Bandwidth Congestion (98%)</option>
              <option value="packet_loss">High Packet Loss Spike (15%)</option>
              <option value="high_cpu">Control Plane CPU Exhaustion (99%)</option>
            </select>
          </div>

          <button
            disabled={loading}
            onClick={handleRunWhatIf}
            className="py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Compute Hypothetical Impact</span>
          </button>
        </div>
      </Card>

      {/* Results View */}
      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <p className="text-xs text-slate-400 font-semibold uppercase">Impacted Devices</p>
              <p className="text-2xl font-bold font-mono text-rose-400 mt-1">
                {result.blast_radius_devices?.length || 0}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-slate-400 font-semibold uppercase">Severed Links</p>
              <p className="text-2xl font-bold font-mono text-amber-400 mt-1">
                {result.severed_links?.length || 0}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-slate-400 font-semibold uppercase">Simulated Health Drop</p>
              <p className="text-2xl font-bold font-mono text-rose-400 mt-1">
                {result.hypothetical_health_score}%
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-slate-400 font-semibold uppercase">Reroute Feasibility</p>
              <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {result.alternate_paths_available ? 'Feasible (100%)' : 'Partitioned'}
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Blast Radius Devices" subtitle="Nodes affected by cascading isolation">
              <div className="space-y-1.5 font-mono text-xs max-h-56 overflow-y-auto">
                {result.blast_radius_devices?.map((dev: string, idx: number) => (
                  <div key={idx} className="p-2 bg-slate-900 border border-surface-border rounded flex items-center justify-between text-slate-200">
                    <span>{dev}</span>
                    <span className="text-rose-400">Unreachable</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Alternate Routing & Mitigation" subtitle="Calculated Dijkstra bypass routes">
              <div className="space-y-2 text-xs">
                <p className="text-slate-300 bg-slate-900 p-3 rounded-lg border border-surface-border font-mono">
                  {result.mitigation_plan || 'OSPF / BGP will automatically converge across redundant distribution uplinks within 850ms.'}
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
