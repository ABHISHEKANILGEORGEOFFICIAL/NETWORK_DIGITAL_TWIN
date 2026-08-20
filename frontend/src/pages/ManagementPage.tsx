import React, { useState } from 'react';
import { Wrench, Terminal, RefreshCw, Power, CheckCircle2, Shield } from 'lucide-react';
import { api } from '../services/api';
import { Card } from '../components/common/Card';

export const ManagementPage: React.FC = () => {
  const [targetDevice, setTargetDevice] = useState('CORE-RTR-01');
  const [action, setAction] = useState('ping');
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleExecute = async () => {
    setLoading(true);
    try {
      const res = await api.executeDeviceAction(targetDevice, action);
      setOutput(res.output || res.message || 'Operation executed.');
    } catch (e: any) {
      setOutput(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Wrench className="w-5 h-5 text-cyan-400" />
          <span>Network Management Console</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Direct operational control, ICMP diagnostics, traceroute probes, and remote chassis reboots.
        </p>
      </div>

      <Card title="Operational Command Dispatcher">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Device</label>
            <select
              value={targetDevice}
              onChange={(e) => setTargetDevice(e.target.value)}
              className="w-full bg-slate-900 border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="CORE-RTR-01">CORE-RTR-01</option>
              <option value="CORE-RTR-02">CORE-RTR-02</option>
              <option value="FW-CORE-01">FW-CORE-01</option>
              <option value="DIST-SW-01">DIST-SW-01</option>
              <option value="SRV-WEB-01">SRV-WEB-01</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Management Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full bg-slate-900 border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="ping">ICMP Ping Reachability Probe</option>
              <option value="traceroute">Hop Traceroute Diagnostic</option>
              <option value="restart">Remote Chassis Reboot</option>
              <option value="shutdown">Emergency Outage Shutdown</option>
            </select>
          </div>

          <button
            disabled={loading}
            onClick={handleExecute}
            className="py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition-all"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Execute Action</span>
          </button>
        </div>
      </Card>

      {output && (
        <Card title="Terminal Output">
          <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-cyan-300 whitespace-pre-wrap leading-relaxed">
            {output}
          </pre>
        </Card>
      )}
    </div>
  );
};
