"""Project management API endpoints"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/")
async def list_projects() -> List[Dict[str, Any]]:
    """List all projects"""
    return [
        {
            "id": "proj_001",
            "title": "Quantum Mechanics Introduction",
            "topic": "Wave-particle duality",
            "status": "completed",
            "created_at": "2024-08-19T10:00:00Z",
            "progress": 1.0
        },
        {
            "id": "proj_002", 
            "title": "Electromagnetic Fields",
            "topic": "Maxwell's equations",
            "status": "in_progress",
            "created_at": "2024-08-20T06:30:00Z",
            "progress": 0.65
        }
    ]


@router.get("/{project_id}")
async def get_project(project_id: str) -> Dict[str, Any]:
    """Get project details"""
    return {
        "id": project_id,
        "title": "Sample Physics Project",
        "description": "A demonstration of physics concepts",
        "topic": "Classical Mechanics",
        "duration": 180,
        "level": "intermediate",
        "status": "in_progress",
        "progress": 0.75,
        "created_at": "2024-08-20T07:00:00Z",
        "updated_at": "2024-08-20T07:45:00Z"
    }


@router.delete("/{project_id}")
async def delete_project(project_id: str) -> Dict[str, Any]:
    """Delete a project"""
    try:
        return {
            "project_id": project_id,
            "status": "deleted",
            "message": "Project deleted successfully"
        }
    except Exception as e:
        logger.error(f"Failed to delete project: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete project")