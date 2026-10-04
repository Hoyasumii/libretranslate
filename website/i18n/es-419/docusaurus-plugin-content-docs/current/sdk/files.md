---
sidebar_position: 3
title: Archivos
description: "Traducir documentos completos: cargar un archivo, descargar la traducción, y los formatos que una instancia acepta."
---

# Archivos

Una instancia puede traducir documentos completos: texto llano, documentos de oficina, subtítulos, libros electrónicos y
más. Los formatos que acepta están en `settings().supportedFilesFormat` (G)e.g. `.txt`, `.docx`, `.pptx`, `.odt`,
`.epub`, `.srt`, `.pdf`), y `settings().filesTranslation` dice si está habilitado para nada.

## Subir y descargar

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

- `file` es un `Blob` o a `File`A `File` trae su propio nombre; a `Blob` necesidades `filename`, porque la instancia
  elige el formato por la extensión.
- `source` predeterminados a `auto`.
- `translateFile` responde a la URL de la instancia que sirve el resultado. `downloadFile` lo pica como
  `{ data: Uint8Array, filename, contentType }`, `filename` procedente del servidor `Content-Disposition`.

Una extensión sin soporte o una característica discapacitada responde 400 (`LibreTranslateApiError`).

De un agente de inteligencia artificial, `libretranslate_translate_file` hace todo esto desde un camino local y salva el
resultado a su lado (ver [Herramientas](../mcp/tools.md)).
