import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  BarChart3,
  Zap
} from '@phosphor-icons/react'
import { useRenderPreview, generateMockFrames, analyzeOpticalFlow } from '@/lib/renderAnalysis'
import { RenderFrame, FrameIssue } from '@/lib/types'

interface RenderPreviewProps {
  projectId: string
  shotId: string
  onClose?: () => void
}

export default function RenderPreview({ projectId, shotId, onClose }: RenderPreviewProps) {
  const {
    frames,
    setFrames,
    currentFrame,
    setCurrentFrame,
    analysisResults,
    isAnalyzing,
    analyzeCurrentFrame,
    analyzeAllFrames
  } = useRenderPreview(shotId)

  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(30) // FPS
  const [analysisMode, setAnalysisMode] = useState<'overview' | 'detailed' | 'metrics'>('overview')
  const intervalRef = useRef<NodeJS.Timeout>()

  // Initialize mock frames if none exist
  useEffect(() => {
    if (frames.length === 0) {
      const mockFrames = generateMockFrames(shotId, 90)
      setFrames(mockFrames)
    }
  }, [shotId, frames.length, setFrames])

  // Playback control
  useEffect(() => {
    if (isPlaying && frames.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentFrame(current => {
          const next = current + 1
          if (next >= frames.length) {
            setIsPlaying(false)
            return current
          }
          return next
        })
      }, 1000 / playbackRate)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, playbackRate, frames.length, setCurrentFrame])

  const getCurrentFrame = (): RenderFrame | null => {
    return frames[currentFrame] || null
  }

  const getFrameIssues = (frame: RenderFrame): FrameIssue[] => {
    return frame.issues || []
  }

  const getQualityColor = (score: number): string => {
    if (score >= 0.9) return 'text-green-600'
    if (score >= 0.7) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getQualityBadge = (score: number) => {
    if (score >= 0.9) return <Badge variant="default" className="bg-green-100 text-green-800">Excellent</Badge>
    if (score >= 0.7) return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Good</Badge>
    return <Badge variant="destructive">Needs Review</Badge>
  }

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'text-red-700'
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const frame = getCurrentFrame()
  const frameIssues = frame ? getFrameIssues(frame) : []
  const overallScore = analysisResults.length > 0 ? analysisResults[analysisResults.length - 1]?.overallScore : 0
  const analyzedFrames = frames.filter(f => f.qaScore !== undefined).length
  const opticalFlowData = frames.length > 10 ? analyzeOpticalFlow(frames.slice(0, 30)) : null

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-card-foreground">Render Preview & QA Analysis</h2>
              <p className="text-sm text-muted-foreground">Shot {shotId} • {frames.length} frames</p>
            </div>
            <div className="flex items-center gap-3">
              {isAnalyzing && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Activity className="animate-spin" size={16} />
                  <span className="text-sm">Analyzing...</span>
                </div>
              )}
              <Button
                onClick={analyzeCurrentFrame}
                disabled={!frame || isAnalyzing}
                variant="outline"
                size="sm"
              >
                <Eye size={16} />
                Analyze Frame
              </Button>
              <Button
                onClick={analyzeAllFrames}
                disabled={frames.length === 0 || isAnalyzing}
                variant="outline"
                size="sm"
              >
                <BarChart3 size={16} />
                Analyze All
              </Button>
              {onClose && (
                <Button onClick={onClose} variant="outline" size="sm">
                  Close
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Preview Area */}
          <div className="flex-1 flex flex-col">
            {/* Frame Display */}
            <div className="flex-1 bg-black relative flex items-center justify-center">
              {frame ? (
                <div className="relative max-w-full max-h-full">
                  <div 
                    className="bg-gray-800 rounded"
                    style={{ aspectRatio: '16/9', width: '80vw', maxWidth: '800px' }}
                  >
                    <div className="w-full h-full flex items-center justify-center text-white">
                      Frame {currentFrame + 1}: {frame.metadata.renderer}
                      <br />
                      {frame.metadata.resolution.width}×{frame.metadata.resolution.height}
                    </div>
                  </div>
                  
                  {/* Issue overlays */}
                  {frameIssues.map((issue) => (
                    issue.region && (
                      <div
                        key={issue.id}
                        className="absolute border-2 border-red-500 bg-red-500 bg-opacity-20"
                        style={{
                          left: `${(issue.region.x / 1920) * 100}%`,
                          top: `${(issue.region.y / 1080) * 100}%`,
                          width: `${(issue.region.width / 1920) * 100}%`,
                          height: `${(issue.region.height / 1080) * 100}%`
                        }}
                        title={issue.description}
                      />
                    )
                  ))}
                </div>
              ) : (
                <div className="text-white">No frame selected</div>
              )}
            </div>

            {/* Playback Controls */}
            <div className="bg-card border-t border-border p-4">
              <div className="space-y-4">
                {/* Timeline */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Frame {currentFrame + 1} of {frames.length}</span>
                    <span>{((currentFrame / 30) || 0).toFixed(2)}s</span>
                  </div>
                  <Slider
                    value={[currentFrame]}
                    onValueChange={([value]) => setCurrentFrame(value)}
                    max={frames.length - 1}
                    step={1}
                    className="w-full"
                  />
                  
                  {/* QA Score indicators on timeline */}
                  <div className="relative h-2 bg-muted rounded">
                    {frames.map((f, idx) => (
                      f.qaScore !== undefined && (
                        <div
                          key={f.id}
                          className={`absolute top-0 h-full w-1 rounded ${
                            f.qaScore >= 0.9 ? 'bg-green-500' :
                            f.qaScore >= 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ left: `${(idx / frames.length) * 100}%` }}
                        />
                      )
                    ))}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setCurrentFrame(Math.max(0, currentFrame - 1))}
                      disabled={currentFrame === 0}
                      variant="outline"
                      size="sm"
                    >
                      <SkipBack size={16} />
                    </Button>
                    
                    <Button
                      onClick={() => setIsPlaying(!isPlaying)}
                      disabled={frames.length === 0}
                      variant="outline"
                      size="sm"
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </Button>
                    
                    <Button
                      onClick={() => setCurrentFrame(Math.min(frames.length - 1, currentFrame + 1))}
                      disabled={currentFrame === frames.length - 1}
                      variant="outline"
                      size="sm"
                    >
                      <SkipForward size={16} />
                    </Button>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">FPS:</span>
                      <Slider
                        value={[playbackRate]}
                        onValueChange={([value]) => setPlaybackRate(value)}
                        min={1}
                        max={60}
                        step={1}
                        className="w-20"
                      />
                      <span className="text-sm min-w-8">{playbackRate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Panel */}
          <div className="w-80 border-l border-border bg-card flex flex-col">
            <div className="p-4 border-b border-border">
              <Tabs value={analysisMode} onValueChange={setAnalysisMode as any}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="detailed">Issues</TabsTrigger>
                  <TabsTrigger value="metrics">Metrics</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                <Tabs value={analysisMode}>
                  <TabsContent value="overview" className="space-y-4">
                    {/* Overall Stats */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Overall Quality</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Score:</span>
                          <div className="flex items-center gap-2">
                            <span className={`font-mono ${getQualityColor(overallScore)}`}>
                              {(overallScore * 100).toFixed(1)}%
                            </span>
                            {getQualityBadge(overallScore)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Analyzed:</span>
                          <span className="text-sm text-muted-foreground">
                            {analyzedFrames}/{frames.length}
                          </span>
                        </div>
                        <Progress value={(analyzedFrames / frames.length) * 100} />
                      </CardContent>
                    </Card>

                    {/* Current Frame */}
                    {frame && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Current Frame</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Quality:</span>
                            {frame.qaScore !== undefined ? (
                              <span className={`font-mono ${getQualityColor(frame.qaScore)}`}>
                                {(frame.qaScore * 100).toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-sm text-muted-foreground">Not analyzed</span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Issues:</span>
                            <div className="flex items-center gap-1">
                              {frameIssues.length === 0 ? (
                                <CheckCircle size={16} className="text-green-600" />
                              ) : (
                                <div className="flex items-center gap-1">
                                  <AlertTriangle size={16} className="text-yellow-600" />
                                  <span className="text-sm">{frameIssues.length}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Renderer:</span>
                            <Badge variant="outline">{frame.metadata.renderer}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Quick Actions */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Quick Analysis</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button 
                          onClick={analyzeCurrentFrame}
                          disabled={!frame || isAnalyzing}
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                        >
                          <Eye size={14} />
                          Analyze Current
                        </Button>
                        <Button 
                          onClick={analyzeAllFrames}
                          disabled={frames.length === 0 || isAnalyzing}
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                        >
                          <BarChart3 size={14} />
                          Full Analysis
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="detailed" className="space-y-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Frame Issues</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {frameIssues.length === 0 ? (
                          <div className="text-center py-6 text-muted-foreground">
                            <CheckCircle size={32} className="mx-auto mb-2 text-green-600" />
                            <p className="text-sm">No issues detected</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {frameIssues.map((issue) => (
                              <div key={issue.id} className="border rounded p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <Badge 
                                    variant={issue.severity === 'critical' || issue.severity === 'high' ? 'destructive' : 'outline'}
                                    className="capitalize"
                                  >
                                    {issue.severity}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {(issue.confidence * 100).toFixed(0)}% confident
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{issue.description}</p>
                                  <p className="text-xs text-muted-foreground mt-1">{issue.suggestion}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {issue.type.replace('_', ' ')}
                                  </Badge>
                                  {issue.region && (
                                    <span className="text-xs text-muted-foreground">
                                      Region: {issue.region.x},{issue.region.y}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="metrics" className="space-y-4">
                    {/* Optical Flow */}
                    {opticalFlowData && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Zap size={16} />
                            Motion Analysis
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Smoothness:</span>
                            <span className="font-mono text-sm">
                              {(opticalFlowData.smoothness * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Consistency:</span>
                            <span className="font-mono text-sm">
                              {(opticalFlowData.consistency * 100).toFixed(1)}%
                            </span>
                          </div>
                          {opticalFlowData.issues.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-sm text-muted-foreground">Issues:</span>
                              {opticalFlowData.issues.map((issue, idx) => (
                                <p key={idx} className="text-xs text-yellow-600">{issue}</p>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Analysis History */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Analysis History</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {analysisResults.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No analysis completed yet</p>
                        ) : (
                          <div className="space-y-2">
                            {analysisResults.slice(-3).map((result) => (
                              <div key={result.id} className="border rounded p-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(result.completedAt).toLocaleTimeString()}
                                  </span>
                                  <span className="text-xs font-mono">
                                    {(result.overallScore * 100).toFixed(1)}%
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {result.passedFrames}/{result.frameCount} frames passed
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  )
}