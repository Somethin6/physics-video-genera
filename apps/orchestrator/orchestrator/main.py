"""Physics Foundry FastAPI orchestrator.

The service is an active prototype. Production mode must never report a
successful render when a required generation/render capability is not wired.
Deterministic fixture mode exists only for testing orchestration semantics.
"""

import asyncio
import importlib.util
import logging
import os
import shutil
from contextlib import asynccontextmanager
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

from fastapi import BackgroundTasks, FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, Field

from .core.dsl_models import (
    LogLevel,
    PipelineLogEntry,
    PipelineStatus,
    PipelineStatusType,
    SceneRequest,
)
from .core.media_pipeline import initialize_media_pipeline
from .core.observability import (
    observability_manager,
    operation_duration_seconds,
    pipeline_operations_total,
    setup_observability_stack,
    system_monitor,
)
from .core.quality_gates import default_quality_gate
from .core.sandbox import execute_safe_code, sandbox_manager

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

FIXTURE_MODE_ENV = "PHYSICS_FOUNDRY_FIXTURE_MODE"


def fixture_mode_enabled() -> bool:
    """Return True only when deterministic test mode is explicitly enabled."""

    return os.getenv(FIXTURE_MODE_ENV, "").strip().lower() in {"1", "true", "yes", "on"}


def command_available(command: str) -> bool:
    """Check whether an external command is available on PATH."""

    return shutil.which(command) is not None


def module_available(module: str) -> bool:
    """Check whether an optional Python module can be imported."""

    return importlib.util.find_spec(module) is not None


def capability_matrix() -> Dict[str, bool]:
    """Report capabilities without implying unsupported paths are operational."""

    return {
        "fixture_mode": fixture_mode_enabled(),
        "manim_cli": command_available("manim"),
        "ffmpeg": command_available("ffmpeg"),
        "blender": command_available("blender"),
        "taichi_python": module_available("taichi"),
        "latex": command_available("latex") or command_available("pdflatex"),
        "nvidia_smi": command_available("nvidia-smi"),
        "local_llm_configured": bool(os.getenv("LLM_ENDPOINT")),
    }


class SystemStatus(BaseModel):
    """System and capability status."""

    status: str
    timestamp: datetime
    version: str
    mode: str
    ocio_config: Optional[str] = None
    gpu_available: bool = False
    sandbox_ready: bool = False
    quality_gates_enabled: bool = True
    capabilities: Dict[str, bool] = Field(default_factory=dict)
    observability: Dict[str, bool] = Field(default_factory=dict)


class PipelineConfig(BaseModel):
    """Pipeline configuration model retained for API/config compatibility."""

    llm_model: str = "gpt-neox-20b-q4"
    max_gpu_layers: int = 28
    render_quality: str = "preview"
    target_framerate: int = 30
    ocio_config: Optional[str] = None
    enable_sandbox: bool = True
    quality_thresholds: Dict[str, float] = Field(
        default_factory=lambda: {
            "ssim_minimum": 0.85,
            "vmaf_minimum": 70.0,
            "text_legibility_minimum": 0.80,
        }
    )


active_pipelines: Dict[str, PipelineStatus] = {}
websocket_connections: List[WebSocket] = []


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle management."""

    logger.info("Starting Physics Foundry Orchestrator")

    setup_observability_stack(
        prometheus_port=9090,
        jaeger_endpoint=os.getenv("JAEGER_ENDPOINT", "http://localhost:14268/api/traces"),
        sentry_dsn=os.getenv("SENTRY_DSN"),
    )

    ocio_config = os.getenv("OCIO", "/config/ocio/config.ocio")
    if not initialize_media_pipeline(ocio_config):
        logger.warning("Media pipeline initialization failed; related capabilities are unavailable")

    monitor_task = asyncio.create_task(system_monitor.start_monitoring())
    logger.info(
        "Physics Foundry Orchestrator ready in %s mode",
        "fixture" if fixture_mode_enabled() else "prototype",
    )

    yield

    logger.info("Shutting down Physics Foundry Orchestrator")
    system_monitor.stop_monitoring()
    monitor_task.cancel()
    sandbox_manager.cleanup_all()


app = FastAPI(
    title="Physics Foundry Orchestrator",
    version="0.3.0",
    description="Prototype orchestration service for local-first physics-media workflows",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Report service liveness, not renderer readiness."""

    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "mode": "fixture" if fixture_mode_enabled() else "prototype",
    }


