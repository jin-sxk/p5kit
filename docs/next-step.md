# Next Step

## Recommended Direction

Build an examples-driven validation layer before adding custom native plugins.

The current implementation can scaffold a Capacitor-backed p5.js project, build and sync iOS/Android platforms, and expose a small `@p5kit/core` API. The next gap is proving why p5kit is useful to p5.js users. That proof should come from runnable examples, not more platform abstraction.

## Scope

Create a minimal `examples/` surface with three examples:

- `examples/touch-haptics`: a full-screen touch sketch with haptic feedback.
- `examples/save-share-poster`: a sketch that creates a visual poster and uses `p5kit.saveCanvas()` / `p5kit.share()`.
- `examples/capabilities`: a small sketch that reads `p5kit.capabilities()` and adapts UI or behavior based on available features.

Keep each example small, readable, and close to the starter template style.

## Implementation Actions

1. Add an `examples/` directory.
2. Add the three example projects or example source fixtures.
3. Prefer reusing the generated starter shape: Vite, p5 instance mode, `@p5kit/core`, and the same mobile CSS defaults.
4. Update the smoke test so examples are build-verified or copied into a generated smoke app and built.
5. Assert that examples exercise the core p5kit APIs:
   - `p5kit.vibrate()`
   - `p5kit.saveCanvas()`
   - `p5kit.share()`
   - `p5kit.capabilities()`
6. Add a short `Examples` section to `README.md` and `README.zh-CN.md`.

## Non-Goals

- Do not start a custom motion, gesture, Pencil, camera, or microphone Capacitor plugin yet.
- Do not turn p5kit into a general Capacitor wrapper.
- Do not add large example apps that hide the p5.js sketch behind application structure.

## Validation

Run:

```sh
npm test
git diff --check
```

The examples should answer one product question clearly:

> What is easier here because p5kit exists?
