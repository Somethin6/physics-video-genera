import { RenderSequence, FrameAnalysis, QAMetrics, AnalysisIssue, OverallQAMetrics, FrameComparisonResult } from './qa-types'

// Enhanced mock render sequence with more realistic data
export const mockRenderSequence: RenderSequence = {
  id: 'seq-001',
  name: 'Quantum Harmonic Oscillator - Shot 03',
  frameCount: 720, // Extended to 24 seconds at 30fps
  framerate: 30,
  duration: 24.0,
  resolution: { width: 1920, height: 1080 },
  frames: Array.from({ length: 720 }, (_, i) => `/mock-frames/frame_${String(i + 1).padStart(4, '0')}.png`),
  uploadedAt: new Date(),
  status: 'complete'
}

// Cache for frame analyses to simulate persistent analysis results
const frameAnalysisCache = new Map<number, FrameAnalysis>()

export const mockQAMetrics: OverallQAMetrics = {
  averageSSIM: 0.924,
  motionStabilityScore: 0.887,
  textLegibilityScore: 0.854,
  overallQualityScore: 0.888,
  totalFramesAnalyzed: 156,
  issuesDetected: 23,
  criticalIssues: 2,
  lastAnalysisTime: new Date()
}

// Determine frame type based on position in sequence
function getFrameType(frameIndex: number): 'intro' | 'equation' | 'animation' | 'diagram' | 'transition' {
  if (frameIndex < 60) return 'intro'
  if (frameIndex >= 60 && frameIndex < 180) return 'equation'
  if (frameIndex >= 180 && frameIndex < 420) return 'animation'
  if (frameIndex >= 420 && frameIndex < 600) return 'diagram'
  return 'transition'
}

const generateRealisticIssues = (frameIndex: number, frameType: string): AnalysisIssue[] => {
  const issues: AnalysisIssue[] = []
  
  // Frame-type specific issues
  if (frameType === 'equation' && Math.random() > 0.7) {
    issues.push({
      type: 'text-legibility',
      severity: Math.random() > 0.8 ? 'high' : 'medium',
      description: 'Mathematical equation may be too small or low contrast',
      suggestion: 'Increase font size or improve text contrast',
      location: {
        x: 200 + Math.random() * 400,
        y: 150 + Math.random() * 300,
        width: 300 + Math.random() * 200,
        height: 80 + Math.random() * 40
      }
    })
  }

  if (frameType === 'animation' && Math.random() > 0.8) {
    issues.push({
      type: 'motion-artifact',
      severity: 'medium',
      description: 'Motion blur or frame interpolation artifacts detected',
      suggestion: 'Check animation timing and motion blur settings'
    })
  }

  if (frameType === 'diagram' && Math.random() > 0.85) {
    issues.push({
      type: 'composition',
      severity: 'low',
      description: 'Elements may be too close to frame edges',
      suggestion: 'Increase margin around diagram elements',
      location: {
        x: 0,
        y: 0,
        width: 50,
        height: 1080
      }
    })
  }

  // Color issues in certain frame ranges (lighting transitions)
  if (frameIndex > 300 && frameIndex < 350 && Math.random() > 0.6) {
    issues.push({
      type: 'color-issue',
      severity: 'medium',
      description: 'Color cast detected in lighting transition',
      suggestion: 'Check white balance and color grading'
    })
  }

  // Random technical issues
  if (Math.random() > 0.9) {
    issues.push({
      type: 'technical',
      severity: 'medium',
      description: 'Compression artifacts detected',
      suggestion: 'Increase render quality or use different codec'
    })
  }

  // Critical issues are rare but possible
  if (Math.random() > 0.98) {
    const criticalType = Math.random() > 0.5 ? 'text-legibility' : 'technical'
    issues.push({
      type: criticalType,
      severity: 'critical',
      description: criticalType === 'text-legibility' 
        ? 'Text is completely unreadable' 
        : 'Severe rendering corruption detected',
      suggestion: criticalType === 'text-legibility'
        ? 'Redesign text layout with larger, higher contrast fonts'
        : 'Re-render frame with different settings'
    })
  }

  return issues
}

