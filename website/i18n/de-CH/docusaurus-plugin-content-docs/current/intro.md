---
sidebar_position: 1
title: Beginnen Sie
description: "Ein inoffizieller TypeScript SDK für die LibreTranslate API, mit einem MCP-Server und einer darauf aufbauenden CLI: Was macht jedes Teil und wie wird es installiert?"
slug: /intro
---

# Beginnen Sie

`@hoyasumii/libretranslate` ist eine TypeScript SDK für die [LibreTranslate](https://libretranslate.com) HTTP API, mit
einem MCP-Server und einer darauf aufbauenden CLI. Verwenden Sie es von Code, von einem KI-Agenten oder von Ihrem
Terminal: Alle drei teilen sich den gleichen Client.

- **SDK**: typisierte Methoden zum Übersetzen von Texten und Listen, zum Erkennen von Sprachen, zum Übersetzen von
  Dateien und zum Senden von Vorschlägen. Es wird erzeugt von [orval](https://orval.dev) von einer
  OpenAPI-Spezifikation, die für dieses Paket geschrieben wurde, und sendet Ihren API-Schlüssel, wenn die Instanz einen
  benötigt. Beginn: [SDK](./sdk/overview.md).
- **MCP-Server** ()`@hoyasumii/libretranslate/mcp`, Bin `libretranslate-mcp`): stdio oder Streamable HTTP on
  `127.0.0.1`Tools zum Übersetzen von Texten und Dokumenten, zum Erkennen von Sprachen und zum Überprüfen der Instanz
  sowie generische Tools für die Roh-API. Beginn: [MCP-Server](./mcp/overview.md).
- **CLI** ()`libretranslate`): jedes MCP-Tool als Unterbefehl, plus `libretranslate mcp` So konfigurieren Sie den
  Server, führen ihn im Hintergrund aus, starten ihn beim Login und registrieren ihn in Claude Code, Codex und
  OpenCodeBeginnen Sie mit [CLI](./cli/overview.md).

Dies ist eine unabhängige, **inoffiziell** Client, MIT lizenziert. Es spricht mit einem LibreTranslate instance over
HTTP und enthält keinen Code aus dem LibreTranslate Projekt.

## A LibreTranslate Beispiel

Sie benötigen eine Instanz, mit der Sie sprechen können:

- **Ihre eigenen**mit Docker: `docker run -p 5000:5000 libretranslate/libretranslate` Dienst `http://localhost:5000`,
  die URL, die dieses Paket standardmäßig verwendet. Es braucht keinen API-Schlüssel.
- **Mit diesem CLI**Wenn Docker installiert ist: `libretranslate service up --languages en,pt,es` tut dasselbe und
  speichert die URL (siehe) [`libretranslate service`](./cli/service.md).
- **Ein Hosted One**, wie [libretranslate.com](https://libretranslate.com)Dies erfordert einen API-Schlüssel.

## Installation

Erforderlich Node.js 20 oder später.

```bash
npm i -g @hoyasumii/libretranslate     # or: pnpm add -g @hoyasumii/libretranslate
libretranslate mcp config              # the instance URL and, if it issues keys, an API key; saved per user
libretranslate mcp install             # registers the server (stdio) in Claude Code / Codex / OpenCode
```

Als Bibliothek, `npm install @hoyasumii/libretranslate`.

## Ein erster Aufruf

```ts
import { createLibreTranslateClient } from "@hoyasumii/libretranslate";

const lt = createLibreTranslateClient({ baseUrl: "http://localhost:5000" });
const { translatedText, detectedLanguage } = await lt.translate({ q: "Olá, mundo!", target: "en" });
// "Hello, world!", { language: "pt", confidence: 90 }
```

Vom Terminal, einmal `libretranslate mcp config` eine Konfiguration gespeichert hat:

```bash
libretranslate translate --q "Olá, mundo!" --target en
libretranslate languages --source pt
```

`libretranslate docs` öffnet diese Website.
