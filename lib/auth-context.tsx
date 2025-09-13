"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { getApiUrl } from "./api-config"

interface User {
  _id: string
  email: string
  fullName: string
  role: string
  hasCompletedOnboarding: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  checkAuth: () => void
  resetUserProgress: () => void
  getAuthHeaders: () => { Authorization: string } | {}
  getToken: () => string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check authentication status on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = () => {
    setIsLoading(true)
    const storedUser = localStorage.getItem("user")
    const storedToken = localStorage.getItem("token")
  const storedOnboarding = localStorage.getItem("onboardingData") || sessionStorage.getItem("onboardingData")
    
    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser)
        // If onboarding data exists locally, trust it as completed
        if (!userData.hasCompletedOnboarding && storedOnboarding) {
          try {
            const ob = JSON.parse(storedOnboarding)
            userData.hasCompletedOnboarding = true
            // Prefer fullName from onboarding if present
            if (!userData.fullName && ob?.fullName) {
              userData.fullName = ob.fullName
            }
            localStorage.setItem("user", JSON.stringify(userData))
          } catch {
            // ignore malformed onboardingData
          }
        }
        setUser(userData)
      } catch (error) {
        console.error("Error parsing stored user data:", error)
        localStorage.removeItem("user")
        localStorage.removeItem("token")
      }
    }
    setIsLoading(false)
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(getApiUrl('/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
        }),
      })

      let data: any = {}
      try {
        data = await response.json()
      } catch {
        // Non-JSON error (e.g., 403 HTML/text). Keep data as empty object.
      }

      if (!response.ok) {
        const fallback = response.status === 403 ? 'Invalid email or password' : 'Login failed'
        return { success: false, error: data.message || fallback }
      }

      if (data.success) {
        // Try to preserve onboarding completion if backend doesn't send it
        let previousOnboarding = false
        try {
          const prev = localStorage.getItem("user")
          if (prev) previousOnboarding = !!JSON.parse(prev)?.hasCompletedOnboarding
        } catch {}
        // Also consider presence of onboardingData as completion
        try {
          if (!previousOnboarding) {
            const ob = localStorage.getItem("onboardingData")
            if (ob) previousOnboarding = true
          }
        } catch {}
        const newUser: User = {
          _id: data.user._id,
          email: data.user.email,
          fullName: data.user.fullName || email.split("@")[0],
          role: data.user.role || 'user',
          hasCompletedOnboarding: typeof data.user?.hasCompletedOnboarding === 'boolean'
            ? data.user.hasCompletedOnboarding
            : previousOnboarding,
        }

        setUser(newUser)
        localStorage.setItem("user", JSON.stringify(newUser))
        localStorage.setItem("token", data.token)
        
        return { success: true }
      } else {
        return { success: false, error: data.message || 'Login failed' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  const register = async (fullName: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(getApiUrl('/auth/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          fullName,
          email,
          password,
        }),
      })

      let data: any = {}
      try {
        data = await response.json()
      } catch {
        // Non-JSON error body
      }

      if (!response.ok) {
        const fallback = response.status >= 400 && response.status < 500 ? 'Invalid input' : 'Registration failed'
        return { success: false, error: data.message || fallback }
      }

      if (data.success) {
        // Registration successful, but we need to login to get the token
        // For now, we'll return success and let the register page handle the login
        return { success: true }
      } else {
        return { success: false, error: data.message || 'Registration failed' }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  const logout = () => {
    // Preserve onboardingData in session, clear the rest
    try {
      const onboarding = localStorage.getItem("onboardingData")
      if (onboarding) {
        sessionStorage.setItem("onboardingData", onboarding)
        localStorage.removeItem("onboardingData")
      }
    } catch {}

    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
  // Requirement: keep onboarding only in session; we already removed from local above.
    router.push("/login")
  }

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
    }
  }

  const resetUserProgress = () => {
    if (user) {
      const resetUser = { ...user, hasCompletedOnboarding: false }
      setUser(resetUser)
      localStorage.setItem("user", JSON.stringify(resetUser))
    }
  }

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token")
    if (token) {
      return { Authorization: `Bearer ${token}` }
    }
    return {}
  }

  const getToken = () => {
    return localStorage.getItem("token")
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser, checkAuth, resetUserProgress, getAuthHeaders, getToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
