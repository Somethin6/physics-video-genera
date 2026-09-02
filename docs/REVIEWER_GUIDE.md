# Technical reviewer guide

If you have five minutes, evaluate the project in this order:

1. Read `README.md` for scope.
2. Read `docs/CLAIMS.md` and `docs/IMPLEMENTATION_STATUS.md` for what is and is not asserted.
3. Inspect `apps/orchestrator/` for service/orchestration architecture.
4. Inspect renderer/plugin interfaces under `packages/` and workers.
5. Check issues #17, #19, #20, and #21 for the verified vertical-slice plan.

The repository should currently be judged primarily as a software-architecture prototype. A real prompt-to-render reference artifact is the next required evidence milestone.
