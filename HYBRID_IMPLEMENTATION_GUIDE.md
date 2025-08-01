# SecureDSA-Pro Hybrid System Implementation Guide

## 🎯 Overview

The SecureDSA-Pro Hybrid System combines the best of both worlds:
- **Web Application**: Full-featured React interface for DSA problem solving
- **Chrome Extension**: Context-aware problem extraction and solving from any webpage
- **Backend API**: Multi-model AI orchestration with Docker containers
- **Test Runner**: Sandboxed code execution and validation

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Hybrid System                           │
├─────────────────────────────────────────────────────────────┤
│  🌐 Web App (React)    │  🔐 Chrome Extension            │
│  - Full UI interface   │  - Context extraction           │
│  - Problem input       │  - Right-click menu            │
│  - Solution display    │  - Keyboard shortcuts          │
│  - Test case editor    │  - Floating solve button       │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    Backend API                             │
│  - Express.js server                                       │
│  - SecureDSA-Pro service                                   │
│  - Test runner service                                     │
│  - Multi-model orchestration                               │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                  Docker AI Models                          │
│  - Claude 3.5 (Primary) - Port 11434                     │
│  - Deepseek v3 (Secondary) - Port 11436                  │
│  - GPT-4.1 (Retry 1) - Port 11435                       │
│  - Grok4 (Retry 2) - Port 11437                         │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### 1. Start the Hybrid System

```bash
# Navigate to backend directory
cd gpt-backend

# Run the startup script
start-hybrid.bat
```

This will:
- ✅ Start all Docker AI model services
- ✅ Launch the backend server on port 3000
- ✅ Check service health
- ✅ Provide access URLs

### 2. Access the Web Application

Open your browser and navigate to:
```
http://localhost:5173
```

### 3. Load the Chrome Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `futuregpt-main frontend/public/` folder
5. The SecureDSA-Pro extension will appear in your toolbar

## 🎮 Usage

### Web Application Features

1. **Problem Input**: Enter DSA problems in the text area
2. **Language Selection**: Choose from Python, JavaScript, Java, C++
3. **Test Cases**: Add optional test cases for validation
4. **Solution Display**: View code, complexity analysis, and explanations
5. **System Status**: Monitor AI model health and performance

### Chrome Extension Features

1. **Context Extraction**: Automatically extracts DSA problems from web pages
2. **Right-click Menu**: Select text and right-click to solve with different languages
3. **Keyboard Shortcut**: Use `Ctrl+Shift+S` to solve selected text
4. **Floating Button**: Appears when DSA-related text is selected
5. **Solution Modal**: Displays solutions directly on the webpage

### Backend API Endpoints

```bash
# Solve DSA problem
POST http://localhost:3000/api/secure-dsa/solve
{
  "problemText": "Find the maximum subarray sum",
  "language": "python",
  "testCases": [
    {"input": "[1,2,3]", "expectedOutput": "6"}
  ]
}

# Get system status
GET http://localhost:3000/api/secure-dsa/status

# Run test cases
POST http://localhost:3000/api/secure-dsa/test
{
  "solution": "def maxSubArray(nums): return sum(nums)",
  "testCases": [...],
  "language": "python"
}

# Get supported languages
GET http://localhost:3000/api/secure-dsa/languages
```

## 🔧 Configuration

### Docker Services

The hybrid system uses Docker Compose to manage AI model services:

```yaml
# gpt-backend/docker-compose.yml
services:
  mcp-claude-primary:      # Claude 3.5 - Port 11434
  mcp-deepseek-secondary:  # Deepseek v3 - Port 11436
  mcp-gpt41-retry1:        # GPT-4.1 - Port 11435
  mcp-grok4-retry2:        # Grok4 - Port 11437
```

### Backend Configuration

```javascript
// gpt-backend/secure-dsa-service.js
class SecureDSAProService {
    constructor() {
        this.primaryModel = {
            name: 'Claude 3.5',
            port: 11434,
            url: 'http://localhost:11434/api/generate'
        };
        // ... other models
    }
}
```

### Frontend Configuration

```typescript
// futuregpt-main frontend/src/hooks/useAI.ts
const config: AIConfig = {
    apiKey: 'backend', // Uses backend instead of direct API
    model: selectedModel,
    temperature: 0.7,
    maxTokens: 2000,
};
```

## 🧪 Testing

### Test Case Validation

The system includes a comprehensive test runner:

