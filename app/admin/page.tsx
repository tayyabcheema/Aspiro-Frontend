"use client"

import React, { useEffect, useMemo, useState } from "react"
import { User } from 'lucide-react'
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import AdminOnly from "./AdminOnly"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/loading-spinner"
import { AdminSidebar } from "@/components/admin-sidebar"
import { getApiUrl } from "@/lib/api-config"

// Sidebar items now centralized in AdminSidebar component

// Types (subset)
type CourseStatus = 'active' | 'draft' | 'inactive'
interface CourseLite { _id: string; title: string; students: number; status: CourseStatus; category?: string }
interface MajorLite { _id: string; name: string }

// Map status -> priority label & color classes
const statusToPriority = (s: CourseStatus) => {
  switch (s) {
    case 'active': return { label: 'HIGH', cls: 'bg-green-500/20 text-green-400 border border-green-400/30' }
    case 'draft': return { label: 'MEDIUM', cls: 'bg-blue-500/20 text-blue-400 border border-blue-400/30' }
    case 'inactive':
    default: return { label: 'LOW', cls: 'bg-gray-500/20 text-gray-400 border border-gray-400/30' }
  }
}

export default function AdminDashboardPage() {
  const { logout, getAuthHeaders } = useAuth()
  const { toast } = useToast()

  const [courses, setCourses] = useState<CourseLite[]>([])
  const [majors, setMajors] = useState<MajorLite[]>([])
  const [isLoadingCourses, setIsLoadingCourses] = useState(true)
  const [isLoadingMajors, setIsLoadingMajors] = useState(true)

  const loadCourses = async () => {
    try {
      setIsLoadingCourses(true)
      const res = await fetch(getApiUrl('/admin/courses?limit=25&status=active'), {
        headers: { 'Content-Type': 'application/json', ...(getAuthHeaders() as Record<string,string>) },
        credentials: 'include'
      })
      const text = await res.text(); const data = text ? JSON.parse(text) : {}
      if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`)
      const list = (data.courses || data.data || []).map((c:any): CourseLite => ({
        _id: String(c._id || c.id),
        title: c.title,
        students: c.students ?? 0,
        status: c.status as CourseStatus,
        category: c.category
      }))
      setCourses(list)
    } catch (e:any) {
      toast({ title: 'Failed to load courses', description: e.message || 'Try again.' })
    } finally { setIsLoadingCourses(false) }
  }

  const loadMajors = async () => {
    try {
      setIsLoadingMajors(true)
      const res = await fetch(getApiUrl('/admin/majors?limit=100&status=active'), {
        headers: { 'Content-Type': 'application/json', ...(getAuthHeaders() as Record<string,string>) },
        credentials: 'include'
      })
      const text = await res.text(); const data = text ? JSON.parse(text) : {}
      if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`)
      const list = (data.data || data.majors || []).map((m:any): MajorLite => ({ _id: String(m._id||m.id), name: m.name }))
      setMajors(list)
    } catch (e:any) {
      toast({ title: 'Failed to load majors', description: e.message || 'Try again.' })
    } finally { setIsLoadingMajors(false) }
  }

  useEffect(() => { loadCourses(); loadMajors() // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const courseCount = courses.length
  const majorCount = majors.length
  const topCourses = useMemo(() => courses.slice(0, 8), [courses])

  return (
  <AdminOnly>
    <div className="min-h-screen bg-[#0e2439] flex flex-col lg:flex-row">
      <AdminSidebar />

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-none">
        {/* Central Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto backdrop-blur-xl bg-[#0e2439]/40 lg:pt-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 lg:mb-8 pt-4 lg:pt-0 border-b border-cyan-400/40 pb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-cyan-300 text-sm mt-1">Overview and management center</p>
            </div>
          </div>

          {/* Stats Cards (Dynamic) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <div className="p-4 sm:p-6 rounded-xl backdrop-blur-xl bg-[#0e2439]/60 border border-cyan-400/30 shadow-lg shadow-cyan-400/20">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-2">{isLoadingCourses ? '—' : courseCount}</div>
                <div className="text-cyan-300 text-sm">Courses</div>
              </div>
            </div>
            <div className="p-4 sm:p-6 rounded-xl backdrop-blur-xl bg-[#0e2439]/60 border border-cyan-400/30 shadow-lg shadow-cyan-400/20">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-2">{isLoadingMajors ? '—' : majorCount}</div>
                <div className="text-cyan-300 text-sm">Majors</div>
              </div>
            </div>
            <div className="p-4 sm:p-6 rounded-xl backdrop-blur-xl bg-[#0e2439]/60 border border-cyan-400/30 shadow-lg shadow-cyan-400/20 sm:col-span-2 lg:col-span-1">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-2">78%</div>
                <div className="text-cyan-300 text-sm">Completion Rate</div>
              </div>
            </div>
          </div>

          {/* Courses Table (API) */}
          <div className="backdrop-blur-xl bg-[#0e2439]/60 border border-cyan-400/30 shadow-lg shadow-cyan-400/20 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-white">Recent Courses</h2>
              {isLoadingCourses && <LoadingSpinner size="sm" />}
            </div>
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <table className="w-full min-w-[600px] sm:min-w-0">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-3 px-2 sm:px-4 text-cyan-300 font-medium text-sm">COURSE</th>
                    <th className="text-left py-3 px-2 sm:px-4 text-cyan-300 font-medium text-sm">ENROLLMENTS</th>
                    <th className="text-left py-3 px-2 sm:px-4 text-cyan-300 font-medium text-sm">PRIORITY</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingCourses ? (
                    <tr><td colSpan={3} className="py-6 px-2 sm:px-4 text-center text-cyan-300">Loading...</td></tr>
                  ) : topCourses.length === 0 ? (
                    <tr><td colSpan={3} className="py-6 px-2 sm:px-4 text-center text-cyan-300">No courses</td></tr>
                  ) : (
                    topCourses.map(c => {
                      const pri = statusToPriority(c.status)
                      return (
                        <tr key={c._id} className="border-b border-gray-600/40 hover:bg-cyan-400/5 transition-colors">
                          <td className="py-3 px-2 sm:px-4 text-white text-sm">{c.title}</td>
                          <td className="py-3 px-2 sm:px-4 text-white text-sm">{Intl.NumberFormat().format(c.students)}</td>
                          <td className="py-3 px-2 sm:px-4">
                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${pri.cls}`}>{pri.label}</span>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full lg:w-80 xl:w-96 space-y-4 lg:space-y-6 p-4 sm:p-6 lg:pt-24">
          {/* Completion Rate Card */}
          <div className="backdrop-blur-xl bg-[#0e2439]/60 border border-cyan-400/30 shadow-lg shadow-cyan-400/20 rounded-xl p-4 sm:p-6">
            <h3 className="text-lg font-bold text-white mb-4 text-center">Completion Rate</h3>
            <div className="text-center">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3">
                <svg className="w-20 h-20 sm:w-24 sm:h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-600"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray="251.2"
                    strokeDashoffset="55.264"
                    className="text-cyan-400"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl sm:text-2xl font-bold text-white">78%</span>
                </div>
              </div>
              <div className="text-white font-medium text-sm sm:text-base">Overall Progress</div>
            </div>
          </div>

          {/* Available Majors (API) */}
          <div className="backdrop-blur-xl bg-[#0e2439]/60 border border-cyan-400/30 shadow-lg shadow-cyan-400/20 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Available Majors</h3>
              {isLoadingMajors && <LoadingSpinner size="sm" />}
            </div>
            <div className="space-y-3 max-h-[300px] lg:max-h-[420px] overflow-y-auto pr-1">
              {isLoadingMajors ? (
                <p className="text-cyan-300 text-sm">Loading majors...</p>
              ) : majors.length === 0 ? (
                <p className="text-cyan-300 text-sm">No majors</p>
              ) : (
                majors.map(m => (
                  <div key={m._id} className="flex items-center gap-3 p-2 sm:p-3 rounded-lg bg-[#0e2439]/40 border border-cyan-400/20 hover:bg-[#0e2439]/60 transition-colors">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0" />
                    <span className="text-white/90 text-sm font-medium truncate">{m.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminOnly>
  )
}
