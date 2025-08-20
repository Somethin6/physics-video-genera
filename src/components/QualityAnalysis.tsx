import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Eye,
  Timer
} from '@phosphor-icons/react'
import { RenderFrame, QAResult, FrameIssue } from '@/lib/types'

interface QualityAnalysisProps {
  frames: RenderFrame[]
  analysisResults: QAResult[]
  currentFrame: number
  onFrameSelect: (frameIndex: number) => void
}

export default function QualityAnalysis({ 
  frames, 
  analysisResults, 
  currentFrame,
  onFrameSelect 
}: QualityAnalysisProps) {
  
  const analysis = useMemo(() => {
    const analyzedFrames = frames.filter(f => f.qaScore !== undefined)
    const totalIssues = frames.reduce((acc, f) => acc + (f.issues?.length || 0), 0)
    const avgScore = analyzedFrames.length > 0 
      ? analyzedFrames.reduce((acc, f) => acc + (f.qaScore || 0), 0) / analyzedFrames.length
      : 0
    
    const issuesByType = frames.reduce((acc, frame) => {
      frame.issues?.forEach(issue => {
        acc[issue.type] = (acc[issue.type] || 0) + 1
      })
      return acc
    }, {} as Record<string, number>)
    
    const issuesBySeverity = frames.reduce((acc, frame) => {
      frame.issues?.forEach(issue => {
        acc[issue.severity] = (acc[issue.severity] || 0) + 1
      })
      return acc
    }, {} as Record<string, number>)
    
    const frameQuality = frames.map((frame, index) => ({
      frameNumber: index,
      score: frame.qaScore || 0,
      issueCount: frame.issues?.length || 0,
      hasAnalysis: frame.qaScore !== undefined
    }))
    
    return {
      analyzedFrames: analyzedFrames.length,
      totalFrames: frames.length,
      avgScore,
      totalIssues,
      issuesByType,
      issuesBySeverity,
      frameQuality
    }
  }, [frames])
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive' 
      case 'medium': return 'secondary'
      case 'low': return 'default'
      default: return 'default'
    }
  }
  
  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-500'
    if (score >= 0.8) return 'bg-yellow-500'
    if (score >= 0.7) return 'bg-orange-500'
    return 'bg-red-500'
  }
  
  return (
    <div className=\"space-y-6\">
      {/* Overview Stats */}
      <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4\">
        <Card>
          <CardContent className=\"p-4\">
            <div className=\"flex items-center gap-3\">
              <div className=\"p-2 bg-primary/10 rounded-md\">
                <BarChart3 size={20} className=\"text-primary\" />
              </div>
              <div>
                <p className=\"text-sm text-muted-foreground\">Average Quality</p>
                <p className=\"text-2xl font-bold\">{(analysis.avgScore * 100).toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className=\"p-4\">
            <div className=\"flex items-center gap-3\">
              <div className=\"p-2 bg-accent/10 rounded-md\">
                <Eye size={20} className=\"text-accent\" />
              </div>
              <div>
                <p className=\"text-sm text-muted-foreground\">Analyzed</p>
                <p className=\"text-2xl font-bold\">{analysis.analyzedFrames}/{analysis.totalFrames}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className=\"p-4\">
            <div className=\"flex items-center gap-3\">
              <div className=\"p-2 bg-destructive/10 rounded-md\">
                <AlertTriangle size={20} className=\"text-destructive\" />
              </div>
              <div>
                <p className=\"text-sm text-muted-foreground\">Total Issues</p>
                <p className=\"text-2xl font-bold\">{analysis.totalIssues}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className=\"p-4\">
            <div className=\"flex items-center gap-3\">
              <div className=\"p-2 bg-green-500/10 rounded-md\">
                <CheckCircle size={20} className=\"text-green-500\" />
              </div>
              <div>
                <p className=\"text-sm text-muted-foreground\">Pass Rate</p>
                <p className=\"text-2xl font-bold\">
                  {analysis.analyzedFrames > 0 
                    ? ((analysis.frameQuality.filter(f => f.score > 0.8).length / analysis.analyzedFrames) * 100).toFixed(0)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quality Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className=\"flex items-center gap-2\">
            <TrendingUp size={20} />
            Frame Quality Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className=\"p-4\">
          <div className=\"space-y-4\">
            <div className=\"h-20 bg-muted rounded-md p-2 relative overflow-hidden\">
              {analysis.frameQuality.map((frame, index) => (
                <div
                  key={index}
                  className={`absolute top-0 bottom-0 cursor-pointer transition-all hover:opacity-80 ${\n                    index === currentFrame ? 'ring-2 ring-primary' : ''\n                  }`}
                  style={{\n                    left: `${(index / (analysis.totalFrames - 1)) * 100}%`,\n                    width: `${Math.max(1, 100 / analysis.totalFrames)}%`,\n                    backgroundColor: frame.hasAnalysis ? getScoreColor(frame.score) : '#6b7280'\n                  }}\n                  onClick={() => onFrameSelect(index)}\n                  title={`Frame ${frame.frameNumber}: ${(frame.score * 100).toFixed(1)}% • ${frame.issueCount} issues`}\n                />\n              ))}\n              \n              {/* Current frame indicator */}\n              <div \n                className=\"absolute top-0 bottom-0 w-1 bg-foreground pointer-events-none\"\n                style={{\n                  left: `${(currentFrame / (analysis.totalFrames - 1)) * 100}%`\n                }}\n              />\n            </div>\n            \n            <div className=\"flex justify-between text-xs text-muted-foreground\">\n              <span>Frame 1</span>\n              <span>Frame {analysis.totalFrames}</span>\n            </div>\n          </div>\n        </CardContent>\n      </Card>\n      \n      {/* Issues Breakdown */}\n      <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6\">\n        <Card>\n          <CardHeader>\n            <CardTitle>Issues by Type</CardTitle>\n          </CardHeader>\n          <CardContent className=\"space-y-3\">\n            {Object.entries(analysis.issuesByType).map(([type, count]) => (\n              <div key={type} className=\"flex items-center justify-between\">\n                <span className=\"text-sm capitalize\">{type.replace('_', ' ')}</span>\n                <Badge variant=\"outline\">{count}</Badge>\n              </div>\n            ))}\n            {Object.keys(analysis.issuesByType).length === 0 && (\n              <p className=\"text-muted-foreground text-sm\">No issues detected</p>\n            )}\n          </CardContent>\n        </Card>\n        \n        <Card>\n          <CardHeader>\n            <CardTitle>Issues by Severity</CardTitle>\n          </CardHeader>\n          <CardContent className=\"space-y-3\">\n            {Object.entries(analysis.issuesBySeverity).map(([severity, count]) => (\n              <div key={severity} className=\"flex items-center justify-between\">\n                <span className=\"text-sm capitalize\">{severity}</span>\n                <Badge variant={getSeverityColor(severity) as any}>{count}</Badge>\n              </div>\n            ))}\n            {Object.keys(analysis.issuesBySeverity).length === 0 && (\n              <p className=\"text-muted-foreground text-sm\">No issues detected</p>\n            )}\n          </CardContent>\n        </Card>\n      </div>\n      \n      {/* Current Frame Issues */}\n      {frames[currentFrame]?.issues && frames[currentFrame].issues!.length > 0 && (\n        <Card>\n          <CardHeader>\n            <CardTitle>Current Frame Issues</CardTitle>\n          </CardHeader>\n          <CardContent className=\"space-y-4\">\n            {frames[currentFrame].issues!.map((issue) => (\n              <Alert key={issue.id} className={issue.severity === 'critical' || issue.severity === 'high' ? 'border-destructive' : ''}>\n                <AlertTriangle size={16} />\n                <AlertDescription>\n                  <div className=\"space-y-2\">\n                    <div className=\"flex items-center justify-between\">\n                      <Badge variant={getSeverityColor(issue.severity) as any}>\n                        {issue.severity} • {issue.type.replace('_', ' ')}\n                      </Badge>\n                      <span className=\"text-xs text-muted-foreground font-mono\">\n                        {(issue.confidence * 100).toFixed(0)}% confidence\n                      </span>\n                    </div>\n                    <p className=\"font-medium\">{issue.description}</p>\n                    <p className=\"text-sm text-muted-foreground\">{issue.suggestion}</p>\n                    {issue.region && (\n                      <p className=\"text-xs text-muted-foreground font-mono\">\n                        Region: ({issue.region.x}, {issue.region.y}) {issue.region.width}×{issue.region.height}\n                      </p>\n                    )}\n                  </div>\n                </AlertDescription>\n              </Alert>\n            ))}\n          </CardContent>\n        </Card>\n      )}\n      \n      {/* Analysis History */}\n      {analysisResults.length > 0 && (\n        <Card>\n          <CardHeader>\n            <CardTitle className=\"flex items-center gap-2\">\n              <Timer size={20} />\n              Analysis History\n            </CardTitle>\n          </CardHeader>\n          <CardContent>\n            <div className=\"space-y-3\">\n              {analysisResults.slice(-5).reverse().map((result) => (\n                <div key={result.id} className=\"flex items-center justify-between p-3 bg-muted rounded-md\">\n                  <div className=\"space-y-1\">\n                    <div className=\"flex items-center gap-2\">\n                      <Badge variant=\"outline\">{result.analysisType}</Badge>\n                      <span className=\"text-sm text-muted-foreground\">\n                        {new Date(result.completedAt).toLocaleTimeString()}\n                      </span>\n                    </div>\n                    <p className=\"text-sm\">\n                      {result.passedFrames}/{result.frameCount} frames passed • \n                      {result.issues.length} issues found\n                    </p>\n                  </div>\n                  <div className=\"text-right\">\n                    <p className=\"font-bold\">{(result.overallScore * 100).toFixed(1)}%</p>\n                    <p className=\"text-xs text-muted-foreground\">\n                      {(result.processingTime / 1000).toFixed(1)}s\n                    </p>\n                  </div>\n                </div>\n              ))}\n            </div>\n          </CardContent>\n        </Card>\n      )}\n    </div>\n  )\n}