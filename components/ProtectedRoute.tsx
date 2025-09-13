"use client"
import { ReactNode } from "react"

interface Props {
  children: ReactNode
  requireAuth?: boolean
  requireOnboarding?: boolean
}

export default function ProtectedRoute({ children }: Props) {
  return <>{children}</>
}