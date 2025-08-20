export interface QAAnalysis {
  frameNumber: number
  timestamp: number
  ssimScore: number
  motionContinuity: number
  ocrReadability: number
  issues: QAIssue[]
  thumbnailUrl?: string
}

export interface QAIssue {
  id: string
  type: 'motion_jitter' | 'low_contrast' | 'label_clipped' | 'timing_drift' | 'blur' | 'artifacts'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  suggestion: string
  bbox?: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface RenderSequence {
  id: string
  projectId: string
  shotId: string
  name: string
  frameCount: number
  fps: number
  resolution: {
    width: number
    height: number
  }
  status: 'uploading' | 'analyzing' | 'completed' | 'failed'
  progress: number
  createdAt: string
  updatedAt: string
  analyses: QAAnalysis[]
  overallScore: number
  issueCount: {
    low: number
    medium: number
    high: number
    critical: number
  }
}

export interface QAMetrics {
  averageSSIM: number
  motionStability: number
  textReadability: number
  overallQuality: number
  frameAnalysisCount: number
  totalIssues: number
}

export interface QASettings {
  ssimThreshold: number
  motionThreshold: number
  ocrThreshold: number
  analysisInterval: number // Analyze every Nth frame
  autoSuggestions: boolean
  enablePreview: boolean
}