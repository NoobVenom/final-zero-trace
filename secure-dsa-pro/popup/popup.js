// SecureDSA-Pro Popup JavaScript
// Zero-trace DSA solver with multi-model orchestration

class SecureDSAPopup {
  constructor() {
    this.editor = null;
    this.currentResult = null;
    this.isProcessing = false;
    
    this.initialize();
  }

  async initialize() {
    // Initialize Monaco Editor
    await this.initializeMonacoEditor();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Load user preferences
    await this.loadUserPreferences();
    
    // Load solution history
    await this.loadSolutionHistory();
    
    console.log('SecureDSA-Pro Popup initialized');
  }

  async initializeMonacoEditor() {
    // Load Monaco Editor
    require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });
    
    require(['vs/editor/editor.main'], () => {
      this.editor = monaco.editor.create(document.getElementById('code-editor'), {
        value: '// Your solution will appear here...',
        language: 'python',
        theme: 'vs-dark',
        fontSize: 12,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        readOnly: true
      });
    });
  }

  setupEventListeners() {
    // Solve button
    document.getElementById('solve-btn').addEventListener('click', () => {
      this.solveProblem();
    });

    // Clear button
    document.getElementById('clear-btn').addEventListener('click', () => {
      this.clearInput();
    });

    // Copy code button
    document.getElementById('copy-code-btn').addEventListener('click', () => {
      this.copyCode();
    });

    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    // Settings toggle
    document.getElementById('settings-toggle').addEventListener('click', () => {
      this.toggleSettings();
    });

    // Settings inputs
    document.getElementById('max-attempts-setting').addEventListener('change', (e) => {
      this.updateSetting('maxAttempts', parseInt(e.target.value));
    });

    document.getElementById('show-step-by-step').addEventListener('change', (e) => {
      this.updateSetting('showStepByStep', e.target.checked);
    });

    document.getElementById('auto-save').addEventListener('change', (e) => {
      this.updateSetting('autoSave', e.target.checked);
    });

    // Clear history button
    document.getElementById('clear-history-btn').addEventListener('click', () => {
      this.clearHistory();
    });

    // Toggle failure history
    document.getElementById('toggle-failure-history').addEventListener('click', () => {
      this.toggleFailureHistory();
    });

    // Language selector
    document.getElementById('language-select').addEventListener('change', (e) => {
      this.updateSetting('preferredLanguage', e.target.value);
      if (this.editor) {
        monaco.editor.setModelLanguage(this.editor.getModel(), e.target.value);
      }
    });
  }

  async solveProblem() {
    const problemText = document.getElementById('problem-input').value.trim();
    
    if (!problemText) {
      this.showNotification('Please enter a DSA problem', 'error');
      return;
    }

    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    this.showProgress();
    this.updateStatus('Processing...', 'processing');

    try {
      // Get user preferences
      const preferences = await this.loadUserPreferences();
      const language = preferences.preferredLanguage || 'python';
      
      // Extract test cases if provided
      const testCases = this.extractTestCases(problemText);
      
      // Send message to background service worker with new AI service
      const response = await chrome.runtime.sendMessage({
        type: 'solveProblem',
        problem: problemText,
        language: language,
        testCases: testCases
      });

      if (response.success) {
        this.handleSuccess(response.result);
      } else {
        this.handleError(response.error || 'Failed to solve problem');
      }
    } catch (error) {
      console.error('Error solving problem:', error);
      this.handleError('Failed to communicate with service worker');
    } finally {
      this.isProcessing = false;
      this.hideProgress();
      this.updateStatus('Ready', 'ready');
    }
  }

  extractTestCases(problemText) {
    // Extract test cases from problem text if they exist
    const testCaseRegex = /test\s*cases?[:\s]*([\s\S]*?)(?=\n\n|$)/i;
    const match = problemText.match(testCaseRegex);
    
    if (match) {
      try {
        // Try to parse as JSON first
        return JSON.parse(match[1]);
      } catch (e) {
        // If not JSON, try to parse as simple format
        const lines = match[1].split('\n').filter(line => line.trim());
        const testCases = [];
        
        for (let i = 0; i < lines.length; i += 2) {
          if (i + 1 < lines.length) {
            testCases.push({
              input: lines[i].trim(),
              expected_output: lines[i + 1].trim(),
              description: `Test case ${testCases.length + 1}`
            });
          }
        }
        
        return testCases;
      }
    }
    
    return [];
  }

  showProgress() {
    document.getElementById('progress-section').style.display = 'block';
    document.getElementById('results-section').style.display = 'none';
    
    // Animate progress
    this.animateProgress();
  }

  hideProgress() {
    document.getElementById('progress-section').style.display = 'none';
  }

  animateProgress() {
    const progressFill = document.getElementById('progress-fill');
    const steps = document.querySelectorAll('.step');
    let currentStep = 0;

    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        // Update step
        steps.forEach((step, index) => {
          step.classList.remove('active', 'completed');
          if (index < currentStep) {
            step.classList.add('completed');
          } else if (index === currentStep) {
            step.classList.add('active');
          }
        });

        // Update progress bar
        const progress = ((currentStep + 1) / steps.length) * 100;
        progressFill.style.width = `${progress}%`;

        // Update model name based on new flowchart sequence
                 const models = [
           'Claude 3.5 (Primary)',
           'Deepseek v3 (Secondary)',
           'GPT-4.1 (Retry 1)',
           'Grok4 (Retry 2)'
         ];
        document.getElementById('current-model-name').textContent = models[currentStep % models.length];

        currentStep++;
      } else {
        clearInterval(interval);
      }
    }, 1000);
  }

  handleSuccess(result) {
    this.currentResult = result;
    
    // Update result status
    const resultStatus = document.getElementById('result-status');
    resultStatus.textContent = result.message;
    resultStatus.className = 'result-status success';

    // Show results section
    document.getElementById('results-section').style.display = 'block';

    // Update code editor
    if (this.editor && result.solution) {
      this.editor.setValue(result.solution);
      this.editor.getModel().updateOptions({ readOnly: false });
    }

    // Update explanation
    this.updateExplanation(result);

    // Update test results
    this.updateTestResults(result.testResults);

    // Update complexity analysis
    this.updateComplexityAnalysis(result);

    // Show failure history if there were failures
    if (result.failureContext && result.failureContext.length > 0) {
      this.showFailureHistory(result.failureContext);
    }

    this.showNotification('Problem solved successfully!', 'success');
  }

  handleError(error) {
    console.error('Error:', error);
    
    // Update result status
    const resultStatus = document.getElementById('result-status');
    resultStatus.textContent = error;
    resultStatus.className = 'result-status error';

    // Show results section with error
    document.getElementById('results-section').style.display = 'block';

    this.showNotification(error, 'error');
  }

  updateExplanation(result) {
    const explanationText = document.getElementById('explanation-text');
    
    if (result.solution) {
      // Extract explanation from solution (assuming it's in markdown format)
      const explanation = this.extractExplanation(result.solution);
      explanationText.innerHTML = this.formatMarkdown(explanation);
    } else {
      explanationText.innerHTML = '<p>No explanation available.</p>';
    }
  }

  updateTestResults(testResults) {
    const testResultsContainer = document.getElementById('test-results');
    
    if (!testResults || !testResults.results) {
      testResultsContainer.innerHTML = '<p>No test results available.</p>';
      return;
    }

    let html = `
      <div class="test-summary">
        <strong>Test Results:</strong> ${testResults.passedCount}/${testResults.totalCount} passed
      </div>
    `;

    testResults.results.forEach((test, index) => {
      const status = test.passed ? 'passed' : 'failed';
      const statusText = test.passed ? 'PASS' : 'FAIL';
      
      html += `
        <div class="test-item ${status}">
          <div class="test-item-header">
            <span>Test Case ${index + 1}</span>
            <span class="test-status ${status}">${statusText}</span>
          </div>
          <div class="test-details">
            <div><strong>Input:</strong> ${test.input}</div>
            <div><strong>Expected:</strong> ${test.expected}</div>
            ${test.actual ? `<div><strong>Actual:</strong> ${test.actual}</div>` : ''}
            ${test.error ? `<div><strong>Error:</strong> ${test.error}</div>` : ''}
          </div>
        </div>
      `;
    });

    testResultsContainer.innerHTML = html;
  }

  updateComplexityAnalysis(result) {
    const complexityContainer = document.getElementById('complexity-analysis');
    
    if (result.solution) {
      const complexity = this.extractComplexity(result.solution);
      
      let html = '';
      if (complexity.time) {
        html += `
          <div class="complexity-item">
            <span class="complexity-label">Time Complexity:</span>
            <span class="complexity-value">${complexity.time}</span>
          </div>
        `;
      }
      if (complexity.space) {
        html += `
          <div class="complexity-item">
            <span class="complexity-label">Space Complexity:</span>
            <span class="complexity-value">${complexity.space}</span>
          </div>
        `;
      }
      
      complexityContainer.innerHTML = html || '<p>Complexity analysis not available.</p>';
    } else {
      complexityContainer.innerHTML = '<p>Complexity analysis not available.</p>';
    }
  }

  extractExplanation(solution) {
    // Simple extraction of explanation from solution
    // In a real implementation, you'd parse the solution more carefully
    const lines = solution.split('\n');
    const explanationLines = [];
    let inExplanation = false;
    
    for (const line of lines) {
      if (line.includes('Explanation:') || line.includes('Explanation')) {
        inExplanation = true;
        continue;
      }
      if (inExplanation && line.trim().startsWith('```')) {
        break;
      }
      if (inExplanation) {
        explanationLines.push(line);
      }
    }
    
    return explanationLines.join('\n') || 'No explanation available.';
  }

  extractComplexity(solution) {
    // Simple extraction of complexity from solution
    const timeMatch = solution.match(/Time Complexity[:\s]*([OΩΘ][(][^)]+[)])/i);
    const spaceMatch = solution.match(/Space Complexity[:\s]*([OΩΘ][(][^)]+[)])/i);
    
    return {
      time: timeMatch ? timeMatch[1] : null,
      space: spaceMatch ? spaceMatch[1] : null
    };
  }

  formatMarkdown(text) {
    // Simple markdown formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  showFailureHistory(failureContext) {
    const failureHistory = document.getElementById('failure-history');
    const failureList = document.getElementById('failure-list');
    
    let html = '';
    failureContext.forEach((failure, index) => {
      html += `
        <div class="failure-item">
          <div class="failure-item-header">
            <span class="failure-model">${failure.model}</span>
            <span class="failure-attempt">Attempt ${failure.attempt + 1}</span>
          </div>
          <div class="failure-details">
            <div><strong>Tests Passed:</strong> ${failure.testResults.passedCount}/${failure.testResults.totalCount}</div>
            ${failure.testResults.error ? `<div><strong>Error:</strong> ${failure.testResults.error}</div>` : ''}
          </div>
        </div>
      `;
    });
    
    failureList.innerHTML = html;
    failureHistory.style.display = 'block';
  }

  toggleFailureHistory() {
    const failureHistory = document.getElementById('failure-history');
    const toggleBtn = document.getElementById('toggle-failure-history');
    
    if (failureHistory.style.display === 'none') {
      failureHistory.style.display = 'block';
      toggleBtn.textContent = 'Hide';
    } else {
      failureHistory.style.display = 'none';
      toggleBtn.textContent = 'Show';
    }
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.remove('active');
    });
    document.getElementById(`${tabName}-content`).classList.add('active');
  }

  copyCode() {
    if (this.editor) {
      const code = this.editor.getValue();
      navigator.clipboard.writeText(code).then(() => {
        this.showNotification('Code copied to clipboard!', 'success');
      }).catch(() => {
        this.showNotification('Failed to copy code', 'error');
      });
    }
  }

  clearInput() {
    document.getElementById('problem-input').value = '';
    if (this.editor) {
      this.editor.setValue('// Your solution will appear here...');
      this.editor.getModel().updateOptions({ readOnly: true });
    }
    document.getElementById('results-section').style.display = 'none';
    document.getElementById('failure-history').style.display = 'none';
  }

  toggleSettings() {
    const settingsPanel = document.getElementById('settings-panel');
    const toggleBtn = document.getElementById('settings-toggle');
    
    if (settingsPanel.style.display === 'none') {
      settingsPanel.style.display = 'block';
      toggleBtn.textContent = '⚙️ Hide Settings';
    } else {
      settingsPanel.style.display = 'none';
      toggleBtn.textContent = '⚙️ Settings';
    }
  }

  async updateSetting(key, value) {
    try {
      await chrome.runtime.sendMessage({
        type: 'updatePreferences',
        preferences: { [key]: value }
      });
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  }

  async loadUserPreferences() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'getHistory' });
      if (response.success) {
        // Load preferences from storage
        const storage = await chrome.storage.session.get('userPreferences');
        const prefs = storage.userPreferences || {};
        
        // Update UI
        document.getElementById('max-attempts-setting').value = prefs.maxAttempts || 4;
        document.getElementById('show-step-by-step').checked = prefs.showStepByStep !== false;
        document.getElementById('auto-save').checked = prefs.autoSave !== false;
        document.getElementById('language-select').value = prefs.preferredLanguage || 'python';
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }

  async loadSolutionHistory() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'getHistory' });
      if (response.success) {
        this.displayHistory(response.history);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  }

  displayHistory(history) {
    const historyList = document.getElementById('history-list');
    
    if (!history || history.length === 0) {
      historyList.innerHTML = '<p>No previous solutions.</p>';
      return;
    }

    let html = '';
    history.slice(0, 10).forEach((item, index) => {
      const timestamp = new Date(item.timestamp).toLocaleString();
      html += `
        <div class="history-item" onclick="popup.loadHistoryItem(${index})">
          <div class="history-item-header">
            <span class="history-model">${item.model}</span>
            <span class="history-timestamp">${timestamp}</span>
          </div>
          <div class="history-summary">
            Tests: ${item.testResults.passedCount}/${item.testResults.totalCount} passed
          </div>
        </div>
      `;
    });

    historyList.innerHTML = html;
  }

  loadHistoryItem(index) {
    // Load a specific history item
    chrome.runtime.sendMessage({ type: 'getHistory' }).then(response => {
      if (response.success && response.history[index]) {
        const item = response.history[index];
        this.currentResult = item;
        
        // Update UI with history item
        if (this.editor) {
          this.editor.setValue(item.solution || '');
          this.editor.getModel().updateOptions({ readOnly: false });
        }
        
        this.updateTestResults(item.testResults);
        this.updateExplanation(item);
        this.updateComplexityAnalysis(item);
        
        // Show results section
        document.getElementById('results-section').style.display = 'block';
        this.switchTab('code');
      }
    });
  }

  async clearHistory() {
    try {
      await chrome.runtime.sendMessage({ type: 'clearHistory' });
      this.displayHistory([]);
      this.showNotification('History cleared!', 'success');
    } catch (error) {
      console.error('Error clearing history:', error);
      this.showNotification('Failed to clear history', 'error');
    }
  }

  updateStatus(text, type) {
    const statusText = document.getElementById('status-text');
    const statusDot = document.getElementById('status-dot');
    
    statusText.textContent = text;
    statusDot.className = `status-dot ${type}`;
  }

  showNotification(message, type) {
    // Simple notification system
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 15px;
      border-radius: 6px;
      color: white;
      font-weight: 600;
      z-index: 1000;
      ${type === 'success' ? 'background: #00ff88; color: #1a1a2e;' : 'background: #ff4444;'}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// Initialize the popup
const popup = new SecureDSAPopup(); 