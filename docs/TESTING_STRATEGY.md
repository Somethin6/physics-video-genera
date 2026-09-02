# Testing strategy

Testing should be layered so infrastructure claims are not confused with renderer/artifact claims.

## Layer 1: pure unit tests

Schemas, state transitions, configuration validation, artifact metadata, quality-result parsing, and deterministic helper functions.

## Layer 2: fixture integration

An explicit fixture mode exercises request submission, job lifecycle, progress events, persisted plan/source metadata, and completion/failure semantics without requiring external model/render dependencies.

## Layer 3: capability tests

Optional tests detect and exercise installed capabilities such as Manim or FFmpeg. Missing optional dependencies should skip or fail capability checks explicitly rather than substitute synthetic success.

## Layer 4: reference artifact test

One documented prompt runs through the real Manim path and produces a non-empty MP4 plus at least one measured quality result. This is the portfolio evidence layer.

## Rule

Passing Layers 1-2 must never be presented as proof that Layer 4 works.
