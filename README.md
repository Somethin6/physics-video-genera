# Physics Foundry

Local-first research prototype for orchestrating AI-assisted physics visualization workflows.

Physics Foundry explores a modular pipeline for turning a physics prompt into a structured scene plan, renderer-specific code, generated media, and quality-analysis artifacts. The repository combines a React/Tauri-facing application with a Python FastAPI orchestration service and shared schemas for renderer and pipeline state.

> **Status:** active prototype. Core API, WebSocket, schema, monitoring, and orchestration scaffolding are implemented. Several downstream generation/render stages are still mocked, simulated, or incomplete. This repository should be read as a software-architecture and research prototype, not as a finished autonomous production system.

## What is implemented

- FastAPI orchestration service with REST endpoints and WebSocket progress events
- typed request/response models and shared pipeline state
- health/status endpoints and background task orchestration
- Prometheus-compatible metrics and observability hooks
- GPU/system monitoring hooks
- sandbox/execution interfaces for generated renderer code
- React/Tauri-oriented frontend structure
- renderer/plugin abstractions for Manim, Taichi, and Blender-style workflows
- configuration for local OpenAI-compatible LLM servers such as llama.cpp

## What is still experimental

- fully autonomous prompt-to-video execution
- reliable multi-engine renderer selection
- complete Manim/Taichi/Blender execution across all paths
- automatic scene repair/remediation
- production audio alignment and final assembly
- production deployment and operational hardening

The current orchestrator contains placeholder/simulated stages in parts of the pipeline. Those paths are intentionally treated as prototype scaffolding until they are replaced by reproducible renderer execution and end-to-end tests.

## Architecture

```text
physics-foundry/
├── apps/
│   ├── gui/                    # React / Tauri-facing UI
│   └── orchestrator/           # FastAPI orchestration service
├── packages/
│   ├── shared/                 # shared schemas and generated types
│   └── plugins/                # renderer/plugin abstractions
├── config/                     # runtime and model configuration
├── docs/                       # architecture / operations notes
└── scripts/                    # local development utilities
```

The intended research path is:

```text
physics prompt
    ↓
structured scene specification
    ↓
renderer-specific code
    ↓
sandboxed execution
    ↓
rendered artifact
    ↓
quality analysis / diagnostics
```

The repository is currently strongest in the orchestration, interface, monitoring, and software-architecture layers. Completing one reproducible end-to-end renderer path is the next major milestone.

## Local development

The project has multiple runtime dependencies. Exact setup depends on which components are being exercised.

Typical development flow:

```bash
./scripts/check_system.sh
just setup
just dev-all
```

Default development endpoints are typically:

- GUI: `http://localhost:5173`
- API: `http://localhost:8000`

A local LLM server is optional for architecture/UI development but required for model-backed generation paths.

## Engineering goals

Physics Foundry is being used to explore several software-engineering problems:

1. **Typed orchestration** between language-model outputs and renderer-specific code.
2. **Isolation and sandboxing** of generated code before execution.
3. **Observable long-running jobs** through REST, WebSockets, metrics, and structured status events.
4. **Renderer abstraction** so mathematical animation, particle simulation, and 3D rendering can share one higher-level workflow.
5. **Quality gates** that make generated scientific media inspectable rather than treating successful rendering as equivalent to correctness.

## Repository claims

| Claim | Status |
|---|---|
| FastAPI orchestration layer | Implemented |
| REST health/status interfaces | Implemented |
| WebSocket progress/event path | Implemented |
| Metrics/observability hooks | Implemented |
| Local LLM configuration path | Implemented / environment-dependent |
| Renderer/plugin abstractions | Implemented as architecture |
| End-to-end autonomous multi-renderer video generation | **Not yet established** |
| Production-grade automatic remediation | **Not yet established** |
| Production deployment readiness | **Not yet established** |

## Limitations

- Some pipeline stages currently use simulated timing or templated outputs rather than invoking a real renderer.
- External tools and models are not bundled with the repository.
- Scientific correctness validation is not solved merely by rendering successfully.
- Multi-engine parity and automatic remediation need explicit integration tests before they should be treated as operational features.
- Hardware-specific performance claims should be benchmarked on reproducible workloads before publication.

## Next milestone

The highest-priority milestone is a single reproducible vertical slice:

```text
prompt → scene plan → Manim code → sandbox → render → quality check → MP4
```

That path should include automated tests and a small reproducible example before additional renderer breadth is treated as complete.

## License

MIT. See [LICENSE](LICENSE).
