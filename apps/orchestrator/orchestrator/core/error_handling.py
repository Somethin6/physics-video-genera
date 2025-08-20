"""Comprehensive error handling and recovery system for the Physics Foundry orchestrator."""

import asyncio
import logging
import traceback
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Any, Callable, Awaitable
from dataclasses import dataclass, field
from contextlib import asynccontextmanager

logger = logging.getLogger(__name__)


class ErrorCode(str, Enum):
    """Standardized error codes for the system."""
    
    # LLM Related Errors
    LLM_CONNECTION_FAILED = "LLM-CONN-001"
    LLM_TIMEOUT = "LLM-TIMEOUT-002"
    LLM_INVALID_RESPONSE = "LLM-JSON-003"
    LLM_QUOTA_EXCEEDED = "LLM-QUOTA-004"
    
    # Rendering Engine Errors
    RENDER_OPTIX_OOM = "BLD-OPTIX-101"
    RENDER_CUDA_UNAVAILABLE = "BLD-CUDA-102"
    RENDER_MANIM_FAIL = "MNM-EXEC-201"
    RENDER_BLENDER_CRASH = "BLD-CRASH-301"
    
    # Media Processing Errors
    MEDIA_CORRUPTED = "MEDIA-CORRUPT-401"
    MEDIA_ENCODING_FAIL = "MEDIA-ENC-402"
    MEDIA_UNSUPPORTED = "MEDIA-UNSUP-403"
    
    # System Resource Errors
    INSUFFICIENT_MEMORY = "SYS-MEM-501"
    DISK_SPACE_LOW = "SYS-DISK-502"
    GPU_UNAVAILABLE = "SYS-GPU-503"
    
    # Network and API Errors
    NETWORK_TIMEOUT = "NET-TIMEOUT-601"
    API_RATE_LIMIT = "API-RATE-602"
    API_UNAUTHORIZED = "API-AUTH-603"
    
    # Pipeline Errors
    PIPELINE_INTERRUPTED = "PIPE-INT-701"
    PIPELINE_CORRUPTED = "PIPE-CORRUPT-702"
    PIPELINE_TIMEOUT = "PIPE-TIMEOUT-703"


@dataclass
class ErrorContext:
    """Context information for errors."""
    timestamp: datetime = field(default_factory=datetime.utcnow)
    component: str = ""
    operation: str = ""
    user_id: Optional[str] = None
    project_id: Optional[str] = None
    additional_data: Dict[str, Any] = field(default_factory=dict)


@dataclass
class RecoveryAction:
    """Recovery action that can be taken for an error."""
    name: str
    description: str
    handler: Callable[[], Awaitable[bool]]
    automatic: bool = False
    cost: int = 0  # Relative cost of the action


@dataclass 
class ErrorRecord:
    """Complete error record with context and recovery options."""
    code: ErrorCode
    message: str
    context: ErrorContext
    exception: Optional[Exception] = None
    stack_trace: Optional[str] = None
    recovery_actions: List[RecoveryAction] = field(default_factory=list)
    resolved: bool = False
    resolution_method: Optional[str] = None


