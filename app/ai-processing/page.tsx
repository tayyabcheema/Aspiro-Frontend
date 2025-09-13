"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Brain, Sparkles, Zap, Cpu } from "lucide-react"

export default function AIProcessingPage() {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const { user } = useAuth()
  const router = useRouter()

  const processingSteps = [
    "Analyzing your profile with AI",
    "Extracting key skills and experience",
    "Identifying career opportunities",
    "Generating personalized insights",
    "Preparing your roadmap",
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            router.push("/onboarding")
          }, 1000)
          return 100
        }
        return prev + 2
      })
    }, 100)

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= processingSteps.length - 1) {
          clearInterval(stepInterval)
          return processingSteps.length - 1
        }
        return prev + 1
      })
    }, 2000)

    return () => {
      clearInterval(interval)
      clearInterval(stepInterval)
    }
  }, [router])

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen bg-[#0e2439] flex items-center justify-center relative overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0">
          {/* Large particles */}
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-cyan-400 rounded-full animate-pulse opacity-40"></div>
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-30"></div>
          <div className="absolute bottom-1/4 left-1/3 w-2.5 h-2.5 bg-cyan-300 rounded-full animate-pulse opacity-50"></div>
          <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse opacity-40"></div>
          <div className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-cyan-500 rounded-full animate-pulse opacity-60"></div>
          
          {/* Medium particles */}
          <div className="absolute top-1/6 left-1/6 w-1 h-1 bg-cyan-400 rounded-full animate-pulse opacity-50"></div>
          <div className="absolute top-2/3 right-1/6 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse opacity-40"></div>
          <div className="absolute bottom-1/6 right-1/3 w-1 h-1 bg-cyan-300 rounded-full animate-pulse opacity-60"></div>
          <div className="absolute top-1/4 right-1/6 w-1 h-1 bg-blue-300 rounded-full animate-pulse opacity-30"></div>
          
          {/* Small particles */}
          <div className="absolute top-1/5 left-2/3 w-0.5 h-0.5 bg-cyan-400 rounded-full animate-pulse opacity-70"></div>
          <div className="absolute top-3/4 left-1/5 w-0.5 h-0.5 bg-blue-400 rounded-full animate-pulse opacity-50"></div>
          <div className="absolute bottom-1/5 right-1/5 w-0.5 h-0.5 bg-cyan-300 rounded-full animate-pulse opacity-60"></div>
          <div className="absolute top-1/2 left-1/5 w-0.5 h-0.5 bg-blue-300 rounded-full animate-pulse opacity-40"></div>
        </div>

        {/* Main content */}
        <div className="relative z-10 text-center space-y-12">
          {/* Central processing indicator */}
          <div className="relative">
            {/* Outer ring */}
            <div className="w-48 h-48 mx-auto rounded-full border-2 border-cyan-400/30 animate-pulse"></div>
            
            {/* Middle ring */}
            <div className="absolute top-6 left-6 w-36 h-36 rounded-full border-2 border-cyan-400/50 animate-pulse" style={{ animationDelay: "0.5s" }}></div>
            
            {/* Inner ring with progress */}
            <div className="absolute top-12 left-12 w-24 h-24 rounded-full border-2 border-cyan-400 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/30 flex items-center justify-center">
                <Brain className="h-8 w-8 text-cyan-400 animate-pulse" />
              </div>
            </div>

            {/* Progress circle */}
            <svg className="absolute top-12 left-12 w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-cyan-400/30"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
                className="text-cyan-400 transition-all duration-300 ease-out"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Loading text */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-cyan-100 tracking-wide">
              {processingSteps[currentStep]}
            </h1>
            <p className="text-lg text-cyan-300/80 max-w-md mx-auto">
              Our advanced AI is processing your information to create a personalized career roadmap
            </p>
            
            {/* Progress percentage */}
            <div className="text-2xl font-bold text-cyan-400">
              {Math.round(progress)}%
            </div>
          </div>

          {/* Processing indicators */}
          <div className="flex justify-center space-x-4">
            <div className="flex items-center space-x-2 text-cyan-300/80">
              <Cpu className="h-4 w-4 animate-pulse" />
              <span className="text-sm">AI Processing</span>
            </div>
            <div className="flex items-center space-x-2 text-cyan-300/80">
              <Zap className="h-4 w-4 animate-pulse" style={{ animationDelay: "0.3s" }} />
              <span className="text-sm">Analyzing</span>
            </div>
            <div className="flex items-center space-x-2 text-cyan-300/80">
              <Sparkles className="h-4 w-4 animate-pulse" style={{ animationDelay: "0.6s" }} />
              <span className="text-sm">Generating</span>
            </div>
          </div>


        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-20 opacity-20">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
        </div>
        <div className="absolute top-40 right-32 opacity-30">
          <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.5s" }}></div>
        </div>
        <div className="absolute bottom-32 left-32 opacity-25">
          <div className="w-1.5 h-1.5 bg-cyan-300 rounded-full animate-bounce" style={{ animationDelay: "1s" }}></div>
        </div>
        <div className="absolute bottom-20 right-20 opacity-35">
          <div className="w-1 h-1 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: "1.5s" }}></div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
