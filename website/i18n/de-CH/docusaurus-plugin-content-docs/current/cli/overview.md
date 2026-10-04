---
sidebar_position: 1
title: CLI Überblick
description: "Der Befehl libretranslate: jedes MCP-Tool als Unterbefehl, mit dem Eingabeschema des Tools als Flags."
---

# CLI

Das Paket installiert eine `libretranslate` Kommando. Es ist ein MCP-Client des
[Der gleiche Server](../mcp/overview.md)Jedes MCP-Tool wird zu einem Unterbefehl und das Eingabeschema des Tools wird zu
seinen Flags. Standardmäßig läuft der Server innerhalb des Befehls, so dass nichts zuerst gestartet werden muss.

```bash
npx libretranslate mcp config                          # once: the instance URL and, if it issues keys, an API key
npx libretranslate tools                               # every command, one per MCP tool
npx libretranslate status
npx libretranslate translate --q "Olá, mundo!" --target en
npx libretranslate translate --q '["Bom dia","Boa noite"]' --source pt --target es
npx libretranslate translate --q "<b>Olá</b>" --target en --format html --alternatives 2
npx libretranslate translate-file --path report.docx --target pt
npx libretranslate detect --q "Bonjour tout le monde"
npx libretranslate languages --source pt
npx libretranslate call --operation getFrontendSettings
```

Nichts als `--help`, `--version`, `libretranslate docs`, `libretranslate mcp config` und `libretranslate mcp uninstall`
läuft, bis eine Konfiguration mit einer URL gespeichert ist. `libretranslate docs` druckt den Link zu dieser Website aus
und öffnet ihn im Browser.

## Von Werkzeugen zu Befehlen

- Der Befehl ist der Name des Tools ohne `libretranslate_`, im Kebab-Fall: `libretranslate_translate_file` →
  `translate-file`.
- Jedes Flag ist eine Eingabe im Kebab-Fall.
- Array Flags nehmen `a,b` oder JSON, Objekt-Flags nehmen JSON und boolesche Flags brauchen keinen Wert.
- `libretranslate <command> --help` listet die Flags eines Kommandos mit den zulässigen Werten der Enum-Eingaben auf.

Die Werkzeugausgabe geht auf stdout. Ein Tool Error geht an Stderr mit Exit Code 1.

## Einmalige Einstellungen und ein laufender Server

`--base-url` und `--api-key` Überschreiben Sie die Umgebung und die gespeicherte Datei für einen Lauf des
In-Prozess-Servers. Zu verwenden a `libretranslate-mcp` das stattdessen bereits über HTTP läuft, pass
`--url http://127.0.0.1:3768/mcp` oder eingestellt `LIBRETRANSLATE_MCP_URL`Diese Flags funktionieren überall in der
Kommandozeile.

Keiner von ihnen steht für die gespeicherte Konfiguration: Die CLI weigert sich, Werkzeuge ohne sie auszuführen, auch
wenn `--url` oder `--base-url` gegeben ist.

## Eine lokale Instanz

Mit Docker installiert, `libretranslate service up` Läufe LibreTranslate in einem Container und zeigt die CLI darauf.
Siehe [`libretranslate service`](./service.md).

## Verwalten des Servers

`libretranslate mcp` abgefangen wird, bevor eine Verbindung hergestellt wird. Es konfiguriert den Server, führt ihn im
Hintergrund aus, startet ihn beim Login und registriert ihn in Ihren MCP-Clients. Siehe
[`libretranslate mcp`](./mcp-commands.md).
