import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  TrendingDown,
  Eye,
  Brain,
  Clock
} from '@phosphor-icons/react'
import { RenderFrame, QAResult, FrameIssue } from '@/lib/types'

interface QASummaryDashboardProps {
  frames: RenderFrame[]
  qaResults: QAResult[]
  onExportReport: () => void
  onRetryFailedFrames: () => void
}

export default function QASummaryDashboard({ 
  frames, 
  qaResults, 
  onExportReport,
  onRetryFailedFrames
}: QASummaryDashboardProps) {

  const analytics = useMemo(() => {
    const totalFrames = frames.length
    const analyzedFrames = qaResults.length
    const passedFrames = qaResults.filter(r => r.passed).length
    const failedFrames = analyzedFrames - passedFrames
    
    const avgScore = analyzedFrames > 0 
      ? qaResults.reduce((sum, r) => sum + r.overallScore, 0) / analyzedFrames 
      : 0

    const allIssues = qaResults.flatMap(r => r.issues)
    const issuesByType = allIssues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const issuesBySeverity = allIssues.reduce((acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const frameScores = qaResults.map(r => r.overallScore)
    const scoreDistribution = {
      excellent: frameScores.filter(s => s >= 0.9).length,
      good: frameScores.filter(s => s >= 0.8 && s < 0.9).length,
      fair: frameScores.filter(s => s >= 0.6 && s < 0.8).length,
      poor: frameScores.filter(s => s < 0.6).length
    }

    const avgAnalysisTime = analyzedFrames > 0
      ? qaResults.reduce((sum, r) => sum + (r.analysisTime || 0), 0) / analyzedFrames
      : 0

    return {
      totalFrames,
      analyzedFrames,
      passedFrames,
      failedFrames,
      avgScore,
      allIssues,
      issuesByType,
      issuesBySeverity,
      scoreDistribution,
      avgAnalysisTime,
      completionRate: totalFrames > 0 ? (analyzedFrames / totalFrames) * 100 : 0,
      passRate: analyzedFrames > 0 ? (passedFrames / analyzedFrames) * 100 : 0
    }
  }, [frames, qaResults])

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600'
    if (score >= 0.8) return 'text-blue-600'
    if (score >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 size={20} />
              QA Summary Dashboard
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onExportReport} size="sm">
                Export Report
              </Button>
              {analytics.failedFrames > 0 && (
                <Button 
                  variant="destructive" 
                  onClick={onRetryFailedFrames}
                  size="sm"
                  className="gap-2"
                >
                  <XCircle size={16} />
                  Retry Failed ({analytics.failedFrames})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Frames</p>
                <p className="text-2xl font-bold">{analytics.totalFrames}</p>
              </div>
              <Eye size={24} className="text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(analytics.avgScore)}`}>
                  {(analytics.avgScore * 100).toFixed(1)}%
                </p>
              </div>
              <TrendingUp size={24} className={getScoreColor(analytics.avgScore)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pass Rate</p>
                <p className={`text-2xl font-bold ${analytics.passRate >= 80 ? 'text-green-600' : 'text-red-600'}`}>
                  {analytics.passRate.toFixed(1)}%
                </p>
              </div>
              <CheckCircle size={24} className={analytics.passRate >= 80 ? 'text-green-600' : 'text-red-600'} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Issues</p>
                <p className="text-2xl font-bold text-red-600">{analytics.allIssues.length}</p>
              </div>
              <AlertTriangle size={24} className="text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress and Analysis Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Analysis Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Completion</span>
                <span className="text-sm font-mono">
                  {analytics.analyzedFrames}/{analytics.totalFrames}
                </span>
              </div>
              <Progress value={analytics.completionRate} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Quality Pass Rate</span>
                <span className="text-sm font-mono">{analytics.passRate.toFixed(1)}%</span>
              </div>
              <Progress value={analytics.passRate} />
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock size={16} />
                Avg analysis time: {(analytics.avgAnalysisTime / 1000).toFixed(1)}s per frame
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Excellent (90%+)</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">{analytics.scoreDistribution.excellent}</span>
                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500"
                      style={{ 
                        width: `${(analytics.scoreDistribution.excellent / analytics.analyzedFrames) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Good (80-89%)</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">{analytics.scoreDistribution.good}</span>
                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500"
                      style={{ 
                        width: `${(analytics.scoreDistribution.good / analytics.analyzedFrames) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Fair (60-79%)</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">{analytics.scoreDistribution.fair}</span>
                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500"
                      style={{ 
                        width: `${(analytics.scoreDistribution.fair / analytics.analyzedFrames) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Poor (&lt;60%)</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">{analytics.scoreDistribution.poor}</span>
                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500"
                      style={{ 
                        width: `${(analytics.scoreDistribution.poor / analytics.analyzedFrames) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Issues Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Issues by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.issuesByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm capitalize">
                    {type.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      {count}
                    </Badge>
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500"
                        style={{ 
                          width: `${(count / analytics.allIssues.length) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Issues by Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.issuesBySeverity).map(([severity, count]) => (
                <div key={severity} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm capitalize">{severity}</span>
                    <Badge variant={getSeverityBadge(severity)} className="text-xs">
                      {severity}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-mono ${getSeverityColor(severity)}`}>
                      {count}
                    </span>
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          severity === 'critical' ? 'bg-red-600' :
                          severity === 'high' ? 'bg-orange-500' :
                          severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}
                        style={{ 
                          width: `${(count / analytics.allIssues.length) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quality Recommendations */}
      {analytics.avgScore < 0.8 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle size={20} />
              Quality Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-yellow-800">
              {analytics.avgScore < 0.6 && (
                <p>• Overall quality is below acceptable thresholds. Consider reviewing render parameters and physics accuracy.</p>
              )}
              {analytics.issuesBySeverity.critical > 0 && (
                <p>• {analytics.issuesBySeverity.critical} critical issues detected. These must be resolved before final render.</p>
              )}
              {analytics.passRate < 70 && (
                <p>• Pass rate is low ({analytics.passRate.toFixed(1)}%). Review failed frames and consider re-rendering with adjusted settings.</p>
              )}
              {Object.keys(analytics.issuesByType).length > 0 && (
                <p>• Most common issue types: {Object.entries(analytics.issuesByType)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 2)
                  .map(([type]) => type.replace(/_/g, ' '))
                  .join(', ')}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}