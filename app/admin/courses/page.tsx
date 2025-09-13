"use client"
import { useEffect, useMemo, useState } from "react"
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card"
import { NeuroButton } from "@/components/ui/neuro-button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
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
  Users2,
} from "lucide-react"
import Link from "next/link"
import AdminOnly from "../AdminOnly"
import { useAuth } from "@/lib/auth-context"
import { LogOut } from "lucide-react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Textarea } from "@/components/ui/textarea"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useToast } from "@/hooks/use-toast"
import { getApiUrl } from "@/lib/api-config"

const adminSidebarItems = [
 { icon: BarChart3, label: "Dashboard", href: "/admin", number: "1" },
  { icon: BookOpen, label: "Courses", href: "/admin/courses",active: true  },
  { icon: Users2, label: "Majors", href: "/admin/majors" },

  { icon: User, label: "Users", href: "/admin/users" },
  // { icon: FileText, label: "Questionnaires", href: "/admin/questionnaires" }
]

type CourseStatus = 'active' | 'draft' | 'inactive'
interface CourseDTO {
  _id: string
  title: string
  category: string
  durationWeeks: number
  instructor: string
  students: number
  status: CourseStatus
  price: number
  description?: string
  createdAt?: string
  updatedAt?: string
}

export default function CoursesManagement() {
  const { logout, getAuthHeaders } = useAuth()
  const { toast } = useToast()

  // Filters / query state
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  // Data state
  const [courses, setCourses] = useState<CourseDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  // Majors dropdown data
  const [majors, setMajors] = useState<{ _id: string; name: string }[]>([])
  const [isMajorsLoading, setIsMajorsLoading] = useState(false)

  // Pagination (basic)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  // Dialog state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<CourseDTO | null>(null)

  // Forms
  const emptyCourse = { title: "", category: "", durationWeeks: 0, instructor: "", price: 0, status: 'draft' as CourseStatus, description: "" }
  const [addForm, setAddForm] = useState({ ...emptyCourse })
  const [editForm, setEditForm] = useState({ ...emptyCourse, students: 0 })
  const [isSaving, setIsSaving] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
      case 'inactive':
        return 'bg-red-500/20 text-red-300 border border-red-400/30'
      case 'draft':
      default:
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30'
    }
  }

  const validateCourse = (data: Partial<CourseDTO> & { price?: number; durationWeeks?: number }) => {
    const errors: Record<string, string> = {}
    if (!data.title || !data.title.trim()) errors.title = 'Title is required'
  if (!data.category || !data.category.trim()) errors.category = 'Major is required'
    if (data.durationWeeks === undefined || data.durationWeeks === null || isNaN(Number(data.durationWeeks)) || Number(data.durationWeeks) <= 0) errors.durationWeeks = 'Duration must be > 0'
    if (!data.instructor || !data.instructor.trim()) errors.instructor = 'Instructor is required'
    if (data.price === undefined || data.price === null || isNaN(Number(data.price)) || Number(data.price) < 0) errors.price = 'Price must be >= 0'
    if (data.status && !['active','draft','inactive'].includes(data.status)) errors.status = 'Invalid status'
    return errors
  }

  const buildQuery = () => {
    const params = new URLSearchParams()
    if (searchTerm.trim()) params.append('q', searchTerm.trim())
    if (selectedStatus !== 'all') params.append('status', selectedStatus)
    if (page > 1) params.append('page', String(page))
    params.append('limit', String(limit))
    return params.toString()
  }

  const loadCourses = async () => {
    try {
      if (!isLoading) setIsFetching(true)
      const query = buildQuery()
      const res = await fetch(getApiUrl(`/admin/courses${query ? `?${query}` : ''}`), {
        headers: { 'Content-Type': 'application/json', ...(getAuthHeaders() as Record<string,string>) },
        credentials: 'include'
      })
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      const data = await res.json()
      if (data.success && Array.isArray(data.courses)) {
        setCourses(data.courses)
        setTotal(data.total || data.courses.length)
        setPages(data.pages || 1)
      } else {
        throw new Error('Invalid response')
      }
    } catch (e: any) {
      toast({ title: 'Failed to load courses', description: e.message || 'Try again.' })
    } finally {
      setIsLoading(false)
      setIsFetching(false)
    }
  }

  useEffect(() => {
    loadCourses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  // Load majors once for dropdown
  useEffect(() => {
    const loadMajors = async () => {
      try {
        setIsMajorsLoading(true)
        const res = await fetch(getApiUrl('/admin/majors?limit=200&status=active'), {
          headers: { 'Content-Type': 'application/json', ...(getAuthHeaders() as Record<string,string>) },
          credentials: 'include'
        })
        const text = await res.text();
        const data = text ? JSON.parse(text) : {}
        if (!res.ok) throw new Error(data?.message || `Failed majors (${res.status})`)
        const list = (data.data || data.majors || []).filter((m:any)=>m && m.name).map((m:any)=> ({ _id: String(m._id||m.id), name: m.name }))
        setMajors(list)
      } catch (e:any) {
        toast({ title: 'Failed to load majors', description: e.message || 'Dropdown will be empty.' })
      } finally { setIsMajorsLoading(false) }
    }
    loadMajors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredCourses = useMemo(() => courses, [courses])

  const openAdd = () => {
    setAddForm({ ...emptyCourse })
    setFormErrors({})
    setIsAddOpen(true)
  }

  const handleAdd = async () => {
    const errs = validateCourse(addForm)
    setFormErrors(errs)
    if (Object.keys(errs).length) return
    setIsSaving(true)
    try {
      const payload = { ...addForm, durationWeeks: Number(addForm.durationWeeks), price: Number(addForm.price) }
      const res = await fetch(getApiUrl('/admin/courses'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(getAuthHeaders() as Record<string,string>) },
        credentials: 'include',
        body: JSON.stringify(payload)
      })
      const data = await res.json().catch(()=>({}))
      if (!res.ok) throw new Error(data?.message || `Create failed (${res.status})`)
      setCourses(prev => [data.course as CourseDTO, ...prev])
      setIsAddOpen(false)
      toast({ title: 'Course created' })
    } catch (e: any) {
      toast({ title: 'Create failed', description: e.message || 'Check inputs.' })
    } finally { setIsSaving(false) }
  }

  const openEdit = (c: CourseDTO) => {
    setSelectedCourse(c)
    setEditForm({ title: c.title, category: c.category, durationWeeks: c.durationWeeks, instructor: c.instructor, price: c.price, status: c.status, description: c.description || '', students: c.students })
    setFormErrors({})
    setIsEditOpen(true)
  }

  const handleEdit = async () => {
    if (!selectedCourse) return
    const errs = validateCourse(editForm)
    setFormErrors(errs)
    if (Object.keys(errs).length) return
    setIsSaving(true)
    try {
      const payload: any = { ...editForm }
      delete payload.students
      const res = await fetch(getApiUrl(`/admin/courses/${selectedCourse._id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(getAuthHeaders() as Record<string,string>) },
        credentials: 'include',
        body: JSON.stringify(payload)
      })
      const data = await res.json().catch(()=>({}))
      if (!res.ok) throw new Error(data?.message || `Update failed (${res.status})`)
      setCourses(prev => prev.map(c => c._id === selectedCourse._id ? data.course as CourseDTO : c))
      setIsEditOpen(false)
      toast({ title: 'Course updated' })
    } catch (e: any) {
      toast({ title: 'Update failed', description: e.message || 'Try again.' })
    } finally { setIsSaving(false) }
  }

  const handleDelete = async () => {
    if (!pendingDeleteId) return
    try {
      const res = await fetch(getApiUrl(`/admin/courses/${pendingDeleteId}`), {
        method: 'DELETE',
        headers: { ...(getAuthHeaders() as Record<string,string>) },
        credentials: 'include'
      })
      const data = await res.json().catch(()=>({}))
      if (!res.ok) throw new Error(data?.message || `Delete failed (${res.status})`)
      setCourses(prev => prev.filter(c => c._id !== pendingDeleteId))
      toast({ title: 'Course deleted' })
    } catch (e: any) {
      toast({ title: 'Delete failed', description: e.message || 'Try again.' })
    } finally { setPendingDeleteId(null) }
  }

  const isAddValid = Object.keys(validateCourse(addForm)).length === 0
  const isEditValid = Object.keys(validateCourse(editForm)).length === 0

  return (
    <AdminOnly>
      <div className="min-h-screen bg-[#0e2439] flex flex-col lg:flex-row">
        <AdminSidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto w-full max-w-none">      
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8 pt-4 lg:pt-0">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Courses</h1>
                <p className="text-cyan-300 text-sm">Manage courses and content.</p>
              </div>
              {isFetching && <LoadingSpinner size="sm" />}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <NeuroButton onClick={openAdd} className="flex items-center gap-2 bg-cyan-400/20 border border-cyan-400/30 text-cyan-100 hover:bg-cyan-400/30 text-sm">
                <Plus className="h-4 w-4" />
                Add Course
              </NeuroButton>
              <NeuroButton variant="outline" size="sm" onClick={() => { setPage(1); loadCourses() }} className="border-cyan-400/30 text-cyan-100 hover:bg-cyan-400/10 text-sm">Reload</NeuroButton>
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
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-[#0e2439]/50 backdrop-blur-sm border border-cyan-400/30 focus:border-cyan-400/60 text-white placeholder-cyan-300/50 text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={selectedStatus}
                    onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); setTimeout(()=>loadCourses(),0) }}
                    className="px-3 py-2 bg-[#0e2439]/50 backdrop-blur-sm border border-cyan-400/30 rounded-md text-sm focus:border-cyan-400/60 focus:outline-none text-white min-w-[120px]"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <NeuroButton variant="outline" size="sm" onClick={() => { setPage(1); loadCourses() }} className="border-cyan-400/30 text-cyan-100 hover:bg-cyan-400/10">
                    <Filter className="h-4 w-4" />
                  </NeuroButton>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Courses Table */}
          <GlassCard className="bg-[#0e2439]/80 backdrop-blur-xl border border-cyan-400/20">
            <GlassCardHeader className="p-4 sm:p-6 pb-0">
              <GlassCardTitle className="text-white text-lg sm:text-xl">Courses ({filteredCourses.length})</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent className="p-4 sm:p-6">
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="w-full min-w-[800px] sm:min-w-0">
                  <thead>
                    <tr className="border-b border-cyan-400/20">
                      <th className="text-left py-3 px-2 sm:px-4 font-medium text-white text-sm">Title</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-medium text-white text-sm hidden sm:table-cell">Major</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-medium text-white text-sm hidden md:table-cell">Duration</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-medium text-white text-sm hidden lg:table-cell">Instructor</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-medium text-white text-sm">Students</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-medium text-white text-sm">Status</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-medium text-white text-sm hidden sm:table-cell">Price</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-medium text-white text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr><td colSpan={8} className="py-8 text-center text-cyan-300"><LoadingSpinner text="Loading courses..." /></td></tr>
                    ) : filteredCourses.length === 0 ? (
                      <tr><td colSpan={8} className="py-8 text-center text-cyan-300">No courses found</td></tr>
                    ) : (
                      filteredCourses.map(course => (
                        <tr key={course._id} className="border-b border-cyan-400/10 hover:bg-cyan-400/5 transition-all duration-300">
                          <td className="py-4 px-2 sm:px-4">
                            <div>
                              <p className="font-medium text-white text-sm">{course.title}</p>
                              <p className="text-xs text-cyan-300 sm:hidden">{course.category} • {course.durationWeeks}w</p>
                              <p className="text-xs text-cyan-300 hidden sm:block lg:hidden">{course.description ? course.description.slice(0,30) + (course.description.length>30?'...':'') : course.instructor}</p>
                            </div>
                          </td>
                          <td className="py-4 px-2 sm:px-4 text-sm text-cyan-300 hidden sm:table-cell">{course.category}</td>
                          <td className="py-4 px-2 sm:px-4 text-sm text-cyan-300 hidden md:table-cell">{course.durationWeeks} w</td>
                          <td className="py-4 px-2 sm:px-4 text-sm text-cyan-300 hidden lg:table-cell">{course.instructor}</td>
                          <td className="py-4 px-2 sm:px-4 text-sm text-cyan-300">{course.students}</td>
                          <td className="py-4 px-2 sm:px-4"><Badge className={`${getStatusColor(course.status)} text-xs font-medium capitalize`}>{course.status}</Badge></td>
                          <td className="py-4 px-2 sm:px-4 text-sm text-cyan-300 hidden sm:table-cell">${course.price}</td>
                          <td className="py-4 px-2 sm:px-4">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <NeuroButton variant="ghost" size="sm" title="View" onClick={() => { setSelectedCourse(course); setIsViewOpen(true) }} className="text-cyan-100 hover:bg-cyan-400/10 p-1 sm:p-2"><Eye className="h-3 w-3 sm:h-4 sm:w-4" /></NeuroButton>
                              <NeuroButton variant="ghost" size="sm" title="Edit" onClick={() => openEdit(course)} className="text-cyan-100 hover:bg-cyan-400/10 p-1 sm:p-2"><Edit className="h-3 w-3 sm:h-4 sm:w-4" /></NeuroButton>
                              <NeuroButton variant="ghost" size="sm" title="Delete" onClick={() => setPendingDeleteId(course._id)} className="text-red-300 hover:bg-red-500/10 p-1 sm:p-2"><Trash2 className="h-3 w-3 sm:h-4 sm:w-4" /></NeuroButton>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {pages > 1 && (
                <div className="flex items-center justify-between mt-4 text-cyan-300 text-sm">
                  <span>Page {page} of {pages}</span>
                  <div className="flex gap-2">
                    <NeuroButton variant="outline" size="sm" disabled={page===1} onClick={() => setPage(p => Math.max(1,p-1))} className="border-cyan-400/30">Prev</NeuroButton>
                    <NeuroButton variant="outline" size="sm" disabled={page===pages} onClick={() => setPage(p => Math.min(pages,p+1))} className="border-cyan-400/30">Next</NeuroButton>
                  </div>
                </div>
              )}
            </GlassCardContent>
          </GlassCard>

        {/* Add Modal */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="bg-[#0e2439]/90 backdrop-blur-xl border border-cyan-400/30 max-w-xl mx-4 sm:mx-auto max-h-[90vh]">
            <DialogHeader><DialogTitle className="text-white text-lg">Add Course</DialogTitle></DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div>
                <label className="text-sm text-white/80 block mb-1">Title *</label>
                <Input value={addForm.title} onChange={e=>setAddForm({...addForm,title:e.target.value})} className="bg-[#0e2439]/50 border-cyan-400/30 text-white text-sm" placeholder="Course title" />
                {formErrors.title && <p className="text-xs text-red-400 mt-1">{formErrors.title}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/80 block mb-1">Major *</label>
                  <select value={addForm.category} onChange={e=>setAddForm({...addForm,category:e.target.value})} className="w-full px-3 py-2 bg-[#0e2439]/50 border border-cyan-400/30 rounded-md text-sm focus:border-cyan-400/60 focus:outline-none text-white">
                    <option value="">Select a major</option>
                    {majors.map(m => <option key={m._id} value={m.name}>{m.name}</option>)}
                  </select>
                  {isMajorsLoading && <p className="text-xs text-cyan-300 mt-1">Loading majors...</p>}
                  {formErrors.category && <p className="text-xs text-red-400 mt-1">{formErrors.category}</p>}
                </div>
                <div>
                  <label className="text-sm text-white/80 block mb-1">Duration Weeks *</label>
                  <Input type="number" value={addForm.durationWeeks} onChange={e=>setAddForm({...addForm,durationWeeks:Number(e.target.value)})} className="bg-[#0e2439]/50 border-cyan-400/30 text-white text-sm" />
                  {formErrors.durationWeeks && <p className="text-xs text-red-400 mt-1">{formErrors.durationWeeks}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/80 block mb-1">Instructor *</label>
                  <Input value={addForm.instructor} onChange={e=>setAddForm({...addForm,instructor:e.target.value})} className="bg-[#0e2439]/50 border-cyan-400/30 text-white text-sm" />
                  {formErrors.instructor && <p className="text-xs text-red-400 mt-1">{formErrors.instructor}</p>}
                </div>
                <div>
                  <label className="text-sm text-white/80 block mb-1">Price (USD) *</label>
                  <Input type="number" value={addForm.price} onChange={e=>setAddForm({...addForm,price:Number(e.target.value)})} className="bg-[#0e2439]/50 border-cyan-400/30 text-white text-sm" />
                  {formErrors.price && <p className="text-xs text-red-400 mt-1">{formErrors.price}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/80 block mb-1">Status</label>
                  <select value={addForm.status} onChange={e=>setAddForm({...addForm,status:e.target.value as CourseStatus})} className="w-full px-3 py-2 bg-[#0e2439]/50 border border-cyan-400/30 rounded-md text-sm focus:border-cyan-400/60 focus:outline-none text-white">
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm text-white/80 block mb-1">Description</label>
                <Textarea value={addForm.description} onChange={e=>setAddForm({...addForm,description:e.target.value})} className="bg-[#0e2439]/50 border-cyan-400/30 text-white resize-none min-h-20 text-sm" placeholder="Optional description" />
              </div>
            </div>
            <DialogFooter className="mt-4 flex-col sm:flex-row gap-2">
              <NeuroButton variant="outline" onClick={()=>setIsAddOpen(false)} className="border-cyan-400/30 text-cyan-100 w-full sm:w-auto text-sm">Cancel</NeuroButton>
              <NeuroButton onClick={handleAdd} disabled={isSaving || !isAddValid} className="bg-cyan-400/20 border border-cyan-400/30 text-cyan-100 hover:bg-cyan-400/30 disabled:opacity-50 w-full sm:w-auto text-sm">
                {isSaving ? 'Saving...' : 'Create'}
              </NeuroButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="bg-[#0e2439]/90 backdrop-blur-xl border border-cyan-400/30 max-w-xl mx-4 sm:mx-auto max-h-[90vh]">
            <DialogHeader><DialogTitle className="text-white text-lg">Edit Course</DialogTitle></DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div>
                <label className="text-sm text-white/80 block mb-1">Title *</label>
                <Input value={editForm.title} onChange={e=>setEditForm({...editForm,title:e.target.value})} className="bg-[#0e2439]/50 border-cyan-400/30 text-white text-sm" />
                {formErrors.title && <p className="text-xs text-red-400 mt-1">{formErrors.title}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/80 block mb-1">Major *</label>
                  <select value={editForm.category} onChange={e=>setEditForm({...editForm,category:e.target.value})} className="w-full px-3 py-2 bg-[#0e2439]/50 border border-cyan-400/30 rounded-md text-sm focus:border-cyan-400/60 focus:outline-none text-white">
                    {/* Ensure existing category shown even if not in majors list */}
                    {editForm.category && !majors.some(m=>m.name===editForm.category) && <option value={editForm.category}>{editForm.category} (deprecated)</option>}
                    <option value="">Select a major</option>
                    {majors.map(m => <option key={m._id} value={m.name}>{m.name}</option>)}
                  </select>
                  {isMajorsLoading && <p className="text-xs text-cyan-300 mt-1">Loading majors...</p>}
                  {formErrors.category && <p className="text-xs text-red-400 mt-1">{formErrors.category}</p>}
                </div>
                <div>
                  <label className="text-sm text-white/80 block mb-1">Duration Weeks *</label>
                  <Input type="number" value={editForm.durationWeeks} onChange={e=>setEditForm({...editForm,durationWeeks:Number(e.target.value)})} className="bg-[#0e2439]/50 border-cyan-400/30 text-white text-sm" />
                  {formErrors.durationWeeks && <p className="text-xs text-red-400 mt-1">{formErrors.durationWeeks}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/80 block mb-1">Instructor *</label>
                  <Input value={editForm.instructor} onChange={e=>setEditForm({...editForm,instructor:e.target.value})} className="bg-[#0e2439]/50 border-cyan-400/30 text-white text-sm" />
                  {formErrors.instructor && <p className="text-xs text-red-400 mt-1">{formErrors.instructor}</p>}
                </div>
                <div>
                  <label className="text-sm text-white/80 block mb-1">Price (USD) *</label>
                  <Input type="number" value={editForm.price} onChange={e=>setEditForm({...editForm,price:Number(e.target.value)})} className="bg-[#0e2439]/50 border-cyan-400/30 text-white text-sm" />
                  {formErrors.price && <p className="text-xs text-red-400 mt-1">{formErrors.price}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/80 block mb-1">Status</label>
                  <select value={editForm.status} onChange={e=>setEditForm({...editForm,status:e.target.value as CourseStatus})} className="w-full px-3 py-2 bg-[#0e2439]/50 border border-cyan-400/30 rounded-md text-sm focus:border-cyan-400/60 focus:outline-none text-white">
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-white/80 block mb-1">Students</label>
                  <Input value={editForm.students} disabled className="bg-[#0e2439]/30 border-cyan-400/20 text-white/70 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-sm text-white/80 block mb-1">Description</label>
                <Textarea value={editForm.description} onChange={e=>setEditForm({...editForm,description:e.target.value})} className="bg-[#0e2439]/50 border-cyan-400/30 text-white resize-none min-h-20 text-sm" />
              </div>
            </div>
            <DialogFooter className="mt-4 flex-col sm:flex-row gap-2">
              <NeuroButton variant="outline" onClick={()=>setIsEditOpen(false)} className="border-cyan-400/30 text-cyan-100 w-full sm:w-auto text-sm">Cancel</NeuroButton>
              <NeuroButton onClick={handleEdit} disabled={isSaving || !isEditValid} className="bg-cyan-400/20 border border-cyan-400/30 text-cyan-100 hover:bg-cyan-400/30 disabled:opacity-50 w-full sm:w-auto text-sm">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </NeuroButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Modal */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="bg-[#0e2439]/90 backdrop-blur-xl border border-cyan-400/30 max-w-lg mx-4 sm:mx-auto">
            <DialogHeader><DialogTitle className="text-white text-lg">Course Details</DialogTitle></DialogHeader>
            {selectedCourse && (
              <div className="space-y-3 text-white/90 text-sm max-h-[60vh] overflow-y-auto">
                <div className="flex justify-between items-start"><span className="text-white/60 min-w-0 mr-4">Title</span><span className="text-right break-words">{selectedCourse.title}</span></div>
                <div className="flex justify-between"><span className="text-white/60">Major</span><span>{selectedCourse.category}</span></div>
                <div className="flex justify-between"><span className="text-white/60">Duration</span><span>{selectedCourse.durationWeeks} weeks</span></div>
                <div className="flex justify-between"><span className="text-white/60">Instructor</span><span>{selectedCourse.instructor}</span></div>
                <div className="flex justify-between"><span className="text-white/60">Students</span><span>{selectedCourse.students}</span></div>
                <div className="flex justify-between"><span className="text-white/60">Status</span><span className="capitalize">{selectedCourse.status}</span></div>
                <div className="flex justify-between"><span className="text-white/60">Price</span><span>${selectedCourse.price}</span></div>
                {selectedCourse.description && <div className="pt-2"><span className="block text-white/60 mb-2">Description</span><p className="text-white/80 leading-relaxed text-sm break-words">{selectedCourse.description}</p></div>}
                <div className="flex justify-between text-xs pt-2 border-t border-cyan-400/20"><span className="text-white/50">Created</span><span>{selectedCourse.createdAt ? new Date(selectedCourse.createdAt).toLocaleString() : '—'}</span></div>
                <div className="flex justify-between text-xs"><span className="text-white/50">Updated</span><span>{selectedCourse.updatedAt ? new Date(selectedCourse.updatedAt).toLocaleString() : '—'}</span></div>
              </div>
            )}
            <DialogFooter>
              <NeuroButton variant="outline" onClick={()=>setIsViewOpen(false)} className="border-cyan-400/30 text-cyan-100 w-full sm:w-auto text-sm">Close</NeuroButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm */}
        <AlertDialog open={!!pendingDeleteId} onOpenChange={(open)=>!open && setPendingDeleteId(null)}>
          <AlertDialogContent className="bg-[#0e2439]/90 backdrop-blur-xl border border-cyan-400/30">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Delete course?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone. This will permanently delete the course.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-transparent border border-cyan-400/30 text-cyan-100">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </div>
      </div>
    </AdminOnly>
  )
}
