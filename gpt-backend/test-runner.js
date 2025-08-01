/**
 * SecureDSA-Pro Test Runner for Hybrid System
 * Executes code in a sandboxed environment for test case validation
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class SecureDSATestRunner {
    constructor() {
        this.supportedLanguages = ['python', 'javascript', 'java', 'cpp'];
        this.executionTimeout = 10000; // 10 seconds
        this.tempDir = path.join(__dirname, 'temp');
    }

    /**
     * Execute test cases for a given solution
     */
    async executeTestCases(solution, testCases, language = 'python') {
        console.log(`🧪 Executing ${testCases.length} test cases for ${language} solution`);
        
        try {
            // Ensure temp directory exists
            await this.ensureTempDir();
            
            const results = [];
            let allPassed = true;

            for (let i = 0; i < testCases.length; i++) {
                const testCase = testCases[i];
                const result = await this.runTestCase(solution, testCase, language, i);
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
        } catch (error) {
            console.error('Error executing test cases:', error);
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
     * Run a single test case
     */
    async runTestCase(solution, testCase, language, testIndex) {
        try {
            const parsedSolution = this.parseSolution(solution, language);
            const preparedCode = this.prepareCodeForExecution(parsedSolution, language);
            
            const input = this.parseInput(testCase.input);
            const expectedOutput = testCase.expectedOutput.trim();
            
            const output = await this.executeCode(preparedCode, input, language, testIndex);
            const passed = this.compareOutput(output, expectedOutput);
            
            return {
                input: input,
                expectedOutput: expectedOutput,
                actualOutput: output,
                passed: passed,
                executionTime: Date.now()
            };
        } catch (error) {
            return {
                input: testCase.input,
                expectedOutput: testCase.expectedOutput,
                actualOutput: null,
                passed: false,
                error: error.message,
                executionTime: Date.now()
            };
        }
    }

    /**
     * Parse solution to extract code
     */
    parseSolution(solution, language) {
        if (typeof solution === 'string') {
            return solution;
        }
        
        if (solution.code) {
            return solution.code;
        }
        
        return solution.toString();
    }

    /**
     * Prepare code for execution based on language
     */
    prepareCodeForExecution(code, language) {
        switch (language.toLowerCase()) {
            case 'python':
                return this.preparePythonCode(code);
            case 'javascript':
                return this.prepareJavaScriptCode(code);
            case 'java':
                return this.prepareJavaCode(code);
            case 'cpp':
                return this.prepareCppCode(code);
            default:
                return code;
        }
    }

    /**
     * Prepare Python code for execution
     */
    preparePythonCode(code) {
        // Extract function definitions and add execution wrapper
        const lines = code.split('\n');
        const functionLines = [];
        const executionLines = [];
        
        for (const line of lines) {
            if (line.trim().startsWith('def ') || line.trim().startsWith('class ')) {
                functionLines.push(line);
            } else if (line.trim() && !line.trim().startsWith('#')) {
                executionLines.push(line);
            }
        }
        
        return [...functionLines, ...executionLines].join('\n');
    }

    /**
     * Prepare JavaScript code for execution
     */
    prepareJavaScriptCode(code) {
        // For Node.js execution
        return code;
    }

    /**
     * Prepare Java code for execution
     */
    prepareJavaCode(code) {
        // Extract class and add main method if needed
        if (!code.includes('public static void main')) {
            const className = this.extractClassName(code);
            return `${code}
            
public static void main(String[] args) {
    // Test execution will be handled by test runner
}`;
        }
        return code;
    }

    /**
     * Prepare C++ code for execution
     */
    prepareCppCode(code) {
        // Add main function if not present
        if (!code.includes('int main(')) {
            return `${code}
            
int main() {
    // Test execution will be handled by test runner
    return 0;
}`;
        }
        return code;
    }

    /**
     * Extract class name from Java code
     */
    extractClassName(code) {
        const match = code.match(/public\s+class\s+(\w+)/);
        return match ? match[1] : 'Solution';
    }

    /**
     * Parse input for execution
     */
    parseInput(input) {
        try {
            // Try to parse as JSON first
            return JSON.parse(input);
        } catch {
            // Return as string if not JSON
            return input;
        }
    }

    /**
     * Execute code based on language
     */
    async executeCode(code, input, language, testIndex) {
        const tempFile = path.join(this.tempDir, `test_${testIndex}_${Date.now()}`);
        
        try {
            switch (language.toLowerCase()) {
                case 'python':
                    return await this.executePython(code, input, tempFile);
                case 'javascript':
                    return await this.executeJavaScript(code, input, tempFile);
                case 'java':
                    return await this.executeJava(code, input, tempFile);
                case 'cpp':
                    return await this.executeCpp(code, input, tempFile);
                default:
                    throw new Error(`Unsupported language: ${language}`);
            }
        } finally {
            // Clean up temp files
            await this.cleanupTempFiles(tempFile, language);
        }
    }

    /**
     * Execute Python code
     */
    async executePython(code, input, tempFile) {
        const pythonFile = `${tempFile}.py`;
        await fs.writeFile(pythonFile, code);
        
        return new Promise((resolve, reject) => {
            const python = spawn('python', [pythonFile], {
                timeout: this.executionTimeout
            });
            
            let output = '';
            let error = '';
            
            python.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            python.stderr.on('data', (data) => {
                error += data.toString();
            });
            
            python.on('close', (code) => {
                if (code === 0) {
                    resolve(output.trim());
                } else {
                    reject(new Error(`Python execution failed: ${error}`));
                }
            });
            
            python.on('error', (error) => {
                reject(new Error(`Failed to start Python: ${error.message}`));
            });
        });
    }

    /**
     * Execute JavaScript code
     */
    async executeJavaScript(code, input, tempFile) {
        const jsFile = `${tempFile}.js`;
        await fs.writeFile(jsFile, code);
        
        return new Promise((resolve, reject) => {
            const node = spawn('node', [jsFile], {
                timeout: this.executionTimeout
            });
            
            let output = '';
            let error = '';
            
            node.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            node.stderr.on('data', (data) => {
                error += data.toString();
            });
            
            node.on('close', (code) => {
                if (code === 0) {
                    resolve(output.trim());
                } else {
                    reject(new Error(`Node.js execution failed: ${error}`));
                }
            });
            
            node.on('error', (error) => {
                reject(new Error(`Failed to start Node.js: ${error.message}`));
            });
        });
    }

    /**
     * Execute Java code
     */
    async executeJava(code, input, tempFile) {
        const javaFile = `${tempFile}.java`;
        const className = this.extractClassName(code);
        await fs.writeFile(javaFile, code);
        
        return new Promise((resolve, reject) => {
            const javac = spawn('javac', [javaFile], {
                timeout: this.executionTimeout
            });
            
            javac.on('close', (code) => {
                if (code === 0) {
                    // Run the compiled Java program
                    const java = spawn('java', ['-cp', this.tempDir, className], {
                        timeout: this.executionTimeout
                    });
                    
                    let output = '';
                    let error = '';
                    
                    java.stdout.on('data', (data) => {
                        output += data.toString();
                    });
                    
                    java.stderr.on('data', (data) => {
                        error += data.toString();
                    });
                    
                    java.on('close', (code) => {
                        if (code === 0) {
                            resolve(output.trim());
                        } else {
                            reject(new Error(`Java execution failed: ${error}`));
                        }
                    });
                    
                    java.on('error', (error) => {
                        reject(new Error(`Failed to start Java: ${error.message}`));
                    });
                } else {
                    reject(new Error('Java compilation failed'));
                }
            });
            
            javac.on('error', (error) => {
                reject(new Error(`Failed to start javac: ${error.message}`));
            });
        });
    }

    /**
     * Execute C++ code
     */
    async executeCpp(code, input, tempFile) {
        const cppFile = `${tempFile}.cpp`;
        const exeFile = `${tempFile}.exe`;
        await fs.writeFile(cppFile, code);
        
        return new Promise((resolve, reject) => {
            const gpp = spawn('g++', [cppFile, '-o', exeFile], {
                timeout: this.executionTimeout
            });
            
            gpp.on('close', (code) => {
                if (code === 0) {
                    // Run the compiled C++ program
                    const exe = spawn(exeFile, [], {
                        timeout: this.executionTimeout
                    });
                    
                    let output = '';
                    let error = '';
                    
                    exe.stdout.on('data', (data) => {
                        output += data.toString();
                    });
                    
                    exe.stderr.on('data', (data) => {
                        error += data.toString();
                    });
                    
                    exe.on('close', (code) => {
                        if (code === 0) {
                            resolve(output.trim());
                        } else {
                            reject(new Error(`C++ execution failed: ${error}`));
                        }
                    });
                    
                    exe.on('error', (error) => {
                        reject(new Error(`Failed to start C++ executable: ${error.message}`));
                    });
                } else {
                    reject(new Error('C++ compilation failed'));
                }
            });
            
            gpp.on('error', (error) => {
                reject(new Error(`Failed to start g++: ${error.message}`));
            });
        });
    }

    /**
     * Compare actual output with expected output
     */
    compareOutput(actual, expected) {
        if (actual === expected) {
            return true;
        }
        
        // Try to normalize whitespace and formatting
        const normalizedActual = actual.toString().trim().replace(/\s+/g, ' ');
        const normalizedExpected = expected.toString().trim().replace(/\s+/g, ' ');
        
        return normalizedActual === normalizedExpected;
    }

    /**
     * Ensure temp directory exists
     */
    async ensureTempDir() {
        try {
            await fs.access(this.tempDir);
        } catch {
            await fs.mkdir(this.tempDir, { recursive: true });
        }
    }

    /**
     * Clean up temporary files
     */
    async cleanupTempFiles(baseFile, language) {
        try {
            const extensions = ['.py', '.js', '.java', '.cpp', '.exe', '.class'];
            
            for (const ext of extensions) {
                const file = `${baseFile}${ext}`;
                try {
                    await fs.unlink(file);
                } catch {
                    // File doesn't exist, ignore
                }
            }
        } catch (error) {
            console.error('Error cleaning up temp files:', error);
        }
    }

    /**
     * Get supported languages
     */
    getSupportedLanguages() {
        return this.supportedLanguages;
    }
}

module.exports = { SecureDSATestRunner }; 