---
sidebar_position: 6
title: Uso programático
description: "Corre. LibreTranslate servidor MCP desde su propio código: sobre stdio, sobre HTTP, o en cualquier transporte MCP."
---

# Uso programático

`@hoyasumii/libretranslate/mcp` exporta el servidor y sus transportes.

## Stdio

```ts
import { serveLibreTranslateMcpStdio } from "@hoyasumii/libretranslate/mcp";

const mcp = await serveLibreTranslateMcpStdio({
  baseUrl: "http://localhost:5000",
  apiKey: process.env.LIBRETRANSLATE_API_KEY, // optional
});
await mcp.closed; // settles when the client closes stdin
```

stdout lleva el protocolo, así que nada más puede escribirle. `stdin`/`stdout` pueden ser otras corrientes.

## HTTP

```ts
import { startLibreTranslateMcpServer } from "@hoyasumii/libretranslate/mcp";

const server = await startLibreTranslateMcpServer({ port: 0, baseUrl: "http://localhost:5000" });
console.log(server.url); // http://127.0.0.1:<port>/mcp
await server.close();
```

`port: 0` elige un puerto libre. `shutdownToken` habilitación `POST /shutdown` (la solicitud la lleva en
`X-LibreTranslate-Shutdown`), y `onShutdown` se ejecuta después de que cerró el servidor.

## Cualquier transporte

```ts
import { createLibreTranslateClient } from "@hoyasumii/libretranslate";
import { buildLibreTranslateMcpServer } from "@hoyasumii/libretranslate/mcp";

const server = buildLibreTranslateMcpServer(createLibreTranslateClient({ baseUrl, apiKey }));
await server.connect(transport);
```

`buildLibreTranslateMcpServer` responde al desnudo `McpServer`, con cada herramienta registrada y sin transporte
adjunto.

## También exportado

- `resolveMcpConfig`, `clientFor`, `configFilePath`, `readEnvFile`, `writeEnvFile`: la configuración que utiliza el CLI.
- `CATALOG`, `searchCatalog`, `describeOperation`, `invoke`: lo que las herramientas genéricas funcionan.
