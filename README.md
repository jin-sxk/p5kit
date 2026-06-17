# p5kit

[简体中文](README.zh-CN.md)

p5kit is an independent open-source toolkit for turning p5.js sketches into mobile apps.

It is built for creative coding: keep writing sketches with p5.js, then package the same work for iOS and Android without rewriting the sketch in Swift, Kotlin, or a native UI framework.

## Quickstart

Create a sketch project:

```sh
npm create p5kit@latest my-sketch
cd my-sketch
npm install
npm run dev
```

Edit `src/main.js` and keep the browser preview open while you work.

```js
function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(20);
  circle(mouseX, mouseY, 80);
}
```

## Mobile Workflow

The long-term p5kit workflow is:

```sh
npm create p5kit@latest my-sketch
cd my-sketch

p5kit run ios
p5kit run android

p5kit build ios
p5kit build android
```

The current preview already exposes that CLI shape, but native project generation and simulator/device launching are still in progress. In generated projects today, use:

```sh
npm run dev            # start the Vite dev server
npm run build          # build the web bundle
npm run build:ios      # prepare .p5kit/ios/Web
npm run build:android  # prepare .p5kit/android/Web
```

The native bundle directories contain the web assets that the iOS `WKWebView` shell and future Android `WebView` shell consume.

## How It Works

```text
p5.js sketch
  -> Vite web bundle
  -> p5kit native bundle
  -> iOS WKWebView / Android WebView
  -> JavaScript-to-native bridge
  -> mobile capabilities
```

p5.js still renders through the browser canvas runtime. p5kit focuses on the mobile app work around that sketch: project scaffolding, bundling, native shells, bridge APIs, resource paths, canvas sizing, touch behavior, safe areas, permissions, audio, and mobile-friendly defaults.

## Current Status

p5kit is an early preview.

Today it can:

- scaffold a minimal p5.js project with `npm create p5kit`
- run a local Vite dev server through `p5kit dev`
- build a production web bundle through `p5kit build web`
- prepare iOS and Android web asset directories
- provide a Swift Package with the current iOS `WKWebView` shell component
- expose a small JavaScript bridge foundation

It does not yet:

- generate a complete Xcode project
- generate a complete Android project
- launch iOS or Android simulators/devices from `p5kit run`
- handle signing, store metadata, or store-ready release builds
- replace general-purpose tools like Capacitor or Cordova

## What's Inside

- `create-p5kit`: the scaffolder used by `npm create p5kit`
- `@p5kit/cli`: the package that provides the `p5kit` command
- `@p5kit/core`: browser runtime helpers, lifecycle conventions, and platform detection
- `@p5kit/bridge`: the shared JavaScript-to-native bridge protocol
- `@p5kit/templates`: starter projects and examples
- `@p5kit/ios`: the current Swift Package for the iOS `WKWebView` shell

## Why p5kit

Capacitor and Cordova already package web apps for mobile. p5kit is narrower: it is for p5.js sketches and creative coding workflows.

The goal is not just to put a web page in a WebView. The goal is to make sketches feel natural on phones and tablets by handling the recurring details p5.js artists hit on mobile: full-screen canvas layout, touch input, safe areas, sensors, audio unlock behavior, asset packaging, bridge calls, and native build handoff.

## Development

For repository setup, smoke tests, package layout, architecture notes, and roadmap details, see [Development notes](docs/development.md).

## Relationship to p5.js

p5kit is not affiliated with the Processing Foundation or p5.js.
