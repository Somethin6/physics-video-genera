import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Eye,
  TrendingUp,
  Cpu,
  HardDrive,
  Clock
} from '@phosphor-icons/react'
import { QAMetrics } from '@/lib/qa-types'
import { FrameAnalysis, QAIssue } from '@/lib/types'

interface QAAnalysisProps {
  metrics: QAMetrics
  recentAnalyses: FrameAnalysis[]
  isAnalyzing: boolean
  onStartAnalysis: () => void
  onStopAnalysis: () => void
}

export default function QAAnalysisDashboard({ 
  metrics, 
  recentAnalyses, 
  isAnalyzing, 
  onStartAnalysis, 
  onStopAnalysis 
}: QAAnalysisProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '6h' | '24h'>('1h')

  const getMetricColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600'
    if (score >= 0.7) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getMetricStatus = (score: number) => {
    if (score >= 0.9) return 'excellent'
    if (score >= 0.7) return 'good'
    if (score >= 0.5) return 'fair'
    return 'poor'
  }

  const criticalIssues = recentAnalyses
    .flatMap(analysis => analysis.detectedIssues)
    .filter(issue => issue.severity === 'critical')

  const highPriorityIssues = recentAnalyses
    .flatMap(analysis => analysis.detectedIssues)
    .filter(issue => issue.severity === 'high')

  return (
    <div className="space-y-6">
      {/* System Status Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">QA Analysis Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time quality monitoring and frame analysis
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant={isAnalyzing ? 'default' : 'outline'} className="gap-2">
            <Activity size={12} className={isAnalyzing ? 'animate-pulse' : ''} />
            {isAnalyzing ? 'Analyzing' : 'Idle'}
          </Badge>
          
          {isAnalyzing ? (
            <Button variant="outline" onClick={onStopAnalysis}>
              Stop Analysis
            </Button>
          ) : (
            <Button onClick={onStartAnalysis}>
              Start Analysis
            </Button>
          )}
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Quality</p>
                <p className={`text-2xl font-bold ${getMetricColor(metrics.overallQuality)}`}>
                  {(metrics.overallQuality * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {getMetricStatus(metrics.overallQuality)}
                </p>
              </div>
              <TrendingUp className={getMetricColor(metrics.overallQuality)} size={20} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Text Readability</p>
                <p className={`text-2xl font-bold ${getMetricColor(metrics.textReadability)}`}>
                  {(metrics.textReadability * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {metrics.frameAnalysisCount} frames
                </p>
              </div>
              <Eye className={getMetricColor(metrics.textReadability)} size={20} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Motion Stability</p>
                <p className={`text-2xl font-bold ${getMetricColor(metrics.motionStability)}`}>
                  {(metrics.motionStability * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Optical flow</p>
              </div>
              <Activity className={getMetricColor(metrics.motionStability)} size={20} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Issues</p>
                <p className="text-2xl font-bold">
                  {metrics.totalIssues}
                </p>
                <p className="text-xs text-muted-foreground">
                  {criticalIssues.length} critical
                </p>
              </div>
              <AlertTriangle className="text-red-600" size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
          <TabsTrigger value="issues">Active Issues</TabsTrigger>
          <TabsTrigger value="frames">Recent Analyses</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quality Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>SSIM Score</span>
                      <span>{(metrics.averageSSIM * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.averageSSIM * 100} />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Motion Stability</span>
                      <span>{(metrics.motionStability * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.motionStability * 100} />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Text Readability</span>
                      <span>{(metrics.textReadability * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.textReadability * 100} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Analysis Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-mono font-bold">{metrics.frameAnalysisCount}</div>
                    <div className="text-xs text-muted-foreground">Frames Analyzed</div>
                  </div>

                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-mono font-bold">{metrics.totalIssues}</div>
                    <div className="text-xs text-muted-foreground">Issues Found</div>
                  </div>

                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-mono font-bold">
                      {recentAnalyses.length > 0 ? 
                        (recentAnalyses.reduce((sum, a) => sum + a.detectedIssues.length, 0) / recentAnalyses.length).toFixed(1) : 
                        '0'
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">Avg Issues/Frame</div>
                  </div>

                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-mono font-bold">
                      {(metrics.overallQuality * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Quality Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Critical Issues */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="text-red-600" size={16} />
                  Critical Issues ({criticalIssues.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {criticalIssues.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No critical issues detected
                  </div>
                ) : (
                  <div className="space-y-2">
                    {criticalIssues.slice(0, 5).map((issue, index) => (
                      <div key={`critical-${index}`} className="flex items-start gap-3 p-3 border rounded-lg">
                        <AlertTriangle className="text-red-600 mt-0.5" size={16} />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{issue.description}</div>
                          <div className="text-xs text-muted-foreground">
                            Frame {issue.frameNumber} • {(issue.timestamp / 1000).toFixed(1)}s
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* High Priority Issues */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="text-orange-600" size={16} />
                  High Priority ({highPriorityIssues.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {highPriorityIssues.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No high priority issues
                  </div>
                ) : (
                  <div className="space-y-2">
                    {highPriorityIssues.slice(0, 5).map((issue, index) => (
                      <div key={`high-${index}`} className="flex items-start gap-3 p-3 border rounded-lg">
                        <AlertTriangle className="text-orange-600 mt-0.5" size={16} />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{issue.description}</div>
                          <div className="text-xs text-muted-foreground">
                            Frame {issue.frameNumber} • {(issue.timestamp / 1000).toFixed(1)}s
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="frames" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Frame Analyses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentAnalyses.slice(0, 10).map((analysis) => (
                  <div key={analysis.frameNumber} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="font-mono text-sm">
                        Frame {analysis.frameNumber.toString().padStart(4, '0')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(analysis.timestamp / 1000).toFixed(2)}s
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium">
                        {(analysis.visualQuality * 100).toFixed(1)}%
                      </div>
                      
                      {analysis.detectedIssues.length > 0 ? (
                        <Badge variant="outline">
                          {analysis.detectedIssues.length} issues
                        </Badge>
                      ) : (
                        <CheckCircle className="text-green-600" size={16} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">CPU Usage</p>
                    <p className="text-2xl font-bold">45%</p>
                    <p className="text-xs text-muted-foreground">8 cores active</p>
                  </div>
                  <Cpu className="text-blue-600" size={20} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Memory Usage</p>
                    <p className="text-2xl font-bold">12.4GB</p>
                    <p className="text-xs text-muted-foreground">38% of 32GB</p>
                  </div>
                  <HardDrive className="text-green-600" size={20} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Analysis Rate</p>
                    <p className="text-2xl font-bold">2.3</p>
                    <p className="text-xs text-muted-foreground">frames/second</p>
                  </div>
                  <Clock className="text-purple-600" size={20} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}