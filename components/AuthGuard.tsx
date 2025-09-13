"use client"
import { ReactNode } from "react"

interface AuthGuardProps {
  children: ReactNode
  requireAuth?: boolean
  requireOnboarding?: boolean
}

export default function AuthGuard({ children }: AuthGuardProps) {
  return <>{children}</>
}
