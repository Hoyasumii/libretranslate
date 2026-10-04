---
sidebar_position: 1
title: Übersicht
description: "Die LibreTranslate MCP-Server: seine Transporte, seine Werkzeuge und der HTTP-Modus."
---

# MCP-Server

`libretranslate-mcp` Gaben Claude Code, Codex, OpenCode oder jede andere MCP-Client-Maschinenübersetzung durch eine
LibreTranslate Instanz.

```bash
libretranslate-mcp            # stdio: what the MCP client runs
libretranslate-mcp --http     # http://127.0.0.1:3768/mcp (PORT changes the port)
libretranslate mcp start      # the same in the background; stop/status; boot enable to start it at login
```

## Werkzeuge

| Werkzeug                                                                       | Was ist                                                                           |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| `libretranslate_translate`                                                     | Ein Text oder eine Liste, mit `auto` Erkennung, HTML und Alternativen             |
| `libretranslate_translate_file`                                                | Ein lokales Dokument, das neben dem Original als `<name>.<target><ext>`           |
| `libretranslate_detect`                                                        | Die Kandidatensprachen eines Textes                                               |
| `libretranslate_languages`                                                     | Die Sprachcodes oder die Ziele einer Quelle                                       |
| `libretranslate_status`                                                        | Gesundheit, ob ein Schlüssel erforderlich ist, das Zeichenlimit, die Dateiformate |
| `libretranslate_suggest`                                                       | Senden Sie eine bessere Übersetzung zurück, wenn der Benutzer danach fragt        |
| `libretranslate_resources` / `libretranslate_describe` / `libretranslate_call` | Die rohe API, Operation nach Operation                                            |

- [Werkzeuge](./tools.md): die kuratierten Werkzeuge im Detail.
- [Generische Werkzeuge](./generic-tools.md)Die rohe API.

## Der HTTP-Modus

- Es ist staatenlos und hört zu `127.0.0.1` nur.
- Sie lehnt eine `Host` Das ist kein Loopback, gegen DNS-Rebinding.
- `GET /health` Antworten `{ ok, baseUrl, apiKey, version }`, `apiKey` Sagen, ob man konfiguriert ist.
- `POST /shutdown` Mit dem Token `libretranslate mcp start` Generiert schließt es; so stoppt `libretranslate mcp stop`
  den Server, Windows inklusive.

Im Stdio-Modus trägt stdout das Protokoll: Der Server loggt sich nur bei stderr an.

Fehler tragen niemals den API-Schlüssel: Jeder Tool-Fehler durchläuft die gleiche Maskierung wie das SDK.
