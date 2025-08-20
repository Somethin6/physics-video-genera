"""Integration utilities to connect shared packages with applications"""

import sys
from pathlib import Path

def setup_shared_imports():
    """Add shared packages to Python path for orchestrator"""
    repo_root = Path(__file__).parent.parent.parent
    shared_py_path = repo_root / "packages" / "shared" / "py"
    plugins_path = repo_root / "packages" / "plugins"
    
    if str(shared_py_path) not in sys.path:
        sys.path.insert(0, str(shared_py_path))
    
    if str(plugins_path) not in sys.path:
        sys.path.insert(0, str(plugins_path))

# Auto-setup when imported
setup_shared_imports()