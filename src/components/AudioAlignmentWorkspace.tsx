/**
 * Audio Alignment Workspace
 * Handles voiceover recording, forced alignment, and timing synchronization
 */

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Microphone, 
  Play, 
  Pause, 
  Stop, 
  Upload, 
  Waveform,
  AlignCenter,
  Clock,
  CheckCircle,
  AlertCircle,
  Volume2
} from '@phosphor-icons/react'

interface WordAlignment {
  word: string
  startTime: number
  endTime: number
  confidence: number
  sceneId?: string
}

interface ScriptSegment {
  id: string
  text: string
  expectedDuration: number
  actualDuration?: number
  alignment?: WordAlignment[]
  status: 'pending' | 'aligned' | 'mismatch' | 'corrected'
}

interface AudioAlignmentWorkspaceProps {
  script?: ScriptSegment[]
  onAlignmentComplete?: (alignments: ScriptSegment[]) => void
}

const mockScript: ScriptSegment[] = [
  {
    id: 'seg_001',
    text: "Welcome to our exploration of the quantum harmonic oscillator.",
    expectedDuration: 3.5,
    actualDuration: 3.8,
    status: 'aligned',
    alignment: [
      { word: 'Welcome', startTime: 0.0, endTime: 0.6, confidence: 0.95 },
      { word: 'to', startTime: 0.6, endTime: 0.8, confidence: 0.98 },
      { word: 'our', startTime: 0.8, endTime: 1.0, confidence: 0.92 },
      { word: 'exploration', startTime: 1.0, endTime: 1.8, confidence: 0.89 },
      { word: 'of', startTime: 1.8, endTime: 2.0, confidence: 0.96 },
      { word: 'the', startTime: 2.0, endTime: 2.2, confidence: 0.97 },
      { word: 'quantum', startTime: 2.2, endTime: 2.8, confidence: 0.93 },
      { word: 'harmonic', startTime: 2.8, endTime: 3.3, confidence: 0.91 },
      { word: 'oscillator', startTime: 3.3, endTime: 3.8, confidence: 0.88 }
    ]
  },
  {
    id: 'seg_002',
    text: "This fundamental system demonstrates the principles of quantum mechanics.",
    expectedDuration: 4.2,
    actualDuration: 4.7,
    status: 'mismatch',
    alignment: [
      { word: 'This', startTime: 3.8, endTime: 4.1, confidence: 0.94 },
      { word: 'fundamental', startTime: 4.1, endTime: 4.9, confidence: 0.87 },
      { word: 'system', startTime: 4.9, endTime: 5.4, confidence: 0.92 },
      { word: 'demonstrates', startTime: 5.4, endTime: 6.2, confidence: 0.85 },
      { word: 'the', startTime: 6.2, endTime: 6.4, confidence: 0.97 },
      { word: 'principles', startTime: 6.4, endTime: 7.1, confidence: 0.89 },
      { word: 'of', startTime: 7.1, endTime: 7.3, confidence: 0.95 },
      { word: 'quantum', startTime: 7.3, endTime: 7.8, confidence: 0.91 },
      { word: 'mechanics', startTime: 7.8, endTime: 8.5, confidence: 0.88 }
    ]
  },
  {
    id: 'seg_003',
    text: "Let's begin by examining the classical harmonic oscillator.",
    expectedDuration: 3.8,
    status: 'pending'
  }
]

