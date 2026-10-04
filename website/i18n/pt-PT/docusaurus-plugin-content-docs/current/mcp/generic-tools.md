---
sidebar_position: 4
title: Ferramentas genéricas
description: "libretranslate_resources, libretranslate_describe e libretranslate_call: o bruto LibreTranslate API, operação por operação."
---

# Ferramentas genéricas

As ferramentas curadas cobrem o que um agente normalmente precisa. Mais três alcançar a API bruta, operação por
operação, como a especificação descreve:

1. **`libretranslate_resources`** enumera as operações (`translate`, `detect`, `listLanguages`, `getFrontendSettings`,
   `suggest`, `health`). Com uma `query`, apenas os correspondentes.
2. **`libretranslate_describe`** dá o método de uma operação, caminho, esquema do corpo e um exemplo
   `libretranslate_call` entrada. Com `schema`, expande um esquema a partir da especificação (`depth` níveis profundos,
   padrão 3).
3. **`libretranslate_call`** executa- o: `operation` é o `operationId` (`listLanguages`) ou `METHOD /path`
   (`GET /languages`), e `body` é o corpo de solicitação da JSON.

```json
{ "operation": "translate", "body": { "q": "Olá", "source": "pt", "target": "en", "alternatives": 2 } }
```

## Segurança

- Campos de corpo desconhecidos são recusados, então um erro de digitação não deixa cair silenciosamente uma
  configuração.
- `api_key` é recusado: o servidor envia a chave configurada em si, e os esquemas a deixam de fora.
- Operações que escrevem para a instância (`suggest`) necessidade `confirm: true`Diz-se ao agente para lhe perguntar
  primeiro.
- O envio do ficheiro fica fora do catálogo: `libretranslate_translate_file` cobre-o de um caminho local.
- Uma resposta longa é cortada em 60.000 caracteres, dizendo isso.

O catálogo é gerado a partir da mesma especificação OpenAPI que o SDK (`pnpm codegen:mcp`).
