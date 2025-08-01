// SecureDSA-Pro Background Service Worker
// Zero-trace DSA solver with multi-model orchestration

class SecureDSAServiceWorker {
  constructor() {
    this.n8nWebhook = 'http://127.0.0.1:5678/webhook/dsa';
    this.mcpServers = {
      'gpt4o': 'http://localhost:11434/api/generate',
      'deepseek': 'http://localhost:11436/api/generate',
      'claude-3.5-sonnet': 'http://localhost:11435/api/generate'
    };
    this.maxAttempts = 4;
    this.currentAttempt = 0;
    this.failureContext = [];
    
    this.initialize();
  }

  async initialize() {
    // Set up message listeners
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep message channel open for async response
    });

    // Initialize storage
    await this.initializeStorage();
    
    console.log('SecureDSA-Pro Service Worker initialized');
  }

  async initializeStorage() {
    // Initialize session storage for zero-trace operation
    const storage = await chrome.storage.session.get(null);
    if (!storage.dsaHistory) {
      await chrome.storage.session.set({
        dsaHistory: [],
        failureContext: [],
        userPreferences: {
          preferredLanguage: 'python',
          showStepByStep: true,
          maxAttempts: 4
        }
      });
    }
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.type) {
        case 'solveProblem':
          const result = await this.solveDSAProblem(
            request.problem, 
            request.language || 'python',
            request.testCases || []
          );
          sendResponse({ success: true, result });
          break;
          
        case 'getHistory':
          const history = await this.getSolutionHistory();
          sendResponse({ success: true, history });
          break;
          
        case 'clearHistory':
          await this.clearSolutionHistory();
          sendResponse({ success: true });
          break;
          
        case 'updatePreferences':
          await this.updateUserPreferences(request.preferences);
          sendResponse({ success: true });
          break;
          
        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('Service worker error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async solveDSAProblem(problemText, language = 'python', testCases = []) {
    this.currentAttempt = 0;
    this.failureContext = [];
    
    try {
      // Import the AI service
      const { SecureDSAProService } = await import(chrome.runtime.getURL('ai-service.js'));
      const aiService = new SecureDSAProService();
      
      // Use the new AI service to solve the problem
      const result = await aiService.solveDSAProblem(problemText, testCases, language);
      
      if (result.success) {
        await this.storeSuccessfulSolution(result);
        return this.formatSuccessResponse(result);
      } else {
        await this.storeFailureContext(result, this.currentAttempt);
        return this.formatFailureResponse(result);
      }
    } catch (error) {
      console.error('Error in solveDSAProblem:', error);
      return this.formatFailureResponse({ error: error.message });
    }
  }
    
    return this.formatFailureResponse();
  }

  async analyzeProblem(problemText) {
    // Concurrent analysis with both models
    const [gptAnalysis, claudeAnalysis] = await Promise.all([
      this.callMCPModel('gpt4o-mini', {
        prompt: this.getAnalysisPrompt(problemText),
        maxTokens: 1000
      }),
      this.callMCPModel('claude-sonnet', {
        prompt: this.getAnalysisPrompt(problemText),
        maxTokens: 1000
      })
    ]);

    // Combine and validate analyses
    return this.combineAnalyses(gptAnalysis, claudeAnalysis, problemText);
  }

  async attemptSolution(analysis, attempt) {
    const model = this.getModelForAttempt(attempt);
    const context = await this.getFailureContext();
    
    // Generate solution
    const solution = await this.callMCPModel(model, {
      prompt: this.getSolutionPrompt(analysis, context, attempt),
      maxTokens: 2000
    });
    
    // Test solution
    const testResults = await this.runTests(solution.code, analysis.testCases);
    
    return {
      success: testResults.allPassed,
      solution,
      testResults,
      model: model,
      attempt: attempt
    };
  }

  async callMCPModel(modelName, request) {
    try {
      const endpoint = this.mcpServers[modelName];
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt(modelName)
            },
            {
              role: 'user',
              content: request.prompt
            }
          ],
          max_tokens: request.maxTokens,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`MCP server error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error(`Error calling ${modelName}:`, error);
      throw error;
    }
  }

  async runTests(code, testCases) {
    // Use Pyodide for sandboxed Python execution
    try {
      const pyodide = await this.loadPyodide();
      
      const results = [];
      for (const testCase of testCases) {
        try {
          // Set up test environment
          pyodide.globals.set("input_data", testCase.input);
          pyodide.globals.set("expected_output", testCase.expected);
          
          // Execute code
          const result = pyodide.runPython(code);
          
          results.push({
            passed: result === testCase.expected,
            actual: result,
            expected: testCase.expected,
            input: testCase.input
          });
        } catch (error) {
          results.push({
            passed: false,
            error: error.message,
            input: testCase.input
          });
        }
      }
      
      return {
        results,
        allPassed: results.every(r => r.passed),
        passedCount: results.filter(r => r.passed).length,
        totalCount: results.length
      };
    } catch (error) {
      console.error('Test execution error:', error);
      return {
        results: [],
        allPassed: false,
        error: error.message
      };
    }
  }

  async loadPyodide() {
    // Load Pyodide for client-side Python execution
    if (typeof loadPyodide === 'undefined') {
      // Load Pyodide script if not already loaded
      await import('https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js');
    }
    return await loadPyodide();
  }

  getModelForAttempt(attempt) {
    const models = ['gpt4o', 'deepseek', 'claude-3.5-sonnet', 'gpt4o'];
    return models[attempt % models.length];
  }

  getAnalysisPrompt(problemText) {
    return `Analyze this DSA problem and extract:
