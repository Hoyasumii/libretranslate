---
sidebar_position: 5
title: Konfiguration
description: "Die Einstellungen, die der Server und die CLI lesen, wo sie gespeichert sind, und die Reihenfolge, in der sie aufgelöst werden."
---

# Konfiguration

Jede Einstellung kommt von einem Flag, dann die Umgebung, dann die Datei `libretranslate mcp config` Gespeichert, dann
der Default.

| Variabel                 | Was ist                                                              | Ausfall                 |
| ------------------------ | -------------------------------------------------------------------- | ----------------------- |
| `LIBRETRANSLATE_URL`     | Die Instanz URL                                                      | `http://localhost:5000` |
| `LIBRETRANSLATE_API_KEY` | Der API-Schlüssel, zum Beispiel Instanzen, die Schlüssel ausgeben    | nicht                   |
| `PORT`                   | Der HTTP-Port                                                        | `3768`                  |
| `LIBRETRANSLATE_CONFIG`  | Wo die gespeicherte Konfiguration lebt (auch) `--config`)            | siehe unten             |
| `LIBRETRANSLATE_MCP_URL` | Für die CLI: ein Laufen `libretranslate-mcp` zu verwenden ()`--url`) | In-Prozess-Server       |

Eine selbst gehostete Instanz benötigt normalerweise keinen Schlüssel. Eine gehostete, wie libretranslate.com, tut: ohne
es jede Übersetzung Antworten 400. `libretranslate status` Sagt was.

## Wo es gerettet wird

- `~/.config/libretranslate/.env` auf Linux;
- `~/Library/Application Support/libretranslate/.env` auf macOS;
- `%APPDATA%\libretranslate\.env` unter Windows;
- oder wo auch immer `LIBRETRANSLATE_CONFIG`/`--config` Punkte.

Die Datei wird im Modus 0600 geschrieben (unter Windows schützt die ACL des Ordners sie).

Der API-Schlüssel wird niemals in Fehlern, Protokollen, `--help` oder das Konfigurationsformular.
