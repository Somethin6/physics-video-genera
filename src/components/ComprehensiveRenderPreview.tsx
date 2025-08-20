import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Microscope, 
  Eye, 
  GitCompare, 
  BarChart3, 
  Cpu,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  Film,
  Zap
} from '@phosphor-icons/react'
import { RenderFrame, FrameIssue, Shot, QAResult } from '@/lib/types'

interface ComprehensiveRenderPreviewProps {
  shot: Shot
  onClose: () => void
}

interface AnalysisState {
  isRunning: boolean
  currentFrame: number
  totalFrames: number
  progress: number
  results: QAResult[]
  issues: FrameIssue[]
}

export default function ComprehensiveRenderPreview({ shot, onClose }: ComprehensiveRenderPreviewProps) {
  // State management
  const [frames, setFrames] = useState<RenderFrame[]>([])
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [activeTab, setActiveTab] = useState('preview')
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    isRunning: false,
    currentFrame: 0,
    totalFrames: 0,
    progress: 0,
    results: [],
    issues: []
  })

  // Mock frame data generation
  useEffect(() => {
    const mockFrames: RenderFrame[] = Array.from({ length: 120 }, (_, i) => ({
      id: `frame-${i}`,
      shotId: shot.id,
      frameNumber: i + 1,
      timestamp: (i + 1) / 30, // 30 FPS
      imagePath: `/api/frames/${shot.id}/frame_${String(i + 1).padStart(6, '0')}.png`,
      thumbnail: `/api/frames/${shot.id}/thumb_${String(i + 1).padStart(6, '0')}.jpg`,
      status: 'completed',
      qaScore: 0.75 + Math.random() * 0.25, // Random score between 0.75-1.0
      issues: Math.random() > 0.8 ? [
        {
          id: `issue-${i}`,
          frameId: `frame-${i}`,
          type: Math.random() > 0.5 ? 'physics_accuracy' : 'visual_clarity',
          severity: Math.random() > 0.7 ? 'high' : 'medium',
          description: 'Potential physics accuracy issue detected',
          suggestion: 'Review equation notation and field line orientation',
          confidence: 0.6 + Math.random() * 0.4,
          detectedAt: new Date().toISOString()
        }
      ] : [],
      metadata: {
        renderTime: 15 + Math.random() * 30,
        resolution: { width: 1920, height: 1080 },
        renderer: shot.renderer,
        settings: {
          samples: 128,
          denoiser: 'OptiX',
          colorSpace: 'Rec.709'
        }
      }
    }))
    setFrames(mockFrames)
    setAnalysisState(prev => ({ ...prev, totalFrames: mockFrames.length }))
  }, [shot.id, shot.renderer])

  // Playback control
  useEffect(() => {
    if (!isPlaying || frames.length === 0) return

    const interval = setInterval(() => {
      setCurrentFrameIndex(prev => {
        const next = prev + 1
        if (next >= frames.length) {
          setIsPlaying(false)
          return 0
        }
        return next
      })
    }, 1000 / (30 * playbackSpeed))

    return () => clearInterval(interval)
  }, [isPlaying, playbackSpeed, frames.length])

  // Frame analysis simulation
  const runFrameAnalysis = useCallback(async () => {
    setAnalysisState(prev => ({ ...prev, isRunning: true, progress: 0 }))

    for (let i = 0; i < frames.length; i++) {
      // Simulate analysis time
      await new Promise(resolve => setTimeout(resolve, 100))
      
      setAnalysisState(prev => ({
        ...prev,
        currentFrame: i + 1,
        progress: ((i + 1) / frames.length) * 100
      }))
    }

    // Generate mock analysis results
    const mockResults: QAResult[] = [
      {
        id: 'qa-result-1',
        shotId: shot.id,
        overallScore: 0.87,
        frameCount: frames.length,
        passedFrames: Math.floor(frames.length * 0.9),
        issues: frames.flatMap(f => f.issues || []),
        analysisType: 'hybrid',
        completedAt: new Date().toISOString(),
        processingTime: frames.length * 0.1
      }
    ]

    setAnalysisState(prev => ({
      ...prev,
      isRunning: false,
      results: mockResults,
      issues: frames.flatMap(f => f.issues || [])
    }))
  }, [frames, shot.id])

  const currentFrame = frames[currentFrameIndex]
  const overallQAScore = analysisState.results[0]?.overallScore || 0
  const totalIssues = analysisState.issues.length
  const criticalIssues = analysisState.issues.filter(i => i.severity === 'critical').length

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onClose}>
              ← Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Shot {shot.sequence}: {shot.title}</h1>
              <p className="text-sm text-muted-foreground">
                {frames.length} frames • {shot.renderer} renderer
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={shot.status === 'passed' ? 'default' : 'secondary'}>
              {shot.status}
            </Badge>
            {overallQAScore > 0 && (
              <Badge variant={overallQAScore >= 0.8 ? 'default' : 'destructive'}>
                QA: {Math.round(overallQAScore * 100)}%
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Preview Panel */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-4 mx-4 mt-4">
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Film size={16} />
                Preview
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center gap-2">
                <Microscope size={16} />
                Analysis
              </TabsTrigger>
              <TabsTrigger value="metrics" className="flex items-center gap-2">
                <BarChart3 size={16} />
                Metrics
              </TabsTrigger>
              <TabsTrigger value="comparison" className="flex items-center gap-2">
                <GitCompare size={16} />
                Compare
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="flex-1 p-4">
              <div className="space-y-4">
                {/* Frame Display */}
                <Card className="aspect-video">
                  <CardContent className="p-0 h-full">
                    {currentFrame ? (
                      <div className="relative h-full bg-black rounded-lg overflow-hidden">
                        <img
                          src={currentFrame.imagePath}
                          alt={`Frame ${currentFrame.frameNumber}`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            // Fallback to placeholder
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkZyYW1lICcgKyBjdXJyZW50RnJhbWUuZnJhbWVOdW1iZXIgKyAnPC90ZXh0Pgo8L3N2Zz4='
                          }}
                        />
                        
                        {/* Frame Info Overlay */}
                        <div className="absolute bottom-4 left-4">
                          <Badge className="bg-black/80 text-white">
                            Frame {currentFrame.frameNumber} • {currentFrame.timestamp.toFixed(2)}s
                          </Badge>
                        </div>

                        {/* QA Issues Overlay */}
                        {currentFrame.issues && currentFrame.issues.length > 0 && (
                          <div className="absolute top-4 right-4">
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <AlertTriangle size={12} />
                              {currentFrame.issues.length} issue{currentFrame.issues.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center bg-muted">
                        <p className="text-muted-foreground">Loading frame...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Playback Controls */}
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Timeline Scrubber */}
                      <div className="space-y-2">
                        <Slider
                          value={[currentFrameIndex]}
                          onValueChange={([value]) => setCurrentFrameIndex(value)}
                          max={frames.length - 1}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>0:00</span>
                          <span>{(frames.length / 30).toFixed(1)}s</span>
                        </div>
                      </div>

                      {/* Control Buttons */}
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentFrameIndex(Math.max(0, currentFrameIndex - 1))}
                          disabled={currentFrameIndex === 0}
                        >
                          <SkipBack size={16} />
                        </Button>
                        
                        <Button
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="px-6"
                        >
                          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentFrameIndex(Math.min(frames.length - 1, currentFrameIndex + 1))}
                          disabled={currentFrameIndex === frames.length - 1}
                        >
                          <SkipForward size={16} />
                        </Button>
                      </div>

                      {/* Playback Speed */}
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm text-muted-foreground">Speed:</span>
                        <div className="flex gap-1">
                          {[0.25, 0.5, 1, 2, 4].map(speed => (
                            <Button
                              key={speed}
                              variant={playbackSpeed === speed ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setPlaybackSpeed(speed)}
                            >
                              {speed}x
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="flex-1 p-4">
              <div className="space-y-6">
                {/* Analysis Controls */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Microscope size={20} />
                      Quality Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Comprehensive Frame Analysis</p>
                        <p className="text-sm text-muted-foreground">
                          Physics accuracy, visual clarity, and continuity checks
                        </p>
                      </div>
                      <Button
                        onClick={runFrameAnalysis}
                        disabled={analysisState.isRunning}
                        className="flex items-center gap-2"
                      >
                        {analysisState.isRunning ? (
                          <>
                            <Cpu className="animate-spin" size={16} />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Zap size={16} />
                            Run Analysis
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Analysis Progress */}
                    {analysisState.isRunning && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Frame {analysisState.currentFrame} of {analysisState.totalFrames}</span>
                          <span>{Math.round(analysisState.progress)}%</span>
                        </div>
                        <Progress value={analysisState.progress} />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Analysis Results */}
                {analysisState.results.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <CheckCircle size={16} className="text-green-600" />
                          Overall Score
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {Math.round(overallQAScore * 100)}%
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {analysisState.results[0]?.passedFrames} of {frames.length} frames passed
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <AlertTriangle size={16} className="text-amber-600" />
                          Issues Found
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-amber-600">
                          {totalIssues}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {criticalIssues} critical, {totalIssues - criticalIssues} minor
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Clock size={16} className="text-blue-600" />
                          Processing Time
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                          {analysisState.results[0]?.processingTime.toFixed(1)}s
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ~{(analysisState.results[0]?.processingTime / frames.length * 1000).toFixed(0)}ms per frame
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Issues List */}
                {analysisState.issues.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Detected Issues</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analysisState.issues.slice(0, 5).map((issue) => (
                          <div key={issue.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                            <AlertTriangle 
                              size={16} 
                              className={
                                issue.severity === 'critical' ? 'text-red-600' :
                                issue.severity === 'high' ? 'text-amber-600' : 'text-yellow-600'
                              } 
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  Frame {frames.find(f => f.id === issue.frameId)?.frameNumber}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {issue.type.replace('_', ' ')}
                                </Badge>
                                <Badge 
                                  variant={issue.severity === 'critical' ? 'destructive' : 'secondary'}
                                  className="text-xs"
                                >
                                  {issue.severity}
                                </Badge>
                              </div>
                              <p className="text-sm font-medium">{issue.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">{issue.suggestion}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {Math.round(issue.confidence * 100)}%
                            </Badge>
                          </div>
                        ))}
                        
                        {analysisState.issues.length > 5 && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="w-full">
                                View All {analysisState.issues.length} Issues
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                              <DialogHeader>
                                <DialogTitle>All Detected Issues</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-3">
                                {analysisState.issues.map((issue) => (
                                  <div key={issue.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                                    <AlertTriangle 
                                      size={16} 
                                      className={
                                        issue.severity === 'critical' ? 'text-red-600' :
                                        issue.severity === 'high' ? 'text-amber-600' : 'text-yellow-600'
                                      } 
                                    />
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline" className="text-xs">
                                          Frame {frames.find(f => f.id === issue.frameId)?.frameNumber}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                          {issue.type.replace('_', ' ')}
                                        </Badge>
                                        <Badge 
                                          variant={issue.severity === 'critical' ? 'destructive' : 'secondary'}
                                          className="text-xs"
                                        >
                                          {issue.severity}
                                        </Badge>
                                      </div>
                                      <p className="text-sm font-medium">{issue.description}</p>
                                      <p className="text-xs text-muted-foreground mt-1">{issue.suggestion}</p>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                      {Math.round(issue.confidence * 100)}%
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="flex-1 p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Render Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Average Render Time:</span>
                      <span className="font-mono">
                        {(frames.reduce((sum, f) => sum + f.metadata.renderTime, 0) / frames.length).toFixed(1)}s
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Render Time:</span>
                      <span className="font-mono">
                        {Math.round(frames.reduce((sum, f) => sum + f.metadata.renderTime, 0) / 60)}m
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Resolution:</span>
                      <span className="font-mono">
                        {currentFrame?.metadata.resolution.width}×{currentFrame?.metadata.resolution.height}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Renderer:</span>
                      <span className="font-mono">{shot.renderer}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quality Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Frames Analyzed:</span>
                      <span className="font-mono">{frames.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pass Rate:</span>
                      <span className="font-mono text-green-600">
                        {Math.round((frames.filter(f => !f.issues || f.issues.length === 0).length / frames.length) * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average QA Score:</span>
                      <span className="font-mono">
                        {(frames.reduce((sum, f) => sum + (f.qaScore || 0), 0) / frames.length * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Critical Issues:</span>
                      <span className="font-mono text-red-600">{criticalIssues}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="comparison" className="flex-1 p-4">
              <Card>
                <CardHeader>
                  <CardTitle>Frame Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <GitCompare size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Frame comparison view coming soon</p>
                    <p className="text-sm">Compare current frame with previous renders or reference images</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Analysis Sidebar */}
        <div className="w-80 border-l border-border bg-card/50 p-4 space-y-4">
          <div>
            <h3 className="font-medium mb-3">Current Frame Analysis</h3>
            
            {currentFrame && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                  <span className="text-sm">Frame Score:</span>
                  <Badge variant={currentFrame.qaScore && currentFrame.qaScore >= 0.8 ? 'default' : 'destructive'}>
                    {currentFrame.qaScore ? Math.round(currentFrame.qaScore * 100) : 0}%
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <span className="text-sm font-medium">Render Settings:</span>
                  <div className="text-xs space-y-1 bg-background p-3 rounded-lg font-mono">
                    <div>Samples: {currentFrame.metadata.settings.samples}</div>
                    <div>Denoiser: {currentFrame.metadata.settings.denoiser}</div>
                    <div>Color Space: {currentFrame.metadata.settings.colorSpace}</div>
                    <div>Render Time: {currentFrame.metadata.renderTime.toFixed(1)}s</div>
                  </div>
                </div>

                {currentFrame.issues && currentFrame.issues.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-amber-600">Issues ({currentFrame.issues.length}):</span>
                    <div className="space-y-2">
                      {currentFrame.issues.map((issue) => (
                        <div key={issue.id} className="p-2 bg-amber-50 border border-amber-200 rounded text-xs">
                          <div className="font-medium text-amber-800">{issue.type.replace('_', ' ')}</div>
                          <div className="text-amber-700 mt-1">{issue.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border">
            <Button variant="outline" className="w-full mb-2">
              <Download size={16} className="mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}