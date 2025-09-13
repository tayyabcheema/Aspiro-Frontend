"use client"

import { useState } from "react"
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card"
import { NeuroButton } from "@/components/ui/neuro-button"
import { ArrowLeft, ArrowRight, GraduationCap, Briefcase, TrendingUp, Users, LogOut, Edit, RotateCcw } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import ProtectedRoute from "@/components/ProtectedRoute"
import RoadmapDisplay from "@/components/RoadmapDisplay"
import { Roadmap } from "@/lib/roadmap-api"

const sidebarItems = [
  { icon: ArrowLeft, href: "/dashboard", active: true },
  // { icon: ArrowRight, href: "/dashboard/roadmap" },
  // { icon: Users, href: "/dashboard/users" },
  // { icon: Folder, href: "/dashboard/settings" },
  // { icon: BarChart3, href: "/dashboard/analytics" },
]

type HeaderItem = { label: string; href: string; icon: React.ComponentType<{ className?: string }> }
const headerNavItems: HeaderItem[] = []

export default function DashboardPage() {
  const { user, logout, resetUserProgress } = useAuth()
  const [currentRoadmap, setCurrentRoadmap] = useState<Roadmap | null>(null)

  const handleRoadmapUpdate = (roadmap: Roadmap) => {
    setCurrentRoadmap(roadmap)
  }

  return (
  <ProtectedRoute requireAuth={true} requireOnboarding={true} allowedRoles={['user']}>
      <div className="min-h-screen bg-[#0e2439] flex flex-col">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row">
           {/* Sidebar */}
           <div className="w-full lg:w-16 bg-gray-800 flex-shrink-0 flex lg:flex-col border-b lg:border-b-0 lg:border-r border-gray-700 order-2 lg:order-1">
             {/* Navigation Icons */}
             <nav className="flex-1 p-3 lg:p-2 flex lg:flex-col lg:space-y-2 space-x-2 lg:space-x-0 justify-center lg:justify-start">
               {sidebarItems.map((item) => (
                 <Link key={item.href} href={item.href}>
                   <div
                     className={`w-12 h-12 lg:w-10 lg:h-10 flex items-center justify-center rounded-lg transition-all duration-300 ${
                       item.active
                         ? "bg-cyan-400/20 text-cyan-400 border border-cyan-400/30"
                         : "text-white/70 hover:text-white hover:bg-gray-700/50"
                     }`}
                   >
                     <item.icon className="h-5 w-5 lg:h-5 lg:w-5" />
                   </div>
                 </Link>
               ))}
             </nav>
             
             {/* Logout Button */}
             <div className="p-3 lg:p-2 lg:mt-auto lg:border-t border-gray-700 flex lg:block justify-end">
               <button
                 onClick={logout}
                 className="w-12 h-12 lg:w-10 lg:h-10 flex items-center justify-center rounded-lg transition-all duration-300 text-white/70 hover:text-white hover:bg-red-500/20 hover:border-red-500/30 border border-transparent"
                 title="Logout"
               >
                 <LogOut className="h-5 w-5" />
               </button>
             </div>
           </div>

           {/* Dashboard Content */}
           <div className="flex-1 flex flex-col overflow-auto order-1 lg:order-2">
             {/* Header */}
             <div className="bg-gray-800 border-b border-gray-700">
               <div className="flex items-center justify-between px-4 lg:px-6 py-4 lg:py-5">
                 {/* Navigation Links */}
                 <nav className="flex items-center space-x-4 lg:space-x-8">
                   {headerNavItems.map((item) => (
                     <Link key={item.href} href={item.href}>
                       <div className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors duration-300 group">
                         <item.icon className="h-4 w-4 group-hover:text-cyan-400 transition-colors duration-300" />
                         <span className="text-sm font-medium hidden sm:inline">{item.label}</span>
                       </div>
                     </Link>
                   ))}
                 </nav>

               </div>
             </div>

             {/* Main Content */}
             <div className="flex-1 p-4 lg:p-6">
               {/* Main Card Container */}
               <div className="w-full mx-auto">
                 <div className="p-4 sm:p-6 lg:p-8 rounded-2xl backdrop-blur-xl bg-[#0e2439]/90 border border-cyan-400/30 shadow-2xl shadow-cyan-400/20">
                   <RoadmapDisplay onRoadmapUpdate={handleRoadmapUpdate} />
                 </div>
               </div>
             </div>
         </div>
       </div>
     </div>
   </ProtectedRoute>
 )
}
