---
sidebar_position: 4
title: Errors
description: "LibreTranslateApiError and the other error classes, the statuses an instance answers, and how the API key is masked."
---

# Errors

| Class                        | When                                              |
| ---------------------------- | ------------------------------------------------- |
| `LibreTranslateApiError`     | A non-2xx response                                |
| `LibreTranslateConfigError`  | Invalid configuration: a missing or malformed URL |
| `LibreTranslateTimeoutError` | No response within `timeoutMs`                    |

`LibreTranslateApiError` carries `status`, `method`, `path` (without the query string) and the response `body`.
LibreTranslate answers errors as `{ "error": "<message>" }`, and that message is the error's.

| Status | Usually                                                                   |
| ------ | ------------------------------------------------------------------------- |
| 400    | A missing or invalid parameter, an unsupported file, or a key is required |
| 403    | The API key is invalid, or the client is banned                           |
| 429    | Too many requests: wait and retry                                         |
| 500    | The translation failed on the instance                                    |

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

## The API key never shows

Every error's message and `body` go through `redact`: the values of keys such as `api_key` become `***`, and so
does any literal occurrence of the client's own key, inside strings too. `redact` is exported for your own logs:

```ts
import { redact } from "@hoyasumii/libretranslate";

console.log(redact(payload, [process.env.LIBRETRANSLATE_API_KEY!]));
```
