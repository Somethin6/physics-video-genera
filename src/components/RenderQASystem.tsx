import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Eye, 
  Brain, 
  CheckCircle, 
  XCircle, 
  Clock, 
  BarChart3,
  AlertTriangle,
  Play,
  Pause
} from '@phosphor-icons/react'
import { Shot, Frame, QAReport } from '@/lib/types'
import FrameAnalyzer from './FrameAnalyzer'
import QAAnalysis from './QAAnalysis'

interface RenderQASystemProps {
  shot: Shot
  frames: Frame[]
  qaReport?: QAReport
  onRetryShot: (shotId: string) => void
  onApproveShot: (shotId: string) => void
  onRunQA: (shotId: string) => void
}

const RenderQASystem: React.FC<RenderQASystemProps> = ({
  shot,
  frames,
  qaReport,
  onRetryShot,
  onApproveShot,
  onRunQA
}) => {
  const [selectedFrame, setSelectedFrame] = React.useState<Frame | null>(null)
  const [activeView, setActiveView] = React.useState<'overview' | 'frame-analysis' | 'qa-analysis'>('overview')

  const getStatusColor = (status: Shot['status']) => {
    switch (status) {
      case 'passed': return 'bg-green-500'
      case 'failed': return 'bg-red-500'
      case 'qa': return 'bg-yellow-500'
      case 'rendering': return 'bg-blue-500'
      case 'retrying': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const handleFrameAnalysis = (frameId: string, analysisType: 'llava' | 'signal') => {
    console.log(`Running ${analysisType} analysis on frame:`, frameId)
    // Mock analysis functionality
  }

  if (activeView === 'frame-analysis' && selectedFrame) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => setActiveView('overview')}
          className="mb-4"
        >
          ← Back to Overview
        </Button>
        <FrameAnalyzer
          shotId={shot.id}
          frames={frames.map(f => f.imagePath)}
          scriptChecks={[
            "Are mathematical equations correctly rendered?",
            "Are physics concepts accurately represented?",
            "Is the visual hierarchy clear and appropriate?"
          ]}
          onAnalysisComplete={(analysis) => {
            console.log('Frame analysis complete:', analysis)
            // Handle analysis results
          }}
        />
      </div>
    )
  }

  if (activeView === 'qa-analysis') {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => setActiveView('overview')}
          className="mb-4"
        >
          ← Back to Overview
        </Button>
        <QAAnalysis
          shot={shot}
          frames={frames}
          qaReport={qaReport}
          onRunAnalysis={onRunQA}
          onApprove={onApproveShot}
          onReject={onRetryShot}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              Shot {shot.sequence}: {shot.title}
              <Badge className={`${getStatusColor(shot.status)} text-white`}>
                {shot.status}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveView('qa-analysis')}
              >
                <Brain size={16} />
                QA Analysis
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRetryShot(shot.id)}
                disabled={shot.status === 'rendering'}
              >
                <Play size={16} />
                Retry
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Frame Grid */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye size={20} />
                Render Frames ({frames.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {frames.length > 0 ? (
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                  {frames.map((frame) => (
                    <button
                      key={frame.id}
                      onClick={() => {
                        setSelectedFrame(frame)
                        setActiveView('frame-analysis')
                      }}
                      className="relative aspect-video bg-muted rounded border-2 hover:border-accent transition-colors overflow-hidden group"
                    >
                      <img
                        src={frame.thumbnailPath || frame.imagePath}
                        alt={`Frame ${frame.frameNumber}`}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Frame number overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/75 text-white text-xs p-1 text-center">
                        #{frame.frameNumber}
                      </div>
                      
                      {/* QA status indicator */}
                      <div className="absolute top-1 right-1">
                        {frame.qaChecked ? (
                          frame.qaIssues.length > 0 ? (
                            <XCircle size={16} className="text-red-500" />
                          ) : (
                            <CheckCircle size={16} className="text-green-500" />
                          )
                        ) : (
                          <Clock size={16} className="text-yellow-500" />
                        )}
                      </div>
                      
                      {/* Hover analysis button */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye size={20} className="text-white" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Eye size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No frames rendered yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* QA Summary Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quality Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {qaReport ? (
                <>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent">
                      {Math.round(qaReport.overallScore * 100)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Overall Score</p>
                  </div>
                  
                  <Progress value={qaReport.overallScore * 100} />
                  
                  <div className="space-y-2">
                    {qaReport.checks.slice(0, 3).map((check, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="capitalize">{check.type.replace('_', ' ')}</span>
                        <Badge variant={check.passed ? 'default' : 'destructive'}>
                          {Math.round(check.score * 100)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={() => setActiveView('qa-analysis')}
                    className="w-full"
                    size="sm"
                  >
                    View Full Analysis
                  </Button>
                </>
              ) : (
                <div className="text-center">
                  <Brain size={32} className="mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-3">
                    No QA analysis yet
                  </p>
                  <Button onClick={() => onRunQA(shot.id)} size="sm" className="w-full">
                    Run Analysis
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Frame Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Frame Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Total Frames</span>
                  <span className="font-mono">{frames.length}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>QA Checked</span>
                  <span className="font-mono">
                    {frames.filter(f => f.qaChecked).length}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Issues Found</span>
                  <span className="font-mono text-red-600">
                    {frames.reduce((sum, f) => sum + f.qaIssues.length, 0)}
                  </span>
                </div>
                
                <Progress 
                  value={(frames.filter(f => f.qaChecked).length / frames.length) * 100} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Render Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Render Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Engine:</span>
                <Badge variant="outline">{shot.renderer}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Attempts:</span>
                <span className="font-mono">{shot.attempts}/{shot.maxAttempts}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="font-mono">{shot.duration}s</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default RenderQASystem