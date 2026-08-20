import React, { useState, useEffect } from 'react';
import { FileCode, Save, RotateCcw, CheckCircle2, Search } from 'lucide-react';
import { api } from '../services/api';
import { Card } from '../components/common/Card';

export const ConfigurationPage: React.FC = () => {
  const [deviceId, setDeviceId] = useState('CORE-RTR-01');
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const data = await api.getDeviceConfig(deviceId);
      setConfig(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, [deviceId]);

  const handleSave = async () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FileCode className="w-5 h-5 text-cyan-400" />
            <span>Configuration Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cisco IOS-XE and Junos configuration repository, syntax validation, and version control.
          </p>
        </div>
      </div>

      <Card title="Target Device Selector">
        <div className="flex items-center gap-4">
          <select
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            className="bg-slate-900 border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-64"
          >
            <option value="CORE-RTR-01">CORE-RTR-01</option>
            <option value="CORE-RTR-02">CORE-RTR-02</option>
            <option value="FW-CORE-01">FW-CORE-01</option>
            <option value="DIST-SW-01">DIST-SW-01</option>
          </select>
        </div>
      </Card>

      <Card
        title={`Running Configuration: ${deviceId}`}
        subtitle={`Version: ${config?.version || 1} • Format: Cisco IOS`}
        action={
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved & Committed
              </span>
            )}
            <button
              onClick={handleSave}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Commit Config</span>
            </button>
          </div>
        }
      >
        <textarea
          rows={18}
          value={config?.content || `! Baseline Configuration for ${deviceId}\nhostname ${deviceId}\nservice password-encryption\n!\ninterface GigabitEthernet0/0/0\n description Uplink to Core\n ip address 10.0.0.1 255.255.255.252\n no shutdown\n!\nrouter bgp 65001\n bgp log-neighbor-changes\n neighbor 10.0.0.2 remote-as 65002\n!\nend`}
          onChange={(e) => setConfig({ ...config, content: e.target.value })}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-500/50 leading-relaxed"
        />
      </Card>
    </div>
  );
};
