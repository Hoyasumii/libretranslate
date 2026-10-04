---
sidebar_position: 3
title: Akten
description: "Ganze Dokumente übersetzen: eine Datei hochladen, die Übersetzung herunterladen und die Formate, die eine Instanz akzeptiert."
---

# Akten

Eine Instanz kann ganze Dokumente übersetzen: Klartext, Bürodokumente, Untertitel, E-Books und mehr. Die Formate, die es
akzeptiert, sind in `settings().supportedFilesFormat` ()e.g. `.txt`, `.docx`, `.pptx`, `.odt`, `.epub`, `.srt`, `.pdf`,
und `settings().filesTranslation` Sagt, ob es überhaupt möglich ist.

## Upload und Download

```ts
import { readFile, writeFile } from "node:fs/promises";

const data = await readFile("report.docx");
const { translatedFileUrl } = await lt.translateFile({
  file: new Blob([data]),
  filename: "report.docx",
  source: "en",
  target: "pt",
});

const translated = await lt.downloadFile(translatedFileUrl);
await writeFile(translated.filename, translated.data);
```

- `file` ist eine `Blob` oder eine `File`A `File` bringt seinen eigenen Namen; a `Blob` Bedürfnisse `filename`, weil die
  Instanz das Format durch die Erweiterung auswählt.
- `source` Ausfälle bis `auto`.
- `translateFile` beantwortet die URL, aus der die Instanz das Ergebnis liefert. `downloadFile` fetzt es als
  `{ data: Uint8Array, filename, contentType }`, `filename` vom Server kommend `Content-Disposition`.

Eine nicht unterstützte Erweiterung oder ein deaktiviertes Feature antwortet 400 ()`LibreTranslateApiError`.

Von einem KI-Agenten, `libretranslate_translate_file` tut dies alles von einem lokalen Pfad und speichert das Ergebnis
daneben (siehe [Werkzeuge](../mcp/tools.md).
