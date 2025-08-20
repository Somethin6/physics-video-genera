"""
Physics Foundry Plugin Architecture

This directory contains extensible render engine plugins that can be loaded
dynamically to support different rendering backends.

Plugin Structure:
- Each plugin should implement the RenderPlugin interface
- Plugins are auto-discovered and loaded at runtime
- Configuration is handled through the runtime.config.json

Supported Engines:
- Blender (3D rendering with OptiX/CUDA)
- Manim (Mathematical animations)
- Taichi (Physics simulations)
- Custom engines can be added by implementing the interface

Example Plugin:
```python
from plugins.base import RenderPlugin

class MyCustomPlugin(RenderPlugin):
    def render(self, scene_config):
        # Implementation here
        pass
```
"""