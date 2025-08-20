import { useState, useCallback, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Play, Pause, Upload, Eye, AlertTriangle, CheckCircle, XCircle,
  SkipForward, SkipBack, Target, Activity, TrendingUp, Zap,
  ArrowsClockwise, ChartLine, Clock, Gauge, FileText, Layers
} from '@phosphor-icons/react'
import { RenderSequence, FrameAnalysis, QAAnalysisConfig, FrameComparisonResult } from '@/lib/qa-types'

type PreviewMode = 'basic' | 'enhanced' | 'frameQA' | 'comprehensive'

interface RenderPreviewProps {
  sequence?: RenderSequence
  onUploadSequence: (files: FileList) => void
  onAnalyzeFrame: (frameIndex: number) => Promise<FrameAnalysis>
  onBatchAnalysis?: (startFrame: number, endFrame: number, config: QAAnalysisConfig) => Promise<void>
  onCompareFrames?: (frameA: number, frameB: number) => Promise<FrameComparisonResult>
  mode?: PreviewMode
}

function RenderPreview({ 
  sequence, 
  onUploadSequence, 
  onAnalyzeFrame,
  onBatchAnalysis,
  onCompareFrames,
  mode = 'basic'
}: RenderPreviewProps) {
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<Map<number, FrameAnalysis>>(new Map())
  const [analyzingFrames, setAnalyzingFrames] = useState<Set<number>>(new Set())
  const [analysisConfig, setAnalysisConfig] = useState<QAAnalysisConfig>({
    ssimThreshold: 0.9,
    motionThreshold: 0.3,
    textAnalysisEnabled: true,
    colorAnalysisEnabled: true,
    compressionDetection: true,
    temporalAnalysis: true
  })
  const [currentMode, setCurrentMode] = useState<PreviewMode>(mode)
  const [batchAnalyzing, setBatchAnalyzing] = useState(false)
  const [comparisonMode, setComparisonMode] = useState(false)
  const [selectedFrames, setSelectedFrames] = useState<number[]>([])
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

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

  // Mode-specific UI rendering
  const renderModeSpecificControls = () => {
    switch (currentMode) {
      case 'enhanced':
      case 'comprehensive':
        return (
          <div className="flex items-center gap-4">
            <Label>Mode:</Label>
            <Select value={currentMode} onValueChange={(value: PreviewMode) => setCurrentMode(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="enhanced">Enhanced</SelectItem>
                <SelectItem value="frameQA">Frame QA</SelectItem>
                <SelectItem value="comprehensive">Comprehensive</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Switch
                id="comparison-mode"
                checked={comparisonMode}
                onCheckedChange={setComparisonMode}
              />
              <Label htmlFor="comparison-mode">Compare Frames</Label>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Mode Controls */}
      {renderModeSpecificControls()}
      
      {/* Sequence Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye size={20} />
              Render Preview - {currentMode.charAt(0).toUpperCase() + currentMode.slice(1)} Mode
            </div>
            <Badge variant="outline">
              {sequence.frames.length} frames @ {sequence.framerate}fps
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setCurrentFrame(Math.max(0, currentFrame - 1))}
            >
              <SkipBack size={16} />
            </Button>
            <Button 
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setCurrentFrame(Math.min(sequence.frames.length - 1, currentFrame + 1))}
            >
              <SkipForward size={16} />
            </Button>
            
            {currentMode !== 'basic' && (
              <>
                <div className="flex items-center gap-2 ml-4">
                  <Label htmlFor="speed">Speed:</Label>
                  <Slider
                    id="speed"
                    min={0.25}
                    max={2}
                    step={0.25}
                    value={[playbackSpeed]}
                    onValueChange={([value]) => setPlaybackSpeed(value)}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">{playbackSpeed}x</span>
                </div>
              </>
            )}
          </div>

          {/* Frame Display */}
          <div className="border rounded-lg bg-black flex items-center justify-center aspect-video">
            <canvas 
              ref={canvasRef}
              className="max-w-full max-h-full object-contain"
            />
            {!sequence.frames[currentFrame] && (
              <div className="text-white">Frame {currentFrame + 1}</div>
            )}
          </div>

          {/* Frame Info */}
          <div className="flex justify-between text-sm">
            <span>Frame {currentFrame + 1} of {sequence.frames.length}</span>
            <span>Time: {formatTimestamp(currentFrame / sequence.framerate)}</span>
          </div>
          
          {/* Progress Bar */}
          <Progress 
            value={(currentFrame / (sequence.frames.length - 1)) * 100} 
            className="h-2" 
          />

          {/* Analysis Controls */}
          {currentMode !== 'basic' && (
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleFrameAnalysis(currentFrame)}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? <Activity className="animate-spin h-4 w-4" /> : <Target className="h-4 w-4" />}
                Analyze Frame
              </Button>
              
              {onBatchAnalysis && currentMode === 'comprehensive' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onBatchAnalysis(0, sequence.frames.length - 1, analysisConfig)}
                  disabled={batchAnalyzing}
                >
                  {batchAnalyzing ? <Activity className="animate-spin h-4 w-4" /> : <Zap className="h-4 w-4" />}
                  Batch Analyze
                </Button>
              )}
            </div>
          )}

          {/* Analysis Results */}
          {currentAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Frame Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Overall Score:</span>
                    <Badge variant={currentAnalysis.score > 0.8 ? "default" : "destructive"}>
                      {(currentAnalysis.score * 100).toFixed(1)}%
                    </Badge>
                  </div>
                  
                  {currentAnalysis.issues.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-sm font-medium">Issues Found:</span>
                      {currentAnalysis.issues.map((issue, index) => (
                        <Alert key={index}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            {issue.description}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default RenderPreview