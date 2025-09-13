"use client"
import { useState } from "react"
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card"
import { NeuroButton } from "@/components/ui/neuro-button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Bell,
  Save,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const [settings, setSettings] = useState({
    // Account settings
  email: user?.email || "",
  name: user?.fullName || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    
    // Notification settings
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
    learningReminders: true,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate saving
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    // Here you would typically save to backend
  }

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      logout()
    }
  }

  return (
    <ProtectedRoute requireAuth={true} requireOnboarding={true}>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance mb-2">Settings</h1>
              <p className="text-muted-foreground">Manage your account preferences</p>
            </div>
            <NeuroButton onClick={handleSave} disabled={isSaving} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </NeuroButton>
          </div>

          <div className="space-y-6">
            {/* Account Settings */}
            <GlassCard className="neuro">
              <GlassCardHeader>
                <GlassCardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Account Settings
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Full Name</label>
                    <Input
                      value={settings.name}
                      onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                      className="glass-card border-white/20 focus:border-primary/50"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email Address</label>
                    <Input
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="glass-card border-white/20 focus:border-primary/50"
                      placeholder="Enter your email"
                      type="email"
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium mb-2 block">Current Password</label>
                  <div className="relative">
                    <Input
                      value={settings.currentPassword}
                      onChange={(e) => setSettings({ ...settings, currentPassword: e.target.value })}
                      className="glass-card border-white/20 focus:border-primary/50 pr-10"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter current password"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium mb-2 block">New Password</label>
                    <Input
                      value={settings.newPassword}
                      onChange={(e) => setSettings({ ...settings, newPassword: e.target.value })}
                      className="glass-card border-white/20 focus:border-primary/50"
                      type="password"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Confirm Password</label>
                    <Input
                      value={settings.confirmPassword}
                      onChange={(e) => setSettings({ ...settings, confirmPassword: e.target.value })}
                      className="glass-card border-white/20 focus:border-primary/50"
                      type="password"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>


            {/* Danger Zone */}
            <GlassCard className="neuro">
              <GlassCardHeader>
                <GlassCardTitle className="text-red-500">Danger Zone</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="text-center">
                  <NeuroButton variant="outline" onClick={handleDeleteAccount} className="flex items-center gap-2 border-red-500/40 text-red-500 hover:bg-red-500/10">
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </NeuroButton>
                  <p className="text-xs text-muted-foreground mt-2">
                    This action cannot be undone. All your data will be permanently deleted.
                  </p>
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