@app.get("/status", response_model=SystemStatus)
async def system_status():
    """Return explicit dependency/capability status."""

    capabilities = capability_matrix()
    ocio_config = os.getenv("OCIO")
    ocio_available = bool(ocio_config and Path(ocio_config).exists())

    return SystemStatus(
        status="prototype",
        timestamp=datetime.utcnow(),
        version="0.3.0",
        mode="fixture" if fixture_mode_enabled() else "prototype",
        ocio_config=ocio_config if ocio_available else None,
        gpu_available=capabilities["nvidia_smi"],
        sandbox_ready=True,
        quality_gates_enabled=True,
        capabilities=capabilities,
        observability={
            "prometheus": True,
            "tracing": observability_manager.tracer is not None,
            "sentry": os.getenv("SENTRY_DSN") is not None,
        },
    )


@app.get("/capabilities")
async def capabilities():
    """Expose dependency readiness independently of service liveness."""

    return {
        "mode": "fixture" if fixture_mode_enabled() else "prototype",
        "capabilities": capability_matrix(),
        "note": (
            "A capability flag reports dependency availability only; it does not "
            "by itself establish an end-to-end verified renderer path."
        ),
    }


@app.get("/metrics")
async def prometheus_metrics():
    """Prometheus metrics endpoint."""

    from prometheus_client import CONTENT_TYPE_LATEST, generate_latest

    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.post("/api/pipeline/create")
async def create_pipeline(request: SceneRequest, background_tasks: BackgroundTasks):
    """Create a pipeline job and process it asynchronously."""

    pipeline_id = f"pipeline_{int(datetime.utcnow().timestamp() * 1_000_000)}"
    pipeline_status = PipelineStatus(
        pipeline_id=pipeline_id,
        status=PipelineStatusType.PLANNING,
        current_step=0,
        total_steps=3 if fixture_mode_enabled() else 1,
        progress=0.0,
        current_operation="Initializing pipeline",
        logs=[
            PipelineLogEntry(
                timestamp=datetime.utcnow(),
                level=LogLevel.INFO,
                message=f"Pipeline created for topic: {request.topic}",
                component="orchestrator",
                metadata={
                    "topic": request.topic,
                    "duration": request.duration,
                    "fixture_mode": fixture_mode_enabled(),
                },
            )
        ],
    )

    active_pipelines[pipeline_id] = pipeline_status
    background_tasks.add_task(process_pipeline, pipeline_id, request)

    await broadcast_pipeline_event(
        {
            "type": "pipeline_created",
            "pipeline_id": pipeline_id,
            "data": pipeline_status.dict(),
        }
    )
    pipeline_operations_total.labels(operation="create_pipeline", status="started").inc()

    return {
        "pipeline_id": pipeline_id,
        "status": "created",
        "mode": "fixture" if fixture_mode_enabled() else "prototype",
    }


@app.get("/api/pipeline/{pipeline_id}/status", response_model=PipelineStatus)
async def get_pipeline_status(pipeline_id: str):
    """Get pipeline status."""

    if pipeline_id not in active_pipelines:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    return active_pipelines[pipeline_id]


