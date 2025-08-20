# Physics Foundry Orchestrator Tests

This directory contains comprehensive tests for the Physics Foundry orchestrator backend.

## Test Structure

```
tests/
├── __init__.py
├── test_error_handling.py    # Error handling and recovery tests
├── test_pipeline.py          # Pipeline orchestration tests
├── test_media_processing.py  # Media pipeline tests
├── test_quality_analysis.py  # Quality assurance tests
├── unit/                     # Unit tests
├── integration/              # Integration tests
└── e2e/                      # End-to-end tests
```

## Running Tests

```bash
# Run all tests
pytest tests/

# Run with coverage
pytest --cov=orchestrator --cov-report=html tests/

# Run specific test file
pytest tests/test_error_handling.py -v

# Run only unit tests
pytest tests/unit/ -v

# Run with performance profiling
pytest tests/ --profile

# Run parallel tests
pytest tests/ -n auto
```

## Test Categories

### Unit Tests
- Test individual functions and classes in isolation
- Mock external dependencies
- Fast execution (< 1 second per test)

### Integration Tests  
- Test interaction between components
- Use real databases/services in test environment
- Medium execution time (< 10 seconds per test)

### End-to-End Tests
- Test complete workflows from API to output
- Use production-like environment
- Longer execution time (< 60 seconds per test)

## Test Configuration

Tests use the following configuration:

- **Test Database**: SQLite in-memory database
- **Test Storage**: Temporary filesystem
- **Mock Services**: LLM, rendering engines, external APIs
- **Fixtures**: Common test data and setup

## Coverage Goals

- **Unit Tests**: 90%+ coverage
- **Integration Tests**: 80%+ coverage  
- **Critical Paths**: 100% coverage

## Continuous Testing

Tests are automatically run on:
- Every commit (via GitHub Actions)
- Pull requests
- Scheduled daily runs
- Release builds

## Performance Testing

Performance tests validate:
- Response time < 100ms for API endpoints
- Memory usage < 500MB under normal load
- Throughput > 10 requests/second
- Error recovery time < 5 seconds