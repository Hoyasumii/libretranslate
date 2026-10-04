---
sidebar_position: 5
title: Configuração
description: "As configurações que o servidor e a CLI leem, onde são salvas e a ordem em que são resolvidas."
---

# Configuração

Cada configuração vem de uma flag, depois do ambiente, depois do arquivo que `libretranslate mcp config` salvou, e
por fim do padrão.

| Variável                 | Para quê                                                     | Padrão                  |
| ------------------------ | ------------------------------------------------------------ | ----------------------- |
| `LIBRETRANSLATE_URL`     | A URL da instância                                           | `http://localhost:5000` |
| `LIBRETRANSLATE_API_KEY` | A API key, para instâncias que emitem chaves                 | nenhuma                 |
| `PORT`                   | A porta HTTP                                                 | `3768`                  |
| `LIBRETRANSLATE_CONFIG`  | Onde fica a configuração salva (também `--config`)           | veja abaixo             |
| `LIBRETRANSLATE_MCP_URL` | Para a CLI: um `libretranslate-mcp` rodando a usar (`--url`) | servidor em processo    |

Uma instância própria normalmente não precisa de chave. Uma hospedada, como a libretranslate.com, precisa: sem ela,
toda tradução responde 400. `libretranslate status` diz qual é o caso.

## Onde é salva

- `~/.config/libretranslate/.env` no Linux;
- `~/Library/Application Support/libretranslate/.env` no macOS;
- `%APPDATA%\libretranslate\.env` no Windows;
- ou onde `LIBRETRANSLATE_CONFIG`/`--config` apontar.

O arquivo é gravado com modo 0600 (no Windows, a ACL da pasta o protege).

A API key nunca aparece em erros, logs, `--help` ou no formulário de configuração.
