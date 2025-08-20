# Product Requirements Document: Render Preview & QA Analysis System

## Core Purpose & Success
- **Mission Statement**: Create a comprehensive render preview interface that enables frame-by-frame quality analysis using LLaVA vision models and quantitative metrics for the physics video pipeline.
- **Success Indicators**: Users can efficiently review render quality, identify visual issues, and track QA metrics across all shots with automated fix suggestions.
- **Experience Qualities**: Scientific, precise, efficient - providing deep analytical insight into render quality with autonomous improvement capabilities.

## Project Classification & Approach
- **Complexity Level**: Complex Application (advanced functionality with sophisticated state management and AI integration)
- **Primary User Activity**: Analyzing rendered frames with AI-powered quality assessment and automated code revision

## Thought Process for Feature Selection
- **Core Problem Analysis**: Implement the complete "self-watching" pipeline - LLaVA vision analysis, SSIM metrics, optical flow validation, and automated code fixing.
- **User Context**: Users initiate analysis and monitor autonomous QA processes that identify issues and generate fixes.
- **Critical Path**: Load shot → Run comprehensive QA → Review analysis → Trigger auto-fix → Validate improvements
- **Key Moments**: QA analysis execution, issue identification, code revision completion

## Essential Features
1. **Frame-by-Frame Analyzer**: LLaVA-powered semantic analysis with configurable script checks
2. **QA Dashboard**: Comprehensive metrics tracking with SSIM distribution and performance analytics  
3. **Auto-Fix Engine**: Automated code revision system that iteratively improves render quality
4. **Metrics Visualization**: Real-time analysis of quality scores, frame distribution, and performance data
5. **Integrated Preview System**: Frame viewer with quality overlays and timeline navigation
3. **Quantitative Metrics**: SSIM comparison and optical flow analysis for technical quality assessment
4. **QA Results Dashboard**: Comprehensive scoring and issue identification system
5. **Batch Analysis**: Process multiple shots/frames automatically

## Design Direction

### Visual Tone & Identity
- **Emotional Response**: Professional confidence and analytical precision
- **Design Personality**: Scientific, methodical, technical but accessible
- **Visual Metaphors**: Laboratory analysis, diagnostic tools, precision instruments
- **Simplicity Spectrum**: Rich interface with detailed data visualization

### Color Strategy
- **Color Scheme Type**: Monochromatic with accent highlights
- **Primary Color**: Deep blue-gray for professionalism and focus
- **Secondary Colors**: Neutral grays for data visualization
- **Accent Color**: Orange for attention-grabbing alerts and key actions
- **Color Psychology**: Blues convey trust and precision, orange highlights important issues
- **Foreground/Background Pairings**: 
  - Background (light gray): Dark gray text (high contrast)
  - Card (dark blue-gray): Light gray text (professional)
  - Primary (deep blue): White text (clear readability)
  - Accent (orange): White text (high visibility)

### Typography System
- **Font Pairing Strategy**: Technical monospace for metrics, clean sans-serif for UI
- **Typographic Hierarchy**: Clear distinction between data labels, values, and descriptions
- **Font Personality**: Precise, technical, reliable
- **Which fonts**: JetBrains Mono for code/metrics, Inter for interface text
- **Legibility Check**: High contrast ratios maintained for all critical information

### Visual Hierarchy & Layout
- **Attention Direction**: Frame preview as primary focus, with QA metrics in supporting panels
- **Grid System**: 12-column layout for flexible panel arrangement
- **Responsive Approach**: Collapsible panels for different screen sizes
- **Content Density**: Information-rich but organized into logical sections

### Animations
- **Purposeful Meaning**: Smooth transitions between frames, loading indicators for analysis
- **Hierarchy of Movement**: Subtle hover effects, progress indicators during processing
- **Contextual Appropriateness**: Minimal distraction from analytical tasks

### UI Elements & Component Selection
- **Component Usage**: Cards for metric displays, Tabs for different analysis views, Progress bars for batch processing
- **Component Customization**: Dark theme adaptation for extended viewing sessions
- **Spacing System**: Consistent padding using Tailwind's spacing scale
- **Mobile Adaptation**: Simplified layout with scrollable metric panels

### Accessibility & Readability
- **Contrast Goal**: WCAG AA compliance for all text and interface elements