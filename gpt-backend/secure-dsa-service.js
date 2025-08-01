/**
 * SecureDSA-Pro Service for Hybrid System
 * Implements the flowchart logic with multi-model AI orchestration
 */

const axios = require('axios');

class SecureDSAProService {
    constructor() {
        // Model configuration for hybrid system
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
        
        // Tracking for attempts and failures
        this.attempts = new Map();
        this.failureContext = [];
    }

    /**
     * Main entry point for DSA problem solving
     */
    async solveDSAProblem(problemText, testCases = [], language = 'python') {
        console.log('🚀 Starting SecureDSA-Pro hybrid system');
        console.log(`📝 Problem: ${problemText.substring(0, 100)}...`);
        console.log(`🧪 Test Cases: ${testCases.length}`);
        console.log(`💻 Language: ${language}`);

        try {
            // Step 1: Concurrent analysis with primary and secondary models
            const [primaryResult, secondaryResult] = await Promise.all([
                this.analyzeWithModel(this.primaryModel, problemText, language),
                this.analyzeWithModel(this.secondaryModel, problemText, language)
            ]);

            console.log('✅ Concurrent analysis completed');

            // Step 2: Evaluate and compare solutions
            const evaluation = await this.evaluateSolutions(primaryResult, secondaryResult, testCases, language);
            
            if (evaluation.bestSolution && evaluation.bestSolution.quality >= 0.8) {
                console.log('🎯 High-quality solution found!');
                return {
                    success: true,
                    solution: evaluation.bestSolution,
                    evaluation: evaluation,
                    method: 'concurrent_analysis'
                };
            }

            // Step 3: If quality is insufficient, start retry process
            console.log('🔄 Quality threshold not met, starting retry process');
            return await this.retryProcess(problemText, testCases, language, evaluation);

        } catch (error) {
            console.error('❌ Error in solveDSAProblem:', error);
            return {
                success: false,
                error: error.message,
                method: 'error'
            };
        }
    }

    /**
     * Analyze problem with a specific model
     */
    async analyzeWithModel(model, problemText, language) {
        console.log(`🤖 Analyzing with ${model.name}...`);
        
        const prompt = this.buildPrompt(problemText, language);
        
        try {
            const response = await axios.post(model.url, {
                model: model.name.toLowerCase().replace(/\s+/g, ''),
                prompt: prompt,
                stream: false,
                options: {
                    temperature: 0.3,
                    top_p: 0.9,
                    max_tokens: 2000
                }
            });

            const solution = this.parseSolution(response.data.response, language);
            
            return {
                model: model.name,
                solution: solution,
                rawResponse: response.data.response,
                timestamp: new Date()
            };
        } catch (error) {
            console.error(`❌ Error with ${model.name}:`, error.message);
            return {
                model: model.name,
                error: error.message,
                timestamp: new Date()
            };
        }
    }

    /**
     * Build comprehensive prompt for DSA problem
     */
    buildPrompt(problemText, language) {
        return `You are an expert DSA problem solver. Solve the following problem in ${language}:

PROBLEM:
${problemText}

REQUIREMENTS:
1. Provide a complete, working solution in ${language}
2. Include time and space complexity analysis
3. Explain your approach and algorithm
4. Provide test cases to validate your solution
5. Ensure the code is production-ready and well-commented

FORMAT YOUR RESPONSE AS:
SOLUTION:
[Your complete code solution]

TIME_COMPLEXITY:
[Analysis]

SPACE_COMPLEXITY:
[Analysis]

APPROACH:
[Explanation of your algorithm]

TEST_CASES:
[Sample test cases with inputs and expected outputs]

EXPLANATION:
[Detailed explanation of your solution]`;
    }

    /**
     * Parse solution from AI response
     */
    parseSolution(response, language) {
        try {
            const solution = {
                code: '',
                timeComplexity: '',
                spaceComplexity: '',
                approach: '',
                testCases: [],
                explanation: ''
            };

            // Extract code block
            const codeMatch = response.match(/SOLUTION:\s*```[\w]*\n([\s\S]*?)\n```/);
            if (codeMatch) {
                solution.code = codeMatch[1].trim();
            }

            // Extract time complexity
            const timeMatch = response.match(/TIME_COMPLEXITY:\s*(.*?)(?=\n[A-Z_]+:|$)/s);
            if (timeMatch) {
                solution.timeComplexity = timeMatch[1].trim();
            }

            // Extract space complexity
            const spaceMatch = response.match(/SPACE_COMPLEXITY:\s*(.*?)(?=\n[A-Z_]+:|$)/s);
            if (spaceMatch) {
                solution.spaceComplexity = spaceMatch[1].trim();
            }

            // Extract approach
            const approachMatch = response.match(/APPROACH:\s*(.*?)(?=\n[A-Z_]+:|$)/s);
            if (approachMatch) {
                solution.approach = approachMatch[1].trim();
            }

            // Extract test cases
            const testMatch = response.match(/TEST_CASES:\s*(.*?)(?=\n[A-Z_]+:|$)/s);
            if (testMatch) {
                solution.testCases = this.parseTestCases(testMatch[1]);
            }

            // Extract explanation
            const explanationMatch = response.match(/EXPLANATION:\s*(.*?)(?=\n[A-Z_]+:|$)/s);
            if (explanationMatch) {
                solution.explanation = explanationMatch[1].trim();
            }

            return solution;
        } catch (error) {
            console.error('Error parsing solution:', error);
            return {
                code: response,
                timeComplexity: 'Unable to parse',
                spaceComplexity: 'Unable to parse',
                approach: 'Unable to parse',
                testCases: [],
                explanation: 'Unable to parse'
            };
        }
    }

