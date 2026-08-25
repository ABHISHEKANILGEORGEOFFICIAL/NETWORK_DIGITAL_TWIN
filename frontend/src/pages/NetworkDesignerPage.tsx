import React from 'react';
import { PenTool } from 'lucide-react';
import { ComponentPalette } from '../components/designer/ComponentPalette';
import { DesignerCanvas } from '../components/designer/DesignerCanvas';

export const NetworkDesignerPage: React.FC = () => {
  return (
    <div className="h-[calc(100vh-112px)] flex flex-col space-y-3">
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <PenTool className="w-5 h-5 text-cyan-400" />
            <span>Network Designer</span>
          </h1>
          <p className="text-xs text-slate-400">
            Drag and drop networking components to design custom network topologies. Connect components by dragging from one handle to another.
          </p>
        </div>
      </div>

      {/* Main Layout: Palette + Canvas */}
      <div className="flex-1 w-full min-h-0 rounded-xl overflow-hidden border border-surface-border bg-surface flex">
        <ComponentPalette />
        <DesignerCanvas />
      </div>
    </div>
  );
};
