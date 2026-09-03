# Root workspace

The repository root is a workspace coordinator, not a second frontend application.

- `apps/gui/` is the canonical GUI package.
- `apps/orchestrator/` is the Python orchestration service.
- `packages/*` contains shared/plugin packages.
- root npm scripts delegate to those packages using commands that exist in the repository.

The previous root-level Vite/Spark frontend duplicated `apps/gui` and is removed during portfolio hardening. This avoids divergent mock behavior, duplicate configuration, and ambiguity about which application a reviewer should inspect.
