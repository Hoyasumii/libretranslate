---
sidebar_position: 4
title: Erros
description: "LibreTranslateApiError e as outras classes de erro, o status de uma instância responde, e como a chave API é mascarada."
---

# Erros

| Classe                       | Quando                                                |
| ---------------------------- | ----------------------------------------------------- |
| `LibreTranslateApiError`     | Uma resposta não- 2xx                                 |
| `LibreTranslateConfigError`  | Configuração inválida: um URL em falta ou mal formado |
| `LibreTranslateTimeoutError` | Nenhuma resposta dentro `timeoutMs`                   |

`LibreTranslateApiError` carrega `status`, `method`, `path` (sem o texto da consulta) e a resposta `body`.
LibreTranslate responde erros como `{ "error": "<message>" }`, e essa mensagem é do erro.

| Estado | Normalmente                                                                           |
| ------ | ------------------------------------------------------------------------------------- |
| 400    | É necessário um parâmetro em falta ou inválido, um arquivo não suportado ou uma chave |
| 403    | A chave API é inválida ou o cliente é banido                                          |
| 429    | Muitos pedidos: esperar e tentar novamente                                            |
| 500    | A tradução falhou na instância                                                        |

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

## A tecla API nunca aparece

Cada mensagem de erro e `body` passar `redact`: os valores de chaves como `api_key` tornar `***`, e assim faz qualquer
ocorrência literal da própria chave do cliente, dentro strings também. `redact` é exportado para os seus próprios logs:

```ts
import { redact } from "@hoyasumii/libretranslate";

console.log(redact(payload, [process.env.LIBRETRANSLATE_API_KEY!]));
```