    /**
     * Parse test cases from response
     */
    parseTestCases(testCasesText) {
        try {
            const testCases = [];
            const lines = testCasesText.split('\n');
            let currentTestCase = null;

            for (const line of lines) {
                if (line.includes('Input:') || line.includes('input:')) {
                    if (currentTestCase) {
                        testCases.push(currentTestCase);
                    }
                    currentTestCase = {
                        input: line.split(':')[1]?.trim() || '',
                        expectedOutput: ''
                    };
                } else if (line.includes('Output:') || line.includes('output:')) {
                    if (currentTestCase) {
                        currentTestCase.expectedOutput = line.split(':')[1]?.trim() || '';
                    }
                }
            }

            if (currentTestCase) {
                testCases.push(currentTestCase);
            }

            return testCases;
        } catch (error) {
            console.error('Error parsing test cases:', error);
            return [];
        }
    }

    /**
     * Evaluate solutions and determine quality
     */
    async evaluateSolutions(primaryResult, secondaryResult, testCases, language) {
        console.log('🔍 Evaluating solutions...');

        const results = [primaryResult, secondaryResult].filter(r => !r.error);
        
        if (results.length === 0) {
            return {
                bestSolution: null,
                quality: 0,
                evaluation: 'No valid solutions generated'
            };
        }

        let bestSolution = null;
        let bestQuality = 0;

        for (const result of results) {
            const quality = await this.assessSolutionQuality(result.solution, testCases, language);
            
            if (quality > bestQuality) {
                bestQuality = quality;
                bestSolution = result.solution;
            }
        }

        return {
            bestSolution: bestSolution,
            quality: bestQuality,
            evaluation: `Best quality: ${bestQuality.toFixed(2)}`
        };
    }

    /**
     * Assess solution quality
     */
    async assessSolutionQuality(solution, testCases, language) {
        let quality = 0;

        // Check if code exists
        if (solution.code && solution.code.length > 10) {
            quality += 0.3;
        }

        // Check if complexity analysis exists
        if (solution.timeComplexity && solution.spaceComplexity) {
            quality += 0.2;
        }

        // Check if approach is explained
        if (solution.approach && solution.approach.length > 20) {
            quality += 0.2;
        }

        // Check if test cases exist
        if (solution.testCases && solution.testCases.length > 0) {
            quality += 0.2;
        }

        // Check if explanation exists
        if (solution.explanation && solution.explanation.length > 50) {
            quality += 0.1;
        }

        return Math.min(quality, 1.0);
    }

    /**
     * Retry process with fallback models
     */
    async retryProcess(problemText, testCases, language, previousEvaluation) {
        console.log('🔄 Starting retry process...');
        
        this.failureContext.push({
            attempt: this.attempts.size + 1,
            evaluation: previousEvaluation,
            timestamp: new Date()
        });

        for (let i = 0; i < this.retryModels.length; i++) {
            const model = this.retryModels[i];
            console.log(`🔄 Attempt ${i + 1}: Trying ${model.name}`);
            
            try {
                const result = await this.analyzeWithModel(model, problemText, language);
                
                if (!result.error) {
                    const quality = await this.assessSolutionQuality(result.solution, testCases, language);
                    
                    if (quality >= 0.7) {
                        console.log(`✅ Acceptable solution found with ${model.name}`);
                        return {
                            success: true,
                            solution: result.solution,
                            quality: quality,
                            method: `retry_${i + 1}`,
                            model: model.name
                        };
                    }
                }
                
                this.attempts.set(model.name, (this.attempts.get(model.name) || 0) + 1);
                
            } catch (error) {
                console.error(`❌ Error with retry model ${model.name}:`, error.message);
            }
        }

        // All retries failed
        console.log('❌ All retry attempts failed');
        return {
            success: false,
            error: 'All retry attempts failed',
            method: 'retry_exhausted',
            failureContext: this.failureContext
        };
    }

    /**
     * Get system status
     */
    async getSystemStatus() {
        const status = {
            primaryModel: await this.checkModelHealth(this.primaryModel),
            secondaryModel: await this.checkModelHealth(this.secondaryModel),
            retryModels: await Promise.all(
                this.retryModels.map(model => this.checkModelHealth(model))
            ),
            attempts: Object.fromEntries(this.attempts),
            failureContext: this.failureContext.length
        };

        return status;
    }

    /**
     * Check model health
     */
    async checkModelHealth(model) {
        try {
            const response = await axios.get(`http://localhost:${model.port}/api/tags`, {
                timeout: 5000
            });
            return {
                name: model.name,
                status: 'healthy',
                port: model.port
            };
        } catch (error) {
            return {
                name: model.name,
                status: 'unhealthy',
                port: model.port,
                error: error.message
            };
        }
    }
}

module.exports = { SecureDSAProService }; 