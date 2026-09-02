# Generated-code execution notes

Physics Foundry may generate and execute renderer source. Treat generated code as untrusted input.

Portfolio-grade execution should therefore preserve these invariants:

- execution occurs through the repository's sandbox boundary rather than arbitrary host-shell execution;
- renderer commands are allowlisted and arguments are validated;
- generated source cannot read arbitrary secrets or write outside the designated workspace;
- network access is disabled unless a capability explicitly requires and documents it;
- resource/time limits are enforced;
- logs record command, exit status, and artifact paths;
- failed validation cannot be converted into a successful job state by fallback simulation.

These notes describe the security target. They do not claim that every isolation property is currently hardened for adversarial multi-tenant use.
