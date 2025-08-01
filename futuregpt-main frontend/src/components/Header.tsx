import React from 'react';
import { Logo } from './Logo';
import type { AppMode } from '../types';

interface HeaderProps {
  mode: AppMode;
  model: string;
  credits: number;
}

const modeDescriptions = {
  chat: 'Chat with AI',
  research: 'Deep Research',
  code: 'Code Assistant',
  vision: 'Vision Analysis',
  'dsa-solver': 'DSA Problem Solver',
  competitive: 'Competitive Programming',
  interview: 'Interview Prep',
  optimization: 'Code Optimization',
};

export function Header({ mode, model, credits }: HeaderProps) {
  return (
    <div className="h-14 bg-gray-950 border-b border-gray-700/50 px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Logo size="sm" />
        <div>
          <h1 className="text-sm font-medium text-white">{modeDescriptions[mode]}</h1>
          <p className="text-xs text-gray-400">{model}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-xs text-gray-400">
          <span className="text-green-400 font-medium">{credits}</span> Credits
        </div>
        <button className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-400/30 hover:bg-green-500/30 transition-colors">
          Upgrade
        </button>
      </div>
    </div>
  );
}