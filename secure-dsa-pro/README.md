# 🔒 SecureDSA-Pro

**Zero-trace DSA problem solver with multi-model AI orchestration**

A privacy-first Chrome extension that solves any Data Structures and Algorithms (DSA) problem end-to-end in the browser—no data ever leaves the user's machine. Implements the flowchart logic with dual LLM orchestration through n8n workflows and MCP servers.

## ✨ Features

### 🛡️ Zero-Trace Privacy
- **Complete local processing** - No data transmitted outside your machine
- **Session storage only** - Uses `chrome.storage.session` for temporary data
- **No telemetry** - Zero tracking or analytics
- **Encrypted storage** - AES-256 encryption for any temporary data

### 🤖 Multi-Model AI Orchestration
- **Primary Model**: GPT-4o (128k context)
- **Secondary Model**: Deepseek v3 (33B parameters)
- **Retry Model**: Claude 3.5 Sonnet (200k context)
- **Concurrent processing** for initial analysis
- **Intelligent fallback** on failure with context handoff
- **Maximum 4 attempts** with learning from failures

### 🧪 Advanced Testing & Execution
- **Pyodide integration** for client-side Python execution
- **Multi-language support**: Python, C++, Java, JavaScript
- **Auto-generated test cases** with edge case coverage
- **Real-time complexity analysis** with Big-O notation
- **Sandboxed execution** for security

### 📊 Educational Features
- **Step-by-step explanations** with annotated pseudocode
- **Algorithm pattern recognition** (DP, sliding-window, etc.)
- **Complexity visualization** with detailed analysis
- **Failure history learning** mode
- **Solution history** with model attribution

## 🚀 Quick Start

### Prerequisites
- Chrome browser
- Docker and Docker Compose
- 4GB+ RAM for local AI models

### 1. Start the Backend Services

```bash
# Clone the repository
git clone <repository-url>
cd secure-dsa-pro

# Start all services with Docker Compose
docker-compose up -d

# Wait for services to be healthy (check logs)
docker-compose logs -f health-check
```

### 2. Import n8n Workflow

1. Open n8n at `http://localhost:5678`
2. Login with: `admin` / `secure-dsa-pro-2024`
3. Import the workflow from `n8n_workflow.json`
4. Activate the workflow

### 3. Install Chrome Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `secure-dsa-pro` folder
5. The extension icon should appear in your toolbar

### 4. Test the Extension

1. Click the SecureDSA-Pro icon
2. Paste a DSA problem (e.g., "Two Sum" problem)
3. Click "Solve Problem"
4. Watch the multi-model orchestration in action!

## 📁 Project Structure

```
secure-dsa-pro/
├── manifest.json              # Chrome extension manifest
├── background/
│   └── service-worker.js      # Background service worker
├── popup/
│   ├── popup.html            # Extension popup interface
│   ├── popup.css             # Styling
│   └── popup.js              # Popup functionality
├── n8n_workflow.json         # n8n workflow configuration
├── docker-compose.yml        # Docker services setup
└── README.md                 # This file
```

## 🔧 Configuration

### MCP Server Endpoints
The extension connects to local MCP servers:
- **GPT-4o**: `http://localhost:11434`
- **Deepseek v3**: `http://localhost:11436`
- **Claude 3.5 Sonnet**: `http://localhost:11435`

### n8n Webhook
- **URL**: `http://127.0.0.1:5678/webhook/dsa`
- **Method**: POST
- **Payload**: `{ "problem": "your DSA problem text" }`

### Chrome Extension Settings
- **Permissions**: `storage`, `scripting`, `activeTab`
- **Host permissions**: `http://localhost:*`, `http://127.0.0.1:*`
- **CSP**: `script-src 'self'; connect-src 'self' ws://127.0.0.1:*`

## 🎯 Usage Examples

### Example 1: Two Sum Problem
```
Input: Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

Output: 
✅ Problem solved successfully using GPT-4o Mini on attempt 1
- Solution: Hash map approach with O(n) time complexity
- Tests: 3/3 passed
- Complexity: Time O(n), Space O(n)
```

### Example 2: Binary Tree Traversal
```
Input: Implement inorder traversal of a binary tree.

Output:
✅ Problem solved on retry using Claude Sonnet on attempt 2
- Solution: Recursive and iterative approaches
- Tests: 5/5 passed
- Complexity: Time O(n), Space O(h) where h is tree height
```

## 🔄 Workflow Process

1. **Problem Input** → User pastes DSA problem
2. **Parallel Analysis** → GPT-4o Mini + Claude Sonnet analyze simultaneously
3. **Solution Generation** → Extract optimal solution with explanation
4. **Test Execution** → Run comprehensive test cases
5. **Success/Failure Decision** → If tests pass, return solution
6. **Failure Handling** → Store context, retry with different model
7. **Learning Loop** → Continue until success or max attempts reached

## 🛠️ Development

### Local Development Setup

```bash
# Start development environment
docker-compose up -d

# Watch logs
docker-compose logs -f

# Rebuild services
docker-compose down
docker-compose up -d --build
```

### Extension Development

```bash
# Make changes to extension files
# Reload extension in Chrome
# Test changes
```

### n8n Workflow Development

1. Open n8n at `http://localhost:5678`
2. Edit workflow nodes as needed
3. Test with sample DSA problems
4. Export updated workflow

## 🔒 Security Features

### Zero-Trace Implementation
- **No external API calls** except to localhost
- **Client-side storage only** using `chrome.storage.session`
- **In-memory processing** for sensitive data
- **No telemetry or tracking**

### Data Protection
- **AES-256 encryption** for any stored data
- **Session-only storage** (cleared on browser close)
- **No persistent logging**
- **Sandboxed code execution**

## 📈 Performance Targets

- **Easy problems**: < 5 seconds
- **Medium problems**: < 30 seconds  
- **Hard problems**: < 120 seconds
- **Success rate**: 95%+ for Easy, 80%+ for Medium, 60%+ for Hard

## 🐛 Troubleshooting

### Common Issues

**Extension not loading:**
- Check manifest.json syntax
- Ensure all files are in the correct directory
- Check Chrome console for errors

**n8n workflow not working:**
- Verify n8n is running at `http://localhost:5678`
- Check workflow is activated
- Test webhook endpoint manually

**MCP servers not responding:**
- Check Docker containers are running: `docker-compose ps`
- Verify ports 11434 and 11435 are accessible
- Check container logs: `docker-compose logs mcp-gpt4o`

**Performance issues:**
- Ensure sufficient RAM (4GB+ recommended)
- Check CPU usage during model inference
- Monitor Docker resource usage

### Debug Mode

Enable debug logging in the extension:
1. Open Chrome DevTools
2. Go to Console tab
3. Look for "SecureDSA-Pro" log messages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **n8n Community** for workflow automation
- **Ollama** for local AI model hosting
- **Monaco Editor** for code editing
- **Pyodide** for client-side Python execution

---

**Happy coding with zero-trace privacy! 🚀** 