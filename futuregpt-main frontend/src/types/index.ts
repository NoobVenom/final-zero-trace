export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'image' | 'code' | 'file' | 'dsa-problem' | 'solution' | 'complexity-analysis' | 'document';
  metadata?: {
    model?: string;
    tokens?: number;
    imageUrl?: string;
    fileName?: string;
    language?: string;
    source?: string;
    functionName?: string;
    // DSA specific metadata
    problemType?: string;
    difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
    timeComplexity?: string;
    spaceComplexity?: string;
    programmingLanguage?: string;
    testCases?: TestCase[];
    tags?: string[];
    contest?: string;
    // File upload metadata
    fileType?: string;
    fileSize?: number;
    extractedText?: string;
    imageAnalysis?: ImageAnalysis;
    documentAnalysis?: DocumentAnalysis;
  };
}

export interface TestCase {
  input: string;
  output: string;
  description?: string;
  isHidden?: boolean;
}

export interface DSAProblem {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: string;
  tags: string[];
  constraints: string[];
  examples: TestCase[];
  solution?: DSASolution;
}

export interface DSASolution {
  code: string;
  language: string;
  timeComplexity: string;
  spaceComplexity: string;
  approach: string;
  explanation: string;
  testCases: TestCase[];
}

export interface AIConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export type AppMode = 'chat' | 'research' | 'code' | 'vision' | 'dsa-solver' | 'competitive' | 'interview' | 'optimization';

export interface AppState {
  mode: AppMode;
  messages: Message[];
  isLoading: boolean;
  config: AIConfig;
  credits: number;
}

export interface Context {
  webpageContent?: string;
  selectedText?: string;
}

export interface ProgrammingLanguage {
  name: string;
  extension: string;
  syntax: string;
  features: string[];
}

export interface ComplexityAnalysis {
  timeComplexity: string;
  spaceComplexity: string;
  explanation: string;
  optimization: string;
}

// File upload and analysis interfaces
export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string | ArrayBuffer;
  url?: string;
}

export interface ImageAnalysis {
  description: string;
  objects: string[];
  text: string[];
  problemStatement?: string;
  constraints?: string[];
  inputFormat?: string;
  outputFormat?: string;
}

export interface DocumentAnalysis {
  extractedText: string;
  problemStatement?: string;
  constraints?: string[];
  inputFormat?: string;
  outputFormat?: string;
  sampleInput?: string;
  sampleOutput?: string;
  explanation?: string;
}

export interface FileUploadConfig {
  maxSize: number; // in bytes
  allowedTypes: string[];
  maxFiles: number;
}