@app.post("/api/pipeline/{pipeline_id}/quality-check")
async def run_quality_check(pipeline_id: str, frame_paths: List[str]):
    """Run real quality analysis on caller-supplied frame paths."""

    if pipeline_id not in active_pipelines:
        raise HTTPException(status_code=404, detail="Pipeline not found")

    try:
        frame_paths_obj = [Path(path) for path in frame_paths]
        missing = [str(path) for path in frame_paths_obj if not path.exists()]
        if missing:
            raise HTTPException(
                status_code=400,
                detail={"message": "Frame paths do not exist", "missing": missing},
            )

        gate_passed, analyses = await default_quality_gate.check_frame_sequence(frame_paths_obj)
        pipeline = active_pipelines[pipeline_id]
        pipeline.logs.append(
            PipelineLogEntry(
                timestamp=datetime.utcnow(),
                level=LogLevel.INFO if gate_passed else LogLevel.WARN,
                message=f"Quality check {'passed' if gate_passed else 'failed'}",
                component="quality_gate",
                metadata={"frames_analyzed": len(analyses), "gate_passed": gate_passed},
            )
        )

        payload = {
            "pipeline_id": pipeline_id,
            "gate_passed": gate_passed,
            "frame_analyses": [analysis.dict() for analysis in analyses],
        }
        await broadcast_pipeline_event(
            {
                "type": "quality_check_complete",
                "pipeline_id": pipeline_id,
                "data": payload,
            }
        )
        return payload
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Quality check failed")
        raise HTTPException(status_code=500, detail=f"Quality check failed: {exc}") from exc


@app.post("/api/code/execute")
async def execute_code_safely(
    code: str,
    code_type: str = "python",
    timeout: Optional[float] = 60.0,
):
    """Execute code through the repository sandbox boundary."""

    with operation_duration_seconds.labels(operation="code_execution").time():
        try:
            result = await execute_safe_code(code, code_type, timeout)
            pipeline_operations_total.labels(
                operation="code_execution",
                status="success" if result["success"] else "error",
            ).inc()
            return result
        except Exception as exc:
            logger.exception("Code execution failed")
            pipeline_operations_total.labels(operation="code_execution", status="error").inc()
            raise HTTPException(status_code=500, detail=f"Code execution failed: {exc}") from exc


@app.websocket("/ws/pipeline/{pipeline_id}")
async def pipeline_websocket(websocket: WebSocket, pipeline_id: str):
    """WebSocket connection for real-time pipeline updates."""

    await websocket.accept()
    websocket_connections.append(websocket)

    try:
        if pipeline_id in active_pipelines:
            await websocket.send_json(
                {
                    "type": "pipeline_status",
                    "pipeline_id": pipeline_id,
                    "data": active_pipelines[pipeline_id].dict(),
                }
            )
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in websocket_connections:
            websocket_connections.remove(websocket)
        logger.info("WebSocket disconnected for pipeline %s", pipeline_id)


async def broadcast_pipeline_event(event: Dict):
    """Broadcast an event to live websocket clients."""

    for websocket in websocket_connections.copy():
        try:
            await websocket.send_json(event)
        except Exception:
            if websocket in websocket_connections:
                websocket_connections.remove(websocket)


async def process_fixture_pipeline(pipeline_id: str, request: SceneRequest):
    """Exercise deterministic orchestration without pretending to render media."""

    await update_pipeline_status(
        pipeline_id,
        PipelineStatusType.PLANNING,
        1,
        3,
        "Fixture: validating bounded request",
    )

    # Deliberately deterministic structure used only to test orchestration plumbing.
    fixture_plan = {
        "fixture": True,
        "topic": request.topic,
        "duration": request.duration,
        "level": request.level.value,
        "scenes": [
            {"id": "fixture-01", "engine": "manim", "purpose": "introduction"},
            {"id": "fixture-02", "engine": "manim", "purpose": "core concept"},
        ],
    }

    pipeline = active_pipelines[pipeline_id]
    pipeline.logs.append(
        PipelineLogEntry(
            timestamp=datetime.utcnow(),
            level=LogLevel.INFO,
            message="Fixture scene plan created",
            component="fixture",
            metadata=fixture_plan,
        )
    )

    await update_pipeline_status(
        pipeline_id,
        PipelineStatusType.SCRIPTING,
        2,
        3,
        "Fixture: exercising orchestration state transition",
    )
    await asyncio.sleep(0)

    await update_pipeline_status(
        pipeline_id,
        PipelineStatusType.FIXTURE_COMPLETE,
        3,
        3,
        "Fixture orchestration complete; no media was rendered",
    )
    pipeline_operations_total.labels(operation="process_pipeline", status="fixture_complete").inc()


