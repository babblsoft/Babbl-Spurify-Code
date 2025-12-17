import React from 'react';
import { Settings, Plus, Github, Terminal, Zap, BrainCircuit } from 'lucide-react';
import { ModelType } from '../types';

interface SidebarProps {
  currentModel: ModelType;
  onModelChange: (model: ModelType) => void;
  onClear: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentModel, onModelChange, onClear, isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#0d1117] border-r border-gray-800 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col
      `}>
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xl">
                <Terminal size={24} />
                <span>Spurify</span>
            </div>
            <div className="text-xs text-gray-500 font-mono">v1.0</div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <button 
            onClick={() => {
                onClear();
                if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors mb-6 font-medium"
          >
            <Plus size={18} />
            New Chat
          </button>

          <div className="mb-8">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">AI Model</h3>
            <div className="space-y-2">
              <button
                onClick={() => onModelChange(ModelType.PRO)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
                  currentModel === ModelType.PRO 
                    ? 'bg-gray-800 text-emerald-400 border border-emerald-900/50' 
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                }`}
              >
                <Terminal size={18} />
                <div className="text-left">
                    <div className="font-medium">Pro Code</div>
                    <div className="text-[10px] opacity-70">Complex Logic & Reasoning</div>
                </div>
              </button>

              <button
                onClick={() => onModelChange(ModelType.FLASH)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
                  currentModel === ModelType.FLASH 
                    ? 'bg-gray-800 text-yellow-400 border border-yellow-900/50' 
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                }`}
              >
                <Zap size={18} />
                 <div className="text-left">
                    <div className="font-medium">Flash Speed</div>
                    <div className="text-[10px] opacity-70">Quick Snippets & Fixes</div>
                </div>
              </button>

              <button
                onClick={() => onModelChange(ModelType.THINKING)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
                  currentModel === ModelType.THINKING 
                    ? 'bg-gray-800 text-purple-400 border border-purple-900/50' 
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                }`}
              >
                <BrainCircuit size={18} />
                 <div className="text-left">
                    <div className="font-medium">Thinking</div>
                    <div className="text-[10px] opacity-70">Deep Analysis</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-800">
           <div className="flex items-center gap-3 text-gray-400 text-sm hover:text-white transition-colors cursor-pointer">
                <Github size={18} />
                <span>Open Source</span>
           </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;