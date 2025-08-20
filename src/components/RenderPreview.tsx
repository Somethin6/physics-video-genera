import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Eye, Play, Pause, RotateCcw, Download } from '@phosphor-icons/react'
import { Shot, Frame, QAReport } from '@/lib/types'

interface RenderPreviewProps {
  shot: Shot
  frames: Frame[]
  qaReport?: QAReport
  onRetryShot: (shotId: string) => void
  onApproveShot: (shotId: string) => void
}

const RenderPreview: React.FC<RenderPreviewProps> = ({
  shot,
  frames,
  qaReport,
  onRetryShot,
  onApproveShot
}) => {
  const [currentFrame, setCurrentFrame] = React.useState(0)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [selectedFrame, setSelectedFrame] = React.useState<Frame | null>(null)

  // Auto-advance frames when playing
  React.useEffect(() => {
    if (!isPlaying || frames.length === 0) return

    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % frames.length)
    }, 1000 / 24) // 24fps playback

    return () => clearInterval(interval)
  }, [isPlaying, frames.length])

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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Shot Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                Shot {shot.sequence}: {shot.title}
                <Badge className={`${getStatusColor(shot.status)} text-white`}>
                  {shot.status}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {shot.renderer} • {formatDuration(shot.duration)} • {frames.length} frames
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={frames.length === 0}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRetryShot(shot.id)}
                disabled={shot.status === 'rendering'}
              >
                <RotateCcw size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Preview */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Frame Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {frames.length > 0 ? (
                <div className="space-y-4">
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                    <img
                      src={frames[currentFrame]?.imagePath || '/placeholder-frame.png'}
                      alt={`Frame ${currentFrame + 1}`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Frame {currentFrame + 1} of {frames.length}</span>
                      <span>{formatDuration(frames[currentFrame]?.timestamp || 0)}</span>
                    </div>
                    <Progress value={(currentFrame / (frames.length - 1)) * 100} />
                  </div>

                  {/* Frame Selection Strip */}
                  <div className="flex gap-1 overflow-x-auto py-2">
                    {frames.map((frame, index) => (
                      <button
                        key={frame.id}
                        onClick={() => setCurrentFrame(index)}
                        className={`flex-shrink-0 w-16 h-12 rounded border-2 overflow-hidden ${
                          index === currentFrame 
                            ? 'border-accent' 
                            : 'border-border hover:border-muted-foreground'
                        }`}
                      >
                        <img
                          src={frame.thumbnailPath || frame.imagePath}
                          alt={`Frame ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">No frames rendered yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Script Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Script</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{shot.script}</p>
            </CardContent>
          </Card>
        </div>

        {/* QA Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye size={20} />
                Quality Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {qaReport ? (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Overall Score</span>
                      <span className="text-lg font-bold">{Math.round(qaReport.overallScore * 100)}%</span>
                    </div>
                    <Progress value={qaReport.overallScore * 100} />
                  </div>

                  <div className="space-y-3">
                    {qaReport.checks.map((check, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm capitalize">{check.type.replace('_', ' ')}</span>
                          <Badge variant={check.passed ? 'default' : 'destructive'}>
                            {check.passed ? 'Pass' : 'Fail'}
                          </Badge>
                        </div>
                        <Progress value={check.score * 100} />
                        {check.details && (
                          <p className="text-xs text-muted-foreground">{check.details}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {qaReport.llavaAnalysis && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">AI Vision Analysis</h4>
                      <p className="text-xs text-muted-foreground">{qaReport.llavaAnalysis.response}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">Confidence:</span>
                        <Progress value={qaReport.llavaAnalysis.confidence * 100} className="flex-1" />
                        <span className="text-xs">{Math.round(qaReport.llavaAnalysis.confidence * 100)}%</span>
                      </div>
                    </div>
                  )}

                  {qaReport.signalAnalysis && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Signal Analysis</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>SSIM: {qaReport.signalAnalysis.ssim.toFixed(3)}</div>
                        <div>Flow: {qaReport.signalAnalysis.opticalFlow.toFixed(3)}</div>
                        <div>Motion: {qaReport.signalAnalysis.motionContinuity.toFixed(3)}</div>
                        <div>Stability: {qaReport.signalAnalysis.frameStability.toFixed(3)}</div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {qaReport.recommendation === 'pass' ? (
                      <Button 
                        onClick={() => onApproveShot(shot.id)}
                        className="flex-1"
                        size="sm"
                      >
                        Approve
                      </Button>
                    ) : (
                      <Button
                        variant="destructive"
                        onClick={() => onRetryShot(shot.id)}
                        className="flex-1"
                        size="sm"
                      >
                        Retry
                      </Button>
                    )}
                  </div>
                </>
              ) : shot.status === 'qa' ? (
                <div className="text-center text-muted-foreground">
                  <Eye size={24} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Running quality analysis...</p>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <p className="text-sm">QA analysis will appear after rendering</p>
                </div>
              )}
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
                <span className="font-mono">{shot.renderer}</span>
              </div>
              <div className="flex justify-between">
                <span>Attempts:</span>
                <span>{shot.attempts}/{shot.maxAttempts}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span>{formatDuration(shot.duration)}</span>
              </div>
              {shot.renderPath && (
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Download size={16} />
                  Download Render
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default RenderPreview