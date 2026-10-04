---
sidebar_position: 5
title: Configuração
description: "As configurações do servidor e do CLI lido, onde eles são salvos, ea ordem em que eles são resolvidos."
---

# Configuração

Cada configuração vem de uma bandeira, em seguida, o ambiente, em seguida, o arquivo `libretranslate mcp config` salvo,
então o padrão.

| Variável                 | Para quê?                                                          | Padrão                  |
| ------------------------ | ------------------------------------------------------------------ | ----------------------- |
| `LIBRETRANSLATE_URL`     | O URL da instância                                                 | `http://localhost:5000` |
| `LIBRETRANSLATE_API_KEY` | A chave API, para as instâncias que emitem chaves                  | nenhum                  |
| `PORT`                   | A porta HTTP                                                       | `3768`                  |
| `LIBRETRANSLATE_CONFIG`  | Onde a configuração salva vive (também `--config`)                 | ver abaixo              |
| `LIBRETRANSLATE_MCP_URL` | Para o CLI: uma execução `libretranslate-mcp` a utilizar (`--url`) | servidor em processo    |

Uma instância self-hosted geralmente não necessita nenhuma chave. Um hospedado, como libretranslate.com, faz: sem ele
cada tradução responde 400. `libretranslate status` Diz qual.

## Onde ela é salva

- `~/.config/libretranslate/.env` no Linux;
- `~/Library/Application Support/libretranslate/.env` em macOS;
- `%APPDATA%\libretranslate\.env` no Windows;
- ou onde quer que seja `LIBRETRANSLATE_CONFIG`/`--config` pontos.

O arquivo é escrito com o modo 0600 (no Windows a pasta ACL o protege).

A chave API nunca aparece em erros, logs, `--help` ou o formulário de configuração.
