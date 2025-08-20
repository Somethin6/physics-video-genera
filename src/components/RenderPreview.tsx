import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Play, Pause, Upload, Eye, CheckCircle, XCircle } from 'lucide-react'
import { RenderSequence, FrameAnalysis } from '@/lib/qa-types'

interface RenderPreviewProps {
  sequence?: RenderSequence
  onUploadSequence: (files: FileList) => void
  onAnalyzeFrame: (frameIndex: number) => Promise<FrameAnalysis>
}

export default function RenderPreview({ sequence, onUploadSequence, onAnalyzeFrame }: RenderPreviewProps) {
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<Map<number, FrameAnalysis>>(new Map())
  const [analyzingFrames, setAnalyzingFrames] = useState<Set<number>>(new Set())

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
              Upload a sequence of rendered frames for quality analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Drop frame sequences here</p>
              <p className="text-muted-foreground mb-4">
                Supports PNG, EXR, and JPEG frame sequences
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

  return (
    <div className="space-y-6">
      {/* Sequence Info */}
      <Card>
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

      {/* Video Player */}
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
            
            {/* Analysis Overlay */}
            {currentAnalysis?.issues.map((issue, index) => 
              issue.location && (
                <div
                  key={index}
                  className="absolute border-2 border-red-500 bg-red-500/20"
                  style={{
                    left: `${(issue.location.x / sequence.resolution.width) * 100}%`,
                    top: `${(issue.location.y / sequence.resolution.height) * 100}%`,
                    width: `${(issue.location.width / sequence.resolution.width) * 100}%`,
                    height: `${(issue.location.height / sequence.resolution.height) * 100}%`,
                  }}
                  title={issue.description}
                />
              )
            )}
          </div>

          {/* Timeline Controls */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </Button>
              
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
                </div>
              </div>

              <div className="text-sm font-mono text-muted-foreground min-w-[120px] text-right">
                {formatTimestamp(currentFrame / sequence.framerate)} / {formatTimestamp(sequence.duration)}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span>Frame {currentFrame + 1} of {sequence.frameCount}</span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFrameAnalysis(currentFrame)}
                disabled={isAnalyzing || currentAnalysis !== undefined}
              >
                {isAnalyzing ? (
                  <>Analyzing...</>
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

      {/* Analysis Results */}
      {(currentAnalysis || isAnalyzing) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye size={20} />
              Frame Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isAnalyzing ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
                <p className="text-muted-foreground">Analyzing frame {currentFrame + 1}...</p>
              </div>
            ) : currentAnalysis && (
              <Tabs defaultValue="metrics" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="metrics">Quality Metrics</TabsTrigger>
                  <TabsTrigger value="issues">Issues Found</TabsTrigger>
                  <TabsTrigger value="comparison">Comparison</TabsTrigger>
                </TabsList>

                <TabsContent value="metrics" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">SSIM Score</label>
                      <div className="flex items-center gap-2">
                        <Progress value={currentAnalysis.metrics.ssim * 100} className="flex-1" />
                        <span className="text-sm font-mono">{currentAnalysis.metrics.ssim.toFixed(3)}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Motion Stability</label>
                      <div className="flex items-center gap-2">
                        <Progress value={currentAnalysis.metrics.opticalFlowStability * 100} className="flex-1" />
                        <span className="text-sm font-mono">{currentAnalysis.metrics.opticalFlowStability.toFixed(3)}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Text Legibility</label>
                      <div className="flex items-center gap-2">
                        <Progress value={currentAnalysis.metrics.textLegibility * 100} className="flex-1" />
                        <span className="text-sm font-mono">{currentAnalysis.metrics.textLegibility.toFixed(3)}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Color Accuracy</label>
                      <div className="flex items-center gap-2">
                        <Progress value={currentAnalysis.metrics.colorAccuracy * 100} className="flex-1" />
                        <span className="text-sm font-mono">{currentAnalysis.metrics.colorAccuracy.toFixed(3)}</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="issues" className="space-y-4">
                  {currentAnalysis.issues.length === 0 ? (
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
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>

                <TabsContent value="comparison" className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <XCircle size={48} className="mx-auto mb-4" />
                    <p>Frame comparison analysis not available</p>
                    <p className="text-sm">Select multiple frames to enable comparison</p>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}