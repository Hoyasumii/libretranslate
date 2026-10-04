---
sidebar_position: 3
title: Ficheiros
description: "Traduzindo documentos inteiros: carregando um arquivo, baixando a tradução e os formatos que uma instância aceita."
---

# Ficheiros

Uma instância pode traduzir documentos inteiros: texto simples, documentos de escritório, legendas, e-books e muito
mais. Os formatos que aceita estão em `settings().supportedFilesFormat` (e.g. `.txt`, `.docx`, `.pptx`, `.odt`, `.epub`,
`.srt`, `.pdf`), e `settings().filesTranslation` diz se está habilitado em tudo.

## Enviar e transferir

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

- `file` é um `Blob` ou a `File`. A `File` traz seu próprio nome; a `Blob` necessidades `filename`, porque a instância
  escolhe o formato pela extensão.
- `source` por omissão a `auto`.
- `translateFile` responde ao URL de onde a instância serve o resultado. `downloadFile` obtém- a como
  `{ data: Uint8Array, filename, contentType }`, `filename` vindo do servidor `Content-Disposition`.

Uma extensão não suportada ou uma funcionalidade desactivada responde 400 (`LibreTranslateApiError`).

De um agente de IA, `libretranslate_translate_file` faz tudo isto a partir de um caminho local e salva o resultado ao
seu lado (ver [Ferramentas](../mcp/tools.md)).
