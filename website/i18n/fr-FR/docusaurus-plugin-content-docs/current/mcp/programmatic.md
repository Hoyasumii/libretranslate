---
sidebar_position: 6
title: Utilisation programmatique
description: "Exécutez LibreTranslate Serveur MCP à partir de votre propre code : sur stdio, sur HTTP ou sur tout transport MCP."
---

# Utilisation programmatique

`@hoyasumii/libretranslate/mcp` exporte le serveur et ses transports.

## Stdio

```ts
import { serveLibreTranslateMcpStdio } from "@hoyasumii/libretranslate/mcp";

const mcp = await serveLibreTranslateMcpStdio({
  baseUrl: "http://localhost:5000",
  apiKey: process.env.LIBRETRANSLATE_API_KEY, // optional
});
await mcp.closed; // settles when the client closes stdin
```

stdout porte le protocole, donc rien d'autre ne peut lui écrire. `stdin`/`stdout` peut être d'autres flux.

## HTTP

```ts
import { startLibreTranslateMcpServer } from "@hoyasumii/libretranslate/mcp";

const server = await startLibreTranslateMcpServer({ port: 0, baseUrl: "http://localhost:5000" });
console.log(server.url); // http://127.0.0.1:<port>/mcp
await server.close();
```

`port: 0` Il choisit un port libre. `shutdownToken` permet `POST /shutdown` (la demande l'emporte
`X-LibreTranslate-Shutdown`), et `onShutdown` fonctionne après avoir fermé le serveur.

## Tout transport

```ts
import { createLibreTranslateClient } from "@hoyasumii/libretranslate";
import { buildLibreTranslateMcpServer } from "@hoyasumii/libretranslate/mcp";

const server = buildLibreTranslateMcpServer(createLibreTranslateClient({ baseUrl, apiKey }));
await server.connect(transport);
```

`buildLibreTranslateMcpServer` répond à la nu `McpServer`, avec chaque outil enregistré et aucun transport attaché.

## Exportations

- `resolveMcpConfig`, `clientFor`, `configFilePath`, `readEnvFile`, `writeEnvFile`: la configuration utilisée par le
  CLI.
- `CATALOG`, `searchCatalog`, `describeOperation`, `invoke`: ce que les outils génériques fonctionnent.
