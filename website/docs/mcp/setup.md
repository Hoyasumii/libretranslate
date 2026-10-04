---
sidebar_position: 2
title: Setup
description: "Save your settings once and register the LibreTranslate MCP server in Claude Code, Codex and OpenCode."
---

# Setup

## The quick way

Save your settings once, then let the CLI register the server in the clients it finds:

```bash
npx libretranslate mcp config    # asks for the instance URL, an API key if it issues keys, and a port
npx libretranslate mcp install   # finds Claude Code, Codex and OpenCode on your PATH and registers libretranslate-mcp (stdio)
```

`install` shows a checklist of the clients it found. Tick the ones you want, and it registers the server through
each client's own CLI, under the name `libretranslate`. The registered command reads the saved configuration when the
client launches it, so no API key ends up in the client's config. See
[`libretranslate mcp install`](../cli/mcp-commands.md#libretranslate-mcp-install) for the flags.

## By hand: stdio

Let the client start `libretranslate-mcp`. It reads the saved configuration, so the client config needs no keys:

```json
{
  "mcpServers": {
    "libretranslate": { "command": "npx", "args": ["-y", "-p", "@hoyasumii/libretranslate", "libretranslate-mcp"] }
  }
}
```

In Claude Code:

```bash
claude mcp add libretranslate -- npx -y -p @hoyasumii/libretranslate libretranslate-mcp
```

Without a saved configuration, the server uses `http://localhost:5000` and no key. To point it elsewhere, or to
override the saved file, give the client an `env` block (see [Configuration](./configuration.md)):

```json
{
  "mcpServers": {
    "libretranslate": {
      "command": "npx",
      "args": ["-y", "-p", "@hoyasumii/libretranslate", "libretranslate-mcp"],
      "env": { "LIBRETRANSLATE_URL": "https://libretranslate.com", "LIBRETRANSLATE_API_KEY": "your-api-key" }
    }
  }
}
```

## By hand: HTTP

Run one server in the background and point your clients at its URL:

```bash
npx libretranslate mcp start          # prints the URL, http://127.0.0.1:3768/mcp by default
claude mcp add --transport http libretranslate http://127.0.0.1:3768/mcp
```

Without the CLI, `libretranslate-mcp --http` runs it in the foreground with the settings from the environment or the
saved configuration. `libretranslate-mcp --help` lists the flags. To start the server at every login, run
`npx libretranslate mcp boot enable` (see [`libretranslate mcp boot`](../cli/mcp-commands.md#libretranslate-mcp-boot)).

## Checking it works

Ask your agent to call `libretranslate_status`, or run it from the terminal:

```bash
npx libretranslate status
```

It answers the instance URL, whether a key is configured and required, the character limit and the file formats.
