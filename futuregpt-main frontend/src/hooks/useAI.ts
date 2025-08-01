import { useState, useCallback } from 'react';
import type { Message, AIConfig, DSAProblem, DSASolution, TestCase, ComplexityAnalysis, UploadedFile, ImageAnalysis, DocumentAnalysis } from '../types';

// Enhanced demo responses for DSA and competitive programming
const getDemoResponse = (input: string, mode: string) => {
  const lowerInput = input.toLowerCase();
  
  // DSA and competitive programming queries
  if (mode === 'dsa-solver' || mode === 'competitive' || 
      lowerInput.includes('algorithm') || lowerInput.includes('complexity') || 
      lowerInput.includes('leetcode') || lowerInput.includes('codeforces') ||
      lowerInput.includes('binary search') || lowerInput.includes('dynamic programming') ||
      lowerInput.includes('graph') || lowerInput.includes('tree') || 
      lowerInput.includes('array') || lowerInput.includes('string') ||
      lowerInput.includes('sort') || lowerInput.includes('hash') ||
      lowerInput.includes('stack') || lowerInput.includes('queue')) {
    
    return `🚀 **Competitive Programming Solution**

Here's an optimized solution for your DSA problem:

\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    // Time Complexity: O(n)
    // Space Complexity: O(1)
    int solve(vector<int>& nums) {
        int n = nums.size();
        if (n == 0) return 0;
        
        int maxSum = nums[0];
        int currentSum = nums[0];
        
        for (int i = 1; i < n; i++) {
            currentSum = max(nums[i], currentSum + nums[i]);
            maxSum = max(maxSum, currentSum);
        }
        
        return maxSum;
    }
};
\`\`\`

**Complexity Analysis:**
- ⏰ **Time Complexity:** O(n) - Single pass through array
- 💾 **Space Complexity:** O(1) - Constant extra space
- 🎯 **Approach:** Kadane's Algorithm for maximum subarray sum

**Test Cases:**
\`\`\`
Input: [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: [4,-1,2,1] has the largest sum = 6

Input: [1]
Output: 1

Input: [5,4,-1,7,8]
Output: 23
\`\`\`

This is a demo response. With your backend server, I can provide real-time solutions for any DSA problem with multiple programming languages, complexity analysis, and edge case handling.`;
  }
  
  // Code-related queries
  if (lowerInput.includes('code') || lowerInput.includes('function') || lowerInput.includes('javascript') || lowerInput.includes('python') || lowerInput.includes('react')) {
    return `Here's a code example for your request:

\`\`\`javascript
function example() {
  // This is a demo response
  console.log("zeroTrace is working!");
  return "Privacy-first AI in action";
}
\`\`\`

This is a demonstration of zeroTrace's code capabilities. In the full version with your backend server, I can provide real code generation, debugging, and explanations.`;
  }
  
  // Research-related queries
  if (mode === 'research' || lowerInput.includes('research') || lowerInput.includes('analyze') || lowerInput.includes('study')) {
    return `Based on my analysis, here are the key findings:

• **Privacy-First Design**: zeroTrace processes everything in-memory
• **Zero Data Storage**: No persistent logging or tracking
• **Advanced AI**: Multiple modes for different use cases
• **Context Awareness**: Can analyze webpage content and selected text
• **Conversation Memory**: Maintains context across interactions

This is a demonstration of research capabilities. With your backend server, I can provide real-time research with web access and comprehensive analysis.`;
  }
  
  // Vision-related queries
  if (mode === 'vision' || lowerInput.includes('image') || lowerInput.includes('picture') || lowerInput.includes('visual')) {
    return `I can analyze images and provide detailed descriptions, extract text, identify objects, and more. 

In demo mode, I'm showing you the interface capabilities. With your backend server, I can process actual images using GPT-4 Vision for real visual understanding.`;
  }
  
  // General chat responses
  const generalResponses = [
    `Hello! I'm zeroTrace, your privacy-first AI companion. I'm currently running in demo mode to show you the interface. Everything you see here processes in-memory with zero data storage.`,
    
    `That's an interesting question! In full mode with your backend server, I can provide detailed, accurate responses with context awareness and conversation memory. Right now, I'm demonstrating the sleek interface and privacy-first approach of zeroTrace.`,
    
    `I understand you're exploring zeroTrace's capabilities. This extension is designed to be your private AI assistant - no data logging, no tracking, just pure AI assistance when you connect to your backend.`,
    
    `Great to chat with you! zeroTrace offers multiple AI modes: Chat for conversations, Research for deep analysis, Code for programming help, and Vision for image understanding. All processing happens in-memory only.`,
    
    `I'm designed to be helpful while respecting your privacy completely. When you're ready to unlock full AI capabilities, simply ensure your backend server is running.`
  ];
  
  return generalResponses[Math.floor(Math.random() * generalResponses.length)];
};