export const generateMockFrameAnalyses = (count: number): FrameAnalysis[] => {
  return Array.from({ length: count }, (_, i) => {
    const frameIndex = Math.floor(Math.random() * 720)
    
    // Use cached analysis if available
    if (frameAnalysisCache.has(frameIndex)) {
      return frameAnalysisCache.get(frameIndex)!
    }
    
    const frameType = getFrameType(frameIndex)
    const issues = generateRealisticIssues(frameIndex, frameType)
    
    // Generate metrics with realistic variation
    let ssim = 0.92 + Math.random() * 0.07
    let opticalFlowStability = 0.88 + Math.random() * 0.1
    let textLegibility = 0.85 + Math.random() * 0.12
    let colorAccuracy = 0.90 + Math.random() * 0.08

    // Adjust metrics based on issues
    issues.forEach(issue => {
      switch (issue.type) {
        case 'text-legibility':
          textLegibility *= issue.severity === 'critical' ? 0.3 : 0.7
          break
        case 'technical':
          ssim *= issue.severity === 'critical' ? 0.4 : 0.8
          break
        case 'motion-artifact':
          opticalFlowStability *= 0.6
          break
        case 'color-issue':
          colorAccuracy *= 0.75
          break
      }
    })

    const analysis: FrameAnalysis = {
      frameIndex,
      timestamp: Date.now() - Math.random() * 86400000,
      status: 'complete',
      metrics: {
        ssim,
        opticalFlowStability,
        textLegibility,
        colorAccuracy,
        timestamp: Date.now()
      },
      issues,
      thumbnailUrl: `/mock-frames/frame_${String(frameIndex + 1).padStart(4, '0')}.png`
    }
    
    frameAnalysisCache.set(frameIndex, analysis)
    return analysis
  })
}

export const mockAnalyzeFrame = async (frameIndex: number): Promise<FrameAnalysis> => {
  // Return cached result if available
  if (frameAnalysisCache.has(frameIndex)) {
    return frameAnalysisCache.get(frameIndex)!
  }

  // Simulate analysis delay
  await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300))
  
  const frameType = getFrameType(frameIndex)
  const issues = generateRealisticIssues(frameIndex, frameType)
  
  // Generate metrics with realistic variation
  let ssim = 0.92 + Math.random() * 0.07
  let opticalFlowStability = 0.88 + Math.random() * 0.1
  let textLegibility = 0.85 + Math.random() * 0.12
  let colorAccuracy = 0.90 + Math.random() * 0.08

  // Adjust metrics based on issues
  issues.forEach(issue => {
    switch (issue.type) {
      case 'text-legibility':
        textLegibility *= issue.severity === 'critical' ? 0.3 : 0.7
        break
      case 'technical':
        ssim *= issue.severity === 'critical' ? 0.4 : 0.8
        break
      case 'motion-artifact':
        opticalFlowStability *= 0.6
        break
      case 'color-issue':
        colorAccuracy *= 0.75
        break
    }
  })

  const analysis: FrameAnalysis = {
    frameIndex,
    timestamp: frameIndex / 30,
    status: 'complete',
    metrics: {
      ssim,
      opticalFlowStability,
      textLegibility,
      colorAccuracy,
      timestamp: Date.now()
    },
    issues,
    thumbnailUrl: `/mock-frames/frame_${String(frameIndex + 1).padStart(4, '0')}.png`
  }
  
  // Cache the result
  frameAnalysisCache.set(frameIndex, analysis)
  
  return analysis
}

export const mockUploadSequence = async (files: FileList): Promise<RenderSequence> => {
  // Simulate upload and processing
  await new Promise(resolve => setTimeout(resolve, 1500))
  
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

export const mockCompareFrames = async (frameA: number, frameB: number): Promise<FrameComparisonResult> => {
  // Simulate comparison processing
  await new Promise(resolve => setTimeout(resolve, 800))
  
  const timeDiff = Math.abs(frameA - frameB)
  const ssimScore = Math.max(0.5, 1 - (timeDiff * 0.01)) // Closer frames have higher SSIM
  
  const differences = []
  
  // Generate realistic differences based on frame distance
  if (timeDiff > 30) {
    differences.push({
      type: 'changed' as const,
      region: { x: 150, y: 200, width: 400, height: 150 },
      description: 'Main content area updated'
    })
  }
  
  if (timeDiff > 10) {
    differences.push({
      type: 'changed' as const,
      region: { x: 50, y: 50, width: 200, height: 80 },
      description: 'Text overlay modified'
    })
  }
  
  if (timeDiff > 60) {
    differences.push({
      type: 'added' as const,
      region: { x: 800, y: 300, width: 300, height: 200 },
      description: 'New visual element appeared'
    })
  }
  
  return {
    frameA,
    frameB,
    ssimScore,
    differences
  }
}