# Physics Foundry Portfolio Roadmap

This roadmap is intentionally narrower than the product vision. It defines the work required for the repository to serve as a defensible software-engineering portfolio artifact.

## Definition of portfolio-ready

Physics Foundry is portfolio-ready when a fresh checkout can reproduce at least one complete pipeline:

```text
prompt
  -> structured scene plan
  -> generated Manim source
  -> sandboxed execution
  -> rendered MP4
  -> automated quality report
```

The run must use a documented example, produce deterministic/reviewable intermediate artifacts where practical, and fail with explicit diagnostics when a dependency or stage is unavailable.

## P0: one real vertical slice

- [ ] Replace simulated planning output with a real configured model call or a deterministic fixture mode.
- [ ] Produce a validated scene-plan schema from the planning stage.
- [ ] Generate runnable Manim code for one bounded class of scenes.
- [ ] Execute generated code through the sandbox interface.
- [ ] Render an MP4 from a clean example.
- [ ] Run at least one quality-analysis step on the resulting frames/video.
- [ ] Save the plan, source, logs, render, and quality report as inspectable artifacts.
- [ ] Add an automated integration test for fixture-mode end-to-end execution.

## P1: reproducibility and failure semantics

- [ ] Document exact Python/Node/system dependencies.
- [ ] Add a minimal CI path that does not require a GPU or local LLM.
- [ ] Add fixture-mode tests for API and WebSocket state transitions.
- [ ] Make missing external dependencies fail explicitly rather than silently falling back to simulated success.
- [ ] Add structured error codes for renderer failure, invalid generated code, timeout, and dependency absence.

## P2: scientific/visual quality

- [ ] Separate render success from scientific correctness.
- [ ] Define a small set of measurable visual checks for the reference example.
- [ ] Record SSIM/motion/text metrics only where the implementation genuinely computes them.
- [ ] Add human-review notes for physics correctness on the reference scene.

## P3: renderer breadth

Only after the Manim vertical slice is reproducible:

- [ ] Taichi reference scene
- [ ] Blender reference scene
- [ ] renderer-selection experiment
- [ ] multi-renderer composition

Renderer count is not itself a completion metric. Each renderer needs a reproducible example and explicit failure handling.

## P4: audio and timing

- [ ] reference narration input
- [ ] transcription/alignment path
- [ ] timeline synchronization
- [ ] loudness normalization
- [ ] final assembly test

## Claims discipline

Public documentation should maintain a simple distinction:

- **Implemented:** executable and inspectable in the repository.
- **Environment-dependent:** implemented but requires an external model/tool/runtime.
- **Experimental:** partially implemented or not yet validated end-to-end.
- **Planned:** design intent only.

No feature should be promoted to "implemented" merely because an interface, configuration key, or placeholder worker exists.
