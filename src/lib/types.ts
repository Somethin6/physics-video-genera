export interface Project {
  id: string
  title: string
  topic: string
  duration: number // in minutes
  createdAt: string
  status: 'initializing' | 'outlining' | 'scripting' | 'rendering' | 'qa' | 'assembling' | 'completed' | 'failed'
  progress: {
    outline: number
    script: number
    shots: number
    renders: number
    qa: number
    assembly: number
  }
  description?: string
  targetAudience?: string
  complexity?: 'beginner' | 'intermediate' | 'advanced'
}

export interface Shot {
  id: string
  projectId: string
  sequence: number
  title: string
  script: string
  duration: number
  renderer: 'manim' | 'blender' | 'taichi' | 'matplotlib'
  status: 'pending' | 'rendering' | 'qa' | 'passed' | 'failed' | 'retrying'
  attempts: number
  maxAttempts: number
  frames: Frame[]
  qaReport?: QAReport
  otioPath?: string
  renderPath?: string
}

export interface Frame {
  id: string
  shotId: string
  frameNumber: number
  timestamp: number
  imagePath: string
  thumbnailPath: string
  qaChecked: boolean
  qaScore?: number
  qaIssues: string[]
}

export interface QAReport {
  id: string
  shotId: string
  timestamp: string
  overallScore: number
  checks: QACheck[]
  llavaAnalysis?: LLaVAAnalysis
  signalAnalysis?: SignalAnalysis
  recommendation: 'pass' | 'retry' | 'manual_review'
  fixes?: string[]
}

export interface QACheck {
  type: 'physics_accuracy' | 'visual_clarity' | 'timing' | 'continuity' | 'math_notation'
  passed: boolean
  score: number
  description: string
  details?: string
}

export interface LLaVAAnalysis {
  prompt: string
  response: string
  confidence: number
  physicsElements: string[]
  visualElements: string[]
  issues: string[]
}

export interface SignalAnalysis {
  ssim: number
  opticalFlow: number
  motionContinuity: number
  frameStability: number
  issues: string[]
}

export interface QAResult {
  id: string
  shotId: string
  overallScore: number
  frameCount: number
  passedFrames: number
  issues: FrameIssue[]
  analysisType: 'vision_llm' | 'signal_analysis' | 'hybrid'
  completedAt: string
  processingTime: number
}

export interface RenderFrame {
  id: string
  shotId: string
  frameNumber: number
  timestamp: number
  imagePath: string
  thumbnail: string
  status: 'rendering' | 'completed' | 'failed'
  qaScore?: number
  issues?: FrameIssue[]
  metadata: {
    renderTime: number
    resolution: { width: number; height: number }
    renderer: string
    settings: {
      samples: number
      denoiser: string
      colorSpace: string
    }
  }
}

export interface FrameIssue {
  id: string
  frameId: string
  type: 'physics_accuracy' | 'visual_clarity' | 'timing' | 'continuity' | 'math_notation' | 'analysis_error'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  suggestion: string
  region?: {
    x: number
    y: number
    width: number
    height: number
  }
  confidence: number
  detectedAt: string
}

export interface RenderEngine {
  name: 'manim' | 'blender' | 'taichi' | 'matplotlib'
  status: 'idle' | 'busy' | 'error'
  currentShot?: string
  queueLength: number
  avgRenderTime: number
  lastActivity: string
}

export interface SystemStatus {
  cpu: number
  memory: number
  gpu: number
  gpuMemory: number
  temperature: number
  renderEngines: RenderEngine[]
  llmStatus: {
    model: string
    status: 'idle' | 'busy' | 'error'
    tokensPerSecond: number
    memoryUsage: number
  }
  llavaStatus: {
    model: string
    status: 'idle' | 'busy' | 'error'
    lastAnalysis: string
  }
}

export interface PipelineSettings {
  llmModel: string
  llavaModel: string
  renderQuality: 'draft' | 'preview' | 'final'
  maxRetries: number
  qaThreshold: number
  enableOptiX: boolean
  enableCUDA: boolean
  outputFormat: 'mp4' | 'mov' | 'avi'
  videoCodec: 'h264_nvenc' | 'hevc_nvenc' | 'libx264'
  audioCodec: 'aac' | 'flac'
  framerate: 24 | 30 | 60
}