const AudioAlignmentWorkspace: React.FC<AudioAlignmentWorkspaceProps> = ({
  script = mockScript,
  onAlignmentComplete
}) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [alignmentProgress, setAlignmentProgress] = useState(0)
  const [isAligning, setIsAligning] = useState(false)
  const [selectedSegment, setSelectedSegment] = useState<ScriptSegment | null>(null)

  const audioRef = useRef<HTMLAudioElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', () => setIsPlaying(false))

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', () => setIsPlaying(false))
    }
  }, [])

  const handleRecord = () => {
    if (isRecording) {
      setIsRecording(false)
      // Stop recording logic
    } else {
      setIsRecording(true)
      // Start recording logic
    }
  }

  const handlePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play()
      setIsPlaying(true)
    }
  }

  const handleStop = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.pause()
    audio.currentTime = 0
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    if (audioRef.current) {
      audioRef.current.src = url
    }
  }

  const handleForceAlign = async () => {
    setIsAligning(true)
    setAlignmentProgress(0)

    // Simulate forced alignment process
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200))
      setAlignmentProgress(i)
    }

    setIsAligning(false)
    onAlignmentComplete?.(script)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 100)
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aligned':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'mismatch':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'corrected':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aligned': return 'text-green-600'
      case 'mismatch': return 'text-yellow-600'
      case 'corrected': return 'text-blue-600'
      default: return 'text-muted-foreground'
    }
  }

  const renderWaveform = () => {
    // Simplified waveform visualization
    const segments = script.filter(s => s.alignment)
    
    return (
      <div className="h-24 bg-muted rounded relative overflow-hidden">
        <div className="absolute inset-0 flex items-center">
          {segments.map((segment, index) => {
            const segmentWidth = (segment.actualDuration || segment.expectedDuration) / duration * 100
            const segmentStart = (segment.alignment?.[0]?.startTime || 0) / duration * 100
            
            return (
              <div
                key={segment.id}
                className={`h-full border-l-2 border-r-2 ${
                  segment.status === 'aligned' ? 'bg-green-500/20 border-green-500' :
                  segment.status === 'mismatch' ? 'bg-yellow-500/20 border-yellow-500' :
                  'bg-blue-500/20 border-blue-500'
                }`}
                style={{
                  left: `${segmentStart}%`,
                  width: `${segmentWidth}%`
                }}
                onClick={() => setSelectedSegment(segment)}
              >
                <div className="h-full flex items-center justify-center">
                  <div className="text-xs font-mono">
                    {index + 1}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Audio Control */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Microphone size={24} />
              Voice Recording & Alignment
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Upload size={16} />
                Upload Audio
              </Button>
              
              <Button
                variant={isRecording ? "destructive" : "default"}
                onClick={handleRecord}
                className="gap-2"
              >
                <Microphone size={16} />
                {isRecording ? 'Stop Recording' : 'Record'}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Audio Player */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePlayPause}
                disabled={!duration}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleStop}
                disabled={!duration}
              >
                <Stop size={16} />
              </Button>
            </div>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <Progress value={(currentTime / duration) * 100} className="h-2" />
            </div>
            
            <Volume2 size={16} className="text-muted-foreground" />
          </div>

          {/* Waveform & Segments */}
          {duration > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Audio Timeline</div>
              {renderWaveform()}
            </div>
          )}

          {/* Alignment Controls */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-3">
              <Button
                onClick={handleForceAlign}
                disabled={isAligning || !duration}
                className="gap-2"
              >
                <AlignCenter size={16} />
                {isAligning ? 'Aligning...' : 'Force Align'}
              </Button>
              
              {isAligning && (
                <div className="flex items-center gap-2">
                  <Progress value={alignmentProgress} className="w-32 h-2" />
                  <span className="text-sm text-muted-foreground">
                    {alignmentProgress}%
                  </span>
                </div>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground">
              {script.filter(s => s.status === 'aligned').length} / {script.length} segments aligned
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Script Segments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Waveform size={20} />
            Script Alignment
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="segments" className="space-y-4">
            <TabsList>
              <TabsTrigger value="segments">Script Segments</TabsTrigger>
              <TabsTrigger value="words">Word Alignment</TabsTrigger>
            </TabsList>

            <TabsContent value="segments">
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {script.map((segment) => (
                    <div
                      key={segment.id}
                      className={`p-4 border rounded cursor-pointer transition-colors ${
                        selectedSegment?.id === segment.id ? 'bg-accent' : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedSegment(segment)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(segment.status)}
                          <span className="font-medium">{segment.id}</span>
                          <Badge variant="outline" className={getStatusColor(segment.status)}>
                            {segment.status}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground text-right">
                          <div>Expected: {segment.expectedDuration}s</div>
                          {segment.actualDuration && (
                            <div>Actual: {segment.actualDuration}s</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-sm">{segment.text}</div>
                      
                      {segment.status === 'mismatch' && (
                        <div className="mt-2 text-xs text-yellow-600">
                          Timing mismatch detected. Duration difference: {
                            Math.abs((segment.actualDuration || 0) - segment.expectedDuration).toFixed(1)
                          }s
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="words">
              {selectedSegment?.alignment ? (
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {selectedSegment.alignment.map((word, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm w-8 text-center">
                            {index + 1}
                          </span>
                          <span className="font-medium">{word.word}</span>
                          <Badge
                            variant="outline"
                            className={word.confidence > 0.9 ? 'text-green-600' : 
                                     word.confidence > 0.8 ? 'text-yellow-600' : 'text-red-600'}
                          >
                            {Math.round(word.confidence * 100)}%
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground font-mono">
                          {formatTime(word.startTime)} → {formatTime(word.endTime)}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Select a segment to view word-level alignment
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      
      {/* Hidden audio element */}
      <audio ref={audioRef} />
    </div>
  )
}

export default AudioAlignmentWorkspace