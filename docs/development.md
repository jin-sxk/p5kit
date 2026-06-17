# Development Notes

This document is for contributors and maintainers. The README should stay focused on what visitors can install and use.

## Product Boundary

p5kit is a p5.js mobile workflow layer on top of Capacitor.

The project should not become:

- a replacement for Capacitor, Cordova, Expo, or a full native app framework
- a general Capacitor wrapper for arbitrary web apps
- a package that only exposes JavaScript helpers while leaving users to assemble mobile projects from scratch
- a custom native shell maintained in parallel with Capacitor unless a narrow p5.js capability proves impossible through Capacitor plugins

The project should focus on:

- generating a p5.js sketch project that already has Vite and Capacitor wired together
- keeping `p5kit run ios`, `p5kit run android`, `p5kit build ios`, and `p5kit build android` as the primary user path
- encoding p5.js mobile defaults in templates, runtime helpers, examples, and tests
- exposing creative-coding capabilities such as canvas save/share, haptics, motion, gestures, Pencil input, safe area helpers, and audio unlock through p5-friendly APIs

## Local Setup

Install workspace dependencies:

```sh
npm install
```

Run the smoke test:

```sh
npm test
```

The smoke test creates a temporary p5kit app, installs its dependencies, builds the web bundle, and verifies the generated Capacitor project surface.
When the local Android toolchain is missing, the smoke test expects `p5kit build android` to fail early with p5kit's Java / SDK diagnosis instead of leaking a Gradle sync warning.

Create a local project from the current checkout:

```sh
node packages/create-p5kit/bin/create-p5kit.js my-sketch
cd my-sketch
npm install
npm run dev
npm run build
npm run build:ios
npm run doctor:android
```

## Package Layout

- `create-p5kit`: project scaffolder used by `npm create p5kit`
- `@p5kit/cli`: CLI package that exposes the `p5kit` command and drives Vite plus Capacitor
- `@p5kit/core`: runtime helpers, lifecycle conventions, platform detection, and p5-friendly wrappers over Capacitor plugins

Starter templates live in `packages/create-p5kit/templates`. Native iOS and Android projects are generated inside user projects by Capacitor, not shipped as p5kit-owned shell packages.

## Architecture

The intended architecture is:

```text
p5.js sketch
  -> web bundle
  -> Capacitor web assets
  -> Capacitor iOS / Android platform projects
  -> Capacitor official plugins and future p5kit plugins
  -> p5kit creative-coding API
```

p5.js continues to render through the browser canvas runtime. Capacitor handles the native app container, platform project structure, asset copying, plugin bridge, app lifecycle, and the handoff to Xcode or Android Studio. p5kit handles the p5.js-specific workflow and APIs on top.

Ownership should stay clear:

| Layer | Owner |
| --- | --- |
| Native app container | Capacitor |
| iOS and Android platform project structure | Capacitor |
| Platform sync and official plugins | Capacitor |
| Web build | Vite |
| Sketch scaffolding | p5kit |
| p5 mobile defaults | p5kit |
| Creative-coding API shape | p5kit |
| Narrow native capabilities not covered by official plugins | p5kit Capacitor plugins, only after validation |

## Sketch Template Guidance

Starter sketches should teach the defaults by example. Prefer code that can survive being moved into a larger npm app.

Use these defaults unless there is a specific reason not to:

- p5 instance mode instead of global `setup()` / `draw()` functions
- ES modules and Vite imports
- full-window canvas created with `createCanvas(windowWidth, windowHeight)`
- `windowResized()` calling `resizeCanvas(windowWidth, windowHeight)`
- pointer-first input through `mousePressed()`, `mouseDragged()`, and `mouseReleased()` for p5.js 2.x compatibility
- `return false` from input handlers that should suppress browser gestures or selection
- CSS that makes `html`, `body`, and `#app` fill the viewport
- CSS that disables unwanted scrolling, overscroll, and default touch actions for sketch-first apps
- safe-area CSS variables where UI touches device edges
- optional `pixelDensity(1)` for examples where mobile frame rate matters more than high-DPI sharpness
- async asset loading patterns for p5.js 2.x when examples use images, fonts, sound, or models

Do not use the starter template to showcase every p5kit feature. It should remain a small, readable first sketch.

## Native Capabilities

p5kit should expose mobile features through a small, consistent JavaScript API:

```js
await p5kit.vibrate();
await p5kit.share({ text: "Made with p5kit" });
await p5kit.saveCanvas();

const platform = await p5kit.platform();
```

Use official Capacitor plugins first when they cover the capability well:

- vibration through `@capacitor/haptics`
- sharing through `@capacitor/share`
- saving canvas output

Add p5kit-specific Capacitor plugins only for creative-coding capabilities that official plugins do not cover well:

