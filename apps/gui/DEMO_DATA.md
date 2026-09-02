# Demo-data boundary

The GUI contains prototype views that were originally built with simulated telemetry, mock QA values, canned analysis, and synthetic progress updates. Those values are useful for interface development, but they are not measurements from the FastAPI service, render workers, GPU, local model, or quality pipeline.

Until each view is connected to a real source, the interface must make the distinction visible:

- **Demo/mock**: synthetic values used to exercise UI behavior.
- **Fixture**: deterministic test data used to verify orchestration semantics.
- **Live**: values received from an actual service/worker/measurement path.

A component may not label random, delayed, or canned values as live system telemetry. A successful demo interaction may not be surfaced as evidence that the underlying backend capability exists.

The canonical frontend is `apps/gui/`. The older root-level `src/` frontend is legacy duplicate code and is being removed during portfolio hardening.
