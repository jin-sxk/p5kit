# p5kit CLI

Command line tools for running and building Capacitor-backed p5kit projects.

```sh
p5kit dev
p5kit doctor android
p5kit build web
p5kit build ios
p5kit build android
p5kit run ios
p5kit run android
```

`p5kit build ios` and `p5kit build android` build the Vite web bundle, create the
Capacitor platform project if needed, then run `cap sync` for that platform.

`p5kit doctor android` checks for the Java runtime and Android SDK needed before
Android build/run commands enter Capacitor's Android flow.
