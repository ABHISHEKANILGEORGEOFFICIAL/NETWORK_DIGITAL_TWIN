import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap,
  useNodesState, useEdgesState, MarkerType, Node, Edge, ConnectionLineType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Search, Filter, PlayCircle, RefreshCw, Layers,
  Route, CheckCircle2, AlertTriangle, XCircle, Eye
} from 'lucide-react';
import { CustomDeviceNode } from './CustomDeviceNode';
import { DeviceDrawer } from './DeviceDrawer';
import { api } from '../../services/api';
import { useWebSocket } from '../../context/WebSocketContext';

const nodeTypes = {
  customDevice: CustomDeviceNode,
};

export const TopologyCanvas: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [rawTopology, setRawTopology] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters & State
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  // Path Highlighting
  const [highlightPathNodes, setHighlightPathNodes] = useState<string[]>([]);
  const [pathSource, setPathSource] = useState('SRV-WEB-01');
  const [pathDest, setPathDest] = useState('INET-GW-01');
  const [isPathActive, setIsPathActive] = useState(false);

  const { lastUpdate } = useWebSocket();

  const loadTopology = useCallback(async () => {
    try {
      const data = await api.getTopology();
      setRawTopology(data);
    } catch (err) {
      console.error('Failed to load topology:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTopology();
  }, [loadTopology, lastUpdate]);

  // Synchronize React Flow nodes & edges with filters
  useEffect(() => {
    if (!rawTopology) return;

    // Filter nodes
    const filteredNodes: Node[] = rawTopology.nodes
      .filter((n: any) => {
        if (selectedTier !== 'all' && n.tier !== selectedTier) return false;
        if (selectedStatus !== 'all' && n.status !== selectedStatus) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            n.label.toLowerCase().includes(q) ||
            n.ip_address.toLowerCase().includes(q) ||
            n.id.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .map((n: any) => {
        const isPathHighlighted = highlightPathNodes.includes(n.id);
        return {
          id: n.id,
          type: 'customDevice',
          position: { x: n.pos_x, y: n.pos_y },
          data: {
            ...n.data,
            isHighlighted: isPathHighlighted,
          },
          selected: isPathHighlighted || selectedDeviceId === n.id,
        };
      });

    const activeNodeIds = new Set(filteredNodes.map((n) => n.id));

    // Filter and style edges
    const formattedEdges: Edge[] = rawTopology.edges
      .filter((e: any) => activeNodeIds.has(e.source) && activeNodeIds.has(e.target))
      .map((e: any) => {
        const isPathEdge =
          highlightPathNodes.includes(e.source) && highlightPathNodes.includes(e.target);

        let strokeColor = '#334155'; // default slate-700
        let strokeWidth = 2;
        let animated = false;

        if (e.status === 'down') {
          strokeColor = '#ef4444'; // red
          strokeWidth = 2;
        } else if (e.status === 'congested' || (e.utilization_pct || 0) > 85) {
          strokeColor = '#f59e0b'; // amber
          strokeWidth = 3;
          animated = true;
        } else if (isPathEdge) {
          strokeColor = '#06b6d4'; // cyan highlighted route
          strokeWidth = 4;
          animated = true;
        } else {
          strokeColor = '#0284c7'; // normal active blue/cyan
          strokeWidth = 2;
        }

        return {
          id: e.id,
          source: e.source,
          target: e.target,
          type: 'smoothstep',
          animated: animated,
          style: { stroke: strokeColor, strokeWidth },
          label: `${e.utilization_pct || 0}% (${(e.capacity_mbps / 1000).toFixed(0)}G)`,
          labelStyle: {
            fill: '#94a3b8',
            fontWeight: 600,
            fontSize: 10,
            fontFamily: 'monospace',
          },
          labelBgStyle: {
            fill: '#0f172a',
            fillOpacity: 0.85,
            stroke: strokeColor,
            strokeWidth: 1,
            rx: 4,
            ry: 4,
          },
          labelBgPadding: [6, 2] as [number, number],
        };
      });

    setNodes(filteredNodes);
    setEdges(formattedEdges);
  }, [
    rawTopology,
    selectedTier,
    selectedStatus,
    searchQuery,
    highlightPathNodes,
    selectedDeviceId,
    setNodes,
    setEdges,
  ]);

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedDeviceId(node.id);
  };

  const handleTracePath = async () => {
    if (!pathSource || !pathDest) return;
    try {
      const res = await api.tracePath(pathSource, pathDest);
      if (res.path_nodes) {
        setHighlightPathNodes(res.path_nodes);
        setIsPathActive(true);
      }
    } catch (e) {
      console.error('Failed to trace path:', e);
    }
  };

  const handleClearPath = () => {
    setHighlightPathNodes([]);
    setIsPathActive(false);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 rounded-xl overflow-hidden border border-surface-border">
      {/* Control & Filter Bar */}
      <div className="p-4 bg-surface/90 border-b border-surface-border flex flex-wrap items-center justify-between gap-3 z-10 backdrop-blur-md">
        {/* Search & Tier Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search topology..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-surface-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* Tier Dropdown / Buttons */}
          <div className="flex items-center bg-slate-900 border border-surface-border rounded-lg p-0.5 text-xs">
            {['all', 'core', 'distribution', 'access', 'workload'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTier(t)}
                className={`px-2.5 py-1 rounded capitalize font-medium transition-colors ${
                  selectedTier === t
                    ? 'bg-cyan-500/20 text-cyan-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center bg-slate-900 border border-surface-border rounded-lg p-0.5 text-xs">
            {['all', 'healthy', 'warning', 'critical'].map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStatus(s)}
                className={`px-2.5 py-1 rounded capitalize font-medium transition-colors ${
                  selectedStatus === s
                    ? s === 'critical'
                      ? 'bg-rose-500/20 text-rose-400'
                      : s === 'warning'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Path Tracer Controls */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-surface-border px-3 py-1 rounded-lg text-xs">
          <Route className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400 font-medium">Trace Path:</span>
          <select
            value={pathSource}
            onChange={(e) => setPathSource(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="SRV-WEB-01">SRV-WEB-01</option>
            <option value="SRV-DB-PRIMARY">SRV-DB-PRIMARY</option>
            <option value="AP-HQ-FL1">AP-HQ-FL1</option>
            <option value="ACC-SW-01">ACC-SW-01</option>
          </select>
          <span className="text-slate-500">→</span>
          <select
            value={pathDest}
            onChange={(e) => setPathDest(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="INET-GW-01">INET-GW-01 (Internet)</option>
            <option value="FW-CORE-01">FW-CORE-01</option>
            <option value="SRV-AI-WORKER">SRV-AI-WORKER</option>
          </select>

          {isPathActive ? (
            <button
              onClick={handleClearPath}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-rose-400 font-medium rounded text-xs"
            >
              Clear
            </button>
          ) : (
            <button
              onClick={handleTracePath}
              className="px-2.5 py-0.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded text-xs shadow"
            >
              Highlight Route
            </button>
          )}
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1 w-full h-full relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 z-20">
            <div className="flex items-center gap-2 text-sm text-cyan-400 font-mono">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Rendering Digital Twin Topology...</span>
            </div>
          </div>
        ) : null}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
          minZoom={0.2}
          maxZoom={2.5}
          attributionPosition="bottom-left"
        >
          <Background color="#1e293b" gap={24} size={1.5} />
          <Controls position="bottom-right" />
          <MiniMap
            nodeColor={(node: any) => {
              if (node.data?.status === 'critical') return '#ef4444';
              if (node.data?.status === 'warning') return '#f59e0b';
              return '#06b6d4';
            }}
            maskColor="rgba(11, 17, 32, 0.75)"
            position="bottom-left"
          />
        </ReactFlow>
      </div>

      {/* Side Device Detail Drawer */}
      <DeviceDrawer
        deviceId={selectedDeviceId}
        onClose={() => setSelectedDeviceId(null)}
        onRefresh={loadTopology}
      />
    </div>
  );
};
