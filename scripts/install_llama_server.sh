#!/bin/bash

# LLama.cpp Installation Script with CUDA Support
# Installs llama.cpp with OpenAI-compatible server

set -e

echo "🦙 Installing llama.cpp with CUDA support"
echo "=========================================="

# Configuration
INSTALL_DIR="$HOME/.local/llama.cpp"
BUILD_TYPE="Release"
ENABLE_CUDA=true
ENABLE_OPENBLAS=true

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Create installation directory
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

echo "📦 Cloning llama.cpp repository..."
if [ ! -d "llama.cpp" ]; then
    git clone https://github.com/ggerganov/llama.cpp.git
else
    cd llama.cpp
    git pull
    cd ..
fi

cd llama.cpp

echo "🔧 Configuring build..."

# Detect CUDA
CMAKE_ARGS="-DCMAKE_BUILD_TYPE=$BUILD_TYPE"

if [ "$ENABLE_CUDA" = true ] && command -v nvcc &> /dev/null; then
    echo -e "✅ CUDA detected, enabling GPU acceleration"
    CMAKE_ARGS="$CMAKE_ARGS -DLLAMA_CUDA=ON"
else
    echo -e "⚠️  ${YELLOW}CUDA not found, building CPU-only version${NC}"
fi

if [ "$ENABLE_OPENBLAS" = true ] && pkg-config --exists openblas; then
    echo -e "✅ OpenBLAS detected, enabling BLAS acceleration"
    CMAKE_ARGS="$CMAKE_ARGS -DLLAMA_BLAS=ON -DLLAMA_BLAS_VENDOR=OpenBLAS"
fi

# Build
echo "🔨 Building llama.cpp..."
cmake -B build $CMAKE_ARGS
cmake --build build --config $BUILD_TYPE --parallel $(nproc)

# Install binaries
echo "📦 Installing binaries..."
mkdir -p "$HOME/.local/bin"

# Copy main binaries
cp build/bin/llama-cli "$HOME/.local/bin/" 2>/dev/null || cp build/llama-cli "$HOME/.local/bin/"
cp build/bin/llama-server "$HOME/.local/bin/" 2>/dev/null || cp build/llama-server "$HOME/.local/bin/"

# Make sure they're executable
chmod +x "$HOME/.local/bin/llama-cli"
chmod +x "$HOME/.local/bin/llama-server"

# Add to PATH if not already there
if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
    echo "" >> "$HOME/.bashrc"
    echo "# Added by Physics Foundry llama.cpp installer" >> "$HOME/.bashrc"
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
    echo -e "✅ Added $HOME/.local/bin to PATH in .bashrc"
fi

# Test installation
echo "🧪 Testing installation..."
if command -v llama-server &> /dev/null; then
    echo -e "✅ ${GREEN}llama-server installed successfully${NC}"
    llama-server --version
else
    echo -e "❌ ${RED}Installation failed - llama-server not found${NC}"
    exit 1
fi

# Install Python server (alternative)
echo ""
echo "🐍 Installing Python llama-cpp-python server..."
if command -v pip3 &> /dev/null; then
    # Install with CUDA support if available
    if [ "$ENABLE_CUDA" = true ] && command -v nvcc &> /dev/null; then
        CMAKE_ARGS="-DLLAMA_CUDA=on" pip3 install llama-cpp-python[server] --force-reinstall --no-cache-dir
    else
        pip3 install llama-cpp-python[server]
    fi
    echo -e "✅ ${GREEN}llama-cpp-python server installed${NC}"
else
    echo -e "⚠️  ${YELLOW}pip3 not found, skipping Python server${NC}"
fi

# Create model directory
MODELS_DIR="$HOME/.local/models"
mkdir -p "$MODELS_DIR"

echo ""
echo "📁 Created models directory: $MODELS_DIR"
echo ""
echo "🎯 Next steps:"
echo "=============="
echo "1. Download GGUF models to: $MODELS_DIR"
echo "   Example: wget -O $MODELS_DIR/gpt-neox-20b.q4_k_m.gguf \\"
echo "            https://huggingface.co/TheBloke/gpt-neox-20B-GGUF/resolve/main/gpt-neox-20b.Q4_K_M.gguf"
echo ""
echo "2. Start the server:"
echo "   llama-server --model $MODELS_DIR/gpt-neox-20b.q4_k_m.gguf \\"
echo "                --host 127.0.0.1 --port 8080 --n-gpu-layers 28"
echo ""
echo "3. Alternative Python server:"
echo "   python3 -m llama_cpp.server \\"
echo "           --model $MODELS_DIR/gpt-neox-20b.q4_k_m.gguf \\"
echo "           --host 127.0.0.1 --port 8080 --n_gpu_layers 28"
echo ""
echo -e "${GREEN}🎉 Installation complete! Restart your shell to use llama-server${NC}"