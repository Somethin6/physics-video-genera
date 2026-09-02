# Real vs fixture mode

Fixture mode exists to test orchestration deterministically. It may use canned plans, dummy artifact metadata, or deterministic state transitions.

Real mode must invoke actual configured dependencies and may only report completion when required real artifacts exist.

Every persisted job/result should carry enough metadata to distinguish the two modes. A fixture result must never be surfaced as a real render result.
