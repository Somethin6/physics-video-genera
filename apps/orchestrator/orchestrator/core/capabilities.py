"""Dependency-light capability detection for Physics Foundry."""

import importlib.util
import os
import shutil
from typing import Dict

FIXTURE_MODE_ENV = "PHYSICS_FOUNDRY_FIXTURE_MODE"


def fixture_mode_enabled() -> bool:
    """Return True only when deterministic fixture mode is explicitly enabled."""

    return os.getenv(FIXTURE_MODE_ENV, "").strip().lower() in {"1", "true", "yes", "on"}


def command_available(command: str) -> bool:
    """Return whether an external executable is discoverable on PATH."""

    return shutil.which(command) is not None


def module_available(module: str) -> bool:
    """Return whether an optional Python module can be imported."""

    return importlib.util.find_spec(module) is not None


def capability_matrix() -> Dict[str, bool]:
    """Report dependency availability without implying end-to-end verification."""

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
