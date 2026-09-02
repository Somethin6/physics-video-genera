# Reproducibility contract

A portfolio reference run is considered reproducible only if all of the following are true:

1. The prompt and runtime configuration are versioned.
2. Planning output is persisted as structured data.
3. Generated source is persisted before execution.
4. The renderer exits successfully and produces a non-empty MP4.
5. At least one quality metric is computed from the produced artifact rather than inserted as a placeholder.
6. Logs and failure states are retained.
7. A fixture-mode integration test can exercise orchestration without requiring a local LLM or GPU.
8. Missing production dependencies cause an explicit error or skipped capability, never a simulated success.

This contract intentionally separates *architecture* from *verified behavior*. Passing unit tests for individual components is useful, but it is not a substitute for one traceable end-to-end artifact chain.
