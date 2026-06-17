# Agents Instructions

## 产品目标与实现边界

p5kit 的后续目标是让用户通过 npm 工作流搭建好把 p5.js sketch 构建成 iOS / Android app 所需的基础工作。当前主线应站在 Capacitor 之上：p5kit 负责 p5.js 创意编程体验、模板、命令封装和 p5 专用 runtime/API，Capacitor 负责通用 native runtime、平台工程生成、同步、运行和插件机制。

目标用户路径应优先围绕这些命令成立：

```sh
npm create p5kit my-sketch
cd my-sketch

p5kit run ios
p5kit run android

p5kit build ios
p5kit build android
```

这意味着 `create-p5kit` / `p5kit` npm 包后续应负责生成、同步或驱动以下基础设施：

- p5.js sketch 的 web 模板和 web bundle；
- Capacitor 配置、iOS / Android 平台目录生成、资源同步和运行命令；
- 基于 Capacitor 官方插件和后续 p5kit 专用插件的小型统一 API；
- 适合创意编程的移动端默认处理，例如 canvas 尺寸、touch、safe area、权限、音频和资源路径。

重要边界：

- 不要把项目实现成“只提供一个 JS runtime helper，原生工程让用户自己从零搭”。
- 也不要把项目泛化成完整 Capacitor / Cordova 替代品；优先服务 p5.js sketch 到移动 app 的创意编程工作流。p5kit 应该封装和约束 Capacitor，而不是重新实现 Capacitor。
- “引入 npm 包”在这里指 npm create / 安装 CLI / 使用模板和命令初始化项目，不是单纯在业务代码里 `import` 一个包就完成原生构建。
- 当前阶段可以先提供可验证的骨架和 handoff 点，不要求一次做完完整 iOS、Android、签名和商店发布流程。

## Git 提交规范

默认使用“英文类型/作用域 + 中文摘要”的 commit 标题格式：

```text
type(scope): 中文摘要
```

`type` 和 `scope` 使用英文，冒号后写中文；无作用域时使用：

```text
type: 中文摘要
```

示例：

```text
docs: 新增页面结构树
fix(widget): 用 widgetRenderingMode 正确判断 iOS 26 clear/tinted 模式
refactor(dropin): 将 DropInViews 按职责拆分
merge: feature/dropin-city-region-i18n → main（城市规范化 + 名称换行）
```

commit 正文使用中文，说明改了什么、为什么改、如何验证。

仅当用户明确要求、上游规范要求或第三方自动化要求时，才使用全英文 commit。
