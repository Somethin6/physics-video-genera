import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Settings,
  RefreshCw
} from '@phosphor-icons/react'
import { useRenderPreview, generateMockFrames } from '@/lib/renderAnalysis'
import { RenderFrame, FrameIssue, QAResult } from '@/lib/types'

interface FrameQAAnalysisProps {
  shotId: string
  onAnalysisComplete?: (result: QAResult) => void
}

export default function FrameQAAnalysis({ shotId, onAnalysisComplete }: FrameQAAnalysisProps) {
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
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showIssueOverlay, setShowIssueOverlay] = useState(true)
  const [selectedIssueType, setSelectedIssueType] = useState<string>('all')

  // Initialize mock frames if none exist
  useEffect(() => {
    if (frames.length === 0) {
      const mockFrames = generateMockFrames(shotId, 120)
      setFrames(mockFrames)
    }
  }, [shotId, frames.length, setFrames])

  // Playback controls
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentFrame(current => {
        if (current >= frames.length - 1) {
          setIsPlaying(false)
          return current
        }
        return current + 1
      })
    }, 1000 / (30 * playbackSpeed)) // 30fps adjusted by speed

    return () => clearInterval(interval)
  }, [isPlaying, playbackSpeed, frames.length, setCurrentFrame])

  const currentFrameData = frames[currentFrame]
  const totalIssues = frames.reduce((sum, frame) => sum + (frame.issues?.length || 0), 0)
  const averageQAScore = frames.length > 0 
    ? frames.reduce((sum, frame) => sum + (frame.qaScore || 0), 0) / frames.length 
    : 0

  const getIssueColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600'
    if (score >= 0.7) return 'text-yellow-600'
    return 'text-red-600'
  }

  const filteredFrames = frames.filter(frame => {
    if (selectedIssueType === 'all') return true
    return frame.issues?.some(issue => issue.type === selectedIssueType) || false
  })

  const handleFrameClick = (frameIndex: number) => {
    setCurrentFrame(frameIndex)
    setIsPlaying(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Frame-by-Frame QA Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Shot {shotId} • {frames.length} frames • {Math.round(frames.length / 30)}s duration
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={analyzeCurrentFrame}
            disabled={isAnalyzing || !currentFrameData}
            variant="outline"
            size="sm"
          >
            <Eye size={16} className="mr-2" />
            Analyze Current
          </Button>
          
          <Button
            onClick={analyzeAllFrames}
            disabled={isAnalyzing || frames.length === 0}
            size="sm"
          >
            {isAnalyzing ? (
              <RefreshCw size={16} className="mr-2 animate-spin" />
            ) : (
              <Zap size={16} className="mr-2" />
            )}
            {isAnalyzing ? 'Analyzing...' : 'Analyze All'}
          </Button>
        </div>
      </div>

      {/* Analysis Progress */}
      {isAnalyzing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Analyzing frames...</span>
                <span>{Math.round((currentFrame / frames.length) * 100)}%</span>
              </div>
              <Progress value={(currentFrame / frames.length) * 100} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{frames.length}</div>
            <p className="text-xs text-muted-foreground">Total Frames</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className={`text-2xl font-bold ${getScoreColor(averageQAScore)}`}>
              {(averageQAScore * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Avg QA Score</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalIssues}</div>
            <p className="text-xs text-muted-foreground">Total Issues</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {frames.filter(f => (f.qaScore || 0) > 0.8).length}
            </div>
            <p className="text-xs text-muted-foreground">Passed Frames</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="playback" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="playback">Frame Playback</TabsTrigger>
          <TabsTrigger value="timeline">Issue Timeline</TabsTrigger>
          <TabsTrigger value="analysis">Analysis Results</TabsTrigger>
        </TabsList>

        <TabsContent value="playback" className="space-y-4">
          {/* Frame Viewer */}
          <Card>
            <CardContent className="p-6">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
                {currentFrameData ? (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎬</div>
                      <div className="text-lg">Frame {currentFrame + 1}</div>
                      <div className="text-sm opacity-70">
                        {(currentFrameData.timestamp / 1000).toFixed(2)}s
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <div>No frame data</div>
                  </div>
                )}
                
                {/* Issue Overlays */}
                {showIssueOverlay && currentFrameData?.issues?.map(issue => (
                  <div
                    key={issue.id}
                    className={`absolute border-2 border-red-500 bg-red-500/20 rounded`}
                    style={{
                      left: `${(issue.region?.x || 0) / 19.2}%`,
                      top: `${(issue.region?.y || 0) / 10.8}%`,
                      width: `${(issue.region?.width || 100) / 19.2}%`,
                      height: `${(issue.region?.height || 60) / 10.8}%`,
                    }}
                    title={issue.description}
                  />
                ))}
                
                {/* Frame Info Overlay */}
                <div className="absolute top-4 left-4 bg-black/50 rounded px-3 py-2 text-white text-sm">
                  Frame {currentFrame + 1}/{frames.length}
                  {currentFrameData?.qaScore && (
                    <span className={`ml-2 ${getScoreColor(currentFrameData.qaScore)}`}>
                      QA: {(currentFrameData.qaScore * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setCurrentFrame(Math.max(0, currentFrame - 1))}
                    disabled={currentFrame === 0}
                    size="sm"
                    variant="outline"
                  >
                    <SkipBack size={16} />
                  </Button>
                  
                  <Button
                    onClick={() => setIsPlaying(!isPlaying)}
                    disabled={frames.length === 0}
                    size="sm"
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </Button>
                  
                  <Button
                    onClick={() => setCurrentFrame(Math.min(frames.length - 1, currentFrame + 1))}
                    disabled={currentFrame >= frames.length - 1}
                    size="sm"
                    variant="outline"
                  >
                    <SkipForward size={16} />
                  </Button>
                </div>

                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max={frames.length - 1}
                    value={currentFrame}
                    onChange={(e) => setCurrentFrame(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Speed:</span>
                  <select
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value={0.25}>0.25x</option>
                    <option value={0.5}>0.5x</option>
                    <option value={1}>1x</option>
                    <option value={2}>2x</option>
                    <option value={4}>4x</option>
                  </select>
                </div>

                <Button
                  onClick={() => setShowIssueOverlay(!showIssueOverlay)}
                  size="sm"
                  variant={showIssueOverlay ? "default" : "outline"}
                >
                  <Settings size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Current Frame Issues */}
          {currentFrameData?.issues && currentFrameData.issues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle size={20} className="text-yellow-500" />
                  Frame Issues ({currentFrameData.issues.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentFrameData.issues.map(issue => (
                  <div key={issue.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            className={`${getIssueColor(issue.severity)} text-white`}
                          >
                            {issue.severity}
                          </Badge>
                          <Badge variant="outline">{issue.type.replace('_', ' ')}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {(issue.confidence * 100).toFixed(0)}% confidence
                          </span>
                        </div>
                        <h4 className="font-medium">{issue.description}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {issue.suggestion}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          {/* Issue Filter */}
          <div className="flex gap-2 mb-4">
            <Button
              onClick={() => setSelectedIssueType('all')}
              variant={selectedIssueType === 'all' ? 'default' : 'outline'}
              size="sm"
            >
              All Issues
            </Button>
            {['physics_accuracy', 'visual_clarity', 'timing', 'continuity', 'math_notation'].map(type => (
              <Button
                key={type}
                onClick={() => setSelectedIssueType(type)}
                variant={selectedIssueType === type ? 'default' : 'outline'}
                size="sm"
              >
                {type.replace('_', ' ')}
              </Button>
            ))}
          </div>

          {/* Frame Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Issues Timeline</CardTitle>
              <CardDescription>
                Click on frames to navigate. Red indicates issues, green indicates passed frames.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-20 gap-1">
                {frames.map((frame, index) => {
                  const hasIssues = frame.issues && frame.issues.length > 0
                  const qaScore = frame.qaScore || 0
                  const isSelected = index === currentFrame
                  
                  return (
                    <button
                      key={frame.id}
                      onClick={() => handleFrameClick(index)}
                      className={`
                        aspect-square rounded text-xs font-medium transition-all
                        ${isSelected ? 'ring-2 ring-blue-500 scale-110' : ''}
                        ${hasIssues 
                          ? 'bg-red-500 text-white hover:bg-red-600' 
                          : qaScore > 0.8 
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : qaScore > 0
                              ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                              : 'bg-gray-200 hover:bg-gray-300'
                        }
                      `}
                      title={`Frame ${index + 1} - QA: ${(qaScore * 100).toFixed(0)}% - Issues: ${frame.issues?.length || 0}`}
                    >
                      {index + 1}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          {analysisResults.length > 0 ? (
            analysisResults.map(result => (
              <Card key={result.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {result.overallScore > 0.8 ? (
                        <CheckCircle className="text-green-500" size={20} />
                      ) : (
                        <XCircle className="text-red-500" size={20} />
                      )}
                      Analysis Report
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock size={16} />
                      {new Date(result.completedAt).toLocaleTimeString()}
                    </div>
                  </div>
                  <CardDescription>
                    Overall Score: {(result.overallScore * 100).toFixed(1)}% • 
                    Passed: {result.passedFrames}/{result.frameCount} frames • 
                    Processing Time: {(result.processingTime / 1000).toFixed(1)}s
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {result.issues.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="font-medium">Issues Found ({result.issues.length})</h4>
                      {result.issues.slice(0, 5).map(issue => (
                        <div key={issue.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge className={`${getIssueColor(issue.severity)} text-white`}>
                                {issue.severity}
                              </Badge>
                              <span className="text-sm">{issue.description}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {issue.suggestion}
                            </p>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {(issue.confidence * 100).toFixed(0)}%
                          </div>
                        </div>
                      ))}
                      {result.issues.length > 5 && (
                        <p className="text-sm text-muted-foreground">
                          ... and {result.issues.length - 5} more issues
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-green-600">No issues detected! ✅</p>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-muted-foreground mb-4">
                  <Eye size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No analysis results yet</p>
                  <p className="text-sm">Run frame analysis to see detailed QA reports</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}