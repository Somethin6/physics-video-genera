import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Eye, 
  Brain, 
  Microscope, 
  BarChart3, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Camera,
  Zap
} from '@phosphor-icons/react'
import { RenderFrame, FrameIssue } from '@/lib/types'

interface FrameQAInspectorProps {
  frame: RenderFrame
  onIssueDetected: (issue: FrameIssue) => void
  onRetryFrame: () => void
}

export default function FrameQAInspector({ 
  frame, 
  onIssueDetected, 
  onRetryFrame 
}: FrameQAInspectorProps) {
  const [activeAnalysis, setActiveAnalysis] = useState<string>('visual')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [llavaResponse, setLlavaResponse] = useState<string>('')
  const [signalMetrics, setSignalMetrics] = useState<any>(null)

  // Mock LLaVA analysis for demonstration
  const runLLaVAAnalysis = async () => {
    setIsAnalyzing(true)
    
    // Simulate LLaVA analysis - in real implementation, use spark.llm with vision
    const prompt = spark.llmPrompt`
      Analyze this physics video frame for accuracy and clarity:
      - Are mathematical equations visible and correct?
      - Do vector arrows point in correct directions?
      - Is the physics demonstration scientifically accurate?
      - Are visual elements properly aligned and clear?
      
      Frame timestamp: ${frame.timestamp}ms
      Expected content: Physics demonstration
      
      Respond with specific observations about physics accuracy.
    `
    
    try {
      // In real implementation: const response = await spark.llm(prompt, "gpt-4o", false)
      const response = await new Promise<string>(resolve => {
        setTimeout(() => {
          resolve("The electromagnetic field lines are correctly depicted exiting positive charges and entering negative charges. The equation E = F/q is clearly visible and mathematically correct. Vector arrows show appropriate field direction with proper scaling. No visual clarity issues detected.")
        }, 2000)
      })
      
      setLlavaResponse(response)
    } catch (error) {
      console.error('LLaVA analysis failed:', error)
      setLlavaResponse('Analysis failed - please retry')
    }
    
    setIsAnalyzing(false)
  }

  // Mock signal analysis
  const runSignalAnalysis = async () => {
    setIsAnalyzing(true)
    
    // Simulate signal analysis calculations
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setSignalMetrics({
      ssim: 0.92,
      opticalFlow: 0.87,
      motionContinuity: 0.94,
      frameStability: 0.89,
      edgeCoherence: 0.91,
      colorConsistency: 0.96
    })
    
    setIsAnalyzing(false)
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600'
    if (score >= 0.8) return 'text-blue-600'
    if (score >= 0.7) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 0.9) return 'default'
    if (score >= 0.8) return 'secondary'
    if (score >= 0.7) return 'secondary'
    return 'destructive'
  }

  const physicsChecks = [
    { 
      id: 'equations', 
      name: 'Mathematical Equations', 
      passed: frame.qaScore && frame.qaScore > 0.85,
      score: frame.qaScore || 0
    },
    { 
      id: 'vectors', 
      name: 'Vector Directions', 
      passed: frame.qaScore && frame.qaScore > 0.8,
      score: frame.qaScore || 0
    },
    { 
      id: 'physics', 
      name: 'Physics Accuracy', 
      passed: frame.qaScore && frame.qaScore > 0.9,
      score: frame.qaScore || 0
    },
    { 
      id: 'clarity', 
      name: 'Visual Clarity', 
      passed: frame.qaScore && frame.qaScore > 0.85,
      score: frame.qaScore || 0
    }
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Microscope size={20} />
              Frame QA Inspector
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">
                Frame {frame.frameNumber || 'N/A'}
              </Badge>
              {frame.qaScore && (
                <Badge variant={getScoreBadge(frame.qaScore)}>
                  {(frame.qaScore * 100).toFixed(1)}%
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              <img 
                src={frame.imageUrl} 
                alt={`Frame ${frame.frameNumber}`}
                className="w-full h-full object-contain"
              />
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Frame Metadata</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Timestamp:</span>
                    <span className="font-mono">{(frame.timestamp / 1000).toFixed(2)}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Renderer:</span>
                    <span className="font-mono">{frame.metadata.renderer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size:</span>
                    <span className="font-mono">{frame.metadata.width}×{frame.metadata.height}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Quick Analysis</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={runLLaVAAnalysis}
                    disabled={isAnalyzing}
                    className="gap-2"
                  >
                    <Brain size={16} />
                    {isAnalyzing ? 'Analyzing...' : 'Vision QA'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={runSignalAnalysis}
                    disabled={isAnalyzing}
                    className="gap-2"
                  >
                    <BarChart3 size={16} />
                    Signal QA
                  </Button>
                </div>
              </div>
              
              {frame.issues && frame.issues.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-600 mb-2 flex items-center gap-2">
                    <AlertTriangle size={16} />
                    Issues ({frame.issues.length})
                  </h4>
                  <div className="space-y-1">
                    {frame.issues.slice(0, 3).map((issue) => (
                      <div key={issue.id} className="text-sm p-2 bg-red-50 rounded border border-red-200">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{issue.type}</span>
                          <Badge variant="destructive" className="text-xs">
                            {issue.severity}
                          </Badge>
                        </div>
                        <p className="text-red-700 mt-1">{issue.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeAnalysis} onValueChange={setActiveAnalysis}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="visual">Visual Analysis</TabsTrigger>
          <TabsTrigger value="physics">Physics Checks</TabsTrigger>
          <TabsTrigger value="signal">Signal Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye size={20} />
                LLaVA Vision Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {llavaResponse ? (
                <div className="space-y-3">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm leading-relaxed">{llavaResponse}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Analysis confidence</span>
                    <div className="flex items-center gap-2">
                      <Progress value={92} className="w-24" />
                      <span className="text-sm font-mono">92%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    Run vision analysis to get AI-powered frame evaluation
                  </p>
                  <Button onClick={runLLaVAAnalysis} disabled={isAnalyzing}>
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Frame'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="physics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap size={20} />
                Physics Accuracy Checks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {physicsChecks.map((check) => (
                  <div key={check.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      {check.passed ? (
                        <CheckCircle size={20} className="text-green-600" />
                      ) : (
                        <XCircle size={20} className="text-red-600" />
                      )}
                      <span className="font-medium">{check.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-mono ${getScoreColor(check.score)}`}>
                        {(check.score * 100).toFixed(1)}%
                      </span>
                      <Progress value={check.score * 100} className="w-16" />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Overall Physics Score</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${getScoreColor(frame.qaScore || 0)}`}>
                      {((frame.qaScore || 0) * 100).toFixed(1)}%
                    </span>
                    <Badge variant={getScoreBadge(frame.qaScore || 0)}>
                      {frame.qaScore && frame.qaScore > 0.8 ? 'PASS' : 'REVIEW'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 size={20} />
                Signal Quality Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {signalMetrics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(signalMetrics).map(([metric, value]) => (
                    <div key={metric} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm capitalize">
                          {metric.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className={`text-sm font-mono ${getScoreColor(value as number)}`}>
                          {(value as number).toFixed(3)}
                        </span>
                      </div>
                      <Progress value={(value as number) * 100} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Camera size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    Run signal analysis to evaluate technical quality metrics
                  </p>
                  <Button onClick={runSignalAnalysis} disabled={isAnalyzing}>
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Signals'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {frame.qaScore && frame.qaScore < 0.8 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle size={24} className="text-orange-600" />
              <div className="flex-1">
                <h4 className="font-medium text-orange-800">Frame Quality Below Threshold</h4>
                <p className="text-sm text-orange-700">
                  This frame scored {((frame.qaScore || 0) * 100).toFixed(1)}% which is below the 80% quality threshold. 
                  Consider re-rendering with adjusted parameters.
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={onRetryFrame}
                className="text-orange-600 border-orange-300 hover:bg-orange-100"
              >
                Retry Frame
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}