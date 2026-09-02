# Physics Foundry

Local-first prototype for AI-assisted physics animation and rendering workflows.

Physics Foundry explores a modular pipeline for turning a bounded physics prompt into structured scene plans, generated animation code, renderer jobs, quality checks, and reviewable artifacts. The repository contains substantial application and orchestration scaffolding, but the full autonomous multi-engine pipeline is **not presented as production-ready**.

> **Current state:** active prototype. See [`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md), [`docs/CLAIMS.md`](docs/CLAIMS.md), [`docs/REPRODUCIBILITY.md`](docs/REPRODUCIBILITY.md), and [`docs/PORTFOLIO_ROADMAP.md`](docs/PORTFOLIO_ROADMAP.md) for the implementation ledger and next reproducible milestone.

## What is implemented

- React/Tauri-oriented GUI scaffolding under `apps/gui/`
- FastAPI orchestration service under `apps/orchestrator/`
- REST and WebSocket interfaces for jobs and progress events
- Pydantic/typed request, status, log, worker, and artifact models
- explicit dependency/capability reporting
- opt-in deterministic fixture planning with a distinct `fixture_complete` state
- generated-code policy checks for import/call restrictions and workspace-path traversal
- renderer/plugin interfaces for Manim, Taichi, and Blender-oriented workers
- Prometheus/OpenTelemetry-oriented observability hooks
- configuration, quality-gate, and development tooling

## What is still experimental

The central prompt-to-video workflow is not yet a fully verified production pipeline. Several stages remain prototype implementations or interfaces, including automated planning, real generated-script-to-render integration, multi-engine rendering, remediation, assembly, and audio alignment.

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

## Failure semantics

The project deliberately distinguishes four terminal meanings:

- `complete`: reserved for a real completed capability;
- `fixture_complete`: deterministic orchestration test only, with no claim that media was rendered;
- `unsupported`: a required real capability is not wired or available;
- `error`: an attempted supported operation failed.

The previous prototype behavior that could simulate rendering with sleeps and then report `complete` has been removed from the hardening branch.

## Architecture

```text
apps/gui
   |
   v
FastAPI / WebSocket orchestrator
   |
   +--> planning / typed scene representation
   |
   +--> generated-code policy + sandbox boundary
   |
   +--> renderer interfaces
   |       +--> Manim
   |       +--> Taichi (experimental)
   |       +--> Blender (experimental)
   |
   +--> quality / artifact tracking
   |
   +--> observability
```

The design goal is to keep planning, rendering, validation, and artifact management separable so individual stages can be tested and replaced independently.

## Generated-code boundary

Generated renderer code is treated as untrusted input. Static AST/path checks are defense-in-depth, not a security guarantee. The current execution wrapper deliberately requires the supported firejail path and returns `unsupported` when that isolation backend is unavailable rather than executing generated code directly on the host. nsjail may be detected as an installed tool, but it is not currently treated as a verified execution backend.

See [`SECURITY.md`](SECURITY.md) for the security boundary and issue #27 for remaining runtime hardening/verification work.

## Development

The repository includes project-specific setup and development tooling. The exact commands depend on which GUI, local-model, and renderer dependencies are installed.

A typical development flow is:

```bash
./scripts/check_system.sh
just setup
just dev-all
```

The dependency-light portfolio contract is documented in [`docs/REPRODUCIBILITY.md`](docs/REPRODUCIBILITY.md).

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

1. Complete and retain one real Manim prompt-to-MP4 artifact chain.
2. Verify generated-code isolation behavior on a real firejail host, including missing-backend and timeout cases.
3. Add fixture-mode integration coverage for API/job/WebSocket lifecycle semantics.
4. Persist a reference run containing prompt, scene plan, generated source, command/exit status, logs, MP4, and measured QA.
5. Expand the verified path to additional rendering engines only after the Manim path is reproducible.

## Limitations

- Multi-engine autonomous generation is experimental.
- A renderer interface does not imply that every renderer path is end-to-end complete.
- Static generated-code validation does not make untrusted code safe without a real isolation backend.
- Quality-analysis interfaces and thresholds do not establish guaranteed visual or pedagogical quality.
- Local LLM, GPU, Blender, Taichi, Manim, FFmpeg, LaTeX, and sandbox-tool availability varies by machine.
- The repository is a research/engineering prototype, not a hosted production service.

## Why this repository exists

The project is primarily an exercise in software architecture for scientific-media generation: typed orchestration, asynchronous progress reporting, renderer abstraction, explicit failure semantics, generated-code isolation boundaries, quality gates, observability, and human-reviewable artifacts.

That architecture is the current demonstrated value. Autonomous production-grade generation is the target, not a claim.

## License

MIT. See [`LICENSE`](LICENSE).
