# p5kit

[简体中文](README.zh-CN.md)

p5kit is an independent open-source toolkit for turning p5.js sketches into mobile apps.

It lets you start with familiar p5.js code, then package the same sketch workflow for mobile targets without rewriting the sketch in Swift, Kotlin, or a native UI framework.

```js
function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(20);
  circle(mouseX, mouseY, 80);
}
```

## Status

p5kit is an early preview.

Today it can:

- scaffold a minimal p5.js project
- run a local Vite dev server
- build a production web bundle
- prepare an iOS web bundle for a native shell
- expose a small JavaScript bridge for native capabilities

It does not yet generate a complete Xcode project, Android project, signing setup, or store-ready release build.

## Create a Project

```sh
npm create p5kit@latest my-sketch
cd my-sketch
npm install
npm run dev
```

Open the local URL printed by Vite and edit `src/main.js`.

## Build

Build the web bundle:

```sh
npm run build
```

Prepare an iOS bundle:

```sh
npm run build:ios
```

The iOS command writes the web assets to `.p5kit/ios/Web`. That directory is intended to be embedded by the native iOS shell.

## Packages

- `create-p5kit`: project scaffolder used by `npm create p5kit`
- `@p5kit/cli`: CLI package that exposes the `p5kit` command
- `@p5kit/core`: browser runtime helpers for p5kit sketches
- `@p5kit/bridge`: JavaScript-to-native bridge protocol
- `@p5kit/templates`: starter templates
- `@p5kit/ios`: Swift Package with the current iOS `WKWebView` shell component

## Commands

Inside a generated p5kit project:

```sh
npm run dev        # start the local dev server
npm run build      # build the web bundle
npm run build:ios  # prepare .p5kit/ios/Web
```

## Project Docs

- [Development notes](docs/development.md)
- [npm publishing SOP](docs/npm-publishing.md)

## Relationship to p5.js

p5kit is not affiliated with the Processing Foundation or p5.js.
