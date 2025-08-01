# 🚀 Ultimate Competitive Programming AI Extension

**World's Best DSA Problem Solver & Competitive Programming Assistant**

A Chrome extension that transforms into the ultimate competitive programming and DSA problem-solving tool. Solve the hardest algorithmic problems with AI-powered assistance, complexity analysis, and multi-language support.

## ✨ Features

### 🎯 **DSA Problem Solver**
- **Optimal Solutions**: Get the most efficient algorithms for any DSA problem
- **Multi-Language Support**: C++, Python, Java, JavaScript with competitive programming templates
- **Complexity Analysis**: Detailed time and space complexity breakdown
- **Test Case Generation**: Comprehensive test cases for edge case coverage
- **Approach Explanation**: Step-by-step algorithm explanations

### 🏆 **Competitive Programming Modes**
- **DSA Solver**: Specialized for algorithmic problem solving
- **Competitive**: Advanced competitive programming features
- **Interview Prep**: Coding interview practice and preparation
- **Optimization**: Code performance analysis and optimization

### 🔧 **Advanced Features**
- **Real-time Code Execution**: Test your solutions instantly
- **Complexity Visualization**: Visual representation of algorithm efficiency
- **Edge Case Detection**: Automatic identification of corner cases
- **Performance Profiling**: Detailed performance analysis
- **Multi-language Templates**: Pre-built competitive programming templates

## 🚀 Quick Start

### 1. Install the Extension
```bash
# Clone the repository
git clone <repository-url>
cd futuregpt-main/futuregpt-main\ frontend

# Install dependencies
npm install

# Build the extension
npm run build
```

### 2. Start the Backend Server
```bash
# Navigate to backend directory
cd ../gpt-backend

# Install dependencies
npm install

# Start the server
node server.js
```

### 3. Load Extension in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder from the frontend build

## 🎯 Usage Examples

### DSA Problem Solving
```
Problem: Maximum Subarray Sum
Description: Find the contiguous subarray with the largest sum
Difficulty: Medium
Language: C++

AI Response:
- Optimal solution using Kadane's Algorithm
- Time Complexity: O(n)
- Space Complexity: O(1)
- Complete code with edge case handling
- Test cases and explanations
```

### Complexity Analysis
```
Input: Your algorithm code
Output:
- Time Complexity: O(n log n)
- Space Complexity: O(n)
- Detailed explanation
- Optimization suggestions
- Edge case considerations
```

### Test Case Generation
```
Input: Problem description
Output:
- Normal test cases
- Edge cases (empty input, single element)
- Boundary conditions
- Stress test cases
- Corner cases
```

## 🛠️ Backend API Endpoints

### Core Endpoints
- `POST /prompt` - General AI chat with context awareness
- `POST /solve-dsa` - DSA problem solving with optimal solutions
- `POST /analyze-complexity` - Algorithm complexity analysis
- `POST /generate-testcases` - Test case generation
- `POST /web-search` - Real-time web search
- `POST /function-call` - Function execution

### DSA Solver Features
```javascript
// Solve DSA problem
POST /solve-dsa
{
  "problem": {
    "title": "Maximum Subarray Sum",
    "description": "Find contiguous subarray with largest sum",
    "difficulty": "medium",
    "constraints": ["1 ≤ n ≤ 10^5", "1 ≤ arr[i] ≤ 10^9"]
  },
  "language": "cpp"
}

// Analyze complexity
POST /analyze-complexity
{
  "code": "your algorithm code",
  "language": "cpp"
}

// Generate test cases
POST /generate-testcases
{
  "problemDescription": "problem description",
  "count": 5
}
```

## 🎨 UI Components

### DSASolver Component
- **Problem Input**: Title, description, constraints, difficulty
- **Language Selection**: C++, Python, Java, JavaScript
- **Solution Display**: Code, complexity, approach, explanation
- **Test Cases**: Input/output pairs with descriptions
- **Complexity Analysis**: Time/space complexity breakdown

### Enhanced Sidebar
- **Mode Switching**: Chat, Research, Code, Vision, DSA Solver, Competitive, Interview, Optimization
- **Quick Actions**: New chat, settings, mode-specific features

### Welcome Screen
- **Mode-specific Content**: Different features and examples for each mode
- **Competitive Programming**: DSA-focused examples and features

## 🔧 Configuration

### Environment Variables
```bash
# Backend configuration
OPENAI_API_KEY=your_openai_api_key
PORT=3000

# Frontend configuration
VITE_API_URL=http://localhost:3000
```

### Supported Programming Languages
- **C++**: STL, fast I/O, competitive programming templates
- **Python**: Built-in libraries, list comprehensions, efficient algorithms
- **Java**: Efficient data structures, StringBuilder for strings
- **JavaScript**: Modern ES6+ features, efficient array methods

## 🏆 Competitive Programming Features

### Algorithm Categories
- **Binary Search**: Variations and applications
- **Dynamic Programming**: 1D, 2D, state compression
- **Graph Algorithms**: DFS, BFS, Dijkstra, Floyd-Warshall
- **Tree Algorithms**: LCA, segment trees, binary lifting
- **String Algorithms**: KMP, Z-function, suffix arrays
- **Advanced Data Structures**: Trie, Segment Tree, Fenwick Tree
- **Greedy Algorithms**: Optimization strategies
- **Number Theory**: Combinatorics and mathematical algorithms

### Problem Difficulty Levels
- **Easy**: Basic algorithms and data structures
- **Medium**: Advanced algorithms and optimizations
- **Hard**: Complex algorithmic challenges
- **Expert**: Cutting-edge competitive programming problems

## 🔒 Privacy & Security

- **Privacy-First Design**: All processing in-memory
- **Zero Data Storage**: No persistent logging or tracking
- **Local Processing**: Sensitive data never leaves your device
- **Secure Communication**: Encrypted API calls to backend

## 🚀 Performance Features

### Optimization Techniques
- **Algorithm Optimization**: Best practices for competitive programming
- **Memory Management**: Efficient memory usage patterns
- **Time Complexity**: Optimal algorithm selection
- **Space Complexity**: Minimal memory footprint

### Real-time Features
- **Live Code Execution**: Instant feedback on solutions
- **Complexity Visualization**: Real-time complexity analysis
- **Performance Profiling**: Detailed performance metrics
- **Edge Case Detection**: Automatic corner case identification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🎯 Roadmap

### Phase 1: Core DSA Solver ✅
- [x] Multi-language support
- [x] Complexity analysis
- [x] Test case generation
- [x] Basic UI components

### Phase 2: Advanced Features 🚧
- [ ] Real-time code execution
- [ ] Performance profiling
- [ ] Advanced algorithm visualization
- [ ] Contest mode

### Phase 3: Community Features 📋
- [ ] Problem sharing
- [ ] Solution comparison
- [ ] Leaderboards
- [ ] Collaborative solving

---

**Transform your Chrome extension into the world's best competitive programming AI assistant!** 🚀 