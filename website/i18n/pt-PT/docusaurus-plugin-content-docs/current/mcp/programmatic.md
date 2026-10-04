---
sidebar_position: 6
title: Uso programático
description: "Executar o LibreTranslate Servidor MCP a partir do seu próprio código: sobre stdio, sobre HTTP ou em qualquer transporte MCP."
---

# Uso programático

`@hoyasumii/libretranslate/mcp` exporta o servidor e os seus transportes.

## Stdio

```ts
import { serveLibreTranslateMcpStdio } from "@hoyasumii/libretranslate/mcp";

const mcp = await serveLibreTranslateMcpStdio({
  baseUrl: "http://localhost:5000",
  apiKey: process.env.LIBRETRANSLATE_API_KEY, // optional
});
await mcp.closed; // settles when the client closes stdin
```

stdout carrega o protocolo, então nada mais pode escrever para ele. `stdin`/`stdout` podem ser outras correntes.

## HTTP

```ts
import { startLibreTranslateMcpServer } from "@hoyasumii/libretranslate/mcp";

const server = await startLibreTranslateMcpServer({ port: 0, baseUrl: "http://localhost:5000" });
console.log(server.url); // http://127.0.0.1:<port>/mcp
await server.close();
```

`port: 0` Escolhe um porto livre. `shutdownToken` habilita `POST /shutdown` (o pedido é apresentado em
`X-LibreTranslate-Shutdown`), e `onShutdown` corre depois de fechar o servidor.

## Qualquer transporte

```ts
import { createLibreTranslateClient } from "@hoyasumii/libretranslate";
import { buildLibreTranslateMcpServer } from "@hoyasumii/libretranslate/mcp";

const server = buildLibreTranslateMcpServer(createLibreTranslateClient({ baseUrl, apiKey }));
await server.connect(transport);
```

`buildLibreTranslateMcpServer` responde ao nu `McpServer`, com cada ferramenta registrada e nenhum transporte anexado.

## Também exportado

- `resolveMcpConfig`, `clientFor`, `configFilePath`, `readEnvFile`, `writeEnvFile`: a configuração que o CLI usa.
- `CATALOG`, `searchCatalog`, `describeOperation`, `invoke`: o que as ferramentas genéricas executam.
