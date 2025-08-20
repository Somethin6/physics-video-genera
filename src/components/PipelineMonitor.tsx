/**
 * Real-time Pipeline Monitor Component
 * Shows live pipeline execution with streaming updates
 */

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigg
  Play, 
  RotateCcw, 
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

  PipelineStat
  PhysicsVideo
  Pipeli

  request?:
}

  maxGpuLayers: 28,
  audioSampleRate
  outputResolution
  enableOptiX: true,
}
const PipelineMoni
  onComplete 

  const [isRunning, setIsRunning
  const [artifacts, setArtifact
    cpuUsage: 0,
 

  const logsEndRef = useRef<HTMLDivElem
  useEffect(() => {
      setState(newS
      setArtifacts(newState

      console.log('New

    pipeline.addEventListene
    return () => {
      pipeline.remo
 

    const interval = setInterval(() => {
        cpu
        ramUs
      }

  }, [])
  useEffect(() => {
  }, [logs])
  const handleStart = async () => {

    try {
      onComplete
      console.er
      setIsRunni
  }

    // In real implementation, would stop the pip

    setState(pipeli
    setArtifacts([])
  }
  const getStatusIcon = (sta
      case 'complete':
     

      default:
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

          {/* System Stats */}
            <div className="text-
              <div
                CPU
            </div>
              <div className="text-2xl font-mono">{Math.round(systemStats.g
   

          
              <div className="t
                RAM
            
              <div c
                <Settings size={12} />
              </div>
          </div>
      </Card>
      {/* Pipeline Details */}
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
        </TabsList>
        <TabsContent
            <CardH
            
              </CardTitle>
            <CardConte
                <div className="space-
                    <div className="text-muted-f
                    </div>
               
                        <Badge 
                     
                       
                      
                            {new Date
                          <div>{log.m
                      </div>
                  )}
               
            </CardContent>
        </TabsConten
        <TabsContent va
            <CardHeade
                <Download size={20} /
              </CardTitle>
            <CardContent>
               
                    No artifacts genera
                ) : (
                    <di
                  
                
                     
        
                      <div className="text-
                        <div classN
                    </div>
                )}
            </CardContent>
        </TabsContent>
        <TabsConte
            <CardHeader>
                

            <CardContent>
                <div>
                  <div className="space-y-1 text-muted-foreground">
                    <div>GPU Layers: {defaultConfig.maxGpuL
                

                  <div classNa
                    <div>Resolution: {defaultConfig.outputResolu
                    <div>Audio: {defaultC
                  </div>
              </div>
          </Card>
      </Tabs>
  )





















































































































































