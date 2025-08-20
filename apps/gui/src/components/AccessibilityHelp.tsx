import React from 'react'
import { AlertTriangle, RefreshCw, Keyboard, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AccessibilityHelpProps {
  onClose: () => void
}

export default function AccessibilityHelp({ onClose }: AccessibilityHelpProps) {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Accessibility Features & Help
        </CardTitle>
        <CardDescription>
          This application is designed to be accessible to all users, including those using assistive technologies.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Keyboard className="h-4 w-4" />
            Keyboard Navigation
          </h3>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Tab</kbd>
              <span>Navigate forward through interactive elements</span>
            </div>
            <div className="flex justify-between">
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Shift + Tab</kbd>
              <span>Navigate backward through interactive elements</span>
            </div>
            <div className="flex justify-between">
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter / Space</kbd>
              <span>Activate buttons and links</span>
            </div>
            <div className="flex justify-between">
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Escape</kbd>
              <span>Close dialogs and menus</span>
            </div>
            <div className="flex justify-between">
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Arrow Keys</kbd>
              <span>Navigate within menus and controls</span>
            </div>
            <div className="flex justify-between">
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl + /</kbd>
              <span>Show this help dialog</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Screen Reader Support</h3>
          <ul className="space-y-2 text-sm list-disc list-inside">
            <li>All interactive elements have proper labels and descriptions</li>
            <li>Form fields include helpful instructions and error messages</li>
            <li>Dynamic content changes are announced to screen readers</li>
            <li>Video and audio content includes transcripts and captions</li>
            <li>Progress indicators provide clear status updates</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Visual Accessibility</h3>
          <ul className="space-y-2 text-sm list-disc list-inside">
            <li>High contrast color scheme meets WCAG AA standards</li>
            <li>Text can be resized up to 200% without loss of functionality</li>
            <li>Focus indicators are clearly visible</li>
            <li>Color is never the only way to convey information</li>
            <li>Animations can be reduced via system preferences</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Motor Accessibility</h3>
          <ul className="space-y-2 text-sm list-disc list-inside">
            <li>Large click targets (minimum 44x44 pixels)</li>
            <li>Generous spacing between interactive elements</li>
            <li>Drag and drop operations have keyboard alternatives</li>
            <li>Time limits can be extended or disabled</li>
            <li>Sticky drag tolerance prevents accidental activation</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Cognitive Accessibility</h3>
          <ul className="space-y-2 text-sm list-disc list-inside">
            <li>Clear, consistent navigation structure</li>
            <li>Simple language and helpful error messages</li>
            <li>Multiple ways to find and access content</li>
            <li>Auto-save prevents data loss</li>
            <li>Progress indicators show current status and next steps</li>
          </ul>
        </div>

        <div className="pt-4 border-t">
          <h3 className="font-semibold mb-3">Need Help?</h3>
          <p className="text-sm text-muted-foreground mb-3">
            If you encounter any accessibility barriers, please contact our support team:
          </p>
          <ul className="text-sm space-y-1">
            <li>Email: accessibility@physics-foundry.com</li>
            <li>GitHub Issues: Report accessibility issues</li>
            <li>Documentation: Full accessibility guide available</li>
          </ul>
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>
            Close Help
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Hook for accessibility features
export function useAccessibility() {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Global keyboard shortcuts
      if (event.ctrlKey && event.key === '/') {
        event.preventDefault()
        // Show accessibility help - you'd implement this in your app
        console.log('Show accessibility help')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Announce changes to screen readers
  const announce = React.useCallback((message: string) => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.style.position = 'absolute'
    announcement.style.left = '-10000px'
    announcement.style.width = '1px'
    announcement.style.height = '1px'
    announcement.style.overflow = 'hidden'
    announcement.textContent = message

    document.body.appendChild(announcement)
    
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }, [])

  // Focus management
  const focusFirst = React.useCallback((container: HTMLElement) => {
    const focusable = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusable[0] as HTMLElement
    if (firstElement) {
      firstElement.focus()
    }
  }, [])

  // Skip to main content
  const skipToMain = React.useCallback(() => {
    const main = document.querySelector('main')
    if (main) {
      main.focus()
      main.scrollIntoView()
    }
  }, [])

  return {
    announce,
    focusFirst, 
    skipToMain,
  }
}