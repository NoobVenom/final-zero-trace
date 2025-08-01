import { useState, useRef } from 'react';
import { Upload, File, Image, FileText, X, Eye, Download, AlertCircle, CheckCircle } from 'lucide-react';
import type { UploadedFile, ImageAnalysis, DocumentAnalysis } from '../types';

interface FileUploadProps {
  onFileUpload: (file: UploadedFile) => Promise<void>;
  onFileAnalysis: (file: UploadedFile) => Promise<ImageAnalysis | DocumentAnalysis>;
  isLoading: boolean;
  maxSize?: number; // in MB
  allowedTypes?: string[];
}

const DEFAULT_MAX_SIZE = 20 * 1024 * 1024; // 20MB
const DEFAULT_ALLOWED_TYPES = [
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

export function FileUpload({ 
  onFileUpload, 
  onFileAnalysis, 
  isLoading, 
  maxSize = DEFAULT_MAX_SIZE,
  allowedTypes = DEFAULT_ALLOWED_TYPES 
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [analysisResults, setAnalysisResults] = useState<Map<string, ImageAnalysis | DocumentAnalysis>>(new Map());
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    console.log('Processing files:', files.length);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log('Processing file:', file.name, file.type, file.size);
      
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        console.error('File type not supported:', file.type);
        alert(`File type ${file.type} is not supported. Please upload: ${allowedTypes.join(', ')}`);
        continue;
      }

      // Validate file size
      if (file.size > maxSize) {
        console.error('File too large:', file.size, '>', maxSize);
        alert(`File ${file.name} is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
        continue;
      }

      const uploadedFile: UploadedFile = {
        id: Date.now().toString() + i,
        name: file.name,
        type: file.type,
        size: file.size,
        content: await file.arrayBuffer()
      };

      console.log('Created uploaded file object:', uploadedFile.id, uploadedFile.name);
      setUploadedFiles(prev => [...prev, uploadedFile]);
      
      try {
        console.log('Starting file upload...');
        await onFileUpload(uploadedFile);
        console.log('File upload completed, starting analysis...');
        const analysis = await onFileAnalysis(uploadedFile);
        console.log('File analysis completed:', analysis);
        setAnalysisResults(prev => new Map(prev.set(uploadedFile.id, analysis)));
      } catch (error) {
        console.error('Error processing file:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        alert(`Error processing file ${file.name}: ${errorMessage}`);
      }
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    setAnalysisResults(prev => {
      const newMap = new Map(prev);
      newMap.delete(fileId);
      return newMap;
    });
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image;
    if (fileType === 'application/pdf') return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = (fileType: string) => fileType.startsWith('image/');
  const isPDF = (fileType: string) => fileType === 'application/pdf';

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-blue-400 bg-blue-400/10' 
            : 'border-gray-600 hover:border-gray-500'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-300 mb-2">
          Drag and drop files here, or{' '}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-400 hover:text-blue-300 underline"
          >
            browse
          </button>
        </p>
        <p className="text-xs text-gray-500">
          Supported: Images (PNG, JPG, GIF, WEBP, BMP, TIFF, SVG), Documents (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX), 
          Programming (JS, CPP, PY, JAVA, PHP, GO, RS, SWIFT, TS, HTML, CSS, SQL), 
          Adobe (PSD), Archives (ZIP, RAR, 7Z), Text (TXT, CSV, JSON, XML, YAML, MD) (Max {maxSize / (1024 * 1024)}MB)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-300">Uploaded Files</h3>
          {uploadedFiles.map((file) => {
            const Icon = getFileIcon(file.type);
            const analysis = analysisResults.get(file.id);
            
            return (
              <div key={file.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-sm font-medium text-white">{file.name}</p>
                      <p className="text-xs text-gray-400">
                        {formatFileSize(file.size)} • {file.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {analysis && (
                      <div title="Analyzed">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      </div>
                    )}
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* File Preview */}
                {isImage(file.type) && (
                  <div className="mb-3">
                    <img
                      src={URL.createObjectURL(new Blob([file.content]))}
                      alt={file.name}
                      className="max-w-full h-32 object-contain rounded border border-gray-600"
                    />
                  </div>
                )}

                {/* Analysis Results */}
                {analysis && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Eye className="w-4 h-4" />
                      <span className="font-medium">AI Analysis Results</span>
                    </div>
                    
                    {/* Image Analysis */}
                    {'description' in analysis && (
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-blue-400 font-medium">Description:</span>
                          <p className="text-gray-300 mt-1">{analysis.description}</p>
                        </div>
                        {analysis.objects.length > 0 && (
                          <div>
                            <span className="text-green-400 font-medium">Objects:</span>
                            <p className="text-gray-300 mt-1">{analysis.objects.join(', ')}</p>
                          </div>
                        )}
                        {analysis.text.length > 0 && (
                          <div>
                            <span className="text-yellow-400 font-medium">Extracted Text:</span>
                            <p className="text-gray-300 mt-1">{analysis.text.join(' ')}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Document Analysis */}
                    {'extractedText' in analysis && (
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-purple-400 font-medium">Extracted Text:</span>
                          <p className="text-gray-300 mt-1 max-h-20 overflow-y-auto">
                            {analysis.extractedText.substring(0, 200)}...
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Problem Statement Detection */}
                    {(analysis.problemStatement || analysis.constraints || analysis.inputFormat) && (
                      <div className="bg-gray-900 rounded p-3 border border-gray-600">
                        <h4 className="text-sm font-medium text-green-400 mb-2">DSA Problem Detected!</h4>
                        {analysis.problemStatement && (
                          <div className="mb-2">
                            <span className="text-xs text-gray-400">Problem:</span>
                            <p className="text-sm text-gray-300">{analysis.problemStatement}</p>
                          </div>
                        )}
                        {analysis.constraints && analysis.constraints.length > 0 && (
                          <div className="mb-2">
                            <span className="text-xs text-gray-400">Constraints:</span>
                            <ul className="text-sm text-gray-300 list-disc list-inside">
                              {analysis.constraints.map((constraint, idx) => (
                                <li key={idx}>{constraint}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {analysis.inputFormat && (
                          <div>
                            <span className="text-xs text-gray-400">Input Format:</span>
                            <p className="text-sm text-gray-300">{analysis.inputFormat}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Loading State */}
                {!analysis && isLoading && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                    Analyzing file...
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 