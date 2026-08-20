import React, { useState } from 'react';
import { Settings, Shield, UserCheck, Save, CheckCircle2, Server } from 'lucide-react';
import { Card } from '../components/common/Card';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';

export const SettingsPage: React.FC = () => {
  const { user, quickSwitchUser } = useAuth();
  const { isConnected } = useWebSocket();

  const [cpuWarning, setCpuWarning] = useState(75);
  const [cpuCritical, setCpuCritical] = useState(90);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-5 h-5 text-cyan-400" />
          <span>Platform Settings & RBAC</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure telemetry polling intervals, deterministic alert thresholds, and user access roles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Account & Role Switcher */}
        <Card title="Current User & Role">
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg border border-surface-border">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-sm text-white">
                {user?.role?.[0]?.toUpperCase() || 'A'}
              </div>
              <div>
                <p className="font-bold text-white text-sm">{user?.full_name}</p>
                <p className="text-slate-400">{user?.email}</p>
                <span className="inline-block mt-1 uppercase font-mono text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20">
                  Role: {user?.role}
                </span>
              </div>
            </div>

            <p className="font-bold text-slate-300 uppercase text-[10px] tracking-wider pt-2">
              Fast Demo Role Switcher
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => quickSwitchUser('admin')}
                className={`p-2.5 rounded-lg border text-left transition-colors ${
                  user?.role === 'admin'
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400 font-bold'
                    : 'bg-slate-900 border-surface-border text-slate-300 hover:border-slate-700'
                }`}
              >
                <p className="text-xs">Admin</p>
                <p className="text-[10px] text-slate-500">Read/Write</p>
              </button>
              <button
                onClick={() => quickSwitchUser('engineer')}
                className={`p-2.5 rounded-lg border text-left transition-colors ${
                  user?.role === 'engineer'
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400 font-bold'
                    : 'bg-slate-900 border-surface-border text-slate-300 hover:border-slate-700'
                }`}
              >
                <p className="text-xs">Engineer</p>
                <p className="text-[10px] text-slate-500">NetOps Sim</p>
              </button>
              <button
                onClick={() => quickSwitchUser('viewer')}
                className={`p-2.5 rounded-lg border text-left transition-colors ${
                  user?.role === 'viewer'
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400 font-bold'
                    : 'bg-slate-900 border-surface-border text-slate-300 hover:border-slate-700'
                }`}
              >
                <p className="text-xs">Viewer</p>
                <p className="text-[10px] text-slate-500">Read-Only</p>
              </button>
            </div>
          </div>
        </Card>

        {/* Deterministic Thresholds */}
        <Card
          title="Telemetry & Alarm Thresholds"
          action={
            <button
              onClick={handleSave}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Rules</span>
            </button>
          }
        >
          <div className="space-y-4 text-xs">
            {saved && (
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Threshold parameters updated successfully.</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                CPU Load Warning Threshold: {cpuWarning}%
              </label>
              <input
                type="range"
                min="50"
                max="85"
                value={cpuWarning}
                onChange={(e) => setCpuWarning(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                CPU Load Critical Threshold: {cpuCritical}%
              </label>
              <input
                type="range"
                min="85"
                max="99"
                value={cpuCritical}
                onChange={(e) => setCpuCritical(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>

            <div className="pt-2 border-t border-surface-border flex items-center justify-between text-slate-400">
              <span>WebSocket Telemetry Status:</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {isConnected ? 'ONLINE (127.0.0.1:8000)' : 'CONNECTING'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
