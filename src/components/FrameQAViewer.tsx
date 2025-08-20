import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Eye, Play, AlertTriangle, CheckCircle, XCircle, Clock } from '@phosphor-icons/react'
import { Project, QAIssue } from '@/lib/types'

interface FrameQAViewerProps {
  project: Project
  onUpdateProject: (project: Project) => void
}

/**
 * Frame-by-frame QA analysis viewer component
 * Displays detailed quality analysis results for rendered frames
 */
export default function FrameQAViewer({ project, onUpdateProject }: FrameQAViewerProps) {
  const [selectedIssue, setSelectedIssue] = useState<QAIssue | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const qaAnalysis = project.qaAnalysis

  const startFrameAnalysis = async () => {
    setIsAnalyzing(true)
    
    // Simulate frame-by-frame analysis
    const analysisPrompt = spark.llmPrompt`
    Analyze rendered physics video frames for quality issues.
    Focus on: equation legibility, motion continuity, visual clarity, timing accuracy.
    Project topic: ${project.topic}
    Duration: ${project.duration} minutes
    
    Provide specific frame-level feedback for improvements.
    `
    
    try {
      const analysisResult = await spark.llm(analysisPrompt)
      
      // Simulate QA results
      const mockIssues: QAIssue[] = [
        {
          id: 'issue-1',
          type: 'equation-legibility',
          severity: 'medium',
          frameNumber: 245,
          timestamp: 8.17,
          description: 'Equation ∇×E = -∂B/∂t partially obscured by motion blur',
          suggestedFix: 'Increase equation display duration by 0.3s',
          status: 'detected'
        },
        {
          id: 'issue-2', 
          type: 'motion-continuity',
          severity: 'low',
          frameNumber: 612,
          timestamp: 20.4,
          description: 'Minor jitter in vector field animation',
          suggestedFix: 'Apply temporal smoothing to vector field keyframes',
          status: 'detected'
        }
      ]

      const updatedProject: Project = {
        ...project,
        qaAnalysis: {
          frameCount: 1800,
          analyzedFrames: 1800,
          issues: mockIssues,
          overallScore: 92,
          lastAnalyzed: new Date().toISOString(),
          metrics: {
            visualQuality: 94,
            equationLegibility: 89,
            motionContinuity: 95,
            timingAccuracy: 91,
            overallScore: 92
          }
        },
        status: 'qa-analysis'
      }
      
      onUpdateProject(updatedProject)
    } catch (error) {
      console.error('QA Analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'fixing': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'detected': return <AlertTriangle className="h-4 w-4 text-orange-500" />
      default: return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye size={20} />
              Frame QA Analysis
            </CardTitle>
            <Button 
              onClick={startFrameAnalysis}
              disabled={isAnalyzing}
              className="gap-2"
            >
              <Play size={16} />
              {isAnalyzing ? 'Analyzing...' : 'Analyze Frames'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {qaAnalysis ? (
            <>
              {/* Overall Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{qaAnalysis.metrics.visualQuality}</div>
                  <div className="text-sm text-muted-foreground">Visual Quality</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{qaAnalysis.metrics.equationLegibility}</div>
                  <div className="text-sm text-muted-foreground">Equation Legibility</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{qaAnalysis.metrics.motionContinuity}</div>
                  <div className="text-sm text-muted-foreground">Motion Continuity</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{qaAnalysis.metrics.timingAccuracy}</div>
                  <div className="text-sm text-muted-foreground">Timing Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{qaAnalysis.metrics.overallScore}</div>
                  <div className="text-sm text-muted-foreground">Overall Score</div>
                </div>
              </div>

              <Separator />

              {/* Frame Analysis Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Frames Analyzed</span>
                  <span>{qaAnalysis.analyzedFrames} / {qaAnalysis.frameCount}</span>
                </div>
                <Progress 
                  value={(qaAnalysis.analyzedFrames / qaAnalysis.frameCount) * 100} 
                  className="h-2"
                />
              </div>

              <Separator />

              {/* Issues List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Detected Issues</h3>
                  <Badge variant="outline">
                    {qaAnalysis.issues.length} issues
                  </Badge>
                </div>

                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {qaAnalysis.issues.map((issue) => (
                      <Card 
                        key={issue.id}
                        className={`cursor-pointer transition-colors ${
                          selectedIssue?.id === issue.id ? 'ring-2 ring-ring' : ''
                        }`}
                        onClick={() => setSelectedIssue(issue)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(issue.status)}
                                <Badge variant={getSeverityColor(issue.severity)}>
                                  {issue.severity}
                                </Badge>
                                <Badge variant="outline">
                                  {issue.type}
                                </Badge>
                              </div>
                              <p className="text-sm font-medium">{issue.description}</p>
                              <div className="text-xs text-muted-foreground">
                                Frame {issue.frameNumber} • {issue.timestamp.toFixed(2)}s
                              </div>
                              {issue.suggestedFix && (
                                <p className="text-xs text-accent">
                                  Suggested fix: {issue.suggestedFix}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Eye size={48} className="mx-auto mb-4 opacity-50" />
              <p>No QA analysis available</p>
              <p className="text-sm">Click "Analyze Frames" to start quality assessment</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Issue Detail Panel */}
      {selectedIssue && (
        <Card>
          <CardHeader>
            <CardTitle>Issue Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <p className="text-sm text-muted-foreground">{selectedIssue.type}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Severity</label>
                <p className="text-sm text-muted-foreground">{selectedIssue.severity}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Frame</label>
                <p className="text-sm text-muted-foreground">{selectedIssue.frameNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Timestamp</label>
                <p className="text-sm text-muted-foreground">{selectedIssue.timestamp.toFixed(2)}s</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <p className="text-sm text-muted-foreground mt-1">{selectedIssue.description}</p>
            </div>
            {selectedIssue.suggestedFix && (
              <div>
                <label className="text-sm font-medium">Suggested Fix</label>
                <p className="text-sm text-accent mt-1">{selectedIssue.suggestedFix}</p>
              </div>
            )}
            <div className="flex gap-2 pt-4">
              <Button variant="outline" size="sm">
                Apply Fix
              </Button>
              <Button variant="outline" size="sm">
                Ignore Issue
              </Button>
              <Button variant="outline" size="sm">
                Mark Resolved
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}