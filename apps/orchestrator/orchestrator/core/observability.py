"""
Advanced process management and observability for Physics Foundry
Implements timeout/heartbeat system, retry with jitter, and process tree management
"""

import asyncio
import logging
import psutil
import signal
import subprocess
import time
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional, Union, AsyncGenerator

from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential_jitter,
    retry_if_exception_type,
    before_sleep_log
)
from prometheus_client import Counter, Histogram, Gauge, start_http_server
import opentelemetry.trace as trace
from opentelemetry import trace as otel_trace
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

from .dsl_models import LogLevel, PipelineLogEntry

logger = logging.getLogger(__name__)

# Prometheus Metrics
pipeline_operations_total = Counter(
    'pipeline_operations_total', 
    'Total pipeline operations',
    ['operation', 'status']
)

operation_duration_seconds = Histogram(
    'operation_duration_seconds',
    'Time spent on operations',
    ['operation']
)

active_processes = Gauge(
    'active_processes',
    'Number of active child processes'
)

gpu_memory_usage = Gauge(
    'gpu_memory_usage_bytes',
    'GPU memory usage in bytes',
    ['device']
)

llm_tokens_per_second = Gauge(
    'llm_tokens_per_second',
    'LLM inference speed'
)

render_frames_per_second = Gauge(
    'render_frames_per_second', 
    'Rendering speed',
    ['engine']
)

retry_attempts_total = Counter(
    'retry_attempts_total',
    'Total retry attempts',
    ['operation', 'reason']
)


class ProcessManager:
    """Production-grade process management with timeouts and tree killing"""
    
    def __init__(self):
        self.active_processes: Dict[str, psutil.Process] = {}
        self.process_metadata: Dict[str, Dict[str, Any]] = {}
        
    async def run_with_timeout(
        self,
        cmd: List[str],
        timeout: float,
        heartbeat_interval: float = 10.0,
        cwd: Optional[Path] = None,
        env: Optional[Dict[str, str]] = None,
        process_id: Optional[str] = None
    ) -> subprocess.CompletedProcess:
        """
        Run command with timeout and heartbeat monitoring
        Kills entire process tree on timeout
        """
        process_id = process_id or f"proc_{int(time.time())}"
        
        with operation_duration_seconds.labels(operation=cmd[0]).time():
            try:
                # Start process
                process = await asyncio.create_subprocess_exec(
                    *cmd,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                    cwd=cwd,
                    env=env
                )
                
                # Track process
                ps_process = psutil.Process(process.pid)
                self.active_processes[process_id] = ps_process
                self.process_metadata[process_id] = {
                    'cmd': cmd,
                    'started': datetime.utcnow(),
                    'timeout': timeout,
                    'last_heartbeat': datetime.utcnow()
                }
                
                active_processes.inc()
                
                # Monitor with heartbeat
                async def heartbeat_monitor():
                    while process.returncode is None:
                        await asyncio.sleep(heartbeat_interval)
                        self.process_metadata[process_id]['last_heartbeat'] = datetime.utcnow()
                        
                        # Check if process is still alive
                        try:
                            if not ps_process.is_running():
                                logger.warning(f"Process {process_id} died unexpectedly")
                                break
                        except psutil.NoSuchProcess:
                            break
                
                # Run with timeout
                heartbeat_task = asyncio.create_task(heartbeat_monitor())
                
                try:
                    stdout, stderr = await asyncio.wait_for(
                        process.communicate(),
                        timeout=timeout
                    )
                    
                    pipeline_operations_total.labels(
                        operation=cmd[0], 
                        status='success'
                    ).inc()
                    
                    return subprocess.CompletedProcess(
                        cmd, process.returncode, stdout, stderr
                    )
                    
                except asyncio.TimeoutError:
                    # Kill process tree
                    await self._kill_process_tree(process_id)
                    pipeline_operations_total.labels(
                        operation=cmd[0], 
                        status='timeout'
                    ).inc()
                    
                    raise ProcessTimeoutError(
                        f"Process {process_id} timed out after {timeout}s"
                    )
                    
                finally:
                    heartbeat_task.cancel()
                    
            except Exception as e:
                pipeline_operations_total.labels(
                    operation=cmd[0],
                    status='error' 
                ).inc()
                raise
                
            finally:
                # Cleanup
                if process_id in self.active_processes:
                    del self.active_processes[process_id]
                    del self.process_metadata[process_id]
                    active_processes.dec()
    
    async def _kill_process_tree(self, process_id: str):
        """Kill process and all children - cross-platform"""
        try:
            ps_process = self.active_processes.get(process_id)
            if ps_process:
                children = ps_process.children(recursive=True)
                
                # Send SIGTERM to all processes
                for child in children:
                    try:
                        child.terminate()
                    except psutil.NoSuchProcess:
                        pass
                        
                try:
                    ps_process.terminate()
                except psutil.NoSuchProcess:
                    pass
                
                # Wait for graceful shutdown
                await asyncio.sleep(5)
                
                # Force kill if still running
                for child in children:
                    try:
                        if child.is_running():
                            child.kill()
                    except psutil.NoSuchProcess:
                        pass
                        
                try:
                    if ps_process.is_running():
                        ps_process.kill()
                except psutil.NoSuchProcess:
                    pass
                    
                logger.warning(f"Killed process tree for {process_id}")
                
        except Exception as e:
            logger.error(f"Failed to kill process tree {process_id}: {e}")


