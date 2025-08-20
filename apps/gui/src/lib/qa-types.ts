export interface QAMetrics {
  ssim: number
  opticalFlowStability: number
  textLegibility: number
  colorAccuracy: number
  timestamp: number
}

export interface FrameAnalysis {
  frameIndex: number
  timestamp: number
  issues: AnalysisIssue[]
  metrics: QAMetrics
  thumbnailUrl?: string
  status: 'analyzing' | 'complete' | 'error'
}

export interface AnalysisIssue {
  type: 'text-legibility' | 'motion-artifact' | 'color-issue' | 'composition' | 'technical'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  suggestion?: string
  location?: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface RenderSequence {
  id: string
  name: string
  frameCount: number
  framerate: number
  duration: number
  resolution: {
    width: number
    height: number
  }
  frames: string[] // Array of frame URLs/paths
  uploadedAt: Date
  status: 'uploaded' | 'analyzing' | 'complete' | 'error'
}

export interface QAAnalysisConfig {
  enableSSIM: boolean
  enableOpticalFlow: boolean
  enableOCR: boolean
  enableLLMCritique: boolean
  ssimThreshold: number
  flowStabilityThreshold: number
  textLegibilityThreshold: number
  batchSize: number
}

export interface OverallQAMetrics {
  averageSSIM: number
  motionStabilityScore: number
  textLegibilityScore: number
  overallQualityScore: number
  totalFramesAnalyzed: number
  issuesDetected: number
  criticalIssues: number
  lastAnalysisTime: Date
}

export interface FrameComparisonResult {
  frameA: number
  frameB: number
  ssimScore: number
  differences: Array<{
    type: 'added' | 'removed' | 'changed'
    region: { x: number; y: number; width: number; height: number }
    description: string
  }>
}