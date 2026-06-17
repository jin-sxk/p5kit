# p5kit

[English](README.md)

p5kit 用适合 p5.js 的默认处理，把 sketch 变成基于 Capacitor 的移动端 app。

它不是新的 WebView runtime，也不是 Capacitor 替代品。p5kit 是一层面向创意编程的工作流：继续用 p5.js 写 sketch，然后通过 npm 命令把同一套作品经由 Capacitor 构建、同步并运行到 iOS 或 Android。

## 快速开始

创建一个 sketch 项目：

```sh
npm create p5kit@latest my-sketch
cd my-sketch
npm install
npm run dev
```

打开浏览器预览，然后编辑 `src/main.js`。起步项目使用 p5 instance mode，让 sketch 更适合放在 Vite、npm 和 Capacitor app 里。

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

这个例子会把 p5kit 关心的移动端默认处理直接写进代码：instance mode、全窗口 canvas、resize 处理、通过 `mousePressed()` 走 pointer-first 输入、用 `return false` 阻止浏览器默认手势，以及在高 DPI 手机上可选用 `pixelDensity(1)` 降低渲染压力。

## 移动端工作流

p5kit 的目标工作流是：

```sh
npm create p5kit@latest my-sketch
cd my-sketch

p5kit doctor android

p5kit run ios
p5kit run android

p5kit build ios
p5kit build android
```

生成的项目也提供 npm scripts：

```sh
npm run dev            # 启动 Vite dev server
npm run build          # 构建 web bundle
npm run build:ios      # 构建 dist，必要时创建 ios/，然后 cap sync ios
npm run build:android  # 构建 dist，必要时创建 android/，然后 cap sync android
npm run run:ios        # 构建、同步，然后 cap run ios
npm run run:android    # 构建、同步，然后 cap run android
npm run doctor:android # 检查 Java 和 Android SDK 设置
```

生成的 `ios/` 和 `android/` 目录是标准 Capacitor 平台工程。需要原生工具链、签名、设备日志或商店发布设置时，可以用 Xcode 或 Android Studio 打开它们。

Android 命令现在会在进入 Capacitor 的 Android 流程前检查 Java runtime 和 Android SDK。如果本机环境还没准备好，`p5kit build android`、`p5kit run android` 和 `p5kit doctor android` 会先给出 p5kit 自己的诊断，而不是继续冒出 Gradle sync warning。

## p5kit 在 Capacitor 之上提供什么

| 层级 | 负责方 |
| --- | --- |
| 原生 app 容器 | Capacitor |
| iOS 和 Android 平台工程 | Capacitor |
| 插件桥接和平台同步 | Capacitor |
| Web bundle | Vite |
| p5.js sketch 模板 | p5kit |
| 适合 p5 的 CLI 命令 | p5kit |
| 移动端创意编程默认处理 | p5kit |
| canvas 保存/分享、haptics、motion、gesture、Pencil 和能力检测 API | p5kit 基于 Capacitor 插件提供 |

## 它如何工作

```text
p5.js sketch
  -> Vite web bundle
  -> Capacitor web assets
  -> Capacitor iOS / Android projects
  -> Capacitor plugins
  -> p5kit creative-coding API
```

p5.js 仍然通过浏览器 canvas runtime 渲染。Capacitor 负责原生 app 容器、平台工程、同步流程、生命周期和插件桥接。p5kit 关注的是 sketch 周围的 p5.js 专属工作：项目脚手架、适合 p5 的命令、资源路径、canvas 尺寸、touch、安全区域、权限、音频解锁、保存/分享 canvas 输出，以及适合移动端的创意编程默认处理。

## 当前状态

p5kit 目前是早期预览版。

现在它可以：

- 通过 `npm create p5kit` 创建最小 p5.js 项目
- 在生成项目里包含 Capacitor 配置和 iOS/Android 依赖
- 通过 `p5kit dev` 启动本地 Vite dev server
- 通过 `p5kit build web` 构建生产用 web bundle
- 通过 `p5kit build ios` 和 `p5kit build android` 创建并同步 Capacitor iOS / Android 平台工程
- 通过 `p5kit run ios` 和 `p5kit run android` 把模拟器/真机启动交给 `cap run`
- 通过 `p5kit doctor android` 诊断 Android Java / SDK 缺失
- 在 `@p5kit/core` 中用小型 API 包装 Capacitor Haptics 和 Share

它还不能：

- 提供 Pencil、gesture、motion、camera、microphone 或 file/media 工作流的 p5kit 专用原生插件
- 隐藏所有 Xcode、Android Studio、SDK、签名或模拟器要求
- 处理签名、商店元数据或面向商店发布的 release build
- 证明 p5.js 用户真的需要一个比少量移动端示例更大的平台
- 替代 Capacitor 或 Cordova

## 既然有 Capacitor，为什么还需要 p5kit

Capacitor 回答的是：“怎样把一个 web app 发布成 native app？”

p5kit 回答的是：“怎样让一个 p5.js sketch 在移动端像一个自然的创意 app 一样工作？”

这个更窄的问题会改变默认值。p5kit 应该让全屏 canvas 布局、pointer/touch 行为、安全区域、传感器权限、音频解锁、资源路径、保存和分享 canvas 输出，以及创作输入 API 对 p5.js 用户来说自然可用，而不是要求他们先成为移动平台工程师。

## 包含什么

- `create-p5kit`：`npm create p5kit` 使用的脚手架
- `@p5kit/cli`：提供 `p5kit` 命令，并驱动 Vite 与 Capacitor
- `@p5kit/core`：runtime helper、生命周期约定、平台检测，以及面向 p5 的 Capacitor 插件封装

起步模板由脚手架持有。原生平台工程由 Capacitor 在用户的 sketch 项目里生成。

## 开发

仓库设置、smoke test、包结构、架构说明、实现指导和路线图见 [开发说明](docs/development.md)。

## 和 p5.js 的关系

p5kit 与 Processing Foundation 或 p5.js 没有关联。
