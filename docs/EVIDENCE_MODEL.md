# Evidence model

Portfolio claims should be traceable through the following chain:

```text
claim
  -> code path
  -> test or reproducible command
  -> retained output / measured result
  -> documented limitation
```

A claim is weak when one or more links are missing. A polished README is not a substitute for the chain.

For external tools (LLMs, renderers, FFmpeg, GPU libraries), the evidence should also record version/configuration assumptions so a reviewer can distinguish repository behavior from environment-specific behavior.
