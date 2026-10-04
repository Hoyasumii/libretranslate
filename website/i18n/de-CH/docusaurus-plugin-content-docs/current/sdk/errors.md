---
sidebar_position: 4
title: Fehler
description: "LibreTranslateApiError und die anderen Fehlerklassen, die Status, auf die eine Instanz antwortet und wie der API-Schlüssel maskiert ist."
---

# Fehler

| Klasse                       | Wann                                                   |
| ---------------------------- | ------------------------------------------------------ |
| `LibreTranslateApiError`     | Eine Non-2xx Antwort                                   |
| `LibreTranslateConfigError`  | Ungültige Konfiguration: fehlende oder fehlerhafte URL |
| `LibreTranslateTimeoutError` | Keine Antwort innerhalb `timeoutMs`                    |

`LibreTranslateApiError` Wagen `status`, `method`, `path` (ohne Query String) und die Antwort `body`. LibreTranslate
Antworten auf Fehler als `{ "error": "<message>" }`, und diese Nachricht ist der Fehler.

| Status | Normalerweise                                                                                              |
| ------ | ---------------------------------------------------------------------------------------------------------- |
| 400    | Ein fehlender oder ungültiger Parameter, eine nicht unterstützte Datei oder ein Schlüssel ist erforderlich |
| 403    | Der API-Schlüssel ist ungültig oder der Client ist gesperrt                                                |
| 429    | Zu viele Anfragen: warten und wiederholen                                                                  |
| 500    | Die Übersetzung scheiterte an der Instanz                                                                  |

```ts
import { LibreTranslateApiError } from "@hoyasumii/libretranslate";

try {
  await lt.translate({ q: "Olá", target: "en" });
} catch (error) {
  if (error instanceof LibreTranslateApiError && error.status === 429) {
    // back off and retry
  } else throw error;
}
```

## Der API Key wird nie angezeigt

Jede Fehlermeldung und `body` durchgehen `redact`: die Werte von Schlüsseln wie `api_key` werden `***`, ebenso wie jedes
wörtliche Auftreten des eigenen Schlüssels des Kunden, auch innerhalb von Strings. `redact` wird für Ihre eigenen Logs
exportiert:

```ts
import { redact } from "@hoyasumii/libretranslate";

console.log(redact(payload, [process.env.LIBRETRANSLATE_API_KEY!]));
```
