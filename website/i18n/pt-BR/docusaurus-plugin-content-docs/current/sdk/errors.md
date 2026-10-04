---
sidebar_position: 4
title: Erros
description: "LibreTranslateApiError e as outras classes de erro, os status que uma instância responde e como a API key é mascarada."
---

# Erros

| Classe                       | Quando                                           |
| ---------------------------- | ------------------------------------------------ |
| `LibreTranslateApiError`     | Uma resposta fora de 2xx                         |
| `LibreTranslateConfigError`  | Configuração inválida: URL ausente ou malformada |
| `LibreTranslateTimeoutError` | Nenhuma resposta dentro de `timeoutMs`           |

`LibreTranslateApiError` traz `status`, `method`, `path` (sem a query string) e o `body` da resposta. O LibreTranslate
responde erros como `{ "error": "<mensagem>" }`, e essa mensagem é a do erro.

| Status | Normalmente                                                                  |
| ------ | ---------------------------------------------------------------------------- |
| 400    | Um parâmetro ausente ou inválido, um arquivo não suportado, ou chave exigida |
| 403    | A API key é inválida, ou o cliente foi bloqueado                             |
| 429    | Requisições demais: espere e tente de novo                                   |
| 500    | A tradução falhou na instância                                               |

```ts
import { LibreTranslateApiError } from "@hoyasumii/libretranslate";

try {
  await lt.translate({ q: "Olá", target: "en" });
} catch (error) {
  if (error instanceof LibreTranslateApiError && error.status === 429) {
    // espere e tente de novo
  } else throw error;
}
```

## A API key nunca aparece

A mensagem e o `body` de todo erro passam por `redact`: os valores de chaves como `api_key` viram `***`, assim como
qualquer ocorrência literal da chave do próprio cliente, inclusive dentro de strings. `redact` é exportado para os
seus logs:

```ts
import { redact } from "@hoyasumii/libretranslate";

console.log(redact(payload, [process.env.LIBRETRANSLATE_API_KEY!]));
```
