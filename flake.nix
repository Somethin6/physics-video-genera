{
  description = "Physics Foundry - Reproducible development environment";
  
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };
  
  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in {
        devShell = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Core Development
            nodejs_20
            python311
            python311Packages.pip
            python311Packages.poetry
            just
            
            # Media Processing Stack
            ffmpeg-full
            openexr
            opencolorio
            blender
            
            # System Tools  
            nsjail
            firejail
            
            # Monitoring & Observability
            prometheus
            grafana
            
            # GPU & CUDA (when available)
            # cudatoolkit  # Uncomment on CUDA systems
            
            # Development Tools
            git
            pre-commit
            direnv
          ];
          
          shellHook = ''
            echo "🚀 Physics Foundry Development Environment"
            echo "Node.js: $(node --version)"
            echo "Python: $(python --version)"
            echo "FFmpeg: $(ffmpeg -version | head -n1)"
            echo "OpenEXR: Available"
            echo "OCIO: Available"
            echo ""
            echo "Run 'just setup' to initialize the project"
            
            # Set environment variables for reproducibility
            export OCIO="${pkgs.opencolorio}/share/OpenColorIO-Configs/aces_1.0.3/config.ocio"
            export PYTHONPATH="./apps/orchestrator:$PYTHONPATH"
            export NODE_ENV="development"
            
            # For CUDA systems, uncomment:
            # export CUDA_VISIBLE_DEVICES="0"
          '';
        };
      });
}