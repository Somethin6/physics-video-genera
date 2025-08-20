"""Shared Python models for Physics Foundry"""

from datetime import datetime
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class ProjectLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class ProjectStatus(str, Enum):
    CREATED = "created"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


class PipelineStage(str, Enum):
    PLANNING = "planning"
    SCRIPTING = "scripting" 
    RENDERING = "rendering"
    ASSEMBLING = "assembling"
    COMPLETE = "complete"
    ERROR = "error"


class Project(BaseModel):
    """Project data model"""
    id: str
    title: str
    description: Optional[str] = None
    topic: str
    duration: float
    level: ProjectLevel
    status: ProjectStatus
    progress: float = 0.0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class PipelineStatus(BaseModel):
    """Pipeline status model"""
    pipeline_id: str
    status: PipelineStage
    progress: float
    current_operation: Optional[str] = None
    estimated_completion: Optional[datetime] = None
    current_step: Optional[int] = None
    total_steps: Optional[int] = None


class QualityMetrics(BaseModel):
    """Quality analysis metrics"""
    overall_score: float
    ssim: float
    psnr: Optional[float] = None
    vmaf: Optional[float] = None
    motion_stability: Optional[float] = None
    text_legibility: Optional[float] = None


class FrameAnalysis(BaseModel):
    """Frame analysis results"""
    frame_index: int
    timestamp: float
    metrics: QualityMetrics
    issues: List[str] = []
    passed: bool = True
    analyzed_at: datetime


class AudioAlignment(BaseModel):
    """Audio word alignment"""
    word: str
    start: float
    end: float
    confidence: float


class SystemMetrics(BaseModel):
    """System performance metrics"""
    gpu: Dict[str, float]
    cpu: Dict[str, float] 
    models: Dict[str, str]
    pipeline: Dict[str, int]


class APIResponse(BaseModel):
    """Standard API response model"""
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
    message: Optional[str] = None