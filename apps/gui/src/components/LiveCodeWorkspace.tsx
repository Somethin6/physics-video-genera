/**
 * Live Code Workspace Component
 * Shows generated code with real-time updates and diff view
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Code, Eye, GitBranch, Play, Lock, Unlock, RefreshCw, Download } from 'lucide-react'

interface CodeRevision {
  id: string
  timestamp: number
  engine: 'manim' | 'taichi' | 'blender'
  sceneId: string
  code: string
  changes: string[]
  status: 'draft' | 'rendered' | 'approved' | 'rejected'
}

interface LiveCodeWorkspaceProps {
  sceneId?: string
  onCodeUpdate?: (sceneId: string, code: string) => void
  onRenderRequest?: (sceneId: string) => void
}

const mockCodeRevisions: CodeRevision[] = [
  {
    id: 'rev_001',
    timestamp: Date.now() - 5000,
    engine: 'manim',
    sceneId: 'intro_scene',
    code: `from manim import *

class IntroScene(Scene):
    def construct(self):
        # Create title
        title = Text("Quantum Harmonic Oscillator", font_size=48)
        title.set_color(BLUE)
        
        # Animate title appearance
        self.play(Write(title))
        self.wait(1)
        
        # Transform to equation
        equation = MathTex(r"H = \\frac{p^2}{2m} + \\frac{1}{2}m\\omega^2 x^2")
        equation.scale(1.5)
        
        self.play(Transform(title, equation))
        self.wait(2)`,
    changes: ['Initial scene creation', 'Added title animation', 'Added Hamiltonian equation'],
    status: 'rendered'
  },
  {
    id: 'rev_002',
    timestamp: Date.now() - 2000,
    engine: 'manim',
    sceneId: 'intro_scene',
    code: `from manim import *

class IntroScene(Scene):
    def construct(self):
        # Create title with enhanced styling
        title = Text("Quantum Harmonic Oscillator", font_size=48)
        title.set_color_by_gradient(BLUE, PURPLE)
        title.add_background_rectangle(color=BLACK, opacity=0.1)
        
        # Animate title appearance with typing effect
        self.play(AddTextLetterByLetter(title, time_per_char=0.1))
        self.wait(1)
        
        # Transform to equation with better formatting
        equation = MathTex(
            r"H = \\frac{p^2}{2m} + \\frac{1}{2}m\\omega^2 x^2",
            substrings_to_isolate=["H", "p", "m", "\\omega", "x"]
        )
        equation.scale(1.5)
        equation.set_color_by_tex("H", YELLOW)
        equation.set_color_by_tex("\\omega", RED)
        
        self.play(Transform(title, equation))
        self.wait(2)
        
        # Add energy level visualization
        energy_levels = VGroup()
        for n in range(5):
            level = Line(LEFT * 2, RIGHT * 2, color=WHITE)
            level.shift(UP * (n + 0.5))
            energy_text = MathTex(f"E_{n} = \\hbar\\omega(n + \\frac{{1}}{{2}})")
            energy_text.scale(0.7).next_to(level, RIGHT)
            energy_levels.add(VGroup(level, energy_text))
        
        self.play(FadeIn(energy_levels, lag_ratio=0.3))
        self.wait(3)`,
    changes: ['Enhanced title styling', 'Added typing animation', 'Improved equation formatting', 'Added energy level visualization'],
    status: 'draft'
  }
]

const LiveCodeWorkspace: React.FC<LiveCodeWorkspaceProps> = ({
  sceneId = 'intro_scene',
  onCodeUpdate,
  onRenderRequest
}) => {
  const [revisions, setRevisions] = useState<CodeRevision[]>(mockCodeRevisions)
  const [currentRevision, setCurrentRevision] = useState<CodeRevision>(mockCodeRevisions[1])
  const [isLocked, setIsLocked] = useState(false)
  const [showDiff, setShowDiff] = useState(false)

  useEffect(() => {
    // Simulate live code updates
    const interval = setInterval(() => {
      if (!isLocked && Math.random() > 0.8) {
        simulateCodeUpdate()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [isLocked])

  const simulateCodeUpdate = () => {
    const newRevision: CodeRevision = {
      id: `rev_${Date.now()}`,
      timestamp: Date.now(),
      engine: currentRevision.engine,
      sceneId: currentRevision.sceneId,
      code: currentRevision.code + '\n        # Live update: ' + Math.random().toString(36).substr(2, 9),
      changes: ['Live AI refinement', 'Automated optimization'],
      status: 'draft'
    }

    setRevisions(prev => [...prev, newRevision])
    setCurrentRevision(newRevision)
  }

  const handleApproveRevision = () => {
    setCurrentRevision(prev => ({ ...prev, status: 'approved' }))
    onCodeUpdate?.(currentRevision.sceneId, currentRevision.code)
  }

  const handleRejectRevision = () => {
    setCurrentRevision(prev => ({ ...prev, status: 'rejected' }))
    // Revert to previous approved revision
    const lastApproved = revisions.filter(r => r.status === 'approved').pop()
    if (lastApproved) {
      setCurrentRevision(lastApproved)
    }
  }

  const handleRender = () => {
    onRenderRequest?.(currentRevision.sceneId)
    setCurrentRevision(prev => ({ ...prev, status: 'rendered' }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500'
      case 'rejected': return 'bg-red-500'
      case 'rendered': return 'bg-blue-500'
      default: return 'bg-yellow-500'
    }
  }

  const getEngineIcon = (engine: string) => {
    const icons = {
      manim: '📐',
      taichi: '🌊',
      blender: '🎬'
    }
    return icons[engine as keyof typeof icons] || '⚙️'
  }

  const renderDiffView = () => {
    if (revisions.length < 2) return null

    const previousRevision = revisions[revisions.length - 2]
    const currentLines = currentRevision.code.split('\n')
    const previousLines = previousRevision.code.split('\n')

    return (
      <div className="space-y-1 font-mono text-sm">
        {currentLines.map((line, index) => {
          const previousLine = previousLines[index]
          const isAdded = !previousLine || line !== previousLine
          const isRemoved = previousLine && !currentLines.includes(previousLine)

          return (
            <div
              key={index}
              className={`p-1 ${
                isAdded ? 'bg-green-500/20 border-l-2 border-green-500' :
                isRemoved ? 'bg-red-500/20 border-l-2 border-red-500' :
                'bg-transparent'
              }`}
            >
              <span className="text-muted-foreground w-6 inline-block text-right mr-3">
                {index + 1}
              </span>
              <span>{line}</span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Code Editor Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Code size={24} />
              <div>
                <CardTitle>Live Code Workspace</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {getEngineIcon(currentRevision.engine)} {currentRevision.engine} • {currentRevision.sceneId}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDiff(!showDiff)}
                className="gap-2"
              >
                <GitBranch size={16} />
                {showDiff ? 'Code' : 'Diff'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLocked(!isLocked)}
                className="gap-2"
              >
                {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
                {isLocked ? 'Locked' : 'Auto-Update'}
              </Button>

              <Button
                onClick={handleRender}
                disabled={currentRevision.status === 'rendered'}
                className="gap-2"
              >
                <Play size={16} />
                Render
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Status and Changes */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(currentRevision.status)}`} />
              <span className="font-medium capitalize">{currentRevision.status}</span>
              <span className="text-sm text-muted-foreground">
                {new Date(currentRevision.timestamp).toLocaleTimeString()}
              </span>
            </div>

            {currentRevision.status === 'draft' && (
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRejectRevision}
                >
                  Reject
                </Button>
                <Button 
                  size="sm"
                  onClick={handleApproveRevision}
                >
                  Approve
                </Button>
              </div>
            )}
          </div>

          {/* Recent Changes */}
          <div className="mb-4">
            <div className="text-sm font-medium mb-2">Recent Changes:</div>
            <div className="flex flex-wrap gap-1">
              {currentRevision.changes.map((change, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {change}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye size={20} />
              {showDiff ? 'Code Diff View' : 'Current Code'}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw size={16} />
              </Button>
              <Button variant="outline" size="sm">
                <Download size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <ScrollArea className="h-96 w-full">
            {showDiff ? (
              renderDiffView()
            ) : (
              <pre className="font-mono text-sm whitespace-pre-wrap">
                {currentRevision.code}
              </pre>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Revision History */}
      <Card>
        <CardHeader>
          <CardTitle>Revision History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {revisions.slice().reverse().map((revision) => (
              <div 
                key={revision.id}
                className={`p-3 border rounded cursor-pointer transition-colors ${
                  revision.id === currentRevision.id ? 'bg-accent' : 'hover:bg-muted'
                }`}
                onClick={() => setCurrentRevision(revision)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(revision.status)}`} />
                    <span className="font-medium text-sm">{revision.id}</span>
                    <Badge variant="outline" className="text-xs">
                      {getEngineIcon(revision.engine)} {revision.engine}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(revision.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {revision.changes.join(' • ')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LiveCodeWorkspace