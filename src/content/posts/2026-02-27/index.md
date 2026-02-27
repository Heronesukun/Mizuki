---
title: Mizuki 项目集成 Live2D Cubism 5 看板娘指南
date: 2026-02-27
tags:
  - Live2D
  - Cubism
  - Mizuki
  - 技术教程
categories:
  - 技术教程
---

# Mizuki 项目集成 Live2D Cubism 5 看板娘指南

## 前言

之前 Mizuki 项目中使用的是基于 [Paul_Pio](https://github.com/Heronesukun/Paul-Pio) 的 Live2D 看板娘方案，该方案仅支持 Cubism 2 版本的模型。随着 Live2D 技术的迭代，越来越多的模型采用了 Cubism 4/5 版本，这促使我探索将 Cubism 5 支持集成到 Mizuki 项目中的方案。

本文将详细介绍如何在 Mizuki 项目中集成 [live2d-widget](https://github.com/stevenjoezhang/live2d-widget) 来支持 Cubism 5 版本的 Live2D 模型。

## 方案选择

### 问题背景

- 原 Mizuki 项目使用的 Paul_Pio 仅支持 Cubism 2
- Cubism 5 模型无法在旧版本中运行
- 需要保持与原有功能的兼容性

### 方案对比

| 方案 | 优点 | 缺点 |
|------|------|------|
| 自行开发 | 完全可控 | 工作量大 |
| 使用 live2d-widget | 开源、成熟、支持 Cubism 5 | 需要适配 |
| 使用其他开源方案 | 社区活跃 | 可能不符合项目需求 |

最终选择 **live2d-widget** 方案，因为它：
1. 开源且维护活跃
2. 原生支持 Cubism 2/3/4/5
3. 社区生态成熟

## 准备工作

### 1. 下载 Cubism SDK

访问 Live2D 官网下载 Cubism SDK for Web：

> https://www.live2d.com/zh-CHS/sdk/download/web/

本文使用的是 **CubismSdkForWeb-5-r.4** 版本。

> ⚠️ 注意：Cubism SDK 需要遵循 Live2D 的许可协议。Core 库文件（`live2dcubismcore.min.js`）在符合 Redistributable Code 条款的情况下可以重新分发。

### 2. 准备 Live2D 模型

模型文件需要包含以下内容：
- `*.model3.json` - 模型配置文件
- `*.moc3` - 模型数据文件
- `*.textures/` - 纹理图片
- `expressions/` - 表情文件
- `motions/` - 动作文件

本文使用的模型源自 [紫乃晶夏](https://space.bilibili.com/506087973)（B站），已获得授权使用。

## 集成步骤

### 1. 添加 live2d-widget 配置

在 `src/types/config.ts` 中添加 Live2D 配置类型：

```typescript
export type Live2DConfig = {
  enable: boolean; // 是否启用 live2d-widget
};
```

### 2. 创建配置文件

在 `src/config.ts` 中添加配置：

```typescript
export const live2dConfig: Live2DConfig = {
  enable: true, // 启用 live2d-widget
};
```

### 3. 修改布局文件

在 `src/layouts/Layout.astro` 中引入 live2d-widget：

```astro
import {
  live2dConfig,
  // ...其他配置
} from "@/config";

// 在 body 末尾添加
{live2dConfig.enable && <script is:inline src="/live2d/autoload.js"></script>}
```

> ⚠️ 注意：必须使用 `is:inline` 属性，否则 Astro 会尝试将脚本打包，导致构建失败。

### 4. 添加静态资源

将以下文件复制到 `public/live2d/` 目录：

```
public/live2d/
├── autoload.js          # 入口文件
├── waifu-tips.js       # 主逻辑
├── waifu-tips.json     # 提示文本配置
├── waifu.css           # 样式文件
├── widget.js           # 组件
├── live2d.min.js       # Cubism 2 核心库
├── chunk/              # 打包后的模块
├── CubismSdkForWeb-5-r.4/
│   └── Core/
│       └── live2dcubismcore.min.js  # Cubism 5 核心库
└── model/
    ├── model_list.json  # 模型列表
    └── [模型名称]/
        ├── index.json
        ├── *.moc3
        ├── *.textures/
        └── ...
```

### 5. 配置 autoload.js

修改 `public/live2d/autoload.js` 中的路径配置：

```javascript
const live2d_path = '/live2d/';

// 配置 CDN 路径
initWidget({
  waifuPath: live2d_path + 'waifu-tips.json',
  cdnPath: '/live2d/model/',  // 模型目录
  cubism2Path: live2d_path + 'live2d.min.js',
  cubism5Path: live2d_path + 'CubismSdkForWeb-5-r.4/Core/live2dcubismcore.min.js',
  // ...其他配置
});
```

### 6. 配置模型列表

在 `public/live2d/model/model_list.json` 中添加模型：

```json
{
  "models": [
    "重置版智乃",
    "香风智乃"
  ],
  "messages": [
    "重置版智乃",
    "香风智乃"
  ]
}
```

每个模型需要有一个对应的目录，包含 `index.json`（模型配置文件）。

## 与原有功能兼容

Mizuki 项目原本使用 `pioConfig` 来控制 Live2D 看板娘。为了兼容性：

1. 将原有的 `pioConfig.enable` 设置为 `false`
2. 使用新的 `live2dConfig.enable` 来控制 live2d-widget

这样可以：
- 保留原有功能作为备用
- 逐步迁移到新方案
- 用户可根据需求切换

## 构建与部署

### 构建

```bash
pnpm build
```

Astro 会自动将 `public/live2d/` 目录复制到 `dist/live2d/`。

### 部署

部署时需要确保：
1. 所有静态资源已上传
2. CDN 缓存已清除（如使用 Cloudflare/EdgeOne）
3. 路径配置正确

## 常见问题

### 1. 模型加载 404

检查 `model_list.json` 格式是否正确，应为字符串数组：
```json
{
  "models": ["模型名称"]
}
```

### 2. CORS 错误

确保模型文件可以正常跨域访问，或使用同源资源。

### 3. Cubism 版本不匹配

确认使用的 SDK 版本与模型版本匹配（Cubism 2/3/4/5）。

## 参考链接

- [live2d-widget GitHub](https://github.com/stevenjoezhang/live2d-widget)
- [Live2D Cubism SDK](https://www.live2d.com/zh-CHS/sdk/download/web/)
- [紫乃晶夏 B站](https://space.bilibili.com/506087973)

## 总结

通过集成 live2d-widget，Mizuki 项目成功实现了对 Cubism 5 模型的支持。这种方案：

1. ✅ 保持与原有功能的兼容性
2. ✅ 支持多种 Cubism 版本
3. ✅ 开源免费，社区活跃
4. ✅ 配置灵活，易于扩展

希望本教程能帮助你在项目中成功集成 Live2D 看板娘！
