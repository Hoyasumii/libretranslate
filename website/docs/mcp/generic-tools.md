---
sidebar_position: 4
title: Generic tools
description: "libretranslate_resources, libretranslate_describe and libretranslate_call: the raw LibreTranslate API, operation by operation."
---

# Generic tools

The curated tools cover what an agent usually needs. Three more reach the raw API, operation by operation, as the
spec describes it:

1. **`libretranslate_resources`** lists the operations (`translate`, `detect`, `listLanguages`,
   `getFrontendSettings`, `suggest`, `health`). With a `query`, only the matching ones.
2. **`libretranslate_describe`** gives one operation's method, path, body schema and an example
   `libretranslate_call` input. With `schema`, it expands one schema from the spec (`depth` levels deep, default 3).
3. **`libretranslate_call`** runs it: `operation` is the `operationId` (`listLanguages`) or `METHOD /path`
   (`GET /languages`), and `body` is the JSON request body.

```json
{ "operation": "translate", "body": { "q": "Olá", "source": "pt", "target": "en", "alternatives": 2 } }
```

## Safety

- Unknown body fields are refused, so a typo does not silently drop a setting.
- `api_key` is refused: the server sends the configured key itself, and the schemas leave it out.
- Operations that write to the instance (`suggest`) need `confirm: true`. The agent is told to ask you first.
- File upload is left out of the catalog: `libretranslate_translate_file` covers it from a local path.
- A long answer is cut at 60,000 characters, saying so.

The catalog is generated from the same OpenAPI spec as the SDK (`pnpm codegen:mcp`).
