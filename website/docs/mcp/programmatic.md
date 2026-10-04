---
sidebar_position: 6
title: Programmatic use
description: "Run the LibreTranslate MCP server from your own code: over stdio, over HTTP, or on any MCP transport."
---

# Programmatic use

`@hoyasumii/libretranslate/mcp` exports the server and its transports.

## Stdio

```ts
import { serveLibreTranslateMcpStdio } from "@hoyasumii/libretranslate/mcp";

const mcp = await serveLibreTranslateMcpStdio({
  baseUrl: "http://localhost:5000",
  apiKey: process.env.LIBRETRANSLATE_API_KEY, // optional
});
await mcp.closed; // settles when the client closes stdin
```

stdout carries the protocol, so nothing else may write to it. `stdin`/`stdout` can be other streams.

## HTTP

```ts
import { startLibreTranslateMcpServer } from "@hoyasumii/libretranslate/mcp";

const server = await startLibreTranslateMcpServer({ port: 0, baseUrl: "http://localhost:5000" });
console.log(server.url); // http://127.0.0.1:<port>/mcp
await server.close();
```

`port: 0` picks a free port. `shutdownToken` enables `POST /shutdown` (the request carries it in
`X-LibreTranslate-Shutdown`), and `onShutdown` runs after it closed the server.

## Any transport

```ts
import { createLibreTranslateClient } from "@hoyasumii/libretranslate";
import { buildLibreTranslateMcpServer } from "@hoyasumii/libretranslate/mcp";

const server = buildLibreTranslateMcpServer(createLibreTranslateClient({ baseUrl, apiKey }));
await server.connect(transport);
```

`buildLibreTranslateMcpServer` answers the bare `McpServer`, with every tool registered and no transport attached.

## Also exported

- `resolveMcpConfig`, `clientFor`, `configFilePath`, `readEnvFile`, `writeEnvFile`: the configuration the CLI uses.
- `CATALOG`, `searchCatalog`, `describeOperation`, `invoke`: what the generic tools run on.