// Generate a unique conversation ID
const generateConversationId = () => {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export function useAI(config: AIConfig) {
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId] = useState(generateConversationId());

  const sendMessage = useCallback(async (
    messages: Message[],
    onStream?: (chunk: string) => void,
    mode: string = 'chat',
    context?: {
      webpageContent?: string;
      selectedText?: string;
    }
  ) => {
    setIsLoading(true);

    try {
      // Demo mode when no API key or not in Chrome extension
      if (!config.apiKey || typeof chrome === 'undefined' || !chrome.runtime) {
        const lastMessage = messages[messages.length - 1];
        const demoResponse = getDemoResponse(lastMessage?.content || '', mode);
        
        if (onStream) {
          // Simulate realistic typing speed
          let index = 0;
          
          const streamInterval = setInterval(() => {
            if (index < demoResponse.length) {
              const chunk = demoResponse.slice(index, index + 2);
              onStream(chunk);
              index += 2;
            } else {
              clearInterval(streamInterval);
            }
          }, 30);
          
          return demoResponse;
        } else {
          return demoResponse;
        }
      }

      // Real backend API call with enhanced features
      const lastMessage = messages[messages.length - 1];
      
      const requestBody = {
        prompt: lastMessage?.content || '',
        conversationId: conversationId,
        mode: mode,
        ...(context?.webpageContent && { webpageContent: context.webpageContent }),
        ...(context?.selectedText && { selectedText: context.selectedText })
      };

      const response = await fetch('http://localhost:3000/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 402) {
          throw new Error('Quota exceeded. Please check your OpenAI plan and billing details or wait for the next reset.');
        } else {
          throw new Error(errorData.error || 'API request failed');
        }
      }

      const result = await response.json();
      const aiResponse = result.response;

      // Check if the response is just echoing the user's message
      if (aiResponse === lastMessage?.content) {
        // If backend is just echoing, provide a fallback response
        const fallbackResponse = `I understand you said: "${lastMessage?.content}". Let me provide a helpful response based on your query. This is a demo response since the backend might not be properly configured.`;
        
        if (onStream) {
          // Simulate streaming for fallback response
          let index = 0;
          
          const streamInterval = setInterval(() => {
            if (index < fallbackResponse.length) {
              const chunk = fallbackResponse.slice(index, index + 2);
              onStream(chunk);
              index += 2;
            } else {
              clearInterval(streamInterval);
            }
          }, 30);
          
          return fallbackResponse;
        } else {
          return fallbackResponse;
        }
      }

      if (onStream) {
        // Simulate streaming for backend response
        let index = 0;
        
        const streamInterval = setInterval(() => {
          if (index < aiResponse.length) {
            const chunk = aiResponse.slice(index, index + 2);
            onStream(chunk);
            index += 2;
          } else {
            clearInterval(streamInterval);
          }
        }, 30);
        
        return aiResponse;
      } else {
        return aiResponse;
      }
    } finally {
      setIsLoading(false);
    }
  }, [config, conversationId]);

  // File upload and analysis
  const uploadFile = useCallback(async (file: UploadedFile): Promise<void> => {
    setIsLoading(true);

    try {
      // Check if we're in a Chrome extension environment
      const isChromeExtension = typeof chrome !== 'undefined' && chrome.runtime;
      
      if (!isChromeExtension) {
        // Demo file upload for non-extension environment
        console.log('Demo file upload:', file.name);
        return;
      }

      const formData = new FormData();
      const blob = new Blob([file.content], { type: file.type });
      formData.append('file', blob, file.name);

      const response = await fetch('http://localhost:3000/upload-file', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }

      console.log('File uploaded successfully:', file.name);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzeFile = useCallback(async (file: UploadedFile): Promise<ImageAnalysis | DocumentAnalysis> => {
    setIsLoading(true);

    try {
      // Check if we're in a Chrome extension environment
      const isChromeExtension = typeof chrome !== 'undefined' && chrome.runtime;
      
      if (!isChromeExtension) {
        // Demo file analysis for non-extension environment
        if (file.type.startsWith('image/')) {
          return {
            description: 'This appears to be an image containing a DSA problem statement.',
            objects: ['text', 'diagram', 'problem statement'],
            text: ['Sample problem text extracted from image'],
            problemStatement: 'Find the maximum subarray sum in the given array.',
            constraints: ['1 ≤ n ≤ 10^5', '1 ≤ arr[i] ≤ 10^9'],
            inputFormat: 'First line: n (array size), Second line: n space-separated integers',
            outputFormat: 'Single integer representing maximum subarray sum'
          };
        } else {
          return {
            extractedText: 'Sample extracted text from document...',
            problemStatement: 'Find the maximum subarray sum in the given array.',
            constraints: ['1 ≤ n ≤ 10^5', '1 ≤ arr[i] ≤ 10^9'],
            inputFormat: 'First line: n (array size), Second line: n space-separated integers',
            outputFormat: 'Single integer representing maximum subarray sum',
            sampleInput: '5\n-2 1 -3 4 -1',
            sampleOutput: '4',
            explanation: 'This is a sample explanation of the problem.'
          };
        }
      }

      const formData = new FormData();
      const blob = new Blob([file.content], { type: file.type });
      formData.append('file', blob, file.name);

      const response = await fetch('http://localhost:3000/analyze-file', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File analysis failed');
      }

      const result = await response.json();
      console.log('File analysis completed:', file.name);
      return result.analysis;
    } catch (error) {
      console.error('Error analyzing file:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // New specialized DSA problem solver
  const solveDSAProblem = useCallback(async (
    problem: DSAProblem,
    language: string = 'cpp'
  ): Promise<DSASolution> => {
    setIsLoading(true);

    try {
      if (!config.apiKey || typeof chrome === 'undefined' || !chrome.runtime) {
        // Demo response for DSA problem
        return {
          code: `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    // Time Complexity: O(n)
    // Space Complexity: O(1)
    int solve(vector<int>& nums) {
        int n = nums.size();
        if (n == 0) return 0;
        
        int maxSum = nums[0];
        int currentSum = nums[0];
        
        for (int i = 1; i < n; i++) {
            currentSum = max(nums[i], currentSum + nums[i]);
            maxSum = max(maxSum, currentSum);
        }
        
        return maxSum;
    }
};`,
          language: language,
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(1)',
          approach: 'Kadane\'s Algorithm',
          explanation: 'This solution uses Kadane\'s algorithm to find the maximum subarray sum in a single pass through the array.',
          testCases: [
            { input: '[-2,1,-3,4,-1,2,1,-5,4]', output: '6', description: 'Maximum subarray sum' },
            { input: '[1]', output: '1', description: 'Single element' },
            { input: '[5,4,-1,7,8]', output: '23', description: 'All positive elements' }
          ]
        };
      }

      const response = await fetch('http://localhost:3000/solve-dsa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ problem, language }),
      });

      if (!response.ok) {
        throw new Error('DSA problem solving failed');
      }

      const result = await response.json();
      return result.solution;
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  // Code optimization and complexity analysis
  const analyzeComplexity = useCallback(async (
    code: string,
    language: string = 'cpp'
  ): Promise<ComplexityAnalysis> => {
    setIsLoading(true);

    try {
      if (!config.apiKey || typeof chrome === 'undefined' || !chrome.runtime) {
        // Demo complexity analysis
        return {
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(1)',
          explanation: 'The algorithm performs a single pass through the input array, making it O(n) time complexity. It uses only a constant amount of extra space.',
          optimization: 'Consider using more efficient data structures or algorithms if dealing with large datasets.'
        };
      }

      const response = await fetch('http://localhost:3000/analyze-complexity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, language }),
      });

      if (!response.ok) {
        throw new Error('Complexity analysis failed');
      }

      const result = await response.json();
      return result.analysis;
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  // Generate test cases for a problem
  const generateTestCases = useCallback(async (
    problemDescription: string,
    count: number = 5
  ): Promise<TestCase[]> => {
    setIsLoading(true);

    try {
      if (!config.apiKey || typeof chrome === 'undefined' || !chrome.runtime) {
        // Demo test cases
        return [
          { input: '[-2,1,-3,4,-1,2,1,-5,4]', output: '6', description: 'Standard case' },
          { input: '[1]', output: '1', description: 'Single element' },
          { input: '[5,4,-1,7,8]', output: '23', description: 'All positive' },
          { input: '[-1,-2,-3]', output: '-1', description: 'All negative' },
          { input: '[]', output: '0', description: 'Empty array' }
        ];
      }

      const response = await fetch('http://localhost:3000/generate-testcases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ problemDescription, count }),
      });

      if (!response.ok) {
        throw new Error('Test case generation failed');
      }

      const result = await response.json();
      return result.testCases;
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  const webSearch = useCallback(async (query: string) => {
    setIsLoading(true);

    try {
      // Demo mode when no API key
      if (!config.apiKey) {
        return `I found some information about "${query}". This is a demo search response. In a full implementation, this would connect to a real search API to provide current information.`;
      }

      const response = await fetch('http://localhost:3000/web-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('Web search request failed');
      }

      const result = await response.json();
      return result.response;
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  const callFunction = useCallback(async (functionName: string, args: any) => {
    setIsLoading(true);

    try {
      // Demo mode when no API key or not in Chrome extension
      if (!config.apiKey || typeof chrome === 'undefined' || !chrome.runtime) {
        return `Function "${functionName}" would be executed here. This is a demo response.`;
      }

      const response = await fetch('http://localhost:3000/function-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ functionName, arguments: args }),
      });

      if (!response.ok) {
        throw new Error('Function call request failed');
      }

      const result = await response.json();
      return result.result;
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  const generateImage = useCallback(async () => {
    setIsLoading(true);

    try {
      // Demo mode when no API key or not in Chrome extension
      if (!config.apiKey || typeof chrome === 'undefined' || !chrome.runtime) {
        // Return a beautiful placeholder image from Pexels
        return 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=1024&h=1024&fit=crop';
      }

      // For now, return a placeholder since image generation isn't implemented in the backend
      // You can extend the backend to support image generation if needed
      return 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=1024&h=1024&fit=crop';
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  return { 
    sendMessage, 
    generateImage, 
    webSearch, 
    callFunction, 
    solveDSAProblem,
    analyzeComplexity,
    generateTestCases,
    uploadFile,
    analyzeFile,
    isLoading,
    conversationId 
  };
}