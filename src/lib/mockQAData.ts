import { RenderSequence, QAAnalysis, QAIssue, QAMetrics } from '@/lib/qa-types'
import { FrameAnalysis } from '@/lib/types'

// Mock data for development and testing
export const mockRenderSequence: RenderSequence = {
  id: 'seq-001',
  projectId: 'project-001',
  shotId: 'shot-001',
  name: 'Electromagnetic Field Visualization',
  frameCount: 300,
  fps: 30,
  resolution: {
    width: 1920,
    height: 1080
  },
  status: 'completed',
  progress: 100,
  createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  updatedAt: new Date().toISOString(),
  analyses: [],
  overallScore: 87,
  issueCount: {
    low: 5,
    medium: 2,
    high: 1,
    critical: 0
  }
}

export const mockQAMetrics: QAMetrics = {
  averageSSIM: 0.89,
  motionStability: 0.91,
  textReadability: 0.85,
  overallQuality: 0.87,
  frameAnalysisCount: 150,
  totalIssues: 8
}

export const generateMockAnalyses = (frameCount: number): QAAnalysis[] => {
  const analyses: QAAnalysis[] = []
  
  // Generate analyses for every 10th frame
  for (let i = 0; i < frameCount; i += 10) {
    const frameNumber = i
    const timestamp = i / mockRenderSequence.fps
    
    // Generate random quality scores with some variation
    const baseSSIM = 0.85 + Math.random() * 0.1
    const baseMotion = 0.88 + Math.random() * 0.08
    const baseOCR = 0.82 + Math.random() * 0.12
    
    // Generate issues based on quality scores
    const issues: QAIssue[] = []
    
    // Low SSIM might indicate blur or artifacts
    if (baseSSIM < 0.8) {
      issues.push({
        id: `issue-${frameNumber}-ssim`,
        type: 'blur',
        severity: baseSSIM < 0.7 ? 'high' : 'medium',
        description: 'Image quality degradation detected',
        suggestion: 'Increase render samples or check for motion blur artifacts'
      })
    }
    
    // Low motion continuity indicates jitter
    if (baseMotion < 0.85) {
      issues.push({
        id: `issue-${frameNumber}-motion`,
        type: 'motion_jitter',
        severity: baseMotion < 0.75 ? 'high' : 'medium',
        description: 'Motion discontinuity detected',
        suggestion: 'Check keyframe interpolation and easing curves'
      })
    }
    
    // Low OCR readability indicates text issues
    if (baseOCR < 0.8) {
      issues.push({
        id: `issue-${frameNumber}-ocr`,
        type: 'label_clipped',
        severity: baseOCR < 0.6 ? 'critical' : 'medium',
        description: 'Mathematical notation may be difficult to read',
        suggestion: 'Increase font size or improve contrast ratio',
        bbox: {
          x: Math.random() * 1000,
          y: Math.random() * 600,
          width: 100 + Math.random() * 200,
          height: 30 + Math.random() * 50
        }
      })
    }
    
    // Randomly add some timing drift issues
    if (Math.random() < 0.1) {
      issues.push({
        id: `issue-${frameNumber}-timing`,
        type: 'timing_drift',
        severity: 'low',
        description: 'Minor timing synchronization drift',
        suggestion: 'Verify frame rate consistency and audio alignment'
      })
    }
    
    analyses.push({
      frameNumber,
      timestamp,
      ssimScore: baseSSIM,
      motionContinuity: baseMotion,
      ocrReadability: baseOCR,
      issues,
      thumbnailUrl: `/api/thumbnails/frame-${frameNumber}.jpg`
    })
  }
  
  return analyses
}

