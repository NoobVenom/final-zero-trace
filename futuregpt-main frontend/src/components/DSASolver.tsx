import { useState } from 'react';
import { Code, Zap, Clock, Database, Play, FileText, Target, TrendingUp, Upload, Image } from 'lucide-react';
import type { DSAProblem, DSASolution, TestCase, ProgrammingLanguage, UploadedFile, ImageAnalysis, DocumentAnalysis } from '../types';
import { FileUpload } from './FileUpload';

interface DSASolverProps {
  onSolve: (problem: DSAProblem, language: string) => Promise<DSASolution>;
  onAnalyzeComplexity: (code: string, language: string) => Promise<any>;
  onGenerateTestCases: (description: string, count: number) => Promise<TestCase[]>;
  onFileUpload: (file: UploadedFile) => Promise<void>;
  onFileAnalysis: (file: UploadedFile) => Promise<ImageAnalysis | DocumentAnalysis>;
  isLoading: boolean;
}

const PROGRAMMING_LANGUAGES: ProgrammingLanguage[] = [
  {
    name: 'C++',
    extension: '.cpp',
    syntax: 'cpp',
    features: ['STL', 'Fast execution', 'Competitive programming standard']
  },
  {
    name: 'Python',
    extension: '.py',
    syntax: 'python',
    features: ['Readable code', 'Built-in libraries', 'Quick prototyping']
  },
  {
    name: 'Java',
    extension: '.java',
    syntax: 'java',
    features: ['Object-oriented', 'Platform independent', 'Enterprise ready']
  },
  {
    name: 'JavaScript',
    extension: '.js',
    syntax: 'javascript',
    features: ['Web development', 'Dynamic typing', 'Rich ecosystem']
  }
];

