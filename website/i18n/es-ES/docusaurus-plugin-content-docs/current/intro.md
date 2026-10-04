---
sidebar_position: 1
title: Comienzo
description: "No oficial TypeScript SDK para el LibreTranslate API, con un servidor MCP y un CLI construido en él: lo que cada parte hace y cómo instalarlo."
slug: /intro
---

# Comienzo

`@hoyasumii/libretranslate` es un TypeScript SDK para el [LibreTranslate](https://libretranslate.com) HTTP API, con un
servidor MCP y un CLI construido sobre él. Úsalo de código, de un agente de IA o de su terminal: los tres comparten el
mismo cliente.

- **SDK**: métodos de traducción de textos y listas, detección de idiomas, traducción de archivos y envío de
  sugerencias. Se genera por [orval](https://orval.dev) de una especie OpenAPI escrita para este paquete, y envía su
  clave de API cuando la instancia necesita uno. Comienza. [SDK](./sdk/overview.md).
- **MCP server** (G)`@hoyasumii/libretranslate/mcp`, bin `libretranslate-mcp`): HTTP tóxico o Streamable `127.0.0.1`.
  Herramientas para traducir textos y documentos, detectar idiomas y comprobar la instancia, además de herramientas
  genéricas para la API cruda. Comienza. [MCP server](./mcp/overview.md).
- **CLI** (G)`libretranslate`): cada herramienta MCP como subcomandante, más `libretranslate mcp` para configurar el
  servidor, ejecutarlo en el fondo, iniciarlo en el login y registrarlo en Claude Code, Codex y OpenCode. Inicio
  [CLI](./cli/overview.md).

Esto es un independiente, **no oficiales** cliente, licencia del MIT. Habla con un LibreTranslate instancia sobre HTTP y
no contiene ningún código del LibreTranslate proyecto.

## A LibreTranslate ejemplo

Necesitas una instancia para hablar con:

- **Tu propio**Con Docker: `docker run -p 5000:5000 libretranslate/libretranslate` sirve `http://localhost:5000`, la URL
  que este paquete utiliza por defecto. No necesita clave de API.
- **Con este CLI**, cuando Docker está instalado: `libretranslate service up --languages en,pt,es` hace lo mismo y
  guarda la URL (ver [`libretranslate service`](./cli/service.md)).
- **Un anfitrión**, como [libretranslate.com](https://libretranslate.com), que requiere una clave de API.

## Instalación

Requisitos Node.js 20 o más tarde.

```bash
npm i -g @hoyasumii/libretranslate     # or: pnpm add -g @hoyasumii/libretranslate
libretranslate mcp config              # the instance URL and, if it issues keys, an API key; saved per user
libretranslate mcp install             # registers the server (stdio) in Claude Code / Codex / OpenCode
```

Como biblioteca, `npm install @hoyasumii/libretranslate`.

## Una primera llamada

```ts
import { createLibreTranslateClient } from "@hoyasumii/libretranslate";

const lt = createLibreTranslateClient({ baseUrl: "http://localhost:5000" });
const { translatedText, detectedLanguage } = await lt.translate({ q: "Olá, mundo!", target: "en" });
// "Hello, world!", { language: "pt", confidence: 90 }
```

Desde el terminal, una vez `libretranslate mcp config` ha guardado una configuración:

```bash
libretranslate translate --q "Olá, mundo!" --target en
libretranslate languages --source pt
```

`libretranslate docs` abre este sitio.
