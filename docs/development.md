# Development Notes

This document is for contributors and maintainers. The README should stay focused on what visitors can install and use.

## Local Setup

Install workspace dependencies:

```sh
npm install
```

Run the smoke test:

```sh
npm test
```

The smoke test creates a temporary p5kit app, installs its dependencies, builds the web bundle, and prepares the iOS web bundle.

Create a local project from the current checkout:

```sh
node packages/create-p5kit/bin/create-p5kit.js my-sketch
cd my-sketch
npm install
npm run dev
npm run build
npm run build:ios
```

## Package Layout

- `create-p5kit`: project scaffolder used by `npm create p5kit`
- `@p5kit/cli`: CLI package that exposes the `p5kit` command
- `@p5kit/core`: runtime helpers, lifecycle conventions, and platform detection
- `@p5kit/bridge`: shared JavaScript-to-native bridge protocol
- `@p5kit/templates`: starter projects and examples
- `@p5kit/ios`: Swift/SwiftUI app shell using `WKWebView`
- Android shell: planned Kotlin app shell using Android `WebView`

Do not publish an Android package until the Android shell exists.

## Architecture

The intended architecture is:

```text
p5.js sketch
  -> web bundle
  -> iOS WKWebView / Android WebView
  -> shared JavaScript bridge
  -> native platform capabilities
```

p5.js continues to render through the browser canvas runtime. The native shell handles packaging, permissions, device APIs, app lifecycle, and eventually store-ready builds.

## Native Capabilities

p5kit should expose mobile features through a small, consistent JavaScript API:

```js
await p5kit.vibrate();
await p5kit.share({ text: "Made with p5kit" });
await p5kit.saveCanvas();

const platform = await p5kit.platform();
```

Initial native bridge targets include:

- vibration
- sharing
- saving canvas output
- device orientation
- motion and sensor data
- camera and media permissions
- audio unlock behavior
- fullscreen and safe-area handling

## Why Not Just Capacitor?

Capacitor and Cordova can already package web apps for mobile. p5kit is different because it is designed specifically for p5.js and creative coding workflows.

The goal is not just to put a web page in a WebView. The goal is to make p5.js sketches feel natural on mobile by handling canvas sizing, touch behavior, sensor access, audio quirks, asset packaging, debugging, examples, and platform-specific build details.

## Roadmap

1. Create a minimal p5.js project template. Done for the basic web template.
2. Build an iOS shell with SwiftUI and `WKWebView`. In progress as a Swift Package component.
3. Build an Android shell with Kotlin and `WebView`.
4. Add `p5kit run ios` and `p5kit run android`. Partially stubbed through native bundle preparation.
5. Add production builds for both platforms.
6. Define the first version of the native bridge API. Started with platform and vibration support.
7. Publish example sketches that use touch, sensors, audio, and sharing.
