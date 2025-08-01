import React, { useState } from 'react';
import { X, KeyRound, Eye, EyeOff, Check, AlertTriangle } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentApiKey: string;
  onSaveApiKey: (key: string) => void;
  onClearApiKey: () => void;
}

export function ApiKeyModal({ 
  isOpen, 
  onClose, 
  currentApiKey, 
  onSaveApiKey, 
  onClearApiKey 
}: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState(currentApiKey);
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    
    setIsValidating(true);
    // Here you would validate the API key
    setTimeout(() => {
      onSaveApiKey(apiKey.trim());
      setIsValidating(false);
      onClose();
    }, 1000);
  };

  const handleClear = () => {
    setApiKey('');
    onClearApiKey();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700/50 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
          <div className="flex items-center gap-2">
            <KeyRound size={18} className="text-green-400" />
            <h2 className="font-semibold text-white">OpenAI API Key</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="bg-amber-500/10 border border-amber-400/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-amber-400 font-medium mb-1">Privacy Notice</p>
                <p className="text-amber-200/80">
                  Your API key is stored locally in your browser and never sent to our servers. 
                  It's only used to communicate directly with OpenAI's API.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-green-400/50 focus:bg-gray-800"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            <p>Get your API key from: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">platform.openai.com/api-keys</a></p>
          </div>
        </div>

        <div className="flex gap-2 p-4 border-t border-gray-700/50">
          <button
            onClick={handleClear}
            className="flex-1 px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-600/50 rounded-lg hover:bg-gray-800/50 transition-colors"
          >
            Clear Key
          </button>
          <button
            onClick={handleSave}
            disabled={!apiKey.trim() || isValidating}
            className="flex-1 px-4 py-2 text-sm bg-green-500/20 text-green-400 border border-green-400/30 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50 disabled:hover:bg-green-500/20 flex items-center justify-center gap-2"
          >
            {isValidating ? (
              <>
                <div className="w-3 h-3 border border-green-400 border-t-transparent rounded-full animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <Check size={14} />
                Save Key
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}