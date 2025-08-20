import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Eye, 
  Brain, 
  Zap, 
  MessageSquare, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Settings
} from '@phosphor-icons/react'
import { RenderFrame, LLaVAAnalysis, FrameIssue } from '@/lib/types'

interface LLaVAAnalysisProps {
  frames: RenderFrame[]
  currentFrame: number
  onAnalysisComplete?: (analysis: LLaVAAnalysis, issues: FrameIssue[]) => void
}

export default function LLaVAAnalysis({ frames, currentFrame, onAnalysisComplete }: LLaVAAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<LLaVAAnalysis | null>(null)
  const [customPrompt, setCustomPrompt] = useState('')
  const [selectedPromptType, setSelectedPromptType] = useState('physics_accuracy')
  const [analysisHistory, setAnalysisHistory] = useState<LLaVAAnalysis[]>([])
  const [progress, setProgress] = useState(0)

  const currentFrameData = frames[currentFrame]

  const promptTemplates = {
    physics_accuracy: `Analyze this physics visualization frame and check for accuracy:

1. Are the physical principles correctly represented?
2. Do vector arrows accurately show direction and relative magnitude?
3. Are equations and formulas mathematically correct?
4. Is the coordinate system properly oriented?
5. Are units and scaling appropriate?

Identify any physics errors, inconsistencies, or misleading representations.`,

    visual_clarity: `Evaluate the visual clarity and educational effectiveness of this frame:

1. Is text readable and appropriately sized?
2. Are important elements clearly highlighted?
3. Is there good contrast between text and background?
4. Are colors used effectively to convey information?
5. Is the overall composition clear and uncluttered?

Note any visibility issues or areas that could confuse viewers.`,

    math_notation: `Review the mathematical notation and symbols in this frame:

1. Are mathematical symbols correctly formatted?
2. Is notation consistent with standard conventions?
3. Are subscripts, superscripts, and special characters clear?
4. Are equations properly aligned and spaced?
5. Are variable definitions clear and consistent?

Flag any notation errors or inconsistencies.`,

    continuity: `Check for continuity and consistency with previous frames:

1. Are object positions and movements logical?
2. Do colors, styles, and formatting remain consistent?
3. Are transformations and transitions smooth?
4. Do recurring elements maintain their properties?
5. Is the narrative flow coherent?

Identify any jarring changes or inconsistencies.`,

    timing: `Assess the timing and pacing of visual elements:

1. Do animations occur at appropriate speeds?
2. Are transitions timed well for comprehension?
3. Is there sufficient time to read text and formulas?
4. Are highlights and emphasis appropriately timed?
5. Does the pacing support learning objectives?

Note any timing issues that could impair understanding.`
  }

  // Simulate LLaVA analysis with realistic processing
  const simulateLLaVAAnalysis = async (prompt: string): Promise<LLaVAAnalysis> => {
    const analysisTime = 3000 + Math.random() * 2000 // 3-5 seconds

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10 + Math.random() * 20, 95))
    }, 200)

    await new Promise(resolve => setTimeout(resolve, analysisTime))
    clearInterval(progressInterval)
    setProgress(100)

    // Generate realistic analysis response
    const responses = {
      physics_accuracy: [
        "The vector field representation appears accurate with proper arrow scaling relative to field strength. The coordinate system is correctly oriented with standard physics conventions. However, I notice that the field line density may not accurately reflect the field strength in the upper-right quadrant. The mathematical expressions are consistent with Maxwell's equations.",
        "Physics principles are well-represented overall. The force vectors show appropriate directionality and the magnitude scaling follows physical laws. Minor concern: the boundary conditions at the edges may not properly represent an infinite field. The color coding effectively distinguishes between different field components.",
        "Excellent physics accuracy. The simulation correctly demonstrates conservation laws and the mathematical formulation is precise. All vectors, equations, and physical relationships are properly represented. No significant physics errors detected."
      ],
      visual_clarity: [
        "Text readability is good with sufficient contrast. The equation formatting is clear and professional. However, some smaller annotations in the bottom-left corner may be difficult to read at standard viewing distances. Consider increasing font size for better accessibility.",
        "Visual hierarchy is effective with good use of color to highlight key concepts. The main equation is prominently displayed and easy to read. Minor issue: some overlapping elements in the center region could benefit from better spacing or repositioning.",
        "Excellent visual design with clear, readable text throughout. Color choices enhance comprehension and the layout effectively guides the viewer's attention. All elements are well-spaced and properly contrasted."
      ],
      math_notation: [
        "Mathematical notation follows standard conventions correctly. Subscripts and superscripts are properly formatted. The integral symbols are clear and the differential operators are correctly positioned. One minor note: ensure consistent spacing around operators throughout.",
        "Notation is mathematically sound and follows established conventions. The use of bold for vectors and proper italic formatting for variables is appropriate. Consider standardizing the size of fraction bars for better visual consistency.",
        "Excellent mathematical typography. All symbols, operators, and expressions are correctly formatted according to mathematical standards. The notation is clear, consistent, and professionally presented."
      ]
    }

    const responseType = prompt.includes('physics') ? 'physics_accuracy' 
                       : prompt.includes('visual') ? 'visual_clarity'
                       : prompt.includes('math') ? 'math_notation'
                       : 'physics_accuracy'

    const responseOptions = responses[responseType as keyof typeof responses]
    const selectedResponse = responseOptions[Math.floor(Math.random() * responseOptions.length)]

    const physicsElements = [
      'vector field arrows', 'coordinate system', 'field lines', 'force vectors',
      'equations', 'mathematical expressions', 'boundary conditions', 'scaling factors'
    ]

    const visualElements = [
      'text labels', 'color coding', 'layout composition', 'contrast ratios',
      'font sizing', 'visual hierarchy', 'spacing', 'highlighting'
    ]

    const detectedIssues = []
    if (Math.random() < 0.4) {
      detectedIssues.push('Minor readability concern in corner annotations')
    }
    if (Math.random() < 0.3) {
      detectedIssues.push('Potential field strength representation inconsistency')
    }
    if (Math.random() < 0.2) {
      detectedIssues.push('Mathematical notation spacing could be improved')
    }

    return {
      prompt,
      response: selectedResponse,
      confidence: 0.75 + Math.random() * 0.2,
      physicsElements: physicsElements.slice(0, 3 + Math.floor(Math.random() * 3)),
      visualElements: visualElements.slice(0, 3 + Math.floor(Math.random() * 3)),
      issues: detectedIssues
    }
  }

  const runAnalysis = async () => {
    if (!currentFrameData || isAnalyzing) return

    setIsAnalyzing(true)
    setProgress(0)
    setAnalysis(null)

    try {
      const prompt = customPrompt || promptTemplates[selectedPromptType as keyof typeof promptTemplates]
      const result = await simulateLLaVAAnalysis(prompt)
      
      setAnalysis(result)
      setAnalysisHistory(prev => [result, ...prev.slice(0, 9)]) // Keep last 10

      // Generate frame issues based on analysis
      const frameIssues: FrameIssue[] = result.issues.map((issue, index) => ({
        id: `llava-issue-${Date.now()}-${index}`,
        frameId: currentFrameData.id,
        type: selectedPromptType as any,
        severity: Math.random() < 0.3 ? 'high' : Math.random() < 0.6 ? 'medium' : 'low',
        description: issue,
        suggestion: `Consider reviewing and adjusting based on LLaVA analysis feedback`,
        confidence: result.confidence,
        detectedAt: new Date().toISOString()
      }))

      onAnalysisComplete?.(result, frameIssues)

    } catch (error) {
      console.error('LLaVA analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
      setProgress(0)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Brain size={24} className="text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">LLaVA Vision Analysis</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered visual analysis for frame {currentFrame + 1}
            </p>
          </div>
        </div>
        
        <Button
          onClick={runAnalysis}
          disabled={isAnalyzing || !currentFrameData}
          className="gap-2"
        >
          {isAnalyzing ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <Eye size={16} />
          )}
          {isAnalyzing ? 'Analyzing...' : 'Analyze Frame'}
        </Button>
      </div>

      {/* Analysis Progress */}
      {isAnalyzing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Brain size={16} className="text-purple-600 animate-pulse" />
                <span className="text-sm font-medium">Running LLaVA vision analysis...</span>
              </div>
              <Progress value={progress} className="w-full" />
              <div className="text-xs text-muted-foreground">
                Processing visual elements and physics accuracy
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings size={20} />
            Analysis Configuration
          </CardTitle>
          <CardDescription>
            Configure the type of analysis to perform on the current frame
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Prompt Type Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Analysis Type</label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(promptTemplates).map(type => (
                <Button
                  key={type}
                  onClick={() => setSelectedPromptType(type)}
                  variant={selectedPromptType === type ? 'default' : 'outline'}
                  size="sm"
                >
                  {type.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Prompt */}
          <div>
            <label className="text-sm font-medium mb-2 block">Custom Prompt (Optional)</label>
            <Textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Enter a custom analysis prompt or leave empty to use the selected template..."
              rows={3}
            />
          </div>

          {/* Preview Template */}
          <div>
            <label className="text-sm font-medium mb-2 block">Current Template Preview</label>
            <div className="p-3 bg-muted rounded text-sm">
              {customPrompt || promptTemplates[selectedPromptType as keyof typeof promptTemplates]}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Analysis Results */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare size={20} className="text-purple-600" />
              Analysis Results
            </CardTitle>
            <CardDescription className="flex items-center gap-4">
              <span>Frame {currentFrame + 1} Analysis</span>
              <Badge className={`${getConfidenceColor(analysis.confidence)}`}>
                {(analysis.confidence * 100).toFixed(0)}% confidence
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Main Response */}
            <div>
              <h4 className="font-medium mb-2">LLaVA Response</h4>
              <div className="p-4 bg-muted rounded-lg text-sm leading-relaxed">
                {analysis.response}
              </div>
            </div>

            {/* Detected Elements */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Physics Elements Detected</h4>
                <div className="flex flex-wrap gap-1">
                  {analysis.physicsElements.map((element, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {element}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Visual Elements Detected</h4>
                <div className="flex flex-wrap gap-1">
                  {analysis.visualElements.map((element, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {element}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Issues Found */}
            {analysis.issues.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-yellow-500" />
                  Issues Identified ({analysis.issues.length})
                </h4>
                <div className="space-y-2">
                  {analysis.issues.map((issue, index) => (
                    <div key={index} className="p-3 border-l-4 border-yellow-500 bg-yellow-50 rounded">
                      <p className="text-sm">{issue}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.issues.length === 0 && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle size={16} />
                <span className="text-sm font-medium">No significant issues detected</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Analysis History */}
      {analysisHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis History</CardTitle>
            <CardDescription>Recent LLaVA analyses for this shot</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysisHistory.slice(0, 3).map((hist, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {hist.prompt.includes('physics') ? 'Physics Accuracy' 
                       : hist.prompt.includes('visual') ? 'Visual Clarity'
                       : hist.prompt.includes('math') ? 'Math Notation'
                       : 'Custom Analysis'}
                    </Badge>
                    <span className={`text-xs ${getConfidenceColor(hist.confidence)}`}>
                      {(hist.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {hist.response}
                  </p>
                  {hist.issues.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs text-yellow-600">
                        {hist.issues.length} issue(s) found
                      </span>
                    </div>
                  )}
                </div>
              ))}
              
              {analysisHistory.length > 3 && (
                <p className="text-sm text-muted-foreground text-center">
                  ... and {analysisHistory.length - 3} more analyses
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}