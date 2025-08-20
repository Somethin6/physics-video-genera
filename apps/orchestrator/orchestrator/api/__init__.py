"""API endpoints for the Physics Foundry orchestrator"""

from .pipeline import router as pipeline_router
from .projects import router as projects_router
from .quality import router as quality_router
from .audio import router as audio_router

__all__ = [
    "pipeline_router",
    "projects_router",
    "quality_router",
    "audio_router",
]