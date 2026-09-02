# Failure semantics

A production-mode job should not be marked successful when a required capability was unavailable or when a renderer did not produce the expected artifact.

Recommended terminal states:

- `completed`: required real outputs exist and validation passed;
- `failed`: execution or validation failed;
- `unsupported`: required capability/dependency is unavailable;
- `cancelled`: job was intentionally stopped;
- `fixture_completed`: deterministic test-only path completed.

Fixture completion must remain distinguishable from real artifact completion in APIs, logs, and persisted metadata.
