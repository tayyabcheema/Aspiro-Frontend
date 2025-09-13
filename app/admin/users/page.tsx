"use client"
import { useEffect, useMemo, useState } from "react"
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card"
import { NeuroButton } from "@/components/ui/neuro-button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import {
  Users,
  BookOpen,
  Settings,
  BarChart3,
  Search,
  Filter,
  FileText,
  User,
  ChevronDown,
  Users2,
  Eye,
  Edit,
  Trash2,
  Plus,
} from "lucide-react"
import Link from "next/link"
import AdminOnly from "../AdminOnly"
import { AdminSidebar } from "@/components/admin-sidebar"
import { useAuth } from "@/lib/auth-context"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useToast } from "@/hooks/use-toast"
import { getApiUrl } from "@/lib/api-config"

const adminSidebarItems = [
  { icon: BarChart3, label: "Dashboard", href: "/admin", number: "1" },
  { icon: BookOpen, label: "Courses", href: "/admin/courses" },
  { icon: Users2, label: "Majors", href: "/admin/majors" },
  { icon: Users2, label: "Users", href: "/admin/users", active: true },
  // { icon: FileText, label: "Questionnaires", href: "/admin/questionnaires" },
]

type Role = "admin" | "user"
type AdminUser = {
  _id: string
  fullName: string
  email: string
  role: Role
  createdAt?: string
  updatedAt?: string
}

