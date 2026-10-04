---
sidebar_position: 3
title: 文件
description: "翻譯整份文件: 上傳檔案, 下載翻譯, 以及實體接受的格式 。"
---

# 文件

一例可以翻譯整份文件:純文本、辦公室文件、字幕、电子書等等。 它接受的格式在 `settings().supportedFilesFormat` (e.g. `.txt`, `.docx`, `.pptx`, `.odt`,
`.epub`, `.srt`, `.pdf`),和 `settings().filesTranslation` 表示是否啟用 。

## 上傳和下載

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

- `file` 是 `Blob` 或 `File`. A `File` 帶來自己的名稱; a `Blob` 需要 `filename`,因為實體會從延伸區選取格式。
- `source` 預設為 `auto`.
- `translateFile` 解答實體服務的 URL 結果 。 `downloadFile` 取作 `{ data: Uint8Array, filename, contentType }`, `filename` 來自伺服器的
  `Content-Disposition`.

不支援的扩展名或已關閉的功能回答 400 (S)`LibreTranslateApiError`).

從一個AI探員, `libretranslate_translate_file` 將這些都從本地路徑上移出,並儲存其旁的結果(參見 [工具](../mcp/tools.md)).
