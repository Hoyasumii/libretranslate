---
sidebar_position: 3
title: Werkzeuge
description: "Die kuratierten MCP-Tools: Texte und Dateien übersetzen, Sprachen erkennen, auflisten, den Instanzstatus und Vorschläge."
---

# Werkzeuge

Ihre Inputs sind die zod Schemata orval generiert aus der Spezifikation, so dass der Agent die gleichen Felder, Enums
und Defaults wie das SDK sieht.

## `libretranslate_translate`

Übersetzt einen Text oder eine Liste in einem Aufruf.

| Input          | Was ist                                                       |
| -------------- | ------------------------------------------------------------- |
| `q`            | Der Text oder eine Liste von Texten                           |
| `target`       | Der Zielsprachencode                                          |
| `source`       | den Quellsprachencode; `auto` (der Standard) erkennt es       |
| `format`       | `text` (Standard) oder `html`, die das Markup behält          |
| `alternatives` | Wie viele andere Übersetzungen sind hinzuzufügen (Standard 0) |

Es beantwortet die eigene Form der API: `translatedText`, plus `detectedLanguage` mit `auto` und `alternatives` wenn
gefragt.

## `libretranslate_translate_file`

Übersetzt ein lokales Dokument und speichert das Ergebnis.

| Input       | Was ist                                                                                         |
| ----------- | ----------------------------------------------------------------------------------------------- |
| `path`      | Die Datei zu übersetzen                                                                         |
| `target`    | Der Zielsprachencode                                                                            |
| `source`    | Der Quellsprachencode, `auto` Standardmäßig                                                     |
| `output`    | Wo kann man die Übersetzung speichern (Standard: neben dem Original)                            |
| `overwrite` | Ersetzen einer vorhandenen Datei (standardmäßig falsch: eine vorhandene Datei wird nie berührt) |

`report.docx` übersetzt in `pt` wird `report.pt.docx`. Es antwortet `{ savedTo, bytes, translatedFileUrl }`Der Server
liest und schreibt Dateien auf dem Computer, auf dem er läuft, mit den Berechtigungen Ihres Benutzers.

## `libretranslate_detect`

Die Kandidatensprachen des `q`, höchstwahrscheinlich zuerst, jeweils mit einem Vertrauen von 0 bis 100.

## `libretranslate_languages`

Ohne Eingabe, die Codes und Namen jeder Sprache. Wenn jede Sprache in jede andere übersetzt wird (der übliche Fall),
werden die Ziele einmal statt einmal pro Sprache aufgelistet. mit `source`Die Sprachen, in die man übersetzt.

## `libretranslate_status`

Der Zustand und die Einstellungen der Instanz in einer Antwort: ob ein API-Schlüssel erforderlich ist und ob einer
konfiguriert ist, das Zeichenlimit pro Anfrage, ob Dateiübersetzung und Vorschläge aktiviert sind und die akzeptierten
Dateiformate. Ein guter erster Anruf für einen Agenten.

## `libretranslate_suggest`

Eine korrigierte Übersetzung ()`s`) eines Textes (`q`) zurück zu der Instanz, die es behält. Der Agent wird angewiesen,
es nur zu verwenden, wenn Sie fragen, und es scheitert an Instanzen mit deaktivierten Vorschlägen.

## Fehler, auf die der Agent reagieren kann

Ein Werkzeugfehler ist Text, der sagt, was zu tun ist: eine Instanz, die eine Schlüsselantwort mit einem Hinweis
benötigt, um eine mit `libretranslate mcp config`, a 403 zeigt auf den konfigurierten Schlüssel, a 429 sagt zu warten.
Der Schlüssel selbst erscheint nie.
