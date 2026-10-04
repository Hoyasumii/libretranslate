---
sidebar_position: 3
title: Files
description: "Translating whole documents: uploading a file, downloading the translation, and the formats an instance accepts."
---

# Files

An instance can translate whole documents: plain text, office documents, subtitles, e-books and more. The formats it
accepts are in `settings().supportedFilesFormat` (e.g. `.txt`, `.docx`, `.pptx`, `.odt`, `.epub`, `.srt`, `.pdf`), and
`settings().filesTranslation` says whether it is enabled at all.

## Upload and download

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

- `file` is a `Blob` or a `File`. A `File` brings its own name; a `Blob` needs `filename`, because the instance
  picks the format by the extension.
- `source` defaults to `auto`.
- `translateFile` answers the URL the instance serves the result from. `downloadFile` fetches it as
  `{ data: Uint8Array, filename, contentType }`, `filename` coming from the server's `Content-Disposition`.

An unsupported extension or a disabled feature answers 400 (`LibreTranslateApiError`).

From an AI agent, `libretranslate_translate_file` does all of this from a local path and saves the result beside it
(see [Tools](../mcp/tools.md)).
