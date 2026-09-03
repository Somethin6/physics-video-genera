# Build and verification commands

The root package is a workspace coordinator. It does not require a `Justfile`.

From the repository root:

```bash
npm run dev:gui
npm run build:gui
npm run test:gui
npm run lint
npm run test:contract
npm run check
```

To run the API during development:

```bash
npm run dev:api
```

Python dependencies for the full orchestrator are environment-specific. The dependency-light portfolio contract only requires Pydantic, pytest, and pytest-asyncio as documented in `docs/REPRODUCIBILITY.md`.
