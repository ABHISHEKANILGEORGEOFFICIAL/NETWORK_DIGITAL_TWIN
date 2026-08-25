import React, { useState, useCallback, useRef } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap,
  useNodesState, useEdgesState, MarkerType, Node, Edge,
  Connection, addEdge, ReactFlowProvider, useReactFlow,
  ConnectionLineType, Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Save, FolderOpen, Trash2, Download, Upload, Plus, Link2
} from 'lucide-react';
import { DesignerNode } from './DesignerNode';
import { PropertiesPanel } from './PropertiesPanel';
import { createDefaultConfig, getComponentDef } from './componentTypes';
import { DesignerComponentType, DesignerComponentConfig, NetworkDesign } from '../../types';

const nodeTypes = {
  designerNode: DesignerNode,
};

const STORAGE_KEY = 'nettwiin-designer-designs';

let nodeIdCounter = 0;
function getNextNodeId() {
  nodeIdCounter += 1;
  return `dn-${Date.now()}-${nodeIdCounter}`;
}

interface DesignerCanvasInnerProps {
  onComponentSelect: (nodeId: string | null, type: DesignerComponentType | null, config: Record<string, any>) => void;
}

const DesignerCanvasInner: React.FC<DesignerCanvasInnerProps> = ({ onComponentSelect }) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeType, setSelectedNodeType] = useState<DesignerComponentType | null>(null);
  const [selectedNodeConfig, setSelectedNodeConfig] = useState<Record<string, any>>({});
  const [designName, setDesignName] = useState('Untitled Network');
  const [savedDesigns, setSavedDesigns] = useState<NetworkDesign[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [showSavedList, setShowSavedList] = useState(false);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow') as DesignerComponentType;
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const nodeId = getNextNodeId();
      const def = getComponentDef(type);
      const config = createDefaultConfig(type, nodeIdCounter);

      const newNode: Node = {
        id: nodeId,
        type: 'designerNode',
        position,
        data: {
          id: nodeId,
          componentType: type,
          label: def.label,
          config,
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [screenToFlowPosition, setNodes]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge: Edge = {
        ...connection,
        id: `edge-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#06b6d4', strokeWidth: 2 },
        label: '1Gbps',
        labelStyle: {
          fill: '#94a3b8',
          fontWeight: 600,
          fontSize: 10,
          fontFamily: 'monospace',
        },
        labelBgStyle: {
          fill: '#0f172a',
          fillOpacity: 0.85,
          stroke: '#06b6d4',
          strokeWidth: 1,
          rx: 4,
          ry: 4,
        },
        labelBgPadding: [6, 2] as [number, number],
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#06b6d4',
          width: 16,
          height: 16,
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const nodeData = node.data as any;
      setSelectedNodeId(node.id);
      setSelectedNodeType(nodeData.componentType);
      setSelectedNodeConfig(nodeData.config || {});
      onComponentSelect(node.id, nodeData.componentType, nodeData.config || {});
    },
    [onComponentSelect]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedNodeType(null);
    setSelectedNodeConfig({});
    onComponentSelect(null, null, {});
  }, [onComponentSelect]);

  const onConfigChange = useCallback(
    (nodeId: string, key: string, value: any) => {
      setSelectedNodeConfig((prev) => ({ ...prev, [key]: value }));
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id !== nodeId) return n;
          const data = n.data as any;
          return {
            ...n,
            data: {
              ...data,
              config: { ...data.config, [key]: value },
            },
          };
        })
      );
    },
    [setNodes]
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null);
        setSelectedNodeType(null);
        setSelectedNodeConfig({});
        onComponentSelect(null, null, {});
      }
    },
    [setNodes, setEdges, selectedNodeId, onComponentSelect]
  );

  const handleSaveDesign = () => {
    const design: NetworkDesign = {
      id: `design-${Date.now()}`,
      name: designName,
      description: '',
      nodes: nodes.map((n) => {
        const d = n.data as any;
        return {
          id: n.id,
          type: d.componentType,
          position: n.position,
          config: d.config,
        };
      }),
      links: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle || undefined,
        targetHandle: e.targetHandle || undefined,
        label: e.label as string,
        bandwidth_mbps: 1000,
        type: 'ethernet' as const,
      })),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updatedDesigns = [...savedDesigns.filter((d) => d.name !== designName), design];
    setSavedDesigns(updatedDesigns);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDesigns));
  };

  const handleLoadDesign = (design: NetworkDesign) => {
    const loadedNodes: Node[] = design.nodes.map((n) => ({
      id: n.id,
      type: 'designerNode',
      position: n.position,
      data: {
        id: n.id,
        componentType: n.type,
        label: getComponentDef(n.type).label,
        config: n.config,
      },
    }));

    const loadedEdges: Edge[] = design.links.map((l) => ({
      id: l.id,
      source: l.source,
      target: l.target,
      sourceHandle: l.sourceHandle,
      targetHandle: l.targetHandle,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#06b6d4', strokeWidth: 2 },
      label: l.label || '',
      labelStyle: {
        fill: '#94a3b8',
        fontWeight: 600,
        fontSize: 10,
        fontFamily: 'monospace',
      },
      labelBgStyle: {
        fill: '#0f172a',
        fillOpacity: 0.85,
        stroke: '#06b6d4',
        strokeWidth: 1,
        rx: 4,
        ry: 4,
      },
      labelBgPadding: [6, 2] as [number, number],
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#06b6d4',
        width: 16,
        height: 16,
      },
    }));

    setNodes(loadedNodes);
    setEdges(loadedEdges);
    setDesignName(design.name);
    setShowSavedList(false);
  };

  const handleClearCanvas = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    setSelectedNodeType(null);
    setSelectedNodeConfig({});
    onComponentSelect(null, null, {});
  };

  const handleDeleteDesign = (designId: string) => {
    const updated = savedDesigns.filter((d) => d.id !== designId);
    setSavedDesigns(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleExportDesign = () => {
    const data = {
      name: designName,
      nodes: nodes.map((n) => {
        const d = n.data as any;
        return { id: n.id, type: d.componentType, position: n.position, config: d.config };
      }),
      edges: edges.map((e) => ({
        id: e.id, source: e.source, target: e.target,
        label: e.label, sourceHandle: e.sourceHandle, targetHandle: e.targetHandle,
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${designName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex h-full min-w-0">
      <div ref={reactFlowWrapper} className="flex-1 h-full relative bg-slate-950">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onDragOver={onDragOver}
          onDrop={onDrop}
          nodeTypes={nodeTypes}
          connectionLineType={ConnectionLineType.SmoothStep}
          fitView
          minZoom={0.2}
          maxZoom={2.5}
          deleteKeyCode="Delete"
          onNodesDelete={(deleted) => {
            deleted.forEach((d) => handleDeleteNode(d.id));
          }}
        >
          <Background color="#1e293b" gap={24} size={1.5} />
          <Controls position="bottom-right" />
          <MiniMap
            nodeColor={() => '#06b6d4'}
            maskColor="rgba(11, 17, 32, 0.75)"
            position="bottom-left"
          />

          {/* Top Toolbar */}
          <Panel position="top-left">
            <div className="flex items-center gap-2 bg-surface/95 border border-surface-border rounded-lg px-3 py-2 backdrop-blur-md shadow-lg">
              <input
                type="text"
                value={designName}
                onChange={(e) => setDesignName(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-200 border-none focus:outline-none w-44 placeholder-slate-500"
                placeholder="Design name..."
              />

              <div className="w-px h-5 bg-surface-border" />

              <button
                onClick={handleSaveDesign}
                className="p-1.5 rounded-md hover:bg-slate-800 text-cyan-400 transition-colors"
                title="Save Design"
              >
                <Save className="w-3.5 h-3.5" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowSavedList(!showSavedList)}
                  className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                  title="Load Design"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                </button>

                {showSavedList && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-surface border border-surface-border rounded-lg shadow-2xl z-50 overflow-hidden">
                    <div className="px-3 py-2 border-b border-surface-border">
                      <p className="text-[11px] font-bold text-slate-300">Saved Designs</p>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {savedDesigns.length === 0 ? (
                        <p className="px-3 py-4 text-[11px] text-slate-500 text-center">No saved designs</p>
                      ) : (
                        savedDesigns.map((d) => (
                          <div
                            key={d.id}
                            className="flex items-center justify-between px-3 py-2 hover:bg-slate-800/60 cursor-pointer group"
                          >
                            <div onClick={() => handleLoadDesign(d)} className="flex-1 min-w-0">
                              <p className="text-[11px] font-medium text-slate-200 truncate">{d.name}</p>
                              <p className="text-[9px] text-slate-500">
                                {d.nodes.length} nodes, {d.links.length} links
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDesign(d.id);
                              }}
                              className="p-1 rounded hover:bg-rose-500/20 text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleExportDesign}
                className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                title="Export as JSON"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleClearCanvas}
                className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                title="Clear Canvas"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div className="w-px h-5 bg-surface-border" />

              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <Link2 className="w-3 h-3" />
                <span>{edges.length} links</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <Plus className="w-3 h-3" />
                <span>{nodes.length} nodes</span>
              </div>
            </div>
          </Panel>

          {/* Empty State */}
          {nodes.length === 0 && (
            <Panel position="top-center">
              <div className="mt-24 text-center pointer-events-none">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-sm font-semibold text-slate-400">Drop components here</p>
                <p className="text-xs text-slate-600 mt-1">
                  Drag networking components from the palette to start building
                </p>
              </div>
            </Panel>
          )}
        </ReactFlow>
      </div>

      {/* Properties Panel */}
      {selectedNodeId && selectedNodeType && (
        <PropertiesPanel
          nodeId={selectedNodeId}
          componentType={selectedNodeType}
          config={selectedNodeConfig}
          onConfigChange={onConfigChange}
          onClose={() => {
            setSelectedNodeId(null);
            setSelectedNodeType(null);
            setSelectedNodeConfig({});
            onComponentSelect(null, null, {});
          }}
        />
      )}
    </div>
  );
};

export const DesignerCanvas: React.FC = () => {
  const [propNodeId, setPropNodeId] = useState<string | null>(null);
  const [propNodeType, setPropNodeType] = useState<DesignerComponentType | null>(null);
  const [propNodeConfig, setPropNodeConfig] = useState<Record<string, any>>({});

  const handleComponentSelect = useCallback(
    (nodeId: string | null, type: DesignerComponentType | null, config: Record<string, any>) => {
      setPropNodeId(nodeId);
      setPropNodeType(type);
      setPropNodeConfig(config);
    },
    []
  );

  return (
    <ReactFlowProvider>
      <DesignerCanvasInner onComponentSelect={handleComponentSelect} />
    </ReactFlowProvider>
  );
};
