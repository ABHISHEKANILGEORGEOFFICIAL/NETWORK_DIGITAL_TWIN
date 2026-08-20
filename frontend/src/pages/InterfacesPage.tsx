import React, { useState, useEffect } from 'react';
import { EthernetPort, Search, RefreshCw, Power, Filter } from 'lucide-react';
import { api } from '../services/api';
import { Interface } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { formatBits } from '../utils/formatters';
import { useWebSocket } from '../context/WebSocketContext';

export const InterfacesPage: React.FC = () => {
  const [interfaces, setInterfaces] = useState<Interface[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const { lastUpdate } = useWebSocket();

  const loadInterfaces = async () => {
    try {
      const data = await api.getInterfaces();
      setInterfaces(data);
    } catch (e) {
      console.error('Failed to load interfaces:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInterfaces();
  }, [lastUpdate]);

  const handleToggleStatus = async (ifId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'up' ? 'down' : 'up';
    await api.setInterfaceStatus(ifId, newStatus);
    loadInterfaces();
  };

  const filtered = interfaces.filter((i) => {
    if (selectedStatus !== 'all' && i.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        i.name.toLowerCase().includes(q) ||
        i.device_id.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <EthernetPort className="w-5 h-5 text-cyan-400" />
            <span>Network Interfaces</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time port states, line-rate utilization, packet counters, and administrative toggle controls.
          </p>
        </div>

        <button
          onClick={loadInterfaces}
          className="p-2 bg-surface hover:bg-slate-800 border border-surface-border text-slate-300 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filters */}
      <div className="bg-surface border border-surface-border rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by interface name, device ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-surface-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center bg-slate-900 border border-surface-border rounded-lg p-0.5 text-xs">
            {['all', 'up', 'down'].map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStatus(s)}
                className={`px-3 py-1 rounded capitalize font-medium transition-colors ${
                  selectedStatus === s
                    ? 'bg-cyan-500/20 text-cyan-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs font-mono text-slate-400">
          Showing {filtered.length} of {interfaces.length} interfaces
        </span>
      </div>

      {/* Table */}
      <Card bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-[10px] uppercase font-bold text-slate-400 border-b border-surface-border">
              <tr>
                <th className="py-3 px-4">Interface</th>
                <th className="py-3 px-4">Host Device</th>
                <th className="py-3 px-4">Port Speed</th>
                <th className="py-3 px-4">Operational Status</th>
                <th className="py-3 px-4">Utilization</th>
                <th className="py-3 px-4">RX Packets</th>
                <th className="py-3 px-4">TX Packets</th>
                <th className="py-3 px-4">Errors / Drops</th>
                <th className="py-3 px-4 text-right">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50">
              {filtered.map((iface) => (
                <tr key={iface.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-200">{iface.name}</td>
                  <td className="py-3 px-4 font-semibold text-cyan-400">{iface.device_id}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{formatBits(iface.speed_mbps)}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        iface.status === 'up'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          iface.status === 'up' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                      {iface.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-200 font-semibold">
                    {iface.utilization_pct.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {iface.rx_packets.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {iface.tx_packets.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {iface.rx_errors + iface.tx_errors} err
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(iface.id, iface.status)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                        iface.status === 'up'
                          ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {iface.status === 'up' ? 'Set DOWN' : 'Set UP'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
