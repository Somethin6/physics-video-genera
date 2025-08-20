"""Shared TypeScript types for Physics Foundry"""

export interface Project {
  id: string
  title: string
  description?: string
  topic: string
  duration: number
  level: 'beginner' | 'intermediate' | 'advanced'
  status: 'created' | 'in_progress' | 'completed' | 'failed'
  progress: number
  created_at?: string
  updated_at?: string
}

export interface PipelineStatus {
  pipeline_id: string
  status: 'planning' | 'scripting' | 'rendering' | 'assembling' | 'complete' | 'error'
  progress: number
  current_operation?: string
  estimated_completion?: string
  current_step?: number
  total_steps?: number
}

export interface QualityMetrics {
  overall_score: number
  ssim: number
  psnr?: number
  vmaf?: number
  motion_stability?: number
  text_legibility?: number
}

export interface FrameAnalysis {
  frame_index: number
  timestamp: number
  metrics: QualityMetrics
  issues: string[]
  passed: boolean
  analyzed_at: string
}

export interface AudioAlignment {
  word: string
  start: number
  end: number
  confidence: number
}

export interface SystemMetrics {
  gpu: {
    usage: number
    memory: number
    temperature: number
  }
  cpu: {
    usage: number
    memory: number
  }
  models: {
    [key: string]: 'loading' | 'ready' | 'error'
  }
  pipeline: {
    activeProjects: number
    queueLength: number
    avgRenderTime: number
  }
}

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}