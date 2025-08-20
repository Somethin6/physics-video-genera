import React, { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ZoomIn, ZoomOut, Move, TargetSimple } from '@phosphor-icons/react'
import { RenderFrame } from '@/lib/types'

interface FrameViewerProps {
  frame?: RenderFrame
  showIssueOverlays?: boolean
  className?: string
}

export default function FrameViewer({ frame, showIssueOverlays = false, className = '' }: FrameViewerProps) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // Mock frame rendering - in production this would load actual frame images
  useEffect(() => {
    if (!frame || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Generate mock physics visualization
    canvas.width = 1920
    canvas.height = 1080
    
    // Clear canvas
    ctx.fillStyle = '#0a0a0b'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Generate mock physics content based on frame number
    const time = frame.frameNumber / 30
    
    // Mock electric field visualization
    ctx.strokeStyle = '#60a5fa'
    ctx.lineWidth = 2
    
    // Draw field lines
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2 + time * 0.5
      const x = canvas.width / 2 + Math.cos(angle) * 200
      const y = canvas.height / 2 + Math.sin(angle) * 200
      const endX = canvas.width / 2 + Math.cos(angle) * 400
      const endY = canvas.height / 2 + Math.sin(angle) * 400
      
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(endX, endY)
      ctx.stroke()
      
      // Arrow heads
      const arrowLength = 15
      const arrowAngle = 0.5
      ctx.beginPath()
      ctx.moveTo(endX, endY)
      ctx.lineTo(
        endX - arrowLength * Math.cos(angle - arrowAngle),
        endY - arrowLength * Math.sin(angle - arrowAngle)
      )
      ctx.moveTo(endX, endY)
      ctx.lineTo(
        endX - arrowLength * Math.cos(angle + arrowAngle),
        endY - arrowLength * Math.sin(angle + arrowAngle)
      )
      ctx.stroke()
    }
    
    // Central charge
    ctx.fillStyle = '#ef4444'
    ctx.beginPath()
    ctx.arc(canvas.width / 2, canvas.height / 2, 20, 0, Math.PI * 2)
    ctx.fill()
    
    // Mock equation overlay
    ctx.fillStyle = '#ffffff'
    ctx.font = '32px JetBrains Mono'
    ctx.fillText('∇·E = ρ/ε₀', 50, 80)
    
    // Add some animated elements
    ctx.fillStyle = '#22c55e'
    ctx.beginPath()
    ctx.arc(
      canvas.width / 2 + Math.cos(time * 2) * 150,
      canvas.height / 2 + Math.sin(time * 2) * 150,
      8,
      0,
      Math.PI * 2
    )
    ctx.fill()
    
  }, [frame])
  
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }
  
  const handleMouseUp = () => {
    setIsDragging(false)
  }
  
  const handleZoom = (direction: 'in' | 'out') => {
    setZoom(prev => {
      const factor = direction === 'in' ? 1.25 : 0.8
      return Math.max(0.1, Math.min(5, prev * factor))
    })
  }
  
  const resetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }
  
  if (!frame) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <p className=\"text-muted-foreground\">No frame selected</p>
      </div>
    )
  }
  
  return (
    <div className={`relative overflow-hidden bg-background ${className}`}>
      {/* Zoom Controls */}
      <div className=\"absolute top-4 right-4 z-10 flex flex-col gap-2\">
        <Button size=\"sm\" variant=\"outline\" onClick={() => handleZoom('in')}>
          <ZoomIn size={16} />
        </Button>
        <Button size=\"sm\" variant=\"outline\" onClick={() => handleZoom('out')}>
          <ZoomOut size={16} />
        </Button>
        <Button size=\"sm\" variant=\"outline\" onClick={resetView}>
          <TargetSimple size={16} />
        </Button>
      </div>
      
      {/* Frame Status */}
      <div className=\"absolute top-4 left-4 z-10\">
        <Badge variant=\"outline\" className=\"bg-background/90 backdrop-blur-sm\">
          {frame.metadata.renderer} • {frame.metadata.resolution.width}×{frame.metadata.resolution.height}
        </Badge>
      </div>
      
      {/* Zoom Level */}
      <div className=\"absolute bottom-4 right-4 z-10\">
        <Badge variant=\"outline\" className=\"bg-background/90 backdrop-blur-sm font-mono\">
          {(zoom * 100).toFixed(0)}%
        </Badge>
      </div>
      
      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className=\"w-full h-full flex items-center justify-center overflow-hidden cursor-move\"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center'
          }}
          className=\"transition-transform duration-75\"
        >
          <canvas
            ref={canvasRef}
            className=\"border border-border rounded shadow-lg\"
            style={{
              width: '800px',
              height: '450px',
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          />
          
          {/* Issue Overlays */}
          {showIssueOverlays && frame.issues && (
            <div className=\"absolute inset-0 pointer-events-none\">
              {frame.issues.map((issue) => (
                <div
                  key={issue.id}
                  className=\"absolute border-2 border-destructive bg-destructive/10 pointer-events-auto\"
                  style={{
                    left: `${(issue.region?.x || 0) / 1920 * 100}%`,
                    top: `${(issue.region?.y || 0) / 1080 * 100}%`,
                    width: `${(issue.region?.width || 0) / 1920 * 100}%`,
                    height: `${(issue.region?.height || 0) / 1080 * 100}%`
                  }}
                >
                  <div className=\"absolute -top-6 left-0 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded text-nowrap\">
                    {issue.type.replace('_', ' ')} • {issue.severity}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}