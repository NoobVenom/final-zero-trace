import { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { MessageList } from './components/MessageList';
import { ChatInput } from './components/ChatInput';
import { DSASolver } from './components/DSASolver';
import { useStorage } from './hooks/useStorage';
import { useAI } from './hooks/useAI';
import type { Message, AppMode, AIConfig, Context, DSAProblem } from './types';

function App() {
  // State management
  const [mode, setMode] = useState<AppMode>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [webAccess, setWebAccess] = useState(false);
  const [context, setContext] = useState<Context>({});
  
  // Persistent storage
  const { value: selectedModel, updateValue: setSelectedModel } = useStorage('model', 'gpt-3.5-turbo');
  const { value: credits, updateValue: setCredits } = useStorage('credits', 100);
  
  // AI configuration - using backend instead of API key
  const config: AIConfig = {
    apiKey: 'backend', // Dummy value to indicate backend mode
    model: selectedModel,
    temperature: 0.7,
    maxTokens: 2000,
  };

  const { 
    sendMessage, 
    generateImage, 
    webSearch, 
    callFunction, 
    solveDSAProblem,
    analyzeComplexity,
    generateTestCases,
    uploadFile,
    analyzeFile,
    isLoading 
  } = useAI(config);

  // Function to refresh webpage context
  const refreshContext = useCallback(async () => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]?.id) {
          const results = await chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: () => {
              return {
                webpageContent: document.body.innerText.substring(0, 3000),
                selectedText: window.getSelection()?.toString() || ''
              };
            }
          });
          
          if (results[0]?.result) {
            setContext(results[0].result);
            return results[0].result;
          }
        }
      } catch (error) {
        console.log('Could not access page content:', error);
        // Silently fail if we can't access the page
      }
    }
    return context;
  }, [context]);

  // Get webpage content and selected text from Chrome extension on mount
  useEffect(() => {
    refreshContext();
  }, [refreshContext]);

  // Message handling
  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    // Keywords that suggest a real-time/news/search query
    // You can expand this list as needed
    const searchKeywords = [
      'news', 'latest', 'current', 'today', 'weather', 'stock', 'price',
      'who is', 'what is', 'when is', 'where is', 'show me', 'find',
      'search', 'headline', 'update', 'score', 'result', 'live', 'breaking',
      'trending', 'happening', 'event', 'report', 'forecast', 'exchange rate',
      'currency', 'sports', 'movie release', 'box office', 'covid', 'pandemic',
      'earthquake', 'disaster', 'alert', 'traffic', 'flight status', 'holiday',
      'festival', 'election', 'poll', 'winner', 'loser', 'top stories', 'market',
      'crypto', 'bitcoin', 'ethereum', 'gold price', 'silver price', 'oil price',
      'IPO', 'merger', 'acquisition', 'announcement', 'press release', 'recall',
      'outage', 'shutdown', 'service status', 'downtime', 'maintenance', 'incident'
    ];
    const lowerInput = input.trim().toLowerCase();
    const isSearchQuery = searchKeywords.some(keyword => lowerInput.includes(keyword));

    if (isSearchQuery) {
      // Use web search
      addMessage({
        role: 'user',
        content: input,
      });
      try {
        const searchResult = await webSearch(input.trim());
        addMessage({
          role: 'assistant',
          content: searchResult,
          metadata: { model: 'web-search', source: 'search' },
        });
        setCredits(Math.max(0, credits - 2));
      } catch (error) {
        addMessage({
          role: 'assistant',
          content: `I encountered an issue with the web search. Please try again or check your backend server connection.`,
        });
      }
      setInput('');
      return;
    }

    // Otherwise, use AI as usual
    // Refresh context before sending message
    const currentContext = await refreshContext();

    // Add user message first
    const userMessage = addMessage({
      role: 'user',
      content: input,
    });

    setInput('');

    try {
      // Create assistant message for streaming
      const assistantMessage = addMessage({
        role: 'assistant',
        content: '',
        metadata: { model: selectedModel },
      });

      // Get all messages including the new user message
      const currentMessages = [...messages, userMessage];
      let assistantContent = '';

      // Stream response with context
      await sendMessage(
        currentMessages,
        (chunk: string) => {
          assistantContent += chunk;
          setMessages((prev: Message[]) => 
            prev.map(msg => 
              msg.id === assistantMessage.id 
                ? { ...msg, content: assistantContent }
                : msg
            )
          );
        },
        mode,
        currentContext
      );

      // Deduct credits
      setCredits(Math.max(0, credits - 1));
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage({
        role: 'assistant',
        content: `I apologize, but I encountered an issue. Please make sure your backend server is running at http://localhost:3000. If the server is running, check the console for more details.`,
      });
    }
  }, [input, isLoading, messages, selectedModel, addMessage, sendMessage, setCredits, credits, mode, refreshContext]);

  const handleWebSearch = useCallback(async (query: string) => {
    if (!query.trim() || isLoading) return;

    addMessage({
      role: 'user',
      content: `Search: ${query}`,
    });

    try {
      const searchResult = await webSearch(query);
      
      addMessage({
        role: 'assistant',
        content: searchResult,
        metadata: { 
          model: 'web-search',
          source: 'search'
        },
      });

      // Deduct credits for web search
      setCredits(Math.max(0, credits - 2));
    } catch (error) {
      console.error('Error performing web search:', error);
      addMessage({
        role: 'assistant',
        content: `I encountered an issue with the web search. Please try again or check your backend server connection.`,
      });
    }
  }, [isLoading, addMessage, webSearch, setCredits, credits]);

  const handleFunctionCall = useCallback(async (functionName: string, args: any) => {
    if (isLoading) return;

    addMessage({
      role: 'user',
      content: `Execute: ${functionName}(${JSON.stringify(args)})`,
    });

    try {
      const result = await callFunction(functionName, args);
      
      addMessage({
        role: 'assistant',
        content: result,
        metadata: { 
          model: 'function-call',
          functionName: functionName
        },
      });

      // Deduct credits for function calls
      setCredits(Math.max(0, credits - 1));
    } catch (error) {
      console.error('Error calling function:', error);
      addMessage({
        role: 'assistant',
        content: `I encountered an issue executing the function. Please try again or check your backend server connection.`,
      });
    }
  }, [isLoading, addMessage, callFunction, setCredits, credits]);

  const handleGenerateImage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    addMessage({
      role: 'user',
      content: `Generate image: ${input}`,
    });

    setInput('');

    try {
      const imageUrl = await generateImage();
      
      addMessage({
        role: 'assistant',
        content: 'Here is your generated image:',
        type: 'image',
        metadata: { 
          model: 'dall-e-3',
          imageUrl 
        },
      });

      // Deduct more credits for image generation
      setCredits(Math.max(0, credits - 5));
    } catch (error) {
      console.error('Error generating image:', error);
      addMessage({
        role: 'assistant',
        content: `I've generated a demo image for you! Image generation is currently in demo mode. You can extend your backend to support real image generation with DALL-E 3.`,
      });
    }
  }, [input, isLoading, addMessage, generateImage, setCredits, credits]);

  // DSA Problem solving handlers
  const handleSolveDSAProblem = useCallback(async (problem: DSAProblem, language: string) => {
    try {
      const solution = await solveDSAProblem(problem, language);
      
      // Add solution to messages
      addMessage({
        role: 'assistant',
        content: `**Solution for ${problem.title}**\n\n${solution.code}\n\n**Complexity Analysis:**\n- Time: ${solution.timeComplexity}\n- Space: ${solution.spaceComplexity}\n\n**Approach:** ${solution.approach}\n\n**Explanation:** ${solution.explanation}`,
        type: 'solution',
        metadata: {
          model: 'dsa-solver',
          problemType: problem.category,
          difficulty: problem.difficulty,
          timeComplexity: solution.timeComplexity,
          spaceComplexity: solution.spaceComplexity,
          programmingLanguage: solution.language,
          testCases: solution.testCases
        }
      });

      // Deduct credits for DSA solving
      setCredits(Math.max(0, credits - 3));
      
      return solution;
    } catch (error) {
      console.error('Error solving DSA problem:', error);
      throw error;
    }
  }, [solveDSAProblem, addMessage, setCredits, credits]);

  const handleAnalyzeComplexity = useCallback(async (code: string, language: string) => {
    try {
      const analysis = await analyzeComplexity(code, language);
      
      addMessage({
        role: 'assistant',
        content: `**Complexity Analysis**\n\n- **Time Complexity:** ${analysis.timeComplexity}\n- **Space Complexity:** ${analysis.spaceComplexity}\n\n**Explanation:** ${analysis.explanation}\n\n**Optimization:** ${analysis.optimization}`,
        type: 'complexity-analysis',
        metadata: {
          model: 'complexity-analyzer',
          timeComplexity: analysis.timeComplexity,
          spaceComplexity: analysis.spaceComplexity
        }
      });

      // Deduct credits for complexity analysis
      setCredits(Math.max(0, credits - 1));
      
      return analysis;
    } catch (error) {
      console.error('Error analyzing complexity:', error);
      throw error;
    }
  }, [analyzeComplexity, addMessage, setCredits, credits]);

  const handleGenerateTestCases = useCallback(async (description: string, count: number) => {
    try {
      const testCases = await generateTestCases(description, count);
      
      addMessage({
        role: 'assistant',
        content: `**Generated Test Cases**\n\n${testCases.map((testCase, index) => 
          `**Test Case ${index + 1}:**\nInput: ${testCase.input}\nOutput: ${testCase.output}${testCase.description ? `\nDescription: ${testCase.description}` : ''}`
        ).join('\n\n')}`,
        type: 'dsa-problem',
        metadata: {
          model: 'test-generator',
          testCases: testCases
        }
      });

      // Deduct credits for test case generation
      setCredits(Math.max(0, credits - 1));
      
      return testCases;
    } catch (error) {
      console.error('Error generating test cases:', error);
      throw error;
    }
  }, [generateTestCases, addMessage, setCredits, credits]);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setInput('');
    // Generate new conversation ID for fresh context
    window.location.reload();
  }, []);

  const handleModeChange = useCallback((newMode: AppMode) => {
    setMode(newMode);
    // Optionally clear messages when switching modes
    // setMessages([]);
  }, []);

  // Render different content based on mode
  const renderMainContent = () => {
    if (mode === 'dsa-solver') {
      return (
        <DSASolver
          onSolve={handleSolveDSAProblem}
          onAnalyzeComplexity={handleAnalyzeComplexity}
          onGenerateTestCases={handleGenerateTestCases}
          onFileUpload={uploadFile}
          onFileAnalysis={analyzeFile}
          isLoading={isLoading}
        />
      );
    }

    // Default chat interface
    return (
      <>
        {messages.length === 0 ? (
          <WelcomeScreen mode={mode} hasApiKey={true} />
        ) : (
          <MessageList messages={messages} isLoading={isLoading} />
        )}
        
        {/* Chat Input */}
        <ChatInput
          mode={mode}
          input={input}
          setInput={setInput}
          onSend={handleSend}
          onGenerateImage={handleGenerateImage}
          onWebSearch={handleWebSearch}
          onFunctionCall={handleFunctionCall}
          onFileUpload={uploadFile}
          onFileAnalysis={analyzeFile}
          isLoading={isLoading}
          hasApiKey={true} // Always allow since we're using backend
          model={selectedModel}
          onModelChange={setSelectedModel}
          webAccess={webAccess}
          onWebAccessToggle={() => setWebAccess(!webAccess)}
          context={context}
        />
      </>
    );
  };

  return (
    <div className="w-[400px] h-[700px] bg-gray-950 text-white flex flex-col border border-gray-800/50 shadow-2xl">
      {/* Header */}
      <Header mode={mode} model={selectedModel} credits={credits} />
      
      <div className="flex flex-1 min-h-0">
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {renderMainContent()}
        </div>
        
        {/* Sidebar */}
        <Sidebar
          mode={mode}
          onModeChange={handleModeChange}
          onNewChat={handleNewChat}
        />
      </div>
    </div>
  );
}

export default App;