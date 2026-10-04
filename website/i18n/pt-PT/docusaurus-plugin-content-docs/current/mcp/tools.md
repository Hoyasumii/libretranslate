---
sidebar_position: 3
title: Ferramentas
description: "As ferramentas MCP com curadoria: traduzir textos e arquivos, detectar linguagens, listar, o status da instância e sugestões."
---

# Ferramentas

Os seus inputs são zod esquema orval gera a partir da especificação, então o agente vê os mesmos campos, enums e padrões
que o SDK.

## `libretranslate_translate`

Traduz um texto, ou uma lista em uma chamada.

| Entrada        | Para quê?                                                  |
| -------------- | ---------------------------------------------------------- |
| `q`            | O texto, ou uma lista de textos                            |
| `target`       | O código da língua-alvo                                    |
| `source`       | O código da língua de origem; `auto` (o padrão) detecta- o |
| `format`       | `text` (padrão) ou `html`, que mantém a marcação           |
| `alternatives` | Quantas outras traduções adicionar (padrão 0)              |

Responde à forma da API: `translatedText`, mais `detectedLanguage` com `auto` e `alternatives` quando perguntado.

## `libretranslate_translate_file`

Traduz um documento local e salva o resultado.

| Entrada     | Para quê?                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------ |
| `path`      | O ficheiro a traduzir                                                                      |
| `target`    | O código da língua-alvo                                                                    |
| `source`    | O código da língua de origem, `auto` por padrão                                            |
| `output`    | Onde salvar a tradução (padrão: ao lado do original)                                       |
| `overwrite` | Substituir um ficheiro existente (por omissão false: um ficheiro existente nunca é tocado) |

`report.docx` traduzido para `pt` torna- se `report.pt.docx`. Responde `{ savedTo, bytes, translatedFileUrl }`. O
servidor lê e escreve ficheiros na máquina em que é executado, com as permissões do utilizador.

## `libretranslate_detect`

As línguas candidatas de `q`, provavelmente primeiro, cada um com uma confiança de 0 a 100.

## `libretranslate_languages`

Sem entrada, os códigos e nomes de cada idioma. Quando cada idioma se traduz para cada outro (o caso habitual), os alvos
são listados uma vez em vez de uma vez por idioma. Com `source`, as línguas para as quais se traduz.

## `libretranslate_status`

A saúde e as configurações da instância em uma resposta: se uma chave API é necessária e se uma é configurada, o limite
de caracteres por solicitação, se a tradução de arquivo e sugestões estão habilitadas e os formatos de arquivo aceitos.
Uma boa primeira chamada para um agente.

## `libretranslate_suggest`

Envia uma tradução corrigida (`s`) de um texto (`q`) de volta à instância, que a mantém. O agente é dito para usá-lo
apenas quando você perguntar, e ele falha em instâncias com sugestões desabilitadas.

## Erros nos quais o agente pode agir

Um erro de ferramenta é o texto que diz o que fazer: uma instância que requer uma resposta chave com uma dica para
salvar uma com `libretranslate mcp config`, um 403 pontos na chave configurada, um 429 diz para esperar. A chave em si
nunca aparece.
