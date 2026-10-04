---
sidebar_position: 1
title: Übersicht
description: "Die LibreTranslate Client: seine Optionen, seine Methoden und wie es aus der OpenAPI-Spezifikation generiert wird orval."
---

# SDK

```ts
import { createLibreTranslateClient } from "@hoyasumii/libretranslate";

const lt = createLibreTranslateClient({
  baseUrl: "https://libretranslate.example.com",
  apiKey: process.env.LIBRETRANSLATE_API_KEY, // only for instances that issue keys
});

const { translatedText } = await lt.translate({ q: "Bom dia", source: "pt", target: "en" });
const languages = await lt.languages();
const settings = await lt.settings();
```

`baseUrl` ist die Instanz-URL mit ihrem Basispfad, wenn sie einen hat ()`https://example.com/translate`.
`createLibreTranslateClientFromEnv()` Lesewerte `LIBRETRANSLATE_URL` (Standard) `http://localhost:5000`) und
`LIBRETRANSLATE_API_KEY`.

## Optionen

| Option      | Was ist                                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------------------- |
| `baseUrl`   | Die Instanz URL (erforderlich)                                                                          |
| `apiKey`    | Der API-Schlüssel, zum Beispiel Instanzen, die Schlüssel ausgeben; gesendet im Textkörper jeder Anfrage |
| `timeoutMs` | Timeout per Request, standardmäßig 60000; `0` oder `Infinity` Schalten Sie es aus                       |
| `fetch`     | Eine Alternative `fetch` (Tests, ein Proxy)                                                             |

Jede Methode nimmt auch eine letzte `{ signal }` um den Anruf mit einem `AbortSignal`.

## Methoden

| Methode                                                     | Was ist                                                                      |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `translate({ q, source?, target, format?, alternatives? })` | Ein Text ()[Übersetzung](./translation.md))                                  |
| `translateMany({ q: string[], … })`                         | Mehrere Texte in einer Anfrage                                               |
| `detect(text)`                                              | Die Kandidatensprachen, höchstwahrscheinlich zuerst                          |
| `languages()`                                               | Jede Ausgangssprache, mit den Codes, in die sie übersetzt wird               |
| `translateFile({ file, filename?, source?, target })`       | Ein Dokument hochladen ()[Akten](./files.md))                                |
| `downloadFile(url)`                                         | Laden Sie eine übersetzte Datei als Bytes herunter                           |
| `suggest({ q, s, source, target })`                         | Senden Sie eine bessere Übersetzung zurück (wenn die Instanz sie akzeptiert) |
| `settings()`                                                | Erforderlicher Schlüssel, Zeichenlimit, Dateiformate, Vorschläge             |
| `health()`                                                  | `{ status: "ok" }` Wenn die Instanz up ist                                   |
| `call(operationId, body?)`                                  | Jede Operation durch seine `operationId`, mit dem Rohkörper                  |

Eine Nicht-2xx-Antwort wird zu einer `LibreTranslateApiError` (siehe) [Fehler](./errors.md).

## Wie es erzeugt wird

Das Paket behält sein eigenes OpenAPI 3.1 Beschreibung der API in `spec/openapi.yml`, geschrieben aus der öffentlichen
API-Dokumentation. [orval](https://orval.dev) verwandelt es in:

- `src/generated/endpoints.ts`: eine Funktion pro Operation, die alle über das eigene Paket senden `fetch` Wrapper, der
  die Basis-URL, den Timeout und die Fehlerbehandlung hinzufügt;
- `src/generated/model/`: die Anforderungs- und Antworttypen ()`TranslateRequest`, `Detection`, `FrontendSettings`, ...,
  aus dem Packstück ausgeführt werden;
- `src/generated/zod.ts`: zod Schemata jeder Anforderung, die die MCP-Tools als Eingaben verwenden.

Der Client oben wickelt diese Funktionen mit Standardwerten ()`source: "auto"`) und den API-Schlüssel. Für jeden
exportierten Typ und Funktion, siehe die [API-Referenz](pathname://../../docs/api).
