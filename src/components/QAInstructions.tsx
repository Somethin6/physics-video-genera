import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Eye, Activity, BarChart3, Lightbulb, Cpu, Monitor, Zap } from 'lucide-react'

export default function QAInstructions() {
  return (
    <div className="space-y-6">
      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          The Render Preview & QA Analysis system implements the LLaVA vision model + quantitative metrics approach 
          described in your physics video pipeline. Click "Create Demo Project" to see it in action.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye size={16} className="text-blue-600" />
              LLaVA Vision Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <CardDescription className="text-xs">
              AI-powered semantic analysis asking targeted questions about frame content
            </CardDescription>
            <div className="space-y-1">
              <Badge variant="outline" className="text-xs">Physics Accuracy</Badge>
              <Badge variant="outline" className="text-xs">Visual Clarity</Badge>
              <Badge variant="outline" className="text-xs">Composition</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Questions like "Is ∇·E > 0 indicated outside the positive charge?"
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 size={16} className="text-green-600" />
              Quantitative Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <CardDescription className="text-xs">
              Computer vision metrics for technical quality assessment
            </CardDescription>
            <div className="space-y-1">
              <Badge variant="outline" className="text-xs">SSIM Comparison</Badge>
              <Badge variant="outline" className="text-xs">Optical Flow</Badge>
              <Badge variant="outline" className="text-xs">Motion Analysis</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Automated detection of jitter, continuity issues, and quality degradation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity size={16} className="text-orange-600" />
              Self-Improvement Loop
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <CardDescription className="text-xs">
              AI watches its own renders and iteratively improves quality
            </CardDescription>
            <div className="space-y-1">
              <Badge variant="outline" className="text-xs">Auto-Fix Code</Badge>
              <Badge variant="outline" className="text-xs">Re-render</Badge>
              <Badge variant="outline" className="text-xs">Quality Gates</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Continue until objective checks pass or retry budget exhausted
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-accent/20 bg-accent/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Cpu size={20} />
            Pipeline Integration
          </CardTitle>
          <CardDescription>
            How the QA system fits into the complete physics video pipeline
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Render Engines Supported</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Manim</Badge>
                  <span className="text-xs text-muted-foreground">Math animations & equations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Blender</Badge>
                  <span className="text-xs text-muted-foreground">3D scenes & compositing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Taichi</Badge>
                  <span className="text-xs text-muted-foreground">Physics simulations</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Analysis Features</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Monitor size={14} />
                  <span className="text-xs">Frame-by-frame preview</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye size={14} />
                  <span className="text-xs">Issue region highlighting</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap size={14} />
                  <span className="text-xs">Motion continuity analysis</span>
                </div>
              </div>
            </div>
          </div>
          
          <Alert>
            <Activity className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Next Steps:</strong> This system implements the core QA framework described in your blueprint. 
              In production, it would connect to local LLaVA + NeoX-20B models running via llama.cpp for true 
              offline analysis.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}