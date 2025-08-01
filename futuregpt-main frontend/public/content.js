/**
 * SecureDSA-Pro Chrome Extension Content Script
 * Extracts DSA problems from web pages and provides context
 */

class SecureDSAProContentScript {
    constructor() {
        this.init();
    }

    init() {
        this.setupContextMenu();
        this.setupKeyboardShortcuts();
        this.observePageChanges();
        this.injectHelperUI();
    }

    /**
     * Setup context menu for DSA problem extraction
     */
    setupContextMenu() {
        // Create context menu for selected text
        document.addEventListener('contextmenu', (event) => {
            const selectedText = window.getSelection()?.toString().trim();
            
            if (selectedText && this.isDSARelated(selectedText)) {
                this.showContextMenu(event, selectedText);
            }
        });
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Ctrl+Shift+S to solve selected text as DSA problem
            if (event.ctrlKey && event.shiftKey && event.key === 'S') {
                event.preventDefault();
                const selectedText = window.getSelection()?.toString().trim();
                if (selectedText) {
                    this.solveSelectedText(selectedText);
                }
            }
        });
    }

    /**
     * Observe page changes for dynamic content
     */
    observePageChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    this.scanForDSAProblems();
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Inject helper UI elements
     */
    injectHelperUI() {
        // Create floating solve button
        const solveButton = document.createElement('div');
        solveButton.id = 'secure-dsa-solve-btn';
        solveButton.innerHTML = '🔐 Solve DSA';
        solveButton.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            padding: 10px 15px;
            border-radius: 25px;
            cursor: pointer;
            z-index: 10000;
            font-family: 'Segoe UI', sans-serif;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
            display: none;
        `;

        solveButton.addEventListener('mouseenter', () => {
            solveButton.style.transform = 'scale(1.05)';
        });

        solveButton.addEventListener('mouseleave', () => {
            solveButton.style.transform = 'scale(1)';
        });

        solveButton.addEventListener('click', () => {
            const selectedText = window.getSelection()?.toString().trim();
            if (selectedText) {
                this.solveSelectedText(selectedText);
            }
        });

        document.body.appendChild(solveButton);

        // Show button when text is selected
        document.addEventListener('selectionchange', () => {
            const selectedText = window.getSelection()?.toString().trim();
            if (selectedText && this.isDSARelated(selectedText)) {
                solveButton.style.display = 'block';
            } else {
                solveButton.style.display = 'none';
            }
        });
    }

    /**
     * Check if text is DSA-related
     */
    isDSARelated(text) {
        const dsaKeywords = [
            'array', 'string', 'linked list', 'tree', 'graph', 'stack', 'queue',
            'sort', 'search', 'binary', 'recursion', 'dynamic programming',
            'algorithm', 'complexity', 'time', 'space', 'optimization',
            'leetcode', 'hackerrank', 'codeforces', 'problem', 'solution',
            'function', 'class', 'method', 'return', 'input', 'output',
            'constraint', 'test case', 'edge case', 'corner case'
        ];

        const lowerText = text.toLowerCase();
        return dsaKeywords.some(keyword => lowerText.includes(keyword));
    }

    /**
     * Show context menu for DSA problems
     */
    showContextMenu(event, selectedText) {
        event.preventDefault();

        // Remove existing context menu
        const existingMenu = document.getElementById('secure-dsa-context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        // Create context menu
        const menu = document.createElement('div');
        menu.id = 'secure-dsa-context-menu';
        menu.style.cssText = `
            position: fixed;
            top: ${event.pageY}px;
            left: ${event.pageX}px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 10001;
            font-family: 'Segoe UI', sans-serif;
            font-size: 14px;
            min-width: 200px;
        `;

        menu.innerHTML = `
            <div style="padding: 10px; border-bottom: 1px solid #eee; font-weight: 600; color: #333;">
                🔐 SecureDSA-Pro
            </div>
            <div style="padding: 8px 10px; cursor: pointer; hover: background: #f5f5f5;" onclick="this.solveDSAProblem('${this.escapeHtml(selectedText)}', 'python')">
                🐍 Solve with Python
            </div>
            <div style="padding: 8px 10px; cursor: pointer; hover: background: #f5f5f5;" onclick="this.solveDSAProblem('${this.escapeHtml(selectedText)}', 'javascript')">
                💻 Solve with JavaScript
            </div>
            <div style="padding: 8px 10px; cursor: pointer; hover: background: #f5f5f5;" onclick="this.solveDSAProblem('${this.escapeHtml(selectedText)}', 'java')">
                ☕ Solve with Java
            </div>
            <div style="padding: 8px 10px; cursor: pointer; hover: background: #f5f5f5;" onclick="this.solveDSAProblem('${this.escapeHtml(selectedText)}', 'cpp')">
                ⚡ Solve with C++
            </div>
        `;

        document.body.appendChild(menu);

        // Remove menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function removeMenu() {
                menu.remove();
                document.removeEventListener('click', removeMenu);
            });
        }, 100);
    }

    /**
     * Solve selected text as DSA problem
     */
    solveSelectedText(text, language = 'python') {
        // Send message to background script
        chrome.runtime.sendMessage({
            action: 'solveDSAProblem',
            data: {
                problemText: text,
                language: language,
                testCases: []
            }
        }, (response) => {
            if (response && response.success) {
                this.showSolutionModal(response);
            } else {
                this.showErrorModal(response?.error || 'Failed to solve problem');
            }
        });
    }

    /**
     * Show solution modal
     */
    showSolutionModal(result) {
        const modal = this.createModal('Solution Found!', `
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="color: #00b894; margin: 0;">✅ Problem Solved!</h3>
                <p style="color: #666; margin: 10px 0;">Using ${result.method || 'AI Model'}</p>
            </div>
            
            ${result.solution ? `
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <h4 style="margin: 0 0 10px 0;">Code Solution:</h4>
                    <pre style="background: #2d3748; color: #e2e8f0; padding: 10px; border-radius: 4px; overflow-x: auto; font-size: 12px; margin: 0;">${this.escapeHtml(result.solution.code)}</pre>
                </div>
                
                ${result.solution.timeComplexity ? `
                    <p><strong>Time Complexity:</strong> ${result.solution.timeComplexity}</p>
                ` : ''}
                
                ${result.solution.spaceComplexity ? `
                    <p><strong>Space Complexity:</strong> ${result.solution.spaceComplexity}</p>
                ` : ''}
                
                ${result.solution.approach ? `
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <h4 style="margin: 0 0 10px 0;">Approach:</h4>
                        <p style="margin: 0;">${result.solution.approach}</p>
                    </div>
                ` : ''}
            ` : ''}
        `);
        
        document.body.appendChild(modal);
    }

    /**
     * Show error modal
     */
    showErrorModal(error) {
        const modal = this.createModal('Error', `
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="color: #ff6b6b; margin: 0;">❌ Error</h3>
                <p style="color: #666; margin: 10px 0;">${error}</p>
            </div>
        `);
        
        document.body.appendChild(modal);
    }

    /**
     * Create modal
     */
    createModal(title, content) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10002;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 30px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            font-family: 'Segoe UI', sans-serif;
        `;

        modalContent.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0; color: #333;">${title}</h2>
                <button onclick="this.closest('.modal').remove()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">×</button>
            </div>
            ${content}
        `;

        modal.appendChild(modalContent);
        modal.classList.add('modal');

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        return modal;
    }

    /**
     * Scan page for DSA problems
     */
    scanForDSAProblems() {
        const codeBlocks = document.querySelectorAll('pre, code');
        codeBlocks.forEach(block => {
            if (this.isDSARelated(block.textContent)) {
                this.highlightDSABlock(block);
            }
        });
    }

    /**
     * Highlight DSA-related code blocks
     */
    highlightDSABlock(block) {
        if (!block.classList.contains('secure-dsa-highlighted')) {
            block.classList.add('secure-dsa-highlighted');
            block.style.border = '2px solid #667eea';
            block.style.borderRadius = '4px';
            block.style.padding = '10px';
            block.style.margin = '5px 0';
            block.style.backgroundColor = '#f8f9fa';
        }
    }

    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize content script
new SecureDSAProContentScript();

// Make solveDSAProblem function globally available for context menu
window.solveDSAProblem = function(problemText, language) {
    chrome.runtime.sendMessage({
        action: 'solveDSAProblem',
        data: {
            problemText: problemText,
            language: language,
            testCases: []
        }
    }, (response) => {
        if (response && response.success) {
            // Show solution in a new tab or notification
            console.log('Solution found:', response);
        } else {
            console.error('Failed to solve:', response?.error);
        }
    });
}; 