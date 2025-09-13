"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, BookOpen, Users2, User, FileText, HelpCircle, LogOut, X, Menu, Brain } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

interface NavItem {
  label: string
  href: string
  icon: any
  number?: string
}

const sidebarItems = [
  { icon: BarChart3, label: "Dashboard", href: "/admin" },
  { icon: BookOpen, label: "Courses", href: "/admin/courses" },
  { icon: Users2, label: "Majors", href: "/admin/majors" },
  { icon: User, label: "Users", href: "/admin/users" },
  { icon: HelpCircle, label: "Questions", href: "/admin/questions" },
  { icon: Brain, label: "AI Processing", href: "/admin/ai-processing" },
  // { icon: FileText, label: "Questionnaires", href: "/admin/questionnaires" },
  // { icon: BarChart3, label: "Reports", href: "/admin/reports" },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const [open, setOpen] = useState(false)

  // Close on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [open])

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-cyan-400/20 bg-[#0e2439]/90 backdrop-blur-xl sticky top-0 z-40 w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M21 9V7L15 1H5C3.89 1 3 1.89 3 3V19A2 2 0 0 0 5 21H11V19H5V3H13V9H21M17.5 22C15.57 22 14 20.43 14 18.5C14 16.57 15.57 15 17.5 15C19.43 15 21 16.57 21 18.5C21 20.43 19.43 22 17.5 22M16 17V19H17.5V20.5H19V19H17.5V17.5H16V17Z"/>
            </svg>
          </div>
          <span className="text-white font-semibold text-sm truncate">Asprio</span>
        </div>
        <button 
          onClick={() => setOpen(true)} 
          aria-label="Open menu" 
          className="text-cyan-100 hover:text-white transition-colors duration-200 p-1"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0e2439]/95 backdrop-blur-xl border-r border-cyan-400/20 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:flex lg:flex-col lg:w-64 xl:w-72 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>        
        <div className="p-4 lg:p-6 border-b border-cyan-400/20 flex items-center justify-between lg:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M21 9V7L15 1H5C3.89 1 3 1.89 3 3V19A2 2 0 0 0 5 21H11V19H5V3H13V9H21M17.5 22C15.57 22 14 20.43 14 18.5C14 16.57 15.57 15 17.5 15C19.43 15 21 16.57 21 18.5C21 20.43 19.43 22 17.5 22M16 17V19H17.5V20.5H19V19H17.5V17.5H16V17Z"/>
              </svg>
            </div>
            <span className="text-white font-bold text-sm xl:text-base truncate">Aspiro</span>
          </div>
          <button 
            onClick={() => setOpen(false)} 
            aria-label="Close menu" 
            className="lg:hidden text-cyan-100 hover:text-white transition-colors duration-200 p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="flex-1 p-3 lg:p-4 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href} className="block">
                <div className={`flex items-center gap-3 px-3 py-2.5 lg:py-3 rounded-lg transition-all duration-300 group ${active ? 'bg-cyan-400/30 text-white border border-cyan-400/50 shadow-lg shadow-cyan-400/20' : 'text-white/70 hover:text-white hover:bg-gray-700/40 hover:border-cyan-400/20 border border-transparent'}`}>                  
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm lg:text-base font-medium truncate">{item.label}</span>
                </div>
              </Link>
            )
          })}
        </nav>
        
        <div className="p-3 lg:p-4 border-t border-cyan-400/20">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 lg:py-3 rounded-lg text-white/80 hover:text-white hover:bg-red-500/20 transition-all duration-300 border border-transparent hover:border-red-500/30 group"
            title="Logout"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm lg:text-base font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {open && (
        <div 
          aria-label="Close sidebar overlay" 
          aria-hidden={!open} 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300" 
          onClick={() => setOpen(false)} 
        />
      )}
    </>
  )
}
