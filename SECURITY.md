# Security

Physics Foundry is an active research/engineering prototype. It includes code paths intended to execute generated renderer source, which should be treated as untrusted input.

## Current security boundary

The repository contains static source validation and nsjail/firejail-oriented sandbox infrastructure, but it is **not claimed to be hardened for hostile multi-tenant execution**. Do not expose generated-code execution to untrusted remote users on the basis of the current prototype alone.

Production-facing execution should preserve these invariants:

- generated code runs only through an explicit sandbox boundary;
- unavailable sandbox/render dependencies fail explicitly rather than falling back to direct host execution;
- network and filesystem access are minimized and documented;
- time, memory, process, and output limits are enforced;
- command, exit status, logs, and artifact paths are retained;
- fixture/test completion can never be surfaced as real render completion.

Known sandbox-hardening work is tracked in issue #27.

## Reporting a vulnerability

Please use GitHub's private vulnerability-reporting mechanism if it is enabled for this repository. If private reporting is unavailable, contact the repository owner privately rather than publishing exploit details in a public issue.

Include the affected file/path, environment assumptions, reproduction steps, and expected impact. Do not include real secrets, credentials, or third-party private data in reports.
