import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  TrendUp, 
  Target,
  Eye,
  Activity,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Clock
} from '@phosphor-icons/react'

interface QAMetrics {
  overallScore: number
  ssimStats: {
    mean: number
    min: number
    max: number
    distribution: { range: string; count: number }[]
  }
  semanticChecks: {
    total: number
    passed: number
    failed: number
    confidence: number
  }
  opticalFlowMetrics: {
    continuity: number
    smoothness: number
    issues: number
  }
  frameQuality: {
    excellent: number
    good: number
    fair: number
    poor: number
  }
  timePerFrame: number
  totalAnalysisTime: number
}

interface QAMetricsViewProps {
  shotId: string
  metrics?: QAMetrics
  onRefreshMetrics: () => void
}

export default function QAMetricsView({ shotId, metrics, onRefreshMetrics }: QAMetricsViewProps) {
  const [selectedMetric, setSelectedMetric] = useState<string>('overview')

  // Default metrics for demonstration
  const defaultMetrics: QAMetrics = {
    overallScore: 0.87,
    ssimStats: {
      mean: 0.923,
      min: 0.743,
      max: 0.987,
      distribution: [
        { range: '0.95-1.0', count: 67 },
        { range: '0.85-0.95', count: 38 },
        { range: '0.75-0.85', count: 12 },
        { range: '0.0-0.75', count: 3 }
      ]
    },
    semanticChecks: {
      total: 480, // 120 frames * 4 checks each
      passed: 456,
      failed: 24,
      confidence: 89.2
    },
    opticalFlowMetrics: {
      continuity: 0.94,
      smoothness: 0.91,
      issues: 7
    },
    frameQuality: {
      excellent: 67,
      good: 38,
      fair: 12,
      poor: 3
    },
    timePerFrame: 2.3,
    totalAnalysisTime: 276
  }

  const currentMetrics = metrics || defaultMetrics

  const getQualityColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600'
    if (score >= 0.8) return 'text-blue-600'
    if (score >= 0.7) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getQualityBadge = (score: number) => {
    if (score >= 0.9) return 'bg-green-100 text-green-800'
    if (score >= 0.8) return 'bg-blue-100 text-blue-800'
    if (score >= 0.7) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              QA Metrics Dashboard
            </CardTitle>
            <div className="flex items-center gap-3">
              <Badge className={getQualityBadge(currentMetrics.overallScore)}>
                Overall Score: {Math.round(currentMetrics.overallScore * 100)}%
              </Badge>
              <Button variant="outline" size="sm" onClick={onRefreshMetrics}>
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getQualityColor(currentMetrics.ssimStats.mean)}`}>
                {currentMetrics.ssimStats.mean.toFixed(3)}
              </div>
              <div className="text-sm text-muted-foreground">Avg SSIM</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((currentMetrics.semanticChecks.passed / currentMetrics.semanticChecks.total) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Semantic Pass</div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${getQualityColor(currentMetrics.opticalFlowMetrics.continuity)}`}>
                {Math.round(currentMetrics.opticalFlowMetrics.continuity * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Motion Continuity</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {Math.round(currentMetrics.totalAnalysisTime / 60)}m
              </div>
              <div className="text-sm text-muted-foreground">Analysis Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="w-4 h-4" />
              SSIM Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentMetrics.ssimStats.distribution.map((dist, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium w-20">{dist.range}</span>
                    <Progress 
                      value={(dist.count / 120) * 100} 
                      className="flex-1 h-2"
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">{dist.count}</span>
                </div>
              ))}
              
              <div className="pt-2 border-t text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Min: {currentMetrics.ssimStats.min.toFixed(3)}</span>
                  <span>Max: {currentMetrics.ssimStats.max.toFixed(3)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Semantic Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Checks</span>
                <span className="font-medium">{currentMetrics.semanticChecks.total}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Passed</span>
                  </div>
                  <span className="font-medium text-green-600">
                    {currentMetrics.semanticChecks.passed}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-sm">Failed</span>
                  </div>
                  <span className="font-medium text-red-600">
                    {currentMetrics.semanticChecks.failed}
                  </span>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avg Confidence</span>
                  <span className="font-medium">{currentMetrics.semanticChecks.confidence.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Motion Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Continuity</span>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={currentMetrics.opticalFlowMetrics.continuity * 100} 
                    className="w-16 h-2"
                  />
                  <span className="text-sm font-medium">
                    {Math.round(currentMetrics.opticalFlowMetrics.continuity * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Smoothness</span>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={currentMetrics.opticalFlowMetrics.smoothness * 100} 
                    className="w-16 h-2"
                  />
                  <span className="text-sm font-medium">
                    {Math.round(currentMetrics.opticalFlowMetrics.smoothness * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">Motion Issues</span>
                <span className="text-sm font-medium text-red-600">
                  {currentMetrics.opticalFlowMetrics.issues}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Time per Frame</span>
                <span className="font-medium">{currentMetrics.timePerFrame.toFixed(1)}s</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Analysis Time</span>
                <span className="font-medium">
                  {Math.floor(currentMetrics.totalAnalysisTime / 60)}m {currentMetrics.totalAnalysisTime % 60}s
                </span>
              </div>
              
              <div className="pt-2 border-t">
                <div className="text-xs text-muted-foreground">
                  Estimated for 120 frames with LLaVA + SSIM analysis
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Frame Quality Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {currentMetrics.frameQuality.excellent}
              </div>
              <div className="text-xs text-muted-foreground">Excellent</div>
              <div className="text-xs text-green-600">≥95% SSIM</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {currentMetrics.frameQuality.good}
              </div>
              <div className="text-xs text-muted-foreground">Good</div>
              <div className="text-xs text-blue-600">85-95% SSIM</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {currentMetrics.frameQuality.fair}
              </div>
              <div className="text-xs text-muted-foreground">Fair</div>
              <div className="text-xs text-yellow-600">75-85% SSIM</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {currentMetrics.frameQuality.poor}
              </div>
              <div className="text-xs text-muted-foreground">Poor</div>
              <div className="text-xs text-red-600">&lt;75% SSIM</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}