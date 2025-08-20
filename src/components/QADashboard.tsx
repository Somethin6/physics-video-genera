import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Eye, 
  BarChart3, 
  Brain, 
  PlayCircle,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Target,
  Zap
} from '@phosphor-icons/react'
import FrameQAAnalysis from '@/components/FrameQAAnalysis'
import LLaVAAnalysis from '@/components/LLaVAAnalysis'
import SignalAnalysis from '@/components/SignalAnalysis'
import { useRenderPreview } from '@/lib/renderAnalysis'
import { LLaVAAnalysis as LLaVAAnalysisType, SignalAnalysis as SignalAnalysisType, FrameIssue } from '@/lib/types'

interface QADashboardProps {
  shotId: string
}

export default function QADashboard({ shotId }: QADashboardProps) {
  const {
    frames,
    currentFrame,
    setCurrentFrame,
    analysisResults,
    isAnalyzing
  } = useRenderPreview(shotId)

  const [activeAnalysis, setActiveAnalysis] = useState<'frame' | 'llava' | 'signal'>('frame')
  const [qaOverview, setQAOverview] = useState({
    totalFrames: 0,
    analyzedFrames: 0,
    passedFrames: 0,
    criticalIssues: 0,
    overallScore: 0
  })

  // Calculate QA metrics
  const updateQAOverview = () => {
    const totalFrames = frames.length
    const analyzedFrames = frames.filter(f => f.qaScore !== undefined).length
    const passedFrames = frames.filter(f => (f.qaScore || 0) > 0.8).length
    const criticalIssues = frames.reduce((sum, f) => 
      sum + (f.issues?.filter(i => i.severity === 'critical').length || 0), 0
    )
    const overallScore = analyzedFrames > 0 
      ? frames.reduce((sum, f) => sum + (f.qaScore || 0), 0) / analyzedFrames
      : 0

    setQAOverview({
      totalFrames,
      analyzedFrames,
      passedFrames,
      criticalIssues,
      overallScore
    })
  }

  // Handle LLaVA analysis completion
  const handleLLaVAAnalysis = (analysis: LLaVAAnalysisType, issues: FrameIssue[]) => {
    // This would integrate LLaVA results into the main QA system
    console.log('LLaVA analysis completed:', analysis, issues)
    updateQAOverview()
  }

  // Handle Signal analysis completion
  const handleSignalAnalysis = (analysis: SignalAnalysisType) => {
    // This would integrate signal analysis results
    console.log('Signal analysis completed:', analysis)
    updateQAOverview()
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600'
    if (score >= 0.7) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusIcon = (score: number, issues: number) => {
    if (issues === 0 && score > 0.9) return <CheckCircle className="text-green-500" size={20} />
    if (issues > 0 || score < 0.7) return <XCircle className="text-red-500" size={20} />
    return <AlertTriangle className="text-yellow-500" size={20} />
  }

  const analysisProgress = frames.length > 0 ? (qaOverview.analyzedFrames / qaOverview.totalFrames) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">QA Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive quality analysis for Shot {shotId}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => setActiveAnalysis('frame')}
            variant={activeAnalysis === 'frame' ? 'default' : 'outline'}
            size="sm"
          >
            <PlayCircle size={16} className="mr-2" />
            Frame Analysis
          </Button>
          <Button
            onClick={() => setActiveAnalysis('llava')}
            variant={activeAnalysis === 'llava' ? 'default' : 'outline'}
            size="sm"
          >
            <Brain size={16} className="mr-2" />
            LLaVA Vision
          </Button>
          <Button
            onClick={() => setActiveAnalysis('signal')}
            variant={activeAnalysis === 'signal' ? 'default' : 'outline'}
            size="sm"
          >
            <BarChart3 size={16} className="mr-2" />
            Signal Analysis
          </Button>
        </div>
      </div>

      {/* QA Overview Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{qaOverview.totalFrames}</div>
                <p className="text-xs text-muted-foreground">Total Frames</p>
              </div>
              <PlayCircle size={24} className="text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{qaOverview.analyzedFrames}</div>
                <p className="text-xs text-muted-foreground">Analyzed</p>
              </div>
              <Eye size={24} className="text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{qaOverview.passedFrames}</div>
                <p className="text-xs text-muted-foreground">Passed</p>
              </div>
              <CheckCircle size={24} className="text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">{qaOverview.criticalIssues}</div>
                <p className="text-xs text-muted-foreground">Critical Issues</p>
              </div>
              <AlertTriangle size={24} className="text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold ${getScoreColor(qaOverview.overallScore)}`}>
                  {(qaOverview.overallScore * 100).toFixed(0)}%
                </div>
                <p className="text-xs text-muted-foreground">Overall Score</p>
              </div>
              <Target size={24} className="text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock size={20} />
            Analysis Progress
          </CardTitle>
          <CardDescription>
            Quality analysis progress across all frames
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Frame Analysis Progress</span>
            <span>{qaOverview.analyzedFrames}/{qaOverview.totalFrames} frames</span>
          </div>
          <Progress value={analysisProgress} className="w-full" />
          
          {isAnalyzing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap size={16} className="animate-pulse" />
              <span>Analysis in progress...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Issues Summary */}
      {frames.some(f => f.issues && f.issues.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle size={20} className="text-yellow-500" />
              Recent Issues Summary
            </CardTitle>
            <CardDescription>
              Latest issues detected across all analysis types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {frames
                .filter(f => f.issues && f.issues.length > 0)
                .slice(0, 5)
                .map(frame => (
                  <div key={frame.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">Frame {frame.frameNumber + 1}</span>
                        <Badge variant="outline" className="text-xs">
                          {frame.issues?.length} issue(s)
                        </Badge>
                      </div>
                      
                      <div className="flex gap-1">
                        {frame.issues?.slice(0, 3).map(issue => (
                          <Badge 
                            key={issue.id}
                            variant={issue.severity === 'critical' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {issue.type.replace('_', ' ')}
                          </Badge>
                        ))}
                        {(frame.issues?.length || 0) > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{(frame.issues?.length || 0) - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusIcon(frame.qaScore || 0, frame.issues?.length || 0)}
                      <Button
                        onClick={() => setCurrentFrame(frame.frameNumber)}
                        size="sm"
                        variant="outline"
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Tabs */}
      <Tabs value={activeAnalysis} onValueChange={(value) => setActiveAnalysis(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="frame" className="flex items-center gap-2">
            <PlayCircle size={16} />
            Frame Analysis
          </TabsTrigger>
          <TabsTrigger value="llava" className="flex items-center gap-2">
            <Brain size={16} />
            LLaVA Vision
          </TabsTrigger>
          <TabsTrigger value="signal" className="flex items-center gap-2">
            <BarChart3 size={16} />
            Signal Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="frame" className="mt-6">
          <FrameQAAnalysis 
            shotId={shotId}
            onAnalysisComplete={(result) => {
              console.log('Frame analysis completed:', result)
              updateQAOverview()
            }}
          />
        </TabsContent>

        <TabsContent value="llava" className="mt-6">
          <LLaVAAnalysis
            frames={frames}
            currentFrame={currentFrame}
            onAnalysisComplete={handleLLaVAAnalysis}
          />
        </TabsContent>

        <TabsContent value="signal" className="mt-6">
          <SignalAnalysis
            frames={frames}
            currentFrame={currentFrame}
            onAnalysisComplete={handleSignalAnalysis}
          />
        </TabsContent>
      </Tabs>

      {/* Analysis History Summary */}
      {analysisResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis History</CardTitle>
            <CardDescription>
              Historical QA analysis results for this shot
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysisResults.slice(0, 3).map(result => (
                <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">
                        {result.analysisType}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(result.completedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-sm">
                      Score: {(result.overallScore * 100).toFixed(1)}% • 
                      Issues: {result.issues.length} • 
                      Passed: {result.passedFrames}/{result.frameCount}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.overallScore, result.issues.length)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}