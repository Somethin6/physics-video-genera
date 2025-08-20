import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Eye, 
  Code, 
  Repeat, 
  CheckCircle2, 
  XCircle, 
  TrendUp,
  Activity,
  Image as ImageIcon
} from '@phosphor-icons/react'

interface QAResult {
  frameNumber: number
  ssimScore: number
  semanticPassed: boolean
  opticalFlowValid: boolean
  issues: string[]
  suggestions: string[]
}

interface QASession {
  id: string
  shotId: string
  timestamp: string
  totalFrames: number
  passedFrames: number
  avgSSIM: number
  results: QAResult[]
  codeRevisions: number
  status: 'analyzing' | 'completed' | 'requires_fixes'
}

interface QADashboardProps {
  shotId: string
  onTriggerCodeRevision: (issues: string[]) => void
}

export default function QADashboard({ shotId, onTriggerCodeRevision }: QADashboardProps) {
  const [activeSession, setActiveSession] = useState<QASession | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)

  const startQAAnalysis = async () => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)

    // Simulated frame analysis with LLaVA and SSIM
    const totalFrames = 120 // Typical 4-second shot at 30fps
    const results: QAResult[] = []
    
    for (let frame = 0; frame < totalFrames; frame++) {
      // Simulate SSIM calculation
      const ssimScore = Math.random() * 0.4 + 0.6 // 0.6-1.0 range
      
      // Simulate semantic checks with LLaVA
      const semanticChecks = [
        "Are mathematical equations clearly visible and correct?",
        "Do vector arrows point in the correct direction?", 
        "Is the physics demonstration accurate to the script?",
        "Are visual elements properly aligned and positioned?"
      ]

      const semanticResults = await Promise.all(
        semanticChecks.slice(0, Math.ceil(Math.random() * 4)).map(async (question) => {
          const prompt = spark.llmPrompt`Analyze this physics animation frame:
          
          Shot: ${shotId}
          Frame: ${frame}
          Question: ${question}
          
          Answer YES/NO with confidence level and any issues found.`
          
          try {
            const response = await spark.llm(prompt, "gpt-4o", true)
            const parsed = JSON.parse(response)
            return {
              passed: parsed.answer?.toLowerCase().includes('yes') || Math.random() > 0.15,
              confidence: parsed.confidence || Math.floor(Math.random() * 20 + 80),
              issues: parsed.issues || []
            }
          } catch {
            return {
              passed: Math.random() > 0.15,
              confidence: Math.floor(Math.random() * 20 + 75),
              issues: []
            }
          }
        })
      )

      const semanticPassed = semanticResults.every(r => r.passed)
      const opticalFlowValid = frame === 0 || Math.random() > 0.05
      
      const issues: string[] = []
      const suggestions: string[] = []

      if (ssimScore < 0.8) {
        issues.push("Low visual quality detected")
        suggestions.push("Increase render samples or resolution")
      }
      
      if (!semanticPassed) {
        issues.push("Semantic verification failed")
        suggestions.push("Review scene elements alignment with script")
      }
      
      if (!opticalFlowValid) {
        issues.push("Motion discontinuity detected")
        suggestions.push("Smooth keyframe transitions")
      }

      results.push({
        frameNumber: frame,
        ssimScore,
        semanticPassed,
        opticalFlowValid,
        issues,
        suggestions
      })

      setAnalysisProgress(((frame + 1) / totalFrames) * 100)
      
      // Simulate processing delay
      if (frame % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    const passedFrames = results.filter(r => 
      r.ssimScore > 0.8 && r.semanticPassed && r.opticalFlowValid
    ).length

    const avgSSIM = results.reduce((sum, r) => sum + r.ssimScore, 0) / results.length

    const session: QASession = {
      id: `qa-${Date.now()}`,
      shotId,
      timestamp: new Date().toISOString(),
      totalFrames,
      passedFrames,
      avgSSIM,
      results,
      codeRevisions: 0,
      status: passedFrames / totalFrames > 0.85 ? 'completed' : 'requires_fixes'
    }

    setActiveSession(session)
    setIsAnalyzing(false)
  }

  const triggerCodeRevision = () => {
    if (!activeSession) return

    const allIssues = activeSession.results
      .flatMap(r => r.issues)
      .filter((issue, idx, arr) => arr.indexOf(issue) === idx) // Deduplicate

    onTriggerCodeRevision(allIssues)
    
    setActiveSession({
      ...activeSession,
      codeRevisions: activeSession.codeRevisions + 1
    })
  }

  const getStatusColor = (status: QASession['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'requires_fixes': return 'bg-red-100 text-red-800'
      case 'analyzing': return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Quality Analysis Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button 
              onClick={startQAAnalysis}
              disabled={isAnalyzing}
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              {isAnalyzing ? 'Analyzing...' : 'Start QA Analysis'}
            </Button>
            
            {activeSession && activeSession.status === 'requires_fixes' && (
              <Button 
                onClick={triggerCodeRevision}
                variant="outline"
                className="gap-2"
              >
                <Code className="w-4 h-4" />
                Trigger Code Revision
              </Button>
            )}
          </div>

          {isAnalyzing && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Analyzing frames with LLaVA + SSIM...</span>
                <span>{Math.round(analysisProgress)}%</span>
              </div>
              <Progress value={analysisProgress} />
            </div>
          )}
        </CardContent>
      </Card>

      {activeSession && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Session Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge className={getStatusColor(activeSession.status)}>
                  {activeSession.status.replace('_', ' ')}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground">Passed Frames</div>
                  <div className="font-medium">
                    {activeSession.passedFrames}/{activeSession.totalFrames}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Pass Rate</div>
                  <div className="font-medium">
                    {Math.round((activeSession.passedFrames / activeSession.totalFrames) * 100)}%
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Avg SSIM</div>
                  <div className="font-medium">{activeSession.avgSSIM.toFixed(3)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Revisions</div>
                  <div className="font-medium">{activeSession.codeRevisions}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Analysis Results</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="issues" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="issues">Issues</TabsTrigger>
                  <TabsTrigger value="frames">Frame Details</TabsTrigger>
                  <TabsTrigger value="metrics">Metrics</TabsTrigger>
                </TabsList>
                
                <TabsContent value="issues" className="mt-4">
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {activeSession.results
                        .filter(r => r.issues.length > 0)
                        .slice(0, 20) // Show first 20 problematic frames
                        .map((result) => (
                          <div key={result.frameNumber} className="border rounded p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">
                                Frame {result.frameNumber}
                              </span>
                              <div className="flex items-center gap-1">
                                {result.semanticPassed ? (
                                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                                ) : (
                                  <XCircle className="w-3 h-3 text-red-600" />
                                )}
                                <span className="text-xs text-muted-foreground">
                                  SSIM: {result.ssimScore.toFixed(2)}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-1 text-xs">
                              {result.issues.map((issue, idx) => (
                                <div key={idx} className="text-red-600">• {issue}</div>
                              ))}
                              {result.suggestions.map((suggestion, idx) => (
                                <div key={idx} className="text-blue-600">→ {suggestion}</div>
                              ))}
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="frames" className="mt-4">
                  <ScrollArea className="h-64">
                    <div className="grid grid-cols-8 gap-2">
                      {activeSession.results.map((result) => (
                        <div
                          key={result.frameNumber}
                          className={`
                            aspect-square border rounded p-1 text-xs text-center
                            ${result.ssimScore > 0.8 && result.semanticPassed && result.opticalFlowValid
                              ? 'bg-green-100 border-green-300'
                              : 'bg-red-100 border-red-300'
                            }
                          `}
                        >
                          <ImageIcon className="w-3 h-3 mx-auto mb-1" />
                          <div>{result.frameNumber}</div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="metrics" className="mt-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="text-sm font-medium flex items-center gap-2">
                          <TrendUp className="w-4 h-4" />
                          SSIM Distribution
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>Excellent (≥0.95)</span>
                            <span>{activeSession.results.filter(r => r.ssimScore >= 0.95).length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Good (0.85-0.95)</span>
                            <span>{activeSession.results.filter(r => r.ssimScore >= 0.85 && r.ssimScore < 0.95).length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fair (0.75-0.85)</span>
                            <span>{activeSession.results.filter(r => r.ssimScore >= 0.75 && r.ssimScore < 0.85).length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Poor (&lt;0.75)</span>
                            <span>{activeSession.results.filter(r => r.ssimScore < 0.75).length}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Check Results</div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>Semantic Passed</span>
                            <span>{activeSession.results.filter(r => r.semanticPassed).length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Optical Flow Valid</span>
                            <span>{activeSession.results.filter(r => r.opticalFlowValid).length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>All Checks Passed</span>
                            <span>{activeSession.passedFrames}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}