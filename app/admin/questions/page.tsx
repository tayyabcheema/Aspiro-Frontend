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
  fetchQuestions, 
  addQuestion
} from "@/lib/questions-api"

type QuestionCategory = "student" | "professional"
type QuestionType = "text" | "yes/no" | "multiple-choice" | "upload" | "link"

export default function QuestionsManagement() {
  const { getToken } = useAuth()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")

  // Questions data from API
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)

  // Dialog state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)

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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "student":
        return "bg-blue-600 text-white"
      case "professional":
        return "bg-purple-600 text-white"
      default:
        return "bg-gray-600 text-white"
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
      const matchesCategory = selectedCategory === "all" || q.category === (selectedCategory as QuestionCategory)
      const matchesType = selectedType === "all" || q.type === (selectedType as QuestionType)
      return matchesSearch && matchesCategory && matchesType
    })
  }, [questions, searchTerm, selectedCategory, selectedType])

  // Form submission handlers
  const handleAddSingleQuestion = async () => {
    if (!singleQuestionForm.text.trim()) {
      toast({ title: "Question text is required", description: "Please enter a question." })
      return
    }

    if (!singleQuestionForm.step.stepName.trim()) {
      toast({ title: "Step name is required", description: "Please enter a step name." })
      return
    }

    if (singleQuestionForm.type === "multiple-choice" && (!singleQuestionForm.options || singleQuestionForm.options.length === 0)) {
      toast({ title: "Options are required", description: "Please provide options for multiple-choice questions." })
      return
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
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 bg-[#0e2439]/50 backdrop-blur-sm border border-cyan-400/30 rounded-md text-sm focus:border-cyan-400/60 focus:outline-none text-white min-w-[120px]"
                  >
                    <option value="all">All Categories</option>
                    <option value="student">Student</option>
                    <option value="professional">Professional</option>
                  </select>
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
                      <th className="text-left py-3 px-2 sm:px-4 font-medium text-white text-sm">Step</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-medium text-white text-sm">Category</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-medium text-white text-sm">Type</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-medium text-white text-sm">Status</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-medium text-white text-sm hidden md:table-cell">Options</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-medium text-white text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-cyan-300">
                          <LoadingSpinner text="Loading questions..." />
                        </td>
                      </tr>
                    ) : filteredQuestions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-cyan-300">No questions found</td>
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
                            <div className="text-sm text-cyan-300">
                              <div className="font-medium">#{question.step.stepNumber}</div>
                              <div className="text-xs text-cyan-300/70">{question.step.stepName}</div>
                            </div>
                          </td>
                          <td className="py-4 px-2 sm:px-4">
                            <Badge className={`${getCategoryColor(question.category)} text-xs font-medium capitalize`}>
                              {question.category}
                            </Badge>
                          </td>
                          <td className="py-4 px-2 sm:px-4">
                            <Badge className={`${getTypeColor(question.type)} text-xs font-medium`}>
                              {question.type.replace('-', ' ')}
                            </Badge>
                          </td>
                          <td className="py-4 px-2 sm:px-4">
                            <Badge className={`${getStatusColor(question.status)} text-xs font-medium capitalize`}>
                              {question.status}
                            </Badge>
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
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/80 block mb-1">Category *</label>
                  <select 
                    value={singleQuestionForm.category} 
                    onChange={(e) => setSingleQuestionForm({ ...singleQuestionForm, category: e.target.value as QuestionCategory })} 
                    className="w-full px-3 py-2 bg-[#0e2439]/50 border border-cyan-400/30 rounded-md text-sm focus:border-cyan-400/60 focus:outline-none text-white"
                  >
                    <option value="student">Student</option>
                    <option value="professional">Professional</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-white/80 block mb-1">Type *</label>
                  <select 
                    value={singleQuestionForm.type} 
                    onChange={(e) => setSingleQuestionForm({ ...singleQuestionForm, type: e.target.value as QuestionType })} 
                    className="w-full px-3 py-2 bg-[#0e2439]/50 border border-cyan-400/30 rounded-md text-sm focus:border-cyan-400/60 focus:outline-none text-white"
                  >
                    <option value="text">Text</option>
                    <option value="yes/no">Yes/No</option>
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="upload">Upload</option>
                    <option value="link">Link</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/80 block mb-1">Step Number *</label>
                  <Input
                    type="number"
                    value={singleQuestionForm.step.stepNumber}
                    onChange={(e) => setSingleQuestionForm({ 
                      ...singleQuestionForm, 
                      step: { ...singleQuestionForm.step, stepNumber: parseInt(e.target.value) || 1 }
                    })}
                    className="bg-[#0e2439]/50 border-cyan-400/30 text-white text-sm"
                    min="1"
                    max="10"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/80 block mb-1">Step Name *</label>
                  <select 
                    value={singleQuestionForm.step.stepName} 
                    onChange={(e) => {
                      const stepName = e.target.value
                      const stepNumberMap: Record<string, number> = {
                        "Academic Background": 1,
                        "Career Aspirations": 2,
                        "Skills & Strengths": 3,
                        "Learning & Development Preferences": 4,
                        "Timeline & Goals": 5,
                        "Work Preferences": 6,
                        "Career Motivation": 7,
                        "Career Challenges & Barriers": 8,
                        "Networking & Professional Exposure": 9,
                        "Professional Profiles & Documents": 10
                      }
                      setSingleQuestionForm({ 
                        ...singleQuestionForm, 
                        step: { 
                          stepNumber: stepNumberMap[stepName] || singleQuestionForm.step.stepNumber,
                          stepName: stepName 
                        }
                      })
                    }} 
                    className="w-full px-3 py-2 bg-[#0e2439]/50 border border-cyan-400/30 rounded-md text-sm focus:border-cyan-400/60 focus:outline-none text-white"
                  >
                    <option value="Academic Background">Academic Background</option>
                    <option value="Career Aspirations">Career Aspirations</option>
                    <option value="Skills & Strengths">Skills & Strengths</option>
                    <option value="Learning & Development Preferences">Learning & Development Preferences</option>
                    <option value="Timeline & Goals">Timeline & Goals</option>
                    <option value="Work Preferences">Work Preferences</option>
                    <option value="Career Motivation">Career Motivation</option>
                    <option value="Career Challenges & Barriers">Career Challenges & Barriers</option>
                    <option value="Networking & Professional Exposure">Networking & Professional Exposure</option>
                    <option value="Professional Profiles & Documents">Professional Profiles & Documents</option>
                  </select>
                </div>
              </div>
              
              {singleQuestionForm.type === "multiple-choice" && (
                <div>
                  <label className="text-sm text-white/80 block mb-1">Options (one per line) *</label>
                  <Textarea 
                    value={singleQuestionForm.options?.join('\n') || ''} 
                    onChange={(e) => setSingleQuestionForm({ 
                      ...singleQuestionForm, 
                      options: e.target.value.split('\n').filter(opt => opt.trim())
                    })} 
                    className="bg-[#0e2439]/50 border-cyan-400/30 text-white text-sm resize-none min-h-16" 
                    placeholder="Option 1&#10;Option 2&#10;Option 3&#10;Option 4" 
                  />
                  <p className="text-xs text-cyan-300/70 mt-1">Enter each option on a new line</p>
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
              <NeuroButton onClick={handleAddSingleQuestion} disabled={isSaving || !singleQuestionForm.text.trim() || !singleQuestionForm.step.stepName.trim()} className="bg-cyan-400/20 border border-cyan-400/30 text-cyan-100 hover:bg-cyan-400/30 w-full sm:w-auto text-sm">
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
                  <span className="text-white/70">Step</span>
                  <span>#{selectedQuestion.step.stepNumber} - {selectedQuestion.step.stepName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Category</span>
                  <span className="capitalize">{selectedQuestion.category}</span>
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
        </div>
      </div>
    </AdminOnly>
  )
}
