import { useState, useCallback, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { 
  Play, Pause, Upload, Eye, AlertTriangle, CheckCircle, XCircle, 
  ArrowsClockwise, ChartLine, Target, Clock, Gauge
} from '@phosphor-icons/react'
import { RenderSequence, FrameAnalysis, QAAnalysisConfig, FrameComparisonResult } from '@/lib/qa-types'

interface AdvancedRenderPreviewProps {
  sequence?: RenderSequence
  onUploadSequence: (files: FileList) => void
  onAnalyzeFrame: (frameIndex: number) => Promise<FrameAnalysis>
  onBatchAnalysis?: (startFrame: number, endFrame: number, config: QAAnalysisConfig) => Promise<void>
  onCompareFrames?: (frameA: number, frameB: number) => Promise<FrameComparisonResult>
}

export default function AdvancedRenderPreview({ 
  sequence, 
  onUploadSequence, 
  onAnalyzeFrame,
  onBatchAnalysis,
  onCompareFrames
}: AdvancedRenderPreviewProps) {
  const [currentFrame, setCurrentFrame] = useState(0)
  const [comparisonFrame, setComparisonFrame] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [analysisResults, setAnalysisResults] = useState<Map<number, FrameAnalysis>>(new Map())
  const [analyzingFrames, setAnalyzingFrames] = useState<Set<number>>(new Set())
  const [batchAnalyzing, setBatchAnalyzing] = useState(false)
  const [comparisonResult, setComparisonResult] = useState<FrameComparisonResult | null>(null)
  const [showOverlays, setShowOverlays] = useState(true)
  const [analysisConfig, setAnalysisConfig] = useState<QAAnalysisConfig>({
    enableSSIM: true,
    enableOpticalFlow: true,
    enableOCR: true,
    enableLLMCritique: false,
    ssimThreshold: 0.95,
    flowStabilityThreshold: 0.8,
    textLegibilityThreshold: 0.9,
    batchSize: 10
  })
  
  const playbackInterval = useRef<NodeJS.Timeout>()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Auto-playback with configurable speed
  useEffect(() => {
    if (isPlaying && sequence) {
      const interval = 1000 / (sequence.framerate * playbackSpeed)
      playbackInterval.current = setInterval(() => {
        setCurrentFrame(prev => {
          if (prev >= sequence.frameCount - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, interval)
    } else {
      if (playbackInterval.current) {
        clearInterval(playbackInterval.current)
      }
    }

    return () => {
      if (playbackInterval.current) {
        clearInterval(playbackInterval.current)
      }
    }
  }, [isPlaying, sequence, playbackSpeed])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      onUploadSequence(files)
    }
  }, [onUploadSequence])

  const handleFrameAnalysis = useCallback(async (frameIndex: number) => {
    if (analyzingFrames.has(frameIndex) || analysisResults.has(frameIndex)) return

    setAnalyzingFrames(prev => new Set(prev).add(frameIndex))
    
    try {
      const analysis = await onAnalyzeFrame(frameIndex)
      setAnalysisResults(prev => new Map(prev).set(frameIndex, analysis))
    } catch (error) {
      console.error('Frame analysis failed:', error)
    } finally {
      setAnalyzingFrames(prev => {
        const next = new Set(prev)
        next.delete(frameIndex)
        return next
      })
    }
  }, [analyzingFrames, analysisResults, onAnalyzeFrame])

  const handleBatchAnalysis = useCallback(async () => {
    if (!sequence || !onBatchAnalysis || batchAnalyzing) return

    setBatchAnalyzing(true)
    try {
      await onBatchAnalysis(0, sequence.frameCount - 1, analysisConfig)
    } catch (error) {
      console.error('Batch analysis failed:', error)
    } finally {
      setBatchAnalyzing(false)
    }
  }, [sequence, onBatchAnalysis, analysisConfig, batchAnalyzing])

  const handleFrameComparison = useCallback(async () => {
    if (!onCompareFrames || comparisonFrame === null) return

    try {
      const result = await onCompareFrames(currentFrame, comparisonFrame)
      setComparisonResult(result)
    } catch (error) {
      console.error('Frame comparison failed:', error)
    }
  }, [onCompareFrames, currentFrame, comparisonFrame])

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const frames = Math.floor((seconds % 1) * (sequence?.framerate || 30))
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${frames.toString().padStart(2, '0')}`
  }

  const getIssueSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-accent text-accent-foreground'
      case 'low': return 'bg-muted text-muted-foreground'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getQualityScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-green-500'
    if (score >= 0.7) return 'text-yellow-500'
    return 'text-red-500'
  }

  const drawComparisonOverlay = useCallback(() => {
    if (!canvasRef.current || !comparisonResult) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw difference regions
    comparisonResult.differences.forEach((diff, index) => {
      const color = diff.type === 'added' ? 'rgba(0, 255, 0, 0.3)' : 
                   diff.type === 'removed' ? 'rgba(255, 0, 0, 0.3)' : 
                   'rgba(255, 255, 0, 0.3)'
      
      ctx.fillStyle = color
      ctx.fillRect(
        (diff.region.x / (sequence?.resolution.width || 1)) * canvas.width,
        (diff.region.y / (sequence?.resolution.height || 1)) * canvas.height,
        (diff.region.width / (sequence?.resolution.width || 1)) * canvas.width,
        (diff.region.height / (sequence?.resolution.height || 1)) * canvas.height
      )
      
      // Draw border
      ctx.strokeStyle = color.replace('0.3', '0.8')
      ctx.lineWidth = 2
      ctx.strokeRect(
        (diff.region.x / (sequence?.resolution.width || 1)) * canvas.width,
        (diff.region.y / (sequence?.resolution.height || 1)) * canvas.height,
        (diff.region.width / (sequence?.resolution.width || 1)) * canvas.width,
        (diff.region.height / (sequence?.resolution.height || 1)) * canvas.height
      )
    })
  }, [comparisonResult, sequence])

  useEffect(() => {
    drawComparisonOverlay()
  }, [drawComparisonOverlay])

  if (!sequence) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload size={20} />
              Upload Render Sequence
            </CardTitle>
            <CardDescription>
              Upload a sequence of rendered frames for comprehensive quality analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Drop frame sequences here</p>
              <p className="text-muted-foreground mb-4">
                Supports PNG, EXR, JPEG sequences • Maximum 10,000 frames
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="frame-upload"
              />
              <Button asChild>
                <label htmlFor="frame-upload" className="cursor-pointer">
                  Browse Files
                </label>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentAnalysis = analysisResults.get(currentFrame)
  const isAnalyzing = analyzingFrames.has(currentFrame)
  const analyzedFrames = analysisResults.size
  const analysisProgress = (analyzedFrames / sequence.frameCount) * 100

  return (
    <div className="space-y-6">
      {/* Sequence Info & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{sequence.name}</span>
              <Badge variant="outline">
                {sequence.frameCount} frames • {formatTimestamp(sequence.duration)}
              </Badge>
            </CardTitle>
            <CardDescription>
              {sequence.resolution.width}×{sequence.resolution.height} • {sequence.framerate}fps
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartLine size={20} />
              Analysis Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>Frames Analyzed</span>
                <span className="font-mono">{analyzedFrames}/{sequence.frameCount}</span>
              </div>
              <Progress value={analysisProgress} className="w-full" />
              
              {onBatchAnalysis && (
                <Button 
                  onClick={handleBatchAnalysis}
                  disabled={batchAnalyzing}
                  className="w-full"
                  size="sm"
                >
                  {batchAnalyzing ? (
                    <>
                      <ArrowsClockwise size={16} className="mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Target size={16} className="mr-2" />
                      Batch Analyze
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Viewer */}
      <Card>
        <CardContent className="p-6">
          <div className="aspect-video bg-black rounded-lg mb-4 relative overflow-hidden">
            {sequence.frames[currentFrame] && (
              <img
                src={sequence.frames[currentFrame]}
                alt={`Frame ${currentFrame + 1}`}
                className="w-full h-full object-contain"
              />
            )}
            
            {/* Analysis Overlays */}
            {showOverlays && currentAnalysis?.issues.map((issue, index) => 
              issue.location && (
                <div
                  key={index}
                  className="absolute border-2 border-red-500 bg-red-500/20 hover:bg-red-500/30 transition-colors"
                  style={{
                    left: `${(issue.location.x / sequence.resolution.width) * 100}%`,
                    top: `${(issue.location.y / sequence.resolution.height) * 100}%`,
                    width: `${(issue.location.width / sequence.resolution.width) * 100}%`,
                    height: `${(issue.location.height / sequence.resolution.height) * 100}%`,
                  }}
                  title={`${issue.type}: ${issue.description}`}
                />
              )
            )}

            {/* Comparison Overlay */}
            {comparisonResult && (
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
                width={sequence.resolution.width}
                height={sequence.resolution.height}
                style={{ imageRendering: 'pixelated' }}
              />
            )}

            {/* Frame Info Overlay */}
            <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-2 rounded text-sm font-mono">
              Frame {currentFrame + 1} • {formatTimestamp(currentFrame / sequence.framerate)}
              {currentAnalysis && (
                <div className="flex items-center gap-2 mt-1">
                  <Gauge size={14} />
                  <span className={getQualityScoreColor(currentAnalysis.metrics.ssim)}>
                    SSIM: {currentAnalysis.metrics.ssim.toFixed(3)}
                  </span>
                </div>
              )}
            </div>

            {/* Comparison Frame Indicator */}
            {comparisonFrame !== null && (
              <div className="absolute top-4 right-4 bg-blue-500/80 text-white px-3 py-2 rounded text-sm font-mono">
                Comparing with Frame {comparisonFrame + 1}
              </div>
            )}
          </div>

          {/* Playback Controls */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </Button>
              
              <div className="flex items-center gap-2">
                <Label htmlFor="speed" className="text-sm">Speed:</Label>
                <Input
                  id="speed"
                  type="number"
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value) || 1)}
                  className="w-20"
                  min="0.1"
                  max="4"
                  step="0.1"
                />
                <span className="text-sm text-muted-foreground">×</span>
              </div>
              
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="range"
                    min={0}
                    max={sequence.frameCount - 1}
                    value={currentFrame}
                    onChange={(e) => setCurrentFrame(parseInt(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="absolute top-0 left-0 w-full h-2 bg-primary/20 rounded-lg pointer-events-none">
                    <div
                      className="h-full bg-primary rounded-lg"
                      style={{ width: `${((currentFrame + 1) / sequence.frameCount) * 100}%` }}
                    />
                  </div>
                  
                  {/* Analysis indicators on timeline */}
                  {Array.from(analysisResults.keys()).map(frameIndex => (
                    <div
                      key={frameIndex}
                      className="absolute top-0 w-1 h-2 bg-green-500 rounded"
                      style={{ left: `${(frameIndex / (sequence.frameCount - 1)) * 100}%` }}
                    />
                  ))}
                </div>
              </div>

              <div className="text-sm font-mono text-muted-foreground min-w-[120px] text-right">
                {formatTimestamp(currentFrame / sequence.framerate)} / {formatTimestamp(sequence.duration)}
              </div>
            </div>

            {/* Frame Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="overlays"
                    checked={showOverlays}
                    onCheckedChange={setShowOverlays}
                  />
                  <Label htmlFor="overlays" className="text-sm">Show Overlays</Label>
                </div>

                {onCompareFrames && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Compare frame"
                      value={comparisonFrame ?? ''}
                      onChange={(e) => setComparisonFrame(e.target.value ? parseInt(e.target.value) : null)}
                      className="w-32"
                      min={0}
                      max={sequence.frameCount - 1}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFrameComparison}
                      disabled={comparisonFrame === null || comparisonFrame === currentFrame}
                    >
                      Compare
                    </Button>
                  </div>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFrameAnalysis(currentFrame)}
                disabled={isAnalyzing || currentAnalysis !== undefined}
              >
                {isAnalyzing ? (
                  <>
                    <Clock size={16} className="mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : currentAnalysis ? (
                  <>
                    <CheckCircle size={16} className="mr-2" />
                    Analyzed
                  </>
                ) : (
                  <>
                    <Eye size={16} className="mr-2" />
                    Analyze Frame
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target size={20} />
            Analysis Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Analysis Methods</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ssim"
                    checked={analysisConfig.enableSSIM}
                    onCheckedChange={(checked) => 
                      setAnalysisConfig(prev => ({ ...prev, enableSSIM: checked }))
                    }
                  />
                  <Label htmlFor="ssim" className="text-sm">Structural Similarity (SSIM)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="optical-flow"
                    checked={analysisConfig.enableOpticalFlow}
                    onCheckedChange={(checked) => 
                      setAnalysisConfig(prev => ({ ...prev, enableOpticalFlow: checked }))
                    }
                  />
                  <Label htmlFor="optical-flow" className="text-sm">Optical Flow Analysis</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ocr"
                    checked={analysisConfig.enableOCR}
                    onCheckedChange={(checked) => 
                      setAnalysisConfig(prev => ({ ...prev, enableOCR: checked }))
                    }
                  />
                  <Label htmlFor="ocr" className="text-sm">Text Recognition (OCR)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="llm-critique"
                    checked={analysisConfig.enableLLMCritique}
                    onCheckedChange={(checked) => 
                      setAnalysisConfig(prev => ({ ...prev, enableLLMCritique: checked }))
                    }
                  />
                  <Label htmlFor="llm-critique" className="text-sm">LLM Visual Critique</Label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Quality Thresholds</h4>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">SSIM Threshold: {analysisConfig.ssimThreshold}</Label>
                  <Slider
                    value={[analysisConfig.ssimThreshold]}
                    onValueChange={([value]) => 
                      setAnalysisConfig(prev => ({ ...prev, ssimThreshold: value }))
                    }
                    min={0.5}
                    max={1}
                    step={0.01}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-sm">Motion Stability: {analysisConfig.flowStabilityThreshold}</Label>
                  <Slider
                    value={[analysisConfig.flowStabilityThreshold]}
                    onValueChange={([value]) => 
                      setAnalysisConfig(prev => ({ ...prev, flowStabilityThreshold: value }))
                    }
                    min={0.5}
                    max={1}
                    step={0.01}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-sm">Text Legibility: {analysisConfig.textLegibilityThreshold}</Label>
                  <Slider
                    value={[analysisConfig.textLegibilityThreshold]}
                    onValueChange={([value]) => 
                      setAnalysisConfig(prev => ({ ...prev, textLegibilityThreshold: value }))
                    }
                    min={0.5}
                    max={1}
                    step={0.01}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Batch Processing</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="batch-size" className="text-sm">Batch Size</Label>
                  <Input
                    id="batch-size"
                    type="number"
                    value={analysisConfig.batchSize}
                    onChange={(e) => 
                      setAnalysisConfig(prev => ({ ...prev, batchSize: parseInt(e.target.value) || 10 }))
                    }
                    min={1}
                    max={100}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Export Options</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  Export Analysis Report
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  Export Issue Annotations
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  Export Quality Metrics
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {(currentAnalysis || isAnalyzing || comparisonResult) && (
        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="metrics">Quality Metrics</TabsTrigger>
            <TabsTrigger value="issues">Issues Found</TabsTrigger>
            <TabsTrigger value="comparison">Frame Comparison</TabsTrigger>
            <TabsTrigger value="history">Analysis History</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-4">
            {isAnalyzing ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
                    <p className="text-muted-foreground">Analyzing frame {currentFrame + 1}...</p>
                  </div>
                </CardContent>
              </Card>
            ) : currentAnalysis && (
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">SSIM Score</label>
                      <div className="flex items-center gap-2">
                        <Progress value={currentAnalysis.metrics.ssim * 100} className="flex-1" />
                        <span className={`text-sm font-mono ${getQualityScoreColor(currentAnalysis.metrics.ssim)}`}>
                          {currentAnalysis.metrics.ssim.toFixed(3)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Motion Stability</label>
                      <div className="flex items-center gap-2">
                        <Progress value={currentAnalysis.metrics.opticalFlowStability * 100} className="flex-1" />
                        <span className={`text-sm font-mono ${getQualityScoreColor(currentAnalysis.metrics.opticalFlowStability)}`}>
                          {currentAnalysis.metrics.opticalFlowStability.toFixed(3)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Text Legibility</label>
                      <div className="flex items-center gap-2">
                        <Progress value={currentAnalysis.metrics.textLegibility * 100} className="flex-1" />
                        <span className={`text-sm font-mono ${getQualityScoreColor(currentAnalysis.metrics.textLegibility)}`}>
                          {currentAnalysis.metrics.textLegibility.toFixed(3)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Color Accuracy</label>
                      <div className="flex items-center gap-2">
                        <Progress value={currentAnalysis.metrics.colorAccuracy * 100} className="flex-1" />
                        <span className={`text-sm font-mono ${getQualityScoreColor(currentAnalysis.metrics.colorAccuracy)}`}>
                          {currentAnalysis.metrics.colorAccuracy.toFixed(3)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="issues" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                {!currentAnalysis ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle size={48} className="mx-auto mb-4" />
                    <p>No analysis data available for this frame</p>
                  </div>
                ) : currentAnalysis.issues.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
                    <p>No issues detected in this frame</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Suggestion</TableHead>
                        <TableHead>Location</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentAnalysis.issues.map((issue, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium capitalize">
                            {issue.type.replace('-', ' ')}
                          </TableCell>
                          <TableCell>
                            <Badge className={getIssueSeverityColor(issue.severity)}>
                              {issue.severity}
                            </Badge>
                          </TableCell>
                          <TableCell>{issue.description}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {issue.suggestion || '—'}
                          </TableCell>
                          <TableCell className="text-muted-foreground font-mono text-xs">
                            {issue.location ? 
                              `${issue.location.x},${issue.location.y} ${issue.location.width}×${issue.location.height}` : 
                              '—'
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                {!comparisonResult ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <XCircle size={48} className="mx-auto mb-4" />
                    <p>No frame comparison data available</p>
                    <p className="text-sm">Use the comparison controls above to compare frames</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">
                        Frame {comparisonResult.frameA + 1} vs Frame {comparisonResult.frameB + 1}
                      </h3>
                      <Badge variant="outline">
                        SSIM: {comparisonResult.ssimScore.toFixed(3)}
                      </Badge>
                    </div>
                    
                    {comparisonResult.differences.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
                        <p>No significant differences detected</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Change Type</TableHead>
                            <TableHead>Region</TableHead>
                            <TableHead>Description</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {comparisonResult.differences.map((diff, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Badge variant={
                                  diff.type === 'added' ? 'default' : 
                                  diff.type === 'removed' ? 'destructive' : 
                                  'secondary'
                                }>
                                  {diff.type}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {diff.region.x},{diff.region.y} {diff.region.width}×{diff.region.height}
                              </TableCell>
                              <TableCell>{diff.description}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                {analysisResults.size === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock size={48} className="mx-auto mb-4" />
                    <p>No analysis history available</p>
                    <p className="text-sm">Analyze frames to build a quality history</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div className="font-medium">Frame</div>
                      <div className="font-medium">SSIM</div>
                      <div className="font-medium">Motion</div>
                      <div className="font-medium">Issues</div>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {Array.from(analysisResults.entries())
                        .sort(([a], [b]) => a - b)
                        .map(([frameIndex, analysis]) => (
                          <div key={frameIndex} className="grid grid-cols-4 gap-4 text-sm py-2 border-b">
                            <div className="font-mono">{frameIndex + 1}</div>
                            <div className={`font-mono ${getQualityScoreColor(analysis.metrics.ssim)}`}>
                              {analysis.metrics.ssim.toFixed(3)}
                            </div>
                            <div className={`font-mono ${getQualityScoreColor(analysis.metrics.opticalFlowStability)}`}>
                              {analysis.metrics.opticalFlowStability.toFixed(3)}
                            </div>
                            <div className="flex items-center gap-2">
                              {analysis.issues.length === 0 ? (
                                <CheckCircle size={16} className="text-green-500" />
                              ) : (
                                <div className="flex items-center gap-1">
                                  <AlertTriangle size={16} className="text-orange-500" />
                                  <span>{analysis.issues.length}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}