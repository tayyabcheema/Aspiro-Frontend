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
  Users2,
  LogOut
} from "lucide-react"
import Link from "next/link"
import AdminOnly from "../AdminOnly"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/loading-spinner"
import { getApiUrl } from "@/lib/api-config"

const adminSidebarItems = [
 { icon: BarChart3, label: "Dashboard", href: "/admin", number: "1" },
  { icon: BookOpen, label: "Courses", href: "/admin/courses" },
  { icon: Users2, label: "Majors", href: "/admin/majors", active: true },

  { icon: User, label: "Users", href: "/admin/users" },
  // { icon: FileText, label: "Questionnaires", href: "/admin/questionnaires" }
]

// Types
type MajorStatus = 'active' | 'inactive' | 'draft'
interface MajorDTO {
  _id: string
  name: string
  department: string
  description?: string
  students: number
  courses: number
  status: MajorStatus
  createdAt?: string
  updatedAt?: string
}

export default function MajorsManagement() {
  const { getAuthHeaders, logout } = useAuth()
  const { toast } = useToast()

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")

  // Data state
  const [majors, setMajors] = useState<MajorDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  // Dialogs & forms
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [selectedMajor, setSelectedMajor] = useState<MajorDTO | null>(null)

  const emptyMajor = { name: "", department: "", description: "", students: 0, courses: 0, status: 'draft' as MajorStatus }
  const [addForm, setAddForm] = useState({ ...emptyMajor })
  const [editForm, setEditForm] = useState({ ...emptyMajor })
  const [isSaving, setIsSaving] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string,string>>({})

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

  const validateMajor = (data: Partial<MajorDTO>) => {
    const errors: Record<string,string> = {}
    if (!data.name || !data.name.trim()) errors.name = 'Name is required'
    if (!data.department || !data.department.trim()) errors.department = 'Department is required'
    if (data.students !== undefined && (isNaN(Number(data.students)) || Number(data.students) < 0)) errors.students = 'Students must be >= 0'
    if (data.courses !== undefined && (isNaN(Number(data.courses)) || Number(data.courses) < 0)) errors.courses = 'Courses must be >= 0'
    if (data.status && !['active','inactive','draft'].includes(data.status)) errors.status = 'Invalid status'
    return errors
  }

  const buildQuery = () => {
    const params = new URLSearchParams()
    if (searchTerm.trim()) params.append('q', searchTerm.trim())
    if (selectedStatus !== 'all') params.append('status', selectedStatus)
    if (selectedDepartment !== 'all') params.append('department', selectedDepartment)
    params.append('page', String(page))
    params.append('limit', String(limit))
    return params.toString()
  }

  const mapMajor = (raw: any): MajorDTO => ({
    _id: String(raw._id || raw.id),
    name: raw.name,
    department: raw.department,
    description: raw.description,
    students: raw.students ?? 0,
    courses: raw.courses ?? 0,
    status: raw.status as MajorStatus,
    createdAt: raw.createdAt || raw.created,
    updatedAt: raw.updatedAt || raw.lastUpdated
  })

  const loadMajors = async () => {
    try {
      if (!isLoading) setIsFetching(true)
      const query = buildQuery()
      const res = await fetch(getApiUrl(`/admin/majors?${query}`), {
        headers: { 'Content-Type': 'application/json', ...(getAuthHeaders() as Record<string,string>) },
        credentials: 'include'
      })
      const text = await res.text();
      const data = text ? JSON.parse(text) : {}
      if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`)
      if (!data.success || !Array.isArray(data.data)) throw new Error('Invalid response')
      const mapped = data.data.map(mapMajor)
      setMajors(mapped)
      setTotal(data.total ?? mapped.length)
      setTotalPages(data.totalPages ?? data.pages ?? 1)
    } catch (e:any) {
      toast({ title: 'Failed to load majors', description: e.message || 'Try again.' })
    } finally {
      setIsLoading(false)
      setIsFetching(false)
    }
  }

  useEffect(() => { loadMajors() // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const filteredMajors = useMemo(() => majors, [majors])

  const openAdd = () => { setAddForm({ ...emptyMajor }); setFormErrors({}); setIsAddOpen(true) }

  const handleAdd = async () => {
    const errs = validateMajor(addForm)
    setFormErrors(errs)
    if (Object.keys(errs).length) return
    setIsSaving(true)
    try {
      const payload = { ...addForm, students: Number(addForm.students), courses: Number(addForm.courses) }
      const res = await fetch(getApiUrl('/admin/majors'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(getAuthHeaders() as Record<string,string>) },
        credentials: 'include',
        body: JSON.stringify(payload)
      })
      const text = await res.text(); const data = text ? JSON.parse(text) : {}
      if (!res.ok) throw new Error(data?.message || `Create failed (${res.status})`)
      if (!data?.data) throw new Error('Malformed response')
      setMajors(prev => [mapMajor(data.data), ...prev])
      setIsAddOpen(false)
      toast({ title: 'Major created' })
    } catch (e:any) {
      toast({ title: 'Create failed', description: e.message || 'Check inputs.' })
    } finally { setIsSaving(false) }
  }

  const openEdit = (m: MajorDTO) => {
    setSelectedMajor(m)
    setEditForm({ name: m.name, department: m.department, description: m.description || '', students: m.students, courses: m.courses, status: m.status })
    setFormErrors({})
    setIsEditOpen(true)
  }

  const handleEdit = async () => {
    if (!selectedMajor) return
    const errs = validateMajor(editForm)
    setFormErrors(errs)
    if (Object.keys(errs).length) return
    setIsSaving(true)
    try {
      const payload: any = { ...editForm, students: Number(editForm.students), courses: Number(editForm.courses) }
      const res = await fetch(getApiUrl(`/admin/majors/${selectedMajor._id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(getAuthHeaders() as Record<string,string>) },
        credentials: 'include',
        body: JSON.stringify(payload)
      })
      const text = await res.text(); const data = text ? JSON.parse(text) : {}
      if (!res.ok) throw new Error(data?.message || `Update failed (${res.status})`)
      if (!data?.data) throw new Error('Malformed response')
      const updated = mapMajor(data.data)
      setMajors(prev => prev.map(m => m._id === updated._id ? updated : m))
      setIsEditOpen(false)
      toast({ title: 'Major updated' })
    } catch (e:any) {
      toast({ title: 'Update failed', description: e.message || 'Try again.' })
    } finally { setIsSaving(false) }
  }

  const handleDelete = async () => {
    if (!pendingDeleteId) return
    try {
      const res = await fetch(getApiUrl(`/admin/majors/${pendingDeleteId}`), {
        method: 'DELETE',
        headers: { ...(getAuthHeaders() as Record<string,string>) },
        credentials: 'include'
      })
      const text = await res.text(); const data = text ? JSON.parse(text) : {}
      if (!res.ok) throw new Error(data?.message || `Delete failed (${res.status})`)
      setMajors(prev => prev.filter(m => m._id !== pendingDeleteId))
      toast({ title: 'Major deleted' })
    } catch (e:any) {
      toast({ title: 'Delete failed', description: e.message || 'Try again.' })
    } finally { setPendingDeleteId(null) }
  }

  const isAddValid = Object.keys(validateMajor(addForm)).length === 0
  const isEditValid = Object.keys(validateMajor(editForm)).length === 0

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
                <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Majors</h1>
                <p className="text-cyan-300 text-sm">Manage academic majors and degree programs.</p>
              </div>
              {isFetching && <LoadingSpinner size="sm" />}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <NeuroButton onClick={openAdd} className="flex items-center gap-2 bg-cyan-400/20 border border-cyan-400/30 text-cyan-100 hover:bg-cyan-400/30 text-sm">
                <Plus className="h-4 w-4" />
                Add Major
              </NeuroButton>
              <NeuroButton variant="outline" size="sm" onClick={() => { setPage(1); loadMajors() }} className="border-cyan-400/30 text-cyan-100 hover:bg-cyan-400/10 text-sm">Reload</NeuroButton>
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
                      placeholder="Search majors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-[#0e2439]/50 backdrop-blur-sm border border-cyan-400/30 focus:border-cyan-400/60 text-white placeholder-cyan-300/50 text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={selectedStatus}
                    onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); setTimeout(()=>loadMajors(),0) }}
                    className="px-3 py-2 bg-[#0e2439]/50 backdrop-blur-sm border border-cyan-400/30 rounded-md text-sm focus:border-cyan-400/60 focus:outline-none text-white min-w-[120px]"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <select
                    value={selectedDepartment}
                    onChange={(e)=> { setSelectedDepartment(e.target.value); setPage(1); setTimeout(()=>loadMajors(),0) }}
                    className="px-3 py-2 bg-[#0e2439]/50 backdrop-blur-sm border border-cyan-400/30 rounded-md text-sm focus:border-cyan-400/60 focus:outline-none text-white min-w-[140px]"
                  >
                    <option value="all">All Departments</option>
                    {Array.from(new Set(majors.map(m=>m.department))).map(dep => <option key={dep} value={dep}>{dep}</option>)}
                  </select>
                  <NeuroButton variant="outline" size="sm" onClick={() => { setPage(1); loadMajors() }} className="border-cyan-400/30 text-cyan-100 hover:bg-cyan-400/10">
                    <Filter className="h-4 w-4" />
                  </NeuroButton>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Majors Table */}
          <GlassCard className="bg-[#0e2439]/80 backdrop-blur-xl border border-cyan-400/20">
            <GlassCardHeader className="p-4 sm:p-6 pb-0">
              <div className="flex items-center gap-3">
                <GlassCardTitle className="text-white text-lg sm:text-xl">Majors ({filteredMajors.length})</GlassCardTitle>
                {isFetching && <LoadingSpinner size="sm" />}
              </div>
            </GlassCardHeader>
            <GlassCardContent className="p-4 sm:p-6">
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="w-full min-w-[700px] sm:min-w-0">
                  <thead>
                    <tr className="border-b border-cyan-400/20">
                      <th className="text-left py-3 px-2 sm:px-4 font-medium text-white text-sm">Major</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-medium text-white text-sm hidden sm:table-cell">Department</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-medium text-white text-sm">Students</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-medium text-white text-sm hidden md:table-cell">Courses</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-medium text-white text-sm">Status</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-medium text-white text-sm hidden lg:table-cell">Updated</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-medium text-white text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr><td colSpan={7} className="py-8 text-center text-cyan-300"><LoadingSpinner text="Loading majors..." /></td></tr>
                    ) : filteredMajors.length === 0 ? (
                      <tr><td colSpan={7} className="py-8 text-center text-cyan-300">No majors found</td></tr>
                    ) : (
                      filteredMajors.map(major => (
                        <tr key={major._id} className="border-b border-cyan-400/10 hover:bg-cyan-400/5 transition-all duration-300">
                          <td className="py-4 px-2 sm:px-4">
                            <div>
                              <p className="font-medium text-white text-sm">{major.name}</p>
                              <p className="text-xs text-cyan-300 sm:hidden">{major.department} • {major.courses} courses</p>
                              <p className="text-xs text-cyan-300 hidden sm:block lg:hidden">{major.description ? (major.description.length>40? major.description.slice(0,40)+"..." : major.description) : `${major.courses} courses`}</p>
                            </div>
                          </td>
                          <td className="py-4 px-2 sm:px-4 text-sm text-cyan-300 hidden sm:table-cell">{major.department}</td>
                          <td className="py-4 px-2 sm:px-4 text-sm text-cyan-300">{major.students}</td>
                          <td className="py-4 px-2 sm:px-4 text-sm text-cyan-300 hidden md:table-cell">{major.courses}</td>
                          <td className="py-4 px-2 sm:px-4"><Badge className={`${getStatusColor(major.status)} text-xs font-medium capitalize`}>{major.status}</Badge></td>
                          <td className="py-4 px-2 sm:px-4 text-sm text-cyan-300 hidden lg:table-cell">{major.updatedAt ? new Date(major.updatedAt).toLocaleDateString() : '—'}</td>
                          <td className="py-4 px-2 sm:px-4">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <NeuroButton variant="ghost" size="sm" title="View" onClick={() => { setSelectedMajor(major); setIsViewOpen(true) }} className="text-cyan-100 hover:bg-cyan-400/10 p-1 sm:p-2"><Eye className="h-3 w-3 sm:h-4 sm:w-4" /></NeuroButton>
                              <NeuroButton variant="ghost" size="sm" title="Edit" onClick={() => openEdit(major)} className="text-cyan-100 hover:bg-cyan-400/10 p-1 sm:p-2"><Edit className="h-3 w-3 sm:h-4 sm:w-4" /></NeuroButton>
                              <NeuroButton variant="ghost" size="sm" title="Delete" onClick={() => setPendingDeleteId(major._id)} className="text-red-300 hover:bg-red-500/10 p-1 sm:p-2"><Trash2 className="h-3 w-3 sm:h-4 sm:w-4" /></NeuroButton>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 text-cyan-300 text-sm">
                  <span>Page {page} of {totalPages}</span>
                  <div className="flex gap-2">
                    <NeuroButton variant="outline" size="sm" disabled={page===1} onClick={()=> setPage(p=> Math.max(1,p-1))} className="border-cyan-400/30">Prev</NeuroButton>
                    <NeuroButton variant="outline" size="sm" disabled={page===totalPages} onClick={()=> setPage(p=> Math.min(totalPages,p+1))} className="border-cyan-400/30">Next</NeuroButton>
                  </div>
                </div>
              )}
            </GlassCardContent>
          </GlassCard>

        {/* Add Modal */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="bg-[#0e2439]/90 backdrop-blur-xl border border-cyan-400/30 max-w-xl mx-4 sm:mx-auto max-h-[90vh]">
            <DialogHeader><DialogTitle className="text-white text-lg">Add Major</DialogTitle></DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div>
                <label className="text-sm text-white/80 block mb-1">Name *</label>
                <Input value={addForm.name} onChange={e=>setAddForm({...addForm,name:e.target.value})} className="bg-[#0e2439]/50 border-cyan-400/30 text-white text-sm" placeholder="Major name" />
                {formErrors.name && <p className="text-xs text-red-400 mt-1">{formErrors.name}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/80 block mb-1">Department *</label>
                  <Input value={addForm.department} onChange={e=>setAddForm({...addForm,department:e.target.value})} className="bg-[#0e2439]/50 border-cyan-400/30 text-white text-sm" placeholder="e.g. Engineering" />
                  {formErrors.department && <p className="text-xs text-red-400 mt-1">{formErrors.department}</p>}
                </div>
                <div>
                  <label className="text-sm text-white/80 block mb-1">Status</label>
                  <select value={addForm.status} onChange={e=>setAddForm({...addForm,status:e.target.value as MajorStatus})} className="w-full px-3 py-2 bg-[#0e2439]/50 border border-cyan-400/30 rounded-md text-sm focus:border-cyan-400/60 focus:outline-none text-white">
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/80 block mb-1">Students</label>
                  <Input type="number" value={addForm.students} onChange={e=>setAddForm({...addForm,students:Number(e.target.value)})} className="bg-[#0e2439]/50 border-cyan-400/30 text-white text-sm" />
                  {formErrors.students && <p className="text-xs text-red-400 mt-1">{formErrors.students}</p>}
                </div>
                <div>
                  <label className="text-sm text-white/80 block mb-1">Courses</label>
                  <Input type="number" value={addForm.courses} onChange={e=>setAddForm({...addForm,courses:Number(e.target.value)})} className="bg-[#0e2439]/50 border-cyan-400/30 text-white text-sm" />
                  {formErrors.courses && <p className="text-xs text-red-400 mt-1">{formErrors.courses}</p>}
                </div>
              </div>
              <div>
                <label className="text-sm text-white/80 block mb-1">Description</label>
                <Textarea value={addForm.description} onChange={e=>setAddForm({...addForm,description:e.target.value})} className="bg-[#0e2439]/50 border-cyan-400/30 text-white resize-none min-h-20 text-sm" placeholder="Optional description" />
              </div>
            </div>
            <DialogFooter className="mt-4 flex-col sm:flex-row gap-2">
              <NeuroButton variant="outline" onClick={()=>setIsAddOpen(false)} className="border-cyan-400/30 text-cyan-100 w-full sm:w-auto text-sm">Cancel</NeuroButton>
              <NeuroButton onClick={handleAdd} disabled={isSaving || !isAddValid} className="bg-cyan-400/20 border border-cyan-400/30 text-cyan-100 hover:bg-cyan-400/30 disabled:opacity-50 w-full sm:w-auto text-sm">{isSaving? 'Saving...' : 'Create'}</NeuroButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="bg-[#0e2439]/90 backdrop-blur-xl border border-cyan-400/30 max-w-xl mx-4 sm:mx-auto max-h-[90vh]">
            <DialogHeader><DialogTitle className="text-white text-lg">Edit Major</DialogTitle></DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div>
                <label className="text-sm text-white/80 block mb-1">Name *</label>
                <Input value={editForm.name} onChange={e=>setEditForm({...editForm,name:e.target.value})} className="bg-[#0e2439]/50 border-cyan-400/30 text-white text-sm" />
                {formErrors.name && <p className="text-xs text-red-400 mt-1">{formErrors.name}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/80 block mb-1">Department *</label>
                  <Input value={editForm.department} onChange={e=>setEditForm({...editForm,department:e.target.value})} className="bg-[#0e2439]/50 border-cyan-400/30 text-white text-sm" />
                  {formErrors.department && <p className="text-xs text-red-400 mt-1">{formErrors.department}</p>}
                </div>
                <div>
                  <label className="text-sm text-white/80 block mb-1">Status</label>
                  <select value={editForm.status} onChange={e=>setEditForm({...editForm,status:e.target.value as MajorStatus})} className="w-full px-3 py-2 bg-[#0e2439]/50 border border-cyan-400/30 rounded-md text-sm focus:border-cyan-400/60 focus:outline-none text-white">
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/80 block mb-1">Students</label>
                  <Input type="number" value={editForm.students} onChange={e=>setEditForm({...editForm,students:Number(e.target.value)})} className="bg-[#0e2439]/50 border-cyan-400/30 text-white text-sm" />
                  {formErrors.students && <p className="text-xs text-red-400 mt-1">{formErrors.students}</p>}
                </div>
                <div>
                  <label className="text-sm text-white/80 block mb-1">Courses</label>
                  <Input type="number" value={editForm.courses} onChange={e=>setEditForm({...editForm,courses:Number(e.target.value)})} className="bg-[#0e2439]/50 border-cyan-400/30 text-white text-sm" />
                  {formErrors.courses && <p className="text-xs text-red-400 mt-1">{formErrors.courses}</p>}
                </div>
              </div>
              <div>
                <label className="text-sm text-white/80 block mb-1">Description</label>
                <Textarea value={editForm.description} onChange={e=>setEditForm({...editForm,description:e.target.value})} className="bg-[#0e2439]/50 border-cyan-400/30 text-white resize-none min-h-20 text-sm" />
              </div>
            </div>
            <DialogFooter className="mt-4 flex-col sm:flex-row gap-2">
              <NeuroButton variant="outline" onClick={()=>setIsEditOpen(false)} className="border-cyan-400/30 text-cyan-100 w-full sm:w-auto text-sm">Cancel</NeuroButton>
              <NeuroButton onClick={handleEdit} disabled={isSaving || !isEditValid} className="bg-cyan-400/20 border border-cyan-400/30 text-cyan-100 hover:bg-cyan-400/30 disabled:opacity-50 w-full sm:w-auto text-sm">{isSaving? 'Saving...' : 'Save Changes'}</NeuroButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Modal */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="bg-[#0e2439]/90 backdrop-blur-xl border border-cyan-400/30 max-w-lg mx-4 sm:mx-auto">
            <DialogHeader><DialogTitle className="text-white text-lg">Major Details</DialogTitle></DialogHeader>
            {selectedMajor && (
              <div className="space-y-3 text-white/90 text-sm max-h-[60vh] overflow-y-auto">
                <div className="flex justify-between items-start"><span className="text-white/60 min-w-0 mr-4">Name</span><span className="text-right break-words">{selectedMajor.name}</span></div>
                <div className="flex justify-between"><span className="text-white/60">Department</span><span>{selectedMajor.department}</span></div>
                <div className="flex justify-between"><span className="text-white/60">Students</span><span>{selectedMajor.students}</span></div>
                <div className="flex justify-between"><span className="text-white/60">Courses</span><span>{selectedMajor.courses}</span></div>
                <div className="flex justify-between"><span className="text-white/60">Status</span><span className="capitalize">{selectedMajor.status}</span></div>
                {selectedMajor.description && <div className="pt-2"><span className="block text-white/60 mb-2">Description</span><p className="text-white/80 leading-relaxed text-sm break-words">{selectedMajor.description}</p></div>}
                <div className="flex justify-between text-xs pt-2 border-t border-cyan-400/20"><span className="text-white/50">Created</span><span>{selectedMajor.createdAt ? new Date(selectedMajor.createdAt).toLocaleDateString() : '—'}</span></div>
                <div className="flex justify-between text-xs"><span className="text-white/50">Updated</span><span>{selectedMajor.updatedAt ? new Date(selectedMajor.updatedAt).toLocaleDateString() : '—'}</span></div>
              </div>
            )}
            <DialogFooter>
              <NeuroButton variant="outline" onClick={()=>setIsViewOpen(false)} className="border-cyan-400/30 text-cyan-100 w-full sm:w-auto text-sm">Close</NeuroButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm */}
        <AlertDialog open={!!pendingDeleteId} onOpenChange={(open)=> !open && setPendingDeleteId(null)}>
          <AlertDialogContent className="bg-[#0e2439]/90 backdrop-blur-xl border border-cyan-400/30">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Delete major?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone. This will permanently delete the major.</AlertDialogDescription>
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
