/**
 * SecureDSA-Pro AI Service
 * Implements the complete flowchart logic for DSA problem solving
 */

class SecureDSAProService {
    constructor() {
        this.primaryModel = {
            name: 'Claude 3.5',
            port: 11434,
            url: 'http://localhost:11434/api/generate'
        };
        
        this.secondaryModel = {
            name: 'Deepseek v3',
            port: 11436,
            url: 'http://localhost:11436/api/generate'
        };
        
                       this.retryModels = [
                   {
                       name: 'GPT-4.1',
                       port: 11435,
                       url: 'http://localhost:11435/api/generate'
                   },
            {
                name: 'Grok4',
                port: 11437,
                url: 'http://localhost:11437/api/generate'
            }
        ];
        
        this.qualityThreshold = 0.7;
        this.dataStorage = new Map();
        this.currentAttempt = 0;
        this.maxAttempts = 4;
    }

    /**
     * Main entry point - implements the complete flowchart
     */
    async solveDSAProblem(problemStatement, testCases = [], language = 'python') {
        console.log('🎯 Starting SecureDSA-Pro Analysis');
        
        // Step 1: Validate Input
        const validation = this.validateInput(problemStatement);
        if (!validation.isValid) {
            throw new Error(`Invalid input: ${validation.error}`);
        }

        // Step 2: Initialize Progress Tracking
        this.initializeProgressTracking(problemStatement);

        // Step 3: Concurrent Analysis
        const concurrentResults = await this.performConcurrentAnalysis(problemStatement, language);
        
        // Step 4: Wait for Both Models to Complete
        const { primarySolution, secondarySolution } = concurrentResults;
        
        // Step 5: Extract Solutions from Both Models
        const extractedSolutions = this.extractSolutions(primarySolution, secondarySolution);
        
        // Step 6: Solution Evaluation
        const evaluationResult = this.evaluateSolutions(extractedSolutions);
        
        if (evaluationResult.selectedSolution) {
            // Step 7: Test Case Execution
            const testResult = await this.executeTestCases(evaluationResult.selectedSolution.solution, testCases, language);
            
            if (testResult.allPassed) {
                return {
                    success: true,
                    solution: evaluationResult.selectedSolution.solution,
                    testResults: testResult,
                    model: evaluationResult.selectedModel
                };
            } else {
                // Test cases failed, initiate retry mechanism
                return await this.handleTestFailure(evaluationResult.selectedSolution.solution, testResult, testCases, language);
            }
        } else {
            // Both solutions below threshold, initiate retry
            return await this.initiateRetryProcess(problemStatement, testCases, language);
        }
    }

    /**
     * Step 1: Input Validation
     */
    validateInput(problemStatement) {
        if (!problemStatement || typeof problemStatement !== 'string') {
            return { isValid: false, error: 'Problem statement must be a non-empty string' };
        }
        
        if (problemStatement.trim().length < 10) {
            return { isValid: false, error: 'Problem statement too short' };
        }
        
        return { isValid: true };
    }

    /**
     * Step 2: Initialize Progress Tracking
     */
    initializeProgressTracking(problemStatement) {
        this.currentAttempt = 0;
        this.dataStorage.clear();
        
        // Store initial problem data
        this.dataStorage.set('problemStatement', problemStatement);
        this.dataStorage.set('attempts', []);
        this.dataStorage.set('startTime', Date.now());
        
        console.log('📊 Progress tracking initialized');
    }

    /**
     * Step 3: Concurrent Analysis
     */
    async performConcurrentAnalysis(problemStatement, language) {
        console.log('🔄 Starting concurrent analysis with Claude 3.5 and Deepseek v3');
        
        const primaryPromise = this.queryAIModel(this.primaryModel, problemStatement, language);
        const secondaryPromise = this.queryAIModel(this.secondaryModel, problemStatement, language);
        
        try {
            const [primarySolution, secondarySolution] = await Promise.all([
                primaryPromise,
                secondaryPromise
            ]);
            
            return { primarySolution, secondarySolution };
        } catch (error) {
            console.error('❌ Concurrent analysis failed:', error);
            throw new Error('Failed to perform concurrent analysis');
        }
    }

