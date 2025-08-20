import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Plus } from '@phosphor-icons/react'
import ProjectDashboard from '@/components/ProjectDashboard'
import ProjectCreation from '@/components/ProjectCreation'
import SystemMonitor from '@/components/SystemMonitor'
import { Project } from '@/lib/types'

function App() {
  const [projects, setProjects] = useKV<Project[]>("physics-video-projects", [])
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showCreateProject, setShowCreateProject] = useState(false)

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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
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
            />
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <SystemMonitor />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="text-center py-12 text-muted-foreground">
              Pipeline configuration and model management coming soon
            </div>
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