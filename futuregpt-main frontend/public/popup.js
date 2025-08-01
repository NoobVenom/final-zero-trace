/**
 * SecureDSA-Pro Chrome Extension Popup
 * Handles DSA problem solving with multi-model AI orchestration
 */

class SecureDSAProPopup {
    constructor() {
        this.backendUrl = 'http://localhost:3000';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSystemStatus();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTab(tab.dataset.tab);
            });
        });

        // Solve button
        document.getElementById('solveBtn').addEventListener('click', () => {
            this.solveProblem();
        });

        // Refresh status button
        document.getElementById('refreshStatusBtn').addEventListener('click', () => {
            this.loadSystemStatus();
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    async solveProblem() {
        const problemText = document.getElementById('problem').value.trim();
        const language = document.getElementById('language').value;
        const testCasesText = document.getElementById('testCases').value.trim();

        if (!problemText) {
            this.showError('Please enter a DSA problem');
            return;
        }

        // Parse test cases
        const testCases = this.parseTestCases(testCasesText);

        // Show progress
        this.showProgress();
        this.updateStatus('Initializing SecureDSA-Pro system...');

        try {
            // Send request to backend
            const response = await fetch(`${this.backendUrl}/api/secure-dsa/solve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    problemText,
                    testCases,
                    language
                })
            });

            const result = await response.json();

            if (result.success) {
                this.showSuccess(result);
            } else {
                this.showError(result.error || 'Failed to solve problem');
            }

        } catch (error) {
            console.error('Error solving problem:', error);
            this.showError('Failed to connect to backend server. Please ensure the server is running.');
        } finally {
            this.hideProgress();
        }
    }

    parseTestCases(testCasesText) {
        if (!testCasesText) return [];

        const testCases = [];
        const lines = testCasesText.split('\n');

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

            // Try to parse input and output from the line
            const inputMatch = trimmedLine.match(/Input:\s*(.+?)(?:\s+Output:\s*(.+))?$/i);
            if (inputMatch) {
                testCases.push({
                    input: inputMatch[1].trim(),
                    expectedOutput: inputMatch[2] ? inputMatch[2].trim() : ''
                });
            }
        }

        return testCases;
    }

    showProgress() {
        document.getElementById('progressContainer').style.display = 'block';
        document.getElementById('solveBtn').disabled = true;
        this.animateProgress();
    }

    hideProgress() {
        document.getElementById('progressContainer').style.display = 'none';
        document.getElementById('solveBtn').disabled = false;
    }

    updateStatus(message) {
        document.getElementById('status').textContent = message;
    }

    animateProgress() {
        let progress = 0;
        const progressFill = document.getElementById('progressFill');
        const status = document.getElementById('status');
        
        const messages = [
            'Analyzing problem with Claude 3.5...',
            'Analyzing problem with Deepseek v3...',
            'Evaluating solutions...',
            'Running test cases...',
            'Finalizing solution...'
        ];

        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;
            
            progressFill.style.width = `${progress}%`;
            
            const messageIndex = Math.floor((progress / 100) * messages.length);
            if (messageIndex < messages.length) {
                status.textContent = messages[messageIndex];
            }

            if (progress >= 100) {
                clearInterval(interval);
            }
        }, 500);
    }

    showSuccess(result) {
        const resultDiv = document.getElementById('result');
        const contentDiv = document.getElementById('solutionContent');
        
        let html = '<div class="success">✅ Problem solved successfully!</div>';
        
        if (result.solution) {
            html += `
                <h4>Code Solution:</h4>
                <pre><code>${this.escapeHtml(result.solution.code)}</code></pre>
            `;
            
            if (result.solution.timeComplexity) {
                html += `<p><strong>Time Complexity:</strong> ${result.solution.timeComplexity}</p>`;
            }
            
            if (result.solution.spaceComplexity) {
                html += `<p><strong>Space Complexity:</strong> ${result.solution.spaceComplexity}</p>`;
            }
            
            if (result.solution.approach) {
                html += `<h4>Approach:</h4><p>${result.solution.approach}</p>`;
            }
            
            if (result.solution.explanation) {
                html += `<h4>Explanation:</h4><p>${result.solution.explanation}</p>`;
            }
            
            if (result.solution.testCases && result.solution.testCases.length > 0) {
                html += `<h4>Test Cases:</h4>`;
                result.solution.testCases.forEach((testCase, index) => {
                    html += `<p><strong>Test ${index + 1}:</strong> Input: ${testCase.input} → Output: ${testCase.expectedOutput}</p>`;
                });
            }
        }
        
        if (result.method) {
            html += `<p><em>Solved using: ${result.method}</em></p>`;
        }
        
        contentDiv.innerHTML = html;
        resultDiv.style.display = 'block';
    }

    showError(message) {
        const resultDiv = document.getElementById('result');
        const contentDiv = document.getElementById('solutionContent');
        
        contentDiv.innerHTML = `<div class="error">❌ ${message}</div>`;
        resultDiv.style.display = 'block';
    }

    async loadSystemStatus() {
        const statusContent = document.getElementById('statusContent');
        statusContent.innerHTML = '<p>Loading system status...</p>';

        try {
            const response = await fetch(`${this.backendUrl}/api/secure-dsa/status`);
            const status = await response.json();

            let html = '<h3>System Status</h3>';
            
            // Primary model status
            html += `<p><strong>Claude 3.5 (Primary):</strong> <span style="color: ${status.primaryModel.status === 'healthy' ? '#00b894' : '#ff6b6b'}">${status.primaryModel.status}</span></p>`;
            
            // Secondary model status
            html += `<p><strong>Deepseek v3 (Secondary):</strong> <span style="color: ${status.secondaryModel.status === 'healthy' ? '#00b894' : '#ff6b6b'}">${status.secondaryModel.status}</span></p>`;
            
            // Retry models status
            status.retryModels.forEach((model, index) => {
                const modelName = index === 0 ? 'GPT-4.1 (Retry 1)' : 'Grok4 (Retry 2)';
                html += `<p><strong>${modelName}:</strong> <span style="color: ${model.status === 'healthy' ? '#00b894' : '#ff6b6b'}">${model.status}</span></p>`;
            });
            
            // Attempts
            if (Object.keys(status.attempts).length > 0) {
                html += '<h4>Recent Attempts:</h4>';
                Object.entries(status.attempts).forEach(([model, count]) => {
                    html += `<p>${model}: ${count} attempts</p>`;
                });
            }
            
            // Failure context
            if (status.failureContext > 0) {
                html += `<p><strong>Failure Context:</strong> ${status.failureContext} recorded</p>`;
            }

            statusContent.innerHTML = html;

        } catch (error) {
            console.error('Error loading system status:', error);
            statusContent.innerHTML = '<div class="error">❌ Failed to load system status. Please ensure the backend server is running.</div>';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the popup when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SecureDSAProPopup();
}); 