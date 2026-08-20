import React from 'react';
import { TopologyCanvas } from '../components/topology/TopologyCanvas';
import { Network, Zap, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TopologyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-[calc(100vh-112px)] flex flex-col space-y-3">
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Network className="w-5 h-5 text-cyan-400" />
            <span>Interactive Network Topology</span>
          </h1>
          <p className="text-xs text-slate-400">
            Real-time digital twin graph model with dynamic link bandwidth, node health, and hop path tracing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/simulation')}
            className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-cyan-600/20 transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Inject Simulation Scenario</span>
          </button>
        </div>
      </div>

      {/* Fullscreen Interactive Canvas */}
      <div className="flex-1 w-full h-full min-h-0">
        <TopologyCanvas />
      </div>
    </div>
  );
};
