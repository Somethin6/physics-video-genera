# Public claims ledger

This file is intentionally conservative. It exists so portfolio-facing documentation can be audited against repository evidence.

| Claim | Status | Notes |
| --- | --- | --- |
| Local-first architecture | supported | Configuration and services are designed for local model/render dependencies. |
| FastAPI orchestration service | supported | API/service code is present. |
| WebSocket progress/events | supported | WebSocket paths/events are implemented in the service layer. |
| Prometheus/OpenTelemetry observability hooks | supported scaffold | Instrumentation hooks exist; production deployment is not claimed. |
| Multiple renderer interfaces | supported scaffold | Interfaces/workers exist for multiple engines; complete autonomous end-to-end behavior is not claimed. |
| Reproducible prompt-to-Manim MP4 pipeline | not yet established | P0 milestone: issue #17. |
| Production-ready autonomous video generation | **not claimed** | The repository is an active prototype. |
| Guaranteed physics correctness or visual quality | **not claimed** | Generated output requires validation; quality metrics are experimental. |

## Rule

If a future README sentence cannot be mapped to a supported row here or to a reproducible test/example, narrow the sentence before publishing it.
