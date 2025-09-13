"use client"

import React, { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { uploadCV, getCVSuggestions, CVUploadResponse } from "@/lib/cv-api"
import { Brain, Upload, CheckCircle, Loader2, X } from "lucide-react"

export default function CVTestPage() {
  const { getToken } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<CVUploadResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [existingSuggestions, setExistingSuggestions] = useState<any>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const token = getToken()
    if (!token) {
      setError("No authentication token found")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const result = await uploadCV(file, token)
      setUploadResult(result)
      console.log("CV upload result:", result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  const loadExistingSuggestions = async () => {
    const token = getToken()
    if (!token) return

    try {
      const suggestions = await getCVSuggestions(token)
      setExistingSuggestions(suggestions)
      console.log("Existing suggestions:", suggestions)
    } catch (err) {
      console.error("Failed to load suggestions:", err)
    }
  }

  return (
    <div className="min-h-screen bg-[#0e2439] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">CV Upload Test</h1>
          <p className="text-cyan-300">Test the CV upload and AI suggestion functionality</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-[#0e2439]/60 border border-cyan-400/30 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Upload className="h-5 w-5 text-cyan-400" />
              Upload CV
            </h2>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-cyan-400/50 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.rtf,image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-2">
                  <Upload className="h-8 w-8 text-cyan-400 mx-auto" />
                  <p className="text-sm text-cyan-100">Click to upload CV</p>
                  <p className="text-xs text-cyan-300/60">PDF, DOC, DOCX, TXT, RTF, or images</p>
                </div>
              </div>

              {isUploading && (
                <div className="flex items-center gap-2 text-cyan-300">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Processing CV...</span>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-[#0e2439]/60 border border-cyan-400/30 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-400" />
              Results
            </h2>

            {uploadResult && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-cyan-400/10 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-cyan-100">
                      {Object.keys(uploadResult.data.autoFilled).length}
                    </div>
                    <div className="text-sm text-cyan-300">Auto-filled</div>
                  </div>
                  <div className="bg-blue-400/10 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-100">
                      {Object.keys(uploadResult.data.aiSuggestions).length}
                    </div>
                    <div className="text-sm text-blue-300">AI Suggestions</div>
                  </div>
                </div>

                {/* Auto-filled answers */}
                {Object.keys(uploadResult.data.autoFilled).length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-cyan-100 mb-2">Auto-filled Answers:</h3>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {Object.entries(uploadResult.data.autoFilled).map(([questionId, answer]) => (
                        <div key={questionId} className="text-xs bg-cyan-400/10 rounded p-2">
                          <div className="font-medium text-cyan-200">Q: {questionId}</div>
                          <div className="text-cyan-300">{answer}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI suggestions */}
                {Object.keys(uploadResult.data.aiSuggestions).length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-blue-100 mb-2">AI Suggestions:</h3>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {Object.entries(uploadResult.data.aiSuggestions).map(([questionId, suggestions]) => (
                        <div key={questionId} className="text-xs bg-blue-400/10 rounded p-2">
                          <div className="font-medium text-blue-200">Q: {questionId}</div>
                          <div className="text-blue-300">
                            {Array.isArray(suggestions) ? suggestions.join(", ") : suggestions}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extracted data */}
                <div>
                  <h3 className="text-sm font-medium text-white mb-2">Extracted Data:</h3>
                  <div className="text-xs bg-gray-400/10 rounded p-2 max-h-32 overflow-y-auto">
                    <pre className="text-gray-300 whitespace-pre-wrap">
                      {JSON.stringify(uploadResult.data.extractedData, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {!uploadResult && (
              <div className="text-center text-cyan-300/60 py-8">
                Upload a CV to see results
              </div>
            )}
          </div>
        </div>

        {/* Existing Suggestions */}
        <div className="mt-8 bg-[#0e2439]/60 border border-cyan-400/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              Existing CV Suggestions
            </h2>
            <button
              onClick={loadExistingSuggestions}
              className="px-4 py-2 bg-cyan-400/20 text-cyan-300 rounded-lg hover:bg-cyan-400/30 transition-colors"
            >
              Load Existing
            </button>
          </div>

          {existingSuggestions && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-cyan-400/10 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-cyan-100">
                    {Object.keys(existingSuggestions.data.autoFilled).length}
                  </div>
                  <div className="text-sm text-cyan-300">Auto-filled</div>
                </div>
                <div className="bg-blue-400/10 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-100">
                    {Object.keys(existingSuggestions.data.aiSuggestions).length}
                  </div>
                  <div className="text-sm text-blue-300">AI Suggestions</div>
                </div>
              </div>

              <div className="text-xs bg-gray-400/10 rounded p-2 max-h-40 overflow-y-auto">
                <pre className="text-gray-300 whitespace-pre-wrap">
                  {JSON.stringify(existingSuggestions.data, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {!existingSuggestions && (
            <div className="text-center text-cyan-300/60 py-4">
              Click "Load Existing" to see previously uploaded CV suggestions
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
