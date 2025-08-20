"""Base plugin interface for render engines"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List


class RenderPlugin(ABC):
    """Base interface for render engine plugins"""
    
    @property
    @abstractmethod
    def name(self) -> str:
        """Plugin name"""
        pass
    
    @property
    @abstractmethod
    def version(self) -> str:
        """Plugin version"""
        pass
    
    @property
    @abstractmethod
    def capabilities(self) -> List[str]:
        """List of plugin capabilities"""
        pass
    
    @abstractmethod
    async def initialize(self, config: Dict[str, Any]) -> bool:
        """Initialize the plugin with configuration"""
        pass
    
    @abstractmethod
    async def render(self, scene_config: Dict[str, Any]) -> Dict[str, Any]:
        """Render a scene using this engine"""
        pass
    
    @abstractmethod
    async def get_status(self) -> Dict[str, Any]:
        """Get current plugin status"""
        pass
    
    @abstractmethod
    async def cleanup(self) -> None:
        """Clean up resources"""
        pass


class PluginManager:
    """Manager for loading and coordinating plugins"""
    
    def __init__(self):
        self.plugins: Dict[str, RenderPlugin] = {}
    
    def register_plugin(self, plugin: RenderPlugin) -> None:
        """Register a plugin"""
        self.plugins[plugin.name] = plugin
    
    def get_plugin(self, name: str) -> RenderPlugin:
        """Get a plugin by name"""
        return self.plugins.get(name)
    
    def list_plugins(self) -> List[str]:
        """List all registered plugins"""
        return list(self.plugins.keys())
    
    async def initialize_all(self, config: Dict[str, Any]) -> None:
        """Initialize all plugins"""
        for plugin in self.plugins.values():
            await plugin.initialize(config)
    
    async def cleanup_all(self) -> None:
        """Cleanup all plugins"""
        for plugin in self.plugins.values():
            await plugin.cleanup()


# Global plugin manager instance
plugin_manager = PluginManager()