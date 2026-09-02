# CI scope

Hosted CI should focus on deterministic, dependency-light checks:

- Python syntax/import checks for host-compatible modules
- schema/model unit tests
- fixture-mode integration tests
- static formatting/lint checks where configuration is stable
- frontend type/lint checks where dependencies are lockfile-reproducible

GPU/local-LLM/Blender/Taichi/Manim artifact checks may remain optional capability tests until a suitable runner is configured. CI should never mark those capabilities as passed merely because they were skipped.
