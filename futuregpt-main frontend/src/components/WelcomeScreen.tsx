import React from 'react';
import { MessageCircle, Search, Code, Eye, Zap, Globe, Shield, Target, Users, TrendingUp } from 'lucide-react';
import type { AppMode } from '../types';

interface WelcomeScreenProps {
  mode: AppMode;
  hasApiKey: boolean;
}

const features = [
  {
    icon: MessageCircle,
    title: 'Context-Aware Chat',
    description: 'Analyzes webpage content and selected text for relevant responses'
  },
  {
    icon: Search,
    title: 'Web Search',
    description: 'Search the web for current information when context is insufficient'
  },
  {
    icon: Zap,
    title: 'Function Calling',
    description: 'Execute predefined functions like weather, bookmarks, and more'
  },
  {
    icon: Shield,
    title: 'Privacy-First',
    description: 'All processing in-memory with zero data storage'
  },
  {
    icon: Code,
    title: 'Code Assistant',
    description: 'Get help with programming, debugging, and code explanations'
  },
  {
    icon: Eye,
    title: 'Vision Analysis',
    description: 'Analyze images and extract information from visual content'
  }
];

const competitiveFeatures = [
  {
    icon: Target,
    title: 'DSA Problem Solver',
    description: 'Solve complex algorithmic problems with optimal solutions'
  },
  {
    icon: Code,
    title: 'Multi-Language Support',
    description: 'C++, Python, Java, JavaScript with competitive programming templates'
  },
  {
    icon: TrendingUp,
    title: 'Complexity Analysis',
    description: 'Detailed time and space complexity analysis with optimizations'
  },
  {
    icon: Zap,
    title: 'Test Case Generation',
    description: 'Generate comprehensive test cases for edge case coverage'
  },
  {
    icon: Users,
    title: 'Interview Prep',
    description: 'Practice coding interviews with real-world problem scenarios'
  },
  {
    icon: Shield,
    title: 'Privacy-First',
    description: 'All processing in-memory with zero data storage'
  }
];

const modeDescriptions = {
  chat: 'General conversation with context awareness',
  research: 'Deep analysis with structured research capabilities',
  code: 'Programming assistance with code generation and debugging',
  vision: 'Image analysis and visual content understanding',
  'dsa-solver': 'Solve complex DSA problems with optimal algorithms',
  competitive: 'Competitive programming with advanced problem solving',
  interview: 'Coding interview preparation and practice',
  optimization: 'Code optimization and performance analysis'
};

const competitiveExamples = [
  'Solve "Maximum Subarray Sum" with Kadane\'s Algorithm',
  'Implement Binary Search with edge case handling',
  'Dynamic Programming solution for "Longest Common Subsequence"',
  'Graph algorithms: DFS, BFS, Dijkstra implementation',
  'Advanced data structures: Trie, Segment Tree, Fenwick Tree'
];

export function WelcomeScreen({ mode, hasApiKey }: WelcomeScreenProps) {
  const isCompetitiveMode = mode === 'dsa-solver' || mode === 'competitive' || mode === 'interview' || mode === 'optimization';
  const currentFeatures = isCompetitiveMode ? competitiveFeatures : features;
  const currentExamples = isCompetitiveMode ? competitiveExamples : [
    "What's on this page? (Context-aware)",
    "Search for latest AI news (Web search)",
    "get_weather() (Function call)",
    mode === 'code' ? "Write a React component (Code generation)" : null
  ].filter(Boolean);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      {/* Logo and Title */}
      <div className="mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
          {isCompetitiveMode ? (
            <Target size={32} className="text-white" />
          ) : (
            <MessageCircle size={32} className="text-white" />
          )}
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          {isCompetitiveMode ? 'Ultimate DSA Solver' : 'zeroTrace AI'}
        </h1>
        <p className="text-gray-400 text-sm">
          {isCompetitiveMode ? 'World\'s Best Competitive Programming AI' : 'Privacy-First AI Assistant'}
        </p>
      </div>
      
      {/* Mode Description */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-800/50 rounded-full text-sm text-gray-300 mb-3">
          {mode === 'chat' && <MessageCircle size={14} />}
          {mode === 'research' && <Search size={14} />}
          {mode === 'code' && <Code size={14} />}
          {mode === 'vision' && <Eye size={14} />}
          {mode === 'dsa-solver' && <Target size={14} />}
          {mode === 'competitive' && <Zap size={14} />}
          {mode === 'interview' && <Users size={14} />}
          {mode === 'optimization' && <TrendingUp size={14} />}
          <span className="capitalize">{mode.replace('-', ' ')} Mode</span>
        </div>
        <p className="text-gray-400 text-sm max-w-xs">
          {modeDescriptions[mode]}
        </p>
      </div>

      {/* Enhanced Features Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6 w-full max-w-sm">
        {currentFeatures.map((feature, index) => (
          <div
            key={index}
            className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors"
          >
            <feature.icon size={16} className="text-green-400 mb-2 mx-auto" />
            <h3 className="text-xs font-medium text-white mb-1">{feature.title}</h3>
            <p className="text-xs text-gray-400 leading-tight">{feature.description}</p>
          </div>
        ))}
      </div>
      
      {/* Quick Actions */}
      <div className="space-y-3 w-full max-w-sm">
        <div className="text-xs text-gray-500 mb-2">
          {isCompetitiveMode ? 'Try these DSA problems:' : 'Try these examples:'}
        </div>
        
        <div className="space-y-2">
          {currentExamples.map((example, index) => (
            <button 
              key={index}
              className="w-full p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg text-xs text-gray-300 transition-colors text-left"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="mt-6 flex items-center gap-2 text-xs">
        <div className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-green-400' : 'bg-yellow-400'}`} />
        <span className="text-gray-400">
          {hasApiKey ? 'Backend Connected' : 'Demo Mode'}
        </span>
      </div>

      {/* Privacy Notice */}
      <div className="mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-1 justify-center mb-1">
          <Shield size={12} />
          <span>Privacy-First Design</span>
        </div>
        <p>All data processed in-memory • Zero storage • No tracking</p>
      </div>
    </div>
  );
}