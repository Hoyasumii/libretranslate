---
sidebar_position: 4
title: Generische Werkzeuge
description: "libretranslate_resources, libretranslate_describe und libretranslate_call: roh LibreTranslate API, Operation by Operation."
---

# Generische Werkzeuge

Die kuratierten Tools decken ab, was ein Agent normalerweise braucht. Drei weitere erreichen die rohe API, Operation für
Operation, wie es die Spezifikation beschreibt:

1. **`libretranslate_resources`** listet die Operationen ()`translate`, `detect`, `listLanguages`,
   `getFrontendSettings`, `suggest`, `health`. mit a `query`Nur die passenden.
2. **`libretranslate_describe`** gibt Methode, Pfad, Körperschema und ein Beispiel einer Operation `libretranslate_call`
   Input. mit `schema`, erweitert es ein Schema aus der Spezifikation (`depth` Pegeltiefe, Standardwert 3.
3. **`libretranslate_call`** läuft es: `operation` ist `operationId` ()`listLanguages`) oder `METHOD /path`
   ()`GET /languages`, und `body` ist die JSON Request Body.

```json
{ "operation": "translate", "body": { "q": "Olá", "source": "pt", "target": "en", "alternatives": 2 } }
```

## Sicherheit

- Unbekannte Körperfelder werden abgelehnt, so dass ein Tippfehler eine Einstellung nicht stillschweigend fallen lässt.
- `api_key` wird abgelehnt: Der Server sendet den konfigurierten Schlüssel selbst, und die Schemas lassen ihn aus.
- Operationen, die an die Instanz schreiben ()`suggest`) Bedarf `confirm: true`Der Agent wird aufgefordert, Sie zuerst
  zu fragen.
- Datei-Upload wird aus dem Katalog ausgelassen: `libretranslate_translate_file` deckt es von einem lokalen Pfad ab.
- Eine lange Antwort wird auf 60.000 Zeichen geschnitten, so zu sagen.

Der Katalog wird aus der gleichen OpenAPI-Spezifikation wie das SDK generiert.`pnpm codegen:mcp`.
