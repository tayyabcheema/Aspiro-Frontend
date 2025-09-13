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
import { Brain, ArrowLeft, Mail, ShieldCheck, Eye, EyeOff, RefreshCw, AlertCircle } from "lucide-react"
import { getApiUrl } from "@/lib/api-config"

export default function ForgotPasswordPage() {
  // Steps: request -> verify -> success
  const [step, setStep] = useState<'request' | 'verify' | 'success'>('request')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setInfo('')
    try {
      const res = await fetch(getApiUrl('/auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.message || 'Request failed')
      }
      // Always success message to avoid enumeration
      setInfo(data?.message || 'If that email exists, an OTP has been sent.')
      setStep('verify')
    } catch (err: any) {
      setError(err.message || 'Failed to request reset')
    } finally {
      setIsLoading(false)
    }
  }

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setInfo('')
    try {
      if (!email || !otp || !newPassword) {
        setError('Email, OTP and new password are required')
        setIsLoading(false)
        return
      }
      const res = await fetch(getApiUrl('/auth/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (res.status === 429) throw new Error(data?.message || 'Too many attempts')
        throw new Error(data?.message || 'Reset failed')
      }
      setInfo(data?.message || 'Password reset successful')
      // Clear sensitive fields
      setOtp('')
      setNewPassword('')
      setStep('success')
    } catch (err: any) {
      setError(err.message || 'Failed to reset password')
    } finally {
      setIsLoading(false)
    }
  }

  const resendOtp = async () => {
    if (isLoading) return
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch(getApiUrl('/auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || 'Failed to resend')
      setInfo('OTP resent (if email exists).')
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP')
    } finally {
      setIsLoading(false)
    }
  }

  // Success Screen
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#0e2439] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse opacity-60" />
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-400 rounded-full animate-pulse opacity-40" />
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-cyan-300 rounded-full animate-pulse opacity-50" />
          <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-blue-300 rounded-full animate-pulse opacity-30" />
          <div className="absolute bottom-1/3 left-1/4 w-1 h-1 bg-cyan-500 rounded-full animate-pulse opacity-70" />
        </div>
        <div className="relative w-full max-w-md">
          <GlassCard className="neuro border-cyan-400/20 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl bg-[#0e2439]/80 text-center">
            <GlassCardHeader>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/20 to-green-500/20 border border-emerald-400/30 shadow-lg shadow-emerald-500/20">
                <ShieldCheck className="h-8 w-8 text-emerald-400" />
              </div>
              <GlassCardTitle className="text-3xl font-bold text-cyan-100 tracking-wide">PASSWORD RESET</GlassCardTitle>
              <GlassCardDescription className="text-cyan-300/80 mt-2">{info || 'Password reset successful'}</GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="space-y-3">
                <Link href="/login">
                  <NeuroButton className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold tracking-wide shadow-lg shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105">
                    Back to Login
                  </NeuroButton>
                </Link>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>
      </div>
    )
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
        {/* Back to login link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-100 transition-all duration-300 mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
          Back to Login
        </Link>

        <GlassCard className="neuro border-cyan-400/20 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl bg-[#0e2439]/80">
          <GlassCardHeader className="text-center pb-8">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/30 shadow-lg shadow-cyan-500/20">
              <Brain className="h-8 w-8 text-cyan-400" />
            </div>
            <GlassCardTitle className="text-3xl font-bold text-cyan-100 tracking-wide">RESET PASSWORD</GlassCardTitle>
            <GlassCardDescription className="text-cyan-300/80 mt-2">
              Enter your email address and we'll send you a link to reset your password
            </GlassCardDescription>
          </GlassCardHeader>

          <GlassCardContent className="space-y-6">
            {error && (
              <div className="flex items-center gap-3 p-4 glass-card border border-red-400/30 bg-red-400/10 rounded-xl backdrop-blur-sm">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <span className="text-sm text-red-300">{error}</span>
              </div>
            )}
            {info && !error && (
              <div className="flex items-center gap-3 p-4 glass-card border border-emerald-400/30 bg-emerald-400/10 rounded-xl backdrop-blur-sm">
                <Mail className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                <span className="text-sm text-emerald-300">{info}</span>
              </div>
            )}

            {step === 'request' && (
              <form onSubmit={requestOtp} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-cyan-100 font-medium">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="glass-card border-cyan-400/30 focus:border-cyan-400/60 bg-[#0e2439]/50 text-cyan-100 placeholder-cyan-300/50 transition-all duration-300 focus:ring-2 focus:ring-cyan-400/20 h-12"
                  />
                </div>
                <NeuroButton
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold tracking-wide shadow-lg shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-60"
                >
                  {isLoading ? 'Sending...' : 'SEND RESET LINK'}
                </NeuroButton>
              </form>
            )}

            {step === 'verify' && (
              <form onSubmit={resetPassword} className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-cyan-100 font-medium">Email</Label>
                  <Input
                    type="email"
                    value={email}
                    disabled
                    className="glass-card border-cyan-400/30 bg-[#0e2439]/40 text-cyan-200 h-12 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="otp" className="text-cyan-100 font-medium">OTP</Label>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    maxLength={6}
                    placeholder="6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0,6))}
                    required
                    className="glass-card border-cyan-400/30 focus:border-cyan-400/60 bg-[#0e2439]/50 text-cyan-100 placeholder-cyan-300/50 transition-all duration-300 focus:ring-2 focus:ring-cyan-400/20 h-12 tracking-widest text-center"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="newPassword" className="text-cyan-100 font-medium">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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
                  <button
                    type="button"
                    onClick={resendOtp}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm text-cyan-300 hover:text-cyan-100 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Resend OTP
                  </button>
                  <span className="text-[10px] sm:text-xs text-cyan-300/70">Valid 10 minutes • 6 digits</span>
                </div>
                <NeuroButton
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-semibold tracking-wide shadow-lg shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-60"
                >
                  {isLoading ? 'Resetting...' : 'RESET PASSWORD'}
                </NeuroButton>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => { setStep('request'); setOtp(''); setNewPassword(''); setError(''); setInfo('') }}
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Start over
                  </button>
                </div>
              </form>
            )}

            <div className="text-center pt-4 border-t border-cyan-400/20">
              {step === 'request' ? (
                <p className="text-sm text-cyan-300/80">
                  Remember your password?{' '}
                  <Link href="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300 font-medium">Sign in</Link>
                </p>
              ) : (
                <p className="text-sm text-cyan-300/80">
                  Have an account?{' '}
                  <Link href="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300 font-medium">Back to login</Link>
                </p>
              )}
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  )
}