export function DSASolver({ onSolve, onAnalyzeComplexity, onGenerateTestCases, onFileUpload, onFileAnalysis, isLoading }: DSASolverProps) {
  const [problemTitle, setProblemTitle] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [inputFormat, setInputFormat] = useState('');
  const [outputFormat, setOutputFormat] = useState('');
  const [explanation, setExplanation] = useState('');
  const [constraints, setConstraints] = useState('');
  const [sampleInput, setSampleInput] = useState('');
  const [sampleOutput, setSampleOutput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('cpp');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'expert'>('medium');
  const [solution, setSolution] = useState<DSASolution | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [complexityAnalysis, setComplexityAnalysis] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [explanationImage, setExplanationImage] = useState<File | null>(null);
  const [showFileUpload, setShowFileUpload] = useState(false);

  const handleSolve = async () => {
    if (!problemTitle.trim() || !problemStatement.trim()) return;

    const problem: DSAProblem = {
      id: Date.now().toString(),
      title: problemTitle,
      description: `${problemStatement}\n\nInput Format: ${inputFormat}\nOutput Format: ${outputFormat}\n\nSample Input: ${sampleInput}\nSample Output: ${sampleOutput}\n\nExplanation: ${explanation}`,
      difficulty,
      category: 'competitive-programming',
      tags: [],
      constraints: constraints.split('\n').filter(c => c.trim()),
      examples: testCases
    };

    try {
      const result = await onSolve(problem, selectedLanguage);
      setSolution(result);
    } catch (error) {
      console.error('Error solving problem:', error);
    }
  };

  const handleAnalyzeComplexity = async () => {
    if (!solution?.code) return;

    try {
      const analysis = await onAnalyzeComplexity(solution.code, selectedLanguage);
      setComplexityAnalysis(analysis);
    } catch (error) {
      console.error('Error analyzing complexity:', error);
    }
  };

  const handleGenerateTestCases = async () => {
    if (!problemStatement.trim()) return;

    try {
      const cases = await onGenerateTestCases(problemStatement, 5);
      setTestCases(cases);
    } catch (error) {
      console.error('Error generating test cases:', error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setExplanationImage(file);
    }
  };

  const handleFileAnalysis = async (file: UploadedFile) => {
    try {
      const analysis = await onFileAnalysis(file);
      
      // Auto-fill form fields based on analysis
      if ('problemStatement' in analysis && analysis.problemStatement) {
        setProblemStatement(analysis.problemStatement);
      }
      if ('constraints' in analysis && analysis.constraints) {
        setConstraints(analysis.constraints.join('\n'));
      }
      if ('inputFormat' in analysis && analysis.inputFormat) {
        setInputFormat(analysis.inputFormat);
      }
      if ('outputFormat' in analysis && analysis.outputFormat) {
        setOutputFormat(analysis.outputFormat);
      }
      if ('sampleInput' in analysis && analysis.sampleInput) {
        setSampleInput(analysis.sampleInput);
      }
      if ('sampleOutput' in analysis && analysis.sampleOutput) {
        setSampleOutput(analysis.sampleOutput);
      }
      if ('explanation' in analysis && analysis.explanation) {
        setExplanation(analysis.explanation);
      }
      
      return analysis;
    } catch (error) {
      console.error('Error analyzing file:', error);
      throw error;
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center space-x-2 text-blue-400">
        <Target className="w-5 h-5" />
        <h2 className="text-lg font-semibold">DSA Problem Solver</h2>
      </div>

      {/* File Upload Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-300">Upload Problem Files</h3>
          <button
            onClick={() => setShowFileUpload(!showFileUpload)}
            className="flex items-center space-x-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs text-white transition-colors"
          >
            <Upload className="w-3 h-3" />
            <span>{showFileUpload ? 'Hide' : 'Show'} File Upload</span>
          </button>
        </div>
        
        {showFileUpload && (
          <FileUpload
            onFileUpload={onFileUpload}
            onFileAnalysis={handleFileAnalysis}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Problem Input */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Problem Title *
          </label>
          <input
            type="text"
            value={problemTitle}
            onChange={(e) => setProblemTitle(e.target.value)}
            placeholder="e.g., Maximum Subarray Sum"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Problem Statement *
          </label>
          <textarea
            value={problemStatement}
            onChange={(e) => setProblemStatement(e.target.value)}
            placeholder="Describe the problem in detail..."
            rows={4}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Input Format *
            </label>
            <textarea
              value={inputFormat}
              onChange={(e) => setInputFormat(e.target.value)}
              placeholder="Describe the input format..."
              rows={3}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Output Format *
            </label>
            <textarea
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              placeholder="Describe the output format..."
              rows={3}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sample Input (Optional)
            </label>
            <textarea
              value={sampleInput}
              onChange={(e) => setSampleInput(e.target.value)}
              placeholder="Enter sample input..."
              rows={1}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sample Output (Optional)
            </label>
            <textarea
              value={sampleOutput}
              onChange={(e) => setSampleOutput(e.target.value)}
              placeholder="Enter expected output..."
              rows={1}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Explanation (Optional)
          </label>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Provide explanation or approach..."
            rows={3}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Explanation Image (Optional)
          </label>
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white cursor-pointer hover:bg-gray-700 transition-colors">
              <Upload className="w-4 h-4" />
              <span className="text-sm">Upload Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            {explanationImage && (
              <div className="flex items-center space-x-2 text-sm text-green-400">
                <Image className="w-4 h-4" />
                <span>{explanationImage.name}</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Constraints *
          </label>
          <textarea
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            placeholder="Enter constraints (one per line)&#10;e.g., 1 ≤ n ≤ 10^5&#10;1 ≤ arr[i] ≤ 10^9"
            rows={3}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PROGRAMMING_LANGUAGES.map(lang => (
                <option key={lang.name} value={lang.syntax}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={handleSolve}
          disabled={isLoading || !problemTitle.trim() || !problemStatement.trim() || !inputFormat.trim() || !outputFormat.trim() || !constraints.trim()}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md text-white font-medium transition-colors"
        >
          <Zap className="w-4 h-4" />
          <span>Solve Problem</span>
        </button>

        <button
          onClick={handleGenerateTestCases}
          disabled={isLoading || !problemStatement.trim()}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md text-white font-medium transition-colors"
        >
          <Play className="w-4 h-4" />
          <span>Generate Tests</span>
        </button>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white font-medium transition-colors"
        >
          <TrendingUp className="w-4 h-4" />
          <span>Advanced</span>
        </button>
      </div>

      {/* Test Cases */}
      {testCases.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-md font-semibold text-gray-300 flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Test Cases</span>
          </h3>
          <div className="space-y-2">
            {testCases.map((testCase, index) => (
              <div key={index} className="p-3 bg-gray-800 rounded-md border border-gray-700">
                <div className="text-sm text-gray-400 mb-1">Test Case {index + 1}</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-green-400">Input:</span>
                    <div className="font-mono bg-gray-900 p-2 rounded mt-1">{testCase.input}</div>
                  </div>
                  <div>
                    <span className="text-blue-400">Output:</span>
                    <div className="font-mono bg-gray-900 p-2 rounded mt-1">{testCase.output}</div>
                  </div>
                </div>
                {testCase.description && (
                  <div className="text-xs text-gray-500 mt-2">{testCase.description}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Solution */}
      {solution && (
        <div className="space-y-4">
          <h3 className="text-md font-semibold text-gray-300 flex items-center space-x-2">
            <Code className="w-4 h-4" />
            <span>Solution</span>
          </h3>
          
          <div className="bg-gray-900 rounded-md p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">{solution.language.toUpperCase()}</span>
              <button
                onClick={handleAnalyzeComplexity}
                disabled={isLoading}
                className="flex items-center space-x-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs text-white"
              >
                <Clock className="w-3 h-3" />
                <span>Analyze</span>
              </button>
            </div>
            
            <pre className="text-sm text-gray-200 overflow-x-auto">
              <code>{solution.code}</code>
            </pre>
          </div>

          {/* Complexity Analysis */}
          {complexityAnalysis && (
            <div className="bg-gray-900 rounded-md p-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Complexity Analysis</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-yellow-400">Time Complexity:</span>
                  <div className="font-mono bg-gray-800 p-2 rounded mt-1">{complexityAnalysis.timeComplexity}</div>
                </div>
                <div>
                  <span className="text-green-400">Space Complexity:</span>
                  <div className="font-mono bg-gray-800 p-2 rounded mt-1">{complexityAnalysis.spaceComplexity}</div>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-300">
                <div className="font-semibold mb-1">Explanation:</div>
                <div>{complexityAnalysis.explanation}</div>
              </div>
              {complexityAnalysis.optimization && (
                <div className="mt-3 text-sm text-blue-300">
                  <div className="font-semibold mb-1">Optimization:</div>
                  <div>{complexityAnalysis.optimization}</div>
                </div>
              )}
            </div>
          )}

          {/* Approach and Explanation */}
          <div className="bg-gray-900 rounded-md p-4">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Approach & Explanation</h4>
            <div className="space-y-3 text-sm text-gray-300">
              <div>
                <span className="text-purple-400 font-semibold">Approach:</span>
                <div className="mt-1">{solution.approach}</div>
              </div>
              <div>
                <span className="text-blue-400 font-semibold">Explanation:</span>
                <div className="mt-1">{solution.explanation}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 