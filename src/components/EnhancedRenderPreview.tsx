import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Play, Pause, SkipForward, SkipBack, Upload, Eye, AlertTriangle, CheckCircle, XCircle, Zap, TrendingUp, Activity, Target, FileText, Layers } from 'lucide-react'
import { RenderSequence, FrameAnalysis, QAAnalysisConfig, FrameComparisonResult } from '@/lib/qa-types'

interface EnhancedRenderPreviewProps {
  sequence?: RenderSequence
  onUploadSequence?: (files: FileList) => Promise<void>
  onAnalyzeFrame?: (frameIndex: number) => Promise<FrameAnalysis>
  onBatchAnalysis?: (startFrame: number, endFrame: number, config: QAAnalysisConfig) => Promise<void>
  onCompareFrames?: (frameA: number, frameB: number) => Promise<FrameComparisonResult>
}

export default function EnhancedRenderPreview({
  sequence,
  onUploadSequence,
  onAnalyzeFrame,
  onBatchAnalysis,
  onCompareFrames
}: EnhancedRenderPreviewProps) {
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<Map<number, FrameAnalysis>>(new Map())
  const [selectedFrames, setSelectedFrames] = useState<number[]>([])
  const [analysisConfig, setAnalysisConfig] = useState<QAAnalysisConfig>({
    enableSSIM: true,
    enableOpticalFlow: true,
    enableOCR: true,
    enableLLMCritique: true,
    ssimThreshold: 0.95,
    flowStabilityThreshold: 0.8,
    textLegibilityThreshold: 0.9,
    batchSize: 10
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const intervalRef = useRef<NodeJS.Timeout>()

  const playbackFPS = sequence?.framerate || 30

  useEffect(() => {
    if (isPlaying && sequence) {
      intervalRef.current = setInterval(() => {
        setCurrentFrame(prev => {
          const next = prev + 1
          if (next >= sequence.frameCount) {
            setIsPlaying(false)
            return 0
          }
          return next
        })
      }, 1000 / playbackFPS)
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
  }, [isPlaying, sequence, playbackFPS])

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && onUploadSequence) {
      try {
        await onUploadSequence(files)
      } catch (error) {
        console.error('Upload failed:', error)
      }
    }
  }, [onUploadSequence])

  const handleFrameAnalysis = useCallback(async (frameIndex: number) => {
    if (!onAnalyzeFrame) return

    try {
      const analysis = await onAnalyzeFrame(frameIndex)
      setAnalysisResults(prev => new Map(prev).set(frameIndex, analysis))
    } catch (error) {
      console.error('Frame analysis failed:', error)
    }
  }, [onAnalyzeFrame])

  const handleBatchAnalysis = useCallback(async () => {
    if (!onBatchAnalysis || !sequence) return

    setIsAnalyzing(true)
    setAnalysisProgress(0)

    try {
      const totalFrames = sequence.frameCount
      const batchSize = analysisConfig.batchSize
      
      for (let i = 0; i < totalFrames; i += batchSize) {
        const endFrame = Math.min(i + batchSize - 1, totalFrames - 1)
        await onBatchAnalysis(i, endFrame, analysisConfig)
        setAnalysisProgress(((i + batchSize) / totalFrames) * 100)
      }
    } catch (error) {
      console.error('Batch analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
      setAnalysisProgress(0)
    }
  }, [onBatchAnalysis, sequence, analysisConfig])

  const handleFrameComparison = useCallback(async () => {
    if (!onCompareFrames || selectedFrames.length !== 2) return

    try {
      const result = await onCompareFrames(selectedFrames[0], selectedFrames[1])
      console.log('Frame comparison result:', result)
    } catch (error) {
      console.error('Frame comparison failed:', error)
    }
  }, [onCompareFrames, selectedFrames])

  const toggleFrameSelection = useCallback((frameIndex: number) => {
    setSelectedFrames(prev => {
      if (prev.includes(frameIndex)) {
        return prev.filter(f => f !== frameIndex)
      } else if (prev.length < 2) {
        return [...prev, frameIndex]
      } else {
        return [prev[1], frameIndex]
      }
    })
  }, [])

  const getCurrentFrameAnalysis = () => {
    return analysisResults.get(currentFrame)
  }

  const getFrameStatus = (frameIndex: number) => {
    const analysis = analysisResults.get(frameIndex)
    if (!analysis) return 'unanalyzed'
    
    const criticalIssues = analysis.issues.filter(issue => issue.severity === 'critical').length
    const highIssues = analysis.issues.filter(issue => issue.severity === 'high').length
    
    if (criticalIssues > 0) return 'critical'
    if (highIssues > 0) return 'warning'
    return 'good'
  }

  const getOverallQuality = () => {
    if (analysisResults.size === 0) return null
    
    let totalSSIM = 0
    let totalFlow = 0
    let totalLegibility = 0
    let totalIssues = 0
    let criticalIssues = 0
    
    analysisResults.forEach(analysis => {
      totalSSIM += analysis.metrics.ssim
      totalFlow += analysis.metrics.opticalFlowStability
      totalLegibility += analysis.metrics.textLegibility
      totalIssues += analysis.issues.length
      criticalIssues += analysis.issues.filter(issue => issue.severity === 'critical').length
    })
    
    const count = analysisResults.size
    return {
      averageSSIM: totalSSIM / count,
      averageFlow: totalFlow / count,
      averageLegibility: totalLegibility / count,
      totalIssues,
      criticalIssues,
      overallScore: ((totalSSIM + totalFlow + totalLegibility) / (count * 3)) * 100
    }
  }

  if (!sequence) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Upload size={24} />
            Upload Render Sequence
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Upload a render sequence to begin frame-by-frame QA analysis
          </p>
          <Button 
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <Upload size={16} />
            Select Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </CardContent>
      </Card>
    )
  }

  const currentAnalysis = getCurrentFrameAnalysis()
  const qualityStats = getOverallQuality()

  return (
    <div className="space-y-6">
      {/* Main Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye size={20} />
              Render Preview: {sequence.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {sequence.frameCount} frames
              </Badge>
              <Badge variant="outline">
                {sequence.framerate} fps
              </Badge>
              <Badge variant="outline">
                {sequence.resolution.width}x{sequence.resolution.height}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Video Canvas */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain"
              width={sequence.resolution.width}
              height={sequence.resolution.height}
            />
            
            {/* Frame Status Overlay */}
            <div className="absolute top-2 left-2 flex gap-2">
              <Badge variant={getFrameStatus(currentFrame) === 'critical' ? 'destructive' : 
                            getFrameStatus(currentFrame) === 'warning' ? 'secondary' : 'default'}>
                Frame {currentFrame + 1}
              </Badge>
              {selectedFrames.includes(currentFrame) && (
                <Badge variant="outline">Selected</Badge>
              )}
            </div>

            {/* Analysis Issues Overlay */}
            {currentAnalysis?.issues.map((issue, index) => (
              issue.location && (
                <div
                  key={index}
                  className="absolute border-2 border-red-500 bg-red-500/20"
                  style={{
                    left: `${(issue.location.x / sequence.resolution.width) * 100}%`,
                    top: `${(issue.location.y / sequence.resolution.height) * 100}%`,
                    width: `${(issue.location.width / sequence.resolution.width) * 100}%`,
                    height: `${(issue.location.height / sequence.resolution.height) * 100}%`
                  }}
                  title={issue.description}
                />
              )
            ))}
          </div>

          {/* Playback Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentFrame(Math.max(0, currentFrame - 1))}
                disabled={currentFrame === 0}
              >
                <SkipBack size={16} />
              </Button>
              
              <Button
                onClick={() => setIsPlaying(!isPlaying)}
                className="gap-2"
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentFrame(Math.min(sequence.frameCount - 1, currentFrame + 1))}
                disabled={currentFrame === sequence.frameCount - 1}
              >
                <SkipForward size={16} />
              </Button>
            </div>

            {/* Frame Scrubber */}
            <div className="space-y-2">
              <Slider
                value={[currentFrame]}
                min={0}
                max={sequence.frameCount - 1}
                step={1}
                onValueChange={([value]) => setCurrentFrame(value)}
                className="w-full"
              />
              
              {/* Frame Status Bar */}
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full flex">
                  {Array.from({ length: sequence.frameCount }, (_, i) => {
                    const status = getFrameStatus(i)
                    return (
                      <div
                        key={i}
                        className={`flex-1 ${
                          status === 'critical' ? 'bg-red-500' :
                          status === 'warning' ? 'bg-yellow-500' :
                          status === 'good' ? 'bg-green-500' :
                          'bg-muted-foreground/20'
                        }`}
                        style={{ width: `${100 / sequence.frameCount}%` }}
                      />
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="analysis" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analysis">Frame Analysis</TabsTrigger>
          <TabsTrigger value="overview">Quality Overview</TabsTrigger>
          <TabsTrigger value="batch">Batch Processing</TabsTrigger>
          <TabsTrigger value="compare">Frame Compare</TabsTrigger>
        </TabsList>

        {/* Frame Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity size={20} />
                  Current Frame Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleFrameAnalysis(currentFrame)}
                    className="gap-2"
                    disabled={!onAnalyzeFrame}
                  >
                    <Zap size={16} />
                    Analyze Frame {currentFrame + 1}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => toggleFrameSelection(currentFrame)}
                    className="gap-2"
                  >
                    <Target size={16} />
                    {selectedFrames.includes(currentFrame) ? 'Deselect' : 'Select'}
                  </Button>
                </div>

                {currentAnalysis && (
                  <div className="space-y-4">
                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="text-sm font-medium">SSIM Score</div>
                        <div className="flex items-center gap-2">
                          <Progress value={currentAnalysis.metrics.ssim * 100} className="flex-1" />
                          <span className="text-sm">{(currentAnalysis.metrics.ssim * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Motion Stability</div>
                        <div className="flex items-center gap-2">
                          <Progress value={currentAnalysis.metrics.opticalFlowStability * 100} className="flex-1" />
                          <span className="text-sm">{(currentAnalysis.metrics.opticalFlowStability * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Text Legibility</div>
                        <div className="flex items-center gap-2">
                          <Progress value={currentAnalysis.metrics.textLegibility * 100} className="flex-1" />
                          <span className="text-sm">{(currentAnalysis.metrics.textLegibility * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Color Accuracy</div>
                        <div className="flex items-center gap-2">
                          <Progress value={currentAnalysis.metrics.colorAccuracy * 100} className="flex-1" />
                          <span className="text-sm">{(currentAnalysis.metrics.colorAccuracy * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Issues */}
                    {currentAnalysis.issues.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Detected Issues</div>
                        {currentAnalysis.issues.map((issue, index) => (
                          <Alert key={index} variant={issue.severity === 'critical' ? 'destructive' : 'default'}>
                            <AlertTriangle size={16} />
                            <AlertDescription>
                              <div className="flex items-center justify-between">
                                <span>{issue.description}</span>
                                <Badge variant={
                                  issue.severity === 'critical' ? 'destructive' :
                                  issue.severity === 'high' ? 'secondary' :
                                  'outline'
                                }>
                                  {issue.severity}
                                </Badge>
                              </div>
                              {issue.suggestion && (
                                <div className="mt-1 text-sm text-muted-foreground">
                                  Suggestion: {issue.suggestion}
                                </div>
                              )}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers size={20} />
                  Frame Navigator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-8 gap-2 max-h-64 overflow-y-auto">
                  {Array.from({ length: sequence.frameCount }, (_, i) => {
                    const status = getFrameStatus(i)
                    const isSelected = selectedFrames.includes(i)
                    const isCurrent = i === currentFrame
                    
                    return (
                      <Button
                        key={i}
                        variant={isCurrent ? 'default' : 'outline'}
                        size="sm"
                        className={`h-12 ${
                          isSelected ? 'ring-2 ring-blue-500' : ''
                        } ${
                          status === 'critical' ? 'bg-red-100 hover:bg-red-200' :
                          status === 'warning' ? 'bg-yellow-100 hover:bg-yellow-200' :
                          status === 'good' ? 'bg-green-100 hover:bg-green-200' :
                          ''
                        }`}
                        onClick={() => setCurrentFrame(i)}
                      >
                        <div className="text-xs">
                          {i + 1}
                          {status === 'critical' && <XCircle size={12} className="text-red-500" />}
                          {status === 'warning' && <AlertTriangle size={12} className="text-yellow-500" />}
                          {status === 'good' && <CheckCircle size={12} className="text-green-500" />}
                        </div>
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Quality Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {qualityStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp size={20} />
                    Overall Quality Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {qualityStats.overallScore.toFixed(1)}%
                  </div>
                  <Progress value={qualityStats.overallScore} className="w-full" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle size={20} />
                    Issues Detected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Issues:</span>
                      <span className="font-medium">{qualityStats.totalIssues}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Critical:</span>
                      <span className="font-medium text-red-500">{qualityStats.criticalIssues}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frames Analyzed:</span>
                      <span className="font-medium">{analysisResults.size}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity size={20} />
                    Average Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>SSIM:</span>
                        <span>{(qualityStats.averageSSIM * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={qualityStats.averageSSIM * 100} className="h-2" />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Motion:</span>
                        <span>{(qualityStats.averageFlow * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={qualityStats.averageFlow * 100} className="h-2" />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Legibility:</span>
                        <span>{(qualityStats.averageLegibility * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={qualityStats.averageLegibility * 100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Batch Processing Tab */}
        <TabsContent value="batch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap size={20} />
                Batch Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAnalyzing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing frames...</span>
                    <span>{analysisProgress.toFixed(1)}%</span>
                  </div>
                  <Progress value={analysisProgress} className="w-full" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">SSIM Threshold</label>
                  <Slider
                    value={[analysisConfig.ssimThreshold]}
                    min={0.8}
                    max={1.0}
                    step={0.01}
                    onValueChange={([value]) => setAnalysisConfig(prev => ({ ...prev, ssimThreshold: value }))}
                  />
                  <div className="text-xs text-muted-foreground">{analysisConfig.ssimThreshold.toFixed(2)}</div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Batch Size</label>
                  <Slider
                    value={[analysisConfig.batchSize]}
                    min={1}
                    max={50}
                    step={1}
                    onValueChange={([value]) => setAnalysisConfig(prev => ({ ...prev, batchSize: value }))}
                  />
                  <div className="text-xs text-muted-foreground">{analysisConfig.batchSize} frames</div>
                </div>
              </div>

              <Button
                onClick={handleBatchAnalysis}
                disabled={isAnalyzing || !onBatchAnalysis}
                className="w-full gap-2"
              >
                <Zap size={16} />
                {isAnalyzing ? 'Analyzing...' : 'Start Batch Analysis'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Frame Compare Tab */}
        <TabsContent value="compare" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers size={20} />
                Frame Comparison
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Select two frames to compare their visual differences
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-sm font-medium mb-2">Selected Frames:</div>
                  <div className="flex gap-2">
                    {selectedFrames.map((frame, index) => (
                      <Badge key={index} variant="outline">
                        Frame {frame + 1}
                      </Badge>
                    ))}
                    {selectedFrames.length === 0 && (
                      <span className="text-sm text-muted-foreground">No frames selected</span>
                    )}
                  </div>
                </div>
                
                <Button
                  onClick={handleFrameComparison}
                  disabled={selectedFrames.length !== 2 || !onCompareFrames}
                  className="gap-2"
                >
                  <FileText size={16} />
                  Compare Frames
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}