class ProcessTimeoutError(Exception):
    """Raised when process times out"""
    pass


class RetryableOperation:
    """Decorator for operations that need retry with jitter"""
    
    @staticmethod
    def with_backoff(
        max_attempts: int = 3,
        min_wait: float = 1.0,
        max_wait: float = 10.0,
        exceptions: tuple = (Exception,)
    ):
        def decorator(func):
            return retry(
                stop=stop_after_attempt(max_attempts),
                wait=wait_exponential_jitter(
                    initial=min_wait,
                    max=max_wait,
                    jitter=2.0
                ),
                retry=retry_if_exception_type(exceptions),
                before_sleep=before_sleep_log(logger, logging.WARNING)
            )(func)
        return decorator


class ObservabilityManager:
    """Centralized observability setup and management"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.tracer = None
        
    def setup_metrics(self, port: int = 9090):
        """Start Prometheus metrics server"""
        start_http_server(port)
        logger.info(f"Prometheus metrics server started on port {port}")
    
    def setup_tracing(self, jaeger_endpoint: str = "http://localhost:14268/api/traces"):
        """Setup OpenTelemetry tracing"""
        trace.set_tracer_provider(TracerProvider())
        
        jaeger_exporter = JaegerExporter(
            agent_host_name="localhost",
            agent_port=6831,
        )
        
        span_processor = BatchSpanProcessor(jaeger_exporter)
        trace.get_tracer_provider().add_span_processor(span_processor)
        
        self.tracer = trace.get_tracer(__name__)
        logger.info("OpenTelemetry tracing configured")
    
    def setup_error_tracking(self, dsn: Optional[str] = None):
        """Setup Sentry error tracking (self-hosted)"""
        if dsn:
            sentry_sdk.init(
                dsn=dsn,
                integrations=[FastApiIntegration()],
                traces_sample_rate=0.1,
                environment=self.config.get('environment', 'development')
            )
            logger.info("Sentry error tracking configured")
    
    @asynccontextmanager
    async def trace_operation(self, name: str, attributes: Optional[Dict] = None) -> AsyncGenerator[trace.Span, None]:
        """Context manager for tracing operations"""
        if self.tracer:
            with self.tracer.start_as_current_span(name) as span:
                if attributes:
                    for key, value in attributes.items():
                        span.set_attribute(key, value)
                yield span
        else:
            # No-op if tracing not set up
            yield None


class SystemMonitor:
    """Real-time system metrics collection"""
    
    def __init__(self):
        self.monitoring = False
    
    async def start_monitoring(self, interval: float = 2.0):
        """Start background monitoring task"""
        self.monitoring = True
        
        while self.monitoring:
            # GPU metrics (requires nvidia-ml-py)
            try:
                import pynvml
                pynvml.nvmlInit()
                
                for i in range(pynvml.nvmlDeviceGetCount()):
                    handle = pynvml.nvmlDeviceGetHandleByIndex(i)
                    meminfo = pynvml.nvmlDeviceGetMemoryInfo(handle)
                    gpu_memory_usage.labels(device=f"gpu_{i}").set(meminfo.used)
                    
            except ImportError:
                pass  # nvidia-ml-py not available
            except Exception as e:
                logger.debug(f"GPU monitoring error: {e}")
            
            await asyncio.sleep(interval)
    
    def stop_monitoring(self):
        """Stop background monitoring"""
        self.monitoring = False


# Global instances
process_manager = ProcessManager()
observability_manager = ObservabilityManager({})
system_monitor = SystemMonitor()


def setup_observability_stack(
    prometheus_port: int = 9090,
    jaeger_endpoint: str = "http://localhost:14268/api/traces",
    sentry_dsn: Optional[str] = None
):
    """Setup complete observability stack"""
    observability_manager.setup_metrics(prometheus_port)
    observability_manager.setup_tracing(jaeger_endpoint)
    observability_manager.setup_error_tracking(sentry_dsn)
    
    # Start system monitoring
    asyncio.create_task(system_monitor.start_monitoring())