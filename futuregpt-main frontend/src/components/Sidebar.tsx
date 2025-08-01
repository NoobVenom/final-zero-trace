import { MessageSquare, Search, Code, Eye, Plus, Settings, Target, Zap, Users, TrendingUp } from 'lucide-react';
import type { AppMode } from '../types';

interface SidebarProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onNewChat: () => void;
}

const modeIcons = {
  chat: MessageSquare,
  research: Search,
  code: Code,
  vision: Eye,
  'dsa-solver': Target,
  competitive: Zap,
  interview: Users,
  optimization: TrendingUp,
};

const modeLabels = {
  chat: 'Chat',
  research: 'Research',
  code: 'Code',
  vision: 'Vision',
  'dsa-solver': 'DSA Solver',
  competitive: 'Competitive',
  interview: 'Interview',
  optimization: 'Optimize',
};

export function Sidebar({ mode, onModeChange, onNewChat }: SidebarProps) {
  return (
    <div className="w-16 bg-gray-900/50 border-l border-gray-700/50 flex flex-col items-center py-4 space-y-2">
      {/* New Chat */}
      <button
        onClick={onNewChat}
        className="w-10 h-10 rounded-lg bg-gray-800/50 border border-gray-600/30 flex items-center justify-center text-gray-400 hover:text-green-400 hover:border-green-400/30 hover:bg-gray-700/50 transition-all duration-200 group"
        title="New Chat"
      >
        <Plus size={18} />
      </button>

      <div className="h-px w-8 bg-gray-700/50 my-2" />

      {/* Mode Buttons */}
      {(Object.keys(modeIcons) as AppMode[]).map((modeKey) => {
        const Icon = modeIcons[modeKey];
        const isActive = mode === modeKey;
        
        return (
          <button
            key={modeKey}
            onClick={() => onModeChange(modeKey)}
            className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-all duration-200 group ${
              isActive
                ? 'bg-green-500/20 border-green-400/50 text-green-400 shadow-lg shadow-green-500/20'
                : 'bg-gray-800/50 border-gray-600/30 text-gray-400 hover:text-green-400 hover:border-green-400/30 hover:bg-gray-700/50'
            }`}
            title={modeLabels[modeKey]}
          >
            <Icon size={18} />
          </button>
        );
      })}

      <div className="flex-1" />

      {/* Settings */}
      <button
        className="w-10 h-10 rounded-lg bg-gray-800/50 border border-gray-600/30 flex items-center justify-center text-gray-400 hover:text-green-400 hover:border-green-400/30 hover:bg-gray-700/50 transition-all duration-200 group"
        title="Settings"
      >
        <Settings size={18} />
      </button>
    </div>
  );
}