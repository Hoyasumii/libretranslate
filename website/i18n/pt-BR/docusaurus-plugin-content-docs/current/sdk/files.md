---
sidebar_position: 3
title: Arquivos
description: "Traduzir documentos inteiros: enviar um arquivo, baixar a tradução e os formatos que uma instância aceita."
---

# Arquivos

Uma instância pode traduzir documentos inteiros: texto puro, documentos de escritório, legendas, e-books e mais. Os
formatos aceitos estão em `settings().supportedFilesFormat` (ex.: `.txt`, `.docx`, `.pptx`, `.odt`, `.epub`, `.srt`,
`.pdf`), e `settings().filesTranslation` diz se o recurso está habilitado.

## Envio e download

```ts
import { readFile, writeFile } from "node:fs/promises";

const data = await readFile("relatorio.docx");
const { translatedFileUrl } = await lt.translateFile({
  file: new Blob([data]),
  filename: "relatorio.docx",
  source: "pt",
  target: "en",
});

const translated = await lt.downloadFile(translatedFileUrl);
await writeFile(translated.filename, translated.data);
```

- `file` é um `Blob` ou um `File`. Um `File` traz o próprio nome; um `Blob` precisa de `filename`, porque a instância
  escolhe o formato pela extensão.
- `source` tem `auto` como padrão.
- `translateFile` responde a URL de onde a instância serve o resultado. `downloadFile` a busca como
  `{ data: Uint8Array, filename, contentType }`, com `filename` vindo do `Content-Disposition` do servidor.

Uma extensão não suportada ou o recurso desabilitado respondem 400 (`LibreTranslateApiError`).

A partir de um agente de IA, `libretranslate_translate_file` faz tudo isso a partir de um caminho local e salva o
resultado ao lado (veja [Ferramentas](../mcp/tools.md)).
