import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, RefreshCw, ShieldAlert, ChevronRight, Clock, Network } from 'lucide-react';
import { api } from '../services/api';
import { Incident } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { useWebSocket } from '../context/WebSocketContext';

export const IncidentsPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  const { lastUpdate } = useWebSocket();

  const loadIncidents = async () => {
    try {
      const data = await api.getIncidents();
      setIncidents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, [lastUpdate]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span>Incidents & Root Cause Analysis</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Graph-correlated incident clustering collapsing cascading telemetry alarms into single actionable root causes.
          </p>
        </div>

        <button
          onClick={loadIncidents}
          className="p-2 bg-surface hover:bg-slate-800 border border-surface-border text-slate-300 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {incidents.length === 0 ? (
        <Card>
          <div className="py-16 text-center flex flex-col items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2 opacity-80" />
            <h3 className="text-base font-bold text-slate-100">No Active Incidents</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              The graph correlation engine has not detected cascading failure clusters across the network.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {incidents.map((inc) => (
            <Card key={inc.id} className="border-rose-500/30">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      {inc.incident_number}
                    </span>
                    <Badge status={inc.severity}>{inc.severity.toUpperCase()}</Badge>
                    <span className="text-xs font-mono uppercase bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                      Status: {inc.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">{inc.title}</h3>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-400">Root Cause Confidence</p>
                  <p className="text-xl font-bold font-mono text-emerald-400">{inc.confidence_pct}%</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 text-xs">
                {/* RCA Summary */}
                <div className="space-y-2 lg:col-span-2">
                  <p className="font-bold text-slate-300 uppercase text-[10px] tracking-wider">
                    Root Cause Diagnosis
                  </p>
                  <p className="text-slate-200 bg-slate-900 p-3 rounded-lg border border-surface-border">
                    {inc.root_cause_summary}
                  </p>

                  <p className="font-bold text-slate-300 uppercase text-[10px] tracking-wider pt-2">
                    Recommended Mitigations
                  </p>
                  <div className="space-y-1.5">
                    {inc.recommendations?.map((rec, rIdx) => (
                      <div key={rIdx} className="flex items-center gap-2 p-2 bg-slate-900 rounded border border-surface-border">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span className="text-slate-300">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Blast Radius Nodes */}
                <div className="space-y-2">
                  <p className="font-bold text-slate-300 uppercase text-[10px] tracking-wider">
                    Impacted Nodes ({inc.affected_nodes?.length || 0})
                  </p>
                  <div className="bg-slate-900 p-3 rounded-lg border border-surface-border space-y-1.5 max-h-48 overflow-y-auto font-mono text-[11px]">
                    {inc.affected_nodes?.map((nodeId, nIdx) => (
                      <div key={nIdx} className="flex items-center justify-between text-slate-300">
                        <span>{nodeId}</span>
                        <span className="text-rose-400">Degraded</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
