import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Upload,
  AlertTriangle,
  CheckCircle,
  Eye,
  Activity
} from '@phosphor-icons/react'
import { RenderSequence, QAAnalysis, QAIssue } from '@/lib/qa-types'
import { FrameAnalysis } from '@/lib/types'

interface RenderPreviewProps {
  sequence?: RenderSequence
  onUploadSequence: (files: FileList) => void
  onAnalyzeFrame: (frameNumber: number) => Promise<FrameAnalysis>
}

export default function RenderPreview({ 
  sequence, 
  onUploadSequence, 
  onAnalyzeFrame 
}: RenderPreviewProps) {
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedAnalysis, setSelectedAnalysis] = useState<QAAnalysis | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onUploadSequence(event.target.files)
    }
  }

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
    // Implementation would handle actual playback
  }

  const getSeverityColor = (severity: QAIssue['severity']) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'accent'
      case 'low': return 'secondary'
      default: return 'secondary'
    }
  }

  const getSeverityIcon = (severity: QAIssue['severity']) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle size={16} />
      case 'medium':
        return <Eye size={16} />
      case 'low':
        return <Activity size={16} />
      default:
        return <CheckCircle size={16} />
    }
  }

  if (!sequence) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center h-full space-y-4 p-8">
          <div className="text-center space-y-2">
            <Upload size={48} className="mx-auto text-muted-foreground" />
            <h3 className="text-lg font-semibold">Upload Render Sequence</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Upload your rendered frame sequence to begin automated quality analysis
            </p>
          </div>
          
          <Button 
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <Upload size={16} />
            Choose Files
          </Button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept="image/*"
            className="hidden"
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Main Preview Panel */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{sequence.name}</CardTitle>
              <Badge variant={sequence.status === 'completed' ? 'default' : 'secondary'}>
                {sequence.status}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Frame Display Area */}
            <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
              <div className="text-white text-sm">
                Frame {currentFrame + 1} / {sequence.frameCount}
              </div>
              {/* Actual frame would be displayed here */}
            </div>
            
            {/* Playback Controls */}
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <SkipBack size={16} />
              </Button>
              
              <Button onClick={togglePlayback} variant="outline" size="sm">
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </Button>
              
              <Button variant="outline" size="sm">
                <SkipForward size={16} />
              </Button>
              
              <div className="flex-1">
                <Slider
                  value={[currentFrame]}
                  onValueChange={(value) => setCurrentFrame(value[0])}
                  max={sequence.frameCount - 1}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <span className="text-sm text-muted-foreground min-w-0">
                {Math.floor(currentFrame / sequence.fps)}s
              </span>
            </div>
            
            {/* Analysis Progress */}
            {sequence.status === 'analyzing' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Analyzing frames...</span>
                  <span>{sequence.progress}%</span>
                </div>
                <Progress value={sequence.progress} />
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Frame Analysis Details */}
        {selectedAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Frame Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="metrics" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="metrics">Metrics</TabsTrigger>
                  <TabsTrigger value="issues">Issues</TabsTrigger>
                  <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="metrics" className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-mono font-semibold">
                        {(selectedAnalysis.ssimScore * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">SSIM Score</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-mono font-semibold">
                        {(selectedAnalysis.motionContinuity * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Motion Continuity</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-mono font-semibold">
                        {(selectedAnalysis.ocrReadability * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Text Readability</div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="issues" className="space-y-2">
                  {selectedAnalysis.issues.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No issues detected in this frame
                    </div>
                  ) : (
                    selectedAnalysis.issues.map((issue) => (
                      <div key={issue.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className={`text-${getSeverityColor(issue.severity)}`}>
                          {getSeverityIcon(issue.severity)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{issue.description}</div>
                          <Badge variant={getSeverityColor(issue.severity)} className="mt-1">
                            {issue.severity}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
                
                <TabsContent value="suggestions" className="space-y-2">
                  {selectedAnalysis.issues
                    .filter(issue => issue.suggestion)
                    .map((issue) => (
                      <div key={issue.id} className="p-3 border rounded-lg">
                        <div className="font-medium text-sm mb-1">{issue.type.replace('_', ' ')}</div>
                        <div className="text-sm text-muted-foreground">{issue.suggestion}</div>
                      </div>
                    ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Analysis Panel */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quality Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{sequence.overallScore}%</div>
              <div className="text-sm text-muted-foreground">Overall Quality</div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Critical Issues</span>
                <Badge variant="destructive">{sequence.issueCount.critical}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">High Priority</span>
                <Badge variant="destructive">{sequence.issueCount.high}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Medium Priority</span>
                <Badge variant="secondary">{sequence.issueCount.medium}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Low Priority</span>
                <Badge variant="outline">{sequence.issueCount.low}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Frame List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Analyzed Frames</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {sequence.analyses.map((analysis) => (
                <button
                  key={analysis.frameNumber}
                  onClick={() => {
                    setCurrentFrame(analysis.frameNumber)
                    setSelectedAnalysis(analysis)
                  }}
                  className={`w-full text-left p-2 rounded border transition-colors hover:bg-muted ${
                    selectedAnalysis?.frameNumber === analysis.frameNumber 
                      ? 'bg-accent text-accent-foreground' 
                      : ''
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Frame {analysis.frameNumber + 1}
                    </span>
                    {analysis.issues.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {analysis.issues.length}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {analysis.timestamp.toFixed(2)}s
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}