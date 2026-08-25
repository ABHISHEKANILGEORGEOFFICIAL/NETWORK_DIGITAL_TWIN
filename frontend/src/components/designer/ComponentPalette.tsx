import React, { useState } from 'react';
import { COMPONENT_DEFINITIONS, COMPONENT_CATEGORIES, ComponentDefinition } from './componentTypes';
import { GripVertical, Search } from 'lucide-react';

export const ComponentPalette: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string>('networking');

  const filteredComponents = COMPONENT_DEFINITIONS.filter((comp) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        comp.label.toLowerCase().includes(q) ||
        comp.description.toLowerCase().includes(q) ||
        comp.type.toLowerCase().includes(q)
      );
    }
    return comp.category === expandedCategory;
  });

  const onDragStart = (event: React.DragEvent, componentType: string) => {
    event.dataTransfer.setData('application/reactflow', componentType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const renderPaletteItem = (comp: ComponentDefinition) => {
    const Icon = comp.icon;
    return (
      <div
        key={comp.type}
        draggable
        onDragStart={(e) => onDragStart(e, comp.type)}
        className={`flex items-center gap-2.5 p-2.5 rounded-lg border ${comp.borderColor} ${comp.bgColor} cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-all duration-150 group`}
      >
        <div className="flex items-center justify-center">
          <GripVertical className="w-3 h-3 text-slate-600 group-hover:text-slate-400 transition-colors" />
        </div>
        <div className={`p-1.5 rounded-md border ${comp.borderColor} ${comp.bgColor}`}>
          <Icon className={`w-3.5 h-3.5 ${comp.color}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-slate-200 truncate">{comp.label}</p>
          <p className="text-[9px] text-slate-500 truncate">{comp.description}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="w-56 bg-surface border-r border-surface-border flex flex-col h-full overflow-hidden flex-shrink-0">
      {/* Header */}
      <div className="p-3 border-b border-surface-border">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">Components</h3>
        <div className="relative">
          <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-surface-border rounded-lg pl-7 pr-2.5 py-1.5 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      {/* Category Tabs */}
      {!searchQuery.trim() && (
        <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-surface-border">
          {COMPONENT_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setExpandedCategory(cat.key)}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                expandedCategory === cat.key
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Component List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
        {filteredComponents.map((comp) => renderPaletteItem(comp))}

        {filteredComponents.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-[11px]">
            No components found
          </div>
        )}
      </div>

      {/* Hint */}
      <div className="p-3 border-t border-surface-border bg-slate-950/40">
        <p className="text-[10px] text-slate-500 text-center leading-relaxed">
          Drag components onto the canvas to build your network topology
        </p>
      </div>
    </div>
  );
};
