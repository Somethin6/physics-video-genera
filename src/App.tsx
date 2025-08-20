import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Plus } from '@phosphor-icons/react'
import ProjectDashboard from '@/components/ProjectDashboard'
import ProjectCreation from '@/components/ProjectCreation'
import SystemMonitor from '@/components/SystemMonitor'
import PipelineSettings from '@/components/PipelineSettings'
import AdvancedRenderPreview from '@/components/AdvancedRenderPreview'
import QAAnalysisDashboard from '@/components/QAAnalysisDashboard'
import { Project } from '@/lib/types'
import { RenderSequence } from '@/lib/qa-types'
import { 
  mockRenderSequence, 
  mockQAMetrics, 
  generateMockFrameAnalyses,
  mockAnalyzeFrame,
  mockUploadSequence 
} from '@/lib/mockQAData'

function App() {
  const [projects, setProjects] = useKV<Project[]>("physics-video-projects", [])
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [currentSequence, setCurrentSequence] = useKV<RenderSequence | null>("current-qa-sequence", mockRenderSequence)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const createProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'status' | 'progress'>) => {
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
        assembly: 0
      }
    }

    setProjects(current => [...current, newProject])
    setShowCreateProject(false)
    setActiveTab("dashboard")
  }

  const handleUploadSequence = async (files: FileList) => {
    try {
      const sequence = await mockUploadSequence(files)
      setCurrentSequence(sequence)
      setActiveTab("qa-preview")
    } catch (error) {
      console.error('Failed to upload sequence:', error)
    }
  }

  const handleStartAnalysis = () => {
    setIsAnalyzing(true)
    // In a real implementation, this would start the analysis process
  }

  const handleStopAnalysis = () => {
    setIsAnalyzing(false)
    // In a real implementation, this would stop the analysis process
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-sans tracking-tight text-card-foreground">
                Physics Video Pipeline
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Local AI-driven video production system
              </p>
            </div>
            
            <Button 
              onClick={() => setShowCreateProject(true)}
              className="gap-2"
            >
              <Plus size={16} />
              New Project
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="qa-analysis">QA Analysis</TabsTrigger>
            <TabsTrigger value="qa-preview">Render Preview</TabsTrigger>
            <TabsTrigger value="system">System Monitor</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <ProjectDashboard 
              projects={projects} 
              onUpdateProject={(updatedProject) => {
                setProjects(current => 
                  current.map(p => p.id === updatedProject.id ? updatedProject : p)
                )
              }}
              onCreateProject={createProject}
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
            <AdvancedRenderPreview
              sequence={currentSequence || undefined}
              onUploadSequence={handleUploadSequence}
              onAnalyzeFrame={mockAnalyzeFrame}
              onBatchAnalysis={async (startFrame, endFrame, config) => {
                // Mock batch analysis implementation
                console.log('Batch analyzing frames', startFrame, 'to', endFrame, 'with config:', config)
                
                // Simulate batch processing
                for (let i = startFrame; i <= Math.min(endFrame, startFrame + config.batchSize - 1); i++) {
                  await new Promise(resolve => setTimeout(resolve, 500)) // Simulate processing time
                  await mockAnalyzeFrame(i)
                }
              }}
              onCompareFrames={async (frameA, frameB) => {
                // Mock frame comparison implementation
                console.log('Comparing frames', frameA, 'and', frameB)
                
                return {
                  frameA,
                  frameB,
                  ssimScore: 0.85 + Math.random() * 0.1, // Random SSIM between 0.85-0.95
                  differences: [
                    {
                      type: 'changed' as const,
                      region: { x: 100, y: 150, width: 200, height: 100 },
                      description: 'Text content modified'
                    },
                    {
                      type: 'added' as const,
                      region: { x: 300, y: 200, width: 150, height: 75 },
                      description: 'New mathematical expression'
                    }
                  ]
                }
              }}
            />
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <SystemMonitor />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <PipelineSettings />
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