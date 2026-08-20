import React, { useState, useEffect } from 'react';
import { Boxes, Download, RefreshCw, Search } from 'lucide-react';
import { api } from '../services/api';
import { Device } from '../types';
import { Card } from '../components/common/Card';

export const InventoryPage: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadInventory = async () => {
    try {
      const data = await api.getDevices();
      setDevices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleExportCsv = () => {
    const headers = ['ID', 'Name', 'Vendor', 'Model', 'OS Version', 'IP Address', 'MAC Address', 'Location', 'Rack Unit', 'Status'];
    const rows = devices.map((d) => [
      d.id,
      d.name,
      d.vendor,
      d.model,
      d.os_version,
      d.ip_address,
      d.mac_address,
      d.location,
      d.rack_unit,
      d.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nettwin_hardware_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = devices.filter((d) =>
    search.trim()
      ? d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.vendor.toLowerCase().includes(search.toLowerCase()) ||
        d.ip_address.toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Boxes className="w-5 h-5 text-cyan-400" />
            <span>Hardware Asset Inventory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Physical chassis serials, vendor firmware revisions, rack positioning, and CMDB export.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Inventory CSV</span>
        </button>
      </div>

      <Card bodyClassName="p-0">
        <div className="p-4 border-b border-surface-border">
          <input
            type="text"
            placeholder="Filter hardware assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 bg-slate-900 border border-surface-border rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-[10px] uppercase font-bold text-slate-400 border-b border-surface-border">
              <tr>
                <th className="py-3 px-4">Asset Name</th>
                <th className="py-3 px-4">Vendor & Model</th>
                <th className="py-3 px-4">Firmware OS</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">MAC Address</th>
                <th className="py-3 px-4">Data Center Location</th>
                <th className="py-3 px-4">Rack Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-bold text-slate-200">{d.name}</td>
                  <td className="py-3 px-4 text-slate-300">{d.vendor} {d.model}</td>
                  <td className="py-3 px-4 font-mono text-cyan-400">{d.os_version}</td>
                  <td className="py-3 px-4 font-mono text-slate-300">{d.ip_address}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{d.mac_address}</td>
                  <td className="py-3 px-4 text-slate-300">{d.location}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{d.rack_unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
