---
sidebar_position: 1
title: 概述
description: "其 LibreTranslate 客戶端: 它的選項、 方法、 以及它是如何從 OpenAPI spec 產生的 。 orval."
---

# SDK

```ts
import { createLibreTranslateClient } from "@hoyasumii/libretranslate";

const lt = createLibreTranslateClient({
  baseUrl: "https://libretranslate.example.com",
  apiKey: process.env.LIBRETRANSLATE_API_KEY, // only for instances that issue keys
});

const { translatedText } = await lt.translate({ q: "Bom dia", source: "pt", target: "en" });
const languages = await lt.languages();
const settings = await lt.settings();
```

`baseUrl` 是實體 URL, 如果它有它的基准路徑( N)`https://example.com/translate`). `createLibreTranslateClientFromEnv()` 已讀
`LIBRETRANSLATE_URL` (默认) `http://localhost:5000`和 `LIBRETRANSLATE_API_KEY`.

## 選項

| 選擇        | 為什麼                                               |
| ----------- | ---------------------------------------------------- |
| `baseUrl`   | 實例網址( 需要)                                      |
| `apiKey`    | API 金鑰, 用于發出金鑰的事件; 在每個要求的正文中傳送 |
| `timeoutMs` | 每件要求超時, 預設 60000 ; `0` 或 `Infinity` 關掉    |
| `fetch`     | 替代方案 `fetch` (測試,代理)                         |

每一種方法都要最後一個 `{ signal }` 參數,以 a `AbortSignal`.

## 方法

| 方法                                                        | 為什麼                                |
| ----------------------------------------------------------- | ------------------------------------- |
| `translate({ q, source?, target, format?, alternatives? })` | 一文([翻譯](./translation.md))        |
| `translateMany({ q: string[], … })`                         | 一份请求书中的几份案文                |
| `detect(text)`                                              | 最有可能的候選語言                    |
| `languages()`                                               | 每種來源語言都有它翻譯成的代碼        |
| `translateFile({ file, filename?, source?, target })`       | 上傳文件( E)[文件](./files.md))       |
| `downloadFile(url)`                                         | 以位元組下載已翻譯的檔案              |
| `suggest({ q, s, source, target })`                         | 送回更好的翻譯( 當實驗體接受時)       |
| `settings()`                                                | 需要按鍵、 字元限制、 檔案格式、 建議 |
| `health()`                                                  | `{ status: "ok" }` 當案件發生時       |
| `call(operationId, body?)`                                  | 任何操作 `operationId`与生体          |

非-2xx的答案變成 `LibreTranslateApiError` (看 [錯誤](./errors.md)).

## 如何生成

套件保留自己的 OpenAPI 3.1 API 描述 `spec/openapi.yml`來自公共API文件 [orval](https://orval.dev) 變成:

- `src/generated/endpoints.ts`: 每次操作都有一個函數, 所有函數都通過套件本身傳送 `fetch` 包裝器, 新增基址、 超時及錯誤處理 ;
- `src/generated/model/`: 要求和回覆型態(`TranslateRequest`, `Detection`, `FrontendSettings`, ),由套件匯出;
- `src/generated/zod.ts`: zod MCP 工具使用的每個要求的計劃。

上面的客戶端用預設值來包裝這些函數( U)`source: "auto"`)和API金鑰。 每個匯出型態及函數, 請參考 [API 參考](pathname://../../docs/api).
