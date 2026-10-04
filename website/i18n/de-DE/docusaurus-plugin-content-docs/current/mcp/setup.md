---
sidebar_position: 2
title: Einrichtung
description: "Speichern Sie Ihre Einstellungen einmalig und registrieren Sie LibreTranslate MCP-Server in Claude Code, Codex und OpenCode."
---

# Einrichtung

## Der schnelle Weg

Speichern Sie Ihre Einstellungen einmal und lassen Sie die CLI den Server in den Clients registrieren, die sie findet:

```bash
npx libretranslate mcp config    # asks for the instance URL, an API key if it issues keys, and a port
npx libretranslate mcp install   # finds Claude Code, Codex and OpenCode on your PATH and registers libretranslate-mcp (stdio)
```

`install` zeigt eine Checkliste der gefundenen Clients. Wählen Sie diejenigen, die Sie wollen, und es registriert den
Server über jeden Client eigenen CLI, unter dem Namen `libretranslate`Der registrierte Befehl liest die gespeicherte
Konfiguration, wenn der Client sie startet, so dass kein API-Schlüssel in der Client-Konfiguration landet. Siehe
[`libretranslate mcp install`](../cli/mcp-commands.md#libretranslate-mcp-install) für die Flaggen.

## Handschrift: stdio

Lassen Sie den Client starten `libretranslate-mcp`Es liest die gespeicherte Konfiguration, so dass die
Client-Konfiguration keine Schlüssel benötigt:

```json
{
  "mcpServers": {
    "libretranslate": { "command": "npx", "args": ["-y", "-p", "@hoyasumii/libretranslate", "libretranslate-mcp"] }
  }
}
```

In Claude Code:

```bash
claude mcp add libretranslate -- npx -y -p @hoyasumii/libretranslate libretranslate-mcp
```

Ohne eine gespeicherte Konfiguration verwendet der Server `http://localhost:5000` Und keinen Schlüssel. Um es an anderer
Stelle zu zeigen oder die gespeicherte Datei zu überschreiben, geben Sie dem Client eine `env` Block (siehe)
[Konfiguration](./configuration.md):

```json
{
  "mcpServers": {
    "libretranslate": {
      "command": "npx",
      "args": ["-y", "-p", "@hoyasumii/libretranslate", "libretranslate-mcp"],
      "env": { "LIBRETRANSLATE_URL": "https://libretranslate.com", "LIBRETRANSLATE_API_KEY": "your-api-key" }
    }
  }
}
```

## Von Hand: HTTP

Führen Sie einen Server im Hintergrund aus und zeigen Sie Ihre Clients auf die URL:

```bash
npx libretranslate mcp start          # prints the URL, http://127.0.0.1:3768/mcp by default
claude mcp add --transport http libretranslate http://127.0.0.1:3768/mcp
```

Ohne die CLI, `libretranslate-mcp --http` führt es im Vordergrund mit den Einstellungen aus der Umgebung oder der
gespeicherten Konfiguration aus. `libretranslate-mcp --help` Liste der Flaggen. Um den Server bei jedem Login zu
starten, laufen `npx libretranslate mcp boot enable` (siehe)
[`libretranslate mcp boot`](../cli/mcp-commands.md#libretranslate-mcp-boot).

## Überprüfen, dass es funktioniert

Bitten Sie Ihren Agenten, anzurufen `libretranslate_status`, oder führen Sie es vom Terminal aus:

```bash
npx libretranslate status
```

Es beantwortet die Instanz-URL, ob ein Schlüssel konfiguriert und erforderlich ist, die Zeichenbegrenzung und die
Dateiformate.
