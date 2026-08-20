import React, { useState, useEffect } from 'react';
import { PlayCircle, RefreshCw, AlertTriangle, Zap, CheckCircle2, Sliders, Shield } from 'lucide-react';
import { api } from '../services/api';
import { SimulationScenario, SimulationStatus } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { useWebSocket } from '../context/WebSocketContext';

export const SimulationPage: React.FC = () => {
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([]);
  const [status, setStatus] = useState<SimulationStatus | null>(null);
  const [selectedScenario, setSelectedScenario] = useState('router_failure');
  const [targetId, setTargetId] = useState('CORE-RTR-01');
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);

  const { refreshData, lastUpdate } = useWebSocket();

  const loadScenarios = async () => {
    try {
      const [scList, st] = await Promise.all([
        api.getSimulationScenarios(),
        api.getSimulationStatus(),
      ]);
      setScenarios(scList);
      setStatus(st);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadScenarios();
  }, [lastUpdate]);

  const handleStartScenario = async () => {
    setLoading(true);
    try {
      await api.startSimulationScenario(selectedScenario, targetId, duration);
      await loadScenarios();
      refreshData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await api.resetSimulation();
      await loadScenarios();
      refreshData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <PlayCircle className="w-5 h-5 text-cyan-400" />
            <span>Digital Twin Simulation Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Inject realistic failure scenarios, traffic surges, and node outages to test platform resilience.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset to Normal State</span>
        </button>
      </div>

      {/* Active Simulation Status Banner */}
      <div className="bg-gradient-to-r from-surface to-slate-900 border border-surface-border rounded-xl p-5 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-slate-400">Current Scenario:</span>
              <span className="font-mono text-sm font-bold text-cyan-400 uppercase">
                {status?.current_scenario || 'NORMAL'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Twin Engine is ticking continuously at 2-second intervals.
            </p>
          </div>
        </div>

        <span className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          SIMULATION ACTIVE
        </span>
      </div>

      {/* Scenario Injection Form & Scenario Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Injector Controls */}
        <Card title="Scenario Controller" className="lg:col-span-1">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Scenario Pattern
              </label>
              <select
                value={selectedScenario}
                onChange={(e) => setSelectedScenario(e.target.value)}
                className="w-full bg-slate-900 border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {scenarios.map((sc) => (
                  <option key={sc.key} value={sc.key}>
                    {sc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Node or Interconnect
              </label>
              <input
                type="text"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                placeholder="e.g. CORE-RTR-01 or LINK-INET-GW-01-FW-CORE-01"
                className="w-full bg-slate-900 border border-surface-border rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Duration (Seconds): {duration}s
              </label>
              <input
                type="range"
                min="10"
                max="300"
                step="10"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <button
              disabled={loading}
              onClick={handleStartScenario}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all mt-2"
            >
              <Zap className="w-4 h-4" />
              <span>Apply Scenario to Digital Twin</span>
            </button>
          </div>
        </Card>

        {/* Scenarios Grid */}
        <Card title="Available Scenarios Library" className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {scenarios.map((sc) => (
              <div
                key={sc.key}
                onClick={() => {
                  setSelectedScenario(sc.key);
                  setTargetId(sc.default_target);
                  setDuration(sc.default_duration);
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedScenario === sc.key
                    ? 'bg-cyan-500/10 border-cyan-500/40 shadow-sm'
                    : 'bg-slate-900/60 border-surface-border hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-100">{sc.name}</h4>
                  <span className="text-[10px] font-mono text-cyan-400 bg-slate-800 px-1.5 py-0.5 rounded">
                    {sc.default_duration}s
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">{sc.description}</p>
                <p className="text-[10px] font-mono text-slate-500 mt-2">
                  Target: {sc.default_target}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
