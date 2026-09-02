# Frontend architecture

The canonical frontend package is `apps/gui/`.

The repository previously contained a second root-level Vite/Spark frontend (`src/`, root `vite.config.ts`, root `index.html`, and duplicate Tailwind/TypeScript configuration). The root workspace package, however, delegates the GUI to `apps/gui`, and several root configuration files were byte-for-byte copies of the files inside `apps/gui`.

Portfolio hardening therefore treats `apps/gui` as the single source of truth. Duplicate root frontend files are removed rather than maintained as a second application.

## Data provenance

UI values fall into one of three categories:

- **demo/mock**: synthetic values used only to exercise presentation behavior;
- **fixture**: deterministic test values used to validate orchestration contracts;
- **live**: values received from an actual service, worker, renderer, or measurement path.

Synthetic values must remain visibly distinguishable from live telemetry and measured QA output. See `apps/gui/DEMO_DATA.md`.
