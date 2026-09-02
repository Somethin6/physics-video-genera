# Portfolio release checklist

Before presenting Physics Foundry as a flagship project:

- [ ] one prompt-to-Manim reference run is reproducible from a clean checkout
- [ ] production mode never substitutes synthetic/sleep-based success for missing capabilities
- [ ] fixture mode is explicit and covered by integration tests
- [ ] generated source is persisted before execution
- [ ] command, exit status, logs, and artifact paths are retained
- [ ] at least one quality metric is computed from a real render
- [ ] README claims match `docs/CLAIMS.md`
- [ ] implementation labels match `docs/IMPLEMENTATION_STATUS.md`
- [ ] CI covers host-compatible tests/lint
- [ ] transient build and bytecode artifacts are not committed
- [ ] external dependencies and platform assumptions are documented
- [ ] one small reference artifact bundle is retained
- [ ] repository is renamed/pinned only after the verified slice exists
