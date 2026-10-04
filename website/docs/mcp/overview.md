---
sidebar_position: 1
title: Overview
description: "The LibreTranslate MCP server: its transports, its tools, and the HTTP mode."
---

# MCP server

`libretranslate-mcp` gives Claude Code, Codex, OpenCode or any other MCP client machine translation through a
LibreTranslate instance.

```bash
libretranslate-mcp            # stdio: what the MCP client runs
libretranslate-mcp --http     # http://127.0.0.1:3768/mcp (PORT changes the port)
libretranslate mcp start      # the same in the background; stop/status; boot enable to start it at login
```

## Tools

| Tool                                                                           | What for                                                                 |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `libretranslate_translate`                                                     | One text or a list, with `auto` detection, HTML and alternatives         |
| `libretranslate_translate_file`                                                | A local document, saved beside the original as `<name>.<target><ext>`    |
| `libretranslate_detect`                                                        | The candidate languages of a text                                        |
| `libretranslate_languages`                                                     | The language codes, or the targets of one source                         |
| `libretranslate_status`                                                        | Health, whether a key is required, the character limit, the file formats |
| `libretranslate_suggest`                                                       | Sends a better translation back, when the user asks for it               |
| `libretranslate_resources` / `libretranslate_describe` / `libretranslate_call` | The raw API, operation by operation                                      |

- [Tools](./tools.md): the curated tools in detail.
- [Generic tools](./generic-tools.md): the raw API.

## The HTTP mode

- It is stateless and listens on `127.0.0.1` only.
- It refuses a `Host` that is not loopback, against DNS rebinding.
- `GET /health` answers `{ ok, baseUrl, apiKey, version }`, `apiKey` saying whether one is configured.
- `POST /shutdown` with the token `libretranslate mcp start` generates closes it; that is how `libretranslate mcp
stop` stops the server, Windows included.

In stdio mode, stdout carries the protocol: the server logs to stderr only.

Errors never carry the API key: every tool error goes through the same masking as the SDK's.
