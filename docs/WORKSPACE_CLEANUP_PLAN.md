# Workspace cleanup scope

The following root-level frontend paths are legacy duplicates of the canonical `apps/gui` package and are scheduled for removal in the portfolio-hardening PR:

- `src/`
- `index.html`
- `components.json`
- `tailwind.config.js`
- `tsconfig.json`
- `vite.config.ts`
- `theme.json`

The root `package.json` and `package-lock.json` remain because they coordinate npm workspaces. Spark/runtime metadata is left untouched until its remaining tooling dependency is explicitly traced.
