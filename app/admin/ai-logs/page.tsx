"use client"

import React, { useEffect, useState } from "react"
import { Brain, Eye, EyeOff, MessageSquare, Calendar, User } from 'lucide-react'
import { useAuth } from "@/lib/auth-context"
import AdminOnly from "../AdminOnly"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/loading-spinner"
import { AdminSidebar } from "@/components/admin-sidebar"
import { getApiUrl } from "@/lib/api-config"

interface AiLog {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
  };
  questionId: {
    _id: string;
    text: string;
    step: {
      stepNumber: number;
      stepName: string;
    };
    category: string;
  };
  questionText: string;
  suggestions: string[];
  cvText: string;
  model: string;
  tokensUsed: number;
  processingTime: number;
  reviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  adminNotes?: string;
  createdAt: string;
}

interface AiLogsResponse {
  success: boolean;
  data: {
    logs: AiLog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

interface AiStatsResponse {
  success: boolean;
  data: {
    totalLogs: number;
    reviewedLogs: number;
    unreviewedLogs: number;
    recentLogs: number;
    reviewRate: number;
  };
}

export default function AiLogsPage() {
  const { getAuthHeaders } = useAuth()
  const { toast } = useToast()

  const [logs, setLogs] = useState<AiLog[]>([])
  const [stats, setStats] = useState<AiStatsResponse['data'] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const loadLogs = async (page = 1) => {
    try {
      setIsLoading(true)
      const res = await fetch(getApiUrl(`/ai/logs?page=${page}&limit=20`), {
        headers: { 'Content-Type': 'application/json', ...(getAuthHeaders() as Record<string,string>) },
        credentials: 'include'
      })
      const data: AiLogsResponse = await res.json()
      if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`)
      
      setLogs(data.data.logs)
      setCurrentPage(data.data.pagination.page)
      setTotalPages(data.data.pagination.pages)
    } catch (e: any) {
      toast({ title: 'Failed to load AI logs', description: e.message || 'Try again.' })
    } finally { 
      setIsLoading(false) 
    }
  }

  const loadStats = async () => {
    try {
      const res = await fetch(getApiUrl('/ai/stats'), {
        headers: { 'Content-Type': 'application/json', ...(getAuthHeaders() as Record<string,string>) },
        credentials: 'include'
      })
      const data: AiStatsResponse = await res.json()
      if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`)
      
      setStats(data.data)
    } catch (e: any) {
      console.error('Failed to load AI stats:', e)
    }
  }

  const updateLogReview = async (logId: string, reviewed: boolean, notes?: string) => {
    try {
      const res = await fetch(getApiUrl(`/ai/logs/${logId}/review`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(getAuthHeaders() as Record<string,string>) },
        credentials: 'include',
        body: JSON.stringify({ reviewed, adminNotes: notes })
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to update review status')
      }

      // Reload logs to reflect changes
      await loadLogs(currentPage)
      toast({ title: 'Review status updated', description: 'AI log review status has been updated.' })
    } catch (e: any) {
      toast({ title: 'Failed to update review', description: e.message || 'Try again.' })
    }
  }

  useEffect(() => {
    loadLogs()
    loadStats()
  }, [])

  return (
    <AdminOnly>
      <div className="min-h-screen bg-[#0e2439] flex flex-col lg:flex-row">
        <AdminSidebar />

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto backdrop-blur-xl bg-[#0e2439]/40">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 lg:mb-8 pt-4 lg:pt-0 border-b border-cyan-400/40 pb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">AI Logs</h1>
              <p className="text-cyan-300 text-sm mt-1">Review AI-generated suggestions</p>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
              <div className="p-4 sm:p-6 rounded-xl backdrop-blur-xl bg-[#0e2439]/60 border border-cyan-400/30 shadow-lg shadow-cyan-400/20">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-2">{stats.totalLogs}</div>
                  <div className="text-cyan-300 text-sm">Total AI Logs</div>
                </div>
              </div>
              <div className="p-4 sm:p-6 rounded-xl backdrop-blur-xl bg-[#0e2439]/60 border border-cyan-400/30 shadow-lg shadow-cyan-400/20">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-2">{stats.reviewedLogs}</div>
                  <div className="text-cyan-300 text-sm">Reviewed</div>
                </div>
              </div>
              <div className="p-4 sm:p-6 rounded-xl backdrop-blur-xl bg-[#0e2439]/60 border border-cyan-400/30 shadow-lg shadow-cyan-400/20">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-2">{stats.unreviewedLogs}</div>
                  <div className="text-cyan-300 text-sm">Pending Review</div>
                </div>
              </div>
              <div className="p-4 sm:p-6 rounded-xl backdrop-blur-xl bg-[#0e2439]/60 border border-cyan-400/30 shadow-lg shadow-cyan-400/20">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-2">{stats.reviewRate}%</div>
                  <div className="text-cyan-300 text-sm">Review Rate</div>
                </div>
              </div>
            </div>
          )}

          {/* AI Logs Table */}
          <div className="backdrop-blur-xl bg-[#0e2439]/60 border border-cyan-400/30 shadow-lg shadow-cyan-400/20 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-white">AI Generated Suggestions</h2>
              {isLoading && <LoadingSpinner size="sm" />}
            </div>
            
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <table className="w-full min-w-[800px] sm:min-w-0">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-3 px-2 sm:px-4 text-cyan-300 font-medium text-sm">USER</th>
                    <th className="text-left py-3 px-2 sm:px-4 text-cyan-300 font-medium text-sm">QUESTION</th>
                    <th className="text-left py-3 px-2 sm:px-4 text-cyan-300 font-medium text-sm">SUGGESTIONS</th>
                    <th className="text-left py-3 px-2 sm:px-4 text-cyan-300 font-medium text-sm">STATUS</th>
                    <th className="text-left py-3 px-2 sm:px-4 text-cyan-300 font-medium text-sm">DATE</th>
                    <th className="text-left py-3 px-2 sm:px-4 text-cyan-300 font-medium text-sm">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={6} className="py-6 px-2 sm:px-4 text-center text-cyan-300">Loading...</td></tr>
                  ) : logs.length === 0 ? (
                    <tr><td colSpan={6} className="py-6 px-2 sm:px-4 text-center text-cyan-300">No AI logs found</td></tr>
                  ) : (
                    logs.map(log => (
                      <tr key={log._id} className="border-b border-gray-600/40 hover:bg-cyan-400/5 transition-colors">
                        <td className="py-3 px-2 sm:px-4 text-white text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-cyan-400" />
                            <div>
                              <div className="font-medium">{log.userId.fullName}</div>
                              <div className="text-xs text-cyan-300/80">{log.userId.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 sm:px-4 text-white text-sm">
                          <div>
                            <div className="font-medium">{log.questionText}</div>
                            <div className="text-xs text-cyan-300/80">Step {log.questionId.step.stepNumber}: {log.questionId.step.stepName}</div>
                          </div>
                        </td>
                        <td className="py-3 px-2 sm:px-4 text-white text-sm">
                          <div className="max-w-xs">
                            <div className="text-xs text-cyan-300/80 mb-1">{log.suggestions.length} suggestions</div>
                            <div className="space-y-1">
                              {log.suggestions.slice(0, 2).map((suggestion, index) => (
                                <div key={index} className="text-xs bg-cyan-400/10 rounded px-2 py-1 truncate">
                                  {suggestion}
                                </div>
                              ))}
                              {log.suggestions.length > 2 && (
                                <div className="text-xs text-cyan-300/60">+{log.suggestions.length - 2} more</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 sm:px-4">
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                            log.reviewed 
                              ? 'bg-green-500/20 text-green-400 border border-green-400/30' 
                              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/30'
                          }`}>
                            {log.reviewed ? 'Reviewed' : 'Pending'}
                          </span>
                        </td>
                        <td className="py-3 px-2 sm:px-4 text-white text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-cyan-400" />
                            <span className="text-xs">{new Date(log.createdAt).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 sm:px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateLogReview(log._id, !log.reviewed)}
                              className={`p-1.5 rounded transition-colors ${
                                log.reviewed 
                                  ? 'text-yellow-400 hover:bg-yellow-400/10' 
                                  : 'text-green-400 hover:bg-green-400/10'
                              }`}
                              title={log.reviewed ? 'Mark as unreviewed' : 'Mark as reviewed'}
                            >
                              {log.reviewed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-600/40">
                <div className="text-sm text-cyan-300">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadLogs(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm bg-cyan-400/10 text-cyan-300 rounded hover:bg-cyan-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => loadLogs(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm bg-cyan-400/10 text-cyan-300 rounded hover:bg-cyan-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminOnly>
  )
}