```javascript
// gpt-backend/test-runner.js
class SecureDSATestRunner {
    async executeTestCases(solution, testCases, language) {
        // Sandboxed execution
        // Multi-language support
        // Timeout protection
        // Output comparison
    }
}
```

### Supported Languages

- **Python**: Full execution with `python` command
- **JavaScript**: Node.js execution
- **Java**: Compilation with `javac` and execution
- **C++**: Compilation with `g++` and execution

## 📊 Monitoring

### System Health Checks

```bash
# Check all AI models
curl http://localhost:11434/api/tags  # Claude 3.5
curl http://localhost:11436/api/tags  # Deepseek v3
curl http://localhost:11435/api/tags  # GPT-4.1
curl http://localhost:11437/api/tags  # Grok4
```

### Performance Metrics

- **Response Time**: Track solution generation time
- **Success Rate**: Monitor solution quality scores
- **Model Usage**: Track which models are used most
- **Error Rates**: Monitor failure patterns

## 🔒 Security Features

### Sandboxed Execution

- Code execution in isolated containers
- Timeout protection (10 seconds)
- Memory limits and cleanup
- Temporary file management

### Privacy Protection

- No data sent to external APIs
- All processing done locally
- Chrome storage for session data only
- No persistent tracking

## 🛠️ Development

### Project Structure

```
ezyZip/
├── futuregpt-main frontend/     # React Web App + Chrome Extension
│   ├── src/                    # React components
│   ├── public/                 # Chrome Extension files
│   │   ├── manifest.json       # Extension manifest
│   │   ├── popup.html          # Extension popup
│   │   ├── popup.js           # Popup logic
│   │   ├── background.js      # Service worker
│   │   └── content.js         # Content script
│   └── package.json
├── gpt-backend/                # Backend API
│   ├── server.js              # Express server
│   ├── secure-dsa-service.js  # AI orchestration
│   ├── test-runner.js         # Code execution
│   ├── docker-compose.yml     # Docker services
│   └── start-hybrid.bat       # Startup script
└── HYBRID_IMPLEMENTATION_GUIDE.md
```

### Adding New Features

1. **New AI Model**: Add to `docker-compose.yml` and `secure-dsa-service.js`
2. **New Language**: Extend `test-runner.js` with execution logic
3. **New UI Component**: Add to React app in `futuregpt-main frontend/src/`
4. **New Extension Feature**: Modify files in `futuregpt-main frontend/public/`

## 🚨 Troubleshooting

### Common Issues

1. **Docker Services Not Starting**
   ```bash
   # Check Docker Desktop is running
   docker --version
   
   # Restart Docker services
   docker-compose down
   docker-compose up -d
   ```

2. **Backend Server Not Responding**
   ```bash
   # Check if port 3000 is available
   netstat -an | findstr :3000
   
   # Restart backend
   npm start
   ```

3. **Chrome Extension Not Loading**
   - Ensure Developer mode is enabled
   - Check for JavaScript errors in extension console
   - Verify manifest.json is valid

4. **AI Models Not Responding**
   ```bash
   # Check model health
   curl http://localhost:11434/api/tags
   
   # Restart specific model
   docker-compose restart mcp-claude-primary
   ```

### Debug Mode

Enable debug logging:

```javascript
// In secure-dsa-service.js
console.log('🔍 Debug: Analyzing with', model.name);
console.log('📊 Debug: Quality score:', quality);
```

## 📈 Performance Optimization

### Caching Strategy

- **Solution Cache**: Store successful solutions
- **Model Cache**: Cache model responses
- **Test Cache**: Cache test case results

### Load Balancing

- **Model Distribution**: Distribute requests across models
- **Quality Thresholds**: Use best model for high-quality solutions
- **Retry Logic**: Fallback to secondary models

## 🔮 Future Enhancements

### Planned Features

1. **Real-time Collaboration**: Share solutions with team members
2. **Solution History**: Track and compare previous solutions
3. **Custom Models**: Add support for custom AI models
4. **Mobile App**: React Native mobile application
5. **IDE Integration**: VS Code extension
6. **Competition Mode**: Compare solutions across models

### Scalability Improvements

1. **Microservices**: Split backend into smaller services
2. **Database Integration**: Add persistent storage
3. **Load Balancing**: Multiple backend instances
4. **Caching Layer**: Redis for response caching

## 📝 License

This project is licensed under the MIT License. See LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the implementation guide

---

**SecureDSA-Pro Hybrid System** - The ultimate DSA problem solving platform combining web application and Chrome Extension capabilities with multi-model AI orchestration. 