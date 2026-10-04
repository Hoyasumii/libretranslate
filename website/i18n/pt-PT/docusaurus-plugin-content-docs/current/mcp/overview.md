---
sidebar_position: 1
title: Visão geral
description: "A LibreTranslate Servidor MCP: seus transportes, suas ferramentas e o modo HTTP."
---

# Servidor MCP

`libretranslate-mcp` dá Claude Code, Codex, OpenCode ou qualquer outra tradução automática cliente MCP através de um
LibreTranslate exemplo.

```bash
libretranslate-mcp            # stdio: what the MCP client runs
libretranslate-mcp --http     # http://127.0.0.1:3768/mcp (PORT changes the port)
libretranslate mcp start      # the same in the background; stop/status; boot enable to start it at login
```

## Ferramentas

| Ferramenta                                                                     | Para quê?                                                                         |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| `libretranslate_translate`                                                     | Um texto ou uma lista com `auto` detecção, HTML e alternativas                    |
| `libretranslate_translate_file`                                                | Um documento local, gravado ao lado do original como `<name>.<target><ext>`       |
| `libretranslate_detect`                                                        | As línguas candidatas de um texto                                                 |
| `libretranslate_languages`                                                     | Os códigos linguísticos, ou os alvos de uma fonte                                 |
| `libretranslate_status`                                                        | Saúde, se é necessária uma chave, o limite de caracteres, os formatos de ficheiro |
| `libretranslate_suggest`                                                       | Envia uma tradução melhor de volta, quando o usuário pede por ela                 |
| `libretranslate_resources` / `libretranslate_describe` / `libretranslate_call` | A API bruta, operação por operação                                                |

- [Ferramentas](./tools.md): os instrumentos curados em detalhe.
- [Ferramentas genéricas](./generic-tools.md): a API bruta.

## O modo HTTP

- É apátrida e escuta `127.0.0.1` Apenas.
- Recusa-se a `Host` que não é loopback, contra a religação DNS.
- `GET /health` respostas `{ ok, baseUrl, apiKey, version }`, `apiKey` dizendo se um está configurado.
- `POST /shutdown` com o símbolo `libretranslate mcp start` gera- o fecha; é assim que `libretranslate mcp stop`
  pára o servidor, Windows incluído.

No modo stdio, o stdout carrega o protocolo: o servidor registra somente o stderr.

Erros nunca carregam a chave API: cada erro de ferramenta passa pelo mesmo mascaramento do SDK.