async def process_pipeline(pipeline_id: str, request: SceneRequest):
    """Process a job without converting unimplemented stages into fake success."""

    try:
        async with observability_manager.trace_operation(
            "process_pipeline",
            {
                "pipeline_id": pipeline_id,
                "topic": request.topic,
                "fixture_mode": fixture_mode_enabled(),
            },
        ):
            if fixture_mode_enabled():
                await process_fixture_pipeline(pipeline_id, request)
                return

            message = (
                "Real prompt-to-render execution is not yet wired as a verified path. "
                f"Set {FIXTURE_MODE_ENV}=1 only for deterministic orchestration tests; "
                "fixture completion never represents a rendered video."
            )
            await update_pipeline_status(
                pipeline_id,
                PipelineStatusType.UNSUPPORTED,
                1,
                1,
                message,
                level=LogLevel.WARN,
            )
            pipeline_operations_total.labels(operation="process_pipeline", status="unsupported").inc()
    except Exception as exc:
        logger.exception("Pipeline %s failed", pipeline_id)
        pipeline = active_pipelines[pipeline_id]
        pipeline.status = PipelineStatusType.ERROR
        pipeline.current_operation = f"Error: {exc}"
        pipeline.updated_at = datetime.utcnow()
        pipeline.logs.append(
            PipelineLogEntry(
                timestamp=datetime.utcnow(),
                level=LogLevel.ERROR,
                message=str(exc),
                component="orchestrator",
                metadata={"error_type": type(exc).__name__},
            )
        )
        await broadcast_pipeline_event(
            {
                "type": "pipeline_error",
                "pipeline_id": pipeline_id,
                "data": {"error": str(exc)},
            }
        )
        pipeline_operations_total.labels(operation="process_pipeline", status="error").inc()


async def update_pipeline_status(
    pipeline_id: str,
    status: PipelineStatusType,
    current_step: int,
    total_steps: int,
    operation: str,
    level: LogLevel = LogLevel.INFO,
):
    """Update pipeline status and broadcast to clients."""

    if pipeline_id not in active_pipelines:
        return

    pipeline = active_pipelines[pipeline_id]
    pipeline.status = status
    pipeline.current_step = current_step
    pipeline.total_steps = total_steps
    pipeline.progress = (current_step / total_steps) * 100 if total_steps else 0.0
    pipeline.current_operation = operation
    pipeline.updated_at = datetime.utcnow()
    pipeline.logs.append(
        PipelineLogEntry(
            timestamp=datetime.utcnow(),
            level=level,
            message=operation,
            component="orchestrator",
            metadata={"step": current_step, "total_steps": total_steps},
        )
    )

    await broadcast_pipeline_event(
        {
            "type": "pipeline_status_update",
            "pipeline_id": pipeline_id,
            "data": pipeline.dict(),
        }
    )


@app.get("/")
async def root():
    """Root endpoint with scope-accurate service information."""

    return {
        "service": "Physics Foundry Orchestrator",
        "version": "0.3.0",
        "status": "prototype",
        "mode": "fixture" if fixture_mode_enabled() else "prototype",
        "implemented_interfaces": [
            "observability",
            "quality_gate_endpoint",
            "sandboxed_code_endpoint",
            "websocket_pipeline_events",
            "capability_reporting",
        ],
        "verified_prompt_to_render": False,
        "endpoints": {
            "health": "/health",
            "status": "/status",
            "capabilities": "/capabilities",
            "metrics": "/metrics",
            "websocket": "/ws/pipeline/{pipeline_id}",
        },
    }
