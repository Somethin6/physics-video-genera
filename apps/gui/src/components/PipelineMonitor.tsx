/**
 * Real-time Pipeline Monitor Component
 * Shows live pipeline execution with streaming updates
 */

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
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
  CheckCircle,
  AlertCircle,
  Clock
} from '@phosphor-icons/react'
import { 
  PhysicsVideoPipeline, 
  PipelineState, 
  PipelineArtifact,
  PhysicsVideoRequest 
} from '@/lib/pipeline-orchestrator'

interface PipelineStats {
  cpuUsage: number
  gpuUsage: number
  ramUsage: number
  vramUsage: number
}

interface PipelineMonitorProps {
  request?: PhysicsVideoRequest
  onComplete: (videoPath: string) => void
}

const defaultConfig = {
  llmModel: 'gpt-neox-20b-q4',
  maxGpuLayers: 28,
  renderQuality: 'preview' as const,
  audioSampleRate: 48000,
  targetFrameRate: 30,
  outputResolution: { width: 1920, height: 1080 },
  ocioConfig: 'config/ocio/config.ocio',
  enableOptiX: true,
  nvencPreset: 'p7'
}

const PipelineMonitor: React.FC<PipelineMonitorProps> = ({ request, onComplete }) => {
  const [pipeline] = useState(() => new PhysicsVideoPipeline(defaultConfig))
  const [state, setState] = useState<PipelineState>(pipeline.getState())
  const [isRunning, setIsRunning] = useState(false)
  const [artifacts, setArtifacts] = useState<PipelineArtifact[]>([])
  const [systemStats, setSystemStats] = useState<PipelineStats>({
    cpuUsage: 0,
    gpuUsage: 0,
    ramUsage: 0,
    vramUsage: 0
  })

  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleStateUpdate = (newState: PipelineState) => {
      setState(newState)
      setArtifacts(newState.artifacts)
      
      console.log('New pipeline state:', newState)
    }

    const handleArtifactCreated = (artifact: PipelineArtifact) => {
      console.log('New artifact:', artifact)
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
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Auto-scroll logs to bottom
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [state.logs])

  const handleStart = async () => {
    if (!request) return
    
    setIsRunning(true)
    try {
      const result = await pipeline.generateVideo(request)
      onComplete(result)
      console.log('Pipeline completed successfully')
    } catch (error) {
      console.error('Pipeline failed:', error)
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
    setArtifacts([])
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Physics Video Pipeline
            {getStatusIcon(state.status)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleStart} 
              disabled={isRunning || !request}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Start Pipeline
            </Button>
            <Button 
              onClick={handleStop} 
              disabled={!isRunning}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Stop className="h-4 w-4" />
              Stop
            </Button>
            <Button 
              onClick={handleReset} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress: Step {state.currentStep} of {state.totalSteps}</span>
              <span>{Math.round(state.progress)}%</span>
            </div>
            <Progress value={state.progress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {state.currentOperation || getStepName(state.currentStep)}
            </p>
          </div>

          <Badge variant={state.status === 'error' ? 'destructive' : 'default'}>
            {state.status}
          </Badge>
        </CardContent>
      </Card>

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-1 font-mono text-sm">
                  {state.logs.map((log, index) => (
                    <div key={index} className={`
                      ${log.level === 'error' ? 'text-red-500' : ''}
                      ${log.level === 'warn' ? 'text-yellow-500' : ''}
                      ${log.level === 'info' ? 'text-blue-500' : ''}
                    `}>
                      <span className="text-muted-foreground">
                        [{new Date(log.timestamp).toLocaleTimeString()}]
                      </span>
                      {' '}
                      {log.message}
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="artifacts">
          <Card>
            <CardHeader>
              <CardTitle>Generated Artifacts ({artifacts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {artifacts.map((artifact) => (
                  <div key={artifact.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{artifact.id}</div>
                        <div className="text-sm text-muted-foreground">
                          {artifact.type} • {(artifact.size / 1024 / 1024).toFixed(1)}MB
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {artifacts.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    No artifacts generated yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Monitor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CPU Usage</span>
                    <span>{Math.round(systemStats.cpuUsage)}%</span>
                  </div>
                  <Progress value={systemStats.cpuUsage} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>GPU Usage</span>
                    <span>{Math.round(systemStats.gpuUsage)}%</span>
                  </div>
                  <Progress value={systemStats.gpuUsage} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>RAM Usage</span>
                    <span>{Math.round(systemStats.ramUsage)}%</span>
                  </div>
                  <Progress value={systemStats.ramUsage} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>VRAM Usage</span>
                    <span>{Math.round(systemStats.vramUsage)}%</span>
                  </div>
                  <Progress value={systemStats.vramUsage} className="h-2" />
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