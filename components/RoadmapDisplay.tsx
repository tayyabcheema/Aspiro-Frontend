"use client"

import { useState, useEffect } from "react"
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card"
import { NeuroButton } from "@/components/ui/neuro-button"
import { 
  BookOpen, 
  Clock, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  Circle, 
  RotateCcw,
  Star,
  DollarSign,
  Users,
  Calendar
} from "lucide-react"
import { roadmapApi, Roadmap, RoadmapCourse, Milestone } from "@/lib/roadmap-api"
import { toast } from "@/hooks/use-toast"

interface RoadmapDisplayProps {
  onRoadmapUpdate?: (roadmap: Roadmap) => void
}

export default function RoadmapDisplay({ onRoadmapUpdate }: RoadmapDisplayProps) {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)

  useEffect(() => {
    fetchRoadmap()
  }, [])

  const fetchRoadmap = async () => {
    try {
      setLoading(true)
      const response = await roadmapApi.get()
      if (response.success && response.data) {
        setRoadmap(response.data)
        onRoadmapUpdate?.(response.data)
      }
    } catch (error: any) {
      console.error('Error fetching roadmap:', error)
      
      // Don't show toast for authentication errors as user will be redirected
      if (error.status !== 401) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch roadmap",
          variant: "destructive"
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerate = async () => {
    try {
      setRegenerating(true)
      const response = await roadmapApi.regenerate()
      if (response.success && response.data) {
        setRoadmap(response.data)
        onRoadmapUpdate?.(response.data)
        toast({
          title: "Success",
          description: "Roadmap regenerated successfully!",
        })
      }
    } catch (error: any) {
      console.error('Error regenerating roadmap:', error)
      
      // Don't show toast for authentication errors as user will be redirected
      if (error.status !== 401) {
        toast({
          title: "Error",
          description: error.message || "Failed to regenerate roadmap",
          variant: "destructive"
        })
      }
    } finally {
      setRegenerating(false)
    }
  }

  const handleMilestoneToggle = async (milestoneId: string, completed: boolean) => {
    if (!roadmap) return

    try {
      const response = await roadmapApi.updateProgress({
        milestoneId,
        status: completed ? 'completed' : 'in_progress'
      })
      
      if (response.success && response.data) {
        setRoadmap(response.data)
        onRoadmapUpdate?.(response.data)
      }
    } catch (error: any) {
      console.error('Error updating milestone:', error)
      
      // Don't show toast for authentication errors as user will be redirected
      if (error.status !== 401) {
        toast({
          title: "Error",
          description: "Failed to update milestone",
          variant: "destructive"
        })
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    )
  }

  if (!roadmap) {
    return (
      <div className="text-center p-8">
        <div className="text-white/60 mb-4">
          <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No Roadmap Found</h3>
          <p className="text-sm">Complete the questionnaire to generate your personalized roadmap.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">{roadmap.title}</h2>
          <p className="text-white/70 text-sm">{roadmap.description}</p>
        </div>
        <NeuroButton 
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold px-6 py-3 rounded-xl shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-500/60 transition-all duration-300 transform hover:scale-105 border border-cyan-400/30"
          onClick={handleRegenerate}
          disabled={regenerating}
        >
          {regenerating ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Regenerating...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Regenerate Roadmap
            </div>
          )}
        </NeuroButton>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-white">Progress</span>
          <span className="text-sm text-white/70">{roadmap.progress}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${roadmap.progress}%` }}
          ></div>
        </div>
      </div>

      {/* AI Metadata */}
      <div className="flex items-center gap-4 text-xs text-white/60">
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3" />
          <span>AI Confidence: {Math.round(roadmap.aiMetadata.confidence * 100)}%</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Generated in {roadmap.aiMetadata.processingTime}ms</span>
        </div>
        {roadmap.aiMetadata.fallbackUsed && (
          <div className="flex items-center gap-1 text-yellow-400">
            <span>⚠️ Fallback mode used</span>
          </div>
        )}
      </div>

      {/* Courses Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Recommended Courses
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {(roadmap.courses || []).map((courseItem, index) => (
            <GlassCard key={courseItem.course._id} className="p-4 border border-cyan-400/30">
              <GlassCardContent className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">{courseItem.course.title}</h4>
                    <p className="text-sm text-white/70 mb-2">{courseItem.course.category}</p>
                    <p className="text-xs text-white/60 mb-3">{courseItem.reason}</p>
                  </div>
                  <div className="text-xs text-white/50 bg-white/10 px-2 py-1 rounded">
                    #{courseItem.order}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-white/60">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{courseItem.estimatedDuration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    <span>${courseItem.course.price}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{courseItem.course.students} students</span>
                  </div>
                </div>
                
                {courseItem.prerequisites.length > 0 && (
                  <div className="text-xs text-white/60">
                    <span className="font-medium">Prerequisites:</span> {courseItem.prerequisites.join(', ')}
                  </div>
                )}
              </GlassCardContent>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Timeline Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Learning Timeline
        </h3>
        <div className="text-sm text-white/70 mb-4">
          Total Duration: {roadmap.timeline?.totalDuration || 'Not specified'}
        </div>
        
        <div className="space-y-3">
          {(roadmap.timeline?.milestones || []).map((milestone, index) => (
            <div key={milestone._id || index} className="flex items-start gap-3">
              <button
                onClick={() => handleMilestoneToggle(milestone._id || index.toString(), !milestone.completed)}
                className="mt-1 transition-colors duration-200"
              >
                {milestone.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <Circle className="h-5 w-5 text-white/40 hover:text-white/70" />
                )}
              </button>
              <div className="flex-1">
                <h4 className={`font-medium ${milestone.completed ? 'text-white/60 line-through' : 'text-white'}`}>
                  {milestone.title}
                </h4>
                <p className={`text-sm ${milestone.completed ? 'text-white/40' : 'text-white/70'}`}>
                  {milestone.description}
                </p>
                {milestone.targetDate && (
                  <p className="text-xs text-white/50 mt-1">
                    Target: {new Date(milestone.targetDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Goals Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Target className="h-4 w-4" />
            Short-term Goals
          </h3>
          <ul className="space-y-2">
            {(roadmap.goals?.shortTerm || []).map((goal, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-white/80">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>{goal}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Long-term Goals
          </h3>
          <ul className="space-y-2">
            {(roadmap.goals?.longTerm || []).map((goal, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-white/80">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>{goal}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Skills Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white">Skills Development</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(roadmap.skills || []).map((skill, index) => (
            <div key={index} className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-white text-sm">{skill.name}</span>
                <span className="text-xs text-white/60">{skill.level} → {skill.targetLevel}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ 
                    width: skill.level === 'beginner' ? '33%' : 
                           skill.level === 'intermediate' ? '66%' : '100%' 
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
