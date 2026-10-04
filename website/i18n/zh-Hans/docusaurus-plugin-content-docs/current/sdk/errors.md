---
sidebar_position: 4
title: 错误
description: "Libre TranslateApiError 和其他错误类,状态为实例答案,以及API密钥是如何蒙蔽的."
---

# 错误

| 类                           | 何时                         |
| ---------------------------- | ---------------------------- |
| `LibreTranslateApiError`     | 非-2xx的答复                 |
| `LibreTranslateConfigError`  | 无效的配置: 缺少或错误的 URL |
| `LibreTranslateTimeoutError` | 内部无答复 `timeoutMs`       |

`LibreTranslateApiError` 携带 `status`, (中文). `method`, (中文). `path` (没有查询字符串)和回复 `body`。 。 。 。 LibreTranslate 回答错误为
`{ "error": "<message>" }`,而该消息是错误的。

| 状态 | 通常情况下                             |
| ---- | -------------------------------------- |
| 400  | 需要缺少或无效参数、不支持的文件或密钥 |
| 403  | API 密钥无效, 或客户端被禁止           |
| 429  | 过多的请求: 等待和重试                 |
| 500  | 翻译失败                               |

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

## API 密钥从未显示

每个错误的信息和 `body` 穿过 `redact`: 诸如 `api_key` 成为 `***`,客户端自己的密钥的任何字面发生,字符串内部也一样。 `redact` 为您自己的日志导出 :

```ts
import { redact } from "@hoyasumii/libretranslate";

console.log(redact(payload, [process.env.LIBRETRANSLATE_API_KEY!]));
```
