import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Network, Server, EthernetPort, HeartPulse,
  Activity, Bell, AlertTriangle, Cpu, PlayCircle, HelpCircle,
  Route, FileCode, Wrench, Boxes, FileText, Settings, ShieldCheck
} from 'lucide-react';
import { useWebSocket } from '../../context/WebSocketContext';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const { liveMetrics, activeAlerts, incidents } = useWebSocket();

  const navItems: { section: string; items: NavItem[] }[] = [
    {
      section: 'MONITORING',
      items: [
        { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Live Topology', path: '/topology', icon: Network },
        { name: 'Devices', path: '/devices', icon: Server, badge: liveMetrics?.total_devices || 36 },
        { name: 'Interfaces', path: '/interfaces', icon: EthernetPort, badge: liveMetrics?.total_interfaces || 60 },
        { name: 'Network Health', path: '/health', icon: HeartPulse, badge: `${liveMetrics?.network_health_score || 98}%` },
        { name: 'Traffic Analytics', path: '/traffic', icon: Activity },
      ],
    },
    {
      section: 'ALERTS & INCIDENTS',
      items: [
        {
          name: 'Active Alerts',
          path: '/alerts',
          icon: Bell,
          badge: activeAlerts.length > 0 ? activeAlerts.length : undefined,
          badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        },
        {
          name: 'Incidents & RCA',
          path: '/incidents',
          icon: AlertTriangle,
          badge: incidents.length > 0 ? incidents.length : undefined,
          badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
        },
      ],
    },
    {
      section: 'DIGITAL TWIN & SIMULATION',
      items: [
        { name: 'Digital Twin Model', path: '/digital-twin', icon: Cpu },
        { name: 'Simulation Center', path: '/simulation', icon: PlayCircle },
        { name: 'What-If Analysis', path: '/what-if', icon: HelpCircle },
        { name: 'Path Analysis', path: '/path-analysis', icon: Route },
      ],
    },
    {
      section: 'MANAGEMENT & GOVERNANCE',
      items: [
        { name: 'Configuration Mgmt', path: '/configuration', icon: FileCode },
        { name: 'Network Management', path: '/management', icon: Wrench },
        { name: 'Hardware Inventory', path: '/inventory', icon: Boxes },
        { name: 'Compliance Reports', path: '/reports', icon: FileText },
        { name: 'Settings & Users', path: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-surface-border flex flex-col flex-shrink-0 h-screen overflow-hidden">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-surface-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-md shadow-cyan-500/20">
          <Network className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-base tracking-tight text-white">NetTwin</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              v1.0
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Digital Twin Platform</p>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navItems.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <h4 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              {group.section}
            </h4>
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 flex-shrink-0 transition-colors group-hover:text-cyan-400" />
                  <span className="truncate">{item.name}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-mono font-medium ${
                      item.badgeColor || 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* Digital Twin Engine Status Card */}
      <div className="p-3 border-t border-surface-border bg-slate-950/40">
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <div>
              <p className="text-[11px] font-semibold text-slate-200">Twin Synchronized</p>
              <p className="text-[10px] text-slate-400">99.8% Fidelity</p>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500" />
        </div>
      </div>
    </aside>
  );
};
