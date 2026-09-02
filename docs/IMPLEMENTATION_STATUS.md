# Implementation status

Physics Foundry is an active prototype. This ledger distinguishes architecture, tested orchestration semantics, static policy, and still-unverified external rendering/isolation behavior.

| Area | Status | Evidence / boundary |
| --- | --- | --- |
| React/Tauri interface | implemented scaffold | `apps/gui/` |
| FastAPI service | implemented | `apps/orchestrator/orchestrator/main.py` |
| REST/WebSocket orchestration | implemented | pipeline/status/event endpoints |
| Capability detection | implemented + dependency-light tests | `core/capabilities.py`, `test_portfolio_contract.py` |
| Fixture-plan construction | implemented + dependency-light tests | `core/fixtures.py`, `test_portfolio_contract.py` |
| Fixture/real terminal-state separation | implemented | `fixture_complete`, `unsupported`, `complete`, `error` are distinct states |
| Production simulated-success behavior | removed | unwired real prompt-to-render path reports `unsupported` instead of sleeping to `complete` |
| Generated-code static policy | implemented + dependency-light tests | `core/sandbox_policy.py`: import/call policy and workspace path validation |
| Direct unsandboxed generated-code fallback | removed | `core/sandbox.py` refuses execution when the supported isolation backend is unavailable |
| Firejail execution wrapper | implemented, runtime verification pending | per-execution workspace/profile, stripped child environment, network-disabled profile; real-host verification still required |
| nsjail execution | intentionally disabled as a verified path | installed-tool detection may report nsjail, but execution does not use the previous unverified path |
| Blender external host-path staging | intentionally unsupported | avoids exposing arbitrary host paths until a bounded staging contract exists |
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
- **runtime verification pending**: code exists, but its external-system behavior has not yet been demonstrated in the required environment.
- **experimental**: code/interfaces exist but behavior and robustness remain under development.

The next evidence milestone is issue #17: one real, retained Manim artifact chain. Sandbox runtime hardening/verification remains tracked by issue #27. Fixture completion is deliberately not counted as rendered-video completion.
