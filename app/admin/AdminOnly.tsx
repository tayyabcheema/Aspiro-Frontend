"use client"
import React from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function AdminOnly({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth={true} requireOnboarding={false} allowedRoles={["admin"]}>
      {children}
    </ProtectedRoute>
  )
}
