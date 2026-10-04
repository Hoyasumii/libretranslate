---
sidebar_position: 6
title: 程序使用
description: "執行 LibreTranslate MCP 伺服器來自您的代碼: 超過 stdio, 超過 HTTP, 或是任何 MCP 傳輸 。"
---

# 程序使用

`@hoyasumii/libretranslate/mcp` 匯出伺服器及其傳輸。

## 斯迪奧

```ts
import { serveLibreTranslateMcpStdio } from "@hoyasumii/libretranslate/mcp";

const mcp = await serveLibreTranslateMcpStdio({
  baseUrl: "http://localhost:5000",
  apiKey: process.env.LIBRETRANSLATE_API_KEY, // optional
});
await mcp.closed; // settles when the client closes stdin
```

Stdout帶了條件 所以沒有別的字可以寫 `stdin`/`stdout` 可以是其他溪流。

## (HTTP)

```ts
import { startLibreTranslateMcpServer } from "@hoyasumii/libretranslate/mcp";

const server = await startLibreTranslateMcpServer({ port: 0, baseUrl: "http://localhost:5000" });
console.log(server.url); // http://127.0.0.1:<port>/mcp
await server.close();
```

`port: 0` 選擇自由端口 。 `shutdownToken` 啟動 `POST /shutdown` (要求中包含) `X-LibreTranslate-Shutdown`),和 `onShutdown` 在它關閉伺服器後執行 。

## 任何交通工具

```ts
import { createLibreTranslateClient } from "@hoyasumii/libretranslate";
import { buildLibreTranslateMcpServer } from "@hoyasumii/libretranslate/mcp";

const server = buildLibreTranslateMcpServer(createLibreTranslateClient({ baseUrl, apiKey }));
await server.connect(transport);
```

`buildLibreTranslateMcpServer` 回答赤裸的 `McpServer`,所有工具都已登記,而且沒有接觸。

## 也匯出

- `resolveMcpConfig`, `clientFor`, `configFilePath`, `readEnvFile`, `writeEnvFile`: CLI 使用的配置 。
- `CATALOG`, `searchCatalog`, `describeOperation`, `invoke`: 通用工具的運作。
