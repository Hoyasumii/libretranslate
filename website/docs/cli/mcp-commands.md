---
sidebar_position: 2
title: libretranslate mcp
description: "libretranslate mcp: save the configuration, run the server in the background, start it at login and register it in your MCP clients."
---

# `libretranslate mcp`

`libretranslate mcp` manages the MCP server for you: its saved configuration, a background HTTP server, a login service,
and its registration in your MCP clients.

```bash
npx libretranslate mcp config                 # asks for the settings in the terminal and saves them
npx libretranslate mcp config --base-url http://localhost:5000 --port 4000   # no prompts (scripts, CI): saves just these
npx libretranslate mcp config --web           # the same, in a local web form
npx libretranslate mcp install                # pick Claude Code / Codex / OpenCode and register libretranslate-mcp (stdio) in them
npx libretranslate mcp install --client claude,opencode --force   # no picker (scripts, CI); --force replaces an entry
npx libretranslate mcp uninstall              # pick the clients to remove the 'libretranslate' entry from (no saved config needed)
npx libretranslate mcp start                  # start in the background (needs a saved config); prints the URL for `claude mcp add`
npx libretranslate mcp start --api-key other --port 4000   # one-off values, never saved
npx libretranslate mcp status                 # running or stopped (exit 3), URL, pid, uptime
npx libretranslate mcp stop
npx libretranslate mcp boot enable            # start at every login; `boot disable` / `boot status`
```

## `libretranslate mcp config`

Writes the saved `.env` ([Configuration](../mcp/configuration.md)). It works three ways:

- **In the terminal** (the default). It asks for each setting in turn, starting from the saved values
  (`http://localhost:5000` for a new URL). The API key is typed masked: enter keeps the saved one (or leaves none),
  and `-` clears it.
- **With flags.** Given any of `--base-url`, `--api-key` (`-` clears it) or `--port`, it asks nothing and saves just
  those. Without a terminal, it needs them. A key passed as a flag stays in your shell history, so prefer the prompt
  for it.
- **In a web form** with `--web`: a local page, opened in the browser (`--no-open` to only print its URL). A blank
  secret keeps the saved one.

If a server is running, it says so: restart it to pick the changes up. `--config <file>` (or `LIBRETRANSLATE_CONFIG`)
writes another file.

## `libretranslate mcp install`

Detects each client by running its `--version`, and registers the stdio server through the client's own CLI,
under the name `libretranslate`:

| Client      | Command it runs             |
| ----------- | --------------------------- |
| Claude Code | `claude mcp add -s user`    |
| Codex       | `codex mcp add`             |
| OpenCode    | `opencode mcp add --global` |

The registered command is `node <package>/dist/mcp/cli.js` by absolute path, with no credential: the server reads
the saved file when the client launches it (`LIBRETRANSLATE_CONFIG` is passed only when `--config` names another file).

Every client found starts ticked. One that already has a `libretranslate` entry is marked `already installed, reinstalls`
and gets it replaced. Without an interactive terminal, `--client` is required (`claude`, `codex`, `opencode`;
inside WSL also `claude@windows`, `codex@windows`, `opencode@windows`), plus `--force` to replace an entry.
`--dry-run` prints the commands instead of running them.

Both `install` and `uninstall` work on each client's user-level (global) config. Project-scoped entries are never
touched.

## `libretranslate mcp uninstall`

Lists the clients with a `libretranslate` entry, showing whether it is `stdio` or `http`, and removes any entry of that
name: `claude mcp remove -s user`, `codex mcp remove`, and for OpenCode (which has no `remove`) an edit of its
global config file that deletes only that key, keeping comments and layout.

It is the one command besides `libretranslate mcp config` that runs without a saved configuration, so a client can be
cleaned up after the configuration is gone. `--client` and `--dry-run` work as in `install`.

## `libretranslate mcp start`, `stop` and `status`

`start` runs the HTTP server detached, with its pid and log in `<config dir>/run/`, and prints its URL, its log file
and the `claude mcp add` line to register it. It needs a saved configuration. `--api-key`, `--base-url` and `--port`
override it for this run only, and are never saved. `--foreground` serves in the current process
instead.

`status` prints whether the server is running, with its URL, pid and uptime, and exits with code 3 when it is not.
`stop` asks the server to shut down through a token-guarded `POST /shutdown`, and signals the process only if that
fails.

## `libretranslate mcp boot`

`boot enable` installs a service of the current user that starts the server at every login, so no sudo is needed:

| OS      | Service                                                         |
| ------- | --------------------------------------------------------------- |
| Linux   | a systemd user unit (on WSL, enable systemd in `/etc/wsl.conf`) |
| macOS   | a LaunchAgent                                                   |
| Windows | a logon task                                                    |

The service reads only the saved configuration. `boot disable` removes it and `boot status` reports it.
