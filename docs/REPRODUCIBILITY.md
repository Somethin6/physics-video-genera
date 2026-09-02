# Reproducibility and testing

Physics Foundry separates orchestration tests from real artifact evidence. Passing a lightweight test suite does not imply that a local LLM, Manim, Blender, Taichi, FFmpeg, GPU runtime, or the full prompt-to-video path is operational.

## Evidence layers

### 1. Dependency-light contract tests

These verify semantics that should work in ordinary hosted CI:

- fixture mode requires explicit opt-in;
- capability status is inspectable and boolean;
- fixture plans are deterministic and visibly labeled;
- Pydantic collection defaults are isolated between instances;
- `fixture_complete`, `unsupported`, `complete`, and `error` remain distinct states.

Run from the repository root:

```bash
python -m pip install "pydantic>=2.5,<3" "pytest>=7.4,<9"
PYTHONPATH=apps/orchestrator pytest -q apps/orchestrator/tests/test_portfolio_contract.py
```

GitHub Actions runs this layer and is expected to fail when the contract breaks. It does not create synthetic tests or swallow pytest failures.

### 2. Fixture integration

Fixture mode may exercise job lifecycle, progress events, persisted metadata, and deterministic planning data without external render/model dependencies. Fixture mode is opt-in via `PHYSICS_FOUNDRY_FIXTURE_MODE` and must remain distinguishable from real execution.

Fixture output is test data, not measured renderer performance.

### 3. Capability tests

Optional tests may exercise installed tools such as Manim, FFmpeg, Blender, Taichi, LaTeX, GPU runtimes, or a local model endpoint. Missing optional dependencies should be reported explicitly, never replaced by simulated production success.

### 4. Real reference artifact

The portfolio milestone is one bounded prompt that produces, through the real path:

1. a persisted structured plan;
2. generated Manim source persisted before execution;
3. sandboxed renderer invocation with command and exit status;
4. a non-empty MP4;
5. at least one inspectable quality measurement computed from the produced artifact;
6. logs/configuration sufficient to reproduce the run.

That real artifact chain is not yet established and remains tracked by issue #17.

## Claim rule

Architecture diagrams, interfaces, fixture values, TODOs, and component tests should never be used to imply a higher evidence level than they actually establish. Public claims should be traceable to code plus an appropriate test, artifact, or benchmark, with limitations stated alongside the result.
