/**
 * Enhanced System Monitor with Observability Stack
 * Shows comprehensive real-time metrics, traces, and health status
 */

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  Eye,
  HardDrive,
  Monitor,
  Thermometer,
  Zap,
  TrendingUp,
  Shield,
  Gauge
} from '@phosphor-icons/react'

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical'
  components: {
    orchestrator: 'up' | 'down' | 'degraded'
    sandbox: 'ready' | 'error' | 'disabled'
    observability: 'active' | 'partial' | 'inactive'
    media_pipeline: 'ready' | 'error' | 'missing'
    quality_gates: 'enabled' | 'disabled'
    llm_server: 'connected' | 'disconnected' | 'slow'
  }
  timestamp: string
}

interface ObservabilityMetrics {
  prometheus: {
    metrics_exported: number
    scrape_duration: number
    last_scrape: string
  }
  tracing: {
    spans_created: number
    traces_sampled: number
    avg_trace_duration: number
  }
  sentry: {
    enabled: boolean
    events_sent: number
    performance_samples: number
  }
}

interface QualityGateMetrics {
  frames_analyzed: number
  ssim_violations: number
  text_legibility_issues: number
  compression_artifacts: number
  gate_pass_rate: number
  last_analysis: string
}

interface SandboxMetrics {
  active_sandboxes: number
  successful_executions: number
  blocked_operations: number
  resource_violations: number
  avg_execution_time: number
}

interface SystemMetrics {
  gpu: {
    usage: number
    memory: number
    temperature: number
    power_draw: number
    fan_speed: number
  }
  cpu: {
    usage: number
    memory: number
    load_average: number[]
    temperature: number
  }
  storage: {
    cache_size: number
    cache_hit_rate: number
    available_space: number
  }
  network: {
    api_requests: number
    websocket_connections: number
    avg_response_time: number
  }
}

