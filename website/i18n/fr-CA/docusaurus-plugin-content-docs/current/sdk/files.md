---
sidebar_position: 3
title: Fichiers
description: "Traduire des documents entiers : télécharger un fichier, télécharger la traduction, et les formats qu'une instance accepte."
---

# Fichiers

Une instance peut traduire des documents entiers : texte simple, documents de bureau, sous-titres, livres électroniques
et plus encore. Les formats qu'il accepte sont dans `settings().supportedFilesFormat` (e.g. `.txt`, `.docx`, `.pptx`,
`.odt`, `.epub`, `.srt`, `.pdf`), et `settings().filesTranslation` dit s'il est activé du tout.

## Télécharger et télécharger

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

- `file` est `Blob` ou une `File`. A `File` apporte son propre nom; `Blob` besoins `filename`, parce que l'instance
  choisit le format par l'extension.
- `source` par défaut à `auto`.
- `translateFile` répond à l'URL dont l'instance sert le résultat. `downloadFile` le récupérer comme
  `{ data: Uint8Array, filename, contentType }`, `filename` venant du serveur `Content-Disposition`.

Une extension non supportée ou une fonctionnalité désactivée répond à 400 (`LibreTranslateApiError`) .

D'un agent de l'IA, `libretranslate_translate_file` fait tout cela à partir d'un chemin local et enregistre le résultat
à côté (voir [Outils](../mcp/tools.md)) .
