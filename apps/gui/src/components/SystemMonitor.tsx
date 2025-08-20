import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Cpu, HardDrive, Thermometer, Monitor, Lightning, Database, Activity } from 'lucide-react'
import { SystemMetrics } from '@/lib/types'

export default function SystemMonitor() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    gpu: { usage: 0, memory: 0, temperature: 0 },
    cpu: { usage: 0, memory: 0 },
    models: { neox20b: 'loading', llava: 'loading', whisper: 'loading' },
    pipeline: { activeProjects: 0, queueLength: 0, avgRenderTime: 0 }
  })

  // Simulate real-time metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(current => ({
        ...current,
        gpu: {
          usage: Math.max(0, Math.min(100, current.gpu.usage + (Math.random() - 0.5) * 10)),
          memory: Math.max(0, Math.min(11, current.gpu.memory + (Math.random() - 0.5) * 0.5)),
          temperature: Math.max(30, Math.min(85, current.gpu.temperature + (Math.random() - 0.5) * 3))
        },
        cpu: {
          usage: Math.max(0, Math.min(100, current.cpu.usage + (Math.random() - 0.5) * 15)),
          memory: Math.max(0, Math.min(32, current.cpu.memory + (Math.random() - 0.5) * 1))
        }
      }))
    }, 2000)

    // Initialize with realistic values
    setMetrics({
      gpu: { usage: 25, memory: 8.2, temperature: 65 },
      cpu: { usage: 45, memory: 16.8 },
      models: { neox20b: 'ready', llava: 'ready', whisper: 'ready' },
      pipeline: { activeProjects: 1, queueLength: 2, avgRenderTime: 4.2 }
    })

    return () => clearInterval(interval)
  }, [])

  const getModelStatus = (status: 'loading' | 'ready' | 'error') => {
    switch (status) {
      case 'ready': return { color: 'bg-green-500', text: 'Ready' }
      case 'loading': return { color: 'bg-blue-500', text: 'Loading' }
      case 'error': return { color: 'bg-red-500', text: 'Error' }
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Monitor size={16} />
              GPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-xs">
              <span>RTX 2080 Ti</span>
              <span className="font-mono">{metrics.gpu.usage.toFixed(0)}%</span>
            </div>
            <Progress value={metrics.gpu.usage} className="h-2" />
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-muted-foreground">VRAM</div>
                <div className="font-mono">{metrics.gpu.memory.toFixed(1)}/11 GB</div>
              </div>
              <div>
                <div className="text-muted-foreground">Temp</div>
                <div className="font-mono">{metrics.gpu.temperature.toFixed(0)}°C</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Cpu size={16} />
              CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-xs">
              <span>i9-9900KS</span>
              <span className="font-mono">{metrics.cpu.usage.toFixed(0)}%</span>
            </div>
            <Progress value={metrics.cpu.usage} className="h-2" />
            <div className="text-xs">
              <div className="text-muted-foreground">System RAM</div>
              <div className="font-mono">{metrics.cpu.memory.toFixed(1)}/32 GB</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database size={16} />
              Models
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(metrics.models).map(([model, status]) => {
              const statusInfo = getModelStatus(status)
              return (
                <div key={model} className="flex items-center justify-between text-xs">
                  <span className="capitalize">{model.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <div className="flex items-center gap-1">
                    <div className={`h-1.5 w-1.5 rounded-full ${statusInfo.color}`} />
                    <span>{statusInfo.text}</span>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity size={16} />
              Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Active</span>
              <span className="font-mono">{metrics.pipeline.activeProjects}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Queued</span>
              <span className="font-mono">{metrics.pipeline.queueLength}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Avg Render</span>
              <span className="font-mono">{metrics.pipeline.avgRenderTime.toFixed(1)}m</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-sans">Local AI Models</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="space-y-1">
                  <div className="font-medium">GPT-NeoX-20B (Q4_K_M)</div>
                  <div className="text-xs text-muted-foreground">Script generation & refinement</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={metrics.models.neox20b === 'ready' ? 'default' : 'secondary'}>
                    {getModelStatus(metrics.models.neox20b).text}
                  </Badge>
                  <div className="text-xs text-muted-foreground">12.8 GB</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="space-y-1">
                  <div className="font-medium">LLaVA Vision Model</div>
                  <div className="text-xs text-muted-foreground">Self-review & QA analysis</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={metrics.models.llava === 'ready' ? 'default' : 'secondary'}>
                    {getModelStatus(metrics.models.llava).text}
                  </Badge>
                  <div className="text-xs text-muted-foreground">4.1 GB</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="space-y-1">
                  <div className="font-medium">Whisper.cpp</div>
                  <div className="text-xs text-muted-foreground">Voice transcription & alignment</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={metrics.models.whisper === 'ready' ? 'default' : 'secondary'}>
                    {getModelStatus(metrics.models.whisper).text}
                  </Badge>
                  <div className="text-xs text-muted-foreground">245 MB</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-sans">Rendering Engines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="space-y-1">
                  <div className="font-medium">Manim Community</div>
                  <div className="text-xs text-muted-foreground">Mathematical animations & derivations</div>
                </div>
                <Badge variant="default">Ready</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="space-y-1">
                  <div className="font-medium">Blender (Headless)</div>
                  <div className="text-xs text-muted-foreground">3D rendering with OptiX acceleration</div>
                </div>
                <Badge variant="default">Ready</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="space-y-1">
                  <div className="font-medium">Taichi CUDA</div>
                  <div className="text-xs text-muted-foreground">Differentiable physics simulations</div>
                </div>
                <Badge variant="default">Ready</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="space-y-1">
                  <div className="font-medium">OTIO + NVENC</div>
                  <div className="text-xs text-muted-foreground">Timeline assembly & encoding</div>
                </div>
                <Badge variant="default">Ready</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-sans flex items-center justify-between">
            System Performance
            <Button size="sm" variant="outline">
              <ArrowsClockwise size={14} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="text-sm font-medium">GPU Utilization</div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>CUDA Cores</span>
                  <span className="font-mono">{metrics.gpu.usage.toFixed(0)}%</span>
                </div>
                <Progress value={metrics.gpu.usage} className="h-1.5" />
                <div className="flex justify-between text-xs">
                  <span>RT Cores (OptiX)</span>
                  <span className="font-mono">{Math.max(0, metrics.gpu.usage - 15).toFixed(0)}%</span>
                </div>
                <Progress value={Math.max(0, metrics.gpu.usage - 15)} className="h-1.5" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-medium">Memory Usage</div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>GPU Memory</span>
                  <span className="font-mono">{((metrics.gpu.memory / 11) * 100).toFixed(0)}%</span>
                </div>
                <Progress value={(metrics.gpu.memory / 11) * 100} className="h-1.5" />
                <div className="flex justify-between text-xs">
                  <span>System RAM</span>
                  <span className="font-mono">{((metrics.cpu.memory / 32) * 100).toFixed(0)}%</span>
                </div>
                <Progress value={(metrics.cpu.memory / 32) * 100} className="h-1.5" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-medium">Pipeline Status</div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Active Projects</span>
                  <span className="font-mono">{metrics.pipeline.activeProjects}</span>
                </div>
                <div className="flex justify-between">
                  <span>Queue Length</span>
                  <span className="font-mono">{metrics.pipeline.queueLength}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Render Time</span>
                  <span className="font-mono">{metrics.pipeline.avgRenderTime.toFixed(1)}m</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-sans">Hardware Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Cpu size={20} />
                <div>
                  <div className="font-medium">Intel i9-9900KS</div>
                  <div className="text-xs text-muted-foreground">8 cores @ 4.0-5.0 GHz</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Monitor size={20} />
                <div>
                  <div className="font-medium">NVIDIA RTX 2080 Ti</div>
                  <div className="text-xs text-muted-foreground">11GB GDDR6, 4352 CUDA cores</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <HardDrive size={20} />
                <div>
                  <div className="font-medium">32 GB DDR4 RAM</div>
                  <div className="text-xs text-muted-foreground">High-capacity model loading</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-sans">Pipeline Optimization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 rounded-lg border border-accent/20 bg-accent/5">
                <div className="flex items-center gap-2 mb-2">
                  <Lightning size={16} className="text-accent" />
                  <span className="text-sm font-medium">OptiX Acceleration</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  RT cores active for Blender Cycles rendering
                </div>
              </div>

              <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <Database size={16} className="text-green-500" />
                  <span className="text-sm font-medium">CUDA Acceleration</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Taichi, Whisper.cpp, and llama.cpp using GPU
                </div>
              </div>

              <div className="p-3 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Thermometer size={16} />
                  <span className="text-sm font-medium">Thermal Status</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Operating within safe temperature ranges
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-sans">Performance Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-green-600">Optimized Settings</div>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• NeoX-20B Q4_K_M quantization for quality/speed balance</li>
                <li>• Blender OptiX denoising enabled for RTX acceleration</li>
                <li>• Taichi CUDA backend for physics simulations</li>
                <li>• NVENC hardware encoding with B-frame references</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium text-blue-600">Current Configuration</div>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Model context: 2048 tokens (adjustable)</li>
                <li>• Render quality: Standard (configurable per project)</li>
                <li>• Batch size: Auto-scaled based on VRAM usage</li>
                <li>• QA threshold: 85% SSIM + LLaVA approval</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}