    /**
     * Query individual AI model
     */
    async queryAIModel(model, problemStatement, language) {
        const prompt = this.buildPrompt(problemStatement, language);
        
        try {
            const response = await fetch(model.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.getModelName(model.name),
                    prompt: prompt,
                    stream: false,
                    options: {
                        temperature: 0.1,
                        top_p: 0.9,
                        max_tokens: 4000
                    }
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            return {
                model: model.name,
                solution: data.response,
                timestamp: Date.now(),
                quality: this.assessSolutionQuality(data.response)
            };
        } catch (error) {
            console.error(`❌ Error querying ${model.name}:`, error);
            return {
                model: model.name,
                solution: null,
                error: error.message,
                timestamp: Date.now(),
                quality: 0
            };
        }
    }

    /**
     * Build comprehensive prompt for DSA problems
     */
    buildPrompt(problemStatement, language) {
        return `You are an expert Data Structures and Algorithms problem solver. 

PROBLEM STATEMENT:
${problemStatement}

REQUIREMENTS:
1. Analyze the problem thoroughly
2. Identify the problem category (Array, String, Graph, Tree, Dynamic Programming, etc.)
3. Determine optimal time and space complexity
4. Write clear pseudocode
5. Implement the solution in ${language}
6. Include error handling and edge cases
7. Add comments explaining the logic

OUTPUT FORMAT:
Please provide your response in the following JSON format:
{
  "problem_analysis": {
    "category": "problem_category",
    "complexity": {
      "time": "O(n)",
      "space": "O(n)"
    },
    "approach": "brief_description_of_approach"
  },
  "pseudocode": "step_by_step_pseudocode",
  "solution": "complete_${language}_code",
  "test_cases": [
    {
      "input": "sample_input",
      "expected_output": "expected_output",
      "description": "test_case_description"
    }
  ]
}

Ensure your solution is correct, efficient, and handles edge cases properly.`;
    }

    /**
     * Get model name for Ollama
     */
    getModelName(modelDisplayName) {
        const modelMap = {
            'Claude 3.5': 'claude-3.5-sonnet',
            'Deepseek v3': 'deepseek-coder:33b',
            'GPT-4o': 'gpt4o',
            'Grok4': 'grok4'
        };
        return modelMap[modelDisplayName] || modelDisplayName;
    }

    /**
     * Step 5: Extract Solutions from Both Models
     */
    extractSolutions(primarySolution, secondarySolution) {
        console.log('📋 Extracting solutions from both models');
        
        const solutions = [];
        
        if (primarySolution && primarySolution.solution) {
            solutions.push({
                ...primarySolution,
                type: 'primary'
            });
        }
        
        if (secondarySolution && secondarySolution.solution) {
            solutions.push({
                ...secondarySolution,
                type: 'secondary'
            });
        }
        
        return solutions;
    }

    /**
     * Step 6: Solution Evaluation
     */
    evaluateSolutions(solutions) {
        console.log('🔍 Evaluating solution quality');
        
        let bestSolution = null;
        let bestQuality = 0;
        let selectedModel = null;
        
        for (const solution of solutions) {
            if (solution.quality > bestQuality) {
                bestQuality = solution.quality;
                bestSolution = solution;
                selectedModel = solution.model;
            }
        }
        
        const evaluationResult = {
            selectedSolution: bestQuality >= this.qualityThreshold ? bestSolution : null,
            selectedModel: selectedModel,
            quality: bestQuality,
            threshold: this.qualityThreshold,
            allSolutions: solutions
        };
        
        console.log(`📊 Evaluation result: Quality=${bestQuality}, Threshold=${this.qualityThreshold}`);
        
        return evaluationResult;
    }

    /**
     * Assess solution quality based on multiple criteria
     */
    assessSolutionQuality(solution) {
        if (!solution) return 0;
        
        let quality = 0;
        
        // Check for JSON structure
        try {
            const parsed = JSON.parse(solution);
            quality += 0.3;
            
            // Check for required fields
            if (parsed.problem_analysis) quality += 0.2;
            if (parsed.pseudocode) quality += 0.2;
            if (parsed.solution) quality += 0.2;
            if (parsed.test_cases) quality += 0.1;
            
        } catch (e) {
            // Not JSON, assess as plain text
            if (solution.includes('def ') || solution.includes('function ')) quality += 0.3;
            if (solution.includes('class ') || solution.includes('import ')) quality += 0.2;
            if (solution.length > 100) quality += 0.2;
            if (solution.includes('//') || solution.includes('#')) quality += 0.1;
        }
        
        return Math.min(quality, 1.0);
    }

    /**
     * Step 7: Test Case Execution
     */
    async executeTestCases(solution, testCases, language = 'python') {
        console.log('🧪 Executing test cases');
        
        try {
            // Import and use the test runner
            const { SecureDSATestRunner } = await import(chrome.runtime.getURL('test-runner.js'));
            const testRunner = new SecureDSATestRunner();
            
            return await testRunner.executeTestCases(solution, testCases, language);
            
        } catch (error) {
            console.error('❌ Test execution error:', error);
            return {
                allPassed: false,
                results: [],
                totalTests: testCases.length,
                passedTests: 0,
                error: error.message
            };
        }
    }

    /**
     * Parse solution to extract code
     */
    parseSolution(solution) {
        try {
            const parsed = JSON.parse(solution);
            return parsed.solution || solution;
        } catch (e) {
            return solution;
        }
    }



    /**
     * Handle test failure and initiate retry process
     */
    async handleTestFailure(solution, testResult, testCases, language) {
        console.log('❌ Test cases failed, initiating retry process');
        
        // Store failure data
        this.storeFailureData(solution, testResult);
        
        return await this.initiateRetryProcess(
            this.dataStorage.get('problemStatement'),
            testCases,
            language
        );
    }

    /**
     * Store failure data for retry models
     */
    storeFailureData(solution, testResult) {
        const failureData = {
            failedSolution: solution,
            testResults: testResult,
            timestamp: Date.now(),
            attempt: this.currentAttempt
        };
        
        const attempts = this.dataStorage.get('attempts') || [];
        attempts.push(failureData);
        this.dataStorage.set('attempts', attempts);
        
        console.log('💾 Failure data stored for retry models');
    }

    /**
     * Initiate retry process with different models
     */
    async initiateRetryProcess(problemStatement, testCases, language) {
        console.log('🔄 Starting retry process');
        
        for (const retryModel of this.retryModels) {
            this.currentAttempt++;
            
            if (this.currentAttempt > this.maxAttempts) {
                return {
                    success: false,
                    error: 'Maximum retry attempts exceeded',
                    attempts: this.dataStorage.get('attempts')
                };
            }
            
            console.log(`🔄 Attempt ${this.currentAttempt}: Trying ${retryModel.name}`);
            
            try {
                const retrySolution = await this.queryAIModel(retryModel, problemStatement, language);
                
                if (retrySolution.solution && retrySolution.quality >= this.qualityThreshold) {
                    const testResult = await this.executeTestCases(retrySolution.solution, testCases, language);
                    
                    if (testResult.allPassed) {
                        return {
                            success: true,
                            solution: retrySolution.solution,
                            testResults: testResult,
                            model: retryModel.name,
                            attempt: this.currentAttempt
                        };
                    } else {
                        this.storeFailureData(retrySolution.solution, testResult);
                    }
                }
            } catch (error) {
                console.error(`❌ Retry attempt ${this.currentAttempt} failed:`, error);
                this.storeFailureData(null, { error: error.message });
            }
        }
        
        return {
            success: false,
            error: 'All retry attempts failed',
            attempts: this.dataStorage.get('attempts')
        };
    }

    /**
     * Get current status and statistics
     */
    getStatus() {
        return {
            currentAttempt: this.currentAttempt,
            maxAttempts: this.maxAttempts,
            dataStorageSize: this.dataStorage.size,
            startTime: this.dataStorage.get('startTime'),
            attempts: this.dataStorage.get('attempts') || []
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecureDSAProService;
} 