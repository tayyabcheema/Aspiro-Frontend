"use client"
import { useState } from "react"
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card"
import { NeuroButton } from "@/components/ui/neuro-button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  BookOpen,
  Settings,
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Eye,
  Filter,
  MoreHorizontal,
  FileText,
  User,
  Square,
  ChevronDown,
  Activity,
  Target,
  Award,
  Clock,
} from "lucide-react"
import Link from "next/link"
import AdminOnly from "../AdminOnly"

const adminSidebarItems = [
  { icon: Square, label: "Dashboard", href: "/admin", number: "1" },
  { icon: BookOpen, label: "Courses", href: "/admin/courses" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: FileText, label: "Questionnaires", href: "/admin/questionnaires" },
  { icon: BarChart3, label: "Reports", href: "/admin/reports", active: true },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
]

const reportsData = [
  {
    id: 1,
    title: "User Engagement Report",
    description: "Monthly user engagement and activity metrics",
    type: "analytics",
    status: "completed",
    generated: "2024-02-01",
    size: "2.4 MB",
    downloads: 15,
  },
  {
    id: 2,
    title: "Course Performance Analysis",
    description: "Detailed analysis of course completion rates and feedback",
    type: "performance",
    status: "completed",
    generated: "2024-01-28",
    size: "1.8 MB",
    downloads: 23,
  },
  {
    id: 3,
    title: "Revenue Report Q4 2023",
    description: "Quarterly revenue and financial performance summary",
    type: "financial",
    status: "processing",
    generated: "2024-01-25",
    size: "3.2 MB",
    downloads: 8,
  },
  {
    id: 4,
    title: "Skills Gap Analysis Report",
    description: "Comprehensive skills gap analysis across all users",
    type: "analytics",
    status: "completed",
    generated: "2024-01-20",
    size: "4.1 MB",
    downloads: 31,
  },
  {
    id: 5,
    title: "Platform Usage Statistics",
    description: "Daily and weekly platform usage patterns",
    type: "analytics",
    status: "failed",
    generated: "2024-01-18",
    size: "1.5 MB",
    downloads: 5,
  },
]

const analyticsData = [
  {
    title: "Total Users",
    value: "1,247",
    change: "+12%",
    trend: "up",
    icon: Users,
  },
  {
    title: "Active Courses",
    value: "34",
    change: "+3",
    trend: "up",
    icon: BookOpen,
  },
  {
    title: "Completion Rate",
    value: "78%",
    change: "+5%",
    trend: "up",
    icon: Target,
  },
  {
    title: "Avg. Session Time",
    value: "24m",
    change: "-2m",
    trend: "down",
    icon: Clock,
  },
]

export default function ReportsManagement() {
  const [selectedType, setSelectedType] = useState("all")

  const filteredReports = reportsData.filter((report) => {
    return selectedType === "all" || report.type === selectedType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-cyan-400 text-white"
      case "processing":
        return "bg-yellow-500 text-white"
      case "failed":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-600 text-white"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "analytics":
        return "bg-blue-600 text-white"
      case "performance":
        return "bg-green-600 text-white"
      case "financial":
        return "bg-purple-600 text-white"
      default:
        return "bg-gray-600 text-white"
    }
  }

  return (
    <AdminOnly>
      <div className="min-h-screen bg-[#0e2439] flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-[#0e2439]/80 backdrop-blur-xl border-r border-cyan-400/20 flex-shrink-0">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-8">
            <User className="h-5 w-5 text-white" />
            <span className="text-white font-semibold">AI-Career Path</span>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-2">
            {adminSidebarItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                    item.active
                      ? "bg-cyan-400/20 text-cyan-100 border border-cyan-400/30"
                      : "text-white hover:text-cyan-100 hover:bg-cyan-400/10"
                  }`}
                >
                  {item.number ? (
                    <div className="h-5 w-5 rounded bg-cyan-400 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{item.number}</span>
                    </div>
                  ) : (
                    <item.icon className="h-5 w-5" />
                  )}
                  <span>{item.label}</span>
                </div>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Reports & Analytics</h1>
            <p className="text-cyan-300">View and generate comprehensive platform reports.</p>
          </div>
          <NeuroButton className="flex items-center gap-2 bg-cyan-400/20 border border-cyan-400/30 text-cyan-100 hover:bg-cyan-400/30">
            <BarChart3 className="h-4 w-4" />
            Generate Report
          </NeuroButton>
        </div>

        {/* Analytics Overview */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          {analyticsData.map((item, index) => (
            <GlassCard key={index} className="bg-[#0e2439]/80 backdrop-blur-xl border border-cyan-400/20">
              <GlassCardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-cyan-300 mb-1">{item.title}</p>
                    <p className="text-2xl font-bold text-white">{item.value}</p>
                    <div className={`flex items-center gap-1 mt-1 ${
                      item.trend === "up" ? "text-green-400" : "text-red-400"
                    }`}>
                      {item.trend === "up" ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span className="text-xs">{item.change}</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-cyan-400/10 flex items-center justify-center">
                    <item.icon className="h-6 w-6 text-cyan-400" />
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          ))}
        </div>

        {/* Filters */}
        <GlassCard className="bg-[#0e2439]/80 backdrop-blur-xl border border-cyan-400/20 mb-6">
          <GlassCardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-cyan-300" />
                <span className="text-white text-sm">Filter by Type:</span>
              </div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 bg-[#0e2439]/50 backdrop-blur-sm border border-cyan-400/30 rounded-md text-sm focus:border-cyan-400/60 focus:outline-none text-white"
              >
                <option value="all">All Types</option>
                <option value="analytics">Analytics</option>
                <option value="performance">Performance</option>
                <option value="financial">Financial</option>
              </select>
              <NeuroButton variant="outline" size="sm" className="border-cyan-400/30 text-cyan-100 hover:bg-cyan-400/10">
                <Filter className="h-4 w-4" />
              </NeuroButton>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Reports Table */}
        <GlassCard className="bg-[#0e2439]/80 backdrop-blur-xl border border-cyan-400/20">
          <GlassCardHeader>
            <GlassCardTitle className="text-white">Generated Reports ({filteredReports.length})</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cyan-400/20">
                    <th className="text-left py-3 px-4 font-medium text-white">Report</th>
                    <th className="text-left py-3 px-4 font-medium text-white">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-white">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-white">Generated</th>
                    <th className="text-left py-3 px-4 font-medium text-white">Size</th>
                    <th className="text-left py-3 px-4 font-medium text-white">Downloads</th>
                    <th className="text-left py-3 px-4 font-medium text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="border-b border-cyan-400/10 hover:bg-cyan-400/5 transition-all duration-300">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-white">{report.title}</p>
                          <p className="text-sm text-cyan-300">{report.description}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={`${getTypeColor(report.type)} text-xs font-medium`}>
                          {report.type}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={`${getStatusColor(report.status)} text-xs font-medium`}>
                          {report.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-white">{report.generated}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-cyan-300">{report.size}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-white">{report.downloads}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <NeuroButton variant="ghost" size="sm" className="text-cyan-100 hover:bg-cyan-400/10">
                            <Eye className="h-4 w-4" />
                          </NeuroButton>
                          <NeuroButton variant="ghost" size="sm" className="text-cyan-100 hover:bg-cyan-400/10">
                            <Download className="h-4 w-4" />
                          </NeuroButton>
                          <NeuroButton variant="ghost" size="sm" className="text-cyan-100 hover:bg-cyan-400/10">
                            <MoreHorizontal className="h-4 w-4" />
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
