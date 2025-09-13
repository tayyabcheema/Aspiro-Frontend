"use client"
import { useState } from "react"
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card"
import { NeuroButton } from "@/components/ui/neuro-button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  BookOpen,
  Settings,
  BarChart3,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  MoreHorizontal,
  FileText,
  User,
  Square,
  ChevronDown,
  CheckCircle,
  Clock,
  AlertCircle,
  Users2,
} from "lucide-react"
import Link from "next/link"
import AdminOnly from "../AdminOnly"
import { AdminSidebar } from "@/components/admin-sidebar"

const questionnairesData = [
  {
    id: 1,
    title: "Career Path Assessment",
    description: "Comprehensive career path evaluation questionnaire",
    questions: 15,
    responses: 234,
    status: "active",
    category: "Career Planning",
    created: "2024-01-15",
    lastUpdated: "2024-02-01",
  },
  {
    id: 2,
    title: "Skills Gap Analysis",
    description: "Identify skill gaps and learning needs",
    questions: 12,
    responses: 189,
    status: "active",
    category: "Skills Assessment",
    created: "2024-01-20",
    lastUpdated: "2024-01-28",
  },
  {
    id: 3,
    title: "Learning Preferences Survey",
    description: "Understand user learning styles and preferences",
    questions: 8,
    responses: 156,
    status: "draft",
    category: "Learning Analytics",
    created: "2024-02-01",
    lastUpdated: "2024-02-01",
  },
  {
    id: 4,
    title: "Job Market Trends",
    description: "Current job market and industry trends assessment",
    questions: 10,
    responses: 298,
    status: "active",
    category: "Market Research",
    created: "2024-01-10",
    lastUpdated: "2024-01-25",
  },
  {
    id: 5,
    title: "Technology Proficiency Test",
    description: "Evaluate technical skills and knowledge",
    questions: 20,
    responses: 87,
    status: "inactive",
    category: "Technical Assessment",
    created: "2024-01-25",
    lastUpdated: "2024-01-30",
  },
]

export default function QuestionnairesManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const filteredQuestionnaires = questionnairesData.filter((questionnaire) => {
    const matchesSearch =
      questionnaire.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      questionnaire.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || questionnaire.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-cyan-400 text-white"
      case "draft":
        return "bg-yellow-500 text-white"
      case "inactive":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-600 text-white"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4" />
      case "draft":
        return <Clock className="h-4 w-4" />
      case "inactive":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
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
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Questionnaires</h1>
              <p className="text-cyan-300 text-sm">Manage assessment questionnaires and surveys.</p>
            </div>
            <NeuroButton className="flex items-center gap-2 bg-cyan-400/20 border border-cyan-400/30 text-cyan-100 hover:bg-cyan-400/30 text-sm">
              <Plus className="h-4 w-4" />
              Create Questionnaire
            </NeuroButton>
          </div>

          {/* Filters and Search */}
          <GlassCard className="bg-[#0e2439]/80 backdrop-blur-xl border border-cyan-400/20 mb-4 lg:mb-6">
            <GlassCardContent className="p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyan-300" />
                    <Input
                      placeholder="Search questionnaires..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-[#0e2439]/50 backdrop-blur-sm border border-cyan-400/30 focus:border-cyan-400/60 text-white placeholder-cyan-300/50 text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 bg-[#0e2439]/50 backdrop-blur-sm border border-cyan-400/30 rounded-md text-sm focus:border-cyan-400/60 focus:outline-none text-white min-w-[120px]"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <NeuroButton variant="outline" size="sm" className="border-cyan-400/30 text-cyan-100 hover:bg-cyan-400/10">
                    <Filter className="h-4 w-4" />
                  </NeuroButton>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Questionnaires Table */}
          <GlassCard className="bg-[#0e2439]/80 backdrop-blur-xl border border-cyan-400/20">
            <GlassCardHeader className="p-4 sm:p-6 pb-0">
              <GlassCardTitle className="text-white text-lg sm:text-xl">Questionnaires ({filteredQuestionnaires.length})</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent className="p-4 sm:p-6">
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="w-full min-w-[800px] sm:min-w-0">
                  <thead>
                    <tr className="border-b border-cyan-400/20">
                      <th className="text-left py-3 px-2 sm:px-4 font-medium text-white text-sm">Questionnaire</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-medium text-white text-sm hidden sm:table-cell">Category</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-medium text-white text-sm">Questions</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-medium text-white text-sm hidden md:table-cell">Responses</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-medium text-white text-sm">Status</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-medium text-white text-sm hidden lg:table-cell">Last Updated</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-medium text-white text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuestionnaires.map((questionnaire) => (
                      <tr key={questionnaire.id} className="border-b border-cyan-400/10 hover:bg-cyan-400/5 transition-all duration-300">
                        <td className="py-4 px-2 sm:px-4">
                          <div>
                            <p className="font-medium text-white text-sm">{questionnaire.title}</p>
                            <p className="text-xs text-cyan-300">{questionnaire.description}</p>
                            <div className="sm:hidden mt-1">
                              <p className="text-xs text-cyan-300/70">{questionnaire.category} • {questionnaire.responses} responses</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-2 sm:px-4 hidden sm:table-cell">
                          <span className="text-sm text-white">{questionnaire.category}</span>
                        </td>
                        <td className="py-4 px-2 sm:px-4">
                          <span className="text-sm text-white">{questionnaire.questions}</span>
                        </td>
                        <td className="py-4 px-2 sm:px-4 hidden md:table-cell">
                          <span className="text-sm text-white">{questionnaire.responses}</span>
                        </td>
                        <td className="py-4 px-2 sm:px-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(questionnaire.status)}
                            <Badge className={`${getStatusColor(questionnaire.status)} text-xs font-medium`}>
                              {questionnaire.status}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-4 px-2 sm:px-4 hidden lg:table-cell">
                          <span className="text-sm text-cyan-300">{questionnaire.lastUpdated}</span>
                        </td>
                        <td className="py-4 px-2 sm:px-4">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <NeuroButton variant="ghost" size="sm" className="text-cyan-100 hover:bg-cyan-400/10 p-1 sm:p-2">
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                            </NeuroButton>
                            <NeuroButton variant="ghost" size="sm" className="text-cyan-100 hover:bg-cyan-400/10 p-1 sm:p-2">
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            </NeuroButton>
                            <NeuroButton variant="ghost" size="sm" className="text-cyan-100 hover:bg-cyan-400/10 p-1 sm:p-2">
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </NeuroButton>
                            <NeuroButton variant="ghost" size="sm" className="text-cyan-100 hover:bg-cyan-400/10 p-1 sm:p-2">
                              <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                            </NeuroButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>
      </div>
    </AdminOnly>
  )
}
