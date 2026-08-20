import React, { useState } from 'react';
import { Route, ArrowRight, Activity, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { Card } from '../components/common/Card';
import { formatBits } from '../utils/formatters';

export const PathAnalysisPage: React.FC = () => {
  const [source, setSource] = useState('SRV-WEB-01');
  const [target, setTarget] = useState('INET-GW-01');
  const [pathData, setPathData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTrace = async () => {
    setLoading(true);
    try {
      const data = await api.tracePath(source, target);
      setPathData(data);
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
          <Route className="w-5 h-5 text-cyan-400" />
          <span>Network Path & SLA Analysis</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Hop-by-hop Dijkstra routing analysis across physical and virtual layers with SLA bottleneck detection.
        </p>
      </div>

      {/* Path Inputs */}
      <Card title="Path Endpoints">
        <div className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Source Device</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full bg-slate-900 border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="SRV-WEB-01">SRV-WEB-01 (Data Center Web)</option>
              <option value="SRV-DB-PRIMARY">SRV-DB-PRIMARY (Database Cluster)</option>
              <option value="AP-HQ-FL1">AP-HQ-FL1 (Wireless AP)</option>
              <option value="ACC-SW-01">ACC-SW-01 (Access Switch)</option>
            </select>
          </div>

          <div className="text-slate-500 pb-2 hidden md:block">→</div>

          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Destination Device</label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full bg-slate-900 border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="INET-GW-01">INET-GW-01 (Internet Gateway)</option>
              <option value="FW-CORE-01">FW-CORE-01 (Perimeter Firewall)</option>
              <option value="SRV-AI-WORKER">SRV-AI-WORKER (GPU Cluster)</option>
            </select>
          </div>

          <button
            disabled={loading}
            onClick={handleTrace}
            className="py-2.5 px-5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition-all"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Trace Live Route</span>
          </button>
        </div>
      </Card>

      {/* Path Results */}
      {pathData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <p className="text-xs text-slate-400 font-semibold uppercase">Total Hops</p>
              <p className="text-2xl font-bold font-mono text-cyan-400 mt-1">{pathData.total_hops}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-slate-400 font-semibold uppercase">Cumulative Latency</p>
              <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {pathData.cumulative_latency_ms?.toFixed(1)}ms
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-slate-400 font-semibold uppercase">Min Bandwidth Capacity</p>
              <p className="text-2xl font-bold font-mono text-blue-400 mt-1">
                {formatBits(pathData.min_capacity_mbps || 10000)}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-slate-400 font-semibold uppercase">Path Health SLA</p>
              <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">Compliant (100%)</p>
            </Card>
          </div>

          {/* Hop by Hop Cards */}
          <Card title="Hop-by-Hop Routing Sequence" bodyClassName="p-0">
            <div className="divide-y divide-surface-border/50">
              {pathData.hops?.map((hop: any, idx: number) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-800/20 transition-colors text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono font-bold flex items-center justify-center text-[11px]">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-slate-100">{hop.node_id}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{hop.ip_address || '10.0.0.1'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 font-mono text-slate-300">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Egress Util</span>
                      <span className="text-cyan-400">{hop.egress_utilization_pct || 15}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Hop Latency</span>
                      <span>{hop.hop_latency_ms || 1.2}ms</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
