/**
 * Real-time Pipeline Monitor Component
 * Shows live pipeline execution with streaming updates
 */

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Play, 
  Stop, 
  RotateCcw, 
  Download, 
  Activity,
  Brain,
  Video,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  Cpu,
  HardDrive
} from '@phosphor-icons/react'

import PhysicsVideoPipeline, { 
  PipelineState, 
  PipelineConfig, 
  PhysicsVideoRequest,
  PipelineLogEntry,
  PipelineArtifact
} from '@/lib/pipeline-orchestrator'

interface PipelineMonitorProps {
  request?: PhysicsVideoRequest
  onComplete?: (videoPath: string) => void
}

const defaultConfig: PipelineConfig = {
  llmModel: 'gpt-neox-20b-q4_k_m.gguf',
  maxGpuLayers: 28,
  renderQuality: 'preview',
  audioSampleRate: 48000,
  targetFrameRate: 60,
  outputResolution: { width: 1920, height: 1080 },
  ocioConfig: 'filmic-srgb',
  enableOptiX: true,
  nvencPreset: 'p7'
}

const PipelineMonitor: React.FC<PipelineMonitorProps> = ({ 
  request, 
  onComplete 
}) => {
  const [pipeline] = useState(() => new PhysicsVideoPipeline(defaultConfig))
  const [state, setState] = useState<PipelineState>(pipeline.getState())
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState<PipelineLogEntry[]>([])
  const [artifacts, setArtifacts] = useState<PipelineArtifact[]>([])
  const [systemStats, setSystemStats] = useState({
    cpuUsage: 0,
    gpuUsage: 0,
    ramUsage: 0,
    vramUsage: 0
  })

  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleStateUpdate = (newState: PipelineState) => {
      setState(newState)
      setLogs(newState.logs)
      setArtifacts(newState.artifacts)
    }

    const handleArtifactCreated = (artifact: PipelineArtifact) => {
      console.log('New artifact created:', artifact)
    }

    pipeline.addEventListener('stateUpdate', handleStateUpdate)
    pipeline.addEventListener('artifactCreated', handleArtifactCreated)

    return () => {
      pipeline.removeEventListener('stateUpdate', handleStateUpdate)
      pipeline.removeEventListener('artifactCreated', handleArtifactCreated)
    }
  }, [pipeline])

  useEffect(() => {
    // Simulate system stats updates
    const interval = setInterval(() => {
      setSystemStats({
        cpuUsage: Math.random() * 100,
        gpuUsage: Math.random() * 100,
        ramUsage: 60 + Math.random() * 30,
        vramUsage: 40 + Math.random() * 40
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const handleStart = async () => {
    if (!request) return

    setIsRunning(true)
    try {
      const result = await pipeline.generateVideo(request)
      onComplete?.(result)
    } catch (error) {
      console.error('Pipeline error:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const handleStop = () => {
    setIsRunning(false)
    // In real implementation, would stop the pipeline
  }

  const handleReset = () => {
    setState(pipeline.getState())
    setLogs([])
    setArtifacts([])
    setIsRunning(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'idle':
        return <Clock className="h-4 w-4 text-muted-foreground" />
      default:
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
    }
  }

  const getStepName = (step: number): string => {
    const steps = [
      'Initialize',
      'Generate Outline',
      'Create Script',
      'Plan Animations',
      'Generate Audio',
      'Render Scenes',
      'Quality Check',
      'Refine Renders',
      'Voice Alignment',
      'Final Assembly',
      'Export'
    ]
    return steps[step - 1] || 'Unknown'
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  return (
    <div className="space-y-6">
      {/* Pipeline Control */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(state.status)}
              <div>
                <CardTitle>Physics Video Pipeline</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {request ? `${request.topic} (${request.duration}s)` : 'No project loaded'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleStart} 
                disabled={!request || isRunning}
                className="gap-2"
              >
                <Play size={16} />
                Start
              </Button>
              <Button 
                onClick={handleStop} 
                disabled={!isRunning}
                variant="outline"
                className="gap-2"
              >
                <Stop size={16} />
                Stop
              </Button>
              <Button 
                onClick={handleReset}
                variant="outline"
                className="gap-2"
              >
                <RotateCcw size={16} />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Progress Overview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Step {state.currentStep}/11: {getStepName(state.currentStep)}</span>
              <span>{Math.round(state.progress)}%</span>
            </div>
            <Progress value={state.progress} className="h-2" />
          </div>

          {/* Current Operation */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity size={14} className={isRunning ? 'animate-pulse' : ''} />
            <span>{state.currentOperation || 'Idle'}</span>
          </div>

          {/* System Stats */}
          <div className="grid grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-mono">{Math.round(systemStats.cpuUsage)}%</div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Cpu size={12} />
                CPU
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-mono">{Math.round(systemStats.gpuUsage)}%</div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Video size={12} />
                GPU
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-mono">{Math.round(systemStats.ramUsage)}%</div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <HardDrive size={12} />
                RAM
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-mono">{Math.round(systemStats.vramUsage)}%</div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Settings size={12} />
                VRAM
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Details */}
      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="logs">Live Logs</TabsTrigger>
          <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain size={20} />
                Live Pipeline Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 w-full">
                <div className="space-y-2 font-mono text-sm">
                  {logs.length === 0 ? (
                    <div className="text-muted-foreground text-center py-8">
                      No logs yet. Start the pipeline to see live updates.
                    </div>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="flex items-start gap-3 p-2 rounded border">
                        <Badge 
                          variant={log.level === 'error' ? 'destructive' : 'outline'}
                          className="text-xs"
                        >
                          {log.source}
                        </Badge>
                        <div className="flex-1">
                          <div className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </div>
                          <div>{log.message}</div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={logsEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="artifacts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download size={20} />
                Generated Artifacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {artifacts.length === 0 ? (
                  <div className="text-muted-foreground text-center py-8">
                    No artifacts generated yet.
                  </div>
                ) : (
                  artifacts.map((artifact) => (
                    <div key={artifact.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{artifact.type}</Badge>
                        <div>
                          <div className="font-medium">{artifact.id}</div>
                          <div className="text-sm text-muted-foreground">
                            {artifact.path}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div>{formatBytes(artifact.size)}</div>
                        <div className="font-mono text-xs">{artifact.checksum.slice(0, 8)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings size={20} />
                Pipeline Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium mb-2">Model & Processing</div>
                  <div className="space-y-1 text-muted-foreground">
                    <div>LLM Model: {defaultConfig.llmModel}</div>
                    <div>GPU Layers: {defaultConfig.maxGpuLayers}</div>
                    <div>Render Quality: {defaultConfig.renderQuality}</div>
                    <div>OptiX Enabled: {defaultConfig.enableOptiX ? 'Yes' : 'No'}</div>
                  </div>
                </div>
                <div>
                  <div className="font-medium mb-2">Output Settings</div>
                  <div className="space-y-1 text-muted-foreground">
                    <div>Resolution: {defaultConfig.outputResolution.width}×{defaultConfig.outputResolution.height}</div>
                    <div>Frame Rate: {defaultConfig.targetFrameRate} fps</div>
                    <div>Audio: {defaultConfig.audioSampleRate} Hz</div>
                    <div>NVENC Preset: {defaultConfig.nvencPreset}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default PipelineMonitor