- Apple Pencil pressure, tilt, azimuth, and feature-detected Pencil Pro extras such as squeeze, barrel roll, hover, and haptics
- gesture streams for pinch, rotate, pan, tap, and long press
- device orientation
- motion and sensor data
- camera and media permissions
- audio unlock behavior
- fullscreen and safe-area handling

## Why Not Just Capacitor?

Capacitor and Cordova can already package web apps for mobile. p5kit should not compete with Capacitor as a general native runtime. Instead, p5kit uses Capacitor as its platform layer and focuses on p5.js and creative coding workflows.

Capacitor answers: "How do I ship a web app as a native app?"

p5kit answers: "How do I make a p5.js sketch behave well as a mobile creative app?"

The goal is not just to put a web page in a WebView. The goal is to make p5.js sketches feel natural on mobile by handling canvas sizing, touch behavior, sensor access, audio quirks, asset packaging, debugging, examples, and p5-friendly build commands while Capacitor owns the native platform machinery.

## Roadmap

### Phase 0: Capacitor Baseline

Goal: prove the package shape and command path.

Code deliverables:

- create a minimal p5.js + Vite starter template
- generate Capacitor configuration in starter projects
- include Capacitor iOS and Android dependencies in generated projects
- implement `p5kit build ios` and `p5kit build android` as build + ensure platform + sync commands
- implement `p5kit run ios` and `p5kit run android` as build + sync + `cap run` handoffs
- implement `p5kit doctor android` and gate Android build/run commands on Java plus Android SDK availability
- keep smoke tests focused on generated project shape, dependencies, web build output, and Capacitor handoff points

Validation:

- `npm create p5kit` creates a project without manual native setup
- `npm run build`, `npm run build:ios`, and `npm run build:android` are understandable and repeatable
- generated platform projects remain standard Capacitor projects
- missing Android Java / SDK setup fails before Capacitor Gradle sync output

### Phase 1: p5 Mobile Template Defaults

Goal: make the starter sketch teach mobile p5 best practices through code, not prose alone.

Code deliverables:

- use p5 instance mode in the starter
- keep the sketch full-screen by default
- add resize handling with `windowResized()` and `resizeCanvas()`
- use pointer-first input handlers for p5.js 2.x compatibility
- suppress browser gestures when the sketch owns the screen
- add mobile CSS for viewport sizing, touch behavior, overscroll behavior, and safe-area-aware layout
- document when `pixelDensity(1)` is useful for mobile performance
- add one small async asset-loading example once the template has an asset story

Validation:

- the starter looks like a mobile sketch, not a generic web page
- a beginner can edit `src/main.js` without learning Capacitor first
- the defaults are small enough that the template remains approachable

### Phase 2: Thin Core API Over Official Capacitor Plugins

Goal: provide p5-friendly APIs without writing custom native plugins too early.

Code deliverables:

- `p5kit.platform()` with web and Capacitor-aware behavior
- `p5kit.vibrate()` backed by Capacitor Haptics where available
- `p5kit.share()` backed by Capacitor Share where available
- `p5kit.saveCanvas()` with a reliable web fallback before native file APIs
- graceful browser fallbacks for development and web publishing

Validation:

- the same sketch runs in the browser and inside Capacitor
- examples avoid exposing Capacitor plugin ceremony unless the user needs to drop down
- failures are feature-detectable and easy to handle inside a sketch

### Phase 3: First p5kit-Specific Capacitor Plugin

Goal: add native code only where p5.js creative-coding needs are not well covered by official plugins.

Candidate plugin areas:

- motion and orientation event streams
- gesture event streams for pinch, rotate, pan, tap, double tap, and long press
- Apple Pencil pressure, tilt, azimuth, hover, squeeze, barrel roll, and haptics
- `p5kit.capabilities()` for feature detection

Validation:

- pick one plugin area first
- ship a runnable example before expanding the API surface
- prove the native plugin makes a sketch meaningfully simpler than direct Capacitor usage

### Phase 4: Examples as Product Validation

Goal: use examples to test whether p5.js users actually want the project.

Required examples:

- `touch-haptics`: full-screen touch sketch with haptic feedback
- `motion-paint`: motion or orientation drives a visual system
- `save-share-poster`: canvas output can be saved and shared

Later examples:

- `pencil-pressure`
- `audio-unlock`
- `camera-texture`
- `safe-area-controls`

Each example should answer: what is easier here because p5kit exists?

### Decision Gate

Do not expand p5kit into a general Capacitor wrapper. Continue broadening the API only if examples receive real feedback from p5.js users, educators, or creative coders.

Strong signals:

- users run the examples and ask for adjacent p5-specific mobile capabilities
- educators want a repeatable mobile sketch workflow for classes or workshops
- creative coders share sketches that use save/share, motion, touch, audio, or Pencil input

Weak signals:

- requests for generic app features that Capacitor already handles
- interest only in a JavaScript helper without mobile build workflow
- features that make sense for arbitrary web apps but not specifically for p5.js sketches
