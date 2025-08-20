import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  RefreshCw,
  Code,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCode,
  Timer
} from '@phosphor-icons/react'

interface CodeRevision {
  id: string
  shotId: string
  renderer: 'manim' | 'blender' | 'taichi'
  attempt: number
  timestamp: string
  issues: string[]
  changedCode: string
  status: 'pending' | 'rendering' | 'testing' | 'passed' | 'failed'
  qaScore?: number
  renderTime?: number
}

interface AutoFixEngineProps {
  shotId: string
  issues: string[]
  onRevisionComplete: (revision: CodeRevision) => void
}

export default function AutoFixEngine({ shotId, issues, onRevisionComplete }: AutoFixEngineProps) {
  const [revisions, setRevisions] = useState<CodeRevision[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentAttempt, setCurrentAttempt] = useState(0)

  const maxAttempts = 3
  const retryBudget = maxAttempts

  useEffect(() => {
    if (issues.length > 0 && !isProcessing) {
      triggerAutoFix()
    }
  }, [issues])

  const triggerAutoFix = async () => {
    if (currentAttempt >= maxAttempts) {
      console.log('Retry budget exhausted')
      return
    }

    setIsProcessing(true)
    const attempt = currentAttempt + 1
    setCurrentAttempt(attempt)

    // Determine renderer based on shot requirements
    const renderer = determineRenderer(issues)
    
    const revision: CodeRevision = {
      id: `revision-${Date.now()}-${attempt}`,
      shotId,
      renderer,
      attempt,
      timestamp: new Date().toISOString(),
      issues,
      changedCode: '',
      status: 'pending',
    }

    setRevisions(prev => [...prev, revision])

    try {
      // Step 1: Generate code fix
      revision.status = 'pending'
      updateRevision(revision)

      const codePrompt = spark.llmPrompt`Fix the following issues in ${renderer} code for physics video shot ${shotId}:

      Issues to address:
      ${issues.map(issue => `- ${issue}`).join('\n')}

      Generate corrected ${renderer} code that addresses these specific issues.
      
      For Manim: Include Scene.construct() with proper timing via .play() and .wait()
      For Blender: Include Python script for geometry nodes, keyframes, or VSE operations
      For Taichi: Include CUDA kernel code with proper boundary conditions

      Return only the corrected code, properly formatted.`

      const codeResponse = await spark.llm(codePrompt, "gpt-4o")
      revision.changedCode = codeResponse
      
      // Step 2: Simulate rendering
      revision.status = 'rendering'
      updateRevision(revision)
      
      await simulateRender(revision)
      
      // Step 3: Test quality
      revision.status = 'testing'
      updateRevision(revision)
      
      const qaScore = await performQualityTest(revision)
      revision.qaScore = qaScore
      
      // Step 4: Determine if passed
      if (qaScore > 0.85) {
        revision.status = 'passed'
        setIsProcessing(false)
        onRevisionComplete(revision)
      } else {
        revision.status = 'failed'
        updateRevision(revision)
        
        // Retry if budget allows
        if (attempt < maxAttempts) {
          setTimeout(() => triggerAutoFix(), 1000)
        } else {
          setIsProcessing(false)
        }
      }
      
    } catch (error) {
      revision.status = 'failed'
      updateRevision(revision)
      setIsProcessing(false)
    }
  }

  const updateRevision = (revision: CodeRevision) => {
    setRevisions(prev => prev.map(r => r.id === revision.id ? revision : r))
  }

  const determineRenderer = (issues: string[]): CodeRevision['renderer'] => {
    const issueText = issues.join(' ').toLowerCase()
    
    if (issueText.includes('equation') || issueText.includes('mathematical') || issueText.includes('symbol')) {
      return 'manim'
    }
    if (issueText.includes('physics') || issueText.includes('simulation') || issueText.includes('particle')) {
      return 'taichi'
    }
    return 'blender'
  }

  const simulateRender = async (revision: CodeRevision): Promise<void> => {
    // Simulate render time based on complexity
    const renderTime = Math.random() * 30000 + 10000 // 10-40 seconds
    revision.renderTime = renderTime
    
    return new Promise(resolve => {
      setTimeout(resolve, Math.min(renderTime, 3000)) // Cap demo time at 3s
    })
  }

  const performQualityTest = async (revision: CodeRevision): Promise<number> => {
    // Simulate LLaVA + SSIM quality assessment
    const baseScore = Math.random() * 0.3 + 0.6 // 0.6-0.9 base range
    
    // Higher attempts have better chance of success
    const attemptBonus = (revision.attempt - 1) * 0.1
    
    return Math.min(baseScore + attemptBonus, 1.0)
  }

  const getStatusIcon = (status: CodeRevision['status']) => {
    switch (status) {
      case 'pending': return <Timer className="w-4 h-4 text-blue-500" />
      case 'rendering': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
      case 'testing': return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'passed': return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Auto-Fix Engine
            {isProcessing && <Badge variant="outline">Processing</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Current Attempt</div>
              <div className="font-medium">{currentAttempt} / {maxAttempts}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Retry Budget</div>
              <div className="font-medium">{maxAttempts - currentAttempt} remaining</div>
            </div>
            <div>
              <div className="text-muted-foreground">Success Rate</div>
              <div className="font-medium">
                {revisions.filter(r => r.status === 'passed').length} / {revisions.length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {revisions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Revision History</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {revisions.map((revision) => (
                  <div key={revision.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(revision.status)}
                        <span className="font-medium text-sm">
                          Attempt {revision.attempt} - {revision.renderer}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {revision.qaScore && (
                          <Badge variant={revision.qaScore > 0.85 ? 'default' : 'destructive'}>
                            QA: {Math.round(revision.qaScore * 100)}%
                          </Badge>
                        )}
                        {revision.renderTime && (
                          <span className="text-xs text-muted-foreground">
                            {Math.round(revision.renderTime / 1000)}s
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">
                        <strong>Issues addressed:</strong>
                      </div>
                      <div className="text-xs space-y-1">
                        {revision.issues.map((issue, idx) => (
                          <div key={idx} className="flex items-start gap-1">
                            <span className="text-red-600">•</span>
                            <span>{issue}</span>
                          </div>
                        ))}
                      </div>

                      {revision.changedCode && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                            <FileCode className="w-3 h-3 inline mr-1" />
                            View generated code
                          </summary>
                          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                            <code>{revision.changedCode.slice(0, 500)}...</code>
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}