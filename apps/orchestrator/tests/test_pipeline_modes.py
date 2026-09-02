"""Tests for portfolio-safe pipeline mode semantics."""

import pytest

from orchestrator.core.dsl_models import (
    LevelType,
    PipelineStatus,
    PipelineStatusType,
    SceneRequest,
)
from orchestrator.main import (
    FIXTURE_MODE_ENV,
    active_pipelines,
    capability_matrix,
    fixture_mode_enabled,
    process_fixture_pipeline,
)


def _pipeline(pipeline_id: str) -> PipelineStatus:
    return PipelineStatus(
        pipeline_id=pipeline_id,
        status=PipelineStatusType.PLANNING,
        current_step=0,
        total_steps=3,
        progress=0.0,
        current_operation="test initialization",
    )


def test_fixture_mode_is_opt_in(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv(FIXTURE_MODE_ENV, raising=False)
    assert fixture_mode_enabled() is False

    monkeypatch.setenv(FIXTURE_MODE_ENV, "true")
    assert fixture_mode_enabled() is True

    monkeypatch.setenv(FIXTURE_MODE_ENV, "0")
    assert fixture_mode_enabled() is False


def test_capability_matrix_reports_booleans(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv(FIXTURE_MODE_ENV, raising=False)
    capabilities = capability_matrix()

    assert capabilities["fixture_mode"] is False
    assert capabilities
    assert all(isinstance(value, bool) for value in capabilities.values())


def test_pipeline_model_defaults_are_not_shared() -> None:
    first = _pipeline("first")
    second = _pipeline("second")

    first.logs.append("sentinel")  # type: ignore[arg-type]

    assert second.logs == []
    assert second.artifacts == []
    assert second.workers == []


@pytest.mark.asyncio
async def test_fixture_pipeline_never_claims_real_completion() -> None:
    pipeline_id = "fixture-test"
    active_pipelines[pipeline_id] = _pipeline(pipeline_id)
    request = SceneRequest(
        topic="simple harmonic motion",
        duration=20,
        level=LevelType.INTERMEDIATE,
    )

    try:
        await process_fixture_pipeline(pipeline_id, request)
        status = active_pipelines[pipeline_id]

        assert status.status == PipelineStatusType.FIXTURE_COMPLETE
        assert status.progress == 100.0
        assert status.artifacts == []
        assert "no media was rendered" in status.current_operation.lower()
        assert any(entry.component == "fixture" for entry in status.logs)
    finally:
        active_pipelines.pop(pipeline_id, None)
