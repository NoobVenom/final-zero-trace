const express = require('express');
const axios = require('axios');
const cors = require('cors');
const multer = require('multer');
const { SecureDSAProService } = require('./secure-dsa-service');
const { SecureDSATestRunner } = require('./test-runner');

const app = express();
const port = 3000;

// Initialize SecureDSA-Pro services
const secureDSAService = new SecureDSAProService();
const testRunner = new SecureDSATestRunner();

app.use(cors());
app.use(express.json());

// Simple test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Backend server is running!', timestamp: new Date().toISOString() });
});

// SecureDSA-Pro endpoints
app.post('/api/secure-dsa/solve', async (req, res) => {
  try {
    const { problemText, testCases = [], language = 'python' } = req.body;
    
    if (!problemText) {
      return res.status(400).json({ error: 'Problem text is required' });
    }
    
    console.log('🔍 Received DSA problem request');
    const result = await secureDSAService.solveDSAProblem(problemText, testCases, language);
    
    res.json(result);
  } catch (error) {
    console.error('Error in secure-dsa/solve:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/secure-dsa/status', async (req, res) => {
  try {
    const status = await secureDSAService.getSystemStatus();
    res.json(status);
  } catch (error) {
    console.error('Error getting system status:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/secure-dsa/test', async (req, res) => {
  try {
    const { solution, testCases, language = 'python' } = req.body;
    
    if (!solution || !testCases) {
      return res.status(400).json({ error: 'Solution and test cases are required' });
    }
    
    console.log('🧪 Running test cases');
    const result = await testRunner.executeTestCases(solution, testCases, language);
    
    res.json(result);
  } catch (error) {
    console.error('Error in secure-dsa/test:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/secure-dsa/languages', (req, res) => {
  try {
    const languages = testRunner.getSupportedLanguages();
    res.json({ languages });
  } catch (error) {
    console.error('Error getting supported languages:', error);
    res.status(500).json({ error: error.message });
  }
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit (increased from 10MB)
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      // Images
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif',
      'image/webp',
      'image/bmp',
      'image/tiff',
      'image/svg+xml',
      
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      
      // Text files
      'text/plain',
      'text/csv',
      'text/html',
      'text/css',
      'text/javascript',
      'application/json',
      'application/xml',
      
      // Programming files
      'application/javascript',
      'text/javascript',
      'text/x-python',
      'text/x-c++src',
      'text/x-csrc',
      'text/x-java-source',
      'text/x-php',
      'text/x-ruby',
      'text/x-go',
      'text/x-rust',
      'text/x-swift',
      'text/x-kotlin',
      'text/x-scala',
      'text/x-typescript',
      'text/x-html',
      'text/x-css',
      'text/x-sql',
      'text/x-yaml',
      'text/x-toml',
      'text/x-markdown',
      
      // Adobe files
      'image/vnd.adobe.photoshop',
      'application/vnd.adobe.photoshop',
      
      // Archives
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      
      // Other common formats
      'application/rtf',
      'application/vnd.oasis.opendocument.text',
      'application/vnd.oasis.opendocument.spreadsheet',
      'application/vnd.oasis.opendocument.presentation'
    ];
    
    // Also allow files with common extensions even if MIME type is generic
    const allowedExtensions = [
      '.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.tiff', '.svg',
      '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
      '.txt', '.csv', '.html', '.css', '.js', '.json', '.xml',
      '.py', '.cpp', '.c', '.java', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala',
      '.ts', '.jsx', '.tsx', '.sql', '.yaml', '.yml', '.toml', '.md',
      '.psd', '.zip', '.rar', '.7z', '.rtf', '.odt', '.ods', '.odp'
    ];
    
    const fileExtension = '.' + file.originalname.split('.').pop().toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      console.log('File type not supported:', file.mimetype, fileExtension);
      cb(new Error(`File type ${file.mimetype} is not supported. Supported types: ${allowedTypes.join(', ')}`), false);
    }
  }
});

// Enhanced system prompt for better AI behavior
const SYSTEM_PROMPT = `You are a highly intelligent, concise, and helpful AI assistant embedded within a Chrome extension called zeroTrace. Your main objective is to provide accurate and relevant answers to user questions. 

Key Guidelines:
- Prioritize information directly from the provided [WEBPAGE_CONTENT] or [SELECTED_TEXT] context
- If the answer cannot be found within the provided context, state clearly that you do not have enough information from the current page/context
- Do not hallucinate or make up facts
- Do not engage in casual conversation unless explicitly asked
- Maintain a polite, professional, and neutral tone
- Provide answers in a clear, easy-to-read format unless a specific format is requested
- Be concise but thorough
- If asked about code, provide practical, working examples
- For research queries, provide structured analysis with bullet points
- For vision-related queries, describe what you can analyze in images

Remember: You are a privacy-first AI assistant. All processing happens in-memory with zero data storage.`;

// Specialized DSA Problem Solver prompt
const DSA_SOLVER_PROMPT = `You are an expert competitive programming and DSA problem solver. You excel at solving the hardest algorithmic problems with optimal solutions.

Key Guidelines:
- Always provide the most efficient solution possible
- Include detailed complexity analysis (time and space)
- Explain the approach and algorithm used
- Provide working code in the requested programming language
- Include edge case handling
- Use competitive programming best practices
- Optimize for both correctness and performance
- Support multiple programming languages (C++, Python, Java, JavaScript)
- Provide test cases and examples
- Explain the reasoning behind your approach

Programming Languages:
- C++: Use STL, fast I/O, competitive programming templates
- Python: Use built-in libraries, list comprehensions, efficient algorithms
- Java: Use efficient data structures, StringBuilder for strings
- JavaScript: Use modern ES6+ features, efficient array methods

Common Algorithms to Master:
- Binary Search and its variations
- Dynamic Programming (1D, 2D, state compression)
- Graph algorithms (DFS, BFS, Dijkstra, Floyd-Warshall)
- Tree algorithms (LCA, segment trees, binary lifting)
- String algorithms (KMP, Z-function, suffix arrays)
- Advanced data structures (Trie, Segment Tree, Fenwick Tree)
- Greedy algorithms and optimization
- Number theory and combinatorics

Always provide:
1. Optimal solution with code
2. Time and space complexity analysis
3. Approach explanation
4. Test cases
5. Edge case considerations`;

// Complexity Analysis prompt
const COMPLEXITY_ANALYSIS_PROMPT = `You are an expert at analyzing algorithm complexity. Analyze the provided code and determine:

1. Time Complexity: O(?) - explain why
2. Space Complexity: O(?) - explain why
3. Detailed explanation of the analysis
4. Potential optimizations
5. Edge cases and their impact

Be precise and mathematical in your analysis.`;

// Test Case Generation prompt
const TEST_CASE_PROMPT = `You are an expert at generating comprehensive test cases for algorithmic problems. Generate diverse test cases that cover:

1. Normal cases
2. Edge cases (empty input, single element, etc.)
3. Boundary conditions
4. Stress test cases
5. Corner cases

For each test case provide:
- Input format
- Expected output
- Brief description of what it tests

Make test cases realistic and challenging.`;

// File Analysis prompt
const FILE_ANALYSIS_PROMPT = `You are an expert at analyzing documents and images to extract DSA problem statements. Analyze the provided content and extract:

1. Problem statement (if present)
2. Input format and constraints
3. Output format
4. Sample test cases
5. Explanation or approach hints

For images:
- Describe what you see
- Extract any text content
- Identify if it's a DSA problem
- Extract problem details

For documents:
- Extract the main problem statement
- Identify constraints and input/output formats
- Extract sample test cases
- Provide any explanations

Be thorough and accurate in your analysis.`;

// Store conversation history (in-memory for privacy)
const conversationHistory = new Map();

// Real search API implementation
const performRealSearch = async (query) => {
  try {
    // Option 1: Google Custom Search (Free tier available)
    const googleResponse = await axios.get(`https://www.googleapis.com/customsearch/v1?key=AIzaSyCiPwxo-7-lMOBy2wZMuH54CftYrE53Pys&cx=861253353c4b34dfc&q=${encodeURIComponent(query)}`);
    if (googleResponse.data.items && googleResponse.data.items.length > 0) {
      return {
        source: 'Google Custom Search',
        results: googleResponse.data.items.slice(0, 5).map(item => ({
          title: item.title,
          snippet: item.snippet,
          link: item.link
        }))
      };
    }

    // Option 2: DuckDuckGo (Free, no API key required)
    const duckDuckGoResponse = await axios.get(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`);
    if (duckDuckGoResponse.data.Abstract) {
      return {
        source: 'DuckDuckGo',
        results: [{
          title: 'DuckDuckGo Instant Answer',
          snippet: duckDuckGoResponse.data.Abstract,
          link: duckDuckGoResponse.data.AbstractURL
        }]
      };
    }

    // Fallback: Return demo response if no real search is configured
    return {
      source: 'Demo Search',
      results: [{
        title: `Search results for "${query}"`,
        snippet: `This is a demo response. To get real search results, configure one of the search APIs above.`,
        link: '#'
      }]
    };

  } catch (error) {
    console.error('Search API error:', error);
    return {
      source: 'Error',
      results: [{
        title: 'Search Error',
        snippet: 'Unable to perform search. Please try again later.',
        link: '#'
      }]
    };
  }
};

// File upload endpoint
app.post('/upload-file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File uploaded:', req.file.originalname, req.file.mimetype, req.file.size);

    // For demo purposes, just acknowledge the upload
    res.json({ 
      message: 'File uploaded successfully',
      filename: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// File analysis endpoint
app.post('/analyze-file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      console.error('No file uploaded to analyze-file endpoint');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Analyzing file:', req.file.originalname, req.file.mimetype, req.file.size);

    let analysis;
    
    if (req.file.mimetype.startsWith('image/')) {
      // Image analysis using GPT-4 Vision
      console.log('Processing as image with GPT-4 Vision');
      
      try {
        const base64Image = req.file.buffer.toString('base64');
        
        const response = await axios.post('https://api.chatanywhere.tech/v1/chat/completions', {
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'system',
              content: FILE_ANALYSIS_PROMPT
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analyze this image and extract any DSA problem statement, constraints, input/output formats, and sample test cases if present. Also describe what you see in the image.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${req.file.mimetype};base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 1000,
          temperature: 0.1
        }, {
          headers: {
            'Authorization': 'Bearer sk-ThJ2bucGs6Vw0Sq9NSVuDoMR2xthhIQGamBbzorxalbspvN6',
            'Content-Type': 'application/json'
          }
        });

        console.log('GPT-4 Vision response received');
        const aiResponse = response.data.choices[0].message.content;
        console.log('AI Response:', aiResponse.substring(0, 200) + '...');
        
        // Parse the response to extract analysis components
        analysis = {
          description: extractDescription(aiResponse),
          objects: extractObjects(aiResponse),
          text: extractText(aiResponse),
          problemStatement: extractProblemStatement(aiResponse),
          constraints: extractConstraints(aiResponse),
          inputFormat: extractInputFormat(aiResponse),
          outputFormat: extractOutputFormat(aiResponse)
        };
        
        console.log('Image analysis completed successfully');
      } catch (visionError) {
        console.error('Error with GPT-4 Vision:', visionError.response?.data || visionError.message);
        
        // Fallback analysis for images
        analysis = {
          description: 'Image analysis completed with fallback processing.',
          objects: ['image', 'content'],
          text: ['Image content detected'],
          problemStatement: null,
          constraints: [],
          inputFormat: null,
          outputFormat: null
        };
      }
    } else {
      // Document analysis using GPT-3.5
      console.log('Processing as document with GPT-3.5');
      
      try {
        const textContent = req.file.buffer.toString('utf-8');
        console.log('Document content length:', textContent.length);
        
        const response = await axios.post('https://api.chatanywhere.tech/v1/chat/completions', {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: FILE_ANALYSIS_PROMPT
            },
            {
              role: 'user',
              content: `Analyze this document and extract any DSA problem statement, constraints, input/output formats, and sample test cases if present:\n\n${textContent.substring(0, 3000)}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.1
        }, {
          headers: {
            'Authorization': 'Bearer sk-ThJ2bucGs6Vw0Sq9NSVuDoMR2xthhIQGamBbzorxalbspvN6',
            'Content-Type': 'application/json'
          }
        });

        console.log('GPT-3.5 response received');
        const aiResponse = response.data.choices[0].message.content;
        console.log('AI Response:', aiResponse.substring(0, 200) + '...');
        
        analysis = {
          extractedText: textContent.substring(0, 500) + '...',
          problemStatement: extractProblemStatement(aiResponse),
          constraints: extractConstraints(aiResponse),
          inputFormat: extractInputFormat(aiResponse),
          outputFormat: extractOutputFormat(aiResponse),
          sampleInput: extractSampleInput(aiResponse),
          sampleOutput: extractSampleOutput(aiResponse),
          explanation: extractExplanation(aiResponse)
        };
        
        console.log('Document analysis completed successfully');
      } catch (docError) {
        console.error('Error with GPT-3.5 document analysis:', docError.response?.data || docError.message);
        
        // Fallback analysis for documents
        const textContent = req.file.buffer.toString('utf-8');
        analysis = {
          extractedText: textContent.substring(0, 500) + '...',
          problemStatement: null,
          constraints: [],
          inputFormat: null,
          outputFormat: null,
          sampleInput: null,
          sampleOutput: null,
          explanation: 'Document analysis completed with fallback processing.'
        };
      }
    }

    console.log('Sending analysis result to client');
    res.json({ analysis });
  } catch (error) {
    console.error('File analysis error:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'File analysis failed. Please try again or check the file format.'
    });
  }
});

app.post('/prompt', async (req, res) => {
  const { prompt, webpageContent, selectedText, conversationId, mode = 'chat' } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Invalid prompt provided' });
  }

  try {
    console.log('Received prompt:', prompt);
    console.log('Mode:', mode);
    console.log('Webpage content length:', webpageContent?.length || 0);
    console.log('Selected text length:', selectedText?.length || 0);
    
    // Get conversation history
    const history = conversationHistory.get(conversationId) || [];
    
    // Build context-aware prompt
    let contextPrompt = prompt;
    
    if (webpageContent && webpageContent.trim()) {
      contextPrompt = `[WEBPAGE_CONTENT]: ${webpageContent.substring(0, 2000)}\n\nUser Question: ${prompt}`;
    }
    
    if (selectedText && selectedText.trim()) {
      contextPrompt = `[SELECTED_TEXT]: ${selectedText}\n\nUser Question: ${prompt}`;
    }

    // Choose system prompt based on mode
    let systemPrompt = SYSTEM_PROMPT;
    if (mode === 'dsa-solver' || mode === 'competitive') {
      systemPrompt = DSA_SOLVER_PROMPT;
    }

    // Prepare messages array with system prompt and conversation history
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history (last 6 messages for context)
    const recentHistory = history.slice(-6);
    messages.push(...recentHistory);

    // Add current user message
    messages.push({ role: 'user', content: contextPrompt });

    // Adjust parameters based on mode
    let temperature = 0.7;
    let maxTokens = 500;
    
    switch (mode) {
      case 'research':
        temperature = 0.3; // More deterministic for research
        maxTokens = 800;
        break;
      case 'code':
        temperature = 0.2; // Very deterministic for code
        maxTokens = 1000;
        break;
      case 'dsa-solver':
      case 'competitive':
        temperature = 0.1; // Very deterministic for DSA
        maxTokens = 1500;
        break;
      case 'vision':
        temperature = 0.5;
        maxTokens = 600;
        break;
      default: // chat
        temperature = 0.7;
        maxTokens = 500;
    }

    const response = await axios.post('https://api.chatanywhere.tech/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: maxTokens,
      temperature: temperature,
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1
    }, {
      headers: {
        'Authorization': 'Bearer sk-ThJ2bucGs6Vw0Sq9NSVuDoMR2xthhIQGamBbzorxalbspvN6',
        'Content-Type': 'application/json'
      }
    });

    console.log('OpenAI response:', response.data);
    
    const aiResponse = response.data.choices[0].message.content;
    
    // Update conversation history
    const newHistory = [
      ...history,
      { role: 'user', content: prompt },
      { role: 'assistant', content: aiResponse }
    ];
    
    // Keep only last 10 messages to prevent token overflow
    if (newHistory.length > 10) {
      newHistory.splice(0, newHistory.length - 10);
    }
    
    conversationHistory.set(conversationId, newHistory);
    
    // Ensure we're not just echoing the user's message
    if (aiResponse === prompt) {
      console.log('Warning: AI response matches user prompt, providing fallback');
      return res.json({ 
        response: `I understand you said: "${prompt}". Let me provide a helpful response based on your query. This is a demo response since the AI might not be properly configured.` 
      });
    }

    res.json({ 
      response: aiResponse,
      model: 'gpt-3.5-turbo',
      mode: mode,
      tokens: response.data.usage?.total_tokens || 0
    });
  } catch (error) {
    console.error('Error calling OpenAI:', error.response?.data || error.message);
    
    if (error.response && error.response.data && error.response.data.error.code === 'insufficient_quota') {
      res.status(402).json({ error: 'Quota exceeded. Please check your OpenAI plan and billing details or wait for the next reset.' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// New endpoint for DSA problem solving
app.post('/solve-dsa', async (req, res) => {
  const { problem, language = 'cpp' } = req.body;

  if (!problem || !problem.description) {
    return res.status(400).json({ error: 'Invalid problem provided' });
  }

  try {
    console.log('Solving DSA problem:', problem.title);
    console.log('Language:', language);

    const prompt = `Solve this DSA problem in ${language}:

Problem: ${problem.title}
Description: ${problem.description}
Difficulty: ${problem.difficulty}
Constraints: ${problem.constraints.join(', ')}

Please provide:
1. Optimal solution with complete code
2. Time and space complexity analysis
3. Approach explanation
4. Test cases
5. Edge case considerations

Use competitive programming best practices and optimize for both correctness and performance.`;

    const response = await axios.post('https://api.chatanywhere.tech/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: DSA_SOLVER_PROMPT },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.1,
      top_p: 0.9
    }, {
      headers: {
        'Authorization': 'Bearer sk-ThJ2bucGs6Vw0Sq9NSVuDoMR2xthhIQGamBbzorxalbspvN6',
        'Content-Type': 'application/json'
      }
    });

    const aiResponse = response.data.choices[0].message.content;
    
    // Parse the response to extract solution components
    const solution = {
      code: extractCode(aiResponse, language),
      language: language,
      timeComplexity: extractTimeComplexity(aiResponse),
      spaceComplexity: extractSpaceComplexity(aiResponse),
      approach: extractApproach(aiResponse),
      explanation: extractExplanation(aiResponse),
      testCases: extractTestCases(aiResponse)
    };

    res.json({ solution });
  } catch (error) {
    console.error('Error solving DSA problem:', error);
    res.status(500).json({ error: error.message });
  }
});

// New endpoint for complexity analysis
app.post('/analyze-complexity', async (req, res) => {
  const { code, language = 'cpp' } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Invalid code provided' });
  }

  try {
    console.log('Analyzing complexity for:', language);

    const prompt = `Analyze the time and space complexity of this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Provide detailed analysis including:
1. Time complexity with explanation
2. Space complexity with explanation
3. Potential optimizations
4. Edge cases and their impact`;

    const response = await axios.post('https://api.chatanywhere.tech/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: COMPLEXITY_ANALYSIS_PROMPT },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.1,
      top_p: 0.9
    }, {
      headers: {
        'Authorization': 'Bearer sk-ThJ2bucGs6Vw0Sq9NSVuDoMR2xthhIQGamBbzorxalbspvN6',
        'Content-Type': 'application/json'
      }
    });

    const aiResponse = response.data.choices[0].message.content;
    
    const analysis = {
      timeComplexity: extractTimeComplexity(aiResponse),
      spaceComplexity: extractSpaceComplexity(aiResponse),
      explanation: aiResponse,
      optimization: extractOptimization(aiResponse)
    };

    res.json({ analysis });
  } catch (error) {
    console.error('Error analyzing complexity:', error);
    res.status(500).json({ error: error.message });
  }
});

// New endpoint for test case generation
app.post('/generate-testcases', async (req, res) => {
  const { problemDescription, count = 5 } = req.body;

  if (!problemDescription) {
    return res.status(400).json({ error: 'Invalid problem description provided' });
  }

  try {
    console.log('Generating test cases for problem');

    const prompt = `Generate ${count} comprehensive test cases for this problem:

${problemDescription}

Include:
1. Normal cases
2. Edge cases
3. Boundary conditions
4. Stress test cases
5. Corner cases

For each test case provide input, expected output, and brief description.`;

    const response = await axios.post('https://api.chatanywhere.tech/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: TEST_CASE_PROMPT },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.3,
      top_p: 0.9
    }, {
      headers: {
        'Authorization': 'Bearer sk-ThJ2bucGs6Vw0Sq9NSVuDoMR2xthhIQGamBbzorxalbspvN6',
        'Content-Type': 'application/json'
      }
    });

    const aiResponse = response.data.choices[0].message.content;
    
    const testCases = extractTestCases(aiResponse);

    res.json({ testCases });
  } catch (error) {
    console.error('Error generating test cases:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper functions to extract information from AI responses
function extractCode(response, language) {
  const codeBlockRegex = new RegExp(`\`\`\`${language}\\n([\\s\\S]*?)\`\`\``, 'i');
  const match = response.match(codeBlockRegex);
  return match ? match[1].trim() : '// Code extraction failed';
}

function extractTimeComplexity(response) {
  const timeRegex = /time complexity[:\s]*O\([^)]+\)/i;
  const match = response.match(timeRegex);
  return match ? match[0].split(':')[1]?.trim() || 'O(n)' : 'O(n)';
}

function extractSpaceComplexity(response) {
  const spaceRegex = /space complexity[:\s]*O\([^)]+\)/i;
  const match = response.match(spaceRegex);
  return match ? match[0].split(':')[1]?.trim() || 'O(1)' : 'O(1)';
}

function extractApproach(response) {
  const approachRegex = /approach[:\s]*([^.\n]+)/i;
  const match = response.match(approachRegex);
  return match ? match[1].trim() : 'Algorithmic approach';
}

function extractExplanation(response) {
  const explanationRegex = /explanation[:\s]*([^.\n]+)/i;
  const match = response.match(explanationRegex);
  return match ? match[1].trim() : 'Detailed explanation of the algorithm';
}

function extractOptimization(response) {
  const optimizationRegex = /optimization[:\s]*([^.\n]+)/i;
  const match = response.match(optimizationRegex);
  return match ? match[1].trim() : 'Consider using more efficient algorithms';
}

function extractTestCases(response) {
  const testCases = [];
  const testCaseRegex = /test case \d+[:\s]*input[:\s]*([^\n]+)[:\s]*output[:\s]*([^\n]+)/gi;
  let match;
  
  while ((match = testCaseRegex.exec(response)) !== null) {
    testCases.push({
      input: match[1].trim(),
      output: match[2].trim(),
      description: `Test case ${testCases.length + 1}`
    });
  }
  
  return testCases.length > 0 ? testCases : [
    { input: '[1,2,3]', output: '6', description: 'Sample test case' }
  ];
}

// File analysis extraction functions
function extractDescription(response) {
  const descRegex = /description[:\s]*([^.\n]+)/i;
  const match = response.match(descRegex);
  return match ? match[1].trim() : 'Image analysis completed';
}

function extractObjects(response) {
  const objectsRegex = /objects[:\s]*([^.\n]+)/i;
  const match = response.match(objectsRegex);
  return match ? match[1].split(',').map(obj => obj.trim()) : [];
}

function extractText(response) {
  const textRegex = /text[:\s]*([^.\n]+)/i;
  const match = response.match(textRegex);
  return match ? [match[1].trim()] : [];
}

function extractProblemStatement(response) {
  const problemRegex = /problem[:\s]*([^.\n]+)/i;
  const match = response.match(problemRegex);
  return match ? match[1].trim() : null;
}

function extractConstraints(response) {
  const constraintsRegex = /constraints[:\s]*([^.\n]+)/i;
  const match = response.match(constraintsRegex);
  return match ? match[1].split(',').map(c => c.trim()) : [];
}

function extractInputFormat(response) {
  const inputRegex = /input format[:\s]*([^.\n]+)/i;
  const match = response.match(inputRegex);
  return match ? match[1].trim() : null;
}

function extractOutputFormat(response) {
  const outputRegex = /output format[:\s]*([^.\n]+)/i;
  const match = response.match(outputRegex);
  return match ? match[1].trim() : null;
}

function extractSampleInput(response) {
  const inputRegex = /sample input[:\s]*([^.\n]+)/i;
  const match = response.match(inputRegex);
  return match ? match[1].trim() : null;
}

function extractSampleOutput(response) {
  const outputRegex = /sample output[:\s]*([^.\n]+)/i;
  const match = response.match(outputRegex);
  return match ? match[1].trim() : null;
}

// Enhanced web search endpoint with real APIs
app.post('/web-search', async (req, res) => {
  const { query } = req.body;
  
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Invalid search query provided' });
  }

  try {
    console.log('Performing real search for:', query);
    
    const searchResults = await performRealSearch(query);
    
    // Format the response for the AI
    let formattedResponse = `Search results for "${query}" (via ${searchResults.source}):\n\n`;
    
    searchResults.results.forEach((result, index) => {
      formattedResponse += `${index + 1}. **${result.title}**\n`;
      formattedResponse += `${result.snippet}\n`;
      if (result.link && result.link !== '#') {
        formattedResponse += `Source: ${result.link}\n`;
      }
      formattedResponse += '\n';
    });
    
    res.json({ 
      response: formattedResponse,
      query: query,
      source: searchResults.source,
      results: searchResults.results
    });
  } catch (error) {
    console.error('Error in web search:', error);
    res.status(500).json({ error: error.message });
  }
});

// New endpoint for function calling (demo)
app.post('/function-call', async (req, res) => {
  const { functionName, arguments: args } = req.body;
  
  try {
    console.log('Function call:', functionName, args);
    
    // Demo function implementations
    const functions = {
      'calculateComplexity': (code) => {
        return {
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(1)',
          explanation: 'Linear time complexity with constant space'
        };
      },
      'generateTestCases': (problem) => {
        return [
          { input: '[1,2,3]', output: '6', description: 'Basic case' },
          { input: '[]', output: '0', description: 'Empty case' }
        ];
      },
      'optimizeCode': (code) => {
        return {
          original: code,
          optimized: code.replace(/for\s*\(\s*int\s+i\s*=\s*0\s*;\s*i\s*<\s*n\s*;\s*i\+\+\)/g, 'for(int i=0;i<n;++i)'),
          improvements: ['Reduced loop overhead', 'Better variable naming']
        };
      }
    };
    
    const func = functions[functionName];
    if (!func) {
      throw new Error(`Function ${functionName} not found`);
    }
    
    const result = func(args);
    res.json({ result });
  } catch (error) {
    console.error('Error in function call:', error);
    res.status(500).json({ error: error.message });
  }
});

app.options('/prompt', cors());
app.options('/web-search', cors());
app.options('/function-call', cors());
app.options('/solve-dsa', cors());
app.options('/analyze-complexity', cors());
app.options('/generate-testcases', cors());
app.options('/upload-file', cors());
app.options('/analyze-file', cors());

app.listen(port, () => {
  console.log(`🚀 Ultimate Competitive Programming AI Server running on port ${port}`);
  console.log(`🎯 DSA Problem Solver: http://localhost:${port}/solve-dsa`);
  console.log(`📊 Complexity Analyzer: http://localhost:${port}/analyze-complexity`);
  console.log(`🧪 Test Case Generator: http://localhost:${port}/generate-testcases`);
  console.log(`📁 File Upload: http://localhost:${port}/upload-file`);
  console.log(`🔍 File Analysis: http://localhost:${port}/analyze-file`);
  console.log(`🔍 Web Search: http://localhost:${port}/web-search`);
  console.log(`⚡ Function Calls: http://localhost:${port}/function-call`);
}); 