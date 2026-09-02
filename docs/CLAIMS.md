# Public claims ledger

This file is intentionally conservative. Public wording should stay at or below the evidence shown here.

| Claim | Status | Evidence / boundary |
| --- | --- | --- |
| Local-first architecture | supported | Configuration and services are designed around local model/render dependencies. |
| FastAPI orchestration service | supported | API/service code is present. |
| WebSocket job/progress events | supported | WebSocket event paths are implemented. |
| Dependency/capability reporting | supported | `/capabilities` and capability helpers report environment availability. |
| Deterministic fixture mode | supported | Explicit opt-in mode with a distinct `fixture_complete` terminal state. |
| Production mode avoids fake render success | supported | Unwired prompt-to-render execution terminates as `unsupported`, not `complete`. |
| Prometheus/OpenTelemetry hooks | implemented scaffold | Instrumentation exists; production deployment is not claimed. |
| Multiple renderer interfaces | implemented scaffold | Interfaces/workers exist; complete autonomous multi-engine behavior is not claimed. |
| Reproducible real prompt-to-Manim MP4 pipeline | **not yet established** | Tracked by issue #17. |
| Production-ready autonomous video generation | **not claimed** | Active prototype. |
| Guaranteed physics correctness or visual quality | **not claimed** | Generated output requires independent validation. |

## Promotion rule

A claim is upgraded only when supported by inspectable code plus a deterministic test, reproducible command/artifact, or documented benchmark appropriate to the claim. Interfaces, TODOs, architecture diagrams, fixture values, and simulated output are not evidence of a completed real capability.
