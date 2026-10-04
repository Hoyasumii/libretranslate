---
sidebar_position: 1
title: 概览
description: "那个 LibreTranslate 客户端:它的选项、方法以及它是如何从 OpenAPI 光谱中生成的 orval。 。 。 。"
---

# SDK 软件

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

`baseUrl` 是实例 URL,如果有其基准路径( )`https://example.com/translate`) (中文(简体) ). `createLibreTranslateClientFromEnv()` 读取
`LIBRETRANSLATE_URL` (默认) `http://localhost:5000`和(或) `LIBRETRANSLATE_API_KEY`。 。 。 。

## 选项

| 选项        | 为什么                                             |
| ----------- | -------------------------------------------------- |
| `baseUrl`   | 实例 URL( 需要)                                    |
| `apiKey`    | API 密钥, 用于发出密钥的事件; 在每项请求正文中发送 |
| `timeoutMs` | 每个请求的超时,默认为60000; `0` 或 `Infinity` 关掉 |
| `fetch`     | 替代品 `fetch` (测试,一个代理)                     |

每一种方法都得用最后一个 `{ signal }` 参数,用 `AbortSignal`。 。 。 。

## 方法

| 方法                                                        | 为什么                                   |
| ----------------------------------------------------------- | ---------------------------------------- |
| `translate({ q, source?, target, format?, alternatives? })` | 一个文本( E)[翻译](./translation.md)页:1 |
| `translateMany({ q: string[], … })`                         | 一项请求中的几项案文                     |
| `detect(text)`                                              | 候选语言,最有可能是                      |
| `languages()`                                               | 每一个源语言,都有它翻译的代码            |
| `translateFile({ file, filename?, source?, target })`       | 上传文档( E)[文件](./files.md)页:1       |
| `downloadFile(url)`                                         | 以字节下载翻译文件                       |
| `suggest({ q, s, source, target })`                         | 寄回更好的翻译( 当实例接受时)            |
| `settings()`                                                | 需要的密钥、 字符限制、 文件格式、 建议  |
| `health()`                                                  | `{ status: "ok" }` 当案件发生时          |
| `call(operationId, body?)`                                  | 其任何业务 `operationId`,与生体          |

非-2xx的回答变成 `LibreTranslateApiError` (见 [错误](./errors.md)) (中文(简体) ).

## 如何产生

软件包保存自己的 OpenAPI 3.1 描述 API 在 `spec/openapi.yml`,从公开的API文档中写入. [orval](https://orval.dev) 变成:

- `src/generated/endpoints.ts`:每次操作一个函数,全部通过软件包本身发送 `fetch` 包装器,用于添加基址、超时和错误处理;
- `src/generated/model/`: 请求和答复类型(`TranslateRequest`, (中文). `Detection`, (中文). `FrontendSettings`从包件中导出;
- `src/generated/zod.ts`编号 : zod 每个请求的计谋, MCP 工具作为输入使用.

上面的客户端以默认方式将这些函数包起来( )`source: "auto"`)和API键. 对于每个导出类型和函数,请参见 [API 参考](pathname://../../docs/api)。 。 。 。
