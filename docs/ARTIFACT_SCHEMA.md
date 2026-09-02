# Reference artifact manifest

A verified run should emit a small manifest recording:

```json
{
  "prompt_path": "...",
  "config_path": "...",
  "plan_path": "...",
  "source_path": "...",
  "renderer": "manim",
  "command": ["..."],
  "exit_code": 0,
  "render_path": "...",
  "render_sha256": "...",
  "quality_results": {"...": "measured values"},
  "fixture": false
}
```

The manifest should be produced by the real path rather than manually written after the fact. Fixture-mode manifests must set `fixture: true`.
