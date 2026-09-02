"""Dependency-light tests for portfolio claim semantics."""

from datetime import datetime

import pytest

from orchestrator.core.capabilities import (
    FIXTURE_MODE_ENV,
    capability_matrix,
    fixture_mode_enabled,
)
from orchestrator.core.dsl_models import (
    LogLevel,
    PipelineLogEntry,
    PipelineStatus,
    PipelineStatusType,
    SceneRequest,
)
from orchestrator.core.fixtures import build_fixture_plan


def _pipeline(pipeline_id: str) -> PipelineStatus:
    return PipelineStatus(
        pipeline_id=pipeline_id,
        status=PipelineStatusType.PLANNING,
        current_step=0,
        total_steps=1,
        progress=0.0,
        current_operation="test",
    )


def test_fixture_mode_requires_explicit_opt_in(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv(FIXTURE_MODE_ENV, raising=False)
    assert fixture_mode_enabled() is False

    for value in ("1", "true", "yes", "on"):
        monkeypatch.setenv(FIXTURE_MODE_ENV, value)
        assert fixture_mode_enabled() is True

    for value in ("0", "false", "off", ""):
        monkeypatch.setenv(FIXTURE_MODE_ENV, value)
        assert fixture_mode_enabled() is False


def test_capability_matrix_is_explicit_boolean_state(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv(FIXTURE_MODE_ENV, raising=False)
    matrix = capability_matrix()

    assert matrix["fixture_mode"] is False
    assert "manim_cli" in matrix
    assert "ffmpeg" in matrix
    assert "local_llm_configured" in matrix
    assert all(isinstance(value, bool) for value in matrix.values())


def test_fixture_plan_is_deterministic_and_labeled() -> None:
    request = SceneRequest(topic="simple harmonic motion", duration=20, seed=7)

    first = build_fixture_plan(request)
    second = build_fixture_plan(request)

    assert first == second
    assert first["fixture"] is True
    assert first["topic"] == "simple harmonic motion"
    assert first["seed"] == 7
    assert all(scene["engine"] == "manim" for scene in first["scenes"])


def test_pipeline_defaults_are_isolated_between_instances() -> None:
    first = _pipeline("first")
    second = _pipeline("second")

    first.logs.append(
        PipelineLogEntry(
            timestamp=datetime.utcnow(),
            level=LogLevel.INFO,
            message="first only",
            component="test",
        )
    )

    assert len(first.logs) == 1
    assert second.logs == []
    assert second.artifacts == []
    assert second.workers == []


def test_fixture_and_unsupported_are_distinct_terminal_states() -> None:
    assert PipelineStatusType.FIXTURE_COMPLETE != PipelineStatusType.COMPLETE
    assert PipelineStatusType.UNSUPPORTED != PipelineStatusType.ERROR
