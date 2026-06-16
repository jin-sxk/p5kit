# p5kit

[English](README.md)

p5kit 是一个独立的开源工具包，用来把 p5.js sketch 封装成移动端 app。

它的目标是让你继续使用熟悉的 p5.js 创作方式，然后把同一套 sketch 工作流打包到移动端，而不需要把 sketch 重写成 Swift、Kotlin 或原生 UI 框架。

```js
function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(20);
  circle(mouseX, mouseY, 80);
}
```

## 状态

p5kit 目前是早期预览版。

现在它可以：

- 创建一个最小 p5.js 项目
- 启动本地 Vite dev server
- 构建生产用 web bundle
- 准备可嵌入原生壳的 iOS web bundle
- 通过小型 JavaScript bridge 暴露原生能力

它还不能生成完整 Xcode 工程、Android 工程、签名配置或面向应用商店的 release build。

## 创建项目

```sh
npm create p5kit@latest my-sketch
cd my-sketch
npm install
npm run dev
```

打开 Vite 打印出的本地地址，然后编辑 `src/main.js`。

## 构建

构建 web bundle：

```sh
npm run build
```

准备 iOS bundle：

```sh
npm run build:ios
```

iOS 命令会把 web 资源写入 `.p5kit/ios/Web`。这个目录之后会由原生 iOS shell 嵌入。

## 包

- `create-p5kit`：`npm create p5kit` 使用的项目脚手架
- `@p5kit/cli`：提供 `p5kit` 命令的 CLI 包
- `@p5kit/core`：p5kit sketch 的浏览器 runtime helper
- `@p5kit/bridge`：JavaScript 到原生端的 bridge 协议
- `@p5kit/templates`：起步模板
- `@p5kit/ios`：当前 iOS `WKWebView` 壳组件的 Swift Package

## 命令

在生成的 p5kit 项目里：

```sh
npm run dev        # 启动本地 dev server
npm run build      # 构建 web bundle
npm run build:ios  # 准备 .p5kit/ios/Web
```

## 项目文档

- [开发说明](docs/development.md)
- [npm 发布 SOP](docs/npm-publishing.md)

## 和 p5.js 的关系

p5kit 与 Processing Foundation 或 p5.js 没有关联。
