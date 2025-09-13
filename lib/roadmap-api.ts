import { api, ApiResponse } from './api'

export interface Course {
  _id: string
  title: string
  category: string
  durationWeeks: number
  instructor: string
  students: number
  status: string
  price: number
  description: string
  createdAt: string
  updatedAt: string
}

export interface RoadmapCourse {
  course: Course
  order: number
  reason: string
  estimatedDuration: string
  prerequisites: string[]
}

export interface Milestone {
  title: string
  description: string
  targetDate: string
  completed: boolean
  _id?: string
}

export interface Skill {
  name: string
  level: 'beginner' | 'intermediate' | 'advanced'
  targetLevel: 'beginner' | 'intermediate' | 'advanced'
}

export interface Roadmap {
  _id: string
  user: string
  title: string
  description: string
  courses: RoadmapCourse[]
  timeline: {
    totalDuration: string
    milestones: Milestone[]
  }
  goals: {
    shortTerm: string[]
    longTerm: string[]
  }
  skills: Skill[]
  status: 'generated' | 'in_progress' | 'completed' | 'paused'
  progress: number
  aiMetadata: {
    model: string
    processingTime: number
    confidence: number
    fallbackUsed: boolean
  }
  createdAt: string
  updatedAt: string
}

export interface UpdateRoadmapProgressRequest {
  progress?: number
  status?: 'generated' | 'in_progress' | 'completed' | 'paused'
  milestoneId?: string
}

// API functions for roadmap operations
export const roadmapApi = {
  // Generate a new roadmap
  generate: async (): Promise<ApiResponse<Roadmap>> => {
    return api.post<Roadmap>('/roadmap/generate')
  },

  // Get user's roadmap
  get: async (): Promise<ApiResponse<Roadmap>> => {
    return api.get<Roadmap>('/roadmap')
  },

  // Update roadmap progress
  updateProgress: async (data: UpdateRoadmapProgressRequest): Promise<ApiResponse<Roadmap>> => {
    return api.put<Roadmap>('/roadmap/progress', data)
  },

  // Delete user's roadmap
  delete: async (): Promise<ApiResponse<void>> => {
    return api.delete<void>('/roadmap')
  },

  // Regenerate roadmap
  regenerate: async (): Promise<ApiResponse<Roadmap>> => {
    return api.post<Roadmap>('/roadmap/regenerate')
  }
}
