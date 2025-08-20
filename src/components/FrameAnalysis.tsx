import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Eye, 
  Brain,
  Cpu,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  Activity
} from '@phosphor-icons/react'
import { Frame, QAReport, LLaVAAnalysis, SignalAnalysis } from '@/lib/types'

interface FrameAnalysisProps {
  frame: Frame
  onRunLLaVAAnalysis: (frameId: string) => void
  onRunSignalAnalysis: (frameId: string) => void
}

const FrameAnalysis: React.FC<FrameAnalysisProps> = ({
  frame,
  onRunLLaVAAnalysis,
  onRunSignalAnalysis
}) => {
  const [activeTab, setActiveTab] = React.useState("overview")

  // Mock analysis data for demonstration
  const mockLLaVAAnalysis: LLaVAAnalysis = {
    prompt: "Analyze this physics visualization. Are the mathematical equations correctly rendered? Are the field lines properly oriented?",
    response: "The frame shows Maxwell's equations with proper vector notation. Electric field lines are correctly oriented outward from the positive charge. The ∇×E annotation is clearly visible and mathematically accurate.",
    confidence: 0.87,
    physicsElements: ["Electric field", "Vector notation", "Maxwell equations", "Field lines"],
    visualElements: ["Equations", "Vectors", "Grid", "Annotations"],
    issues: []
  }

  const mockSignalAnalysis: SignalAnalysis = {
    ssim: 0.94,
    opticalFlow: 0.89,
    motionContinuity: 0.92,
    frameStability: 0.96,
    issues: ["Minor motion blur in equation region"]
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 0.8) return 'default'
    if (score >= 0.6) return 'secondary'
    return 'destructive'
  }

  return (
    <div className="space-y-6">
      {/* Frame Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye size={20} />
              Frame Analysis: #{frame.frameNumber}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={frame.qaChecked ? 'default' : 'outline'}>
                {frame.qaChecked ? 'Analyzed' : 'Pending'}
              </Badge>
              {frame.qaScore && (
                <Badge variant={getScoreBadge(frame.qaScore)}>
                  {Math.round(frame.qaScore * 100)}%
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Frame Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Frame Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={frame.imagePath}
                  alt={`Frame ${frame.frameNumber}`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Timestamp:</span>
                  <div className="font-mono">{frame.timestamp.toFixed(3)}s</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Frame #:</span>
                  <div className="font-mono">{frame.frameNumber}</div>
                </div>
              </div>

              {frame.qaIssues.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600 flex items-center gap-2">
                    <AlertTriangle size={16} />
                    Issues Detected
                  </h4>
                  <ul className="text-sm space-y-1">
                    {frame.qaIssues.map((issue, idx) => (
                      <li key={idx} className="text-red-600 flex items-start gap-2">
                        <XCircle size={16} className="mt-0.5 flex-shrink-0" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Analysis Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Analysis Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => onRunLLaVAAnalysis(frame.id)}
                className="gap-2 h-20 flex-col"
                variant="outline"
              >
                <Brain size={24} />
                <span className="text-xs">LLaVA Vision</span>
              </Button>
              
              <Button
                onClick={() => onRunSignalAnalysis(frame.id)}
                className="gap-2 h-20 flex-col"
                variant="outline"
              >
                <Activity size={24} />
                <span className="text-xs">Signal Analysis</span>
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Physics Accuracy</span>
                    <Badge variant={getScoreBadge(mockLLaVAAnalysis.confidence)}>
                      {Math.round(mockLLaVAAnalysis.confidence * 100)}%
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Visual Quality</span>
                    <Badge variant={getScoreBadge(mockSignalAnalysis.ssim)}>
                      {Math.round(mockSignalAnalysis.ssim * 100)}%
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Motion Flow</span>
                    <Badge variant={getScoreBadge(mockSignalAnalysis.opticalFlow)}>
                      {Math.round(mockSignalAnalysis.opticalFlow * 100)}%
                    </Badge>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="metrics" className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>SSIM</span>
                      <span className="font-mono">{mockSignalAnalysis.ssim.toFixed(3)}</span>
                    </div>
                    <Progress value={mockSignalAnalysis.ssim * 100} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Continuity</span>
                      <span className="font-mono">{mockSignalAnalysis.motionContinuity.toFixed(3)}</span>
                    </div>
                    <Progress value={mockSignalAnalysis.motionContinuity * 100} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Stability</span>
                      <span className="font-mono">{mockSignalAnalysis.frameStability.toFixed(3)}</span>
                    </div>
                    <Progress value={mockSignalAnalysis.frameStability * 100} className="h-2" />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Results */}
      <Tabs defaultValue="llava" className="space-y-4">
        <TabsList>
          <TabsTrigger value="llava" className="gap-2">
            <Brain size={16} />
            LLaVA Analysis
          </TabsTrigger>
          <TabsTrigger value="signal" className="gap-2">
            <Cpu size={16} />
            Signal Analysis
          </TabsTrigger>
          <TabsTrigger value="comparison" className="gap-2">
            <BarChart3 size={16} />
            Comparison
          </TabsTrigger>
        </TabsList>

        <TabsContent value="llava" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain size={20} />
                Physics & Visual Understanding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Physics Elements</h4>
                  <div className="flex flex-wrap gap-1">
                    {mockLLaVAAnalysis.physicsElements.map((element, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {element}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Visual Elements</h4>
                  <div className="flex flex-wrap gap-1">
                    {mockLLaVAAnalysis.visualElements.map((element, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {element}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">AI Response</h4>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm leading-relaxed">{mockLLaVAAnalysis.response}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Confidence Level</span>
                <div className="flex items-center gap-2">
                  <Progress value={mockLLaVAAnalysis.confidence * 100} className="w-24" />
                  <span className={`text-sm font-bold ${getScoreColor(mockLLaVAAnalysis.confidence)}`}>
                    {Math.round(mockLLaVAAnalysis.confidence * 100)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity size={20} />
                Signal Quality Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SSIM</span>
                    <span className="text-sm font-mono">{mockSignalAnalysis.ssim.toFixed(3)}</span>
                  </div>
                  <Progress value={mockSignalAnalysis.ssim * 100} />
                  <p className="text-xs text-muted-foreground">Structural similarity</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Optical Flow</span>
                    <span className="text-sm font-mono">{mockSignalAnalysis.opticalFlow.toFixed(3)}</span>
                  </div>
                  <Progress value={mockSignalAnalysis.opticalFlow * 100} />
                  <p className="text-xs text-muted-foreground">Motion tracking</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Continuity</span>
                    <span className="text-sm font-mono">{mockSignalAnalysis.motionContinuity.toFixed(3)}</span>
                  </div>
                  <Progress value={mockSignalAnalysis.motionContinuity * 100} />
                  <p className="text-xs text-muted-foreground">Motion smoothness</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Stability</span>
                    <span className="text-sm font-mono">{mockSignalAnalysis.frameStability.toFixed(3)}</span>
                  </div>
                  <Progress value={mockSignalAnalysis.frameStability * 100} />
                  <p className="text-xs text-muted-foreground">Frame consistency</p>
                </div>
              </div>

              {mockSignalAnalysis.issues.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-2 text-yellow-600">Detected Issues</h4>
                  <ul className="space-y-1">
                    {mockSignalAnalysis.issues.map((issue, idx) => (
                      <li key={idx} className="text-sm text-yellow-600 flex items-start gap-2">
                        <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 size={20} />
                Frame vs. Shot Average
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">87%</div>
                    <div className="text-sm text-muted-foreground">This Frame</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-muted-foreground">84%</div>
                    <div className="text-sm text-muted-foreground">Shot Average</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span>Performance vs Average</span>
                    <Badge variant="default">+3.5%</Badge>
                  </div>
                  <Progress value={103.5} className="h-2" />
                </div>
                
                <div className="text-center">
                  <CheckCircle size={24} className="mx-auto text-green-600 mb-2" />
                  <p className="text-sm text-green-600 font-medium">Above average quality</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default FrameAnalysis