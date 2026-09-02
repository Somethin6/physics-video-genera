# Physics Foundry

Local-first prototype for AI-assisted physics animation and rendering workflows.

Physics Foundry explores a modular pipeline for turning a bounded physics prompt into structured scene plans, generated animation code, renderer jobs, quality checks, and reviewable artifacts. The repository contains substantial application and orchestration scaffolding, but the full autonomous multi-engine pipeline is **not presented as production-ready**.

> **Current state:** active prototype. See [`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md), [`docs/CLAIMS.md`](docs/CLAIMS.md), and [`docs/PORTFOLIO_ROADMAP.md`](docs/PORTFOLIO_ROADMAP.md) for the implementation ledger and the next reproducible milestone.

## What is implemented

- React/Tauri-oriented GUI scaffolding under `apps/gui/`
- FastAPI orchestration service under `apps/orchestrator/`
- REST and WebSocket interfaces for jobs and progress events
- Pydantic/typed request and artifact models
- Renderer/plugin interfaces for Manim, Taichi, and Blender-oriented workers
- Prometheus/OpenTelemetry-oriented observability hooks
- Configuration, sandbox, quality-gate, and development tooling

## What is still experimental

The central prompt-to-video workflow is not yet a fully verified production pipeline. Several stages remain prototype implementations or interfaces, including portions of automated planning, generated-script execution, multi-engine rendering, remediation, assembly, and audio alignment.

The current P0 milestone is intentionally narrower:

```text
bounded prompt
    -> schema-valid scene plan
    -> runnable Manim source
    -> sandboxed execution
    -> rendered MP4
    -> real quality check
    -> persisted artifacts + logs
```

When that path is reproducible from a clean checkout, it becomes the reference portfolio example. See issue #17.

## Architecture

```text
apps/gui
   |
   v
FastAPI / WebSocket orchestrator
   |
   +--> planning / typed scene representation
   |
   +--> sandbox + renderer interfaces
   |       +--> Manim
   |       +--> Taichi (experimental)
   |       +--> Blender (experimental)
   |
   +--> quality / artifact tracking
   |
   +--> observability
```

The design goal is to keep planning, rendering, validation, and artifact management separable so individual stages can be tested and replaced independently.

## Development

The repository includes project-specific setup and development tooling. The exact commands depend on which GUI, local-model, and renderer dependencies are installed.

A typical development flow is:

```bash
./scripts/check_system.sh
just setup
just dev-all
```

API and GUI services are configured around local development endpoints. External renderers and local LLMs require their own system dependencies.

## Repository map

```text
physics-foundry/
├── apps/
│   ├── gui/              # desktop/web UI
│   └── orchestrator/     # FastAPI service and pipeline orchestration
├── packages/
│   ├── shared/           # shared schemas/types
│   └── plugins/          # renderer/plugin interfaces
├── config/               # runtime and renderer configuration
├── docs/                 # architecture/product/portfolio documentation
└── scripts/              # setup and development commands
```

## Engineering priorities

1. Complete and test one real Manim vertical slice.
2. Add fixture-mode integration coverage that does not require a GPU or local LLM.
3. Make missing external dependencies fail explicitly rather than silently simulating success.
4. Persist a reference run containing the prompt, scene plan, generated source, logs, MP4, and quality result.
5. Only then expand the verified path to additional rendering engines.

## Limitations

- Multi-engine autonomous generation is experimental.
- A renderer interface does not imply that every renderer path is end-to-end complete.
- Quality-analysis interfaces and thresholds do not establish guaranteed visual or pedagogical quality.
- Local LLM, GPU, Blender, Taichi, Manim, FFmpeg, and audio-tool availability varies by machine.
- The repository is a research/engineering prototype, not a hosted production service.

## Why this repository exists

The project is primarily an exercise in software architecture for scientific-media generation: typed orchestration, asynchronous progress reporting, renderer abstraction, sandboxing, quality gates, observability, and human-reviewable artifacts.

That architecture is the current demonstrated value. Autonomous production-grade generation is the target, not a claim.

## License

MIT. See [`LICENSE`](LICENSE).
