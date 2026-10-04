---
sidebar_position: 3
title: Ferramentas
description: "As ferramentas MCP curadas: traduzir textos e arquivos, detectar idiomas, listá-los, o status da instância e sugestões."
---

# Ferramentas

As entradas delas são os schemas zod que o orval gera a partir da spec, então o agente vê os mesmos campos, enums e
padrões que o SDK.

## `libretranslate_translate`

Traduz um texto, ou uma lista numa chamada.

| Entrada        | Para quê                                                  |
| -------------- | --------------------------------------------------------- |
| `q`            | O texto, ou uma lista de textos                           |
| `target`       | O código do idioma de destino                             |
| `source`       | O código do idioma de origem; `auto` (o padrão) o detecta |
| `format`       | `text` (padrão) ou `html`, que mantém a marcação          |
| `alternatives` | Quantas outras traduções acrescentar (padrão 0)           |

Responde no formato da própria API: `translatedText`, mais `detectedLanguage` com `auto` e `alternatives` quando
pedidas.

## `libretranslate_translate_file`

Traduz um documento local e salva o resultado.

| Entrada     | Para quê                                                                    |
| ----------- | --------------------------------------------------------------------------- |
| `path`      | O arquivo a traduzir                                                        |
| `target`    | O código do idioma de destino                                               |
| `source`    | O código do idioma de origem, `auto` por padrão                             |
| `output`    | Onde salvar a tradução (padrão: ao lado do original)                        |
| `overwrite` | Substituir um arquivo existente (padrão false: um existente nunca é tocado) |

`relatorio.docx` traduzido para `en` vira `relatorio.en.docx`. Responde `{ savedTo, bytes, translatedFileUrl }`. O
servidor lê e grava arquivos na máquina em que roda, com as permissões do seu usuário.

## `libretranslate_detect`

Os idiomas candidatos de `q`, o mais provável primeiro, cada um com uma confiança de 0 a 100.

## `libretranslate_languages`

Sem entrada, os códigos e nomes de todos os idiomas. Quando todo idioma traduz para todos os outros (o caso comum), os
alvos aparecem uma vez em vez de uma vez por idioma. Com `source`, os idiomas para os quais aquele traduz.

## `libretranslate_status`

A saúde e as configurações da instância numa resposta: se uma API key é exigida e se há uma configurada, o limite de
caracteres por requisição, se a tradução de arquivos e as sugestões estão habilitadas, e os formatos de arquivo
aceitos. Uma boa primeira chamada para um agente.

## `libretranslate_suggest`

Envia uma tradução corrigida (`s`) de um texto (`q`) de volta para a instância, que a guarda. O agente é instruído a
usá-la só quando você pedir, e ela falha em instâncias com sugestões desabilitadas.

## Erros que o agente consegue resolver

Um erro de ferramenta é um texto que diz o que fazer: uma instância que exige chave responde com a dica de salvar uma
com `libretranslate mcp config`, um 403 aponta para a chave configurada, um 429 diz para esperar. A chave em si nunca
aparece.
