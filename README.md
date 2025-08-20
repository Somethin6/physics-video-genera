# Physics Foundry - Monorepo

**Local-First AI Physics Video Generation Pipeline**

A modular, error-coded, multi-model physics video generation system with real-time monitoring, quality assurance, and comprehensive observability.

## 🚀 Quick Start

```bash
# 1. System check
./scripts/check_system.sh

# 2. Setup development environment  
just setup

# 3. Install LLM server (optional)
just install-llm

# 4. Start development servers
just dev-all
```

Open [http://localhost:5173](http://localhost:5173) for GUI, [http://localhost:8000](http://localhost:8000) for API.

## 🏗️ Architecture

### Apps
- **`/apps/gui/`** - Tauri + React + Vite frontend
- **`/apps/orchestrator/`** - FastAPI + WebSockets backend

### Packages  
- **`/packages/shared/`** - Shared TypeScript/Python types
- **`/packages/plugins/`** - Extensible render engine plugins

### Configuration
- **`/config/runtime.config.json`** - LLM models, rendering, quality settings
- **`/config/spark.json`** - Prompt templates and engine selection
- **`/config/ocio/`** - Color management (Rec.709/BT.1886/AgX)

## 🎯 Key Features

### Local AI Integration
- **Multiple LLMs** via OpenAI-compatible server (llama.cpp)
- **Real-time token streaming** during script generation  
- **Role-based models** (planner, critic, code generator)

### Multi-Engine Rendering
- **Manim** - Mathematical equations and 2D animations
- **Taichi** - Fluid dynamics and particle systems
- **Blender** - 3D models and cinematic sequences
- **Intelligent engine selection** based on content analysis

### Quality Assurance
- **Frame-by-frame analysis** with SSIM/optical flow
- **Real-time monitoring** with issue detection
- **Auto-remediation** for common problems
- **Color management** with OCIO compliance

### Audio Pipeline
- **Whisper.cpp** transcription with GPU acceleration
- **Montreal Forced Aligner** for word-level sync
- **EBU R128 loudness** normalization
- **OpenTimelineIO** as timing authority

## 🛠️ Development Commands

```bash
# Development
just dev-gui         # Start React frontend
just dev-api         # Start FastAPI backend  
just dev-all         # Start all services

# Building
just build           # Build all apps
just build-gui       # Build frontend only
just build-api       # Build backend only

# Testing & Quality
just test            # Run all tests
just lint            # Lint all code
just format          # Format all code

# Pipeline Operations  
just plan "Topic" 120 intermediate    # Plan physics video
just preview project-123             # Start preview render
just qc /path/to/sequence            # Quality check
just final project-123               # Final assembly

# System
just check           # System requirements check
just health          # Service health check
just logs            # View application logs
```

## 📁 Project Structure

```
physics-foundry/
├── apps/
│   ├── gui/                    # React + Tauri frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── RenderPreview.tsx           # Unified render preview (4 modes)
│   │   │   │   ├── PipelineMonitor.tsx         # Real-time pipeline status
│   │   │   │   ├── AudioAlignmentWorkspace.tsx # Voice sync interface
│   │   │   │   ├── LiveCodeWorkspace.tsx       # Code editing with diffs
│   │   │   │   ├── QAAnalysisDashboard.tsx     # Quality metrics
│   │   │   │   └── SystemMonitor.tsx           # GPU/CPU monitoring
│   │   │   └── lib/
│   │   └── package.json
│   └── orchestrator/           # FastAPI backend  
│       ├── orchestrator/
│       │   ├── api/           # REST & WebSocket endpoints
│       │   ├── core/          # DSL models, timeline, LLM integration
│       │   ├── workers/       # Blender/Manim/Taichi workers
│       │   └── main.py
│       └── pyproject.toml
├── packages/
│   ├── shared/
│   │   ├── schema/           # JSON Schema definitions
│   │   ├── ts/               # Generated TypeScript types
│   │   └── py/               # Generated Python models  
│   └── plugins/              # Render engine extensions
├── config/
│   ├── runtime.config.json   # Multi-model LLM + render settings
│   ├── spark.json           # Prompt templates
│   └── ocio/                # Color management profiles
├── scripts/
│   ├── check_system.sh      # Dependency verification  
│   ├── install_llama_server.sh # LLM server setup
│   └── justfile             # Development commands
└── docs/                    # Documentation
```

## 🔧 Component Consolidation

**Previously**: 4 separate render preview components with overlapping functionality
- `AdvancedRenderPreview.tsx`
- `EnhancedRenderPreview.tsx` 
- `ComprehensiveRenderPreview.tsx`
- `FrameQAViewer.tsx`

**Now**: Single `RenderPreview.tsx` with mode switching:
- `mode="basic"` - Simple playback and analysis
- `mode="enhanced"` - Advanced controls and batch processing
- `mode="frameQA"` - Frame-by-frame quality analysis  
- `mode="comprehensive"` - Full pipeline monitoring

## 🎨 UI Components

### Unified RenderPreview Modes

```tsx
// Basic preview
<RenderPreview mode="basic" sequence={seq} onAnalyzeFrame={analyze} />

// Enhanced with batch analysis
<RenderPreview 
  mode="enhanced" 
  sequence={seq}
  onBatchAnalysis={batchAnalyze}
  onCompareFrames={compare}
/>

// Comprehensive monitoring
<RenderPreview mode="comprehensive" {...props} />
```

### Real-time Pipeline Monitor

```tsx  
<PipelineMonitor 
  request={videoRequest}
  onComplete={handleComplete}
/>
```

Shows live progress, system stats, logs, and artifacts with WebSocket updates.

## 🤖 LLM Configuration

```json
{
  "llm": {
    "endpoint": "http://127.0.0.1:8080/v1",
    "models": [
      {"name": "gpt-neox-20b-q4", "n_gpu_layers": 28},
      {"name": "mistral-7b-instruct-q5", "n_gpu_layers": 35}  
    ],
    "roles": {
      "planner": "gpt-neox-20b-q4",
      "script_critic": "mistral-7b-instruct-q5"
    }
  }
}
```

## 🎬 Quality Assurance

### Automated Analysis
- **SSIM threshold**: 0.9 minimum
- **Motion stability**: 0.8 minimum  
- **Text legibility**: 0.85 minimum
- **Color accuracy**: 0.95 minimum

### Error Codes with Auto-fixes
- `LLM-JSON-001` - Invalid DSL → field repair
- `BLD-OPTIX-302` - OptiX OOM → CUDA fallback  
- `MNM-OGL-101` - OpenGL fail → Cairo fallback
- `ENC-NVENC-801` - NVENC unavailable → libx264 fallback

## 🔍 Monitoring & Observability

- **Prometheus metrics** at `/metrics`
- **OpenTelemetry tracing** across pipeline
- **WebSocket events** for real-time updates
- **nvidia-smi integration** for GPU monitoring
- **Health checks** at `/health`

## 🚀 Production Deployment

```bash
# Build for production
just build

# Deploy (configure for your infrastructure)
just deploy-staging
just deploy-prod
```

## 📖 Documentation

- **[PRD](docs/PRD.md)** - Complete product requirements
- **[Operations](docs/OPERATIONS.md)** - Runbooks and troubleshooting
- **[ADRs](docs/ADRs/)** - Architecture decision records

## 🤝 Contributing

1. Run system checks: `just check`
2. Start development: `just dev-all`  
3. Make changes with tests: `just test`
4. Format and lint: `just format && just lint`
5. Submit PR

## 📄 License

MIT - See [LICENSE](LICENSE) for details.

---

**Physics Foundry** - From concept to professional physics video in minutes, not hours.