export default function UsersManagement() {
  const { getAuthHeaders, logout } = useAuth()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState<string>("all")

  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)

  // Dialog state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)

  // Forms
  const [addForm, setAddForm] = useState({ fullName: "", email: "", password: "", role: "user" as Role })
  const [editForm, setEditForm] = useState<{ fullName: string; email: string; role: Role; password?: string }>({
    fullName: "",
    email: "",
    role: "user",
    password: "",
  })
  const [isSaving, setIsSaving] = useState(false)

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-600 text-white"
      default:
        return "bg-cyan-400 text-black"
    }
  }

  const loadUsers = async () => {
    try {
      setIsFetching(true)
      const res = await fetch(getApiUrl('/admin/users'), {
        headers: {
          "Content-Type": "application/json",
          ...(getAuthHeaders() as Record<string, string>),
        },
        credentials: "include",
      })
      if (!res.ok) throw new Error(`Failed to load users (${res.status})`)
      const data = await res.json()
      if (data?.success && Array.isArray(data.users)) {
        setUsers(data.users)
      } else {
        throw new Error("Invalid response")
      }
    } catch (e: any) {
      toast({ title: "Failed to load users", description: e.message || "Please try again." })
    } finally {
      setIsLoading(false)
      setIsFetching(false)
    }
  }

  useEffect(() => {
    loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return users.filter((u) => {
      const matchesSearch = !term || u.fullName.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
      const matchesRole = selectedRole === "all" || u.role === (selectedRole as Role)
      return matchesSearch && matchesRole
    })
  }, [users, searchTerm, selectedRole])

  // CRUD handlers
  const handleAdd = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(getApiUrl('/admin/users'), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(getAuthHeaders() as Record<string, string>),
        },
        credentials: "include",
        body: JSON.stringify(addForm),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || `Create failed (${res.status})`)
      setUsers((prev) => [data.user as AdminUser, ...prev])
      setIsAddOpen(false)
      setAddForm({ fullName: "", email: "", password: "", role: "user" })
      toast({ title: "User created" })
    } catch (e: any) {
      toast({ title: "Create failed", description: e.message || "Please check inputs." })
    } finally {
      setIsSaving(false)
    }
  }

  const openEdit = (u: AdminUser) => {
    setSelectedUser(u)
    setEditForm({ fullName: u.fullName, email: u.email, role: u.role, password: "" })
    setIsEditOpen(true)
  }

  const handleEdit = async () => {
    if (!selectedUser) return
    setIsSaving(true)
    const payload: any = { fullName: editForm.fullName, email: editForm.email, role: editForm.role }
    if (editForm.password) payload.password = editForm.password
    try {
      const res = await fetch(getApiUrl(`/admin/users/${selectedUser._id}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(getAuthHeaders() as Record<string, string>),
        },
        credentials: "include",
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || `Update failed (${res.status})`)
      setUsers((prev) => prev.map((u) => (u._id === selectedUser._id ? (data.user as AdminUser) : u)))
      setIsEditOpen(false)
      toast({ title: "User updated" })
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message || "Please try again." })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!pendingDeleteId) return
    try {
      const res = await fetch(getApiUrl(`/admin/users/${pendingDeleteId}`), {
        method: "DELETE",
        headers: {
          ...(getAuthHeaders() as Record<string, string>),
        },
        credentials: "include",
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || `Delete failed (${res.status})`)
      setUsers((prev) => prev.filter((u) => u._id !== pendingDeleteId))
      toast({ title: "User deleted" })
    } catch (e: any) {
      toast({ title: "Delete failed", description: e.message || "Please try again." })
    } finally {
      setPendingDeleteId(null)
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
              <h1 className="text-xl sm:text-2xl font-bold text-white">Users</h1>
              <p className="text-cyan-300 text-sm mt-1">Manage user accounts and permissions.</p>
            </div>
            <div className="flex items-center gap-2">
              <NeuroButton onClick={() => setIsAddOpen(true)} className="flex items-center gap-2 bg-cyan-400/20 border border-cyan-400/30 text-cyan-100 hover:bg-cyan-400/30 text-sm">
                <Plus className="h-4 w-4" />
                Add User
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
                      placeholder="Search users by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-[#0e2439]/50 backdrop-blur-sm border border-cyan-400/30 focus:border-cyan-400/60 text-white placeholder-cyan-300/50 text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="px-3 py-2 bg-[#0e2439]/50 backdrop-blur-sm border border-cyan-400/30 rounded-md text-sm focus:border-cyan-400/60 focus:outline-none text-white min-w-[120px]"
                  >
                    <option value="all">All Roles</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  <NeuroButton variant="outline" size="sm" onClick={loadUsers} className="border-cyan-400/30 text-cyan-100 hover:bg-cyan-400/10">
                    <Filter className="h-4 w-4" />
                  </NeuroButton>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Users Table */}
          <GlassCard className="bg-[#0e2439]/80 backdrop-blur-xl border border-cyan-400/20">
            <GlassCardHeader className="p-4 sm:p-6 pb-0">
              <div className="flex items-center gap-3">
                <GlassCardTitle className="text-white text-lg sm:text-xl">Users ({filteredUsers.length})</GlassCardTitle>
                {isFetching && <LoadingSpinner size="sm" />}
              </div>
            </GlassCardHeader>
            <GlassCardContent className="p-4 sm:p-6">
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="w-full min-w-[600px] sm:min-w-0">
                  <thead>
                    <tr className="border-b border-cyan-400/20">
                      <th className="text-left py-3 px-2 sm:px-4 font-medium text-white text-sm">User</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-medium text-white text-sm">Role</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-medium text-white text-sm hidden md:table-cell">Created</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-medium text-white text-sm hidden lg:table-cell">Updated</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-medium text-white text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-cyan-300">
                          <LoadingSpinner text="Loading users..." />
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-cyan-300">No users found</td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user._id} className="border-b border-cyan-400/10 hover:bg-cyan-400/5 transition-all duration-300">
                          <td className="py-4 px-2 sm:px-4">
                            <div>
                              <p className="font-medium text-white text-sm">{user.fullName}</p>
                              <p className="text-xs text-cyan-300">{user.email}</p>
                              <div className="md:hidden mt-1">
                                <p className="text-xs text-cyan-300/70">Created: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-2 sm:px-4">
                            <Badge className={`${getRoleColor(user.role)} text-xs font-medium`}>{user.role}</Badge>
                          </td>
                          <td className="py-4 px-2 sm:px-4 text-sm text-cyan-300 hidden md:table-cell">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</td>
                          <td className="py-4 px-2 sm:px-4 text-sm text-cyan-300 hidden lg:table-cell">{user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "—"}</td>
                          <td className="py-4 px-2 sm:px-4">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <NeuroButton variant="ghost" size="sm" title="View" onClick={() => { setSelectedUser(user); setIsViewOpen(true) }} className="text-cyan-100 hover:bg-cyan-400/10 p-1 sm:p-2">
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                              </NeuroButton>
                              <NeuroButton variant="ghost" size="sm" title="Edit" onClick={() => openEdit(user)} className="text-cyan-100 hover:bg-cyan-400/10 p-1 sm:p-2">
                                <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                              </NeuroButton>
                              <NeuroButton variant="ghost" size="sm" title="Delete" onClick={() => setPendingDeleteId(user._id)} className="text-red-300 hover:bg-red-500/10 p-1 sm:p-2">
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
          <DialogContent className="bg-[#0e2439]/90 backdrop-blur-xl border border-cyan-400/30 max-w-lg mx-4 sm:mx-auto">
            <DialogHeader>
              <DialogTitle className="text-white text-lg">Add User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/80 block mb-1">Full Name</label>
                <Input value={addForm.fullName} onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })} className="bg-[#0e2439]/50 border-cyan-400/30 text-white text-sm" placeholder="Enter full name" />
              </div>
              <div>
                <label className="text-sm text-white/80 block mb-1">Email</label>
                <Input type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} className="bg-[#0e2439]/50 border-cyan-400/30 text-white text-sm" placeholder="Enter email" />
              </div>
              <div>
                <label className="text-sm text-white/80 block mb-1">Password</label>
                <Input type="password" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} className="bg-[#0e2439]/50 border-cyan-400/30 text-white text-sm" placeholder="Set initial password" />
              </div>
              <div>
                <label className="text-sm text-white/80 block mb-1">Role</label>
                <select value={addForm.role} onChange={(e) => setAddForm({ ...addForm, role: e.target.value as Role })} className="w-full px-3 py-2 bg-[#0e2439]/50 border border-cyan-400/30 rounded-md text-sm focus:border-cyan-400/60 focus:outline-none text-white">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <DialogFooter className="mt-4 flex-col sm:flex-row gap-2">
              <NeuroButton variant="outline" onClick={() => setIsAddOpen(false)} className="border-cyan-400/30 text-cyan-100 w-full sm:w-auto text-sm">Cancel</NeuroButton>
              <NeuroButton onClick={handleAdd} disabled={isSaving} className="bg-cyan-400/20 border border-cyan-400/30 text-cyan-100 hover:bg-cyan-400/30 w-full sm:w-auto text-sm">
                {isSaving ? "Saving..." : "Create"}
              </NeuroButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="bg-[#0e2439]/90 backdrop-blur-xl border border-cyan-400/30 max-w-lg mx-4 sm:mx-auto">
            <DialogHeader>
              <DialogTitle className="text-white text-lg">Edit User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/80 block mb-1">Full Name</label>
                <Input value={editForm.fullName} onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })} className="bg-[#0e2439]/50 border-cyan-400/30 text-white text-sm" />
              </div>
              <div>
                <label className="text-sm text-white/80 block mb-1">Email</label>
                <Input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="bg-[#0e2439]/50 border-cyan-400/30 text-white text-sm" />
              </div>
              <div>
                <label className="text-sm text-white/80 block mb-1">Role</label>
                <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value as Role })} className="w-full px-3 py-2 bg-[#0e2439]/50 border border-cyan-400/30 rounded-md text-sm focus:border-cyan-400/60 focus:outline-none text-white">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-white/80 block mb-1">Password (optional)</label>
                <Input type="password" value={editForm.password || ""} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} className="bg-[#0e2439]/50 border-cyan-400/30 text-white text-sm" placeholder="Leave blank to keep unchanged" />
              </div>
            </div>
            <DialogFooter className="mt-4 flex-col sm:flex-row gap-2">
              <NeuroButton variant="outline" onClick={() => setIsEditOpen(false)} className="border-cyan-400/30 text-cyan-100 w-full sm:w-auto text-sm">Cancel</NeuroButton>
              <NeuroButton onClick={handleEdit} disabled={isSaving} className="bg-cyan-400/20 border border-cyan-400/30 text-cyan-100 hover:bg-cyan-400/30 w-full sm:w-auto text-sm">
                {isSaving ? "Saving..." : "Save Changes"}
              </NeuroButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Modal */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="bg-[#0e2439]/90 backdrop-blur-xl border border-cyan-400/30 max-w-md mx-4 sm:mx-auto">
            <DialogHeader>
              <DialogTitle className="text-white text-lg">User Details</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-3 text-white/90 text-sm">
                <div className="flex justify-between items-start"><span className="text-white/70 min-w-0 mr-4">Name</span><span className="text-right break-words">{selectedUser.fullName}</span></div>
                <div className="flex justify-between items-start"><span className="text-white/70 min-w-0 mr-4">Email</span><span className="text-right break-words">{selectedUser.email}</span></div>
                <div className="flex justify-between"><span className="text-white/70">Role</span><span className="capitalize">{selectedUser.role}</span></div>
                <div className="flex justify-between text-xs pt-2 border-t border-cyan-400/20"><span className="text-white/50">Created</span><span>{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "—"}</span></div>
                <div className="flex justify-between text-xs"><span className="text-white/50">Updated</span><span>{selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleDateString() : "—"}</span></div>
              </div>
            )}
            <DialogFooter>
              <NeuroButton variant="outline" onClick={() => setIsViewOpen(false)} className="border-cyan-400/30 text-cyan-100 w-full sm:w-auto text-sm">Close</NeuroButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm */}
        <AlertDialog open={!!pendingDeleteId} onOpenChange={(open) => !open && setPendingDeleteId(null)}>
          <AlertDialogContent className="bg-[#0e2439]/90 backdrop-blur-xl border border-cyan-400/30">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Delete user?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the user account.
              </AlertDialogDescription>
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
