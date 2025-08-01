/**
 * SecureDSA-Pro Chrome Extension Background Service Worker
 * Handles communication between popup and content scripts
 */

// Store for tracking attempts and failures
const attempts = new Map();
const failureContext = [];

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background received message:', request);
    
    switch (request.action) {
        case 'solveDSAProblem':
            handleSolveDSAProblem(request.data)
                .then(sendResponse)
                .catch(error => {
                    console.error('Error in solveDSAProblem:', error);
                    sendResponse({ success: false, error: error.message });
                });
            return true; // Keep message channel open for async response
            
        case 'getSystemStatus':
            handleGetSystemStatus()
                .then(sendResponse)
                .catch(error => {
                    console.error('Error getting system status:', error);
                    sendResponse({ success: false, error: error.message });
                });
            return true;
            
        case 'extractContext':
            handleExtractContext()
                .then(sendResponse)
                .catch(error => {
                    console.error('Error extracting context:', error);
                    sendResponse({ success: false, error: error.message });
                });
            return true;
            
        default:
            sendResponse({ success: false, error: 'Unknown action' });
    }
});

/**
 * Handle DSA problem solving
 */
async function handleSolveDSAProblem(data) {
    const { problemText, testCases = [], language = 'python' } = data;
    
    try {
        // Extract context from current page if available
        const context = await extractPageContext();
        
        // Combine problem text with context
        const enhancedProblemText = context ? 
            `${problemText}\n\nContext from current page:\n${context}` : 
            problemText;
        
        // Send to backend
        const response = await fetch('http://localhost:3000/api/secure-dsa/solve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                problemText: enhancedProblemText,
                testCases,
                language
            })
        });
        
        const result = await response.json();
        
        // Track attempt
        if (result.success) {
            await storeSuccessfulSolution(result);
        } else {
            await storeFailureContext(result);
        }
        
        return result;
        
    } catch (error) {
        console.error('Error in handleSolveDSAProblem:', error);
        throw error;
    }
}

/**
 * Handle system status request
 */
async function handleGetSystemStatus() {
    try {
        const response = await fetch('http://localhost:3000/api/secure-dsa/status');
        const status = await response.json();
        
        // Add local tracking data
        status.attempts = Object.fromEntries(attempts);
        status.failureContext = failureContext.length;
        
        return status;
        
    } catch (error) {
        console.error('Error in handleGetSystemStatus:', error);
        throw error;
    }
}

/**
 * Handle context extraction
 */
async function handleExtractContext() {
    try {
        const context = await extractPageContext();
        return { success: true, context };
        
    } catch (error) {
        console.error('Error in handleExtractContext:', error);
        throw error;
    }
}

/**
 * Extract context from current active tab
 */
async function extractPageContext() {
    try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tabs[0]?.id) {
            return null;
        }
        
        const results = await chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: () => {
                return {
                    url: window.location.href,
                    title: document.title,
                    selectedText: window.getSelection()?.toString() || '',
                    pageContent: document.body.innerText.substring(0, 2000),
                    codeBlocks: Array.from(document.querySelectorAll('pre, code')).map(el => el.textContent).join('\n')
                };
            }
        });
        
        if (results[0]?.result) {
            const context = results[0].result;
            return `Page: ${context.title}\nURL: ${context.url}\nSelected Text: ${context.selectedText}\nRelevant Content: ${context.pageContent}\nCode: ${context.codeBlocks}`;
        }
        
        return null;
        
    } catch (error) {
        console.log('Could not extract page context:', error);
        return null;
    }
}

/**
 * Store successful solution
 */
async function storeSuccessfulSolution(result) {
    const timestamp = new Date().toISOString();
    const solutionData = {
        timestamp,
        method: result.method,
        language: result.language,
        success: true
    };
    
    // Store in Chrome storage
    try {
        const storage = await chrome.storage.local.get('solutions');
        const solutions = storage.solutions || [];
        solutions.push(solutionData);
        
        // Keep only last 50 solutions
        if (solutions.length > 50) {
            solutions.splice(0, solutions.length - 50);
        }
        
        await chrome.storage.local.set({ solutions });
        
    } catch (error) {
        console.error('Error storing solution:', error);
    }
}

/**
 * Store failure context
 */
async function storeFailureContext(result) {
    const timestamp = new Date().toISOString();
    const failureData = {
        timestamp,
        error: result.error,
        method: result.method,
        failureContext: result.failureContext || []
    };
    
    failureContext.push(failureData);
    
    // Keep only last 20 failures in memory
    if (failureContext.length > 20) {
        failureContext.splice(0, failureContext.length - 20);
    }
    
    // Store in Chrome storage
    try {
        const storage = await chrome.storage.local.get('failures');
        const failures = storage.failures || [];
        failures.push(failureData);
        
        // Keep only last 20 failures
        if (failures.length > 20) {
            failures.splice(0, failures.length - 20);
        }
        
        await chrome.storage.local.set({ failures });
        
    } catch (error) {
        console.error('Error storing failure:', error);
    }
}

/**
 * Track model attempts
 */
function trackModelAttempt(modelName) {
    attempts.set(modelName, (attempts.get(modelName) || 0) + 1);
}

// Initialize background service
console.log('SecureDSA-Pro Background Service Worker initialized');

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
    console.log('SecureDSA-Pro extension installed:', details.reason);
    
    // Set up initial storage
    chrome.storage.local.set({
        solutions: [],
        failures: [],
        settings: {
            backendUrl: 'http://localhost:3000',
            defaultLanguage: 'python',
            autoExtractContext: true
        }
    });
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
    console.log('SecureDSA-Pro extension started');
});