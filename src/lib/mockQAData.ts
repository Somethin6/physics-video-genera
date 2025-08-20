import { RenderSequence, FrameAnalysis, QAMetrics, AnalysisIssue, OverallQAMetrics } from './qa-types'

// Mock data for development and testing
export const mockRenderSequence: RenderSequence = {
  id: 'seq-001',
  name: 'Quantum Harmonic Oscillator - Shot 03',
  frameCount: 240,
  framerate: 30,
  duration: 8.0,
  resolution: { width: 1920, height: 1080 },
  frames: Array.from({ length: 240 }, (_, i) => `/mock-frames/frame_${String(i + 1).padStart(4, '0')}.png`),
  uploadedAt: new Date(),
  status: 'complete'
}

export const mockQAMetrics: OverallQAMetrics = {
  averageSSIM: 0.94,
  motionStabilityScore: 0.87,
  textLegibilityScore: 0.91,
  overallQualityScore: 0.88,
  totalFramesAnalyzed: 240,
  issuesDetected: 12,
  criticalIssues: 2,
  lastAnalysisTime: new Date()
}

export const generateMockFrameAnalyses = (count: number): FrameAnalysis[] => {
  return Array.from({ length: count }, (_, i) => ({
    frameIndex: i,
    timestamp: i / 30,
    status: 'complete' as const,
    metrics: {
      ssim: 0.88 + Math.random() * 0.12,
      opticalFlowStability: 0.85 + Math.random() * 0.15,
      textLegibility: 0.90 + Math.random() * 0.10,
      colorAccuracy: 0.92 + Math.random() * 0.08,
      timestamp: Date.now() - Math.random() * 86400000
    },
    issues: generateRandomIssues(),
    thumbnailUrl: `/mock-frames/frame_${String(i + 1).padStart(4, '0')}.png`
  }))
}

const generateRandomIssues = (): AnalysisIssue[] => {
  const possibleIssues: Omit<AnalysisIssue, 'location'>[] = [
    {
      type: 'text-legibility',
      severity: 'medium',
      description: 'Mathematical notation partially obscured by background',
      suggestion: 'Increase text contrast or add background overlay'
    },
    {
      type: 'motion-artifact',
      severity: 'low',
      description: 'Minor frame stuttering detected during transition',
      suggestion: 'Smooth motion curves in animation timeline'
    },
    {
      type: 'color-issue',
      severity: 'high',
      description: 'Color temperature shift between consecutive frames',
      suggestion: 'Verify color management and OCIO settings'
    },
    {
      type: 'composition',
      severity: 'medium',
      description: 'Important visual elements near frame edge',
      suggestion: 'Adjust framing to ensure safe areas compliance'
    },
    {
      type: 'technical',
      severity: 'critical',
      description: 'Render artifacts visible in volumetric simulation',
      suggestion: 'Increase simulation resolution or adjust solver settings'
    }
  ]

  const numIssues = Math.floor(Math.random() * 3)
  const selectedIssues = possibleIssues
    .sort(() => Math.random() - 0.5)
    .slice(0, numIssues)

  return selectedIssues.map(issue => ({
    ...issue,
    location: Math.random() > 0.5 ? {
      x: Math.floor(Math.random() * 1920),
      y: Math.floor(Math.random() * 1080),
      width: Math.floor(Math.random() * 200) + 50,
      height: Math.floor(Math.random() * 200) + 50
    } : undefined
  }))
}

export const mockAnalyzeFrame = async (frameIndex: number): Promise<FrameAnalysis> => {
  // Simulate analysis delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))
  
  return {
    frameIndex,
    timestamp: frameIndex / 30,
    status: 'complete',
    metrics: {
      ssim: 0.88 + Math.random() * 0.12,
      opticalFlowStability: 0.85 + Math.random() * 0.15,
      textLegibility: 0.90 + Math.random() * 0.10,
      colorAccuracy: 0.92 + Math.random() * 0.08,
      timestamp: Date.now()
    },
    issues: generateRandomIssues(),
    thumbnailUrl: `/mock-frames/frame_${String(frameIndex + 1).padStart(4, '0')}.png`
  }
}

export const mockUploadSequence = async (files: FileList): Promise<RenderSequence> => {
  // Simulate upload and processing
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const frameCount = files.length
  const sequence: RenderSequence = {
    id: `seq-${Date.now()}`,
    name: `Uploaded Sequence - ${new Date().toLocaleDateString()}`,
    frameCount,
    framerate: 30,
    duration: frameCount / 30,
    resolution: { width: 1920, height: 1080 },
    frames: Array.from(files, (file, i) => URL.createObjectURL(file)),
    uploadedAt: new Date(),
    status: 'complete'
  }
  
  return sequence
}