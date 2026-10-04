---
sidebar_position: 6
title: Uso programático
description: "Rode o servidor MCP do LibreTranslate no seu próprio código: por stdio, por HTTP ou em qualquer transporte MCP."
---

# Uso programático

`@hoyasumii/libretranslate/mcp` exporta o servidor e os transportes dele.

## Stdio

```ts
import { serveLibreTranslateMcpStdio } from "@hoyasumii/libretranslate/mcp";

const mcp = await serveLibreTranslateMcpStdio({
  baseUrl: "http://localhost:5000",
  apiKey: process.env.LIBRETRANSLATE_API_KEY, // opcional
});
await mcp.closed; // resolve quando o cliente fecha o stdin
```

O stdout carrega o protocolo, então nada mais pode escrever nele. `stdin`/`stdout` podem ser outros streams.

## HTTP

```ts
import { startLibreTranslateMcpServer } from "@hoyasumii/libretranslate/mcp";

const server = await startLibreTranslateMcpServer({ port: 0, baseUrl: "http://localhost:5000" });
console.log(server.url); // http://127.0.0.1:<porta>/mcp
await server.close();
```

`port: 0` escolhe uma porta livre. `shutdownToken` habilita `POST /shutdown` (a requisição o leva em
`X-LibreTranslate-Shutdown`), e `onShutdown` roda depois que ele fechou o servidor.

## Qualquer transporte

```ts
import { createLibreTranslateClient } from "@hoyasumii/libretranslate";
import { buildLibreTranslateMcpServer } from "@hoyasumii/libretranslate/mcp";

const server = buildLibreTranslateMcpServer(createLibreTranslateClient({ baseUrl, apiKey }));
await server.connect(transport);
```

`buildLibreTranslateMcpServer` responde o `McpServer` puro, com todas as ferramentas registradas e nenhum transporte.

## Também exportados

- `resolveMcpConfig`, `clientFor`, `configFilePath`, `readEnvFile`, `writeEnvFile`: a configuração que a CLI usa.
- `CATALOG`, `searchCatalog`, `describeOperation`, `invoke`: aquilo sobre o que as ferramentas genéricas rodam.
