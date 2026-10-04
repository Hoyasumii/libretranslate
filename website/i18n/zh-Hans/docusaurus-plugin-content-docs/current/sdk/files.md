---
sidebar_position: 3
title: 文件
description: "翻译整个文档:上传文件,下载翻译,一个实例接受的格式."
---

# 文件

一个实例可以翻译整个文件:纯文本、办公室文件、字幕、电子书籍等等。 它接受的格式为: `settings().supportedFilesFormat` (单位:千美元)e.g。 。 。 。 `.txt`, (中文). `.docx`,
(中文). `.pptx`, (中文). `.odt`, (中文). `.epub`, (中文). `.srt`, (中文). `.pdf`),以及 `settings().filesTranslation` 说明是否启用 。

## 上传和下载

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

- `file` 是一个 `Blob` 或一个 `File`A级 `File` 带来自己的名字; a `Blob` 需求 `filename`,因为实例通过扩展选择格式。
- `source` 默认为 `auto`。 。 。 。
- `translateFile` 解答实例为结果服务的 URL 。 `downloadFile` 把它当作 `{ data: Uint8Array, filename, contentType }`, (中文). `filename`
  来自服务器的 `Content-Disposition`。 。 。 。

不支持的扩展名或禁用特性答案 400(`LibreTranslateApiError`) (中文(简体) ).

从AI特工, `libretranslate_translate_file` 将这一切从本地路径进行,并保存其旁的结果(见 [工具](../mcp/tools.md)) (中文(简体) ).