export const generateMockFrameAnalyses = (count: number): FrameAnalysis[] => {
  const analyses: FrameAnalysis[] = []
  
  for (let i = 0; i < count; i++) {
    const frameNumber = i * 5 // Every 5th frame
    const timestamp = (frameNumber / mockRenderSequence.fps) * 1000 // Convert to milliseconds
    const visualQuality = 0.75 + Math.random() * 0.2
    
    const detectedIssues: QAIssue[] = []
    
    // Randomly generate issues
    if (Math.random() < 0.3) { // 30% chance of issues
      const issueTypes: QAIssue['type'][] = ['motion_jitter', 'low_contrast', 'label_clipped', 'blur']
      const severities: QAIssue['severity'][] = ['low', 'medium', 'high', 'critical']
      
      const issueType = issueTypes[Math.floor(Math.random() * issueTypes.length)]
      const severity = severities[Math.floor(Math.random() * severities.length)]
      
      detectedIssues.push({
        id: `issue-${frameNumber}-${issueType}`,
        type: issueType,
        severity,
        description: getIssueDescription(issueType),
        suggestion: getIssueSuggestion(issueType)
      })
    }
    
    analyses.push({
      frameNumber,
      timestamp,
      visualQuality,
      detectedIssues,
      ocrResults: generateMockOCRResults(),
      motionVector: {
        magnitude: Math.random() * 10,
        direction: Math.random() * 360,
        continuity: 0.8 + Math.random() * 0.2
      }
    })
  }
  
  return analyses
}

const getIssueDescription = (type: QAIssue['type']): string => {
  switch (type) {
    case 'motion_jitter':
      return 'Sudden motion discontinuity detected'
    case 'low_contrast':
      return 'Insufficient contrast between text and background'
    case 'label_clipped':
      return 'Mathematical equation appears to be cut off'
    case 'blur':
      return 'Image blur exceeds acceptable threshold'
    case 'timing_drift':
      return 'Audio-visual synchronization drift detected'
    case 'artifacts':
      return 'Visual artifacts detected in rendered output'
    default:
      return 'Quality issue detected'
  }
}

const getIssueSuggestion = (type: QAIssue['type']): string => {
  switch (type) {
    case 'motion_jitter':
      return 'Check keyframe interpolation settings and easing curves'
    case 'low_contrast':
      return 'Increase text contrast or adjust background opacity'
    case 'label_clipped':
      return 'Adjust text positioning or reduce font size'
    case 'blur':
      return 'Increase render samples or check motion blur settings'
    case 'timing_drift':
      return 'Verify frame rate consistency and audio alignment'
    case 'artifacts':
      return 'Review render settings and increase sample count'
    default:
      return 'Review render settings and quality parameters'
  }
}

const generateMockOCRResults = () => {
  if (Math.random() < 0.7) { // 70% chance of having OCR results
    return [
      {
        text: 'E = mc²',
        confidence: 0.92,
        bbox: [100, 200, 150, 40] as [number, number, number, number],
        legible: true
      },
      {
        text: 'F = ma',
        confidence: 0.88,
        bbox: [300, 150, 120, 35] as [number, number, number, number],
        legible: true
      }
    ]
  }
  return undefined
}

// Mock analysis functions
export const mockAnalyzeFrame = async (frameNumber: number): Promise<FrameAnalysis> => {
  // Simulate analysis delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))
  
  const timestamp = (frameNumber / mockRenderSequence.fps) * 1000
  const visualQuality = 0.75 + Math.random() * 0.2
  
  return {
    frameNumber,
    timestamp,
    visualQuality,
    detectedIssues: [],
    ocrResults: generateMockOCRResults(),
    motionVector: {
      magnitude: Math.random() * 10,
      direction: Math.random() * 360,
      continuity: 0.8 + Math.random() * 0.2
    }
  }
}

export const mockUploadSequence = async (files: FileList): Promise<RenderSequence> => {
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const sequence: RenderSequence = {
    ...mockRenderSequence,
    id: `seq-${Date.now()}`,
    name: `Uploaded Sequence ${files.length} frames`,
    frameCount: files.length,
    status: 'analyzing',
    progress: 0,
    analyses: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  return sequence
}

// Initialize mock data with analyses
mockRenderSequence.analyses = generateMockAnalyses(mockRenderSequence.frameCount)