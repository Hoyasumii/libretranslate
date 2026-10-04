---
sidebar_position: 1
title: Visão geral
description: "A LibreTranslate cliente: suas opções, seus métodos e como ele é gerado a partir da especificação OpenAPI orval."
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

`baseUrl` é o URL da instância, com o seu caminho base se tiver um (`https://example.com/translate`).
`createLibreTranslateClientFromEnv()` leituras `LIBRETRANSLATE_URL` (padrão `http://localhost:5000`) e
`LIBRETRANSLATE_API_KEY`.

## Opções

| Opção       | Para quê?                                                                       |
| ----------- | ------------------------------------------------------------------------------- |
| `baseUrl`   | O URL da instância (obrigatório)                                                |
| `apiKey`    | A chave API, para instâncias que emitem chaves; enviada no corpo de cada pedido |
| `timeoutMs` | Tempo limite por solicitação, padrão 60000; `0` ou `Infinity` Desliga-o.        |
| `fetch`     | Uma alternativa `fetch` (testes, um proxy)                                      |

Cada método também leva um último `{ signal }` argumento, para cancelar a chamada com um `AbortSignal`.

## Métodos

| Método                                                      | Para quê?                                                               |
| ----------------------------------------------------------- | ----------------------------------------------------------------------- |
| `translate({ q, source?, target, format?, alternatives? })` | Um texto ([Tradução](./translation.md))                                 |
| `translateMany({ q: string[], … })`                         | Vários textos num único pedido                                          |
| `detect(text)`                                              | As línguas candidatas, provavelmente primeiro                           |
| `languages()`                                               | Cada língua de origem, com os códigos que traduz em                     |
| `translateFile({ file, filename?, source?, target })`       | Enviar um documento ([Ficheiros](./files.md))                           |
| `downloadFile(url)`                                         | Baixar um arquivo traduzido como bytes                                  |
| `suggest({ q, s, source, target })`                         | Enviar uma tradução melhor de volta (quando a instância as aceita)      |
| `settings()`                                                | Chave necessária, limite de caracteres, formatos de ficheiro, sugestões |
| `health()`                                                  | `{ status: "ok" }` quando a instância está acima                        |
| `call(operationId, body?)`                                  | Qualquer operação da sua `operationId`, com o corpo cru                 |

Uma resposta não- 2xx torna- se uma `LibreTranslateApiError` (ver [Erros](./errors.md)).

## Como é gerado

O pacote mantém o seu próprio OpenAPI 3.1 descrição da API em `spec/openapi.yml`, escrito a partir da documentação
pública API. [orval](https://orval.dev) transforma-a em:

- `src/generated/endpoints.ts`: uma função por operação, todos enviando através do próprio pacote `fetch` wrapper, que
  adiciona a URL base, o tempo limite e o tratamento de erros;
- `src/generated/model/`: os tipos de pedido e de resposta (`TranslateRequest`, `Detection`, `FrontendSettings`, ...),
  exportados da embalagem;
- `src/generated/zod.ts`: zod esquemas de cada solicitação, que as ferramentas MCP usam como suas entradas.

O cliente acima envolve essas funções com padrões (`source: "auto"`) e a chave API. Para cada tipo e função exportada,
consulte [Referência da API](pathname://../../docs/api).
