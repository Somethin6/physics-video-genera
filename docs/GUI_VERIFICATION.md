# GUI verification boundary

The canonical GUI package is `apps/gui`. Its current value is interface architecture, not proof that every displayed subsystem is connected to a live backend.

Before a GUI panel is described as live, verify that:

1. its value source is an actual API/WebSocket/worker measurement;
2. failures propagate visibly instead of falling back to random or canned data;
3. the UI labels provenance (`demo`, `fixture`, or `live`);
4. tests exercise the provenance transition;
5. screenshots used in the portfolio do not present demo values as measured performance.

Prototype panels that still use random, delayed, or canned data should be treated as demo UI until those conditions are met.
