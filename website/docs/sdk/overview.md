---
sidebar_position: 1
title: Overview
description: "The LibreTranslate client: its options, its methods, and how it is generated from the OpenAPI spec by orval."
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

`baseUrl` is the instance URL, with its base path if it has one (`https://example.com/translate`).
`createLibreTranslateClientFromEnv()` reads `LIBRETRANSLATE_URL` (default `http://localhost:5000`) and
`LIBRETRANSLATE_API_KEY`.

## Options

| Option      | What for                                                                      |
| ----------- | ----------------------------------------------------------------------------- |
| `baseUrl`   | The instance URL (required)                                                   |
| `apiKey`    | The API key, for instances that issue keys; sent in the body of every request |
| `timeoutMs` | Timeout per request, default 60000; `0` or `Infinity` turn it off             |
| `fetch`     | An alternative `fetch` (tests, a proxy)                                       |

Every method also takes a last `{ signal }` argument, to cancel the call with an `AbortSignal`.

## Methods

| Method                                                      | What for                                                        |
| ----------------------------------------------------------- | --------------------------------------------------------------- |
| `translate({ q, source?, target, format?, alternatives? })` | One text ([Translation](./translation.md))                      |
| `translateMany({ q: string[], … })`                         | Several texts in one request                                    |
| `detect(text)`                                              | The candidate languages, most likely first                      |
| `languages()`                                               | Every source language, with the codes it translates into        |
| `translateFile({ file, filename?, source?, target })`       | Upload a document ([Files](./files.md))                         |
| `downloadFile(url)`                                         | Download a translated file as bytes                             |
| `suggest({ q, s, source, target })`                         | Send a better translation back (when the instance accepts them) |
| `settings()`                                                | Key required, character limit, file formats, suggestions        |
| `health()`                                                  | `{ status: "ok" }` when the instance is up                      |
| `call(operationId, body?)`                                  | Any operation by its `operationId`, with the raw body           |

A non-2xx answer becomes a `LibreTranslateApiError` (see [Errors](./errors.md)).

## How it is generated

The package keeps its own OpenAPI 3.1 description of the API in `spec/openapi.yml`, written from the public API
documentation. [orval](https://orval.dev) turns it into:

- `src/generated/endpoints.ts`: one function per operation, all sending through the package's own `fetch` wrapper,
  which adds the base URL, the timeout and the error handling;
- `src/generated/model/`: the request and response types (`TranslateRequest`, `Detection`, `FrontendSettings`, …),
  exported from the package;
- `src/generated/zod.ts`: zod schemas of every request, which the MCP tools use as their inputs.

The client above wraps those functions with defaults (`source: "auto"`) and the API key. For every exported type and
function, see the [API reference](pathname://../../docs/api).
