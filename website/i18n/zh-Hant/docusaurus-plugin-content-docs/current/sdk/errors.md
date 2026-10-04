---
sidebar_position: 4
title: 錯誤
description: "LibreTranslateApiError 和其他錯誤類別, 狀態為實驗答案, 以及 API 金鑰是如何被遮掩的 。"
---

# 錯誤

| 類別                         | 什麼時候                       |
| ---------------------------- | ------------------------------ |
| `LibreTranslateApiError`     | 非-2xx 回复                    |
| `LibreTranslateConfigError`  | 不合法的設定: 缺少或錯誤的 URL |
| `LibreTranslateTimeoutError` | 內部沒有回應 `timeoutMs`       |

`LibreTranslateApiError` 載 `status`, `method`, `path` (沒有查詢字串)和回覆 `body`. LibreTranslate 回答錯誤為
`{ "error": "<message>" }`,那封信是錯誤的。

| 狀態 | 通常                                    |
| ---- | --------------------------------------- |
| 400  | 缺少或無效參數、 不支援的檔案或金鑰需要 |
| 403  | API 金鑰不合法, 或是禁止客戶端          |
| 429  | 太多的要求: 等待和重試                  |
| 500  | 翻譯失敗                                |

```ts
import { LibreTranslateApiError } from "@hoyasumii/libretranslate";

try {
  await lt.translate({ q: "Olá", target: "en" });
} catch (error) {
  if (error instanceof LibreTranslateApiError && error.status === 429) {
    // back off and retry
  } else throw error;
}
```

## API 金鑰從未顯示

每一個錯誤的訊息和 `body` 過去 `redact`: 金鑰的數值, 例如 `api_key` 成為 `***`, 任何字面上的客戶端的金鑰發生, 內線也一樣 。 `redact` 匯出為您自己的紀錄 :

```ts
import { redact } from "@hoyasumii/libretranslate";

console.log(redact(payload, [process.env.LIBRETRANSLATE_API_KEY!]));
```
