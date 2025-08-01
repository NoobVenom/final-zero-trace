import React, { useRef, useEffect } from 'react';
import { Copy, User, Bot } from 'lucide-react';
import type { Message } from '../types';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          {message.role === 'assistant' && (
            <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-400/30 flex items-center justify-center flex-shrink-0">
              <Bot size={16} className="text-green-400" />
            </div>
          )}
          
          <div
            className={`max-w-[80%] rounded-lg p-3 group relative ${
              message.role === 'user'
                ? 'bg-gradient-to-br from-gray-700 to-gray-800 text-white rounded-br-none'
                : 'bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100 rounded-bl-none border border-gray-700/50'
            }`}
          >
            {message.type === 'image' && message.metadata?.imageUrl && (
              <div className="mb-2">
                <img 
                  src={message.metadata.imageUrl} 
                  alt="Generated image"
                  className="rounded-lg max-w-full h-auto border border-gray-600/50"
                />
              </div>
            )}
            
            <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </div>
            
            {message.role === 'assistant' && (
              <button
                onClick={() => copyToClipboard(message.content)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-gray-700/50 hover:bg-gray-600/50"
                title="Copy message"
              >
                <Copy size={12} className="text-gray-400" />
              </button>
            )}
            
            <div className="text-xs text-gray-500 mt-2">
              {message.timestamp.toLocaleTimeString()}
              {message.metadata?.model && (
                <span className="ml-2">• {message.metadata.model}</span>
              )}
            </div>
          </div>
          
          {message.role === 'user' && (
            <div className="w-8 h-8 rounded-lg bg-gray-700 border border-gray-600/30 flex items-center justify-center flex-shrink-0">
              <User size={16} className="text-gray-300" />
            </div>
          )}
        </div>
      ))}
      
      {isLoading && (
        <div className="flex gap-3 justify-start">
          <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-400/30 flex items-center justify-center flex-shrink-0">
            <Bot size={16} className="text-green-400" />
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg rounded-bl-none p-3 border border-gray-700/50">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
}