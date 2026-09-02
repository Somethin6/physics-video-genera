# Implementation status

Physics Foundry is an active prototype. This ledger distinguishes architecture, tested orchestration semantics, and still-unverified external rendering behavior.

| Area | Status | Evidence / boundary |
| --- | --- | --- |
| React/Tauri interface | implemented scaffold | `apps/gui/` |
| FastAPI service | implemented | `apps/orchestrator/orchestrator/main.py` |
| REST/WebSocket orchestration | implemented | pipeline/status/event endpoints |
| Capability detection | implemented + dependency-light tests | `core/capabilities.py`, `test_portfolio_contract.py` |
| Fixture-plan construction | implemented + dependency-light tests | `core/fixtures.py`, `test_portfolio_contract.py` |
| Fixture/real terminal-state separation | implemented | `fixture_complete`, `unsupported`, `complete`, `error` are distinct states |
| Production simulated-success behavior | removed | unwired real prompt-to-render path reports `unsupported` instead of sleeping to `complete` |
| Prometheus/OpenTelemetry hooks | implemented scaffold | observability modules; production deployment not claimed |
| Renderer abstraction | implemented scaffold | renderer/plugin interfaces exist |
| Real prompt -> generated source -> Manim -> MP4 -> measured QA | **not yet verified** | issue #17 |
| Multi-engine autonomous rendering | experimental | not a current portfolio claim |
| Automatic quality remediation | experimental | QA interfaces exist; closed-loop reliability not established |
| Audio alignment stack | experimental/planned integration | full production path not established |

## Status vocabulary

- **implemented**: behavior exists in code under documented conditions.
- **implemented scaffold**: interfaces/infrastructure exist, but the complete capability is not demonstrated end to end.
- **verified**: a reproducible test or reference artifact demonstrates the claim.
- **experimental**: code/interfaces exist but behavior and robustness remain under development.

The next evidence milestone is issue #17: one real, retained Manim artifact chain. Fixture completion is deliberately not counted as rendered-video completion.
