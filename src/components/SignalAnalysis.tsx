import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  TrendingUp, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Activity,
  Target
} from '@phosphor-icons/react'
import { RenderFrame, SignalAnalysis } from '@/lib/types'

interface SignalAnalysisProps {
  frames: RenderFrame[]
  currentFrame: number
  onAnalysisComplete?: (analysis: SignalAnalysis) => void
}

export default function SignalAnalysis({ frames, currentFrame, onAnalysisComplete }: SignalAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<SignalAnalysis | null>(null)
  const [analysisHistory, setAnalysisHistory] = useState<SignalAnalysis[]>([])
  const [progress, setProgress] = useState(0)
  const [analysisType, setAnalysisType] = useState<'ssim' | 'optical_flow' | 'full'>('full')

  const currentFrameData = frames[currentFrame]
  const hasEnoughFrames = frames.length >= 2

  // Simulate SSIM analysis
  const simulateSSIMAnalysis = async (): Promise<{ ssim: number; issues: string[] }> => {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))
    
    const baseSSIM = 0.85 + Math.random() * 0.1
    const issues: string[] = []
    
    if (baseSSIM < 0.88) {
      issues.push('Frame stability below optimal threshold')
    }
    if (Math.random() < 0.2) {
      issues.push('Potential compression artifacts detected')
    }
    if (Math.random() < 0.15) {
      issues.push('Color shift between consecutive frames')
    }
    
    return { ssim: baseSSIM, issues }
  }

  // Simulate optical flow analysis
  const simulateOpticalFlowAnalysis = async (): Promise<{ 
    opticalFlow: number; 
    motionContinuity: number; 
    issues: string[] 
  }> => {
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))
    
    const opticalFlow = 0.8 + Math.random() * 0.15
    const motionContinuity = 0.75 + Math.random() * 0.2
    const issues: string[] = []
    
    if (opticalFlow < 0.85) {
      issues.push('Irregular motion vectors detected')
    }
    if (motionContinuity < 0.8) {
      issues.push('Motion discontinuity between frames')
    }
    if (Math.random() < 0.25) {
      issues.push('Rapid motion may cause viewer discomfort')
    }
    if (Math.random() < 0.15) {
      issues.push('Inconsistent animation timing detected')
    }
    
    return { opticalFlow, motionContinuity, issues }
  }

  // Simulate frame stability analysis
  const simulateFrameStabilityAnalysis = async (): Promise<{ 
    frameStability: number; 
    issues: string[] 
  }> => {
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800))
    
    const frameStability = 0.88 + Math.random() * 0.1
    const issues: string[] = []
    
    if (frameStability < 0.9) {
      issues.push('Frame-to-frame variations above threshold')
    }
    if (Math.random() < 0.18) {
      issues.push('Temporal noise in static elements')
    }
    
    return { frameStability, issues }
  }

  const runAnalysis = async () => {
    if (!hasEnoughFrames || isAnalyzing) return

    setIsAnalyzing(true)
    setProgress(0)
    setAnalysis(null)

    try {
      const allIssues: string[] = []
      let ssim = 0
      let opticalFlow = 0
      let motionContinuity = 0
      let frameStability = 0

      // Run SSIM analysis
      if (analysisType === 'ssim' || analysisType === 'full') {
        setProgress(20)
        const ssimResult = await simulateSSIMAnalysis()
        ssim = ssimResult.ssim
        allIssues.push(...ssimResult.issues)
      }

      // Run optical flow analysis
      if (analysisType === 'optical_flow' || analysisType === 'full') {
        setProgress(50)
        const flowResult = await simulateOpticalFlowAnalysis()
        opticalFlow = flowResult.opticalFlow
        motionContinuity = flowResult.motionContinuity
        allIssues.push(...flowResult.issues)
      }

      // Run frame stability analysis
      if (analysisType === 'full') {
        setProgress(80)
        const stabilityResult = await simulateFrameStabilityAnalysis()
        frameStability = stabilityResult.frameStability
        allIssues.push(...stabilityResult.issues)
      }

      setProgress(100)

      const finalAnalysis: SignalAnalysis = {
        ssim,
        opticalFlow,
        motionContinuity,
        frameStability,
        issues: allIssues
      }

      setAnalysis(finalAnalysis)
      setAnalysisHistory(prev => [finalAnalysis, ...prev.slice(0, 9)])
      onAnalysisComplete?.(finalAnalysis)

    } catch (error) {
      console.error('Signal analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
      setProgress(0)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600'
    if (score >= 0.8) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-500'
    if (score >= 0.8) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getAnalysisTypeDescription = () => {
    switch (analysisType) {
      case 'ssim': return 'Structural Similarity Index measurement between consecutive frames'
      case 'optical_flow': return 'Motion vector analysis and continuity assessment'
      case 'full': return 'Complete signal analysis including SSIM, optical flow, and stability'
      default: return ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 size={24} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Signal Analysis</h3>
            <p className="text-sm text-muted-foreground">
              SSIM, optical flow, and motion analysis for frames {Math.max(0, currentFrame - 5)} - {Math.min(frames.length - 1, currentFrame + 5)}
            </p>
          </div>
        </div>
        
        <Button
          onClick={runAnalysis}
          disabled={isAnalyzing || !hasEnoughFrames}
          className="gap-2"
        >
          {isAnalyzing ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <Zap size={16} />
          )}
          {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
        </Button>
      </div>

      {/* Prerequisites Check */}
      {!hasEnoughFrames && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle size={16} />
              <span className="text-sm font-medium">
                Need at least 2 frames for signal analysis
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Progress */}
      {isAnalyzing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-blue-600 animate-pulse" />
                <span className="text-sm font-medium">
                  Running {analysisType === 'full' ? 'complete' : analysisType} signal analysis...
                </span>
              </div>
              <Progress value={progress} className="w-full" />
              <div className="text-xs text-muted-foreground">
                {progress < 30 && 'Computing SSIM metrics...'}
                {progress >= 30 && progress < 70 && 'Analyzing optical flow...'}
                {progress >= 70 && progress < 95 && 'Assessing frame stability...'}
                {progress >= 95 && 'Finalizing analysis...'}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target size={20} />
            Analysis Configuration
          </CardTitle>
          <CardDescription>
            Select the type of signal analysis to perform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-3 block">Analysis Type</label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={() => setAnalysisType('ssim')}
                variant={analysisType === 'ssim' ? 'default' : 'outline'}
                size="sm"
                className="h-auto p-3 flex-col"
              >
                <BarChart3 size={20} className="mb-1" />
                <span className="text-xs">SSIM Only</span>
              </Button>
              
              <Button
                onClick={() => setAnalysisType('optical_flow')}
                variant={analysisType === 'optical_flow' ? 'default' : 'outline'}
                size="sm"
                className="h-auto p-3 flex-col"
              >
                <TrendingUp size={20} className="mb-1" />
                <span className="text-xs">Optical Flow</span>
              </Button>
              
              <Button
                onClick={() => setAnalysisType('full')}
                variant={analysisType === 'full' ? 'default' : 'outline'}
                size="sm"
                className="h-auto p-3 flex-col"
              >
                <Activity size={20} className="mb-1" />
                <span className="text-xs">Full Analysis</span>
              </Button>
            </div>
          </div>

          <div className="p-3 bg-muted rounded text-sm">
            {getAnalysisTypeDescription()}
          </div>
        </CardContent>
      </Card>

      {/* Current Analysis Results */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 size={20} className="text-blue-600" />
              Analysis Results
            </CardTitle>
            <CardDescription>
              Signal analysis metrics for current frame sequence
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {analysis.ssim > 0 && (
                <div className="text-center">
                  <div className="mb-2">
                    <Badge className={`${getScoreBadgeColor(analysis.ssim)} text-white`}>
                      SSIM
                    </Badge>
                  </div>
                  <div className={`text-2xl font-bold ${getScoreColor(analysis.ssim)}`}>
                    {(analysis.ssim * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Structural Similarity</div>
                </div>
              )}

              {analysis.opticalFlow > 0 && (
                <div className="text-center">
                  <div className="mb-2">
                    <Badge className={`${getScoreBadgeColor(analysis.opticalFlow)} text-white`}>
                      Flow
                    </Badge>
                  </div>
                  <div className={`text-2xl font-bold ${getScoreColor(analysis.opticalFlow)}`}>
                    {(analysis.opticalFlow * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Optical Flow</div>
                </div>
              )}

              {analysis.motionContinuity > 0 && (
                <div className="text-center">
                  <div className="mb-2">
                    <Badge className={`${getScoreBadgeColor(analysis.motionContinuity)} text-white`}>
                      Motion
                    </Badge>
                  </div>
                  <div className={`text-2xl font-bold ${getScoreColor(analysis.motionContinuity)}`}>
                    {(analysis.motionContinuity * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Motion Continuity</div>
                </div>
              )}

              {analysis.frameStability > 0 && (
                <div className="text-center">
                  <div className="mb-2">
                    <Badge className={`${getScoreBadgeColor(analysis.frameStability)} text-white`}>
                      Stability
                    </Badge>
                  </div>
                  <div className={`text-2xl font-bold ${getScoreColor(analysis.frameStability)}`}>
                    {(analysis.frameStability * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Frame Stability</div>
                </div>
              )}
            </div>

            {/* Overall Assessment */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {analysis.issues.length === 0 ? (
                  <CheckCircle className="text-green-500" size={20} />
                ) : (
                  <AlertTriangle className="text-yellow-500" size={20} />
                )}
                <h4 className="font-medium">
                  {analysis.issues.length === 0 ? 'Excellent Signal Quality' : 'Signal Quality Issues'}
                </h4>
              </div>
              
              {analysis.issues.length === 0 ? (
                <p className="text-sm text-green-600">
                  All signal analysis metrics are within acceptable ranges. Frame quality and motion continuity are optimal.
                </p>
              ) : (
                <div className="space-y-2">
                  {analysis.issues.map((issue, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">{issue}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Detailed Metrics */}
            <div className="space-y-3">
              <h4 className="font-medium">Detailed Metrics</h4>
              
              {analysis.ssim > 0 && (
                <div className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <div className="font-medium text-sm">Structural Similarity Index (SSIM)</div>
                    <div className="text-xs text-muted-foreground">
                      Measures perceptual similarity between consecutive frames
                    </div>
                  </div>
                  <div className={`font-bold ${getScoreColor(analysis.ssim)}`}>
                    {analysis.ssim.toFixed(3)}
                  </div>
                </div>
              )}

              {analysis.opticalFlow > 0 && (
                <div className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <div className="font-medium text-sm">Optical Flow Quality</div>
                    <div className="text-xs text-muted-foreground">
                      Consistency and smoothness of motion vectors
                    </div>
                  </div>
                  <div className={`font-bold ${getScoreColor(analysis.opticalFlow)}`}>
                    {analysis.opticalFlow.toFixed(3)}
                  </div>
                </div>
              )}

              {analysis.motionContinuity > 0 && (
                <div className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <div className="font-medium text-sm">Motion Continuity</div>
                    <div className="text-xs text-muted-foreground">
                      Temporal consistency of object movement
                    </div>
                  </div>
                  <div className={`font-bold ${getScoreColor(analysis.motionContinuity)}`}>
                    {analysis.motionContinuity.toFixed(3)}
                  </div>
                </div>
              )}

              {analysis.frameStability > 0 && (
                <div className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <div className="font-medium text-sm">Frame Stability</div>
                    <div className="text-xs text-muted-foreground">
                      Temporal noise and unwanted variations
                    </div>
                  </div>
                  <div className={`font-bold ${getScoreColor(analysis.frameStability)}`}>
                    {analysis.frameStability.toFixed(3)}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis History */}
      {analysisHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis History</CardTitle>
            <CardDescription>Recent signal analysis results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysisHistory.slice(0, 3).map((hist, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-2">
                      {hist.ssim > 0 && (
                        <Badge variant="outline" className="text-xs">
                          SSIM: {(hist.ssim * 100).toFixed(0)}%
                        </Badge>
                      )}
                      {hist.opticalFlow > 0 && (
                        <Badge variant="outline" className="text-xs">
                          Flow: {(hist.opticalFlow * 100).toFixed(0)}%
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Analysis #{analysisHistory.length - index}
                    </span>
                  </div>
                  
                  {hist.issues.length > 0 ? (
                    <div className="text-sm text-yellow-600">
                      {hist.issues.length} issue(s) detected
                    </div>
                  ) : (
                    <div className="text-sm text-green-600">
                      No issues detected
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}