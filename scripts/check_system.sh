#!/bin/bash

# System Requirements Check Script
# Verifies all dependencies for Physics Foundry pipeline

set -e

echo "🔍 Physics Foundry System Check"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

check_command() {
    if command -v "$1" &> /dev/null; then
        echo -e "✅ $1: ${GREEN}Found${NC}"
        return 0
    else
        echo -e "❌ $1: ${RED}Not found${NC}"
        ((ERRORS++))
        return 1
    fi
}

check_version() {
    local cmd=$1
    local version_cmd=$2
    local min_version=$3
    
    if command -v "$cmd" &> /dev/null; then
        local current_version=$($version_cmd 2>&1 | grep -oP '\d+\.\d+\.\d+' | head -1)
        echo -e "✅ $cmd: ${GREEN}$current_version${NC}"
        # Note: Version comparison would need more sophisticated logic
        return 0
    else
        echo -e "❌ $cmd: ${RED}Not found${NC}"
        ((ERRORS++))
        return 1
    fi
}

check_gpu() {
    echo ""
    echo "🎮 GPU Check"
    echo "-------------"
    
    if command -v nvidia-smi &> /dev/null; then
        nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv,noheader,nounits | while read line; do
            echo -e "✅ GPU: ${GREEN}$line${NC}"
        done
        
        # Check for CUDA
        if command -v nvcc &> /dev/null; then
            local cuda_version=$(nvcc --version | grep -oP 'V\d+\.\d+' | head -1)
            echo -e "✅ CUDA: ${GREEN}$cuda_version${NC}"
        else
            echo -e "⚠️  CUDA: ${YELLOW}Not found (CPU fallback available)${NC}"
            ((WARNINGS++))
        fi
        
        # Check for OptiX
        if [ -d "/usr/local/cuda/include/optix.h" ] || [ -d "/opt/optix" ]; then
            echo -e "✅ OptiX: ${GREEN}Found${NC}"
        else
            echo -e "⚠️  OptiX: ${YELLOW}Not found (CUDA fallback available)${NC}"
            ((WARNINGS++))
        fi
    else
        echo -e "⚠️  NVIDIA GPU: ${YELLOW}Not found (CPU rendering only)${NC}"
        ((WARNINGS++))
    fi
}

check_python() {
    echo ""
    echo "🐍 Python Environment"
    echo "--------------------"
    
    if command -v python3 &> /dev/null; then
        local python_version=$(python3 --version | grep -oP '\d+\.\d+\.\d+')
        echo -e "✅ Python: ${GREEN}$python_version${NC}"
        
        # Check virtual environment
        if [[ "$VIRTUAL_ENV" != "" ]]; then
            echo -e "✅ Virtual Env: ${GREEN}$VIRTUAL_ENV${NC}"
        else
            echo -e "⚠️  Virtual Env: ${YELLOW}Not activated${NC}"
            ((WARNINGS++))
        fi
    else
        echo -e "❌ Python3: ${RED}Not found${NC}"
        ((ERRORS++))
    fi
}

# Core system tools
echo "🛠️ Core Tools"
echo "-------------"
check_command "git"
check_command "curl" 
check_command "wget"
check_command "unzip"

# Build tools
echo ""
echo "🔨 Build Tools" 
echo "-------------"
check_command "cmake"
check_command "make"
check_command "gcc"

# Media processing
echo ""
echo "🎬 Media Tools"
echo "-------------" 
check_version "ffmpeg" "ffmpeg -version" "4.0.0"
check_command "blender"

# Python environment
check_python

# GPU acceleration
check_gpu

# Node.js for GUI
echo ""
echo "📱 Frontend Tools"
echo "----------------"
check_version "node" "node --version" "18.0.0"
check_command "npm"

# Audio processing
echo ""
echo "🎵 Audio Tools" 
echo "-------------"
if [ -f "./whisper.cpp/whisper" ]; then
    echo -e "✅ Whisper.cpp: ${GREEN}Found${NC}"
else
    echo -e "⚠️  Whisper.cpp: ${YELLOW}Not found (run install script)${NC}"
    ((WARNINGS++))
fi

# Language models
echo ""
echo "🤖 LLM Server"
echo "-------------"
if command -v llama-server &> /dev/null || command -v llama.cpp &> /dev/null; then
    echo -e "✅ llama.cpp: ${GREEN}Found${NC}"
else
    echo -e "⚠️  llama.cpp: ${YELLOW}Not found (run install script)${NC}"
    ((WARNINGS++))
fi

# Summary
echo ""
echo "📊 Summary"
echo "==========="
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 All systems ready!${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warnings - system usable with limitations${NC}"
    exit 0
else
    echo -e "${RED}❌ $ERRORS errors, $WARNINGS warnings - system needs setup${NC}"
    echo ""
    echo "Run the installation scripts to resolve missing dependencies:"
    echo "  ./scripts/install_llama_server.sh"
    echo "  sudo apt update && sudo apt install <missing-packages>"
    exit 1
fi