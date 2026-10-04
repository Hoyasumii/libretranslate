---
sidebar_position: 1
title: CLI overview
description: "The libretranslate command: every MCP tool as a subcommand, with the tool's input schema as its flags."
---

# CLI

The package installs a `libretranslate` command. It is an MCP client of the [same server](../mcp/overview.md):
every MCP tool becomes a subcommand, and the tool's input schema becomes its flags. By default the server runs inside
the command, so there is nothing to start first.

```bash
npx libretranslate mcp config                          # once: the instance URL and, if it issues keys, an API key
npx libretranslate tools                               # every command, one per MCP tool
npx libretranslate status
npx libretranslate translate --q "Olá, mundo!" --target en
npx libretranslate translate --q '["Bom dia","Boa noite"]' --source pt --target es
npx libretranslate translate --q "<b>Olá</b>" --target en --format html --alternatives 2
npx libretranslate translate-file --path report.docx --target pt
npx libretranslate detect --q "Bonjour tout le monde"
npx libretranslate languages --source pt
npx libretranslate call --operation getFrontendSettings
```

Nothing but `--help`, `--version`, `libretranslate docs`, `libretranslate mcp config` and `libretranslate mcp
uninstall` runs until a configuration with a URL is saved. `libretranslate docs` prints the link to this site and
opens it in the browser.

## From tools to commands

- The command is the tool's name without `libretranslate_`, in kebab-case: `libretranslate_translate_file` →
  `translate-file`.
- Each flag is an input in kebab-case.
- Array flags take `a,b` or JSON, object flags take JSON, and boolean flags need no value.
- `libretranslate <command> --help` lists a command's flags, with the allowed values of enum inputs.

Tool output goes to stdout. A tool error goes to stderr with exit code 1.

## One-off settings and a running server

`--base-url` and `--api-key` override the environment and the saved file for one run of the in-process server. To
use a `libretranslate-mcp` that is already running over HTTP instead, pass `--url http://127.0.0.1:3768/mcp` or set
`LIBRETRANSLATE_MCP_URL`. These flags work anywhere on the command line.

None of them stands in for the saved configuration: the CLI refuses to run tools without it, even when `--url` or
`--base-url` is given.

## A local instance

With Docker installed, `libretranslate service up` runs LibreTranslate in a container and points the CLI at it.
See [`libretranslate service`](./service.md).

## Managing the server

`libretranslate mcp` is intercepted before any connection is made. It configures the server, runs it in the
background, starts it at login and registers it in your MCP clients. See [`libretranslate mcp`](./mcp-commands.md).
