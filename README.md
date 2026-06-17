# p5kit

[简体中文](README.zh-CN.md)

p5kit turns p5.js sketches into Capacitor-backed mobile apps with p5-friendly defaults.

It is not a new WebView runtime and it is not a Capacitor replacement. p5kit is a focused workflow layer for creative coders: keep writing p5.js sketches, then use npm commands to build, sync, and run the same sketch as an iOS or Android app through Capacitor.

## Quickstart

Create a sketch project:

```sh
npm create p5kit@latest my-sketch
cd my-sketch
npm install
npm run dev
```

Edit `src/main.js` and keep the browser preview open while you work. Starter projects use p5 instance mode so the sketch behaves well in a Vite, npm, and Capacitor app.

```js
import p5 from "p5";
import { installP5KitGlobal } from "@p5kit/core";
import "./styles.css";

const p5kit = installP5KitGlobal();

new p5((sketch) => {
  sketch.setup = () => {
    sketch.pixelDensity(1);
    sketch.createCanvas(sketch.windowWidth, sketch.windowHeight);
    sketch.noStroke();
  };

  sketch.draw = () => {
    sketch.background(20);
    sketch.circle(sketch.mouseX, sketch.mouseY, 80);
  };

  sketch.mousePressed = () => {
    p5kit.vibrate(18).catch(() => {});
    return false;
  };

  sketch.windowResized = () => {
    sketch.resizeCanvas(sketch.windowWidth, sketch.windowHeight);
  };
}, document.getElementById("app"));
```

That example bakes in the mobile defaults p5kit cares about: instance mode, full-window canvas sizing, resize handling, pointer-first input through `mousePressed()`, `return false` to suppress browser gestures, and optional `pixelDensity(1)` for cheaper rendering on high-DPI phones.

## Mobile Workflow

The p5kit workflow is:

```sh
npm create p5kit@latest my-sketch
cd my-sketch

p5kit run ios
p5kit run android

p5kit build ios
p5kit build android
```

Generated projects also expose npm scripts:

```sh
npm run dev            # start the Vite dev server
npm run build          # build the web bundle
npm run build:ios      # build dist, create ios/ if needed, then cap sync ios
npm run build:android  # build dist, create android/ if needed, then cap sync android
npm run run:ios        # build, sync, then cap run ios
npm run run:android    # build, sync, then cap run android
```

The generated `ios/` and `android/` directories are normal Capacitor platform projects. Open them with Xcode or Android Studio when you need native tooling, signing, device logs, or store release settings.

## What p5kit Adds on Top of Capacitor

| Layer | Owner |
| --- | --- |
| Native app container | Capacitor |
| iOS and Android platform projects | Capacitor |
| Plugin bridge and platform sync | Capacitor |
| Web bundle | Vite |
| p5.js sketch template | p5kit |
| p5-friendly CLI commands | p5kit |
| Mobile creative-coding defaults | p5kit |
| Canvas save/share, haptics, motion, gestures, Pencil, and capability APIs | p5kit over Capacitor plugins |

## How It Works

```text
p5.js sketch
  -> Vite web bundle
  -> Capacitor web assets
  -> Capacitor iOS / Android projects
  -> Capacitor plugins
  -> p5kit creative-coding API
```

p5.js still renders through the browser canvas runtime. Capacitor provides the native app container, platform projects, sync workflow, lifecycle, and plugin bridge. p5kit focuses on the p5.js-specific work around that runtime: project scaffolding, p5-friendly commands, resource paths, canvas sizing, touch behavior, safe areas, permissions, audio unlock, saving and sharing canvas output, and mobile-friendly creative-coding defaults.

## Current Status

p5kit is an early preview.

Today it can:

- scaffold a minimal p5.js project with `npm create p5kit`
- include Capacitor configuration and iOS/Android dependencies in generated projects
- run a local Vite dev server through `p5kit dev`
- build a production web bundle through `p5kit build web`
- create and sync Capacitor iOS and Android platform projects through `p5kit build ios` and `p5kit build android`
- hand off simulator/device launching to `cap run` through `p5kit run ios` and `p5kit run android`
- wrap Capacitor Haptics and Share behind the small `@p5kit/core` API

It does not yet:

- provide custom p5kit native plugins for Pencil, gesture, motion, camera, microphone, or file/media workflows
- hide all Xcode, Android Studio, SDK, signing, or simulator requirements
- handle signing, store metadata, or store-ready release builds
- prove that p5.js users need a larger platform beyond a few focused mobile examples
- replace Capacitor or Cordova

## Why p5kit If Capacitor Exists

Capacitor answers: "How do I ship a web app as a native app?"

p5kit answers: "How do I make a p5.js sketch behave well as a mobile creative app?"

That narrower question changes the defaults. p5kit should make full-screen canvas layout, pointer/touch behavior, safe areas, sensor permissions, audio unlock, asset paths, saving and sharing canvas output, and creative input APIs feel natural for p5.js users who do not want to become mobile platform engineers first.

## What's Inside

- `create-p5kit`: the scaffolder used by `npm create p5kit`
- `@p5kit/cli`: the package that provides the `p5kit` command and drives Vite plus Capacitor
- `@p5kit/core`: runtime helpers, lifecycle conventions, platform detection, and p5-friendly wrappers over Capacitor plugins

Starter templates are owned by the scaffolder. Native platform projects are generated by Capacitor inside the user's sketch project.

## Development

For repository setup, smoke tests, package layout, architecture notes, implementation guidance, and roadmap details, see [Development notes](docs/development.md).

## Relationship to p5.js

p5kit is not affiliated with the Processing Foundation or p5.js.