export default function EnhancedSystemMonitor() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: 'healthy',
    components: {
      orchestrator: 'up',
      sandbox: 'ready',
      observability: 'active',
      media_pipeline: 'ready',
      quality_gates: 'enabled',
      llm_server: 'connected'
    },
    timestamp: new Date().toISOString()
  })

  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    gpu: { usage: 45, memory: 8.2, temperature: 65, power_draw: 180, fan_speed: 65 },
    cpu: { usage: 32, memory: 16.8, load_average: [0.8, 1.2, 1.5], temperature: 58 },
    storage: { cache_size: 12.5, cache_hit_rate: 87, available_space: 125 },
    network: { api_requests: 1450, websocket_connections: 3, avg_response_time: 45 }
  })

  const [observabilityMetrics, setObservabilityMetrics] = useState<ObservabilityMetrics>({
    prometheus: { metrics_exported: 847, scrape_duration: 0.12, last_scrape: '2 seconds ago' },
    tracing: { spans_created: 2341, traces_sampled: 234, avg_trace_duration: 1.2 },
    sentry: { enabled: false, events_sent: 0, performance_samples: 0 }
  })

  const [qualityMetrics, setQualityMetrics] = useState<QualityGateMetrics>({
    frames_analyzed: 1847,
    ssim_violations: 12,
    text_legibility_issues: 3,
    compression_artifacts: 8,
    gate_pass_rate: 94.2,
    last_analysis: '15 seconds ago'
  })

  const [sandboxMetrics, setSandboxMetrics] = useState<SandboxMetrics>({
    active_sandboxes: 2,
    successful_executions: 156,
    blocked_operations: 23,
    resource_violations: 2,
    avg_execution_time: 2.8
  })

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update system metrics with realistic variations
      setSystemMetrics(current => ({
        gpu: {
          usage: Math.max(0, Math.min(100, current.gpu.usage + (Math.random() - 0.5) * 10)),
          memory: Math.max(0, Math.min(11, current.gpu.memory + (Math.random() - 0.5) * 0.5)),
          temperature: Math.max(30, Math.min(85, current.gpu.temperature + (Math.random() - 0.5) * 3)),
          power_draw: Math.max(50, Math.min(250, current.gpu.power_draw + (Math.random() - 0.5) * 20)),
          fan_speed: Math.max(20, Math.min(100, current.gpu.fan_speed + (Math.random() - 0.5) * 5))
        },
        cpu: {
          usage: Math.max(0, Math.min(100, current.cpu.usage + (Math.random() - 0.5) * 15)),
          memory: Math.max(0, Math.min(32, current.cpu.memory + (Math.random() - 0.5) * 1)),
          load_average: current.cpu.load_average.map(load => 
            Math.max(0, Math.min(4, load + (Math.random() - 0.5) * 0.2))
          ),
          temperature: Math.max(25, Math.min(80, current.cpu.temperature + (Math.random() - 0.5) * 2))
        },
        storage: {
          ...current.storage,
          cache_hit_rate: Math.max(70, Math.min(99, current.storage.cache_hit_rate + (Math.random() - 0.5) * 2))
        },
        network: {
          ...current.network,
          avg_response_time: Math.max(10, Math.min(200, current.network.avg_response_time + (Math.random() - 0.5) * 10))
        }
      }))

      // Update observability metrics
      setObservabilityMetrics(current => ({
        prometheus: {
          ...current.prometheus,
          metrics_exported: current.prometheus.metrics_exported + Math.floor(Math.random() * 5)
        },
        tracing: {
          ...current.tracing,
          spans_created: current.tracing.spans_created + Math.floor(Math.random() * 10)
        },
        sentry: current.sentry
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'up':
      case 'ready':
      case 'active':
      case 'enabled':
      case 'connected':
        return 'text-green-600'
      case 'degraded':
      case 'partial':
      case 'slow':
        return 'text-yellow-600'
      case 'critical':
      case 'down':
      case 'error':
      case 'inactive':
      case 'disabled':
      case 'disconnected':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'up':
      case 'ready':
      case 'active':
      case 'enabled':
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'degraded':
      case 'partial':
      case 'slow':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      default:
        return <AlertTriangle className="w-4 h-4 text-red-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity size={20} />
            System Health Overview
            <Badge 
              className={`ml-auto ${systemHealth.status === 'healthy' ? 'bg-green-100 text-green-800' : 
                systemHealth.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-red-100 text-red-800'}`}
            >
              {systemHealth.status.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(systemHealth.components).map(([component, status]) => (
              <div key={component} className="flex items-center gap-2 p-2 rounded-lg border">
                {getHealthIcon(status)}
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm capitalize">
                    {component.replace('_', ' ')}
                  </div>
                  <div className={`text-xs ${getHealthColor(status)}`}>
                    {status.replace('_', ' ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="hardware" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="hardware">Hardware</TabsTrigger>
          <TabsTrigger value="observability">Observability</TabsTrigger>
          <TabsTrigger value="quality">Quality Gates</TabsTrigger>
          <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
          <TabsTrigger value="traces">Traces</TabsTrigger>
        </TabsList>

        {/* Hardware Metrics */}
        <TabsContent value="hardware" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor size={16} />
                  GPU (RTX 2080 Ti)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Usage</span>
                    <span className="font-mono">{systemMetrics.gpu.usage.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemMetrics.gpu.usage} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>VRAM</span>
                    <span className="font-mono">{systemMetrics.gpu.memory.toFixed(1)}/11 GB</span>
                  </div>
                  <Progress value={(systemMetrics.gpu.memory / 11) * 100} />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span>Temperature</span>
                    <span className="font-mono">{systemMetrics.gpu.temperature}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Power</span>
                    <span className="font-mono">{systemMetrics.gpu.power_draw}W</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu size={16} />
                  CPU (i9-9900KS)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Usage</span>
                    <span className="font-mono">{systemMetrics.cpu.usage.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemMetrics.cpu.usage} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Memory</span>
                    <span className="font-mono">{systemMetrics.cpu.memory.toFixed(1)}/32 GB</span>
                  </div>
                  <Progress value={(systemMetrics.cpu.memory / 32) * 100} />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span>Load Avg</span>
                    <span className="font-mono">{systemMetrics.cpu.load_average[0].toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Temperature</span>
                    <span className="font-mono">{systemMetrics.cpu.temperature}°C</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Observability Metrics */}
        <TabsContent value="observability" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp size={16} />
                  Prometheus
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Metrics Exported</span>
                  <span className="font-mono">{observabilityMetrics.prometheus.metrics_exported}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Scrape Duration</span>
                  <span className="font-mono">{observabilityMetrics.prometheus.scrape_duration}s</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Last Scrape</span>
                  <span className="text-muted-foreground">{observabilityMetrics.prometheus.last_scrape}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye size={16} />
                  Tracing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Spans Created</span>
                  <span className="font-mono">{observabilityMetrics.tracing.spans_created}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Traces Sampled</span>
                  <span className="font-mono">{observabilityMetrics.tracing.traces_sampled}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Avg Duration</span>
                  <span className="font-mono">{observabilityMetrics.tracing.avg_trace_duration}s</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle size={16} />
                  Error Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant={observabilityMetrics.sentry.enabled ? "default" : "secondary"}>
                    {observabilityMetrics.sentry.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                {observabilityMetrics.sentry.enabled && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Events Sent</span>
                      <span className="font-mono">{observabilityMetrics.sentry.events_sent}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Performance Samples</span>
                      <span className="font-mono">{observabilityMetrics.sentry.performance_samples}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Quality Gates */}
        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge size={16} />
                Quality Analysis Pipeline
                <Badge className="ml-auto bg-green-100 text-green-800">
                  {qualityMetrics.gate_pass_rate.toFixed(1)}% Pass Rate
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{qualityMetrics.frames_analyzed}</div>
                  <div className="text-sm text-muted-foreground">Frames Analyzed</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-amber-600">{qualityMetrics.ssim_violations}</div>
                  <div className="text-sm text-muted-foreground">SSIM Violations</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-red-600">{qualityMetrics.text_legibility_issues}</div>
                  <div className="text-sm text-muted-foreground">Text Issues</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-orange-600">{qualityMetrics.compression_artifacts}</div>
                  <div className="text-sm text-muted-foreground">Compression Artifacts</div>
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Last analysis: {qualityMetrics.last_analysis}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sandbox */}
        <TabsContent value="sandbox" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield size={16} />
                Code Sandbox Status
                <Badge className="ml-auto bg-blue-100 text-blue-800">
                  {sandboxMetrics.active_sandboxes} Active
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-green-600">{sandboxMetrics.successful_executions}</div>
                  <div className="text-sm text-muted-foreground">Successful Executions</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-red-600">{sandboxMetrics.blocked_operations}</div>
                  <div className="text-sm text-muted-foreground">Blocked Operations</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-amber-600">{sandboxMetrics.resource_violations}</div>
                  <div className="text-sm text-muted-foreground">Resource Violations</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{sandboxMetrics.avg_execution_time}s</div>
                  <div className="text-sm text-muted-foreground">Avg Execution Time</div>
                </div>
              </div>
              <Alert className="mt-4">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  All AI-generated code runs in isolated firejail containers with no network access and limited system resources.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Traces */}
        <TabsContent value="traces" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity size={16} />
                Recent Traces
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {[
                    { name: 'process_pipeline', duration: '2.34s', status: 'success', spans: 15 },
                    { name: 'quality_analysis', duration: '0.89s', status: 'success', spans: 8 },
                    { name: 'code_execution', duration: '1.20s', status: 'success', spans: 5 },
                    { name: 'frame_render', duration: '4.56s', status: 'success', spans: 22 },
                    { name: 'audio_alignment', duration: '3.12s', status: 'warning', spans: 12 }
                  ].map((trace, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Badge variant={trace.status === 'success' ? 'default' : 'secondary'}>
                          {trace.status}
                        </Badge>
                        <span className="font-medium">{trace.name}</span>
                        <span className="text-sm text-muted-foreground">{trace.spans} spans</span>
                      </div>
                      <div className="font-mono text-sm">{trace.duration}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}