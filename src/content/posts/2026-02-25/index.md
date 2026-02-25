---
title: "Mizuki 网站集成 Live2D 看板娘（Cubism 5）"
date: "2026-02-25"
tags:
  - Live2D
  - Cubism
  - Mizuki
  - 技术教程
categories:
  - 技术教程
---

# Mizuki 网站集成 Live2D 看板娘（Cubism 5）

> 🎭 模型来源：[紫乃晶夏](https://space.bilibili.com/506087973)（B站）
> 
> ⚠️ **版权声明**：本文使用的 Live2D 模型仅供个人学习交流使用，模型版权归原作者所有。如需商用，请联系原作者获得授权。

## 背景

之前 Mizuki 网站使用的是基于 Cubism 2 的 Live2D 看板娘，最近成功升级到了 Cubism 5 格式，完美支持了香风智乃（ Chino ）Live2D 模型。

## 遇到的问题

### 问题一：模型格式不兼容

最初尝试使用香风智乃的 Live2D 模型时，遇到了以下错误：

```
The Core unsupport later than moc3 ver:[4]. This moc3 ver is [5].
```

这表明模型是 **Cubism 5** 格式（moc3 v5），但当时使用的 Cubism Core 最高只支持到 v4。

### 问题二：公开 CDN 没有 Cubism 5 Core

经过搜索发现，Live2D 官方的 Cubism 5 Core 不在公开 CDN 上，需要特殊配置。

### 问题三：PixiJS 版本兼容

在集成过程中还遇到了 PixiJS v7 和 v8 的 API 差异问题，需要使用正确的初始化方式。

## 解决方案

### 1. 获取 Cubism 5 Core

通过分析 [stevenjoezhang/live2d-widget](https://github.com/stevenjoezhang/live2d-widget) 项目，发现可以使用官方 CDN：

```javascript
cubism5Path: 'https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js'
```

### 2. 集成步骤

#### 第一步：下载必要的库文件

需要以下文件：

| 文件 | 用途 |
|------|------|
| `pixi.min.js` | PixiJS 渲染引擎 |
| `live2dcubismcore.min.js` | Live2D Cubism Core (支持 Cubism 5) |
| `l2d.js` | Live2D SDK (Cubism 2 兼容层) |
| `pixi-live2d-display.min.js` | PixiJS 的 Live2D 渲染插件 |

#### 第二步：修改代码

修改 `Pio.svelte` 组件，添加 Cubism 5 支持：

```javascript
// 加载顺序：PixiJS → Cubism Core → l2d.js → pixi-live2d-display
loadScript("/pio/static/pixi.min.js", "pixi-script")
  .then(() => loadScript("/pio/static/live2dcubismcore.min.js", "cubism-core-script"))
  .then(() => loadScript("/pio/static/l2d.js", "live2d-script"))
  .then(() => loadScript("/pio/static/pixi-live2d.min.js", "pixi-live2d-script"))
  .then(() => initCubism());
```

#### 第三步：初始化模型

```javascript
const model = await Live2DModel.from(modelPath, {
  autoUpdate: true,
  autoInteract: true,
});
```

### 3. 交互功能

实现了以下功能：

- ✅ 拖动整个画布
- ✅ 点击交互
- ✅ 位置调整（左下角）
- ✅ 大小缩放

## 技术细节

### 关键代码

```javascript
// PixiJS v7 初始化方式
const app = new PIXI.Application({
  width: 320,
  height: 350,
  backgroundAlpha: 0,
  view: pioCanvas,
  resizeTo: pioCanvas,
});
```

### 文件结构

```
public/pio/
├── models/
│   └── chino/              # 香风智乃模型
│       ├── 智乃.model3.json
│       ├── 智乃.moc3
│       └── 智乃.4096/
└── static/
    ├── pixi.min.js
    ├── live2dcubismcore.min.js
    ├── l2d.js
    └── pixi-live2d.min.js
```

## 参考资料

- [stevenjoezhang/live2d-widget](https://github.com/stevenjoezhang/live2d-widget) - Live2D 看板娘组件
- [pixi-live2d-display](https://github.com/xiazeyu/pixi-live2d-display) - PixiJS 的 Live2D 渲染库
- [Live2D 官方 SDK](https://live2d.com/) - Cubism Core 下载

## 总结

通过集成 `stevenjoezhang/live2d-widget` 项目的方案，成功在 Mizuki 网站上实现了 Cubism 5 格式的 Live2D 模型显示。整个过程主要解决了：

1. Cubism 5 Core 的获取
2. PixiJS 版本的兼容性
3. 拖动和点击交互的实现

现在网站左下角可以看到可爱的香风智乃 Live2D 看板娘啦！🎉
