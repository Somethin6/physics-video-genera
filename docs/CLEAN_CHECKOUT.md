# Clean-checkout target

A portfolio claim is only useful if a reviewer can identify the canonical entry points from a clean checkout.

Canonical entry points:

- GUI: `apps/gui/`
- API/orchestrator: `apps/orchestrator/`
- renderer/plugin packages: `packages/`
- dependency-light verification: `docs/REPRODUCIBILITY.md`

Legacy duplicate root frontend code is not part of this target and should not remain in the final hardened tree.
