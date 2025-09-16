"use client"
import { useEffect, useMemo, useState } from "react"
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card"
import { NeuroButton } from "@/components/ui/neuro-button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Search,
  Filter,
  Eye,
  Plus,
  Edit,
  Trash2,
  Check,
} from "lucide-react"
import AdminOnly from "../AdminOnly"
import { AdminSidebar } from "@/components/admin-sidebar"
import { useAuth } from "@/lib/auth-context"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useToast } from "@/hooks/use-toast"
import { 
  Question, 
  AddQuestionRequest, 
  AddQuestionsResponse, 
  UpdateQuestionRequest,
  fetchQuestions, 
  addQuestion,
  updateQuestion,
  deleteQuestion
} from "@/lib/questions-api"

type QuestionCategory = "student" | "professional"
type QuestionType = "text" | "yes/no" | "multiple-choice" | "upload" | "link"

export default function QuestionsManagement() {
  const { getToken } = useAuth()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")

  // Questions data from API
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)

  // Dialog state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleteLoadingOpen, setIsDeleteLoadingOpen] = useState(false)
  const [isDeleteSuccessOpen, setIsDeleteSuccessOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [deletedQuestionText, setDeletedQuestionText] = useState<string>("")

  // Forms
  const [singleQuestionForm, setSingleQuestionForm] = useState<AddQuestionRequest>({
    text: "",
    type: "text",
    options: [],
    step: {
      stepNumber: 1,
      stepName: "Academic Background"
    },
    category: "student",
    optional: false,
    status: "active",
    documents: {
      cv: true,
      optionalDocs: []
    }
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Load questions on component mount
  useEffect(() => {
    loadQuestions()
  }, [])

  const loadQuestions = async () => {
    try {
      setIsFetching(true)
      const token = getToken()
      if (!token) {
        toast({ title: "Authentication required", description: "Please log in again." })
        return
      }
      
      const questionsData = await fetchQuestions(token)
      setQuestions(questionsData)
    } catch (error) {
      console.error('Error loading questions:', error)
      toast({ 
        title: "Failed to load questions", 
        description: error instanceof Error ? error.message : "Please try again." 
      })
    } finally {
      setIsFetching(false)
    }
  }


  const getTypeColor = (type: string) => {
    switch (type) {
      case "multiple-choice":
        return "bg-green-500/20 text-green-300 border border-green-400/40"
      case "text":
        return "bg-orange-500/20 text-orange-300 border border-orange-400/40"
      case "yes/no":
        return "bg-blue-500/20 text-blue-300 border border-blue-400/40"
      case "upload":
        return "bg-purple-500/20 text-purple-300 border border-purple-400/40"
      case "link":
        return "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40"
      default:
        return "bg-gray-500/20 text-gray-300 border border-gray-400/40"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-300 border border-green-400/40"
      case "inactive":
        return "bg-red-500/20 text-red-300 border border-red-400/40"
      default:
        return "bg-gray-500/20 text-gray-300 border border-gray-400/40"
    }
  }

  const filteredQuestions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return questions.filter((q) => {
      const matchesSearch = !term || q.text.toLowerCase().includes(term)
      const matchesType = selectedType === "all" || q.type === (selectedType as QuestionType)
      return matchesSearch && matchesType
    })
  }, [questions, searchTerm, selectedType])

  // Form submission handlers
  const handleAddSingleQuestion = async () => {
    if (!singleQuestionForm.text.trim()) {
      toast({ title: "Question text is required", description: "Please enter a question." })
      return
    }

    if (singleQuestionForm.type === "multiple-choice") {
      if (!singleQuestionForm.options || singleQuestionForm.options.length < 2) {
        toast({ title: "Options are required", description: "Please provide at least 2 options for multiple-choice questions." })
        return
      }
      if (singleQuestionForm.options.some(option => !option.trim())) {
        toast({ title: "Empty options not allowed", description: "Please fill in all option fields or remove empty ones." })
        return
      }
      if (singleQuestionForm.options.length > 10) {
        toast({ title: "Too many options", description: "You can add maximum 10 options for multiple-choice questions." })
        return
      }
    }

    setIsSaving(true)
    try {
      const token = getToken()
      if (!token) {
        toast({ title: "Authentication required", description: "Please log in again." })
        return
      }

      const result = await addQuestion(singleQuestionForm, token)
      
      toast({ 
        title: "Question added successfully", 
        description: result.message,
        duration: 3000
      })
      setIsAddOpen(false)
      resetSingleQuestionForm()
      loadQuestions() // Reload questions
    } catch (error) {
      console.error('Error adding question:', error)
      toast({ 
        title: "Failed to add question", 
        description: error instanceof Error ? error.message : "Please try again." 
      })
    } finally {
      setIsSaving(false)
    }
  }


  const resetSingleQuestionForm = () => {
    setSingleQuestionForm({
      text: "",
      type: "text",
      options: [],
      step: {
        stepNumber: 1,
        stepName: "Academic Background"
      },
      category: "student",
      optional: false,
      status: "active",
      documents: {
        cv: true,
        optionalDocs: []
      }
    })
  }

  // Edit and Delete handlers
  const handleEditQuestion = (question: Question) => {
    setSelectedQuestion(question)
    setSingleQuestionForm({
      text: question.text,
      type: question.type,
      options: question.options || [],
      step: question.step,
      category: question.category,
      optional: question.optional || false,
      status: question.status || "active",
      documents: question.documents || {
        cv: true,
        optionalDocs: []
      }
    })
    setIsEditOpen(true)
  }

  const handleUpdateQuestion = async () => {
    if (!selectedQuestion || !singleQuestionForm.text.trim()) {
      toast({ title: "Question text is required", description: "Please enter a question." })
      return
    }

    if (singleQuestionForm.type === "multiple-choice") {
      if (!singleQuestionForm.options || singleQuestionForm.options.length < 2) {
        toast({ title: "Options are required", description: "Please provide at least 2 options for multiple-choice questions." })
        return
      }
      if (singleQuestionForm.options.some(option => !option.trim())) {
        toast({ title: "Empty options not allowed", description: "Please fill in all option fields or remove empty ones." })
        return
      }
      if (singleQuestionForm.options.length > 10) {
        toast({ title: "Too many options", description: "You can add maximum 10 options for multiple-choice questions." })
        return
      }
    }

    setIsUpdating(true)
    try {
      const token = getToken()
      if (!token) {
        toast({ title: "Authentication required", description: "Please log in again." })
        return
      }

      const result = await updateQuestion(selectedQuestion._id, singleQuestionForm, token)
      
      toast({ 
        title: "Question updated successfully", 
        description: result.message,
        duration: 3000
      })
      setIsEditOpen(false)
      setSelectedQuestion(null)
      resetSingleQuestionForm()
      loadQuestions() // Reload questions
    } catch (error) {
      console.error('Error updating question:', error)
      toast({ 
        title: "Failed to update question", 
        description: error instanceof Error ? error.message : "Please try again." 
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteQuestion = async () => {
    if (!selectedQuestion) return

    setIsDeleting(true)
    try {
      const token = getToken()
      if (!token) {
        toast({ title: "Authentication required", description: "Please log in again." })
        return
      }

      // Store the question text for success message
      setDeletedQuestionText(selectedQuestion.text)
      
      // Close confirmation dialog and show loading dialog
      setIsDeleteOpen(false)
      setIsDeleteLoadingOpen(true)

      await deleteQuestion(selectedQuestion._id, token)
      
      // Close loading dialog and show success dialog
      setIsDeleteLoadingOpen(false)
      setIsDeleteSuccessOpen(true)
      
      // Reload questions
      loadQuestions()
    } catch (error) {
      console.error('Error deleting question:', error)
      setIsDeleteLoadingOpen(false)
      toast({ 
        title: "Failed to delete question", 
        description: error instanceof Error ? error.message : "Please try again." 
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCloseSuccessDialog = () => {
    setIsDeleteSuccessOpen(false)
    setSelectedQuestion(null)
    setDeletedQuestionText("")
  }

  return (
    <AdminOnly>
      <div className="min-h-screen bg-[#0e2439] flex flex-col lg:flex-row">
        <AdminSidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto w-full max-w-none">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8 pt-4 lg:pt-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Questions</h1>
              <p className="text-cyan-300 text-sm mt-1">Manage questionnaire questions for students and professionals.</p>
            </div>
            <div className="flex items-center gap-2">
              <NeuroButton onClick={() => setIsAddOpen(true)} className="flex items-center gap-2 bg-cyan-400/20 border border-cyan-400/30 text-cyan-100 hover:bg-cyan-400/30 text-sm">
                <Plus className="h-4 w-4" />
                Add Question
              </NeuroButton>
            </div>
          </div>

          {/* Filters and Search */}
          <GlassCard className="bg-[#0e2439]/80 backdrop-blur-xl border border-cyan-400/20 mb-4 lg:mb-6">
            <GlassCardContent className="p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyan-300" />
                    <Input
                      placeholder="Search questions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-[#0e2439]/50 backdrop-blur-sm border border-cyan-400/30 focus:border-cyan-400/60 text-white placeholder-cyan-300/50 text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-3 py-2 bg-[#0e2439]/50 backdrop-blur-sm border border-cyan-400/30 rounded-md text-sm focus:border-cyan-400/60 focus:outline-none text-white min-w-[140px]"
                  >
                    <option value="all">All Types</option>
                    <option value="text">Text</option>
                    <option value="yes/no">Yes/No</option>
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="upload">Upload</option>
                    <option value="link">Link</option>
                  </select>
                  <NeuroButton variant="outline" size="sm" className="border-cyan-400/30 text-cyan-100 hover:bg-cyan-400/10">
                    <Filter className="h-4 w-4" />
                  </NeuroButton>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Questions Table */}
          <GlassCard className="bg-[#0e2439]/80 backdrop-blur-xl border border-cyan-400/20">
            <GlassCardHeader className="p-4 sm:p-6 pb-0">
              <div className="flex items-center gap-3">
                <GlassCardTitle className="text-white text-lg sm:text-xl">Questions ({filteredQuestions.length})</GlassCardTitle>
                {isFetching && <LoadingSpinner size="sm" />}
              </div>
            </GlassCardHeader>
            <GlassCardContent className="p-4 sm:p-6">
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="w-full min-w-[800px] sm:min-w-0">
                  <thead>
                    <tr className="border-b border-cyan-400/20">
                      <th className="text-left py-3 px-2 sm:px-4 font-medium text-white text-sm">Question</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-medium text-white text-sm">Type</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-medium text-white text-sm">Status</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-medium text-white text-sm hidden md:table-cell">Options</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-medium text-white text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-cyan-300">
                          <LoadingSpinner text="Loading questions..." />
                        </td>
                      </tr>
                    ) : filteredQuestions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-cyan-300">No questions found</td>
                      </tr>
                    ) : (
                      filteredQuestions.map((question) => (
                        <tr key={question._id} className="border-b border-cyan-400/10 hover:bg-cyan-400/5 transition-all duration-300">
                          <td className="py-4 px-2 sm:px-4">
                            <div>
                              <p className="font-medium text-white text-sm">{question.text}</p>
                              <div className="md:hidden mt-1">
                                <p className="text-xs text-cyan-300/70">
                                  {question.options && question.options.length > 0 
                                    ? `${question.options.length} options` 
                                    : question.type === "text" ? "Text response" : 
                                      question.type === "yes/no" ? "Yes/No" :
                                      question.type === "upload" ? "File upload" :
                                      question.type === "link" ? "Link" : "Multiple choice"
                                  }
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-2 sm:px-4">
                            <Badge className={`${getTypeColor(question.type)} text-xs font-medium`}>
                              {question.type.replace('-', ' ')}
                            </Badge>
                          </td>
                          <td className="py-4 px-2 sm:px-4">
                            <div className="flex items-center gap-2">
                              <Badge className={`${getStatusColor(question.status)} text-xs font-medium capitalize`}>
                                {question.status}
                              </Badge>
                              {question.optional && (
                                <Badge className="bg-orange-500/20 text-orange-300 border border-orange-400/40 text-xs font-medium">
                                  Optional
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-2 sm:px-4 text-sm text-cyan-300 hidden md:table-cell">
                            {question.options && question.options.length > 0 
                              ? `${question.options.length} options` 
                              : question.type === "text" ? "Text response" : 
                                question.type === "yes/no" ? "Yes/No" :
                                question.type === "upload" ? "File upload" :
                                question.type === "link" ? "Link" : "Multiple choice"
                            }
                          </td>
                          <td className="py-4 px-2 sm:px-4">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <NeuroButton variant="ghost" size="sm" title="View" onClick={() => { setSelectedQuestion(question); setIsViewOpen(true) }} className="text-cyan-100 hover:bg-cyan-400/10 p-1 sm:p-2">
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                              </NeuroButton>
                              <NeuroButton variant="ghost" size="sm" title="Edit" onClick={() => handleEditQuestion(question)} className="text-blue-100 hover:bg-blue-400/10 p-1 sm:p-2">
                                <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                              </NeuroButton>
                              <NeuroButton variant="ghost" size="sm" title="Delete" onClick={() => { setSelectedQuestion(question); setIsDeleteOpen(true) }} className="text-red-100 hover:bg-red-400/10 p-1 sm:p-2">
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              </NeuroButton>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCardContent>
          </GlassCard>

        {/* Add Modal */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="bg-[#0e2439]/90 backdrop-blur-xl border border-cyan-400/30 max-w-2xl mx-4 sm:mx-auto">
            <DialogHeader>
              <DialogTitle className="text-white text-lg">Add Question</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/80 block mb-1">Question Text *</label>
                <Textarea 
                  value={singleQuestionForm.text} 
                  onChange={(e) => setSingleQuestionForm({ ...singleQuestionForm, text: e.target.value })} 
                  className="bg-[#0e2439]/50 border-cyan-400/30 text-white text-sm resize-none min-h-20" 
                  placeholder="Enter your question here..." 
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey && singleQuestionForm.text.trim()) {
                      handleAddSingleQuestion()
                    }
                  }}
                />
                <p className="text-xs text-cyan-300/70 mt-1">Press Ctrl+Enter to quickly add the question</p>
              </div>
              
              <div>
                <label className="text-sm text-white/80 block mb-1">Type *</label>
                <select 
                  value={singleQuestionForm.type} 
                  onChange={(e) => {
                    const newType = e.target.value as QuestionType
                    setSingleQuestionForm({ 
                      ...singleQuestionForm, 
                      type: newType,
                      options: newType === "multiple-choice" ? ['', ''] : []
                    })
                  }} 
                  className="w-full px-3 py-2 bg-[#0e2439]/50 border border-cyan-400/30 rounded-md text-sm focus:border-cyan-400/60 focus:outline-none text-white"
                >
                  <option value="text">Text</option>
                  <option value="yes/no">Yes/No</option>
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="upload">Upload</option>
                  <option value="link">Link</option>
                </select>
              </div>
              
              {singleQuestionForm.type === "multiple-choice" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-white/80 block">Options *</label>
                    <NeuroButton
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSingleQuestionForm({
                        ...singleQuestionForm,
                        options: [...(singleQuestionForm.options || []), '']
                      })}
                      className="border-cyan-400/30 text-cyan-100 hover:bg-cyan-400/10 text-xs"
                      disabled={(singleQuestionForm.options || []).length >= 10}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Option ({(singleQuestionForm.options || []).length}/10)
                    </NeuroButton>
                  </div>
                  
                  <div className="space-y-2">
                    {(singleQuestionForm.options || []).map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex-1">
                          <Input
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...(singleQuestionForm.options || [])]
                              newOptions[index] = e.target.value
                              setSingleQuestionForm({
                                ...singleQuestionForm,
                                options: newOptions
                              })
                            }}
                            placeholder={`Option ${index + 1}`}
                            className="bg-[#0e2439]/50 border-cyan-400/30 text-white text-sm focus:border-cyan-400/60"
                          />
                        </div>
                        <NeuroButton
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newOptions = (singleQuestionForm.options || []).filter((_, i) => i !== index)
                            setSingleQuestionForm({
                              ...singleQuestionForm,
                              options: newOptions
                            })
                          }}
                          className="text-red-300 hover:bg-red-400/10 p-1"
                          disabled={(singleQuestionForm.options || []).length <= 2}
                        >
                          <Trash2 className="h-3 w-3" />
                        </NeuroButton>
                      </div>
                    ))}
                  </div>
                  
                  {(!singleQuestionForm.options || singleQuestionForm.options.length === 0) && (
                    <div className="text-center py-4 text-cyan-300/70 text-sm">
                      No options added yet. Click "Add Option" to get started.
                    </div>
                  )}
                  
                  <p className="text-xs text-cyan-300/70">
                    Add at least 2 options for multiple choice questions. You can add up to 10 options.
                    {(singleQuestionForm.options || []).length < 2 && (
                      <span className="text-orange-300 ml-1">• Minimum 2 options required</span>
                    )}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="optional"
                    checked={singleQuestionForm.optional}
                    onCheckedChange={(checked) => setSingleQuestionForm({ ...singleQuestionForm, optional: !!checked })}
                    className="border-cyan-400/30 data-[state=checked]:bg-cyan-400"
                  />
                  <Label htmlFor="optional" className="text-sm text-white/80">Optional Question</Label>
                </div>
                <div>
                  <label className="text-sm text-white/80 block mb-1">Status</label>
                  <select 
                    value={singleQuestionForm.status} 
                    onChange={(e) => setSingleQuestionForm({ ...singleQuestionForm, status: e.target.value as "active" | "inactive" })} 
                    className="w-full px-3 py-2 bg-[#0e2439]/50 border border-cyan-400/30 rounded-md text-sm focus:border-cyan-400/60 focus:outline-none text-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              {singleQuestionForm.type === "upload" && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cv-required"
                      checked={singleQuestionForm.documents?.cv || false}
                      onCheckedChange={(checked) => setSingleQuestionForm({ 
                        ...singleQuestionForm, 
                        documents: { 
                          ...singleQuestionForm.documents, 
                          cv: !!checked 
                        } 
                      })}
                      className="border-cyan-400/30 data-[state=checked]:bg-cyan-400"
                    />
                    <Label htmlFor="cv-required" className="text-sm text-white/80">CV Required</Label>
                  </div>
                  <p className="text-xs text-cyan-300/70">Check if this upload question requires a CV</p>
                </div>
              )}
            </div>
            
            <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
              <NeuroButton variant="outline" onClick={() => setIsAddOpen(false)} className="border-cyan-400/30 text-cyan-100 w-full sm:w-auto text-sm">Cancel</NeuroButton>
              <NeuroButton onClick={handleAddSingleQuestion} disabled={isSaving || !singleQuestionForm.text.trim()} className="bg-cyan-400/20 border border-cyan-400/30 text-cyan-100 hover:bg-cyan-400/30 w-full sm:w-auto text-sm">
                {isSaving ? "Adding..." : "Add Question"}
              </NeuroButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Modal */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="bg-[#0e2439]/90 backdrop-blur-xl border border-cyan-400/30 max-w-md mx-4 sm:mx-auto">
            <DialogHeader>
              <DialogTitle className="text-white text-lg">Question Details</DialogTitle>
            </DialogHeader>
            {selectedQuestion && (
              <div className="space-y-3 text-white/90 text-sm">
                <div className="flex justify-between items-start">
                  <span className="text-white/70 min-w-0 mr-4">Question</span>
                  <span className="text-right break-words">{selectedQuestion.text}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Type</span>
                  <span className="capitalize">{selectedQuestion.type.replace('-', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Status</span>
                  <span className="capitalize">{selectedQuestion.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Optional</span>
                  <span>{selectedQuestion.optional ? "Yes" : "No"}</span>
                </div>
                {selectedQuestion.documents && (
                  <div className="pt-2">
                    <span className="block text-white/70 mb-2">Documents</span>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-white/60">CV Required</span>
                        <span>{selectedQuestion.documents.cv ? "Yes" : "No"}</span>
                      </div>
                      {selectedQuestion.documents.optionalDocs && selectedQuestion.documents.optionalDocs.length > 0 && (
                        <div>
                          <span className="text-white/60">Optional Documents:</span>
                          <ul className="text-white/80 space-y-1 mt-1">
                            {selectedQuestion.documents.optionalDocs.map((doc, index) => (
                              <li key={index} className="text-sm">
                                {doc.type} {doc.required ? "(Required)" : "(Optional)"}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {selectedQuestion.options && selectedQuestion.options.length > 0 && (
                  <div className="pt-2">
                    <span className="block text-white/70 mb-2">Options</span>
                    <ul className="text-white/80 space-y-1">
                      {selectedQuestion.options.map((option, index) => (
                        <li key={index} className="text-sm">{index + 1}. {option}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex justify-between text-xs pt-2 border-t border-cyan-400/20">
                  <span className="text-white/50">Created</span>
                  <span>{selectedQuestion.createdAt ? new Date(selectedQuestion.createdAt).toLocaleDateString() : "—"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">Updated</span>
                  <span>{selectedQuestion.updatedAt ? new Date(selectedQuestion.updatedAt).toLocaleDateString() : "—"}</span>
                </div>
              </div>
            )}
            <DialogFooter>
              <NeuroButton variant="outline" onClick={() => setIsViewOpen(false)} className="border-cyan-400/30 text-cyan-100 w-full sm:w-auto text-sm">Close</NeuroButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="bg-[#0e2439]/90 backdrop-blur-xl border border-cyan-400/30 max-w-2xl mx-4 sm:mx-auto">
            <DialogHeader>
              <DialogTitle className="text-white text-lg">Edit Question</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/80 block mb-1">Question Text *</label>
                <Textarea 
                  value={singleQuestionForm.text} 
                  onChange={(e) => setSingleQuestionForm({ ...singleQuestionForm, text: e.target.value })} 
                  className="bg-[#0e2439]/50 border-cyan-400/30 text-white text-sm resize-none min-h-20" 
                  placeholder="Enter your question here..." 
                  autoFocus
                />
              </div>
              
              <div>
                <label className="text-sm text-white/80 block mb-1">Type *</label>
                <select 
                  value={singleQuestionForm.type} 
                  onChange={(e) => {
                    const newType = e.target.value as QuestionType
                    setSingleQuestionForm({ 
                      ...singleQuestionForm, 
                      type: newType,
                      options: newType === "multiple-choice" ? ['', ''] : []
                    })
                  }} 
                  className="w-full px-3 py-2 bg-[#0e2439]/50 border border-cyan-400/30 rounded-md text-sm focus:border-cyan-400/60 focus:outline-none text-white"
                >
                  <option value="text">Text</option>
                  <option value="yes/no">Yes/No</option>
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="upload">Upload</option>
                  <option value="link">Link</option>
                </select>
              </div>
              
              {singleQuestionForm.type === "multiple-choice" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-white/80 block">Options *</label>
                    <NeuroButton
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSingleQuestionForm({
                        ...singleQuestionForm,
                        options: [...(singleQuestionForm.options || []), '']
                      })}
                      className="border-cyan-400/30 text-cyan-100 hover:bg-cyan-400/10 text-xs"
                      disabled={(singleQuestionForm.options || []).length >= 10}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Option ({(singleQuestionForm.options || []).length}/10)
                    </NeuroButton>
                  </div>
                  
                  <div className="space-y-2">
                    {(singleQuestionForm.options || []).map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex-1">
                          <Input
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...(singleQuestionForm.options || [])]
                              newOptions[index] = e.target.value
                              setSingleQuestionForm({
                                ...singleQuestionForm,
                                options: newOptions
                              })
                            }}
                            placeholder={`Option ${index + 1}`}
                            className="bg-[#0e2439]/50 border-cyan-400/30 text-white text-sm focus:border-cyan-400/60"
                          />
                        </div>
                        <NeuroButton
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newOptions = (singleQuestionForm.options || []).filter((_, i) => i !== index)
                            setSingleQuestionForm({
                              ...singleQuestionForm,
                              options: newOptions
                            })
                          }}
                          className="text-red-300 hover:bg-red-400/10 p-1"
                          disabled={(singleQuestionForm.options || []).length <= 2}
                        >
                          <Trash2 className="h-3 w-3" />
                        </NeuroButton>
                      </div>
                    ))}
                  </div>
                  
                  {(!singleQuestionForm.options || singleQuestionForm.options.length === 0) && (
                    <div className="text-center py-4 text-cyan-300/70 text-sm">
                      No options added yet. Click "Add Option" to get started.
                    </div>
                  )}
                  
                  <p className="text-xs text-cyan-300/70">
                    Add at least 2 options for multiple choice questions. You can add up to 10 options.
                    {(singleQuestionForm.options || []).length < 2 && (
                      <span className="text-orange-300 ml-1">• Minimum 2 options required</span>
                    )}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="optional-edit"
                    checked={singleQuestionForm.optional}
                    onCheckedChange={(checked) => setSingleQuestionForm({ ...singleQuestionForm, optional: !!checked })}
                    className="border-cyan-400/30 data-[state=checked]:bg-cyan-400"
                  />
                  <Label htmlFor="optional-edit" className="text-sm text-white/80">Optional Question</Label>
                </div>
                <div>
                  <label className="text-sm text-white/80 block mb-1">Status</label>
                  <select 
                    value={singleQuestionForm.status} 
                    onChange={(e) => setSingleQuestionForm({ ...singleQuestionForm, status: e.target.value as "active" | "inactive" })} 
                    className="w-full px-3 py-2 bg-[#0e2439]/50 border border-cyan-400/30 rounded-md text-sm focus:border-cyan-400/60 focus:outline-none text-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              {singleQuestionForm.type === "upload" && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cv-required-edit"
                      checked={singleQuestionForm.documents?.cv || false}
                      onCheckedChange={(checked) => setSingleQuestionForm({ 
                        ...singleQuestionForm, 
                        documents: { 
                          ...singleQuestionForm.documents, 
                          cv: !!checked 
                        } 
                      })}
                      className="border-cyan-400/30 data-[state=checked]:bg-cyan-400"
                    />
                    <Label htmlFor="cv-required-edit" className="text-sm text-white/80">CV Required</Label>
                  </div>
                  <p className="text-xs text-cyan-300/70">Check if this upload question requires a CV</p>
                </div>
              )}
            </div>
            
            <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
              <NeuroButton variant="outline" onClick={() => setIsEditOpen(false)} className="border-cyan-400/30 text-cyan-100 w-full sm:w-auto text-sm">Cancel</NeuroButton>
              <NeuroButton onClick={handleUpdateQuestion} disabled={isUpdating || !singleQuestionForm.text.trim()} className="bg-cyan-400/20 border border-cyan-400/30 text-cyan-100 hover:bg-cyan-400/30 w-full sm:w-auto text-sm">
                {isUpdating ? "Updating..." : "Update Question"}
              </NeuroButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent className="bg-[#0e2439]/90 backdrop-blur-xl border border-red-400/30 max-w-md">
            <AlertDialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 border border-red-400/30">
                  <Trash2 className="h-5 w-5 text-red-400" />
                </div>
                <AlertDialogTitle className="text-white text-xl font-bold">Delete Question</AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-white/80 text-base">
                <div className="space-y-3">
                  <p className="font-medium text-red-300">⚠️ This action cannot be undone!</p>
                  <p>Are you sure you want to permanently delete this question from the system?</p>
                  
                  {selectedQuestion && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-400/20 rounded-lg">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={`${getTypeColor(selectedQuestion.type)} text-xs font-medium`}>
                            {selectedQuestion.type.replace('-', ' ')}
                          </Badge>
                          <Badge className={`${getStatusColor(selectedQuestion.status)} text-xs font-medium capitalize`}>
                            {selectedQuestion.status}
                          </Badge>
                          {selectedQuestion.optional && (
                            <Badge className="bg-orange-500/20 text-orange-300 border border-orange-400/40 text-xs font-medium">
                              Optional
                            </Badge>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-red-300 mb-1">Question Text:</p>
                          <p className="text-sm text-red-200 bg-red-500/5 p-2 rounded border border-red-400/10">
                            "{selectedQuestion.text}"
                          </p>
                        </div>
                        {selectedQuestion.options && selectedQuestion.options.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-red-300 mb-1">Options ({selectedQuestion.options.length}):</p>
                            <div className="text-xs text-red-200 bg-red-500/5 p-2 rounded border border-red-400/10">
                              {selectedQuestion.options.slice(0, 3).map((option, index) => (
                                <div key={index}>• {option}</div>
                              ))}
                              {selectedQuestion.options.length > 3 && (
                                <div className="text-red-300/70">... and {selectedQuestion.options.length - 3} more</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-3 mt-6">
              <AlertDialogCancel className="border-cyan-400/30 text-cyan-100 hover:bg-cyan-400/10 w-full sm:w-auto order-2 sm:order-1">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteQuestion}
                disabled={isDeleting}
                className="bg-red-500/20 border border-red-400/30 text-red-100 hover:bg-red-500/30 w-full sm:w-auto order-1 sm:order-2 font-semibold"
              >
                {isDeleting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-300 border-t-transparent"></div>
                    Deleting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Yes, Delete Question
                  </div>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Loading Dialog */}
        <Dialog open={isDeleteLoadingOpen} onOpenChange={() => {}}>
          <DialogContent className="bg-[#0e2439]/90 backdrop-blur-xl border border-blue-400/30 max-w-sm">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20 border border-blue-400/30 mb-4">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-300 border-t-transparent"></div>
              </div>
              <DialogTitle className="text-white text-lg font-semibold">Deleting...</DialogTitle>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Success Dialog */}
        <Dialog open={isDeleteSuccessOpen} onOpenChange={handleCloseSuccessDialog}>
          <DialogContent className="bg-[#0e2439]/90 backdrop-blur-xl border border-green-400/30 max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20 border border-green-400/30">
                  <Check className="h-5 w-5 text-green-400" />
                </div>
                <DialogTitle className="text-white text-xl font-bold">Question Deleted Successfully</DialogTitle>
              </div>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-400/20 rounded-lg">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-green-300">✅ Deletion Complete</p>
                  <p className="text-sm text-green-200">
                    The question has been permanently removed from the system.
                  </p>
                  {deletedQuestionText && (
                    <div className="mt-2 p-2 bg-green-500/5 rounded border border-green-400/10">
                      <p className="text-xs text-green-300/70 font-medium">Deleted Question:</p>
                      <p className="text-xs text-green-200 mt-1">
                        "{deletedQuestionText.length > 60 ? deletedQuestionText.substring(0, 60) + '...' : deletedQuestionText}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <NeuroButton 
                onClick={handleCloseSuccessDialog}
                className="bg-green-400/20 border border-green-400/30 text-green-100 hover:bg-green-400/30 w-full"
              >
                <Check className="h-4 w-4 mr-2" />
                Got it!
              </NeuroButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </AdminOnly>
  )
}
