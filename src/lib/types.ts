export interface Project {
  id: string
  title: string
  topic: string
  duration: number // in minutes
  createdAt: string
  status: 'initializing' | 'generating-outline' | 'generating-script' | 'rendering-shots' | 'qa-review' | 'voice-alignment' | 'final-assembly' | 'completed' | 'error'
  progress: {
    outline: number
    script: number
    shots: number
    renders: number
    qa: number
    assembly: number
  }
  settings?: {
    quality: 'draft' | 'standard' | 'high'
    renderer: 'auto' | 'manim' | 'blender' | 'taichi'
    resolution: '720p' | '1080p' | '4k'
  }
  error?: string
  shots?: Shot[]
  script?: ScriptLine[]
}

export interface Shot {
  id: string
  sequence: number
  title: string
  duration: number
  renderer: 'manim' | 'blender' | 'taichi' | 'matplotlib'
  status: 'pending' | 'generating' | 'rendering' | 'qa-review' | 'approved' | 'failed'
  code?: string
  frames?: number
  qaMetrics?: {
    ssim: number
    opticalFlow: number
    llavaScore: number
    feedback: string
  }
  renderPath?: string
}

export interface ScriptLine {
  id: string
  sequence: number
  text: string
  duration: number
  shotId?: string
  beats: TimingBeat[]
}

export interface TimingBeat {
  word: string
  startTime: number
  endTime: number
  emphasis?: 'normal' | 'strong' | 'subtle'
}

export interface SystemMetrics {
  gpu: {
    usage: number
    memory: number
    temperature: number
  }
  cpu: {
    usage: number
    memory: number
  }
  models: {
    neox20b: 'loading' | 'ready' | 'error'
    llava: 'loading' | 'ready' | 'error'
    whisper: 'loading' | 'ready' | 'error'
  }
  pipeline: {
    activeProjects: number
    queueLength: number
    avgRenderTime: number
  }
}