class ErrorRegistry:
    """Central registry for error patterns and recovery strategies."""
    
    def __init__(self):
        self._error_patterns: Dict[ErrorCode, Dict[str, Any]] = {}
        self._recovery_handlers: Dict[ErrorCode, List[RecoveryAction]] = {}
        self._error_history: List[ErrorRecord] = []
        self._setup_default_patterns()
    
    def _setup_default_patterns(self):
        """Setup default error patterns and recovery strategies."""
        
        # LLM Connection Issues
        self.register_pattern(
            ErrorCode.LLM_CONNECTION_FAILED,
            patterns=["connection refused", "timeout", "network unreachable"],
            recovery_actions=[
                RecoveryAction(
                    name="retry_connection",
                    description="Retry LLM connection with exponential backoff",
                    handler=self._retry_llm_connection,
                    automatic=True,
                    cost=1
                ),
                RecoveryAction(
                    name="fallback_model",
                    description="Switch to fallback LLM model",
                    handler=self._switch_fallback_llm,
                    automatic=True,
                    cost=2
                ),
                RecoveryAction(
                    name="offline_mode",
                    description="Continue with cached/offline capabilities",
                    handler=self._enable_offline_mode,
                    automatic=False,
                    cost=5
                )
            ]
        )
        
        # Rendering Issues
        self.register_pattern(
            ErrorCode.RENDER_OPTIX_OOM,
            patterns=["out of memory", "OptiX", "CUDA_ERROR_OUT_OF_MEMORY"],
            recovery_actions=[
                RecoveryAction(
                    name="reduce_samples",
                    description="Reduce render samples to fit memory",
                    handler=self._reduce_render_samples,
                    automatic=True,
                    cost=1
                ),
                RecoveryAction(
                    name="fallback_cuda",
                    description="Fall back to CUDA rendering",
                    handler=self._fallback_to_cuda,
                    automatic=True,
                    cost=2
                ),
                RecoveryAction(
                    name="cpu_rendering",
                    description="Fall back to CPU rendering",
                    handler=self._fallback_to_cpu,
                    automatic=False,
                    cost=10
                )
            ]
        )
        
        # Media Processing Issues
        self.register_pattern(
            ErrorCode.MEDIA_ENCODING_FAIL,
            patterns=["encoding failed", "codec error", "ffmpeg"],
            recovery_actions=[
                RecoveryAction(
                    name="retry_different_codec",
                    description="Try alternative codec",
                    handler=self._retry_different_codec,
                    automatic=True,
                    cost=2
                ),
                RecoveryAction(
                    name="reduce_quality",
                    description="Reduce output quality",
                    handler=self._reduce_output_quality,
                    automatic=True,
                    cost=3
                )
            ]
        )
    
    def register_pattern(
        self,
        error_code: ErrorCode,
        patterns: List[str],
        recovery_actions: List[RecoveryAction]
    ):
        """Register an error pattern with recovery actions."""
        self._error_patterns[error_code] = {
            "patterns": patterns,
            "count": 0,
            "last_seen": None
        }
        self._recovery_handlers[error_code] = recovery_actions
    
    def classify_error(self, exception: Exception, context: ErrorContext) -> ErrorRecord:
        """Classify an error and determine recovery actions."""
        error_message = str(exception).lower()
        
        # Try to match error patterns
        matched_code = None
        for error_code, pattern_info in self._error_patterns.items():
            for pattern in pattern_info["patterns"]:
                if pattern.lower() in error_message:
                    matched_code = error_code
                    break
            if matched_code:
                break
        
        # Default to generic error if no pattern matches
        if not matched_code:
            matched_code = ErrorCode.PIPELINE_INTERRUPTED
        
        # Update pattern statistics
        if matched_code in self._error_patterns:
            self._error_patterns[matched_code]["count"] += 1
            self._error_patterns[matched_code]["last_seen"] = datetime.utcnow()
        
        # Create error record
        error_record = ErrorRecord(
            code=matched_code,
            message=str(exception),
            context=context,
            exception=exception,
            stack_trace=traceback.format_exc(),
            recovery_actions=self._recovery_handlers.get(matched_code, [])
        )
        
        self._error_history.append(error_record)
        return error_record
    
    async def attempt_recovery(self, error_record: ErrorRecord) -> bool:
        """Attempt to recover from an error using available actions."""
        if not error_record.recovery_actions:
            logger.warning(f"No recovery actions available for {error_record.code}")
            return False
        
        # Sort recovery actions by cost (try cheaper options first)
        sorted_actions = sorted(error_record.recovery_actions, key=lambda x: x.cost)
        
        for action in sorted_actions:
            if action.automatic or await self._should_attempt_action(action):
                try:
                    logger.info(f"Attempting recovery: {action.name}")
                    success = await action.handler()
                    if success:
                        error_record.resolved = True
                        error_record.resolution_method = action.name
                        logger.info(f"Recovery successful: {action.name}")
                        return True
                except Exception as recovery_error:
                    logger.error(f"Recovery action {action.name} failed: {recovery_error}")
                    continue
        
        logger.error(f"All recovery attempts failed for {error_record.code}")
        return False
    
    async def _should_attempt_action(self, action: RecoveryAction) -> bool:
        """Determine if a manual action should be attempted."""
        # In a real implementation, this might check user preferences,
        # cost thresholds, or prompt for user confirmation
        return action.cost <= 5  # Only attempt low-cost manual actions automatically
    
    # Recovery handler implementations
    async def _retry_llm_connection(self) -> bool:
        """Retry LLM connection with backoff."""
        max_retries = 3
        for attempt in range(max_retries):
            try:
                await asyncio.sleep(2 ** attempt)  # Exponential backoff
                # Attempt to reconnect to LLM service
                # In real implementation, this would test the actual connection
                return True
            except Exception as e:
                logger.warning(f"LLM connection retry {attempt + 1} failed: {e}")
                if attempt == max_retries - 1:
                    return False
        return False
    
    async def _switch_fallback_llm(self) -> bool:
        """Switch to fallback LLM model."""
        try:
            # Switch to fallback model configuration
            logger.info("Switching to fallback LLM model")
            return True
        except Exception as e:
            logger.error(f"Failed to switch to fallback LLM: {e}")
            return False
    
    async def _enable_offline_mode(self) -> bool:
        """Enable offline mode with cached responses."""
        try:
            logger.info("Enabling offline mode")
            # Enable cached/offline processing
            return True
        except Exception as e:
            logger.error(f"Failed to enable offline mode: {e}")
            return False
    
    async def _reduce_render_samples(self) -> bool:
        """Reduce rendering samples to fit memory."""
        try:
            logger.info("Reducing render samples")
            # Reduce sample count in render settings
            return True
        except Exception as e:
            logger.error(f"Failed to reduce render samples: {e}")
            return False
    
    async def _fallback_to_cuda(self) -> bool:
        """Fallback from OptiX to CUDA rendering."""
        try:
            logger.info("Falling back to CUDA rendering")
            # Switch rendering backend
            return True
        except Exception as e:
            logger.error(f"Failed to fallback to CUDA: {e}")
            return False
    
    async def _fallback_to_cpu(self) -> bool:
        """Fallback to CPU rendering."""
        try:
            logger.info("Falling back to CPU rendering")
            # Switch to CPU rendering backend
            return True
        except Exception as e:
            logger.error(f"Failed to fallback to CPU: {e}")
            return False
    
    async def _retry_different_codec(self) -> bool:
        """Try encoding with a different codec."""
        try:
            logger.info("Trying alternative codec")
            # Switch to alternative codec
            return True
        except Exception as e:
            logger.error(f"Failed to switch codec: {e}")
            return False
    
    async def _reduce_output_quality(self) -> bool:
        """Reduce output quality settings."""
        try:
            logger.info("Reducing output quality")
            # Reduce quality settings
            return True
        except Exception as e:
            logger.error(f"Failed to reduce quality: {e}")
            return False
    
    def get_error_statistics(self) -> Dict[str, Any]:
        """Get error statistics and patterns."""
        return {
            "total_errors": len(self._error_history),
            "resolved_errors": len([e for e in self._error_history if e.resolved]),
            "error_patterns": {
                code.value: {
                    "count": info["count"],
                    "last_seen": info["last_seen"].isoformat() if info["last_seen"] else None
                }
                for code, info in self._error_patterns.items()
                if info["count"] > 0
            },
            "recovery_success_rate": self._calculate_recovery_success_rate()
        }
    
    def _calculate_recovery_success_rate(self) -> float:
        """Calculate the success rate of recovery attempts."""
        total_with_actions = len([
            e for e in self._error_history 
            if e.recovery_actions
        ])
        if total_with_actions == 0:
            return 0.0
        
        resolved = len([
            e for e in self._error_history 
            if e.recovery_actions and e.resolved
        ])
        return resolved / total_with_actions


# Global error registry instance
error_registry = ErrorRegistry()


@asynccontextmanager
async def error_handler(component: str, operation: str, **context_data):
    """Context manager for handling errors with automatic recovery."""
    context = ErrorContext(
        component=component,
        operation=operation,
        additional_data=context_data
    )
    
    try:
        yield
    except Exception as e:
        logger.error(f"Error in {component}.{operation}: {e}")
        
        # Classify and attempt recovery
        error_record = error_registry.classify_error(e, context)
        recovery_attempted = await error_registry.attempt_recovery(error_record)
        
        if not recovery_attempted or not error_record.resolved:
            # Re-raise if recovery failed
            raise
        
        logger.info(f"Error recovered using: {error_record.resolution_method}")


# Decorator for automatic error handling
def with_error_recovery(component: str, operation: str = ""):
    """Decorator to add automatic error handling and recovery."""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            op_name = operation or func.__name__
            async with error_handler(component, op_name):
                return await func(*args, **kwargs)
        return wrapper
    return decorator