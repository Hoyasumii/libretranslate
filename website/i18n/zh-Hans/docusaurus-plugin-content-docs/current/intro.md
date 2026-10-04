---
sidebar_position: 1
title: 开始
description: "一个非正式的 TypeScript SDK为 LibreTranslate API,有一个MCP服务器和一个CLI建在它上:每个部分做什么以及如何安装."
slug: /intro
---

# 开始

`@hoyasumii/libretranslate` 是一个 TypeScript SDK为 [LibreTranslate](https://libretranslate.com) HTTP API,其上建有MCP服务器和CLI.
用从代码,从AI代理,或从您的终端: 三个都共享同一个客户端.

- **SDK 软件**: 用于翻译文本和列表,检测语言,文件翻译和发送建议的打字方法. 它是由下列因素产生的: [orval](https://orval.dev) 从为此软件包编写的 OpenAPI 光谱, 当实例需要时, 发送您的
  API 密钥 。 开始于 [SDK 软件](./sdk/overview.md)。 。 。 。
- **MCP 服务器** (单位:千美元)`@hoyasumii/libretranslate/mcp`边 `libretranslate-mcp`: stdio 或可流式 HTTP 打开
  `127.0.0.1`翻译文本和文件、检测语言和检查实例的工具,以及原始API的通用工具。 开始于 [MCP 服务器](./mcp/overview.md)。 。 。 。
- **国 际** (单位:千美元)`libretranslate`: 每个 MCP 工具作为子命令,加 `libretranslate mcp` 配置服务器, 在背景中运行, 在登录时启动并注册到 Claude Code, (中文).
  Codex 和 OpenCode开始于 [国 际](./cli/overview.md)。 。 。 。

这是一个独立的, **非正式** 委托人,麻省理工的执照。 它跟一个 LibreTranslate HTTP 上的例子,没有包含来自 LibreTranslate 项目。

## 页:1 LibreTranslate 实例

你需要一个实例来谈谈:

- **属于你的**,与多克: `docker run -p 5000:5000 libretranslate/libretranslate` 服务 `http://localhost:5000`,该软件包默认使用的URL。
  它不需要API键.
- **用这个CLI**,当安装 Docker 时 : `libretranslate service up --languages en,pt,es` 执行相同并保存 URL(参见
  [`libretranslate service`](./cli/service.md)) (中文(简体) ).
- **主持人**,例如, [libretranslate.com](https://libretranslate.com),这需要 API 键。

## 安装

要求 Node.js 20岁或以后。

```bash
npm i -g @hoyasumii/libretranslate     # or: pnpm add -g @hoyasumii/libretranslate
libretranslate mcp config              # the instance URL and, if it issues keys, an API key; saved per user
libretranslate mcp install             # registers the server (stdio) in Claude Code / Codex / OpenCode
```

作为图书馆, `npm install @hoyasumii/libretranslate`。 。 。 。

## 第一通电话

```ts
import { createLibreTranslateClient } from "@hoyasumii/libretranslate";

const lt = createLibreTranslateClient({ baseUrl: "http://localhost:5000" });
const { translatedText, detectedLanguage } = await lt.translate({ q: "Olá, mundo!", target: "en" });
// "Hello, world!", { language: "pt", confidence: 90 }
```

从终点站,一次 `libretranslate mcp config` 已保存配置 :

```bash
libretranslate translate --q "Olá, mundo!" --target en
libretranslate languages --source pt
```

`libretranslate docs` 打开此网站。
