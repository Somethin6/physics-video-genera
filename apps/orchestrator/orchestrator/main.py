"""
Physics Video Pipeline Orchestrator
FastAPI application with WebSockets for real-time pipeline monitoring
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
from contextlib import asynccontextmanager
import json
import asyncio
from typing import Dict, List, Set
from datetime import datetime
import logging

from .core.dsl_models import SceneRequest, PipelineStatus, PipelineEvent
from .core.timeline import TimelineManager  
from .core.planner import ScriptPlanner
from .core.reviewer import QualityReviewer
from .core.aligner import AudioAligner
from .core.color import ColorManager
from .core.codecs import VideoCodecs
from .core.errors import ErrorRegistry
from .workers.blender_worker import BlenderWorker
from .workers.manim_worker import ManimWorker  
from .workers.taichi_worker import TaichiWorker
from .sched.dag import PipelineDAG
from .telemetry.metrics import MetricsCollector
from .telemetry.tracing import TracingManager
from .settings import Settings

# Global state
settings = Settings()
pipeline_connections: Dict[str, WebSocket] = {}
active_pipelines: Dict[str, PipelineDAG] = {}
metrics = MetricsCollector()
tracing = TracingManager()

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger.info("Starting Physics Foundry Orchestrator")
    
    # Initialize telemetry
    await tracing.initialize()
    await metrics.initialize()
    
    # Initialize workers
    global blender_worker, manim_worker, taichi_worker
    blender_worker = BlenderWorker(settings.blender)
    manim_worker = ManimWorker(settings.manim) 
    taichi_worker = TaichiWorker(settings.taichi)
    
    # Initialize pipeline components
    global timeline_manager, script_planner, quality_reviewer, audio_aligner
    timeline_manager = TimelineManager(settings.otio)
    script_planner = ScriptPlanner(settings.llm)
    quality_reviewer = QualityReviewer(settings.qa)
    audio_aligner = AudioAligner(settings.audio)
    
    yield
    
    # Cleanup
    logger.info("Shutting down Physics Foundry Orchestrator")
    await tracing.shutdown()
    await metrics.shutdown()


app = FastAPI(
    title="Physics Foundry Orchestrator",
    description="Multi-model physics video generation pipeline",
    version="0.1.0",
    lifespan=lifespan
)

# CORS middleware for GUI integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
    
    async def broadcast(self, event: PipelineEvent):
        disconnected = set()
        for connection in self.active_connections:
            try:
                await connection.send_json(event.dict())
            except Exception:
                disconnected.add(connection)
        
        # Clean up disconnected connections
        self.active_connections -= disconnected


connection_manager = ConnectionManager()


# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "0.1.0"
    }


# System status endpoint
@app.get("/api/system/status")
async def system_status():
    return {
        "workers": {
            "blender": await blender_worker.status(),
            "manim": await manim_worker.status(),
            "taichi": await taichi_worker.status()
        },
        "pipelines": {
            "active": len(active_pipelines),
            "total": metrics.get_total_pipelines()
        },
        "connections": len(connection_manager.active_connections)
    }


# Create new physics video pipeline
@app.post("/api/pipeline/create")
async def create_pipeline(request: SceneRequest):
    """Create a new physics video generation pipeline"""
    
    pipeline_id = f"pipeline_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
    
    # Create pipeline DAG
    dag = PipelineDAG(
        pipeline_id=pipeline_id,
        request=request,
        timeline_manager=timeline_manager,
        script_planner=script_planner,
        workers={
            "blender": blender_worker,
            "manim": manim_worker, 
            "taichi": taichi_worker
        },
        quality_reviewer=quality_reviewer,
        audio_aligner=audio_aligner,
        connection_manager=connection_manager
    )
    
    active_pipelines[pipeline_id] = dag
    
    return {
        "pipeline_id": pipeline_id,
        "status": "created",
        "estimated_duration": dag.estimate_duration()
    }


# Start pipeline execution
@app.post("/api/pipeline/{pipeline_id}/start")
async def start_pipeline(pipeline_id: str):
    """Start executing a pipeline"""
    
    if pipeline_id not in active_pipelines:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    
    dag = active_pipelines[pipeline_id]
    
    # Start pipeline execution in background
    asyncio.create_task(dag.execute())
    
    return {"status": "started"}


# Get pipeline status
@app.get("/api/pipeline/{pipeline_id}/status")
async def get_pipeline_status(pipeline_id: str):
    """Get current pipeline status"""
    
    if pipeline_id not in active_pipelines:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    
    dag = active_pipelines[pipeline_id]
    return await dag.get_status()


# WebSocket endpoint for real-time updates
@app.websocket("/ws/pipeline")
async def websocket_endpoint(websocket: WebSocket):
    await connection_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and handle any client messages
            try:
                data = await websocket.receive_text()
                # Handle client messages if needed (heartbeat, commands, etc.)
                logger.debug(f"Received WebSocket message: {data}")
            except WebSocketDisconnect:
                break
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        connection_manager.disconnect(websocket)


# Prometheus metrics endpoint
@app.get("/metrics")
async def get_metrics():
    """Prometheus metrics endpoint"""
    return metrics.generate_prometheus_metrics()


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )