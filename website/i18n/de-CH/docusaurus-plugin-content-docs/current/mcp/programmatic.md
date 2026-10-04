---
sidebar_position: 6
title: Programmatischer Einsatz
description: "Laufen LibreTranslate MCP-Server aus Ihrem eigenen Code: über stdio, über HTTP oder auf jedem MCP-Transport."
---

# Programmatischer Einsatz

`@hoyasumii/libretranslate/mcp` den Server und seine Transporte exportiert.

## Stdio

```ts
import { serveLibreTranslateMcpStdio } from "@hoyasumii/libretranslate/mcp";

const mcp = await serveLibreTranslateMcpStdio({
  baseUrl: "http://localhost:5000",
  apiKey: process.env.LIBRETRANSLATE_API_KEY, // optional
});
await mcp.closed; // settles when the client closes stdin
```

Stdout trägt das protokoll, so dass nichts anderes dazu schreiben kann. `stdin`/`stdout` können andere Streams sein.

## HTTP

```ts
import { startLibreTranslateMcpServer } from "@hoyasumii/libretranslate/mcp";

const server = await startLibreTranslateMcpServer({ port: 0, baseUrl: "http://localhost:5000" });
console.log(server.url); // http://127.0.0.1:<port>/mcp
await server.close();
```

`port: 0` Wählen Sie einen freien Port. `shutdownToken` ermöglicht `POST /shutdown` (Der Antrag trägt es in)
`X-LibreTranslate-Shutdown`, und `onShutdown` läuft, nachdem er den Server geschlossen hat.

## Jede Beförderung

```ts
import { createLibreTranslateClient } from "@hoyasumii/libretranslate";
import { buildLibreTranslateMcpServer } from "@hoyasumii/libretranslate/mcp";

const server = buildLibreTranslateMcpServer(createLibreTranslateClient({ baseUrl, apiKey }));
await server.connect(transport);
```

`buildLibreTranslateMcpServer` Antworten auf die nackte `McpServer`, wobei jedes Werkzeug registriert ist und kein
Transport beigefügt ist.

## Auch ausgeführt

- `resolveMcpConfig`, `clientFor`, `configFilePath`, `readEnvFile`, `writeEnvFile`: die Konfiguration, die die CLI
  verwendet.
- `CATALOG`, `searchCatalog`, `describeOperation`, `invoke`: Worauf laufen die generischen Tools?
