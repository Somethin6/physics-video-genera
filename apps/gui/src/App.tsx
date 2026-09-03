import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import ProjectDashboard from '@/components/ProjectDashboard'
import ProjectCreation from '@/components/ProjectCreation'
import SystemMonitor from '@/components/SystemMonitor'
import RenderPreview from '@/components/RenderPreview'
import QAAnalysisDashboard from '@/components/QAAnalysisDashboard'
import PipelineMonitor from '@/components/PipelineMonitor'
import LiveCodeWorkspace from '@/components/LiveCodeWorkspace'
import AudioAlignmentWorkspace from '@/components/AudioAlignmentWorkspace'
import { Project } from '@/lib/types'
import { RenderSequence } from '@/lib/qa-types'
import { PhysicsVideoRequest } from '@/lib/pipeline-orchestrator'
import { DATA_PROVENANCE } from '@/lib/dataProvenance'
import {
  mockRenderSequence,
  mockQAMetrics,
  generateMockFrameAnalyses,
  mockAnalyzeFrame,
  mockUploadSequence,
} from '@/lib/mockQAData'

function App() {
  const [projects, setProjects] = useKV<Project[]>('physics-video-projects', [])
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [currentSequence, setCurrentSequence] = useKV<RenderSequence | null>(
    'current-qa-sequence',
    mockRenderSequence,
  )
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentRequest, setCurrentRequest] = useState<PhysicsVideoRequest | null>(null)

  const createProject = (
    projectData: Omit<Project, 'id' | 'createdAt' | 'status' | 'progress'>,
  ) => {
    const newProject: Project = {
      ...projectData,
      id: `project-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'initializing',
      progress: {
        outline: 0,
        script: 0,
        shots: 0,
        renders: 0,
        qa: 0,
        assembly: 0,
      },
    }

    setProjects((current) => [...current, newProject])
    setShowCreateProject(false)

    const request: PhysicsVideoRequest = {
      topic: projectData.topic,
      duration: projectData.duration,
      level: 'intermediate',
      style: {
        colorTheme: 'scientific',
        fontStack: ['Inter', 'JetBrains Mono'],
        motionVocabulary: 'smooth',
      },
    }

    setCurrentRequest(request)
    setActiveTab('pipeline')
  }

  const handleUploadSequence = async (files: FileList) => {
    try {
      const sequence = await mockUploadSequence(files)
      setCurrentSequence(sequence)
      setActiveTab('qa-preview')
    } catch (error) {
      console.error('Demo sequence upload failed:', error)
    }
  }

  const handleStartAnalysis = () => {
    setIsAnalyzing(true)
  }

  const handleStopAnalysis = () => {
    setIsAnalyzing(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold font-sans tracking-tight text-card-foreground">
                Physics Foundry
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Prototype scientific-media orchestration interface
              </p>
            </div>

            <Button onClick={() => setShowCreateProject(true)} className="gap-2">
              <Plus size={16} />
              New Project
            </Button>
          </div>

          <div
            className="mt-4 rounded-md border border-border bg-muted/50 px-4 py-3 text-sm"
            role="status"
            aria-label="Data provenance notice"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded border border-border bg-background px-2 py-0.5 text-xs font-semibold uppercase tracking-wide">
                Demo / fixture UI
              </span>
              <span className="text-muted-foreground">
                {DATA_PROVENANCE.demo.description} Panels are promoted to live only when connected to an actual service or measurement path.
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline Demo</TabsTrigger>
            <TabsTrigger value="code">Code Demo</TabsTrigger>
            <TabsTrigger value="audio">Audio Demo</TabsTrigger>
            <TabsTrigger value="qa-analysis">QA Demo</TabsTrigger>
            <TabsTrigger value="qa-preview">Preview Demo</TabsTrigger>
            <TabsTrigger value="system">System Demo</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <ProjectDashboard
              projects={projects}
              onUpdateProject={(updatedProject) => {
                setProjects((current) =>
                  current.map((project) =>
                    project.id === updatedProject.id ? updatedProject : project,
                  ),
                )
              }}
              onCreateProject={createProject}
            />
          </TabsContent>

          <TabsContent value="pipeline" className="space-y-6">
            <PipelineMonitor
              request={currentRequest || undefined}
              onComplete={(videoPath) => {
                console.log('Pipeline demo completion callback:', videoPath)
                setActiveTab('qa-preview')
              }}
            />
          </TabsContent>

          <TabsContent value="code" className="space-y-6">
            <LiveCodeWorkspace
              onCodeUpdate={(sceneId) => {
                console.log('Demo code updated for scene:', sceneId)
              }}
              onRenderRequest={(sceneId) => {
                console.log('Demo render requested for scene:', sceneId)
              }}
            />
          </TabsContent>

          <TabsContent value="audio" className="space-y-6">
            <AudioAlignmentWorkspace
              onAlignmentComplete={(alignments) => {
                console.log('Demo alignment callback:', alignments)
              }}
            />
          </TabsContent>

          <TabsContent value="qa-analysis" className="space-y-6">
            <QAAnalysisDashboard
              metrics={mockQAMetrics}
              recentAnalyses={generateMockFrameAnalyses(20)}
              isAnalyzing={isAnalyzing}
              onStartAnalysis={handleStartAnalysis}
              onStopAnalysis={handleStopAnalysis}
            />
          </TabsContent>

          <TabsContent value="qa-preview" className="space-y-6">
            <RenderPreview
              mode="enhanced"
              sequence={currentSequence || undefined}
              onUploadSequence={handleUploadSequence}
              onAnalyzeFrame={mockAnalyzeFrame}
              onBatchAnalysis={async (startFrame, endFrame, config) => {
                console.log(
                  'Demo batch analysis:',
                  startFrame,
                  endFrame,
                  config,
                )

                for (
                  let frame = startFrame;
                  frame <= Math.min(endFrame, startFrame + config.batchSize - 1);
                  frame += 1
                ) {
                  await new Promise((resolve) => setTimeout(resolve, 300))
                  await mockAnalyzeFrame(frame)
                }
              }}
              onCompareFrames={async (frameA, frameB) => {
                console.log('Demo frame comparison:', frameA, frameB)

                return {
                  frameA,
                  frameB,
                  ssimScore: 0.85 + Math.random() * 0.1,
                  differences: [
                    {
                      type: 'changed' as const,
                      region: { x: 100, y: 150, width: 200, height: 100 },
                      description: 'Demo: mathematical equation updated',
                    },
                    {
                      type: 'added' as const,
                      region: { x: 300, y: 200, width: 150, height: 75 },
                      description: 'Demo: annotation layer added',
                    },
                  ],
                }
              }}
            />
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <SystemMonitor />
          </TabsContent>
        </Tabs>
      </main>

      <ProjectCreation
        open={showCreateProject}
        onOpenChange={setShowCreateProject}
        onCreateProject={createProject}
      />
    </div>
  )
}

export default App
