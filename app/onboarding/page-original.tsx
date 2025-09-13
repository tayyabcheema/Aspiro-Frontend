"use client"
import { useEffect, useState } from "react"
import type React from "react"

import { GlassCard, GlassCardContent } from "@/components/ui/glass-card"
import { NeuroButton } from "@/components/ui/neuro-button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { 
  ArrowRight, 
  ArrowLeft, 
  GraduationCap, 
  Target, 
  Zap, 
  BookOpen, 
  Clock, 
  Briefcase, 
  Heart, 
  Users, 
  Upload,
  CheckCircle,
  Brain,
  X,
  Loader2
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import AuthGuard from "../../components/AuthGuard"
import { useIsMobile } from "@/hooks/use-mobile"
import { fetchQuestions } from "@/lib/questions-api"
import { transformQuestionsToSteps, OnboardingStep } from "@/lib/question-transformer"
import { saveUserResponses, UserResponse } from "@/lib/user-response-api"
import { uploadCV, getCVSuggestions, CVUploadResponse } from "@/lib/cv-api"


export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [isAnimating, setIsAnimating] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File[]>>({})
  const [onboardingSteps, setOnboardingSteps] = useState<OnboardingStep[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [cvUploaded, setCvUploaded] = useState(false)
  const [cvSuggestions, setCvSuggestions] = useState<{
    autoFilled: Record<string, string>;
    aiSuggestions: Record<string, string[]>;
  }>({ autoFilled: {}, aiSuggestions: {} })
  const [isUploadingCV, setIsUploadingCV] = useState(false)
  const [cvUploadError, setCvUploadError] = useState<string | null>(null)
  const { user, updateUser, getToken } = useAuth()
  const router = useRouter()
  const isMobile = useIsMobile()

  // Load existing CV suggestions
  useEffect(() => {
    const loadCVSuggestions = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const suggestions = await getCVSuggestions(token);
        setCvSuggestions(suggestions.data);
        if (Object.keys(suggestions.data.autoFilled).length > 0 || Object.keys(suggestions.data.aiSuggestions).length > 0) {
          setCvUploaded(true);
        }
      } catch (err) {
        console.error("Failed to load CV suggestions:", err);
        // Don't show error for this, it's optional
      }
    };

    if (user) {
      loadCVSuggestions();
    }
  }, [user, getToken]);

  // Apply auto-filled data when questions are loaded
  useEffect(() => {
    if (onboardingSteps.length > 0 && Object.keys(cvSuggestions.autoFilled).length > 0) {
      const newFormData = { ...formData };
      Object.entries(cvSuggestions.autoFilled).forEach(([questionId, answer]) => {
        // Find the step that corresponds to this question ID
        const step = onboardingSteps.find(s => s.id === questionId);
        if (step && !newFormData[questionId]) {
          newFormData[questionId] = answer;
        }
      });
      setFormData(newFormData);
    }
  }, [onboardingSteps, cvSuggestions.autoFilled]);

  // Fetch questions from backend
  useEffect(() => {
    const loadQuestions = async () => {
      // Get token using the auth context method
      const token = getToken();
      
      if (!token) {
        setError("No authentication token found");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const questions = await fetchQuestions(token);
        const steps = transformQuestionsToSteps(questions);
        setOnboardingSteps(steps);
      } catch (err) {
        console.error("Failed to load questions:", err);
        setError(err instanceof Error ? err.message : "Failed to load questions");
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, [user]); // Depend on user instead of user.token

  // Auto-redirect to preview when completion step is reached
  useEffect(() => {
    if (onboardingSteps.length > 0 && currentStep < onboardingSteps.length && onboardingSteps[currentStep]?.type === "completion") {
      console.log("Completion step reached, redirecting to preview in 2 seconds...")
      const timer = setTimeout(() => {
        handleGoToPreview()
      }, 2000) // 2 second delay to show the completion screen
      
      return () => clearTimeout(timer)
    }
  }, [onboardingSteps.length, currentStep])

  // If onboarding already completed (for users) or role is admin, redirect appropriately
  useEffect(() => {
    if (!user) return
    if (user.role === 'admin') {
      router.replace('/admin')
      return
    }
    const hasOnboarded = user.hasCompletedOnboarding || (typeof window !== 'undefined' && (!!localStorage.getItem('onboardingData') || !!sessionStorage.getItem('onboardingData')))
    if (hasOnboarded) {
      router.replace('/dashboard')
    }
  }, [user, router])

  // Show loading state
  if (isLoading) {
    return (
      <div>
        <div className="min-h-screen bg-[#0e2439] flex items-center justify-center">
          <div className="text-center space-y-6">
            <Loader2 className="h-12 w-12 text-cyan-400 animate-spin mx-auto" />
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-cyan-100">Loading Questions</h2>
              <p className="text-cyan-300/80">Please wait while we prepare your onboarding experience...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div>
        <div className="min-h-screen bg-[#0e2439] flex items-center justify-center">
          <div className="text-center space-y-6 max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <X className="h-8 w-8 text-red-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-red-100">Failed to Load Questions</h2>
              <p className="text-red-300/80">{error}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-lg transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if no steps loaded yet
  if (onboardingSteps.length === 0) {
    return null;
  }

  const progress = ((currentStep + 1) / onboardingSteps.length) * 100

  const handleNext = async () => {
    const step = onboardingSteps[currentStep]
    
        console.log("HandleNext called:", {
          currentStep: currentStep,
          totalSteps: onboardingSteps.length,
          isLastRegularStep: currentStep === onboardingSteps.length - 2,
          stepTitle: step?.title,
          isValid: isValid
        })
    
    // Check if current step is valid
    if (!isValid) {
      console.log("Step is not valid, not proceeding")
      return
    }

        if (currentStep < onboardingSteps.length - 2) {
          console.log("Moving to next step:", currentStep + 1)
          setIsAnimating(true)
          setTimeout(() => {
            setCurrentStep(currentStep + 1)
            setIsAnimating(false)
          }, 150)
        } else {
          console.log("Last regular question reached, starting preview flow")
          // Last regular question (step 33) - save data and redirect to preview
          await handleGoToPreview()
        }
  }

  const handleGoToPreview = async () => {
    try {
      console.log("Starting preview flow...")
      
      // Save current data to localStorage for preview
      localStorage.setItem("onboardingFormData", JSON.stringify(formData))
      localStorage.setItem("onboardingSteps", JSON.stringify(onboardingSteps))
      
      // Convert File objects to metadata for localStorage storage
      const fileMetadata: Record<string, any[]> = {}
      Object.keys(uploadedFiles).forEach(stepId => {
        fileMetadata[stepId] = uploadedFiles[stepId].map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        }))
      })
      localStorage.setItem("onboardingUploadedFiles", JSON.stringify(fileMetadata))
      
      // Store actual File objects in a global variable that the preview page can access
      // This is a workaround since File objects can't be serialized to localStorage
      ;(window as any).__onboardingFiles = uploadedFiles
      
      console.log("Data saved for preview:", {
        formDataKeys: Object.keys(formData),
        uploadedFilesKeys: Object.keys(uploadedFiles),
        stepsCount: onboardingSteps.length,
        currentStep: currentStep,
        totalSteps: onboardingSteps.length
      })
      
      // Redirect to preview page
      console.log("Redirecting to /onboarding/preview")
      router.push('/onboarding/preview')
    } catch (error) {
      console.error("Error preparing preview data:", error)
      setError("Failed to prepare preview data")
    }
  }

  const prepareUserResponses = (): UserResponse[] => {
    const responses: UserResponse[] = []
    
    onboardingSteps.forEach(step => {
      const stepData = formData[step.id]
      const files = uploadedFiles[step.id] || []
      
      let response: UserResponse = {
        questionId: step.id
      }
      
      // Map answer based on question type
      switch (step.type) {
        case 'text':
        case 'textarea':
          if (stepData) {
            response.answerText = stepData
          }
          break
          
        case 'select':
          if (stepData) {
            response.answerChoice = stepData
          }
          break
          
        case 'multiselect':
          if (stepData && Array.isArray(stepData)) {
            response.answerChoice = stepData.join(', ')
          }
          break
          
        case 'yesno':
          // Yes/no questions now use answerChoice
          if (stepData !== undefined) {
            response.answerChoice = stepData
          }
          break
          
        case 'link':
          if (stepData) {
            response.answerLink = stepData
          }
          break
          
        case 'file':
          if (files.length > 0) {
            response.files = files.map(file => ({
              file: file.name,
              type: step.title.toLowerCase().includes('cv') ? 'cv' :
                   step.title.toLowerCase().includes('cover') ? 'cover-letter' :
                   step.title.toLowerCase().includes('transcript') ? 'transcript' :
                   step.title.toLowerCase().includes('certificate') ? 'certificate' : 'document'
            }))
          }
          break
      }
      
      // Only add response if it has an answer
      if (response.answerText || response.answerChoice || 
          response.answerLink || response.files) {
        responses.push(response)
      }
    })
    
    return responses
  }

  const handleSaveResponses = async () => {
    try {
      setIsSaving(true)
      setSaveError(null)
      
      const token = getToken()
      if (!token) {
        throw new Error('No authentication token found')
      }
      
      // Prepare responses
      const responses = prepareUserResponses()
      
      // Collect all files
      const allFiles: File[] = []
      Object.values(uploadedFiles).forEach(files => {
        allFiles.push(...files)
      })
      
      console.log('Saving responses:', {
        responsesCount: responses.length,
        filesCount: allFiles.length,
        responses: responses.map(r => ({
          questionId: r.questionId,
          hasAnswer: !!(r.answerText || r.answerChoice || r.answerLink || r.files)
        }))
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
        
        // Redirect to analyzing page
        router.push('/analyzing')
      } else {
        throw new Error(result.message || 'Failed to save responses')
      }
      
    } catch (error) {
      console.error('Error saving responses:', error)
      setSaveError(error instanceof Error ? error.message : 'Failed to save responses')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentStep(currentStep - 1)
        setIsAnimating(false)
      }, 150)
    }
  }

  const handleInputChange = (value: string | string[] | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [onboardingSteps[currentStep].id]: value,
    }))
  }

  const handleSelectOption = (option: string) => {
    const step = onboardingSteps[currentStep]
    
    console.log("handleSelectOption called:", {
      option,
      stepType: step.type,
      stepOptions: step.options,
      isYesNo: step.options?.length === 2 && step.options.includes("Yes") && step.options.includes("No")
    })
    
    if (step.type === "multiselect") {
      const currentValues = (formData[step.id] as string[]) || []
      const newValues = currentValues.includes(option)
        ? currentValues.filter((v) => v !== option)
        : [...currentValues, option]
      handleInputChange(newValues)
    } else if (step.options?.length === 2 && 
               step.options.includes("Yes") && step.options.includes("No")) {
      // This is a yes/no question - store as string
      console.log("Yes/No question - storing as string:", { option })
      handleInputChange(option)
    } else {
      console.log("Regular select question - storing as string:", { option })
      handleInputChange(option)
    }
  }

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return
    
    const step = onboardingSteps[currentStep]
    const fileArray = Array.from(files)
    
    console.log(`File upload for step "${step.title}":`, {
      stepId: step.id,
      files: fileArray,
      fileNames: fileArray.map(f => f.name),
      fileSizes: fileArray.map(f => f.size)
    });
    
    setUploadedFiles(prev => ({
      ...prev,
      [step.id]: fileArray
    }))
  }

  const handleCVUpload = async (file: File) => {
    const token = getToken();
    if (!token) {
      setCvUploadError("No authentication token found");
      return;
    }

    setIsUploadingCV(true);
    setCvUploadError(null);

    try {
      const response = await uploadCV(file, token);
      
      // Update CV suggestions with new data
      setCvSuggestions({
        autoFilled: response.data.autoFilled,
        aiSuggestions: response.data.aiSuggestions
      });
      
      setCvUploaded(true);
      
      // Auto-fill form data with extracted answers
      const newFormData = { ...formData };
      Object.entries(response.data.autoFilled).forEach(([questionId, answer]) => {
        newFormData[questionId] = answer;
      });
      setFormData(newFormData);
      
      console.log("CV uploaded successfully:", {
        autoFilled: Object.keys(response.data.autoFilled).length,
        aiSuggestions: Object.keys(response.data.aiSuggestions).length,
        extractedData: response.data.extractedData
      });
      
    } catch (error) {
      console.error("CV upload failed:", error);
      setCvUploadError(error instanceof Error ? error.message : "Failed to upload CV");
    } finally {
      setIsUploadingCV(false);
    }
  }

  const removeFile = (stepId: string, index: number) => {
    setUploadedFiles(prev => ({
      ...prev,
      [stepId]: prev[stepId]?.filter((_, i) => i !== index) || []
    }))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const currentStepData = onboardingSteps[currentStep]
  const currentValue = formData[currentStepData.id]
  
  // Special validation for file uploads
  const isValid = !currentStepData.required || (() => {
    if (currentStepData.type === "file") {
      // For file uploads, check if files are uploaded
      const files = uploadedFiles[currentStepData.id]
      const hasFiles = files && files.length > 0
      
      // Debug logging for file validation
      console.log(`File validation for "${currentStepData.title}":`, {
        files: files,
        filesLength: files?.length || 0,
        hasFiles: hasFiles,
        required: currentStepData.required
      });
      
      return hasFiles
    }
    
    // For other question types, use existing validation
    return currentValue && (
      Array.isArray(currentValue) ? currentValue.length > 0 : 
      typeof currentValue === 'boolean' ? currentValue :
      currentValue.toString().trim().length > 0
    )
  })() || false
  
  // Debug logging for current step
  console.log("Current step info:", {
    currentStep: currentStep,
    totalSteps: onboardingSteps.length,
    isLastRegularStep: currentStep === onboardingSteps.length - 2,
    isCompletionStep: currentStep === onboardingSteps.length - 1,
    stepTitle: currentStepData?.title,
    stepType: currentStepData?.type,
    isValid: isValid
  })

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isValid && currentStepData.type !== "textarea") {
      handleNext()
    }
  }

  return (
    <div>
      <div className="min-h-screen bg-[#0e2439] flex flex-col relative overflow-hidden">
        {/* Animated background particles - reduced on mobile for performance */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse opacity-60"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-400 rounded-full animate-pulse opacity-40"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-cyan-300 rounded-full animate-pulse opacity-50"></div>
          {!isMobile && (
            <>
              <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-blue-300 rounded-full animate-pulse opacity-30"></div>
              <div className="absolute bottom-1/3 left-1/4 w-1 h-1 bg-cyan-500 rounded-full animate-pulse opacity-70"></div>
            </>
          )}
        </div>

        {/* Progress bar */}
        <div className="sticky top-0 z-10 p-4 sm:p-6 glass-card border-b border-cyan-400/20 backdrop-blur-xl bg-[#0e2439]/80">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs sm:text-sm text-cyan-300">
                Step {currentStep + 1} of {onboardingSteps.length}
              </span>
              <span className="text-xs sm:text-sm text-cyan-300">{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2 sm:h-2 bg-[#0e2439]/50">
              <div 
                className="h-2 bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </Progress>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-2xl">
            <div
              className={`transition-all duration-500 ease-out ${
                isAnimating ? "opacity-0 transform translate-y-8" : "opacity-100 transform translate-y-0"
              }`}
            >
              {currentStepData.type === "completion" ? (
                // Completion step - redirect to preview
                <div className="space-y-6 sm:space-y-8">
                  {/* Question */}
                  <div className="text-center">
                    <h1 className="text-2xl sm:text-3xl font-bold text-cyan-100 text-balance mb-3 sm:mb-4 tracking-wide px-2">
                      {currentStepData.title}
                    </h1>
                    {currentStepData.subtitle && (
                      <p className="text-base sm:text-lg text-cyan-300/80 text-pretty max-w-lg mx-auto px-4">
                        {currentStepData.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Completion content */}
                  <div className="text-center space-y-6 sm:space-y-8">
                    {/* Glowing Circle with Text */}
                    <div className="relative">
                      <div className="w-60 h-60 sm:w-80 sm:h-80 mx-auto relative">
                        {/* Glowing Outline Ring */}
                        <div className="absolute inset-0 rounded-full border-2 border-cyan-400 shadow-lg shadow-cyan-400/50 animate-pulse"></div>
                        
                        {/* Text */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center text-white px-4">
                            <div className="text-lg sm:text-xl font-semibold mb-2">Ready to</div>
                            <div className="text-lg sm:text-xl font-semibold">Review & Submit</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Auto-redirect to preview */}
                    <div className="text-center">
                      <p className="text-cyan-300/80 mb-4">Redirecting to preview...</p>
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Other steps with card wrapper
                <GlassCard className="neuro border-cyan-400/20 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl bg-[#0e2439]/80">
                  <GlassCardContent className="p-4 sm:p-6 lg:p-8">
                    {/* Step content */}
                    <div className="space-y-4 sm:space-y-6">
                      {/* Question */}
                      <div className="text-center">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-cyan-100 text-balance mb-3 sm:mb-4 tracking-wide px-2">
                          {currentStepData.title}
                        </h1>
                        {currentStepData.subtitle && (
                          <p className="text-sm sm:text-base lg:text-lg text-cyan-300/80 text-pretty max-w-lg mx-auto px-2">
                            {currentStepData.subtitle}
                          </p>
                        )}
                      </div>

                      {/* Answer options */}
                      {(currentStepData.type === "select" || currentStepData.type === "multiselect") && (
                        <div className="space-y-2 sm:space-y-3">
                          {/* AI Suggestions Section */}
                          {cvSuggestions.aiSuggestions[currentStepData.id] && cvSuggestions.aiSuggestions[currentStepData.id].length > 0 && (
                            <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-blue-400/10 to-purple-500/10 border border-blue-400/30">
                              <div className="flex items-center gap-2 mb-2">
                                <Brain className="h-4 w-4 text-blue-400" />
                                <span className="text-sm font-medium text-blue-100">AI Suggestions</span>
                              </div>
                              <p className="text-xs text-blue-300/80 mb-3">Based on your CV analysis</p>
                              <div className="space-y-2">
                                {cvSuggestions.aiSuggestions[currentStepData.id].map((suggestion, index) => {
                                  const isSelected = currentValue === suggestion;
                                  return (
                                    <button
                                      key={`ai-${index}`}
                                      onClick={() => handleInputChange(suggestion)}
                                      className={`w-full text-left p-2 rounded-lg transition-all duration-300 border ${
                                        isSelected 
                                          ? "border-blue-400 bg-blue-400/20 text-blue-100" 
                                          : "border-blue-400/30 hover:border-blue-400/50 text-blue-200 hover:bg-blue-400/10"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm">{suggestion}</span>
                                        {isSelected && (
                                          <CheckCircle className="h-4 w-4 text-blue-400" />
                                        )}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          
                          {/* Debug logging for select options */}
                          {console.log(`Rendering ${currentStepData.type} question:`, {
                            title: currentStepData.title,
                            options: currentStepData.options,
                            optionsLength: currentStepData.options?.length
                          })}
                          {currentStepData.options?.map((option) => {
                            let isSelected = false
                            
                            if (currentStepData.type === "multiselect") {
                              isSelected = (currentValue as string[])?.includes(option)
                            } else if (currentStepData.options?.length === 2 && 
                                       currentStepData.options.includes("Yes") && 
                                       currentStepData.options.includes("No")) {
                              // This is a yes/no question - compare string with option
                              isSelected = currentValue === option
                            } else {
                              // Regular select question
                              isSelected = currentValue === option
                            }
                            
                            // Debug logging for selection state
                            console.log(`Option "${option}" selection state:`, {
                              currentValue,
                              currentValueType: typeof currentValue,
                              isSelected,
                              isYesNo: currentStepData.options?.length === 2 && 
                                       currentStepData.options.includes("Yes") && 
                                       currentStepData.options.includes("No")
                            })
                            
                            return (
                              <button
                                key={option}
                                onClick={() => handleSelectOption(option)}
                                className={`w-full glass-card p-3 sm:p-4 text-left transition-all duration-300 hover:bg-cyan-400/5 border rounded-xl bg-[#0e2439]/50 ${
                                  isSelected 
                                    ? "border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-400/20" 
                                    : "border-cyan-400/30 hover:border-cyan-400/50"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm sm:text-base lg:text-lg text-cyan-100 font-medium pr-2">{option}</span>
                                  {isSelected && (
                                    <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-cyan-400 flex items-center justify-center flex-shrink-0">
                                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                                    </div>
                                  )}
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      )}

                      {currentStepData.type === "text" && (
                        <div>
                          <Input
                            type="text"
                            placeholder={currentStepData.placeholder}
                            value={(currentValue as string) || ""}
                            onChange={(e) => handleInputChange(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="glass-card border-cyan-400/30 focus:border-cyan-400/60 bg-[#0e2439]/50 text-cyan-100 placeholder-cyan-300/50 transition-all duration-300 focus:ring-2 focus:ring-cyan-400/20 text-sm sm:text-base lg:text-lg h-12 sm:h-14 text-left"
                            autoFocus
                          />
                        </div>
                      )}

                      {currentStepData.type === "textarea" && (
                        <div>
                          <Textarea
                            placeholder={currentStepData.placeholder}
                            value={(currentValue as string) || ""}
                            onChange={(e) => handleInputChange(e.target.value)}
                            className="glass-card border-cyan-400/30 focus:border-cyan-400/60 bg-[#0e2439]/50 text-cyan-100 placeholder-cyan-300/50 transition-all duration-300 focus:ring-2 focus:ring-cyan-400/20 text-sm sm:text-base lg:text-lg min-h-24 sm:min-h-32 resize-none text-left"
                            autoFocus
                          />
                        </div>
                      )}

                      {currentStepData.type === "checkbox" && (
                        <div className="flex items-center space-x-3 justify-center">
                          <Checkbox
                            id="permission"
                            checked={currentValue as boolean || false}
                            onCheckedChange={(checked) => handleInputChange(checked as boolean)}
                            className="border-cyan-400/30 data-[state=checked]:bg-cyan-400 data-[state=checked]:border-cyan-400 h-5 w-5 sm:h-6 sm:w-6"
                          />
                          <Label htmlFor="permission" className="text-cyan-100 text-sm sm:text-base lg:text-lg">
                            Yes, I give permission
                          </Label>
                        </div>
                      )}

                      {currentStepData.type === "file" && (
                        <div>
                          {/* CV Upload Status Display */}
                          {currentStepData.title.toLowerCase().includes('cv') && cvUploaded && (
                            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-cyan-400/10 to-blue-500/10 border border-cyan-400/30">
                              <div className="flex items-center gap-2 text-green-400 mb-3">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">CV uploaded and analyzed</span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-[#0e2439]/60 rounded-lg p-3 text-center border border-cyan-400/20">
                                  <div className="text-lg font-bold text-white">{Object.keys(cvSuggestions.autoFilled).length}</div>
                                  <div className="text-xs text-cyan-300">Auto-filled</div>
                                </div>
                                <div className="bg-[#0e2439]/60 rounded-lg p-3 text-center border border-cyan-400/20">
                                  <div className="text-lg font-bold text-white">{Object.keys(cvSuggestions.aiSuggestions).length}</div>
                                  <div className="text-xs text-cyan-300">AI Suggestions</div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* File Upload Area */}
                          {(!uploadedFiles[currentStepData.id] || uploadedFiles[currentStepData.id].length === 0) && !cvUploaded ? (
                            <div
                              onDrop={(e) => {
                                e.preventDefault()
                                if (currentStepData.title.toLowerCase().includes('cv')) {
                                  const files = e.dataTransfer.files
                                  if (files.length > 0) {
                                    handleCVUpload(files[0])
                                  }
                                } else {
                                  handleFileUpload(e.dataTransfer.files)
                                }
                              }}
                              onDragOver={(e) => {
                                e.preventDefault()
                              }}
                              onDragLeave={(e) => {
                                e.preventDefault()
                              }}
                              className="relative border-2 border-solid rounded-xl p-6 sm:p-8 lg:p-12 text-center transition-all duration-300 cursor-pointer bg-[#0e2439]/50 backdrop-blur-sm border-cyan-400 shadow-lg shadow-cyan-400/30 hover:border-cyan-400/50 hover:shadow-cyan-400/40"
                            >
                              <input
                                type="file"
                                accept={currentStepData.title.toLowerCase().includes('cv') ? ".pdf,.doc,.docx,.txt,.rtf,image/*" : currentStepData.fileTypes?.join(",")}
                                multiple={currentStepData.title.toLowerCase().includes('cv') ? false : Boolean(currentStepData.maxFiles && currentStepData.maxFiles > 1)}
                                onChange={(e) => {
                                  if (currentStepData.title.toLowerCase().includes('cv')) {
                                    if (e.target.files && e.target.files[0]) {
                                      handleCVUpload(e.target.files[0])
                                    }
                                  } else {
                                    handleFileUpload(e.target.files)
                                  }
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                              <div className="space-y-4 sm:space-y-6">
                                <div className="mx-auto flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center">
                                  <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                                </div>
                                <div>
                                  <p className="text-lg sm:text-xl font-medium text-white mb-2">Drag and drop your file here</p>
                                  <p className="text-sm sm:text-base text-white">or click to browse</p>
                                  <p className="text-xs sm:text-sm text-cyan-300/80 mt-2">
                                    {currentStepData.title.toLowerCase().includes('cv') 
                                      ? ".pdf, .doc, .docx files accepted" 
                                      : `${currentStepData.fileTypes?.join(", ")} files accepted`
                                    }
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* CV Upload Loading and Error States */}
                          {currentStepData.title.toLowerCase().includes('cv') && (
                            <>
                              {isUploadingCV && (
                                <div className="mt-4 flex items-center justify-center gap-2 text-cyan-300">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span className="text-sm">Analyzing CV with AI...</span>
                                </div>
                              )}
                              
                              {cvUploadError && (
                                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                  <p className="text-sm text-red-300">{cvUploadError}</p>
                                </div>
                              )}
                            </>
                          )}
                          
                          {/* File List Display */}
                          {(uploadedFiles[currentStepData.id] && uploadedFiles[currentStepData.id].length > 0) || (currentStepData.title.toLowerCase().includes('cv') && cvUploaded) ? (
                            <div className="space-y-4 sm:space-y-6">
                              {/* Show CV upload success for CV steps */}
                              {currentStepData.title.toLowerCase().includes('cv') && cvUploaded && (!uploadedFiles[currentStepData.id] || uploadedFiles[currentStepData.id].length === 0) && (
                                <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 glass-card rounded-xl border border-green-400/20 bg-[#0e2439]/50 backdrop-blur-sm">
                                  <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl bg-gradient-to-br from-green-400/20 to-green-500/20 border border-green-400/30 flex-shrink-0">
                                    <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm sm:text-base lg:text-lg font-medium text-green-100">CV uploaded and analyzed</p>
                                    <p className="text-xs sm:text-sm text-green-300/80">AI processing completed</p>
                                  </div>
                                </div>
                              )}
                              
                              {/* Show regular uploaded files */}
                              {uploadedFiles[currentStepData.id] && uploadedFiles[currentStepData.id].map((file, index) => (
                                <div key={index} className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 glass-card rounded-xl border border-cyan-400/20 bg-[#0e2439]/50 backdrop-blur-sm">
                                  <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/30 flex-shrink-0">
                                    <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm sm:text-base lg:text-lg font-medium text-cyan-100 truncate">{file.name}</p>
                                    <p className="text-xs sm:text-sm text-cyan-300/80">{formatFileSize(file.size)}</p>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
                                    <button 
                                      onClick={() => removeFile(currentStepData.id, index)} 
                                      className="p-2 hover:bg-red-400/10 rounded-full transition-colors duration-300"
                                    >
                                      <X className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                              {/* Only show "Add more files" if user hasn't reached max files limit */}
                              {(!currentStepData.maxFiles || uploadedFiles[currentStepData.id].length < currentStepData.maxFiles) && (
                              <button
                                  onClick={() => {
                                    // Create a hidden file input to trigger file selection
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.accept = currentStepData.fileTypes?.join(",");
                                    input.multiple = Boolean(currentStepData.maxFiles && currentStepData.maxFiles > 1);
                                    input.onchange = (e) => {
                                      const target = e.target as HTMLInputElement;
                                      if (target.files) {
                                        const existingFiles = uploadedFiles[currentStepData.id] || [];
                                        const newFiles = Array.from(target.files);
                                        const allFiles = [...existingFiles, ...newFiles];
                                        
                                        // Check max files limit
                                        const maxFiles = currentStepData.maxFiles || 5;
                                        if (allFiles.length > maxFiles) {
                                          alert(`Maximum ${maxFiles} files allowed. You can upload ${maxFiles - existingFiles.length} more files.`);
                                          return;
                                        }
                                        
                                        setUploadedFiles(prev => ({
                                          ...prev,
                                          [currentStepData.id]: allFiles
                                        }));
                                      }
                                    };
                                    input.click();
                                  }}
                                className="w-full p-3 sm:p-4 border-2 border-dashed border-cyan-400/30 rounded-xl text-center transition-all duration-300 hover:border-cyan-400/50 hover:bg-cyan-400/5"
                              >
                                <div className="space-y-2">
                                  <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-400 mx-auto" />
                                  <p className="text-sm sm:text-base text-cyan-100">Add more files</p>
                                </div>
                              </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </GlassCardContent>
                </GlassCard>
              )}
            </div>

            {/* Error Display */}
            {saveError && (
              <div className="fixed top-4 right-4 z-50 bg-red-500/90 backdrop-blur-sm text-white p-4 rounded-lg shadow-lg max-w-md">
                <div className="flex items-center gap-2">
                  <X className="h-5 w-5 text-red-200" />
                  <div>
                    <p className="font-semibold">Save Failed</p>
                    <p className="text-sm text-red-100">{saveError}</p>
                  </div>
                  <button 
                    onClick={() => setSaveError(null)}
                    className="ml-auto p-1 hover:bg-red-400/20 rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Navigation */}
            {currentStepData.type !== "completion" && (
              <div className="flex items-center justify-between mt-6 sm:mt-8 px-2">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2 text-cyan-300 hover:text-cyan-100 hover:bg-cyan-400/10 transition-all duration-300 px-3 sm:px-4 py-2 rounded-md relative z-50 text-sm sm:text-base"
                  style={{ position: 'relative', zIndex: 50 }}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Back</span>
                </button>

                <button 
                  onClick={handleNext} 
                  disabled={!isValid || isAnimating || isSaving} 
                  className="flex items-center gap-2 h-10 sm:h-12 px-4 sm:px-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold tracking-wide shadow-lg shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none rounded-md relative z-50 text-sm sm:text-base"
                  style={{ position: 'relative', zIndex: 50 }}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                  <span className="hidden sm:inline">
                        {currentStep === onboardingSteps.length - 2 ? "Review & Submit" : "Next"}
                  </span>
                  <span className="sm:hidden">
                        {currentStep === onboardingSteps.length - 2 ? "Review" : "Next"}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
