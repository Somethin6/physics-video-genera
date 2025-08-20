/**
 * QA Instructions Component
 * Provides guidance and remediation suggestions for quality issues
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, AlertTriangle, Info, Zap, Book, Settings } from '@phosphor-icons/react'

interface QAInstructionsProps {
  issues?: Array<{
    type: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    description: string
    suggestion?: string
    autoFixable?: boolean
  }>
  onAutoFix?: (issueType: string) => void
}

export default function QAInstructions({ issues = [], onAutoFix }: QAInstructionsProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />
      case 'medium':
        return <Info className="h-4 w-4" />
      case 'low':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const commonIssues = [
    {
      type: 'motion-blur',
      title: 'Motion Blur Issues',
      description: 'Excessive motion blur can reduce visual clarity',
      suggestions: [
        'Increase frame rate for smoother motion',
        'Adjust camera movement speed',
        'Use motion vector-based blur reduction'
      ]
    },
    {
      type: 'compression-artifacts',
      title: 'Compression Artifacts',
      description: 'Visible compression artifacts affecting quality',
      suggestions: [
        'Increase bitrate for encoding',
        'Use higher quality preset (slower encoding)',
        'Check source material quality'
      ]
    },
    {
      type: 'color-accuracy',
      title: 'Color Management',
      description: 'Colors may not match intended appearance',
      suggestions: [
        'Verify OCIO configuration is loaded',
        'Check display transform settings',
        'Ensure consistent color space throughout pipeline'
      ]
    },
    {
      type: 'text-legibility',
      title: 'Text Readability',
      description: 'Text or equations may be difficult to read',
      suggestions: [
        'Increase font size for better visibility',
        'Improve contrast between text and background',
        'Use anti-aliasing for smoother text rendering',
        'Consider text placement and timing'
      ]
    }
  ]

  const physicsSpecificGuidance = [
    {
      category: 'Mathematical Notation',
      items: [
        'Ensure equations are large enough to read clearly',
        'Use consistent mathematical notation throughout',
        'Consider animation timing for complex derivations',
        'Verify Greek letters and symbols render correctly'
      ]
    },
    {
      category: 'Scientific Visualization',
      items: [
        'Use appropriate color schemes for data visualization',
        'Ensure vector fields and force arrows are clearly visible',
        'Validate physical accuracy of simulations',
        'Check units and scales are properly labeled'
      ]
    },
    {
      category: 'Animation Quality',
      items: [
        'Smooth transitions between physics concepts',
        'Consistent lighting and materials in 3D scenes',
        'Proper temporal sampling for dynamic systems',
        'Clear visual hierarchy and focus'
      ]
    }
  ]

  return (
    <div className="space-y-6">
      {issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Issues Found ({issues.length})
            </CardTitle>
            <CardDescription>
              Quality issues detected in current analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {issues.map((issue, index) => (
              <Alert key={index}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(issue.severity)}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-white ${getSeverityColor(issue.severity)}`}>
                          {issue.severity}
                        </Badge>
                        <span className="font-medium capitalize">
                          {issue.type.replace('-', ' ')}
                        </span>
                      </div>
                      <AlertDescription>
                        {issue.description}
                      </AlertDescription>
                      {issue.suggestion && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Suggestion:</strong> {issue.suggestion}
                        </p>
                      )}
                    </div>
                  </div>
                  {issue.autoFixable && onAutoFix && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAutoFix(issue.type)}
                      className="ml-2"
                    >
                      <Zap className="h-4 w-4 mr-1" />
                      Auto Fix
                    </Button>
                  )}
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="common" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="common">Common Issues</TabsTrigger>
          <TabsTrigger value="physics">Physics Specific</TabsTrigger>
          <TabsTrigger value="settings">Quality Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="common" className="space-y-4">
          <div className="grid gap-4">
            {commonIssues.map((issue, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base">{issue.title}</CardTitle>
                  <CardDescription>{issue.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {issue.suggestions.map((suggestion, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="physics" className="space-y-4">
          <div className="space-y-4">
            {physicsSpecificGuidance.map((section, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Book className="h-4 w-4" />
                    {section.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Recommended Quality Settings
              </CardTitle>
              <CardDescription>
                Optimal settings for physics educational content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium">Rendering</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Resolution: 1920×1080 minimum</li>
                    <li>• Frame rate: 30fps for smooth motion</li>
                    <li>• Bit depth: 10-bit for color accuracy</li>
                    <li>• Motion blur: Moderate (0.5 shutter angle)</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Encoding</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Codec: H.264 with hardware acceleration</li>
                    <li>• Bitrate: 8-12 Mbps for 1080p</li>
                    <li>• Color space: Rec.709</li>
                    <li>• Audio: 48kHz, stereo, AAC</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Physics Content</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Font size: Minimum 24pt for equations</li>
                    <li>• Contrast ratio: 4.5:1 minimum</li>
                    <li>• Animation speed: 3-5 seconds per concept</li>
                    <li>• Simulation accuracy: Physics-validated</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Quality Assurance</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• SSIM threshold: 0.9 minimum</li>
                    <li>• Motion stability: 0.8 minimum</li>
                    <li>• Text legibility: 0.85 minimum</li>
                    <li>• Color accuracy: 0.95 minimum</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}