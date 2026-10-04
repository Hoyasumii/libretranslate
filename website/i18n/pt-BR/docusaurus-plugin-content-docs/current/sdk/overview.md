---
sidebar_position: 1
title: Visão geral
description: "O cliente do LibreTranslate: as opções, os métodos e como ele é gerado a partir da spec OpenAPI pelo orval."
---

# SDK

```ts
import { createLibreTranslateClient } from "@hoyasumii/libretranslate";

const lt = createLibreTranslateClient({
  baseUrl: "https://libretranslate.example.com",
  apiKey: process.env.LIBRETRANSLATE_API_KEY, // só para instâncias que emitem chaves
});

const { translatedText } = await lt.translate({ q: "Bom dia", source: "pt", target: "en" });
const languages = await lt.languages();
const settings = await lt.settings();
```

`baseUrl` é a URL da instância, com o caminho base se houver (`https://example.com/translate`).
`createLibreTranslateClientFromEnv()` lê `LIBRETRANSLATE_URL` (padrão `http://localhost:5000`) e
`LIBRETRANSLATE_API_KEY`.

## Opções

| Opção       | Para quê                                                                      |
| ----------- | ----------------------------------------------------------------------------- |
| `baseUrl`   | A URL da instância (obrigatória)                                              |
| `apiKey`    | A API key, para instâncias que emitem chaves; vai no corpo de cada requisição |
| `timeoutMs` | Timeout por requisição, padrão 60000; `0` ou `Infinity` o desligam            |
| `fetch`     | Um `fetch` alternativo (testes, um proxy)                                     |

Todo método também aceita um último argumento `{ signal }`, para cancelar a chamada com um `AbortSignal`.

## Métodos

| Método                                                      | Para quê                                                            |
| ----------------------------------------------------------- | ------------------------------------------------------------------- |
| `translate({ q, source?, target, format?, alternatives? })` | Um texto ([Tradução](./translation.md))                             |
| `translateMany({ q: string[], … })`                         | Vários textos numa requisição                                       |
| `detect(text)`                                              | Os idiomas candidatos, o mais provável primeiro                     |
| `languages()`                                               | Cada idioma de origem, com os códigos para os quais ele traduz      |
| `translateFile({ file, filename?, source?, target })`       | Envia um documento ([Arquivos](./files.md))                         |
| `downloadFile(url)`                                         | Baixa um arquivo traduzido como bytes                               |
| `suggest({ q, s, source, target })`                         | Devolve uma tradução melhor (quando a instância aceita)             |
| `settings()`                                                | Chave exigida, limite de caracteres, formatos de arquivo, sugestões |
| `health()`                                                  | `{ status: "ok" }` quando a instância está no ar                    |
| `call(operationId, body?)`                                  | Qualquer operação pelo `operationId`, com o corpo cru               |

Uma resposta fora de 2xx vira um `LibreTranslateApiError` (veja [Erros](./errors.md)).

## Como ele é gerado

O pacote mantém a própria descrição OpenAPI 3.1 da API em `spec/openapi.yml`, escrita a partir da documentação
pública da API. O [orval](https://orval.dev) a transforma em:

- `src/generated/endpoints.ts`: uma função por operação, todas passando pelo wrapper de `fetch` do pacote, que
  acrescenta a URL base, o timeout e o tratamento de erros;
- `src/generated/model/`: os tipos de requisição e resposta (`TranslateRequest`, `Detection`, `FrontendSettings`, …),
  exportados pelo pacote;
- `src/generated/zod.ts`: schemas zod de cada requisição, que as ferramentas MCP usam como entrada.

O cliente acima envolve essas funções com padrões (`source: "auto"`) e a API key. Para cada tipo e função exportados,
veja a [referência da API](pathname://../../../docs/api).