1. Problem category (Array, String, Graph, Tree, DP, etc.)
2. Input/Output format and constraints
3. Time/Space complexity requirements
4. Key algorithmic patterns needed
5. Edge cases to consider
6. Sample test cases

Problem: ${problemText}

Return structured JSON with extracted information.`;
  }

  getSolutionPrompt(analysis, failureContext, attempt) {
    return `Based on this analysis, provide:
1. Optimal algorithm selection with reasoning
2. Step-by-step pseudocode
3. Complete implementation in Python
4. Big-O analysis
5. Test case generation

Analysis: ${JSON.stringify(analysis)}
Previous failures: ${JSON.stringify(failureContext)}
Attempt: ${attempt + 1}

Generate production-ready code with comprehensive error handling.`;
  }

  getSystemPrompt(modelName) {
    const prompts = {
      'gpt4o': 'You are an expert DSA problem solver. Provide optimal solutions with detailed explanations.',
      'deepseek': 'You are a competitive programming expert specializing in DSA. Focus on efficient algorithms, edge case handling, and optimal solutions.',
      'claude-3.5-sonnet': 'You are a competitive programming expert. Focus on efficient algorithms and edge case handling.'
    };
    return prompts[modelName] || prompts['gpt4o'];
  }

  combineAnalyses(gptAnalysis, claudeAnalysis, problemText) {
    // Parse and combine analyses from both models
    try {
      const gptData = JSON.parse(gptAnalysis);
      const claudeData = JSON.parse(claudeAnalysis);
      
      return {
        category: gptData.category || claudeData.category,
        constraints: [...(gptData.constraints || []), ...(claudeData.constraints || [])],
        testCases: [...(gptData.testCases || []), ...(claudeData.testCases || [])],
        complexity: {
          time: gptData.complexity?.time || claudeData.complexity?.time,
          space: gptData.complexity?.space || claudeData.complexity?.space
        },
        patterns: [...(gptData.patterns || []), ...(claudeData.patterns || [])],
        edgeCases: [...(gptData.edgeCases || []), ...(claudeData.edgeCases || [])]
      };
    } catch (error) {
      console.error('Error parsing analyses:', error);
      return this.createDefaultAnalysis(problemText);
    }
  }

  createDefaultAnalysis(problemText) {
    return {
      category: 'Unknown',
      constraints: [],
      testCases: [],
      complexity: { time: 'O(n)', space: 'O(1)' },
      patterns: [],
      edgeCases: []
    };
  }

  async storeFailureContext(result, attempt) {
    const failureData = {
      attempt: attempt,
      model: result.model,
      solution: result.solution,
      testResults: result.testResults,
      timestamp: Date.now()
    };
    
    this.failureContext.push(failureData);
    
    // Store in session storage
    const storage = await chrome.storage.session.get('failureContext');
    const failureContext = storage.failureContext || [];
    failureContext.push(failureData);
    await chrome.storage.session.set({ failureContext });
  }

  async getFailureContext() {
    const storage = await chrome.storage.session.get('failureContext');
    return storage.failureContext || [];
  }

  async storeSuccessfulSolution(result) {
    const solutionData = {
      solution: result.solution,
      testResults: result.testResults,
      model: result.model,
      timestamp: Date.now()
    };
    
    const storage = await chrome.storage.session.get('dsaHistory');
    const history = storage.dsaHistory || [];
    history.unshift(solutionData);
    
    // Keep only last 50 solutions
    if (history.length > 50) {
      history.splice(50);
    }
    
    await chrome.storage.session.set({ dsaHistory: history });
  }

  async getSolutionHistory() {
    const storage = await chrome.storage.session.get('dsaHistory');
    return storage.dsaHistory || [];
  }

  async clearSolutionHistory() {
    await chrome.storage.session.set({ dsaHistory: [] });
  }

  async updateUserPreferences(preferences) {
    const storage = await chrome.storage.session.get('userPreferences');
    const currentPrefs = storage.userPreferences || {};
    const updatedPrefs = { ...currentPrefs, ...preferences };
    await chrome.storage.session.set({ userPreferences: updatedPrefs });
  }

  formatSuccessResponse(result) {
    return {
      success: true,
      solution: result.solution,
      testResults: result.testResults,
      model: result.model,
      attempt: result.attempt,
      message: `✅ Problem solved successfully using ${result.model} on attempt ${result.attempt + 1}`
    };
  }

  formatFailureResponse() {
    return {
      success: false,
      message: `❌ Failed to solve problem after ${this.maxAttempts} attempts. Check the failure history for details.`,
      failureContext: this.failureContext
    };
  }
}

// Initialize the service worker
const serviceWorker = new SecureDSAServiceWorker(); 