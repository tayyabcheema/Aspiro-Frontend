"use client"
import { useState, useEffect } from "react"
import type React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import ProtectedRoute from "@/components/ProtectedRoute"
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card"
import { NeuroButton } from "@/components/ui/neuro-button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { 
  ArrowLeft, 
  ArrowRight, 
  Edit3, 
  CheckCircle, 
  X, 
  Upload, 
  FileText,
  Save,
  AlertCircle,
  Loader2,
  Eye,
  Check
} from "lucide-react"
import { OnboardingStep } from "@/lib/question-transformer"
import { saveUserResponses, UserResponse } from "@/lib/user-response-api"

interface PreviewQuestion extends OnboardingStep {
  answer: any
  files?: any[] // Changed from File[] to any[] to handle metadata
}

export default function PreviewPage() {
  const [questions, setQuestions] = useState<PreviewQuestion[]>([])
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const { user, getToken, updateUser } = useAuth()
  const router = useRouter()

  // Load questions and answers from localStorage
  useEffect(() => {
    const loadPreviewData = () => {
      try {
        console.log("Preview page loading...")
        
        const formData = JSON.parse(localStorage.getItem("onboardingFormData") || "{}")
        const uploadedFilesMetadata = JSON.parse(localStorage.getItem("onboardingUploadedFiles") || "{}")
        const onboardingSteps = JSON.parse(localStorage.getItem("onboardingSteps") || "[]")
        
        // Get actual File objects from global variable
        const actualFiles = (window as any).__onboardingFiles || {}
        
        console.log("Preview data loaded:", {
          formDataKeys: Object.keys(formData),
          uploadedFilesKeys: Object.keys(uploadedFilesMetadata),
          actualFilesKeys: Object.keys(actualFiles),
          stepsCount: onboardingSteps.length
        })
        
        const previewQuestions: PreviewQuestion[] = onboardingSteps.map((step: OnboardingStep) => {
          let answer = formData[step.id] || null
          
          // Use actual File objects if available, otherwise fall back to metadata
          const files = actualFiles[step.id] || uploadedFilesMetadata[step.id] || []
          
          return {
            ...step,
            answer,
            files: files
          }
        })
        
        setQuestions(previewQuestions)
        setIsLoading(false)
        console.log("Preview page loaded successfully")
      } catch (error) {
        console.error("Error loading preview data:", error)
        setSubmitError("Failed to load preview data")
        setIsLoading(false)
      }
    }

    loadPreviewData()
  }, [])

  const handleEdit = (questionId: string) => {
    setEditingQuestionId(questionId)
  }

  const handleSaveEdit = (questionId: string) => {
    setEditingQuestionId(null)
    // Update localStorage with the edited data
    const updatedFormData = JSON.parse(localStorage.getItem("onboardingFormData") || "{}")
    const updatedUploadedFiles = JSON.parse(localStorage.getItem("onboardingUploadedFiles") || "{}")
    
    const question = questions.find(q => q.id === questionId)
    if (question) {
      updatedFormData[questionId] = question.answer
      updatedUploadedFiles[questionId] = question.files || []
      
      localStorage.setItem("onboardingFormData", JSON.stringify(updatedFormData))
      localStorage.setItem("onboardingUploadedFiles", JSON.stringify(updatedUploadedFiles))
    }
  }

  const handleCancelEdit = () => {
    setEditingQuestionId(null)
    // Reload data from localStorage to discard changes
    const formData = JSON.parse(localStorage.getItem("onboardingFormData") || "{}")
    const uploadedFiles = JSON.parse(localStorage.getItem("onboardingUploadedFiles") || "{}")
    
    setQuestions(prev => prev.map(q => ({
      ...q,
      answer: formData[q.id] || null,
      files: uploadedFiles[q.id] || []
    })))
  }

  const handleAnswerChange = (questionId: string, value: any) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, answer: value } : q
    ))
  }

  const handleFileChange = (questionId: string, files: File[]) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, files } : q
    ))
  }

  const formatAnswer = (question: PreviewQuestion): string => {
    if (question.files && question.files.length > 0) {
      return `${question.files.length} file(s) uploaded: ${question.files.map(f => f.name).join(", ")}`
    }
    
    switch (question.type) {
      case "text":
      case "textarea":
      case "link":
        return question.answer || "No answer provided"
      case "select":
        return question.answer || "No selection made"
      case "multiselect":
        return Array.isArray(question.answer) ? question.answer.join(", ") : "No selections made"
      case "yesno":
        return question.answer === true ? "Yes" : question.answer === false ? "No" : "No answer provided"
      default:
        return "No answer provided"
    }
  }

  const prepareUserResponses = (): UserResponse[] => {
    const responses: UserResponse[] = []
    
    console.log("Preparing user responses for", questions.length, "questions")
    
    questions.forEach(question => {
      let response: UserResponse = {
        questionId: question.id
      }
      
      console.log(`Processing question "${question.title}":`, {
        type: question.type,
        options: question.options,
        answer: question.answer,
        answerType: typeof question.answer,
        isYesNo: question.options?.length === 2 && 
                 question.options.includes("Yes") && 
                 question.options.includes("No"),
        isLink: question.title.toLowerCase().includes('link') || 
                question.title.toLowerCase().includes('github') ||
                question.title.toLowerCase().includes('portfolio') ||
                question.title.toLowerCase().includes('linkedin')
      })
      
      // Map answer based on question type
      switch (question.type) {
        case 'text':
        case 'textarea':
          // Check if this is a link question
          if (question.title.toLowerCase().includes('link') || 
              question.title.toLowerCase().includes('github') ||
              question.title.toLowerCase().includes('portfolio') ||
              question.title.toLowerCase().includes('linkedin')) {
            // This is a link question - use answerLink
            if (question.answer) {
              response.answerLink = question.answer
            }
          } else {
            // Regular text question - use answerText
            if (question.answer) {
              response.answerText = question.answer
            }
          }
          break
          
        case 'select':
          // All select questions (including yes/no) use answerChoice
          if (question.answer) {
            response.answerChoice = question.answer
          }
          break
          
        case 'multiselect':
          if (question.answer && Array.isArray(question.answer)) {
            response.answerChoice = question.answer.join(', ')
          }
          break
          
        case 'yesno':
          // Yes/no questions now use answerChoice
          if (question.answer) {
            response.answerChoice = question.answer
          }
          break
          
        case 'link':
          if (question.answer) {
            response.answerLink = question.answer
          }
          break
          
        case 'file':
          if (question.files && question.files.length > 0) {
            response.files = question.files.map(file => ({
              file: file.name || 'unknown', // Handle both File objects and metadata
              type: question.title.toLowerCase().includes('cv') ? 'cv' :
                   question.title.toLowerCase().includes('cover') ? 'cover-letter' :
                   question.title.toLowerCase().includes('transcript') ? 'transcript' :
                   question.title.toLowerCase().includes('certificate') ? 'certificate' : 'document'
            }))
          }
          break
      }
      
      console.log(`Response for "${question.title}":`, {
        questionId: response.questionId,
        answerText: response.answerText,
        answerChoice: response.answerChoice,
        answerLink: response.answerLink,
        files: response.files
      })
      
      // Only add response if it has an answer
      if (response.answerText || response.answerChoice || 
          response.answerLink || response.files) {
        responses.push(response)
      }
    })
    
    console.log("Final responses array:", responses)
    return responses
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setSubmitError(null)
      
      const token = getToken()
      if (!token) {
        throw new Error('No authentication token found')
      }
      
      // Prepare responses
      const responses = prepareUserResponses()
      
      // Collect all files - handle both File objects and metadata
      const allFiles: File[] = []
      questions.forEach(q => {
        if (q.files) {
          q.files.forEach(file => {
            // Check if it's a File object or metadata
            if (file instanceof File) {
              allFiles.push(file)
            } else if (file.name) {
              // This is metadata, we can't reconstruct the File object
              // The backend will handle this based on the file metadata in responses
              console.warn(`File "${file.name}" is metadata, not a File object. This may cause upload issues.`)
            }
          })
        }
      })
      
      console.log('Submitting responses:', {
        responsesCount: responses.length,
        filesCount: allFiles.length,
        filesWithMetadata: questions.filter(q => q.files && q.files.some(f => !(f instanceof File))).length
      })
      
      // Save to backend
      const result = await saveUserResponses(responses, allFiles, token)
      
      if (result.success) {
        console.log('Responses saved successfully:', result)
        
        // Update user progress
        updateUser({ 
          ...user, 
          hasCompletedOnboarding: true
        })
        
        // Clear global file storage
        delete (window as any).__onboardingFiles
        
        // Add a small delay to ensure user state is updated before redirect
        setTimeout(() => {
          // Clear onboarding data after a brief delay
          localStorage.removeItem("onboardingFormData")
          localStorage.removeItem("onboardingUploadedFiles")
          localStorage.removeItem("onboardingSteps")
          
          // Redirect to analyzing page
          router.push('/analyzing')
        }, 100)
      } else {
        throw new Error(result.message || 'Failed to save responses')
      }
      
    } catch (error) {
      console.error('Error submitting responses:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit responses')
    } finally {
      setIsSubmitting(false)
      setShowConfirmDialog(false)
    }
  }

  const renderAnswerInput = (question: PreviewQuestion) => {
    if (editingQuestionId !== question.id) {
      return (
        <div className="text-cyan-100">
          {formatAnswer(question)}
        </div>
      )
    }

    switch (question.type) {
      case "text":
        return (
          <Input
            type="text"
            value={question.answer || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="glass-card border-cyan-400/30 focus:border-cyan-400/60 bg-[#0e2439]/50 text-cyan-100"
          />
        )
      
      case "textarea":
        return (
          <Textarea
            value={question.answer || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="glass-card border-cyan-400/30 focus:border-cyan-400/60 bg-[#0e2439]/50 text-cyan-100"
            rows={3}
          />
        )
      
      case "select":
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswerChange(question.id, option)}
                className={`w-full p-3 text-left rounded-lg border transition-all ${
                  question.answer === option
                    ? "border-cyan-400 bg-cyan-400/10 text-cyan-100"
                    : "border-cyan-400/30 text-cyan-300 hover:border-cyan-400/50"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )
      
      case "multiselect":
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  checked={Array.isArray(question.answer) && question.answer.includes(option)}
                  onCheckedChange={(checked) => {
                    const currentAnswers = Array.isArray(question.answer) ? question.answer : []
                    if (checked) {
                      handleAnswerChange(question.id, [...currentAnswers, option])
                    } else {
                      handleAnswerChange(question.id, currentAnswers.filter(a => a !== option))
                    }
                  }}
                />
                <Label className="text-cyan-100">{option}</Label>
              </div>
            ))}
          </div>
        )
      
      case "yesno":
        return (
          <div className="flex space-x-4">
            <button
              onClick={() => handleAnswerChange(question.id, true)}
              className={`px-4 py-2 rounded-lg border transition-all ${
                question.answer === true
                  ? "border-green-400 bg-green-400/10 text-green-100"
                  : "border-cyan-400/30 text-cyan-300 hover:border-cyan-400/50"
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => handleAnswerChange(question.id, false)}
              className={`px-4 py-2 rounded-lg border transition-all ${
                question.answer === false
                  ? "border-red-400 bg-red-400/10 text-red-100"
                  : "border-cyan-400/30 text-cyan-300 hover:border-cyan-400/50"
              }`}
            >
              No
            </button>
          </div>
        )
      
      case "link":
        return (
          <Input
            type="url"
            value={question.answer || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter URL"
            className="glass-card border-cyan-400/30 focus:border-cyan-400/60 bg-[#0e2439]/50 text-cyan-100"
          />
        )
      
      case "file":
        return (
          <div className="space-y-3">
            {question.files?.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-cyan-400/10 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-cyan-400" />
                  <span className="text-cyan-100">{file.name}</span>
                </div>
                <button
                  onClick={() => {
                    const newFiles = question.files?.filter((_, i) => i !== index) || []
                    handleFileChange(question.id, newFiles)
                  }}
                  className="text-red-400 hover:text-red-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <input
              type="file"
              accept={question.fileTypes?.join(",")}
              multiple={Boolean(question.maxFiles && question.maxFiles > 1)}
              onChange={(e) => {
                if (e.target.files) {
                  const newFiles = Array.from(e.target.files)
                  const existingFiles = question.files || []
                  const allFiles = [...existingFiles, ...newFiles]
                  
                  // Check max files limit
                  const maxFiles = question.maxFiles || 5
                  if (allFiles.length > maxFiles) {
                    alert(`Maximum ${maxFiles} files allowed`)
                    return
                  }
                  
                  handleFileChange(question.id, allFiles)
                }
              }}
              className="hidden"
              id={`file-input-${question.id}`}
            />
            <label
              htmlFor={`file-input-${question.id}`}
              className="flex items-center justify-center p-3 border-2 border-dashed border-cyan-400/30 rounded-lg cursor-pointer hover:border-cyan-400/50 transition-all"
            >
              <Upload className="h-5 w-5 text-cyan-400 mr-2" />
              <span className="text-cyan-100">Add Files</span>
            </label>
          </div>
        )
      
      default:
        return <div className="text-cyan-300">No editor available</div>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0e2439] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-cyan-100">Loading preview...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen bg-[#0e2439] py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-cyan-100 mb-2">Review Your Answers</h1>
            <p className="text-cyan-300">Please review and edit your responses before submitting</p>
          </div>

          {/* Questions List */}
          <div className="space-y-6">
            {questions.map((question, index) => (
              <GlassCard key={question.id} className="border-cyan-400/20">
                <GlassCardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <GlassCardTitle className="text-cyan-100 text-lg">
                        {index + 1}. {question.title}
                      </GlassCardTitle>
                      {question.subtitle && (
                        <p className="text-cyan-300/80 text-sm mt-1">{question.subtitle}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {editingQuestionId === question.id ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(question.id)}
                            className="p-2 text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded-lg transition-all"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEdit(question.id)}
                          className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 rounded-lg transition-all"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </GlassCardHeader>
                <GlassCardContent>
                  {renderAnswerInput(question)}
                </GlassCardContent>
              </GlassCard>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-cyan-300 hover:text-cyan-100 hover:bg-cyan-400/10 transition-all duration-300 px-4 py-2 rounded-md"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Edit
            </button>

            <NeuroButton
              onClick={() => setShowConfirmDialog(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold px-8 py-3"
            >
              <Save className="h-5 w-5 mr-2" />
              Submit Responses
            </NeuroButton>
          </div>

          {/* Error Display */}
          {submitError && (
            <div className="fixed top-4 right-4 z-50 bg-red-500/90 backdrop-blur-sm text-white p-4 rounded-lg shadow-lg max-w-md">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-200" />
                <div>
                  <p className="font-semibold">Submission Failed</p>
                  <p className="text-sm text-red-100">{submitError}</p>
                </div>
                <button 
                  onClick={() => setSubmitError(null)}
                  className="ml-auto p-1 hover:bg-red-400/20 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Confirmation Dialog */}
          {showConfirmDialog && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <GlassCard className="max-w-md w-full border-cyan-400/20">
                <GlassCardHeader>
                  <GlassCardTitle className="text-cyan-100 text-center">Confirm Submission</GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent className="space-y-4">
                  <p className="text-cyan-300 text-center">
                    Are you sure you want to submit your responses? This action cannot be undone.
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowConfirmDialog(false)}
                      className="flex-1 px-4 py-2 text-cyan-300 hover:text-cyan-100 hover:bg-cyan-400/10 transition-all duration-300 rounded-md border border-cyan-400/30"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-md transition-all duration-300 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        "Confirm & Submit"
                      )}
                    </button>
                  </div>
                </GlassCardContent>
              </GlassCard>
            </div>
          )}

          {/* Loading Overlay */}
          {isSubmitting && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <GlassCard className="max-w-sm w-full border-cyan-400/20">
                <GlassCardContent className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mx-auto mb-4" />
                  <h3 className="text-cyan-100 font-semibold mb-2">Saving Your Responses</h3>
                  <p className="text-cyan-300 text-sm">
                    Please wait while we process and save your data...
                  </p>
                </GlassCardContent>
              </GlassCard>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
