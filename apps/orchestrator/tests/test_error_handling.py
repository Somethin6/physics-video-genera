#!/usr/bin/env python3
"""Comprehensive unit tests for the Physics Foundry orchestrator."""

import pytest
import asyncio
from unittest.mock import Mock, AsyncMock, patch
from datetime import datetime

from orchestrator.core.error_handling import (
    ErrorCode,
    ErrorContext,
    ErrorRegistry,
    RecoveryAction,
    error_handler,
    with_error_recovery
)


class TestErrorHandling:
    """Test suite for error handling and recovery."""
    
    def test_error_code_enum(self):
        """Test that all error codes are properly defined."""
        assert ErrorCode.LLM_CONNECTION_FAILED == "LLM-CONN-001"
        assert ErrorCode.RENDER_OPTIX_OOM == "BLD-OPTIX-101"
        assert ErrorCode.MEDIA_ENCODING_FAIL == "MEDIA-ENC-402"
    
    def test_error_context_creation(self):
        """Test error context creation with defaults."""
        context = ErrorContext(component="test", operation="test_op")
        assert context.component == "test"
        assert context.operation == "test_op"
        assert isinstance(context.timestamp, datetime)
        assert context.additional_data == {}
    
    def test_recovery_action(self):
        """Test recovery action creation."""
        async def test_handler():
            return True
        
        action = RecoveryAction(
            name="test_action",
            description="Test action",
            handler=test_handler,
            automatic=True,
            cost=1
        )
        
        assert action.name == "test_action"
        assert action.automatic is True
        assert action.cost == 1


class TestErrorRegistry:
    """Test suite for ErrorRegistry."""
    
    @pytest.fixture
    def registry(self):
        """Create a fresh error registry for each test."""
        return ErrorRegistry()
    
    def test_registry_initialization(self, registry):
        """Test that registry initializes with default patterns."""
        assert len(registry._error_patterns) > 0
        assert ErrorCode.LLM_CONNECTION_FAILED in registry._error_patterns
        assert ErrorCode.RENDER_OPTIX_OOM in registry._error_patterns
    
    def test_classify_llm_error(self, registry):
        """Test classification of LLM connection errors."""
        exception = Exception("connection refused")
        context = ErrorContext(component="llm", operation="generate")
        
        error_record = registry.classify_error(exception, context)
        
        assert error_record.code == ErrorCode.LLM_CONNECTION_FAILED
        assert len(error_record.recovery_actions) > 0
        assert not error_record.resolved
    
    def test_classify_render_error(self, registry):
        """Test classification of rendering errors."""
        exception = Exception("OptiX out of memory")
        context = ErrorContext(component="renderer", operation="render")
        
        error_record = registry.classify_error(exception, context)
        
        assert error_record.code == ErrorCode.RENDER_OPTIX_OOM
        assert len(error_record.recovery_actions) > 0
    
    def test_unknown_error_classification(self, registry):
        """Test that unknown errors get default classification."""
        exception = Exception("unknown mysterious error")
        context = ErrorContext(component="unknown", operation="unknown")
        
        error_record = registry.classify_error(exception, context)
        
        assert error_record.code == ErrorCode.PIPELINE_INTERRUPTED
        assert error_record.message == "unknown mysterious error"
    
    @pytest.mark.asyncio
    async def test_successful_recovery(self, registry):
        """Test successful error recovery."""
        # Create a mock recovery action that succeeds
        async def successful_handler():
            return True
        
        action = RecoveryAction(
            name="test_recovery",
            description="Test recovery",
            handler=successful_handler,
            automatic=True,
            cost=1
        )
        
        # Create error record with recovery action
        exception = Exception("test error")
        context = ErrorContext(component="test", operation="test")
        error_record = registry.classify_error(exception, context)
        error_record.recovery_actions = [action]
        
        # Attempt recovery
        success = await registry.attempt_recovery(error_record)
        
        assert success is True
        assert error_record.resolved is True
        assert error_record.resolution_method == "test_recovery"
    
    @pytest.mark.asyncio
    async def test_failed_recovery(self, registry):
        """Test failed error recovery."""
        # Create a mock recovery action that fails
        async def failing_handler():
            raise Exception("Recovery failed")
        
        action = RecoveryAction(
            name="test_recovery",
            description="Test recovery",
            handler=failing_handler,
            automatic=True,
            cost=1
        )
        
        # Create error record with recovery action
        exception = Exception("test error")
        context = ErrorContext(component="test", operation="test")
        error_record = registry.classify_error(exception, context)
        error_record.recovery_actions = [action]
        
        # Attempt recovery
        success = await registry.attempt_recovery(error_record)
        
        assert success is False
        assert error_record.resolved is False
        assert error_record.resolution_method is None
    
    def test_error_statistics(self, registry):
        """Test error statistics generation."""
        # Generate some test errors
        for i in range(5):
            exception = Exception("connection refused")
            context = ErrorContext(component="test", operation="test")
            registry.classify_error(exception, context)
        
        stats = registry.get_error_statistics()
        
        assert stats["total_errors"] == 5
        assert "error_patterns" in stats
        assert "recovery_success_rate" in stats


class TestBasicFunctionality:
    """Basic functionality tests that don't require complex dependencies."""
    
    def test_basic_imports(self):
        """Test that basic imports work."""
        from orchestrator.core.error_handling import ErrorCode
        assert ErrorCode.LLM_CONNECTION_FAILED is not None
    
    def test_error_context_basic(self):
        """Test basic error context functionality."""
        context = ErrorContext(component="test", operation="basic_test")
        assert context.component == "test"
        assert context.operation == "basic_test"


# Simple test that doesn't require async
def test_basic_error_codes():
    """Test that error codes are properly defined."""
    assert ErrorCode.LLM_CONNECTION_FAILED == "LLM-CONN-001"
    assert ErrorCode.RENDER_OPTIX_OOM == "BLD-OPTIX-101"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])