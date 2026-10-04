---
sidebar_position: 4
title: Ferramentas genéricas
description: "libretranslate_resources, libretranslate_describe e libretranslate_call: a API crua do LibreTranslate, operação por operação."
---

# Ferramentas genéricas

As ferramentas curadas cobrem o que um agente costuma precisar. Outras três alcançam a API crua, operação por
operação, como a spec a descreve:

1. **`libretranslate_resources`** lista as operações (`translate`, `detect`, `listLanguages`, `getFrontendSettings`,
   `suggest`, `health`). Com uma `query`, só as que casam.
2. **`libretranslate_describe`** dá o método, o caminho, o schema do corpo e um exemplo de entrada para
   `libretranslate_call` de uma operação. Com `schema`, expande um schema da spec (`depth` níveis, padrão 3).
3. **`libretranslate_call`** a executa: `operation` é o `operationId` (`listLanguages`) ou `MÉTODO /caminho`
   (`GET /languages`), e `body` é o corpo JSON da requisição.

```json
{ "operation": "translate", "body": { "q": "Olá", "source": "pt", "target": "en", "alternatives": 2 } }
```

## Segurança

- Campos desconhecidos no corpo são recusados, para um erro de digitação não descartar uma configuração em silêncio.
- `api_key` é recusado: o servidor envia a chave configurada, e os schemas a deixam de fora.
- Operações que gravam na instância (`suggest`) precisam de `confirm: true`. O agente é instruído a perguntar antes.
- O envio de arquivos fica fora do catálogo: `libretranslate_translate_file` o cobre a partir de um caminho local.
- Uma resposta longa é cortada em 60.000 caracteres, avisando.

O catálogo é gerado da mesma spec OpenAPI do SDK (`pnpm codegen:mcp`).
