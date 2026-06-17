# __PROJECT_NAME__

A p5kit sketch.

```sh
npm install
npm run dev
npm run build
npm run build:ios
npm run build:android
npm run doctor:android
npm run run:ios
npm run run:android
```

Edit `src/main.js` to change the sketch.

`npm run build:ios` and `npm run build:android` build the Vite web bundle,
create the Capacitor platform project if needed, then sync web assets and
plugins into `ios/` or `android/`.

Run `npm run doctor:android` when Android commands fail. It checks the Java
runtime and Android SDK before Capacitor's Android tooling runs.
