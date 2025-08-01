/**
 * SecureDSA-Pro Test Runner
 * Executes code in a sandboxed environment for test case validation
 */

class SecureDSATestRunner {
    constructor() {
        this.supportedLanguages = ['python', 'javascript', 'java', 'cpp'];
        this.executionTimeout = 10000; // 10 seconds
    }

    /**
     * Execute test cases for a given solution
     */
    async executeTestCases(solution, testCases, language = 'python') {
        console.log(`🧪 Executing ${testCases.length} test cases for ${language} solution`);
        
        const results = [];
        let allPassed = true;
        
        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            const result = await this.runTestCase(solution, testCase, language);
            
            results.push({
                testCase: testCase,
                result: result,
                passed: result.passed
            });
            
            if (!result.passed) {
                allPassed = false;
            }
        }
        
        return {
            allPassed,
            results,
            totalTests: testCases.length,
            passedTests: results.filter(r => r.passed).length
        };
    }

    /**
     * Run individual test case
     */
    async runTestCase(code, testCase, language) {
        const startTime = Date.now();
        
        try {
            const parsedCode = this.parseSolution(code);
            const executableCode = this.prepareCodeForExecution(parsedCode, testCase, language);
            
            const result = await this.executeCode(executableCode, language);
            
            const executionTime = Date.now() - startTime;
            
            return {
                input: testCase.input,
                expected: testCase.expected_output,
                actual: result.output,
                passed: this.compareOutput(result.output, testCase.expected_output),
                executionTime: executionTime,
                error: result.error || null
            };
            
        } catch (error) {
            return {
                input: testCase.input,
                expected: testCase.expected_output,
                actual: null,
                passed: false,
                error: error.message,
                executionTime: Date.now() - startTime
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
     * Prepare code for execution with test case
     */
    prepareCodeForExecution(code, testCase, language) {
        switch (language.toLowerCase()) {
            case 'python':
                return this.preparePythonCode(code, testCase);
            case 'javascript':
                return this.prepareJavaScriptCode(code, testCase);
            case 'java':
                return this.prepareJavaCode(code, testCase);
            case 'cpp':
                return this.prepareCppCode(code, testCase);
            default:
                return this.preparePythonCode(code, testCase);
        }
    }

    /**
     * Prepare Python code for execution
     */
    preparePythonCode(code, testCase) {
        // Extract function name from code
        const functionMatch = code.match(/def\s+(\w+)\s*\(/);
        const functionName = functionMatch ? functionMatch[1] : 'solve';
        
        // Parse input based on type
        const input = this.parseInput(testCase.input);
        
        return `
import json
import sys
from io import StringIO

# Capture stdout
old_stdout = sys.stdout
sys.stdout = StringIO()

try:
    ${code}
    
    # Call the function with input
    result = ${functionName}(${input})
    
    # Print result in JSON format
    print(json.dumps({"output": result, "success": True}))
    
except Exception as e:
    print(json.dumps({"output": None, "error": str(e), "success": False}))

finally:
    # Restore stdout
    output = sys.stdout.getvalue()
    sys.stdout = old_stdout
    print(output)
`;
    }

    /**
     * Prepare JavaScript code for execution
     */
    prepareJavaScriptCode(code, testCase) {
        const input = this.parseInput(testCase.input);
        
        return `
// Capture console.log
const originalLog = console.log;
const outputs = [];
console.log = (...args) => outputs.push(args.join(' '));

try {
    ${code}
    
    // Call the function with input
    const result = solve(${input});
    
    // Output result
    console.log = originalLog;
    console.log(JSON.stringify({
        output: result,
        success: true,
        logs: outputs
    }));
    
} catch (error) {
    console.log = originalLog;
    console.log(JSON.stringify({
        output: null,
        error: error.message,
        success: false,
        logs: outputs
    }));
}
`;
    }

    /**
     * Prepare Java code for execution
     */
    prepareJavaCode(code, testCase) {
        const input = this.parseInput(testCase.input);
        
        return `
import java.util.*;
import java.io.*;

public class Solution {
    ${code}
    
    public static void main(String[] args) {
        try {
            // Call the function with input
            Object result = solve(${input});
            System.out.println("{\"output\": " + result + ", \"success\": true}");
        } catch (Exception e) {
            System.out.println("{\"output\": null, \"error\": \"" + e.getMessage() + "\", \"success\": false}");
        }
    }
}
`;
    }

    /**
     * Prepare C++ code for execution
     */
    prepareCppCode(code, testCase) {
        const input = this.parseInput(testCase.input);
        
        return `
#include <iostream>
#include <string>
#include <vector>
using namespace std;

${code}

int main() {
    try {
        // Call the function with input
        auto result = solve(${input});
        cout << "{\"output\": " << result << ", \"success\": true}" << endl;
    } catch (exception& e) {
        cout << "{\"output\": null, \"error\": \"" << e.what() << "\", \"success\": false}" << endl;
    }
    return 0;
}
`;
    }

    /**
     * Parse input string to appropriate format
     */
    parseInput(inputStr) {
        try {
            // Try to parse as JSON first
            const parsed = JSON.parse(inputStr);
            return JSON.stringify(parsed);
        } catch (e) {
            // If not JSON, treat as string
            return `"${inputStr.replace(/"/g, '\\"')}"`;
        }
    }

    /**
     * Execute code in sandboxed environment
     */
    async executeCode(code, language) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Execution timeout'));
            }, this.executionTimeout);

            try {
                switch (language.toLowerCase()) {
                    case 'python':
                        this.executePythonCode(code, resolve, reject, timeout);
                        break;
                    case 'javascript':
                        this.executeJavaScriptCode(code, resolve, reject, timeout);
                        break;
                    case 'java':
                        this.executeJavaCode(code, resolve, reject, timeout);
                        break;
                    case 'cpp':
                        this.executeCppCode(code, resolve, reject, timeout);
                        break;
                    default:
                        this.executePythonCode(code, resolve, reject, timeout);
                }
            } catch (error) {
                clearTimeout(timeout);
                reject(error);
            }
        });
    }

    /**
     * Execute Python code using Pyodide or similar
     */
    async executePythonCode(code, resolve, reject, timeout) {
        try {
            // For now, simulate execution
            // In production, you'd use Pyodide or a proper Python runtime
            const result = this.simulateExecution(code, 'python');
            clearTimeout(timeout);
            resolve(result);
        } catch (error) {
            clearTimeout(timeout);
            reject(error);
        }
    }

    /**
     * Execute JavaScript code
     */
    async executeJavaScriptCode(code, resolve, reject, timeout) {
        try {
            // Execute in current context
            const result = this.simulateExecution(code, 'javascript');
            clearTimeout(timeout);
            resolve(result);
        } catch (error) {
            clearTimeout(timeout);
            reject(error);
        }
    }

    /**
     * Execute Java code
     */
    async executeJavaCode(code, resolve, reject, timeout) {
        try {
            const result = this.simulateExecution(code, 'java');
            clearTimeout(timeout);
            resolve(result);
        } catch (error) {
            clearTimeout(timeout);
            reject(error);
        }
    }

    /**
     * Execute C++ code
     */
    async executeCppCode(code, resolve, reject, timeout) {
        try {
            const result = this.simulateExecution(code, 'cpp');
            clearTimeout(timeout);
            resolve(result);
        } catch (error) {
            clearTimeout(timeout);
            reject(error);
        }
    }

    /**
     * Simulate code execution (for demo purposes)
     * In production, replace with actual execution
     */
    simulateExecution(code, language) {
        // Simulate different success rates based on language
        const successRates = {
            'python': 0.8,
            'javascript': 0.7,
            'java': 0.6,
            'cpp': 0.5
        };
        
        const successRate = successRates[language] || 0.7;
        const isSuccess = Math.random() < successRate;
        
        if (isSuccess) {
            return {
                output: 'Simulated successful output',
                success: true,
                error: null
            };
        } else {
            return {
                output: null,
                success: false,
                error: 'Simulated execution error'
            };
        }
    }

    /**
     * Compare actual output with expected output
     */
    compareOutput(actual, expected) {
        if (actual === null || actual === undefined) {
            return false;
        }
        
        // Try exact match first
        if (actual === expected) {
            return true;
        }
        
        // Try parsing as JSON and comparing
        try {
            const actualParsed = JSON.parse(actual);
            const expectedParsed = JSON.parse(expected);
            return JSON.stringify(actualParsed) === JSON.stringify(expectedParsed);
        } catch (e) {
            // If not JSON, try string comparison
            return actual.toString().trim() === expected.toString().trim();
        }
    }

    /**
     * Get supported languages
     */
    getSupportedLanguages() {
        return this.supportedLanguages;
    }

    /**
     * Set execution timeout
     */
    setTimeout(timeout) {
        this.executionTimeout = timeout;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecureDSATestRunner;
} 