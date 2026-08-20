import React, { useState, useEffect } from 'react';
import {
  Bell, CheckCircle2, AlertTriangle, XCircle, RefreshCw,
  Filter, ShieldAlert, Check, Clock, Trash2
} from 'lucide-react';
import { api } from '../services/api';
import { Alert, AlertSeverity, AlertStatus } from '../types';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { useWebSocket } from '../context/WebSocketContext';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const { lastUpdate, refreshData } = useWebSocket();

  const loadAlerts = async () => {
    try {
      const data = await api.getAlerts({
        severity: selectedSeverity !== 'all' ? selectedSeverity : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
      });
      setAlerts(data);
    } catch (e) {
      console.error('Failed to load alerts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [selectedSeverity, selectedStatus, lastUpdate]);

  const handleUpdateStatus = async (alertId: string, status: string) => {
    await api.updateAlertStatus(alertId, status);
    loadAlerts();
    refreshData();
  };

  const handleClearAll = async () => {
    await api.clearAlerts();
    loadAlerts();
    refreshData();
  };

  const openCount = alerts.filter((a) => a.status === 'new' || a.status === 'open').length;
  const ackCount = alerts.filter((a) => a.status === 'acknowledged').length;
  const resolvedCount = alerts.filter((a) => a.status === 'resolved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-amber-400" />
            <span>Alert & Anomaly Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic rule evaluations, threshold breaches, and full alert lifecycle management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleClearAll}
            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Active Alarms</span>
          </button>
          <button
            onClick={loadAlerts}
            className="p-2 bg-surface hover:bg-slate-800 border border-surface-border text-slate-300 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Open Alarms</p>
            <p className="text-2xl font-bold font-mono text-rose-400 mt-1">{openCount}</p>
          </div>
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Acknowledged</p>
            <p className="text-2xl font-bold font-mono text-amber-400 mt-1">{ackCount}</p>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Resolved (History)</p>
            <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{resolvedCount}</p>
          </div>
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface border border-surface-border rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Status Filters */}
          <div className="flex items-center bg-slate-900 border border-surface-border rounded-lg p-0.5 text-xs">
            {['all', 'open', 'acknowledged', 'resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1 rounded capitalize font-medium transition-colors ${
                  selectedStatus === st
                    ? 'bg-cyan-500/20 text-cyan-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Severity Filters */}
          <div className="flex items-center bg-slate-900 border border-surface-border rounded-lg p-0.5 text-xs">
            {['all', 'critical', 'high', 'warning', 'info'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-3 py-1 rounded capitalize font-medium transition-colors ${
                  selectedSeverity === sev
                    ? sev === 'critical'
                      ? 'bg-rose-500/20 text-rose-400 font-semibold'
                      : sev === 'high'
                      ? 'bg-orange-500/20 text-orange-400 font-semibold'
                      : 'bg-amber-500/20 text-amber-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs font-mono text-slate-400">
          Showing {alerts.length} total alerts
        </span>
      </div>

      {/* Alerts Table */}
      <Card bodyClassName="p-0">
        {alerts.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2 opacity-80" />
            <p className="font-bold text-slate-200 text-sm">No Matching Alerts</p>
            <p className="text-slate-400 mt-1">All conditions are within nominal baseline thresholds.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-[10px] uppercase font-bold text-slate-400 border-b border-surface-border">
                <tr>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Alarm ID</th>
                  <th className="py-3 px-4">Device / Target</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Trigger Metric</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/50">
                {alerts.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <Badge status={a.severity}>{a.severity.toUpperCase()}</Badge>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-300">{a.id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-200">{a.device_name || a.device_id}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-100">{a.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{a.description}</p>
                    </td>
                    <td className="py-3 px-4 font-mono text-cyan-400">
                      {a.metric_name} ({a.metric_value ?? 'N/A'})
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          a.status === 'resolved'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : a.status === 'acknowledged'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {new Date(a.created_at).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {a.status !== 'acknowledged' && a.status !== 'resolved' && (
                          <button
                            onClick={() => handleUpdateStatus(a.id, 'acknowledged')}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-medium border border-slate-700 transition-colors"
                          >
                            Acknowledge
                          </button>
                        )}
                        {a.status !== 'resolved' && (
                          <button
                            onClick={() => handleUpdateStatus(a.id, 'resolved')}
                            className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded text-[11px] font-medium border border-emerald-500/30 transition-colors"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
