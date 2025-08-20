import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Brain, 
  Eye, 
  BarChart3, 
  Play, 
  Pause, 
  SkipForward,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Cpu,
  Monitor,
  Microscope
} from '@phosphor-icons/react'
import { RenderFrame, FrameIssue, QAResult } from '@/lib/types'

interface FrameByFrameQAEngineProps {
  shotId: string
  frames: RenderFrame[]
  onAnalysisComplete: (results: QAResult[]) => void
  onIssuesDetected: (frameIndex: number, issues: FrameIssue[]) => void
}

export default function FrameByFrameQAEngine({ 
  shotId, 
  frames, 
  onAnalysisComplete,
  onIssuesDetected
}: FrameByFrameQAEngineProps) {
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isAutoPlay, setIsAutoPlay] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisResults, setAnalysisResults] = useState<QAResult[]>([])
  const [currentAnalysis, setCurrentAnalysis] = useState<QAResult | null>(null)
  const [activeMode, setActiveMode] = useState<'manual' | 'batch' | 'realtime'>('manual')

  // Physics-specific QA questions for LLaVA
  const physicsQuestions = [
    "Are all mathematical equations clearly visible and properly formatted?",
    "Do vector arrows point in the correct directions according to physics principles?",
    "Is the physics demonstration scientifically accurate and consistent?",
    "Are visual elements properly aligned and positioned for clarity?",
    "Do color coding and annotations enhance understanding without confusion?",
    "Is the scale and proportion of elements physically realistic?",
    "Are any physics laws or principles violated in the visualization?"
  ]

  // Mock LLaVA frame analysis
  const analyzeFrameWithLLaVA = async (frame: RenderFrame): Promise<QAResult> => {
    const prompt = spark.llmPrompt`
      Analyze this physics video frame for scientific accuracy and visual clarity.
      
      Frame details:
      - Timestamp: ${frame.timestamp}ms
      - Renderer: ${frame.metadata.renderer}
      - Expected content: Physics demonstration
      
      Please evaluate:
      ${physicsQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}
      
      Respond with specific observations about:
      - Physics accuracy (are the concepts correctly demonstrated?)
      - Mathematical correctness (equations, formulas, notation)
      - Visual clarity (readability, contrast, composition)
      - Any issues or improvements needed
      
      Be specific and technical in your assessment.
    `

    try {
      // In real implementation: const response = await spark.llm(prompt, "gpt-4o", false)
      const response = await new Promise<string>(resolve => {
        setTimeout(() => {
          const responses = [
            "Physics accuracy: ✓ Electromagnetic field lines correctly exit positive charges. Mathematical notation: ✓ E = F/q equation properly displayed. Visual clarity: ✓ High contrast, clear vectors. Minor issue: Arrow thickness could be more consistent for better readability.",
            "Physics accuracy: ✓ Wave propagation direction matches theoretical prediction. Mathematical notation: ✓ λ = v/f formula correctly positioned. Visual clarity: ⚠ Some overlapping text in upper right corner may reduce readability.",
            "Physics accuracy: ✗ Vector field divergence appears incorrect near boundary. Mathematical notation: ✓ Gradient notation properly formatted. Visual clarity: ✓ Good color contrast. Critical issue: Physics demonstration contradicts Gauss's law.",
            "Physics accuracy: ✓ Particle trajectories follow expected parabolic paths. Mathematical notation: ✓ Kinematic equations clearly visible. Visual clarity: ✓ Excellent composition and timing. No issues detected.",
            "Physics accuracy: ✓ Energy conservation properly illustrated. Mathematical notation: ⚠ Subscript formatting inconsistent. Visual clarity: ✓ Clear visual hierarchy. Minor issue: Font size variance in equations."
          ]
          resolve(responses[Math.floor(Math.random() * responses.length)])
        }, 1000 + Math.random() * 1000)
      })

      // Parse response and generate issues
      const issues: FrameIssue[] = []
      const score = response.includes('✗') ? 0.4 : response.includes('⚠') ? 0.7 : 0.9

      if (response.includes('Critical issue')) {
        issues.push({
          id: `issue-${Date.now()}`,
          type: 'physics_accuracy',
          severity: 'critical',
          description: 'Physics demonstration contradicts fundamental laws',
          suggestion: 'Review and correct the physics visualization',
          confidence: 0.92,
          frameNumber: frame.frameNumber || 0
        })
      }

      if (response.includes('Minor issue')) {
        issues.push({
          id: `issue-${Date.now()}-minor`,
          type: 'visual_clarity',
          severity: 'low',
          description: 'Visual consistency could be improved',
          suggestion: 'Standardize arrow thickness or font sizing',
          confidence: 0.75,
          frameNumber: frame.frameNumber || 0
        })
      }

      return {
        frameIndex: currentFrame,
        timestamp: frame.timestamp,
        overallScore: score,
        llavaResponse: response,
        issues,
        passed: score >= 0.8,
        confidence: 0.88,
        analysisTime: Date.now()
      }
    } catch (error) {
      console.error('LLaVA analysis failed:', error)
      return {
        frameIndex: currentFrame,
        timestamp: frame.timestamp,
        overallScore: 0,
        llavaResponse: 'Analysis failed',
        issues: [{
          id: `error-${Date.now()}`,
          type: 'analysis_error',
          severity: 'high',
          description: 'Failed to analyze frame with vision model',
          suggestion: 'Retry analysis or check model availability',
          confidence: 1.0,
          frameNumber: frame.frameNumber || 0
        }],
        passed: false,
        confidence: 0,
        analysisTime: Date.now()
      }
    }
  }

  // Run analysis on single frame
  const analyzeSingleFrame = async () => {
    if (!frames[currentFrame]) return

    setIsAnalyzing(true)
    const result = await analyzeFrameWithLLaVA(frames[currentFrame])
    setCurrentAnalysis(result)
    
    // Update results array
    setAnalysisResults(prev => {
      const newResults = [...prev]
      newResults[currentFrame] = result
      return newResults
    })

    // Report issues
    if (result.issues.length > 0) {
      onIssuesDetected(currentFrame, result.issues)
    }

    setIsAnalyzing(false)
  }

  // Run batch analysis on all frames
  const runBatchAnalysis = async () => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)
    const results: QAResult[] = []

    for (let i = 0; i < frames.length; i++) {
      setCurrentFrame(i)
      setAnalysisProgress((i / frames.length) * 100)
      
      const result = await analyzeFrameWithLLaVA(frames[i])
      results.push(result)
      
      // Update as we go
      setAnalysisResults(results)
      
      if (result.issues.length > 0) {
        onIssuesDetected(i, result.issues)
      }
    }

    setAnalysisProgress(100)
    setIsAnalyzing(false)
    onAnalysisComplete(results)
  }

  // Auto-play through frames for real-time analysis
  useEffect(() => {
    if (!isAutoPlay || isAnalyzing) return

    const interval = setInterval(() => {
      setCurrentFrame(prev => {
        const next = (prev + 1) % frames.length
        if (activeMode === 'realtime' && frames[next]) {
          analyzeFrameWithLLaVA(frames[next]).then(result => {
            setCurrentAnalysis(result)
            setAnalysisResults(prevResults => {
              const newResults = [...prevResults]
              newResults[next] = result
              return newResults
            })
          })
        }
        return next
      })
    }, 2000) // 2 seconds per frame for analysis

    return () => clearInterval(interval)
  }, [isAutoPlay, isAnalyzing, activeMode])

  const currentFrameData = frames[currentFrame]
  const currentResult = analysisResults[currentFrame]
  const overallScore = analysisResults.length > 0 
    ? analysisResults.reduce((sum, r) => sum + (r?.overallScore || 0), 0) / analysisResults.filter(r => r).length
    : 0

  const totalIssues = analysisResults.reduce((sum, r) => sum + (r?.issues?.length || 0), 0)
  const criticalIssues = analysisResults.reduce((sum, r) => 
    sum + (r?.issues?.filter(issue => issue.severity === 'critical').length || 0), 0)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Microscope size={20} />
              Frame-by-Frame QA Engine
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {frames.length} frames
              </Badge>
              {overallScore > 0 && (
                <Badge variant={overallScore >= 0.8 ? 'default' : 'destructive'}>
                  {(overallScore * 100).toFixed(1)}% avg
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeMode} onValueChange={(value: any) => setActiveMode(value)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="manual">Manual Analysis</TabsTrigger>
              <TabsTrigger value="batch">Batch Processing</TabsTrigger>
              <TabsTrigger value="realtime">Real-time Review</TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Frame Navigation</span>
                    <span className="text-sm text-muted-foreground">
                      {currentFrame + 1} / {frames.length}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentFrame(Math.max(0, currentFrame - 1))}
                      disabled={currentFrame === 0}
                    >
                      ← Prev
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentFrame(Math.min(frames.length - 1, currentFrame + 1))}
                      disabled={currentFrame >= frames.length - 1}
                    >
                      Next →
                    </Button>
                    
                    <Button
                      onClick={analyzeSingleFrame}
                      disabled={isAnalyzing || !currentFrameData}
                      className="gap-2"
                    >
                      <Brain size={16} />
                      {isAnalyzing ? 'Analyzing...' : 'Analyze Frame'}
                    </Button>
                  </div>

                  {currentFrameData && (
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                      <img 
                        src={currentFrameData.imageUrl} 
                        alt={`Frame ${currentFrame + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {currentResult ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Analysis Result</span>
                        <Badge variant={currentResult.passed ? 'default' : 'destructive'}>
                          {(currentResult.overallScore * 100).toFixed(1)}%
                        </Badge>
                      </div>
                      
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm">{currentResult.llavaResponse}</p>
                      </div>

                      {currentResult.issues.length > 0 && (
                        <div>
                          <h4 className="font-medium text-red-600 mb-2">
                            Issues ({currentResult.issues.length})
                          </h4>
                          <div className="space-y-2">
                            {currentResult.issues.map((issue) => (
                              <div key={issue.id} className="p-2 bg-red-50 rounded border border-red-200">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium">{issue.type}</span>
                                  <Badge variant="destructive" className="text-xs">
                                    {issue.severity}
                                  </Badge>
                                </div>
                                <p className="text-xs text-red-700">{issue.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Eye size={32} className="mx-auto mb-2" />
                      <p>Select a frame to analyze</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="batch" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Batch Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      Analyze all {frames.length} frames with LLaVA vision model
                    </p>
                  </div>
                  
                  <Button
                    onClick={runBatchAnalysis}
                    disabled={isAnalyzing}
                    className="gap-2"
                  >
                    <Cpu size={16} />
                    {isAnalyzing ? 'Processing...' : 'Start Batch Analysis'}
                  </Button>
                </div>

                {isAnalyzing && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Analyzing frames...</span>
                      <span>{Math.round(analysisProgress)}%</span>
                    </div>
                    <Progress value={analysisProgress} />
                  </div>
                )}

                {analysisResults.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {analysisResults.filter(r => r?.passed).length}
                        </div>
                        <p className="text-sm text-muted-foreground">Frames Passed</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {totalIssues}
                        </div>
                        <p className="text-sm text-muted-foreground">Total Issues</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {criticalIssues}
                        </div>
                        <p className="text-sm text-muted-foreground">Critical Issues</p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="realtime" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Real-time Review</h3>
                    <p className="text-sm text-muted-foreground">
                      Auto-play through frames with continuous analysis
                    </p>
                  </div>
                  
                  <Button
                    onClick={() => setIsAutoPlay(!isAutoPlay)}
                    variant={isAutoPlay ? 'destructive' : 'default'}
                    className="gap-2"
                  >
                    {isAutoPlay ? <Pause size={16} /> : <Play size={16} />}
                    {isAutoPlay ? 'Stop' : 'Start'} Auto-Play
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    {currentFrameData && (
                      <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                        <img 
                          src={currentFrameData.imageUrl} 
                          alt={`Frame ${currentFrame + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    
                    <div className="mt-2 text-center text-sm text-muted-foreground">
                      Frame {currentFrame + 1} / {frames.length}
                    </div>
                  </div>

                  <div>
                    {currentAnalysis && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Live Analysis</span>
                          <Badge variant={currentAnalysis.passed ? 'default' : 'destructive'}>
                            {(currentAnalysis.overallScore * 100).toFixed(1)}%
                          </Badge>
                        </div>
                        
                        <div className="p-3 bg-muted rounded-lg max-h-32 overflow-y-auto">
                          <p className="text-sm">{currentAnalysis.llavaResponse}</p>
                        </div>

                        {currentAnalysis.issues.length > 0 && (
                          <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              {currentAnalysis.issues.length} issue(s) detected in this frame
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}