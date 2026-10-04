---
sidebar_position: 5
title: Configuration
description: "The settings the server and the CLI read, where they are saved, and the order they are resolved in."
---

# Configuration

Each setting comes from a flag, then the environment, then the file `libretranslate mcp config` saved, then the
default.

| Variable                 | What for                                                     | Default                 |
| ------------------------ | ------------------------------------------------------------ | ----------------------- |
| `LIBRETRANSLATE_URL`     | The instance URL                                             | `http://localhost:5000` |
| `LIBRETRANSLATE_API_KEY` | The API key, for instances that issue keys                   | none                    |
| `PORT`                   | The HTTP port                                                | `3768`                  |
| `LIBRETRANSLATE_CONFIG`  | Where the saved configuration lives (also `--config`)        | see below               |
| `LIBRETRANSLATE_MCP_URL` | For the CLI: a running `libretranslate-mcp` to use (`--url`) | in-process server       |

A self-hosted instance usually needs no key. A hosted one, such as libretranslate.com, does: without it every
translation answers 400. `libretranslate status` tells which.

## Where it is saved

- `~/.config/libretranslate/.env` on Linux;
- `~/Library/Application Support/libretranslate/.env` on macOS;
- `%APPDATA%\libretranslate\.env` on Windows;
- or wherever `LIBRETRANSLATE_CONFIG`/`--config` points.

The file is written with mode 0600 (on Windows the folder's ACL protects it).

The API key never shows up in errors, logs, `--help` or the configuration form.
