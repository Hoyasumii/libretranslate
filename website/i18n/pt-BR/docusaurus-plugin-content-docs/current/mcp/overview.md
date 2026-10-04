---
sidebar_position: 1
title: Visão geral
description: "O servidor MCP do LibreTranslate: os transportes, as ferramentas e o modo HTTP."
---

# Servidor MCP

`libretranslate-mcp` dá ao Claude Code, ao Codex, ao OpenCode ou a qualquer outro cliente MCP tradução automática
através de uma instância do LibreTranslate.

```bash
libretranslate-mcp            # stdio: o que o cliente MCP executa
libretranslate-mcp --http     # http://127.0.0.1:3768/mcp (PORT muda a porta)
libretranslate mcp start      # o mesmo em segundo plano; stop/status; boot enable para iniciá-lo no login
```

## Ferramentas

| Ferramenta                                                                     | Para quê                                                                |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| `libretranslate_translate`                                                     | Um texto ou uma lista, com detecção `auto`, HTML e alternativas         |
| `libretranslate_translate_file`                                                | Um documento local, salvo ao lado do original como `<nome>.<alvo><ext>` |
| `libretranslate_detect`                                                        | Os idiomas candidatos de um texto                                       |
| `libretranslate_languages`                                                     | Os códigos de idioma, ou os alvos de uma origem                         |
| `libretranslate_status`                                                        | Saúde, se uma chave é exigida, o limite de caracteres, os formatos      |
| `libretranslate_suggest`                                                       | Devolve uma tradução melhor, quando o usuário pede                      |
| `libretranslate_resources` / `libretranslate_describe` / `libretranslate_call` | A API crua, operação por operação                                       |

- [Ferramentas](./tools.md): as ferramentas curadas em detalhe.
- [Ferramentas genéricas](./generic-tools.md): a API crua.

## O modo HTTP

- É stateless e escuta só em `127.0.0.1`.
- Recusa um `Host` que não seja loopback, contra DNS rebinding.
- `GET /health` responde `{ ok, baseUrl, apiKey, version }`, com `apiKey` dizendo se há uma configurada.
- `POST /shutdown` com o token que `libretranslate mcp start` gera o encerra; é assim que `libretranslate mcp stop`
  para o servidor, inclusive no Windows.

No modo stdio, o stdout carrega o protocolo: o servidor só escreve logs no stderr.

Os erros nunca carregam a API key: todo erro de ferramenta passa pelo mesmo mascaramento do SDK.
