---
sidebar_position: 6
title: 程序使用
description: "运行 LibreTranslate MCP服务器来自您自己的代码: over stdio, over HTTP, 或者在任何 MCP 传输上."
---

# 程序使用

`@hoyasumii/libretranslate/mcp` 输出服务器及其传输。

## 斯特迪奥

```ts
import { serveLibreTranslateMcpStdio } from "@hoyasumii/libretranslate/mcp";

const mcp = await serveLibreTranslateMcpStdio({
  baseUrl: "http://localhost:5000",
  apiKey: process.env.LIBRETRANSLATE_API_KEY, // optional
});
await mcp.closed; // settles when the client closes stdin
```

Stdout带着协议,所以没有其他东西可以写下来。 `stdin`页:1`stdout` 可以是其他溪流。

## HTTP 软件

```ts
import { startLibreTranslateMcpServer } from "@hoyasumii/libretranslate/mcp";

const server = await startLibreTranslateMcpServer({ port: 0, baseUrl: "http://localhost:5000" });
console.log(server.url); // http://127.0.0.1:<port>/mcp
await server.close();
```

`port: 0` 选择自由端口。 `shutdownToken` 启用 `POST /shutdown` (请求包含在 `X-LibreTranslate-Shutdown`),以及 `onShutdown` 关闭服务器后运行。

## 任何运输

```ts
import { createLibreTranslateClient } from "@hoyasumii/libretranslate";
import { buildLibreTranslateMcpServer } from "@hoyasumii/libretranslate/mcp";

const server = buildLibreTranslateMcpServer(createLibreTranslateClient({ baseUrl, apiKey }));
await server.connect(transport);
```

`buildLibreTranslateMcpServer` 回答赤裸的 `McpServer`,每个工具都注册,没有附带运输工具。

## 还出口

- `resolveMcpConfig`, (中文). `clientFor`, (中文). `configFilePath`, (中文). `readEnvFile`, (中文). `writeEnvFile`: CLI 使用的配置.
- `CATALOG`, (中文). `searchCatalog`, (中文). `describeOperation`, (中文). `invoke`:通用工具运行在什么上.
