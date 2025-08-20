import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Play, Pause, Eye, FileText, CheckCircle, AlertTriangle, Clock, Monitor, FlaskConical, AlertTriangle } from 'lucide-react'
import { Project, Shot } from '@/lib/types'
import ProjectDetails from '@/components/ProjectDetails'
import ComprehensiveRenderPreview from '@/components/ComprehensiveRenderPreview'
import FrameQAViewer from '@/components/FrameQAViewer'
import QAInstructions from '@/components/QAInstructions'

interface ProjectDashboardProps {
  projects: Project[]
  onUpdateProject: (project: Project) => void
  onCreateProject?: (project: Omit<Project, 'id' | 'createdAt' | 'status' | 'progress'>) => void
}

export default function ProjectDashboard({ projects, onUpdateProject, onCreateProject }: ProjectDashboardProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [previewShot, setPreviewShot] = useState<{ projectId: string; shotId: string } | null>(null)
  const [showQAViewer, setShowQAViewer] = useState(false)
  const [qaProject, setQaProject] = useState<Project | null>(null)

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'error': return 'bg-red-500'
      case 'initializing': return 'bg-blue-500'
      default: return 'bg-accent'
    }
  }

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} />
      case 'error': return <AlertTriangle size={16} />
      case 'generating-outline':
      case 'generating-script': return <FileText size={16} />
      case 'rendering-shots': return <VideoCamera size={16} />
      case 'qa-review': return <Eye size={16} />
      case 'voice-alignment': return <Microphone size={16} />
      default: return <Clock size={16} />
    }
  }

  const calculateOverallProgress = (progress: Project['progress']) => {
    const weights = { outline: 0.1, script: 0.15, shots: 0.3, renders: 0.25, qa: 0.1, assembly: 0.1 }
    return Object.entries(progress).reduce((total, [key, value]) => 
      total + (value * weights[key as keyof typeof weights]), 0
    )
  }

  const activeProjects = projects.filter(p => !['completed', 'error'].includes(p.status))
  const completedProjects = projects.filter(p => p.status === 'completed')

  const openQAViewer = (project: Project) => {
    setQaProject(project)
    setShowQAViewer(true)
  }

  const createDemoProject = () => {
    if (!onCreateProject) return
    
    onCreateProject({
      title: "Maxwell's Equations Demo",
      topic: "Electromagnetic field theory focusing on Maxwell's equations and their physical interpretations, including electric fields, magnetic fields, and electromagnetic wave propagation",
      duration: 8.5,
      description: "Comprehensive demonstration of electromagnetic theory with interactive visualizations",
      settings: {
        quality: 'standard',
        renderer: 'auto',
        resolution: '1080p'
      }
    })
  }

  if (previewShot) {
    // Create a mock shot for the preview system
    const mockShot: Shot = {
      id: previewShot.shotId,
      projectId: previewShot.projectId,
      sequence: 1,
      title: 'Preview Shot',
      script: 'Sample physics demonstration',
      duration: 30,
      renderer: 'manim',
      status: 'rendering',
      attempts: 1,
      maxAttempts: 3,
      frames: []
    }

    return (
      <ComprehensiveRenderPreview 
        shot={mockShot}
        onClose={() => setPreviewShot(null)}
      />
    )
  }

  if (selectedProject) {
    return (
      <ProjectDetails 
        project={selectedProject} 
        onBack={() => setSelectedProject(null)}
        onUpdateProject={onUpdateProject}
        onOpenRenderPreview={(shot) => setPreviewShot({ projectId: selectedProject.id, shotId: shot.id })}
      />
    )
  }

  return (
    <div className="space-y-6">
      {projects.length === 0 ? (
        <QAInstructions />
      ) : null}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold font-mono">{activeProjects.length}</p>
                <p className="text-sm text-muted-foreground">Active Projects</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Play size={20} className="text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold font-mono">{completedProjects.length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle size={20} className="text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold font-mono">
                  {projects.reduce((sum, p) => sum + (p.duration || 0), 0).toFixed(1)}m
                </p>
                <p className="text-sm text-muted-foreground">Total Content</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <VideoCamera size={20} className="text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Projects ({activeProjects.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedProjects.length})</TabsTrigger>
          <TabsTrigger value="all">All Projects ({projects.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeProjects.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <VideoCamera size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No active projects</p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Create your first physics video project to get started
                </p>
                {onCreateProject && (
                  <Button
                    onClick={createDemoProject}
                    variant="outline"
                    className="gap-2"
                  >
                    <FlaskConical size={16} />
                    Create Demo Project
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activeProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="font-sans text-lg">{project.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {project.topic}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {project.duration}m
                        </Badge>
                        {project.qaAnalysis && project.qaAnalysis.issues.length > 0 && (
                          <Badge variant="destructive" className="gap-1 text-xs">
                            <AlertTriangle size={10} />
                            {project.qaAnalysis.issues.length}
                          </Badge>
                        )}
                        <div className={`h-2 w-2 rounded-full ${getStatusColor(project.status)}`} />
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      {getStatusIcon(project.status)}
                      <span className="capitalize">{project.status.replace('-', ' ')}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Overall Progress</span>
                        <span>{Math.round(calculateOverallProgress(project.progress))}%</span>
                      </div>
                      <Progress value={calculateOverallProgress(project.progress)} className="h-1.5" />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="text-muted-foreground">Script</div>
                        <div className="font-mono">{project.progress.script}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-muted-foreground">Renders</div>
                        <div className="font-mono">{project.progress.renders}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-muted-foreground">QA</div>
                        <div className="font-mono">{project.progress.qa}%</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedProject(project)}
                        className="flex-1"
                      >
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openQAViewer(project)}
                        title="QA Analysis"
                      >
                        <Eye size={14} />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setPreviewShot({ projectId: project.id, shotId: 'S001' })}
                        title="Quick Preview"
                      >
                        <Monitor size={14} />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Pause size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedProjects.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No completed projects yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {completedProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="font-sans text-lg">{project.title}</CardTitle>
                        <CardDescription>{project.duration}m • Completed</CardDescription>
                      </div>
                      <CheckCircle size={20} className="text-green-500" />
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <Button
                      size="sm"
                      onClick={() => setSelectedProject(project)}
                      className="w-full"
                    >
                      View Project
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="font-sans text-lg">{project.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {project.topic}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {project.duration}m
                      </Badge>
                      <div className={`h-2 w-2 rounded-full ${getStatusColor(project.status)}`} />
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center gap-2 text-sm mb-3">
                    {getStatusIcon(project.status)}
                    <span className="capitalize">{project.status.replace('-', ' ')}</span>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedProject(project)}
                    className="w-full"
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* QA Viewer Dialog */}
      <Dialog open={showQAViewer} onOpenChange={setShowQAViewer}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Frame QA Analysis - {qaProject?.title}
            </DialogTitle>
          </DialogHeader>
          {qaProject && (
            <FrameQAViewer 
              project={qaProject}
              onUpdateProject={(updatedProject) => {
                onUpdateProject(updatedProject)
                setQaProject(updatedProject)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}