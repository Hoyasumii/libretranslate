---
sidebar_position: 1
title: 開始
description: "非官方的 TypeScript SDK 表示 LibreTranslate API, 有一個 MCP 伺服器和CLI 建在它上: 每個部件都做什麼, 如何安裝它 。"
slug: /intro
---

# 開始

`@hoyasumii/libretranslate` 是 TypeScript SDK 表示 [LibreTranslate](https://libretranslate.com) HTTP API, 上面建有 MCP 伺服器和 CLI
。 從代碼、 AI 代理或您的端口使用 : 三者共用同一客戶端 。

- **SDK**: 輸入文字和清單的翻譯方法, 探測語言, 翻譯檔案和發送建議 。 它是由 [orval](https://orval.dev) 來自此套件的 OpenAPI 光谱, 當實驗需要時會傳送您的 API 金鑰 。 起始
  [SDK](./sdk/overview.md).
- **MCP 伺服器** (`@hoyasumii/libretranslate/mcp`,本 `libretranslate-mcp`: stdio 或 流式 HTTP 上
  `127.0.0.1`。用于翻譯文字和文件、偵測語言和檢查實例的工具,以及原始 API 的通用工具。 起始 [MCP 伺服器](./mcp/overview.md).
- **中央LI** (`libretranslate`: 每個 MCP 工具作為子指令, 加上 `libretranslate mcp` 要設定伺服器, 在背景中執行, 在登入時啟動並登入 Claude Code, Codex 和
  OpenCode起始于 [中央LI](./cli/overview.md).

這是獨立的, **非官方** 客戶 麻省理工的授權人 它跟一個 LibreTranslate HTTP 的實例, 並且沒有從 。 LibreTranslate 專案。

## A LibreTranslate 例

你需要一個例子來對付:

- **你自己**,與 Docker : `docker run -p 5000:5000 libretranslate/libretranslate` 服務 `http://localhost:5000`,此套件默认使用的 URL 。
  它不需要 API 鍵 。
- **用這個CLI**,在安裝 Docker 時 : `libretranslate service up --languages en,pt,es` 做相同且保存 URL (參考)
  [`libretranslate service`](./cli/service.md)).
- **主持人**,例如 [libretranslate.com](https://libretranslate.com),需要 API 鍵。

## 安裝

需要 Node.js 二十或后.

```bash
npm i -g @hoyasumii/libretranslate     # or: pnpm add -g @hoyasumii/libretranslate
libretranslate mcp config              # the instance URL and, if it issues keys, an API key; saved per user
libretranslate mcp install             # registers the server (stdio) in Claude Code / Codex / OpenCode
```

作為圖書館 `npm install @hoyasumii/libretranslate`.

## 第一通電話

```ts
import { createLibreTranslateClient } from "@hoyasumii/libretranslate";

const lt = createLibreTranslateClient({ baseUrl: "http://localhost:5000" });
const { translatedText, detectedLanguage } = await lt.translate({ q: "Olá, mundo!", target: "en" });
// "Hello, world!", { language: "pt", confidence: 90 }
```

從終點站,一次 `libretranslate mcp config` 已儲存設定 :

```bash
libretranslate translate --q "Olá, mundo!" --target en
libretranslate languages --source pt
```

`libretranslate docs` 開啟此網站 。
