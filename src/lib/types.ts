export interface Project {
  id: string
  title: string
  topic: string
  duration: number
  description?: string
  createdAt: string
  status: 'initializing' | 'planning' | 'scripting' | 'rendering' | 'qa' | 'completed' | 'error'
  progress: {
    outline: number
    script: number
    shots: number
    renders: number
    qa: number
    assembly: number
  }
  shots?: Shot[]
}

export interface Shot {
  id: string
  projectId: string
  sequence: number
  title: string
  description: string
  duration: number
  status: 'planning' | 'scripting' | 'rendering' | 'qa' | 'approved' | 'error'
  renderer: 'manim' | 'blender' | 'taichi' | 'matplotlib'
  frames?: RenderFrame[]
  qaResults?: QAResult[]
  createdAt: string
  updatedAt: string
}

export interface RenderFrame {
  id: string
  shotId: string
  frameNumber: number
  timestamp: number
  imagePath: string
  thumbnail: string
  status: 'rendering' | 'completed' | 'error' | 'analyzing'
  qaScore?: number
  issues?: FrameIssue[]
  metadata: {
    renderTime: number
    resolution: { width: number; height: number }
    renderer: string
    settings: Record<string, any>
  }
}

export interface FrameIssue {
  id: string
  frameId: string
  type: 'physics_accuracy' | 'visual_clarity' | 'composition' | 'technical' | 'continuity'
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

export interface QAResult {
  id: string
  shotId: string
  overallScore: number
  frameCount: number
  passedFrames: number
  issues: FrameIssue[]
  analysisType: 'vision_llm' | 'ssim' | 'optical_flow' | 'composite'
  completedAt: string
  processingTime: number
}

export interface RenderPreview {
  id: string
  projectId: string
  shotId: string
  frames: RenderFrame[]
  currentFrame: number
  playbackRate: number
  analysisMode: 'overview' | 'detailed' | 'comparison'
  filters: {
    issueTypes: string[]
    severity: string[]
    confidence: number
  }
}

export interface ComparisonView {
  referenceFrame: RenderFrame
  currentFrame: RenderFrame
  diffHighlight: boolean
  syncedScrubbing: boolean
}