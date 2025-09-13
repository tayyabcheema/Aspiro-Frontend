"use client"
import { useState } from "react"
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card"
import { NeuroButton } from "@/components/ui/neuro-button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Eye,
  Edit,
  Plus,
  BookOpen,
  User,
  ChevronDown,
} from "lucide-react"

const usersData = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    role: "student",
    status: "active",
    joinDate: "2024-01-15",
    lastActive: "2 hours ago",
    coursesEnrolled: 3,
    coursesCompleted: 1,
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "instructor",
    status: "active",
    joinDate: "2024-01-10",
    lastActive: "1 day ago",
    coursesEnrolled: 0,
    coursesCompleted: 0,
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    role: "student",
    status: "inactive",
    joinDate: "2024-02-01",
    lastActive: "1 week ago",
    coursesEnrolled: 2,
    coursesCompleted: 0,
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah.wilson@example.com",
    role: "admin",
    status: "active",
    joinDate: "2024-01-05",
    lastActive: "30 minutes ago",
    coursesEnrolled: 0,
    coursesCompleted: 0,
  },
  {
    id: 5,
    name: "David Brown",
    email: "david.brown@example.com",
    role: "student",
    status: "suspended",
    joinDate: "2024-01-20",
    lastActive: "3 days ago",
    coursesEnrolled: 1,
    coursesCompleted: 1,
  },
]

export default function DashboardUsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const filteredUsers = usersData.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === "all" || user.role === selectedRole
    const matchesStatus = selectedStatus === "all" || user.status === selectedStatus

    return matchesSearch && matchesRole && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-500 border-green-500/30"
      case "inactive":
        return "bg-gray-500/20 text-gray-500 border-gray-500/30"
      case "suspended":
        return "bg-red-500/20 text-red-500 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500/30"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-500/20 text-purple-500 border-purple-500/30"
      case "instructor":
        return "bg-blue-500/20 text-blue-500 border-blue-500/30"
      case "student":
        return "bg-cyan-500/20 text-cyan-500 border-cyan-500/30"
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500/30"
    }
  }

  return (
    <div className="min-h-screen bg-[#0e2439] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Users</h1>
            <p className="text-cyan-300">Manage all users and their accounts</p>
          </div>
          <NeuroButton className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400">
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </NeuroButton>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#0e2439]/60 border-cyan-400/30 text-white placeholder-gray-400"
            />
          </div>
          
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 bg-[#0e2439]/60 border border-cyan-400/30 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="instructor">Instructor</option>
            <option value="student">Student</option>
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-[#0e2439]/60 border border-cyan-400/30 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          
          <NeuroButton variant="outline" className="border-cyan-400/30 text-cyan-400">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </NeuroButton>
        </div>

        {/* Users Table */}
        <GlassCard className="neuro">
          <GlassCardHeader>
            <GlassCardTitle>Users ({filteredUsers.length})</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cyan-400/20">
                    <th className="text-left py-3 px-4 text-cyan-300 font-medium">User</th>
                    <th className="text-left py-3 px-4 text-cyan-300 font-medium">Role</th>
                    <th className="text-left py-3 px-4 text-cyan-300 font-medium">Courses</th>
                    <th className="text-left py-3 px-4 text-cyan-300 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-cyan-300 font-medium">Last Active</th>
                    <th className="text-left py-3 px-4 text-cyan-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-cyan-400/10 hover:bg-cyan-400/5">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-white">{user.name}</div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-cyan-400" />
                          <span className="text-white">{user.coursesEnrolled}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-gray-300">
                        {user.lastActive}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <NeuroButton variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300">
                            <Eye className="h-4 w-4" />
                          </NeuroButton>
                          <NeuroButton variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300">
                            <Mail className="h-4 w-4" />
                          </NeuroButton>
                          <NeuroButton variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300">
                            <Edit className="h-4 w-4" />
                          </NeuroButton>
                          <NeuroButton variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300">
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
  )
}
