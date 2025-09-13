"use client"
import React, { useState, useRef } from 'react';
import { Upload, FileText, Brain, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { preFillQuestions, PreFillResponse, PreFillAnswer } from '@/lib/prefill-api';

interface DocumentUploadWithPreFillProps {
  onPreFillComplete: (preFillData: PreFillResponse) => void;
  onPreFillError: (error: string) => void;
  token: string;
  disabled?: boolean;
}

export default function DocumentUploadWithPreFill({
  onPreFillComplete,
  onPreFillError,
  token,
  disabled = false
}: DocumentUploadWithPreFillProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preFillResults, setPreFillResults] = useState<PreFillResponse | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'image/jpeg',
        'image/png',
        'image/tiff',
        'text/plain'
      ];
      
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }
      
      if (!allowedTypes.includes(file.type)) {
        alert(`File ${file.name} has an unsupported format. Supported formats: PDF, Word, Images, Text.`);
        return false;
      }
      
      return true;
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handlePreFill = async () => {
    if (uploadedFiles.length === 0) {
      onPreFillError('Please upload at least one document before pre-filling questions.');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await preFillQuestions(uploadedFiles, token);
      setPreFillResults(result);
      onPreFillComplete(result);
    } catch (error) {
      console.error('Pre-fill error:', error);
      onPreFillError(error instanceof Error ? error.message : 'Failed to pre-fill questions');
    } finally {
      setIsProcessing(false);
    }
  };

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
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') return '📄';
    if (file.type.includes('word')) return '📝';
    if (file.type.includes('image')) return '🖼️';
    return '📄';
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          dragActive 
            ? "border-cyan-400 bg-cyan-400/10" 
            : "border-cyan-400/30 hover:border-cyan-400/50"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.tiff,.txt"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={disabled}
        />
        
        <div className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center">
            <Upload className="h-8 w-8 text-cyan-400" />
          </div>
          <div>
            <p className="text-xl font-medium text-white mb-2">
              Upload your CV and supporting documents
            </p>
            <p className="text-cyan-300/80 mb-4">
              Drag and drop files here or click to browse
            </p>
            <p className="text-sm text-cyan-300/60">
              Supported formats: PDF, Word, Images (JPG, PNG, TIFF), Text files
            </p>
            <p className="text-sm text-cyan-300/60">
              Maximum file size: 5MB per file
            </p>
          </div>
        </div>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-cyan-100">Uploaded Documents</h3>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-cyan-400/10 border border-cyan-400/20 rounded-lg">
                <div className="text-2xl">{getFileIcon(file)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-cyan-100 truncate">{file.name}</p>
                  <p className="text-xs text-cyan-300/80">{formatFileSize(file.size)}</p>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-2 hover:bg-red-400/10 rounded-full transition-colors duration-300"
                  disabled={disabled}
                >
                  <X className="h-4 w-4 text-red-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pre-fill Button */}
      {uploadedFiles.length > 0 && (
        <div className="text-center">
          <button
            onClick={handlePreFill}
            disabled={isProcessing || disabled}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center gap-2 mx-auto"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Processing Documents...</span>
              </>
            ) : (
              <>
                <Brain className="h-5 w-5" />
                <span>Pre-fill Questions with AI</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Pre-fill Results */}
      {preFillResults && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Pre-fill Processing Complete!</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-400/10 border border-green-400/30 rounded-lg">
              <div className="text-2xl font-bold text-green-400">
                {preFillResults.metadata?.autoFillCount || 0}
              </div>
              <div className="text-sm text-green-300">Auto-filled Questions</div>
            </div>
            
            <div className="p-4 bg-purple-400/10 border border-purple-400/30 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">
                {preFillResults.metadata?.aiSuggestionsCount || 0}
              </div>
              <div className="text-sm text-purple-300">AI Suggestions</div>
            </div>
            
            <div className="p-4 bg-orange-400/10 border border-orange-400/30 rounded-lg">
              <div className="text-2xl font-bold text-orange-400">
                {preFillResults.metadata?.noMatchCount || 0}
              </div>
              <div className="text-sm text-orange-300">Manual Input Required</div>
            </div>
          </div>

          {preFillResults.data?.summary && (
            <div className="p-4 bg-cyan-400/10 border border-cyan-400/30 rounded-lg">
              <h4 className="font-medium text-cyan-100 mb-2">Processing Summary</h4>
              <div className="text-sm text-cyan-300 space-y-1">
                <p>Auto-fill Success Rate: {preFillResults.data.summary.autoFillSuccessRate.toFixed(1)}%</p>
                <p>AI Suggestion Success Rate: {preFillResults.data.summary.aiSuggestionSuccessRate.toFixed(1)}%</p>
                <p>Total Questions Processed: {preFillResults.data.summary.totalQuestions}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
