import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Play, 
  Pause, 
  Eye, 
  Brain, 
  CheckCircle, 
  XCircle, 
  Clock,
  Cpu,
  BarChart3
} from '@phosphor-icons/react'
import { Shot, QAReport, Frame } from '@/lib/types'

interface QAAnalysisProps {
  shot: Shot
  frames: Frame[]
  qaReport?: QAReport
  onRunAnalysis: (shotId: string) => void
  onApprove: (shotId: string) => void
  onReject: (shotId: string) => void
}

const QAAnalysis: React.FC<QAAnalysisProps> = ({
  shot,
  frames,
  qaReport,
  onRunAnalysis,
  onApprove,
  onReject
}) => {
  const [selectedCheck, setSelectedCheck] = React.useState<string | null>(null)

  const getCheckIcon = (type: string) => {
    switch (type) {
      case 'physics_accuracy': return <Brain size={16} />
      case 'visual_clarity': return <Eye size={16} />
      case 'timing': return <Clock size={16} />
      case 'continuity': return <Play size={16} />
      case 'math_notation': return <BarChart3 size={16} />
      default: return <CheckCircle size={16} />
    }
  }

  const formatCheckType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getProgressColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500'
    if (score >= 0.6) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye size={20} />
              Quality Analysis Dashboard
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={shot.status === 'qa' ? 'default' : 'outline'}>
                {shot.status === 'qa' ? 'Analyzing' : shot.status}
              </Badge>
              <Button
                size="sm"
                onClick={() => onRunAnalysis(shot.id)}
                disabled={shot.status === 'qa' || frames.length === 0}
              >
                {shot.status === 'qa' ? <Pause size={16} /> : <Play size={16} />}
                {shot.status === 'qa' ? 'Running...' : 'Run Analysis'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {qaReport ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Quality Score</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(qaReport.overallScore)}`}>
                  {Math.round(qaReport.overallScore * 100)}%
                </div>
                <p className="text-muted-foreground">Overall Quality</p>
              </div>
              
              <Progress 
                value={qaReport.overallScore * 100} 
                className="h-3"
              />

              <div className="flex items-center justify-center gap-4 pt-4">
                {qaReport.recommendation === 'pass' ? (
                  <Button onClick={() => onApprove(shot.id)} className="gap-2">
                    <CheckCircle size={16} />
                    Approve Shot
                  </Button>
                ) : (
                  <Button 
                    variant="destructive" 
                    onClick={() => onReject(shot.id)}
                    className="gap-2"
                  >
                    <XCircle size={16} />
                    Reject & Retry
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Individual Checks */}
          <Card>
            <CardHeader>
              <CardTitle>Quality Checks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {qaReport.checks.map((check, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedCheck === check.type 
                        ? 'border-accent bg-accent/10' 
                        : 'border-border hover:border-muted-foreground'
                    }`}
                    onClick={() => setSelectedCheck(
                      selectedCheck === check.type ? null : check.type
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getCheckIcon(check.type)}
                        <span className="font-medium">{formatCheckType(check.type)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${getScoreColor(check.score)}`}>
                          {Math.round(check.score * 100)}%
                        </span>
                        {check.passed ? (
                          <CheckCircle size={16} className="text-green-600" />
                        ) : (
                          <XCircle size={16} className="text-red-600" />
                        )}
                      </div>
                    </div>
                    
                    <Progress value={check.score * 100} className="h-2 mb-2" />
                    
                    <p className="text-xs text-muted-foreground">{check.description}</p>
                    
                    {selectedCheck === check.type && check.details && (
                      <div className="mt-2 p-2 bg-muted rounded text-xs">
                        {check.details}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* LLaVA Analysis */}
          {qaReport.llavaAnalysis && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain size={20} />
                  AI Vision Analysis (LLaVA)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Confidence</h4>
                    <div className="flex items-center gap-2">
                      <Progress value={qaReport.llavaAnalysis.confidence * 100} className="flex-1" />
                      <span className="text-sm font-mono">
                        {Math.round(qaReport.llavaAnalysis.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Physics Elements</h4>
                    <div className="flex flex-wrap gap-1">
                      {qaReport.llavaAnalysis.physicsElements.map((element, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {element}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Visual Elements</h4>
                    <div className="flex flex-wrap gap-1">
                      {qaReport.llavaAnalysis.visualElements.map((element, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {element}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Analysis Response</h4>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm leading-relaxed">{qaReport.llavaAnalysis.response}</p>
                  </div>
                </div>

                {qaReport.llavaAnalysis.issues.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-red-600">Identified Issues</h4>
                    <ul className="space-y-1">
                      {qaReport.llavaAnalysis.issues.map((issue, idx) => (
                        <li key={idx} className="text-sm text-red-600 flex items-start gap-2">
                          <XCircle size={16} className="mt-0.5 flex-shrink-0" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Signal Analysis */}
          {qaReport.signalAnalysis && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu size={20} />
                  Signal Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">SSIM</span>
                      <span className="text-sm font-mono">
                        {qaReport.signalAnalysis.ssim.toFixed(3)}
                      </span>
                    </div>
                    <Progress value={qaReport.signalAnalysis.ssim * 100} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Optical Flow</span>
                      <span className="text-sm font-mono">
                        {qaReport.signalAnalysis.opticalFlow.toFixed(3)}
                      </span>
                    </div>
                    <Progress value={qaReport.signalAnalysis.opticalFlow * 100} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Motion Continuity</span>
                      <span className="text-sm font-mono">
                        {qaReport.signalAnalysis.motionContinuity.toFixed(3)}
                      </span>
                    </div>
                    <Progress value={qaReport.signalAnalysis.motionContinuity * 100} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Frame Stability</span>
                      <span className="text-sm font-mono">
                        {qaReport.signalAnalysis.frameStability.toFixed(3)}
                      </span>
                    </div>
                    <Progress value={qaReport.signalAnalysis.frameStability * 100} />
                  </div>
                </div>

                {qaReport.signalAnalysis.issues.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2 text-yellow-600">Signal Issues</h4>
                    <ul className="space-y-1">
                      {qaReport.signalAnalysis.issues.map((issue, idx) => (
                        <li key={idx} className="text-sm text-yellow-600 flex items-start gap-2">
                          <Clock size={16} className="mt-0.5 flex-shrink-0" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Fixes and Recommendations */}
          {qaReport.fixes && qaReport.fixes.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recommended Fixes</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {qaReport.fixes.map((fix, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle size={16} className="mt-0.5 text-green-600 flex-shrink-0" />
                      {fix}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      ) : shot.status === 'qa' ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="animate-spin">
                <Brain size={48} className="text-accent mx-auto" />
              </div>
              <div>
                <h3 className="font-medium">Running Quality Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  LLaVA vision model is analyzing {frames.length} frames...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Eye size={48} className="text-muted-foreground mx-auto" />
              <div>
                <h3 className="font-medium">Ready for Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Run quality analysis to validate physics accuracy and visual clarity
                </p>
                <Button 
                  className="mt-4"
                  onClick={() => onRunAnalysis(shot.id)}
                  disabled={frames.length === 0}
                >
                  Start Analysis
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default QAAnalysis