import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Play, Pause, Activity, TrendUp, AlertTriangle, CheckCircle, BarChart } from 'lucide-react'
import { OverallQAMetrics, FrameAnalysis } from '@/lib/qa-types'

interface QAAnalysisDashboardProps {
  metrics: OverallQAMetrics
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
}: QAAnalysisDashboardProps) {
  
  const getQualityColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600'
    if (score >= 0.75) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getQualityLabel = (score: number) => {
    if (score >= 0.9) return 'Excellent'
    if (score >= 0.75) return 'Good'
    if (score >= 0.6) return 'Fair'
    return 'Poor'
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
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

  return (
    <div className="space-y-6">
      {/* Analysis Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={20} />
              Quality Analysis System
            </div>
            
            <Button
              onClick={isAnalyzing ? onStopAnalysis : onStartAnalysis}
              variant={isAnalyzing ? "destructive" : "default"}
              className="gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Pause size={16} />
                  Stop Analysis
                </>
              ) : (
                <>
                  <Play size={16} />
                  Start Analysis
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics.totalFramesAnalyzed}</div>
              <div className="text-sm text-muted-foreground">Frames Analyzed</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{metrics.issuesDetected}</div>
              <div className="text-sm text-muted-foreground">Issues Detected</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{metrics.criticalIssues}</div>
              <div className="text-sm text-muted-foreground">Critical Issues</div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${getQualityColor(metrics.overallQualityScore)}`}>
                {getQualityLabel(metrics.overallQualityScore)}
              </div>
              <div className="text-sm text-muted-foreground">Overall Quality</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality Metrics Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart size={20} />
            Quality Metrics Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Average SSIM Score</label>
                  <span className="text-sm font-mono">{metrics.averageSSIM.toFixed(3)}</span>
                </div>
                <Progress value={metrics.averageSSIM * 100} />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Motion Stability</label>
                  <span className="text-sm font-mono">{metrics.motionStabilityScore.toFixed(3)}</span>
                </div>
                <Progress value={metrics.motionStabilityScore * 100} />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Text Legibility</label>
                  <span className="text-sm font-mono">{metrics.textLegibilityScore.toFixed(3)}</span>
                </div>
                <Progress value={metrics.textLegibilityScore * 100} />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Overall Quality</label>
                  <span className="text-sm font-mono">{metrics.overallQualityScore.toFixed(3)}</span>
                </div>
                <Progress value={metrics.overallQualityScore * 100} />
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-sm text-muted-foreground">
            Last analysis: {metrics.lastAnalysisTime.toLocaleString()}
          </div>
        </CardContent>
      </Card>

      {/* Recent Analysis Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendUp size={20} />
            Recent Frame Analyses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Frames</TabsTrigger>
              <TabsTrigger value="issues">With Issues</TabsTrigger>
              <TabsTrigger value="critical">Critical Only</TabsTrigger>
              <TabsTrigger value="metrics">Top Metrics</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Frame</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>SSIM</TableHead>
                      <TableHead>Motion</TableHead>
                      <TableHead>Text</TableHead>
                      <TableHead>Issues</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentAnalyses.slice(0, 10).map((analysis) => (
                      <TableRow key={analysis.frameIndex}>
                        <TableCell className="font-mono">
                          Frame {analysis.frameIndex + 1}
                        </TableCell>
                        <TableCell className="font-mono">
                          {formatTimestamp(analysis.metrics.timestamp)}
                        </TableCell>
                        <TableCell className="font-mono">
                          {analysis.metrics.ssim.toFixed(3)}
                        </TableCell>
                        <TableCell className="font-mono">
                          {analysis.metrics.opticalFlowStability.toFixed(3)}
                        </TableCell>
                        <TableCell className="font-mono">
                          {analysis.metrics.textLegibility.toFixed(3)}
                        </TableCell>
                        <TableCell>
                          {analysis.issues.length === 0 ? (
                            <Badge variant="outline" className="text-green-600">
                              <CheckCircle size={12} className="mr-1" />
                              None
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-orange-600">
                              <AlertTriangle size={12} className="mr-1" />
                              {analysis.issues.length}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={analysis.status === 'complete' ? 'default' : 'secondary'}
                          >
                            {analysis.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="issues" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Frame</TableHead>
                      <TableHead>Issue Type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Suggestion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentAnalyses
                      .filter(analysis => analysis.issues.length > 0)
                      .slice(0, 10)
                      .flatMap(analysis => 
                        analysis.issues.map(issue => ({
                          frameIndex: analysis.frameIndex,
                          ...issue
                        }))
                      )
                      .map((issue, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono">
                            Frame {issue.frameIndex + 1}
                          </TableCell>
                          <TableCell className="capitalize">
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
              </div>
            </TabsContent>

            <TabsContent value="critical" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Frame</TableHead>
                      <TableHead>Issue Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Suggestion</TableHead>
                      <TableHead>Action Required</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentAnalyses
                      .filter(analysis => 
                        analysis.issues.some(issue => issue.severity === 'critical')
                      )
                      .slice(0, 10)
                      .flatMap(analysis => 
                        analysis.issues
                          .filter(issue => issue.severity === 'critical')
                          .map(issue => ({
                            frameIndex: analysis.frameIndex,
                            ...issue
                          }))
                      )
                      .map((issue, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono">
                            Frame {issue.frameIndex + 1}
                          </TableCell>
                          <TableCell className="capitalize">
                            {issue.type.replace('-', ' ')}
                          </TableCell>
                          <TableCell>{issue.description}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {issue.suggestion || '—'}
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="destructive">
                              Fix Required
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Highest Quality Frames</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentAnalyses
                        .sort((a, b) => b.metrics.ssim - a.metrics.ssim)
                        .slice(0, 5)
                        .map((analysis) => (
                          <div key={analysis.frameIndex} className="flex items-center justify-between">
                            <span className="font-mono text-sm">
                              Frame {analysis.frameIndex + 1}
                            </span>
                            <div className="flex items-center gap-2">
                              <Progress value={analysis.metrics.ssim * 100} className="w-20" />
                              <span className="font-mono text-sm">
                                {analysis.metrics.ssim.toFixed(3)}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Frames Needing Attention</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentAnalyses
                        .sort((a, b) => a.metrics.ssim - b.metrics.ssim)
                        .slice(0, 5)
                        .map((analysis) => (
                          <div key={analysis.frameIndex} className="flex items-center justify-between">
                            <span className="font-mono text-sm">
                              Frame {analysis.frameIndex + 1}
                            </span>
                            <div className="flex items-center gap-2">
                              <Progress value={analysis.metrics.ssim * 100} className="w-20" />
                              <span className="font-mono text-sm">
                                {analysis.metrics.ssim.toFixed(3)}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}