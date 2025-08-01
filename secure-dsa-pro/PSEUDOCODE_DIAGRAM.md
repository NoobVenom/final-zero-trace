# SecureDSA-Pro Pseudocode Diagram

## 🎯 Main Problem Solving Flow

```
START
  ↓
[User Inputs DSA Problem]
  ↓
[Validate Input]
  ↓
[Initialize Progress Tracking]
  ↓
┌─────────────────────────────────────────────────────────────┐
│                    CONCURRENT ANALYSIS                      │
│  ┌─────────────────┐    ┌─────────────────┐              │
│  │   GPT-4o       │    │   Deepseek v3   │              │
│  │ (Primary)      │    │  (Secondary)    │              │
│  │ Port: 11434    │    │ Port: 11436     │              │
│  └─────────────────┘    └─────────────────┘              │
└─────────────────────────────────────────────────────────────┘
  ↓
[Wait for Both Models to Complete]
  ↓
[Extract Solutions from Both Models]
  ↓
┌─────────────────────────────────────────────────────────────┐
│                    SOLUTION EVALUATION                     │
│                                                           │
│  IF (Primary Solution Quality > Threshold)               │
│    → Use Primary Solution                                │
│  ELSE IF (Secondary Solution Quality > Threshold)        │
│    → Use Secondary Solution                              │
│  ELSE                                                    │
│    → Mark for Retry                                      │
└─────────────────────────────────────────────────────────────┘
  ↓
[Generate Test Cases]
  ↓
[Run Tests (Simulated Pyodide)]
  ↓
┌─────────────────────────────────────────────────────────────┐
│                    TEST RESULTS DECISION                   │
│                                                           │
│  IF (All Tests Pass)                                    │
│    → SUCCESS PATH                                        │
│  ELSE                                                    │
│    → FAILURE PATH                                        │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Retry/Failure Handling Flow

```
FAILURE PATH
  ↓
[Store Failure Context]
  ↓
[Generate Retry Prompt with Context]
  ↓
┌─────────────────────────────────────────────────────────────┐
│                    RETRY WITH CLAUDE                      │
│                                                           │
│  [Claude 3.5 Sonnet]                                    │
│  Port: 11435                                            │
│  Context: Previous attempts + Error details              │
└─────────────────────────────────────────────────────────────┘
  ↓
[Extract Retry Solution]
  ↓
[Generate New Test Cases]
  ↓
[Run Retry Tests]
  ↓
┌─────────────────────────────────────────────────────────────┐
│                    FINAL DECISION                         │
│                                                           │
│  IF (Retry Tests Pass)                                  │
│    → RETRY SUCCESS                                       │
│  ELSE                                                    │
│    → FINAL FAILURE                                       │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Detailed Process Breakdown

### 1. **Input Processing**
```
User Input → Problem Text + Language Selection
  ↓
Validation: Check if input is valid DSA problem
  ↓
Storage: Save to chrome.storage.session
  ↓
Progress: Initialize UI progress indicators
```

### 2. **Concurrent Model Analysis**
```
Parallel Execution:
  ├─ GPT-4o (Primary)
  │   ├─ Endpoint: http://localhost:11434/api/generate
  │   ├─ Model: gpt4o
  │   ├─ System Prompt: "You are an expert DSA problem solver..."
  │   └─ Max Tokens: 2000
  │
  └─ Deepseek v3 (Secondary)
      ├─ Endpoint: http://localhost:11436/api/generate
      ├─ Model: deepseek-coder:33b
      ├─ System Prompt: "You are a competitive programming expert..."
      └─ Max Tokens: 2000
```

### 3. **Solution Quality Assessment**
```
Quality Metrics:
  ├─ Code Completeness
  ├─ Algorithm Efficiency
  ├─ Edge Case Handling
  ├─ Time Complexity Analysis
  └─ Space Complexity Analysis

Decision Logic:
  IF (Primary Score > 0.8) → Use Primary
  ELSE IF (Secondary Score > 0.8) → Use Secondary
  ELSE → Trigger Retry
```

### 4. **Test Generation & Execution**
```
Test Generation:
  ├─ Unit Tests
  ├─ Edge Cases
  ├─ Performance Tests
  └─ Memory Tests

Simulated Execution:
  ├─ Pyodide Environment
  ├─ Code Compilation
  ├─ Test Execution
  └─ Result Validation
```

### 5. **Error Handling & Recovery**
```
Failure Scenarios:
  ├─ Model Unavailable
  ├─ Network Timeout
  ├─ Invalid Response
  ├─ Test Failures
  └─ Memory/Performance Issues

Recovery Actions:
  ├─ Retry with Different Model
  ├─ Context Preservation
  ├─ Progressive Complexity Reduction
  └─ Graceful Degradation
```

## 🔧 Technical Implementation Details

### **Model Orchestration**
```
Model Selection Logic:
  Attempt 1: GPT-4o
  Attempt 2: Deepseek v3
  Attempt 3: Claude 3.5 Sonnet
  Attempt 4: GPT-4o (Fallback)
```

### **Storage Management**
```
chrome.storage.session:
  ├─ Problem History
  ├─ Current Session Data
  ├─ Model Responses
  └─ Test Results
```

### **Communication Flow**
```
Popup ↔ Service Worker ↔ n8n ↔ MCP Servers
  ├─ Problem Submission
  ├─ Progress Updates
  ├─ Solution Delivery
  └─ Error Reporting
```

## 🎯 Success Criteria

### **Primary Success**
- ✅ All tests pass
- ✅ Solution is optimal
- ✅ Code is well-documented
- ✅ Complexity analysis provided

### **Retry Success**
- ✅ At least 80% of tests pass
- ✅ Solution is functional
- ✅ Basic documentation present

### **Final Failure**
- ❌ Less than 50% of tests pass
- ❌ No valid solution found
- ❌ All models exhausted

## 🔄 State Management

```
States:
  ├─ IDLE: Ready for input
  ├─ ANALYZING: Concurrent model analysis
  ├─ TESTING: Running test cases
  ├─ RETRYING: Attempting with different model
  ├─ SUCCESS: Solution found and validated
  └─ FAILURE: All attempts exhausted
```

## 📈 Performance Metrics

```
Tracking:
  ├─ Response Time per Model
  ├─ Success Rate per Model
  ├─ Test Pass Rate
  ├─ User Satisfaction
  └─ Error Frequency
```

This pseudocode diagram represents the complete flow of the SecureDSA-Pro extension, showing how it intelligently orchestrates multiple AI models, handles failures gracefully, and ensures privacy-first operation with zero data leaving the user's machine. 