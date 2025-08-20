#!/bin/bash
# Alternative development commands for environments without 'just'

set -e

function help() {
    echo "Physics Foundry Development Scripts"
    echo ""
    echo "Usage: ./dev-scripts.sh [command]"
    echo ""
    echo "Commands:"
    echo "  setup       - Install all dependencies"
    echo "  dev-all     - Start all development servers"
    echo "  dev-gui     - Start GUI development server"
    echo "  dev-api     - Start orchestrator API server"
    echo "  build       - Build all applications"
    echo "  build-gui   - Build GUI application"
    echo "  build-api   - Build orchestrator application"
    echo "  test        - Run all tests"
    echo "  lint        - Run linters"
    echo "  format      - Format code"
    echo "  clean       - Clean build artifacts"
    echo "  check       - Run system checks"
    echo ""
}

function setup() {
    echo "📦 Setting up Physics Foundry development environment..."
    
    # Check node version
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js not found. Please install Node.js 18+ first."
        exit 1
    fi
    
    # Check python version
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python 3 not found. Please install Python 3.11+ first."
        exit 1
    fi
    
    # Install root dependencies
    echo "📦 Installing root dependencies..."
    npm install
    
    # Install GUI dependencies
    echo "📦 Installing GUI dependencies..."
    cd apps/gui && npm install && cd ../..
    
    # Install orchestrator dependencies
    echo "📦 Installing orchestrator dependencies..."
    cd apps/orchestrator
    if command -v poetry &> /dev/null; then
        poetry install --no-root
    else
        echo "⚠️  Poetry not found. Installing via pip..."
        pip3 install -e .
    fi
    cd ../..
    
    echo "✅ Setup complete!"
}

function dev-gui() {
    echo "🚀 Starting GUI development server..."
    cd apps/gui && npm run dev
}

function dev-api() {
    echo "🚀 Starting orchestrator API server..."
    cd apps/orchestrator
    export PATH="$HOME/.local/bin:$PATH"
    if command -v poetry &> /dev/null; then
        poetry run uvicorn orchestrator.main:app --reload --host 0.0.0.0 --port 8000
    else
        python3 -m uvicorn orchestrator.main:app --reload --host 0.0.0.0 --port 8000
    fi
}

function dev-all() {
    echo "🚀 Starting all development servers..."
    trap 'kill $(jobs -p)' EXIT
    
    dev-api &
    sleep 3
    dev-gui &
    
    wait
}

function build() {
    echo "🏗️ Building all applications..."
    build-gui
    build-api
}

function build-gui() {
    echo "🏗️ Building GUI application..."
    cd apps/gui && npm run build
}

function build-api() {
    echo "🏗️ Building orchestrator application..."
    cd apps/orchestrator
    if command -v poetry &> /dev/null; then
        poetry build
    else
        python3 -m build
    fi
}

function run-tests() {
    echo "🧪 Running all tests..."
    
    # GUI tests
    echo "🧪 Running GUI tests..."
    cd apps/gui && npm test && cd ../..
    
    # Orchestrator tests  
    echo "🧪 Running orchestrator tests..."
    cd apps/orchestrator
    if command -v poetry &> /dev/null; then
        poetry run pytest tests/
    else
        python3 -m pytest tests/
    fi
    cd ../..
}

function run-lint() {
    echo "🔍 Running linters..."
    
    # GUI lint
    cd apps/gui && npm run lint && cd ../..
    
    # Orchestrator lint
    cd apps/orchestrator
    if command -v poetry &> /dev/null; then
        poetry run ruff check . && poetry run mypy .
    else
        python3 -m ruff check . && python3 -m mypy .
    fi
    cd ../..
}

function run-format() {
    echo "🎨 Formatting code..."
    
    # GUI format
    cd apps/gui && npm run format && cd ../..
    
    # Orchestrator format
    cd apps/orchestrator
    if command -v poetry &> /dev/null; then
        poetry run black . && poetry run ruff --fix .
    else
        python3 -m black . && python3 -m ruff --fix .
    fi
    cd ../..
}

function clean() {
    echo "🧹 Cleaning build artifacts..."
    rm -rf apps/gui/dist/
    rm -rf apps/gui/node_modules/.vite/
    cd apps/orchestrator && find . -name "*.pyc" -delete && find . -name "__pycache__" -delete
}

function check() {
    echo "🔍 Running system checks..."
    
    # Check Node.js
    echo "Node.js: $(node --version)"
    
    # Check Python
    echo "Python: $(python3 --version)"
    
    # Check GPU
    if command -v nvidia-smi &> /dev/null; then
        echo "GPU: $(nvidia-smi --query-gpu=name --format=csv,noheader,nounits | head -1)"
    else
        echo "GPU: Not available"
    fi
    
    # Check dependencies
    echo "Checking critical dependencies..."
    cd apps/orchestrator
    if command -v poetry &> /dev/null; then
        poetry run python -c "import fastapi, numpy, cv2; print('✅ Python dependencies OK')"
    else
        python3 -c "import fastapi, numpy, cv2; print('✅ Python dependencies OK')" 2>/dev/null || echo "❌ Some Python dependencies missing"
    fi
    cd ../..
}

# Main command dispatcher
case "${1:-help}" in
    setup) setup ;;
    dev-all) dev-all ;;
    dev-gui) dev-gui ;;  
    dev-api) dev-api ;;
    build) build ;;
    build-gui) build-gui ;;
    build-api) build-api ;;
    test) run-tests ;;
    lint) run-lint ;;
    format) run-format ;;
    clean) clean ;;
    check) check ;;
    help|*) help ;;
esac