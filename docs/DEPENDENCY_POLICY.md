# Optional dependency policy

External tools are capabilities, not assumptions.

For each optional tool (local LLM server, Manim, FFmpeg, Blender, Taichi, LaTeX, GPU runtime):

1. detect availability;
2. report capability status;
3. skip/disable unsupported optional paths explicitly;
4. fail explicitly if a requested job requires an unavailable dependency;
5. never substitute a simulated successful artifact in production mode.
