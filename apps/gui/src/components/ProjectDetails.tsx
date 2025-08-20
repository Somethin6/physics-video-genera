import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Play, Pause, Download, Upload, Eye, CheckCircle, Code } from 'lucide-react'
import { Project, Shot } from '@/lib/types'

interface ProjectDetailsProps {
  project: Project
  onBack: () => void
  onUpdateProject: (project: Project) => void
  onOpenRenderPreview?: (shot: Shot) => void
}

export default function ProjectDetails({ project, onBack, onUpdateProject, onOpenRenderPreview }: ProjectDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [editingScript, setEditingScript] = useState(false)

  const getStageProgress = () => {
    const stages = [
      { key: 'outline', label: 'Outline', progress: project.progress.outline },
      { key: 'script', label: 'Script', progress: project.progress.script },
      { key: 'shots', label: 'Shot Planning', progress: project.progress.shots },
      { key: 'renders', label: 'Rendering', progress: project.progress.renders },
      { key: 'qa', label: 'QA Review', progress: project.progress.qa },
      { key: 'assembly', label: 'Assembly', progress: project.progress.assembly }
    ]
    return stages
  }

  const mockShots: Shot[] = [
    {
      id: 'shot-001',
      projectId: project.id,
      sequence: 1,
      title: "Introduction to Maxwell's Equations",
      description: "Opening sequence with title and mathematical foundations",
      duration: 15,
      renderer: 'manim',
      status: 'approved',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'shot-002', 
      projectId: project.id,
      sequence: 2,
      title: "Electric Field Visualization",
      description: "3D visualization of electric field lines around point charges",
      duration: 25,
      renderer: 'blender',
      status: 'qa',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'shot-003',
      projectId: project.id,
      sequence: 3,
      title: "Charge Distribution Simulation",
      description: "Particle simulation showing charge interactions",
      duration: 30,
      renderer: 'taichi',
      status: 'rendering',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]

  const getStatusColor = (status: Shot['status']) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50 border-green-200'
      case 'failed': return 'text-red-600 bg-red-50 border-red-200'
      case 'qa-review': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'rendering': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: Shot['status']) => {
    switch (status) {
      case 'approved': return <CheckCircle size={16} />
      case 'failed': return <AlertTriangle size={16} />
      case 'qa-review': return <Eye size={16} />
      case 'rendering': return <Play size={16} />
      default: return <Pause size={16} />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft size={16} />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold font-sans">{project.title}</h1>
          <p className="text-muted-foreground mt-1">{project.topic}</p>
        </div>
        <Badge variant="outline">{project.duration} minutes</Badge>
        <Badge className={project.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}>
          {project.status.replace('-', ' ')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {getStageProgress().map((stage, index) => (
          <Card key={stage.key} className={stage.progress === 100 ? 'border-green-200 bg-green-50' : ''}>
            <CardContent className="p-4">
              <div className="text-center space-y-2">
                <div className="text-sm font-medium">{stage.label}</div>
                <div className="text-2xl font-mono font-bold">
                  {stage.progress}%
                </div>
                <Progress value={stage.progress} className="h-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="script">Script</TabsTrigger>
          <TabsTrigger value="shots">Shots</TabsTrigger>
          <TabsTrigger value="qa">QA Review</TabsTrigger>
          <TabsTrigger value="voice">Voice Sync</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground">Topic</div>
                  <div className="text-sm">{project.topic}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                  <div className="text-sm">{project.duration} minutes</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Created</div>
                  <div className="text-sm">{new Date(project.createdAt).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Quality Setting</div>
                  <Badge variant="outline">{project.settings?.quality || 'standard'}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Pipeline Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span className="font-mono">
                      {Math.round(Object.values(project.progress).reduce((sum, val) => sum + val, 0) / 6)}%
                    </span>
                  </div>
                  <Progress 
                    value={Object.values(project.progress).reduce((sum, val) => sum + val, 0) / 6} 
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Current Stage</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {project.status.replace('-', ' ')}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Estimated Completion</div>
                  <div className="text-sm text-muted-foreground">
                    ~{Math.round((100 - Object.values(project.progress).reduce((sum, val) => sum + val, 0) / 6) * 0.8)} minutes
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {project.error && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <AlertTriangle size={16} />
                  Pipeline Error
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-600">{project.error}</p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline">
                    View Logs
                  </Button>
                  <Button size="sm">
                    Retry Stage
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="script" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold font-sans">Generated Script</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditingScript(!editingScript)}>
                {editingScript ? 'Save Changes' : 'Edit Script'}
              </Button>
              <Button size="sm" variant="outline">
                <Download size={16} />
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              {editingScript ? (
                <Textarea 
                  className="min-h-96 font-mono text-sm"
                  defaultValue={`# Maxwell's Equations - Physics Video Script

## Introduction (0:00 - 0:30)
Welcome to our exploration of Maxwell's four fundamental equations that describe all of electromagnetism. These equations, formulated by James Clerk Maxwell in the 1860s, unified electricity and magnetism into a single theoretical framework.

## Gauss's Law (0:30 - 2:00)
The first equation, Gauss's law, relates electric field to electric charge...

[Generated script continues with detailed explanations, timing markers, and visual cues for the animation pipeline]`}
                />
              ) : (
                <div className="space-y-4 font-mono text-sm">
                  <div className="p-4 rounded border-l-4 border-blue-500 bg-blue-50">
                    <div className="font-semibold text-blue-700">Introduction (0:00 - 0:30)</div>
                    <p className="mt-2 text-blue-600">
                      Welcome to our exploration of Maxwell's four fundamental equations that describe all of electromagnetism. 
                      These equations, formulated by James Clerk Maxwell in the 1860s, unified electricity and magnetism 
                      into a single theoretical framework.
                    </p>
                  </div>
                  
                  <div className="p-4 rounded border-l-4 border-green-500 bg-green-50">
                    <div className="font-semibold text-green-700">Gauss's Law (0:30 - 2:00)</div>
                    <p className="mt-2 text-green-600">
                      The first equation, Gauss's law, relates electric field to electric charge. 
                      We'll visualize this using field lines emanating from point charges...
                    </p>
                  </div>

                  <div className="p-4 rounded border-l-4 border-purple-500 bg-purple-50">
                    <div className="font-semibold text-purple-700">Gauss's Law for Magnetism (2:00 - 3:30)</div>
                    <p className="mt-2 text-purple-600">
                      The second equation tells us there are no magnetic monopoles - 
                      magnetic field lines must form closed loops...
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shots" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold font-sans">Shot Breakdown</h3>
            <Button size="sm" variant="outline">
              Regenerate Failed Shots
            </Button>
          </div>

          <div className="space-y-4">
            {mockShots.map((shot) => (
              <Card key={shot.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base font-sans">
                        Shot {shot.sequence}: {shot.title}
                      </CardTitle>
                      <CardDescription>
                        {shot.duration}s • {shot.renderer} • {shot.frames} frames
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(shot.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(shot.status)}
                        <span className="capitalize">{shot.status.replace('-', ' ')}</span>
                      </div>
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-muted-foreground">Duration</div>
                      <div className="font-mono text-lg">{shot.duration}s</div>
                    </div>
                    <div className="text-center">
                      <div className="text-muted-foreground">Renderer</div>
                      <div className="font-mono text-lg capitalize">{shot.renderer}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-muted-foreground">Updated</div>
                      <div className="font-mono text-sm">{new Date(shot.updatedAt).toLocaleDateString()}</div>
                    </div>
                  </div>

                  {shot.description && (
                    <div className="p-3 rounded bg-muted/50 text-sm">
                      <div className="font-medium mb-1">Description</div>
                      <div className="text-muted-foreground">{shot.description}</div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onOpenRenderPreview && onOpenRenderPreview(shot)}
                    >
                      <Eye size={14} />
                      Render Preview
                    </Button>
                    <Button size="sm" variant="outline">
                      <Code size={14} />
                      View Code
                    </Button>
                    {shot.status === 'error' && (
                      <Button size="sm">
                        Regenerate
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="qa" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold font-sans">Quality Assurance</h3>
            <Button size="sm" variant="outline">
              <Monitor size={14} />
              Open Full QA Dashboard
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="font-sans">Automated Analysis Results</CardTitle>
              <CardDescription>
                LLaVA vision model and signal analysis for all rendered shots
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded border">
                  <div className="text-2xl font-bold text-green-600">92%</div>
                  <div className="text-sm text-muted-foreground">Avg Visual Quality</div>
                </div>
                <div className="text-center p-4 rounded border">
                  <div className="text-2xl font-bold text-blue-600">85%</div>
                  <div className="text-sm text-muted-foreground">Physics Accuracy</div>
                </div>
                <div className="text-center p-4 rounded border">
                  <div className="text-2xl font-bold text-orange-600">3</div>
                  <div className="text-sm text-muted-foreground">Issues Found</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Overall QA Score</span>
                  <span className="font-mono">88%</span>
                </div>
                <Progress value={88} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  Target: 85% for production release
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Recent QA Issues</div>
                {[
                  { type: 'Visual Clarity', shot: 'Shot 2', description: 'Field line contrast could be improved' },
                  { type: 'Physics Accuracy', shot: 'Shot 3', description: 'Vector magnitudes need verification' },
                  { type: 'Motion Smoothness', shot: 'Shot 1', description: 'Minor jitter in camera movement' }
                ].map((issue, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <div>
                      <div className="text-sm font-medium">{issue.type}</div>
                      <div className="text-xs text-muted-foreground">{issue.description}</div>
                    </div>
                    <Badge variant="outline" className="text-xs">{issue.shot}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-sans">Voice Synchronization</CardTitle>
              <CardDescription>
                Upload your final voiceover for force-alignment and retiming
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload size={48} className="mx-auto text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Upload final voiceover</p>
                  <p className="text-xs text-muted-foreground">
                    Supports WAV, MP3, M4A • Mono/Stereo • Up to 100MB
                  </p>
                </div>
                <Button className="mt-4">
                  Select Audio File
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>Current status: Using TTS scratch track for timing</p>
                <p>Pipeline will automatically retime all animations after voice upload</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}