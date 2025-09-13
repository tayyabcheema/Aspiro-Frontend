"use client"
import { useState } from "react"
import type React from "react"

import Link from "next/link"
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from "@/components/ui/glass-card"
import { NeuroButton } from "@/components/ui/neuro-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Brain, Eye, EyeOff, ArrowLeft, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const { login } = useAuth()
  const router = useRouter()


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await login(formData.email, formData.password)
      if (result.success) {
        const storedUser = localStorage.getItem("user")
        const onboardingStorage = localStorage.getItem("onboardingData") || sessionStorage.getItem("onboardingData")
        
        
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser)
            // Admins always straight to /admin
            if (userData.role === 'admin') {
              router.push('/admin')
              return
            }
            const completed = !!userData.hasCompletedOnboarding || !!onboardingStorage
            console.log("Redirect decision:", {
              hasCompletedOnboarding: userData.hasCompletedOnboarding,
              hasOnboardingStorage: !!onboardingStorage,
              completed: completed,
              redirectTo: completed ? '/dashboard' : '/onboarding'
            })
            router.push(completed ? '/dashboard' : '/onboarding')
            return
          } catch {
            router.push('/login')
            return
          }
        }
        // Fallback if somehow no stored user
        router.push(onboardingStorage ? '/dashboard' : '/onboarding')
      } else {
        setError(result.error || "Login failed")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="min-h-screen bg-[#0e2439] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-400 rounded-full animate-pulse opacity-40"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-cyan-300 rounded-full animate-pulse opacity-50"></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-blue-300 rounded-full animate-pulse opacity-30"></div>
        <div className="absolute bottom-1/3 left-1/4 w-1 h-1 bg-cyan-500 rounded-full animate-pulse opacity-70"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Back to home link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-100 transition-all duration-300 mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
          Back to Home
        </Link>

        <GlassCard className="neuro border-cyan-400/20 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl bg-[#0e2439]/80">
          <GlassCardHeader className="text-center pb-8">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/30 shadow-lg shadow-cyan-500/20">
              <Brain className="h-8 w-8 text-cyan-400" />
            </div>
            <GlassCardTitle className="text-3xl font-bold text-cyan-100 tracking-wide">LOGIN</GlassCardTitle>
            <GlassCardDescription className="text-cyan-300/80 mt-2">
              Sign in to your Aspirp account
            </GlassCardDescription>
            

          </GlassCardHeader>

          <GlassCardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-3 p-4 glass-card border border-red-400/30 bg-red-400/10 rounded-xl backdrop-blur-sm">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <span className="text-sm text-red-300">{error}</span>
                </div>
              )}
              
              <div className="space-y-3">
                <Label htmlFor="email" className="text-cyan-100 font-medium">Username</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="glass-card border-cyan-400/30 focus:border-cyan-400/60 bg-[#0e2439]/50 text-cyan-100 placeholder-cyan-300/50 transition-all duration-300 focus:ring-2 focus:ring-cyan-400/20 h-12"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-cyan-100 font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="glass-card border-cyan-400/30 focus:border-cyan-400/60 bg-[#0e2439]/50 text-cyan-100 placeholder-cyan-300/50 transition-all duration-300 focus:ring-2 focus:ring-cyan-400/20 h-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-300 hover:text-cyan-100 transition-colors duration-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-cyan-400 bg-[#0e2439]/50 border-cyan-400/30 rounded focus:ring-cyan-400/20" />
                  <span className="text-sm text-cyan-300">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors duration-300">
                  Forgot password?
                </Link>
              </div>

              <NeuroButton 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold tracking-wide shadow-lg shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105" 
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "LOG IN"}
              </NeuroButton>
            </form>


            <div className="text-center pt-4 border-t border-cyan-400/20">
              <p className="text-sm text-cyan-300/80">
                Don't have an account?{" "}
                <Link href="/register" className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  )
}
