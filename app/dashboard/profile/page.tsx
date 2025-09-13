"use client"
import { useState } from "react"
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card"
import { NeuroButton } from "@/components/ui/neuro-button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  User,
  MapPin,
  Edit,
  Save,
  X,
  Mail,
  Phone,
  Globe,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function ProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.fullName || "",
    email: user?.email || "",
    location: "San Francisco, CA",
    phone: "+1 (555) 123-4567",
    website: "https://portfolio.example.com",
    bio: "Passionate AI professional with expertise in machine learning and data science. Always eager to learn and contribute to innovative projects.",
  })

  const handleSave = () => {
    setIsEditing(false)
    // Here you would typically save to backend
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset form data
  }

  return (
  <ProtectedRoute requireAuth={true} requireOnboarding={true}>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance mb-2">Profile</h1>
              <p className="text-muted-foreground">Manage your personal information</p>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <NeuroButton onClick={handleSave} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </NeuroButton>
                  <NeuroButton variant="outline" onClick={handleCancel} className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    Cancel
                  </NeuroButton>
                </>
              ) : (
                <NeuroButton onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </NeuroButton>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <GlassCard className="neuro">
                <GlassCardContent className="p-6 text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src="/placeholder-user.jpg" alt={user?.fullName} />
                    <AvatarFallback className="text-2xl">{user?.fullName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold mb-2">{user?.fullName}</h2>
                  <p className="text-muted-foreground mb-4">{user?.email}</p>
                  
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{profileData.location}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{profileData.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{profileData.website}</span>
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <GlassCard className="neuro">
                <GlassCardHeader>
                  <GlassCardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    About
                  </GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent>
                  {isEditing ? (
                    <Textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      className="glass-card border-white/20 focus:border-primary/50 min-h-32"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-pretty">{profileData.bio}</p>
                  )}
                </GlassCardContent>
              </GlassCard>

              {/* Contact Information */}
              <GlassCard className="neuro">
                <GlassCardHeader>
                  <GlassCardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Contact Information
                  </GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Full Name</label>
                      {isEditing ? (
                        <Input
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          className="glass-card border-white/20 focus:border-primary/50"
                          placeholder="Enter your full name"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">{profileData.name}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Email</label>
                      {isEditing ? (
                        <Input
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          className="glass-card border-white/20 focus:border-primary/50"
                          placeholder="Enter your email"
                          type="email"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">{profileData.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Location</label>
                      {isEditing ? (
                        <Input
                          value={profileData.location}
                          onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                          className="glass-card border-white/20 focus:border-primary/50"
                          placeholder="Enter your location"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">{profileData.location}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Phone</label>
                      {isEditing ? (
                        <Input
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          className="glass-card border-white/20 focus:border-primary/50"
                          placeholder="Enter your phone number"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">{profileData.phone}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium mb-2 block">Website</label>
                      {isEditing ? (
                        <Input
                          value={profileData.website}
                          onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                          className="glass-card border-white/20 focus:border-primary/50"
                          placeholder="Enter your website URL"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">{profileData.website}</p>
                      )}
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
