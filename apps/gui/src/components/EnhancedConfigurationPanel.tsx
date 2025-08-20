/**
 * Enhanced Configuration Management
 * Bullet-proof configuration with validation and real-time updates
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Settings, Shield, Monitor, Zap, Database, Eye, CheckCircle, AlertTriangle, Info } from 'lucide-react'

interface ConfigurationState {
  llm: {
    model: string
    max_gpu_layers: number
    context_length: number
    temperature: number
    gpu_memory_usage: string
    fallback_enabled: boolean
  }
  rendering: {
    device: 'OPTIX' | 'CUDA' | 'CPU'
    samples: number
    tile_size: number
    memory_limit_gb: number
    resolution: { width: number; height: number }
    framerate: number
  }
  quality: {
    gates_enabled: boolean
    ssim_threshold: number
    vmaf_threshold: number
    text_legibility_threshold: number
    auto_retry: boolean
    max_retries: number
  }
  observability: {
    prometheus_enabled: boolean
    tracing_enabled: boolean
    sentry_enabled: boolean
    sample_rate: number
    log_level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'
  }
  sandbox: {
    enabled: boolean
    type: 'firejail' | 'nsjail'
    memory_limit: string
    cpu_cores: number
    timeout: number
    network_isolation: boolean
  }
  media: {
    ocio_config: string
    intermediate_format: 'openexr' | 'png' | 'tiff'
    compression: 'zip' | 'piz' | 'b44' | 'dwaa'
    audio_sample_rate: number
    target_lufs: number
  }
}

interface ConfigValidation {
  valid: boolean
  warnings: string[]
  errors: string[]
  recommendations: string[]
}

export default function EnhancedConfigurationPanel() {
  const [config, setConfig] = useState<ConfigurationState>({
    llm: {
      model: 'gpt-neox-20b-q4',
      max_gpu_layers: 28,
      context_length: 4096,
      temperature: 0.7,
      gpu_memory_usage: '~8GB',
      fallback_enabled: true
    },
    rendering: {
      device: 'OPTIX',
      samples: 256,
      tile_size: 256,
      memory_limit_gb: 8,
      resolution: { width: 1920, height: 1080 },
      framerate: 30
    },
    quality: {
      gates_enabled: true,
      ssim_threshold: 0.85,
      vmaf_threshold: 70.0,
      text_legibility_threshold: 0.80,
      auto_retry: true,
      max_retries: 3
    },
    observability: {
      prometheus_enabled: true,
      tracing_enabled: true,
      sentry_enabled: false,
      sample_rate: 0.1,
      log_level: 'INFO'
    },
    sandbox: {
      enabled: true,
      type: 'firejail',
      memory_limit: '512M',
      cpu_cores: 2,
      timeout: 60,
      network_isolation: true
    },
    media: {
      ocio_config: '/config/ocio/config.ocio',
      intermediate_format: 'openexr',
      compression: 'zip',
      audio_sample_rate: 48000,
      target_lufs: -23.0
    }
  })

  const [validation, setValidation] = useState<ConfigValidation>({
    valid: true,
    warnings: [],
    errors: [],
    recommendations: []
  })

  const [hasChanges, setHasChanges] = useState(false)
  const [isApplying, setIsApplying] = useState(false)

  // Validate configuration
  useEffect(() => {
    const newValidation: ConfigValidation = {
      valid: true,
      warnings: [],
      errors: [],
      recommendations: []
    }

    // LLM validation
    if (config.llm.max_gpu_layers > 32) {
      newValidation.warnings.push('High GPU layer count may cause VRAM overflow on RTX 2080 Ti')
    }

    if (config.llm.context_length > 8192) {
      newValidation.warnings.push('Large context length increases memory usage significantly')
    }

    // Rendering validation
    if (config.rendering.device === 'OPTIX' && config.rendering.samples > 512) {
      newValidation.recommendations.push('Consider reducing samples or using adaptive sampling for faster renders')
    }

    if (config.rendering.memory_limit_gb > 8) {
      newValidation.errors.push('Memory limit exceeds RTX 2080 Ti VRAM capacity (11GB)')
      newValidation.valid = false
    }

    // Quality validation
    if (config.quality.ssim_threshold < 0.7) {
      newValidation.warnings.push('Low SSIM threshold may allow poor quality frames')
    }

    // Sandbox validation
    if (!config.sandbox.enabled) {
      newValidation.warnings.push('Code sandbox disabled - security risk for AI-generated code')
    }

    setValidation(newValidation)
  }, [config])

  const updateConfig = (section: keyof ConfigurationState, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
    setHasChanges(true)
  }

  const applyConfiguration = async () => {
    if (!validation.valid) {
      return
    }

    setIsApplying(true)
    
    try {
      // Simulate API call to update configuration
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setHasChanges(false)
      console.log('Configuration applied:', config)
    } catch (error) {
      console.error('Failed to apply configuration:', error)
    } finally {
      setIsApplying(false)
    }
  }

  const resetToDefaults = () => {
    // Reset to default values
    setConfig({
      llm: {
        model: 'gpt-neox-20b-q4',
        max_gpu_layers: 28,
        context_length: 4096,
        temperature: 0.7,
        gpu_memory_usage: '~8GB',
        fallback_enabled: true
      },
      rendering: {
        device: 'OPTIX',
        samples: 256,
        tile_size: 256,
        memory_limit_gb: 8,
        resolution: { width: 1920, height: 1080 },
        framerate: 30
      },
      quality: {
        gates_enabled: true,
        ssim_threshold: 0.85,
        vmaf_threshold: 70.0,
        text_legibility_threshold: 0.80,
        auto_retry: true,
        max_retries: 3
      },
      observability: {
        prometheus_enabled: true,
        tracing_enabled: true,
        sentry_enabled: false,
        sample_rate: 0.1,
        log_level: 'INFO'
      },
      sandbox: {
        enabled: true,
        type: 'firejail',
        memory_limit: '512M',
        cpu_cores: 2,
        timeout: 60,
        network_isolation: true
      },
      media: {
        ocio_config: '/config/ocio/config.ocio',
        intermediate_format: 'openexr',
        compression: 'zip',
        audio_sample_rate: 48000,
        target_lufs: -23.0
      }
    })
    setHasChanges(true)
  }

  return (
    <div className="space-y-6">
      {/* Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings size={20} />
              Configuration Status
            </div>
            <Badge variant={validation.valid ? "default" : "destructive"}>
              {validation.valid ? "Valid" : "Invalid"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {validation.errors.length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription>
                <div className="font-medium text-red-800 mb-1">Configuration Errors:</div>
                <ul className="text-red-700 text-sm space-y-1">
                  {validation.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          {validation.warnings.length > 0 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription>
                <div className="font-medium text-yellow-800 mb-1">AlertTriangles:</div>
                <ul className="text-yellow-700 text-sm space-y-1">
                  {validation.warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {validation.recommendations.length > 0 && (
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <div className="font-medium text-blue-800 mb-1">Recommendations:</div>
                <ul className="text-blue-700 text-sm space-y-1">
                  {validation.recommendations.map((rec, index) => (
                    <li key={index}>• {rec}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={applyConfiguration} 
              disabled={!validation.valid || !hasChanges || isApplying}
              className="flex items-center gap-2"
            >
              {isApplying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Apply Configuration
                </>
              )}
            </Button>
            <Button variant="outline" onClick={resetToDefaults}>
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Tabs */}
      <Tabs defaultValue="llm" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="llm">LLM</TabsTrigger>
          <TabsTrigger value="rendering">Rendering</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="observability">Observability</TabsTrigger>
          <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>

        {/* LLM Configuration */}
        <TabsContent value="llm" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap size={16} />
                LLM Configuration
                <Badge className="ml-auto bg-blue-100 text-blue-800">RTX 2080 Ti Optimized</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Select
                    value={config.llm.model}
                    onValueChange={(value) => updateConfig('llm', 'model', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-neox-20b-q4">GPT-NeoX-20B (Q4) - ~8GB VRAM</SelectItem>
                      <SelectItem value="mistral-7b-instruct-q5">Mistral-7B (Q5) - ~6GB VRAM</SelectItem>
                      <SelectItem value="llama2-13b-q4">Llama2-13B (Q4) - ~9GB VRAM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gpu-layers">Max GPU Layers</Label>
                  <Input
                    id="gpu-layers"
                    type="number"
                    min="0"
                    max="40"
                    value={config.llm.max_gpu_layers}
                    onChange={(e) => updateConfig('llm', 'max_gpu_layers', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="context">Context Length</Label>
                  <Select
                    value={config.llm.context_length.toString()}
                    onValueChange={(value) => updateConfig('llm', 'context_length', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2048">2048 tokens</SelectItem>
                      <SelectItem value="4096">4096 tokens</SelectItem>
                      <SelectItem value="8192">8192 tokens</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input
                    id="temperature"
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={config.llm.temperature}
                    onChange={(e) => updateConfig('llm', 'temperature', parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="fallback"
                  checked={config.llm.fallback_enabled}
                  onCheckedChange={(checked) => updateConfig('llm', 'fallback_enabled', checked)}
                />
                <Label htmlFor="fallback">Enable CPU fallback for KV cache</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rendering Configuration */}
        <TabsContent value="rendering" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor size={16} />
                Rendering Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="device">Render Device</Label>
                  <Select
                    value={config.rendering.device}
                    onValueChange={(value: 'OPTIX' | 'CUDA' | 'CPU') => updateConfig('rendering', 'device', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPTIX">OptiX (RTX acceleration)</SelectItem>
                      <SelectItem value="CUDA">CUDA (GPU compute)</SelectItem>
                      <SelectItem value="CPU">CPU (fallback)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="samples">Samples</Label>
                  <Input
                    id="samples"
                    type="number"
                    min="8"
                    max="1024"
                    value={config.rendering.samples}
                    onChange={(e) => updateConfig('rendering', 'samples', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="memory-limit">Memory Limit (GB)</Label>
                  <Input
                    id="memory-limit"
                    type="number"
                    min="1"
                    max="11"
                    value={config.rendering.memory_limit_gb}
                    onChange={(e) => updateConfig('rendering', 'memory_limit_gb', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="width">Resolution Width</Label>
                  <Input
                    id="width"
                    type="number"
                    value={config.rendering.resolution.width}
                    onChange={(e) => updateConfig('rendering', 'resolution', {
                      ...config.rendering.resolution,
                      width: parseInt(e.target.value)
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Resolution Height</Label>
                  <Input
                    id="height"
                    type="number"
                    value={config.rendering.resolution.height}
                    onChange={(e) => updateConfig('rendering', 'resolution', {
                      ...config.rendering.resolution,
                      height: parseInt(e.target.value)
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="framerate">Frame Rate</Label>
                  <Select
                    value={config.rendering.framerate.toString()}
                    onValueChange={(value) => updateConfig('rendering', 'framerate', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24">24 fps</SelectItem>
                      <SelectItem value="30">30 fps</SelectItem>
                      <SelectItem value="60">60 fps</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quality Configuration */}
        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye size={16} />
                Quality Gates Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="quality-gates"
                  checked={config.quality.gates_enabled}
                  onCheckedChange={(checked) => updateConfig('quality', 'gates_enabled', checked)}
                />
                <Label htmlFor="quality-gates">Enable Quality Gates</Label>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ssim">SSIM Threshold</Label>
                  <Input
                    id="ssim"
                    type="number"
                    min="0"
                    max="1"
                    step="0.05"
                    value={config.quality.ssim_threshold}
                    onChange={(e) => updateConfig('quality', 'ssim_threshold', parseFloat(e.target.value))}
                    disabled={!config.quality.gates_enabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vmaf">VMAF Threshold</Label>
                  <Input
                    id="vmaf"
                    type="number"
                    min="0"
                    max="100"
                    value={config.quality.vmaf_threshold}
                    onChange={(e) => updateConfig('quality', 'vmaf_threshold', parseFloat(e.target.value))}
                    disabled={!config.quality.gates_enabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="text-legibility">Text Legibility</Label>
                  <Input
                    id="text-legibility"
                    type="number"
                    min="0"
                    max="1"
                    step="0.05"
                    value={config.quality.text_legibility_threshold}
                    onChange={(e) => updateConfig('quality', 'text_legibility_threshold', parseFloat(e.target.value))}
                    disabled={!config.quality.gates_enabled}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-retry"
                    checked={config.quality.auto_retry}
                    onCheckedChange={(checked) => updateConfig('quality', 'auto_retry', checked)}
                    disabled={!config.quality.gates_enabled}
                  />
                  <Label htmlFor="auto-retry">Auto Retry</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-retries">Max Retries</Label>
                  <Input
                    id="max-retries"
                    type="number"
                    min="1"
                    max="10"
                    value={config.quality.max_retries}
                    onChange={(e) => updateConfig('quality', 'max_retries', parseInt(e.target.value))}
                    disabled={!config.quality.gates_enabled || !config.quality.auto_retry}
                    className="w-24"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Observability Configuration */}
        <TabsContent value="observability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database size={16} />
                Observability Stack
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label className="font-medium">Prometheus Metrics</Label>
                    <p className="text-sm text-muted-foreground">Export pipeline metrics to Prometheus</p>
                  </div>
                  <Switch
                    checked={config.observability.prometheus_enabled}
                    onCheckedChange={(checked) => updateConfig('observability', 'prometheus_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label className="font-medium">Distributed Tracing</Label>
                    <p className="text-sm text-muted-foreground">OpenTelemetry traces to Jaeger</p>
                  </div>
                  <Switch
                    checked={config.observability.tracing_enabled}
                    onCheckedChange={(checked) => updateConfig('observability', 'tracing_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label className="font-medium">Error Tracking</Label>
                    <p className="text-sm text-muted-foreground">Self-hosted Sentry for error capture</p>
                  </div>
                  <Switch
                    checked={config.observability.sentry_enabled}
                    onCheckedChange={(checked) => updateConfig('observability', 'sentry_enabled', checked)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sample-rate">Trace Sample Rate</Label>
                  <Input
                    id="sample-rate"
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.observability.sample_rate}
                    onChange={(e) => updateConfig('observability', 'sample_rate', parseFloat(e.target.value))}
                    disabled={!config.observability.tracing_enabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="log-level">Log Level</Label>
                  <Select
                    value={config.observability.log_level}
                    onValueChange={(value: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR') => updateConfig('observability', 'log_level', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DEBUG">DEBUG</SelectItem>
                      <SelectItem value="INFO">INFO</SelectItem>
                      <SelectItem value="WARN">WARN</SelectItem>
                      <SelectItem value="ERROR">ERROR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sandbox Configuration */}
        <TabsContent value="sandbox" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield size={16} />
                Code Sandbox Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="sandbox-enabled"
                  checked={config.sandbox.enabled}
                  onCheckedChange={(checked) => updateConfig('sandbox', 'enabled', checked)}
                />
                <Label htmlFor="sandbox-enabled">Enable code sandboxing</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sandbox-type">Sandbox Type</Label>
                  <Select
                    value={config.sandbox.type}
                    onValueChange={(value: 'firejail' | 'nsjail') => updateConfig('sandbox', 'type', value)}
                    disabled={!config.sandbox.enabled}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="firejail">Firejail (recommended)</SelectItem>
                      <SelectItem value="nsjail">NsJail (advanced)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="memory-limit">Memory Limit</Label>
                  <Input
                    id="memory-limit"
                    value={config.sandbox.memory_limit}
                    onChange={(e) => updateConfig('sandbox', 'memory_limit', e.target.value)}
                    disabled={!config.sandbox.enabled}
                    placeholder="e.g., 512M, 1G"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpu-cores">CPU Cores</Label>
                  <Input
                    id="cpu-cores"
                    type="number"
                    min="1"
                    max="8"
                    value={config.sandbox.cpu_cores}
                    onChange={(e) => updateConfig('sandbox', 'cpu_cores', parseInt(e.target.value))}
                    disabled={!config.sandbox.enabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeout">Timeout (seconds)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    min="10"
                    max="600"
                    value={config.sandbox.timeout}
                    onChange={(e) => updateConfig('sandbox', 'timeout', parseInt(e.target.value))}
                    disabled={!config.sandbox.enabled}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="network-isolation"
                  checked={config.sandbox.network_isolation}
                  onCheckedChange={(checked) => updateConfig('sandbox', 'network_isolation', checked)}
                  disabled={!config.sandbox.enabled}
                />
                <Label htmlFor="network-isolation">Network isolation (recommended)</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media Configuration */}
        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database size={16} />
                Media Pipeline Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="ocio-config">OCIO Configuration Path</Label>
                <Input
                  id="ocio-config"
                  value={config.media.ocio_config}
                  onChange={(e) => updateConfig('media', 'ocio_config', e.target.value)}
                  placeholder="/path/to/config.ocio"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="intermediate-format">Intermediate Format</Label>
                  <Select
                    value={config.media.intermediate_format}
                    onValueChange={(value: 'openexr' | 'png' | 'tiff') => updateConfig('media', 'intermediate_format', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openexr">OpenEXR (recommended)</SelectItem>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="tiff">TIFF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="compression">EXR Compression</Label>
                  <Select
                    value={config.media.compression}
                    onValueChange={(value: 'zip' | 'piz' | 'b44' | 'dwaa') => updateConfig('media', 'compression', value)}
                    disabled={config.media.intermediate_format !== 'openexr'}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zip">ZIP (fast read)</SelectItem>
                      <SelectItem value="piz">PIZ (grainy images)</SelectItem>
                      <SelectItem value="b44">B44 (lossy, smooth)</SelectItem>
                      <SelectItem value="dwaa">DWAA (modern)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sample-rate">Audio Sample Rate</Label>
                  <Select
                    value={config.media.audio_sample_rate.toString()}
                    onValueChange={(value) => updateConfig('media', 'audio_sample_rate', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="44100">44.1 kHz</SelectItem>
                      <SelectItem value="48000">48 kHz (recommended)</SelectItem>
                      <SelectItem value="96000">96 kHz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target-lufs">Target LUFS (EBU R128)</Label>
                  <Input
                    id="target-lufs"
                    type="number"
                    min="-30"
                    max="-16"
                    value={config.media.target_lufs}
                    onChange={(e) => updateConfig('media', 'target_lufs', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}