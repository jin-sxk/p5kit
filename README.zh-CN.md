# p5kit

[English](README.md)

p5kit 是一个独立的开源工具包，用来把 p5.js sketch 封装成移动端 app。

它服务的是创意编程工作流：继续用熟悉的 p5.js 写 sketch，然后把同一套作品打包到 iOS 和 Android，而不需要把 sketch 重写成 Swift、Kotlin 或原生 UI 框架。

## 快速开始

创建一个 sketch 项目：

```sh
npm create p5kit@latest my-sketch
cd my-sketch
npm install
npm run dev
```

打开浏览器预览，然后编辑 `src/main.js`。

```js
function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(20);
  circle(mouseX, mouseY, 80);
}
```

## 移动端工作流

p5kit 的长期目标工作流是：

```sh
npm create p5kit@latest my-sketch
cd my-sketch

p5kit run ios
p5kit run android

p5kit build ios
p5kit build android
```

当前预览版已经提供了这组 CLI 形状，但原生工程生成、模拟器启动和真机运行仍在实现中。现在，在生成出来的项目里使用：

```sh
npm run dev            # 启动 Vite dev server
npm run build          # 构建 web bundle
npm run build:ios      # 准备 .p5kit/ios/Web
npm run build:android  # 准备 .p5kit/android/Web
```

这些 native bundle 目录里放的是 web 资源，供 iOS `WKWebView` 壳和未来的 Android `WebView` 壳加载。

## 它如何工作

```text
p5.js sketch
  -> Vite web bundle
  -> p5kit native bundle
  -> iOS WKWebView / Android WebView
  -> JavaScript-to-native bridge
  -> 移动端能力
```

p5.js 仍然通过浏览器 canvas runtime 渲染。p5kit 关注的是 sketch 周围的移动端 app 工作：项目脚手架、bundle、原生壳、bridge API、资源路径、canvas 尺寸、touch、安全区域、权限、音频和适合移动端的默认处理。

## 当前状态

p5kit 目前是早期预览版。

现在它可以：

- 通过 `npm create p5kit` 创建最小 p5.js 项目
- 通过 `p5kit dev` 启动本地 Vite dev server
- 通过 `p5kit build web` 构建生产用 web bundle
- 准备 iOS 和 Android 的 web 资源目录
- 提供当前 iOS `WKWebView` 壳组件的 Swift Package
- 提供小型 JavaScript bridge 基础

它还不能：

- 生成完整 Xcode 工程
- 生成完整 Android 工程
- 通过 `p5kit run` 启动 iOS 或 Android 模拟器/真机
- 处理签名、商店元数据或面向商店发布的 release build
- 替代 Capacitor 或 Cordova 这类通用方案

## 包含什么

- `create-p5kit`：`npm create p5kit` 使用的脚手架
- `@p5kit/cli`：提供 `p5kit` 命令的 CLI 包
- `@p5kit/core`：浏览器 runtime helper、生命周期约定和平台检测
- `@p5kit/bridge`：共享的 JavaScript 到原生端 bridge 协议
- `@p5kit/templates`：起步项目和示例
- `@p5kit/ios`：当前 iOS `WKWebView` 壳的 Swift Package

## 为什么需要 p5kit

Capacitor 和 Cordova 已经可以把 web app 打包到移动端。p5kit 的范围更窄：它面向 p5.js sketch 和创意编程工作流。

目标不是简单把网页塞进 WebView，而是让 sketch 在手机和平板上自然工作：全屏 canvas 布局、touch 输入、安全区域、传感器、音频解锁、资源打包、bridge 调用和原生构建 handoff 都应该由工具链处理。

## 开发

仓库设置、smoke test、包结构、架构说明和路线图见 [开发说明](docs/development.md)。

## 和 p5.js 的关系

p5kit 与 Processing Foundation 或 p5.js 没有关联。
