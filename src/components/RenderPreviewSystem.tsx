import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Play, Pause, SkipBack, SkipForward, Microscope, Eye, GitCompare, BarChart3, Cpu } from '@phosphor-icons/react'
import { RenderFrame, FrameIssue, Shot } from '@/lib/types'
import { useRenderPreview, generateMockFrames } from '@/lib/renderAnalysis'
import FrameViewer from '@/components/FrameViewer'
import QualityAnalysis from '@/components/QualityAnalysis'
import ComparisonView from '@/components/ComparisonView'
import FrameAnalyzer from '@/components/FrameAnalyzer'
import QADashboard from '@/components/QADashboard'
import AutoFixEngine from '@/components/AutoFixEngine'
import QAMetricsView from '@/components/QAMetricsView'
import RenderQAEngine from '@/components/RenderQAEngine'

interface RenderPreviewSystemProps {
  shot: Shot
  onClose: () => void
}

export default function RenderPreviewSystem({ shot, onClose }: RenderPreviewSystemProps) {
  const {
    frames,
    setFrames,
    currentFrame,
    setCurrentFrame,
    analysisResults,
    isAnalyzing,
    analyzeCurrentFrame,
    analyzeAllFrames
  } = useRenderPreview(shot.id)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [activeTab, setActiveTab] = useState('preview')
  
  // Initialize with mock frames if empty
  useEffect(() => {
    if (frames.length === 0) {
      setFrames(generateMockFrames(shot.id, 120))
    }
  }, [shot.id, frames.length, setFrames])
  
  // Playback control
  useEffect(() => {
    if (!isPlaying || frames.length === 0) return
    
    const interval = setInterval(() => {
      setCurrentFrame(prev => {
        const next = prev + 1
        if (next >= frames.length) {
          setIsPlaying(false)
          return 0
        }
        return next
      })
    }, (1000 / 30) / playbackSpeed) // 30fps adjusted by playback speed
    
    return () => clearInterval(interval)
  }, [isPlaying, playbackSpeed, frames.length, setCurrentFrame])
  
  const currentFrameData = frames[currentFrame]
  const progress = frames.length > 0 ? (currentFrame / (frames.length - 1)) * 100 : 0
  const issueCount = currentFrameData?.issues?.length || 0
  const hasIssues = issueCount > 0
  const qaScore = currentFrameData?.qaScore
  
  const handleFrameSeek = (value: number[]) => {
    const frameIndex = Math.floor((value[0] / 100) * (frames.length - 1))
    setCurrentFrame(frameIndex)
  }
  
  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }
  
  const skipFrames = (direction: 'forward' | 'backward', count: number = 1) => {
    setCurrentFrame(prev => {
      if (direction === 'forward') {
        return Math.min(prev + count, frames.length - 1)
      } else {
        return Math.max(prev - count, 0)
      }
    })
  }
  
  return (
    <div className=\"fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col\">
      <div className=\"border-b border-border bg-card p-4\">
        <div className=\"flex items-center justify-between\">
          <div>
            <h2 className=\"text-xl font-semibold text-card-foreground\">Render Preview</h2>
            <p className=\"text-sm text-muted-foreground\">{shot.title} • {frames.length} frames</p>
          </div>
          <div className=\"flex items-center gap-4\">
            {qaScore && (
              <div className=\"flex items-center gap-2\">
                <span className=\"text-sm text-muted-foreground\">QA Score:</span>
                <Badge 
                  variant={qaScore > 0.8 ? \"default\" : qaScore > 0.6 ? \"secondary\" : \"destructive\"}
                  className=\"font-mono\"
                >
                  {(qaScore * 100).toFixed(1)}%
                </Badge>
              </div>
            )}
            <Button variant=\"outline\" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
      
      <div className=\"flex-1 flex overflow-hidden\">
        <div className=\"flex-1 flex flex-col\">
          <Tabs value={activeTab} onValueChange={setActiveTab} className=\"flex-1 flex flex-col\">
            <div className=\"border-b border-border px-4\">
              <TabsList>
                <TabsTrigger value="preview" className="gap-2">
                  <Eye size={16} />
                  Frame Preview
                </TabsTrigger>
                <TabsTrigger value="analysis" className="gap-2">
                  <Microscope size={16} />
                  Quality Analysis
                </TabsTrigger>
                <TabsTrigger value="metrics" className="gap-2">
                  <BarChart3 size={16} />
                  Metrics
                </TabsTrigger>
                <TabsTrigger value="comparison" className="gap-2">
                  <GitCompare size={16} />
                  Comparison
                </TabsTrigger>
                <TabsTrigger value="engine" className="gap-2">
                  <Cpu size={16} />
                  QA Engine
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className=\"flex-1 overflow-hidden\">
              <TabsContent value=\"preview\" className=\"h-full m-0\">
                <FrameViewer 
                  frame={currentFrameData}
                  showIssueOverlays={true}
                  className=\"h-full\"
                />
              </TabsContent>
              
              <TabsContent value="analysis" className="h-full m-0 p-4 overflow-auto">
                <div className="space-y-6">
                  <FrameAnalyzer
                    shotId={shot.id}
                    frames={frames.map(f => f.imageUrl)}
                    scriptChecks={[
                      "Are mathematical equations clearly visible and correct?",
                      "Do vector arrows point in the correct direction?", 
                      "Is the physics demonstration accurate to the script?",
                      "Are visual elements properly aligned and positioned?"
                    ]}
                    onAnalysisComplete={(analysis) => {
                      console.log('Frame analysis complete:', analysis)
                    }}
                  />
                  
                  <QADashboard
                    shotId={shot.id}
                    onTriggerCodeRevision={(issues) => {
                      console.log('Triggering code revision for issues:', issues)
                    }}
                  />
                  
                  <AutoFixEngine
                    shotId={shot.id}
                    issues={currentFrameData?.issues?.map(i => i.description) || []}
                    onRevisionComplete={(revision) => {
                      console.log('Code revision complete:', revision)
                    }}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="metrics" className="h-full m-0 p-4 overflow-auto">
                <QAMetricsView
                  shotId={shot.id}
                  onRefreshMetrics={() => {
                    console.log('Refreshing QA metrics for shot:', shot.id)
                  }}
                />
              </TabsContent>
              
              <TabsContent value="comparison" className="h-full m-0">
                <ComparisonView 
                  frames={frames}
                  currentFrame={currentFrame}
                  onFrameChange={setCurrentFrame}
                />
              </TabsContent>
              
              <TabsContent value="engine" className="h-full m-0 p-4 overflow-auto">
                <RenderQAEngine
                  shotId={shot.id}
                  onAnalysisComplete={(results) => {
                    console.log('Vision QA analysis complete:', results)
                  }}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
        
        {/* Analysis Panel */}
        <div className=\"w-80 border-l border-border bg-card/50 flex flex-col\">
          <div className=\"p-4 border-b border-border\">
            <h3 className=\"font-medium text-card-foreground mb-3\">Analysis Tools</h3>
            <div className=\"space-y-3\">
              <Button 
                onClick={analyzeCurrentFrame}
                disabled={isAnalyzing || !currentFrameData}
                className=\"w-full gap-2\"
                variant=\"outline\"
              >
                <Microscope size={16} />
                Analyze Current Frame
              </Button>
              
              <Button 
                onClick={analyzeAllFrames}
                disabled={isAnalyzing || frames.length === 0}
                className=\"w-full gap-2\"
              >
                <Microscope size={16} />
                {isAnalyzing ? 'Analyzing...' : 'Analyze All Frames'}
              </Button>
              
              {isAnalyzing && (
                <div className=\"space-y-2\">
                  <Progress value={45} className=\"h-2\" />
                  <p className=\"text-xs text-muted-foreground text-center\">
                    Analyzing frame {currentFrame + 1} of {frames.length}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Current Frame Info */}
          {currentFrameData && (
            <div className=\"p-4 border-b border-border\">
              <h4 className=\"font-medium text-sm text-card-foreground mb-2\">Frame Details</h4>
              <div className=\"space-y-2 text-xs\">
                <div className=\"flex justify-between\">
                  <span className=\"text-muted-foreground\">Frame:</span>
                  <span className=\"font-mono\">{currentFrame + 1}/{frames.length}</span>
                </div>
                <div className=\"flex justify-between\">
                  <span className=\"text-muted-foreground\">Time:</span>
                  <span className=\"font-mono\">{(currentFrameData.timestamp / 1000).toFixed(2)}s</span>
                </div>
                <div className=\"flex justify-between\">
                  <span className=\"text-muted-foreground\">Renderer:</span>
                  <span className=\"font-mono\">{currentFrameData.metadata.renderer}</span>
                </div>
                {qaScore && (
                  <div className=\"flex justify-between\">
                    <span className=\"text-muted-foreground\">QA Score:</span>
                    <span className=\"font-mono\">{(qaScore * 100).toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Issues List */}
          {hasIssues && (
            <div className=\"flex-1 p-4 overflow-auto\">
              <h4 className=\"font-medium text-sm text-card-foreground mb-2\">
                Issues ({issueCount})
              </h4>
              <div className=\"space-y-2\">
                {currentFrameData.issues?.map((issue) => (
                  <Card key={issue.id} className=\"p-3\">
                    <div className=\"space-y-2\">
                      <div className=\"flex items-center justify-between\">
                        <Badge 
                          variant={
                            issue.severity === 'critical' ? 'destructive' :
                            issue.severity === 'high' ? 'destructive' :
                            issue.severity === 'medium' ? 'secondary' : 'default'
                          }
                          className=\"text-xs\"
                        >
                          {issue.severity}
                        </Badge>
                        <span className=\"text-xs text-muted-foreground font-mono\">
                          {(issue.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className=\"text-sm\">{issue.description}</p>
                      <p className=\"text-xs text-muted-foreground\">{issue.suggestion}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Playback Controls */}
      <div className=\"border-t border-border bg-card p-4\">
        <div className=\"space-y-4\">
          <div className=\"flex items-center gap-4\">
            <Button
              variant=\"outline\"
              size=\"sm\"
              onClick={() => skipFrames('backward', 10)}
              disabled={currentFrame === 0}
            >
              <SkipBack size={16} />
            </Button>
            
            <Button
              variant=\"outline\"
              onClick={togglePlayback}
              disabled={frames.length === 0}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </Button>
            
            <Button
              variant=\"outline\"
              size=\"sm\"
              onClick={() => skipFrames('forward', 10)}
              disabled={currentFrame >= frames.length - 1}
            >
              <SkipForward size={16} />
            </Button>
            
            <div className=\"flex-1\">
              <Slider
                value={[progress]}
                onValueChange={handleFrameSeek}
                max={100}
                step={0.1}
                className=\"w-full\"
              />
            </div>
            
            <div className=\"flex items-center gap-2\">
              <span className=\"text-xs text-muted-foreground\">Speed:</span>
              <select 
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                className=\"text-xs bg-background border border-border rounded px-2 py-1\"
              >
                <option value={0.25}>0.25x</option>
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={2}>2x</option>
                <option value={4}>4x</option>
              </select>
            </div>
          </div>
          
          <div className=\"text-center text-xs text-muted-foreground font-mono\">
            Frame {currentFrame + 1} / {frames.length} • 
            {frames.length > 0 ? (frames[frames.length - 1].timestamp / 1000).toFixed(2) : '0.00'}s total
          </div>
        </div>
      </div>
    </div>
  )
}