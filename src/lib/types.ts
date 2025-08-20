export interface Project {
  id: string
  title: string
  topic: string
  duration: number
  createdAt: string
  status: ProjectStatus
  progress: ProjectProgress
  qaAnalysis?: QAAnalysis
  renderSettings?: RenderSettings
}

export type ProjectStatus = 
  | 'initializing'
  | 'outlining' 
  | 'scripting'
  | 'rendering'
  | 'qa-analysis'
  | 'fixing'
  | 'completed'
  | 'error'

export interface ProjectProgress {
  outline: number
  script: number
  shots: number
  renders: number
  qa: number
  assembly: number
}

export interface QAAnalysis {
  frameCount: number
  analyzedFrames: number
  issues: QAIssue[]
  overallScore: number
  lastAnalyzed: string
  metrics: QAMetrics
}

export interface QAIssue {
  id: string
  type: QAIssueType
  severity: 'low' | 'medium' | 'high' | 'critical'
  frameNumber: number
  timestamp: number
  description: string
  suggestedFix?: string
  status: 'detected' | 'analyzing' | 'fixing' | 'resolved' | 'ignored'
}

export type QAIssueType = 
  | 'visual-quality'
  | 'equation-legibility' 
  | 'motion-continuity'
  | 'timing-sync'
  | 'color-consistency'
  | 'text-overlap'
  | 'audio-sync'

export interface QAMetrics {
  visualQuality: number
  equationLegibility: number
  motionContinuity: number
  timingAccuracy: number
  overallScore: number
}

export interface RenderSettings {
  engine: 'manim' | 'blender' | 'taichi'
  resolution: string
  frameRate: number
  quality: 'preview' | 'final'
  samples?: number
  useOptiX: boolean
}

export interface Shot {
  id: string
  projectId: string
  sequence: number
  title: string
  duration: number
  engine: 'manim' | 'blender' | 'taichi'
  status: ShotStatus
  renderPath?: string
  qaAnalysis?: QAAnalysis
  issues: QAIssue[]
}

export type ShotStatus = 
  | 'queued'
  | 'rendering' 
  | 'analyzing'
  | 'complete'
  | 'failed'
  | 'fixing'

export interface FrameAnalysis {
  frameNumber: number
  timestamp: number
  visualQuality: number
  detectedIssues: QAIssue[]
  ocrResults?: OCRResult[]
  motionVector?: MotionData
}

export interface OCRResult {
  text: string
  confidence: number
  bbox: [number, number, number, number]
  legible: boolean
}

export interface MotionData {
  magnitude: number
  direction: number
  continuity: number
}