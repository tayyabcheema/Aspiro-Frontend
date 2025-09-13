"use client"

import { useState } from "react"
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card"
import { NeuroButton } from "@/components/ui/neuro-button"
import { ArrowLeft, ArrowRight, GraduationCap, Briefcase, TrendingUp, Users, LogOut, Edit, RotateCcw } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import ProtectedRoute from "@/components/ProtectedRoute"

const sidebarItems = [
  { icon: ArrowLeft, href: "/dashboard", active: true },
  // { icon: ArrowRight, href: "/dashboard/roadmap" },
  // { icon: Users, href: "/dashboard/users" },
  // { icon: Folder, href: "/dashboard/settings" },
  // { icon: BarChart3, href: "/dashboard/analytics" },
]

type HeaderItem = { label: string; href: string; icon: React.ComponentType<{ className?: string }> }
const headerNavItems: HeaderItem[] = []

const timelineSteps = [
  {
    id: "1",
    title: "Graduation",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    icon: GraduationCap,
    status: "completed",
  },
  {
    id: "2",
    title: "First Job",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    icon: Briefcase,
    status: "current",
  },
  {
    id: "3",
    title: "Promotion",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    icon: TrendingUp,
    status: "upcoming",
  },
  {
    id: "4",
    title: "Management",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    icon: Users,
    status: "upcoming",
  },
]

export default function DashboardPage() {
  const { user, logout, resetUserProgress } = useAuth()

  const handleRegenerateStep = (stepId: string, stepTitle: string) => {
    console.log(`Regenerating step ${stepId}: ${stepTitle}`)
    // Add individual step regeneration logic here
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
               <div className="max-w-6xl mx-auto">
               <div className="p-4 sm:p-6 lg:p-8 rounded-2xl backdrop-blur-xl bg-[#0e2439]/90 border border-cyan-400/30 shadow-2xl shadow-cyan-400/20">
                 {/* Regenerate Button */}
                 <div className="flex justify-center mb-8 lg:mb-12">
                   <NeuroButton 
                     className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold px-6 py-3 lg:px-8 lg:py-4 rounded-xl shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-500/60 transition-all duration-300 transform hover:scale-105 border border-cyan-400/30 text-sm lg:text-base"
                     onClick={() => {
                       // Add regenerate logic here
                       console.log("Regenerating roadmap...")
                     }}
                   >
                     🔄 Regenerate Roadmap
                   </NeuroButton>
                 </div>
                 
                 {/* Timeline */}
                 <div className="flex justify-center">
                   <div className="relative w-full max-w-4xl">
                     {/* Vertical Timeline Line - Hidden on mobile, visible on tablet+ */}
                     <div className="hidden sm:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-cyan-400 via-cyan-500 to-cyan-600 shadow-lg shadow-cyan-400/60 rounded-full"></div>
                     
                     {/* Mobile Timeline Line - Visible only on mobile */}
                     <div className="sm:hidden absolute left-6 top-0 w-0.5 h-full bg-gradient-to-b from-cyan-400 via-cyan-500 to-cyan-600 shadow-lg shadow-cyan-400/60 rounded-full"></div>
                     
                     {/* Timeline Steps */}
                     <div className="space-y-8 sm:space-y-12 lg:space-y-16">
                       {timelineSteps.map((step, index) => (
                         <div key={step.id} className="relative">
                           {/* Timeline Node - Desktop */}
                           <div className="hidden sm:block absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-1/2 z-10">
                             <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full flex items-center justify-center border-2 border-cyan-400 bg-cyan-400/30 shadow-2xl shadow-cyan-400/60 hover:shadow-cyan-400/80 transition-all duration-300 hover:scale-110">
                               <step.icon className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                             </div>
                           </div>

                           {/* Timeline Node - Mobile */}
                           <div className="sm:hidden absolute left-6 transform -translate-x-1/2 -translate-y-1/2 top-8 z-10">
                             <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-cyan-400 bg-cyan-400/30 shadow-xl shadow-cyan-400/60">
                               <step.icon className="h-4 w-4 text-white" />
                             </div>
                           </div>

                           {/* Content Card - Desktop */}
                           <div className={`hidden sm:block w-5/12 ${index % 2 === 0 ? 'ml-auto' : 'mr-auto'}`}>
                             <div className="p-4 lg:p-6 rounded-xl backdrop-blur-xl bg-[#0e2439]/60 border border-cyan-400/50 shadow-xl shadow-cyan-400/20 hover:shadow-cyan-400/30 transition-all duration-300 hover:scale-105 group">
                               <div className="space-y-3 lg:space-y-4">
                                 <div className="flex items-center justify-between">
                                   <h3 className="text-lg lg:text-xl font-bold text-white">
                                     {step.title}
                                   </h3>
                                   <button
                                     onClick={() => handleRegenerateStep(step.id, step.title)}
                                     className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-1.5 rounded-lg bg-cyan-400/20 hover:bg-cyan-400/30 border border-cyan-400/30 hover:border-cyan-400/50 text-cyan-300 hover:text-white"
                                     title={`Regenerate ${step.title}`}
                                   >
                                     <RotateCcw className="h-3 w-3 lg:h-4 lg:w-4" />
                                   </button>
                                 </div>
                                 <p className="text-white/80 text-sm leading-relaxed">
                                   {step.description}
                                 </p>
                               </div>
                             </div>
                           </div>

                           {/* Content Card - Mobile */}
                           <div className="sm:hidden ml-16 mr-4">
                             <div className="p-4 rounded-lg backdrop-blur-xl bg-[#0e2439]/60 border border-cyan-400/50 shadow-xl shadow-cyan-400/20 group">
                               <div className="space-y-2">
                                 <div className="flex items-center justify-between">
                                   <h3 className="text-base font-bold text-white">
                                     {step.title}
                                   </h3>
                                   <button
                                     onClick={() => handleRegenerateStep(step.id, step.title)}
                                     className="opacity-70 active:opacity-100 transition-opacity duration-300 p-1.5 rounded-lg bg-cyan-400/20 hover:bg-cyan-400/30 border border-cyan-400/30 hover:border-cyan-400/50 text-cyan-300 hover:text-white"
                                     title={`Regenerate ${step.title}`}
                                   >
                                     <RotateCcw className="h-3 w-3" />
                                   </button>
                                 </div>
                                 <p className="text-white/80 text-sm leading-relaxed">
                                   {step.description}
                                 </p>
                               </div>
                             </div>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </div>
     </div>
   </ProtectedRoute>
 )
}
