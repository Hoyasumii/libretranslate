---
sidebar_position: 3
title: Tools
description: "The curated MCP tools: translating texts and files, detecting languages, listing them, the instance status and suggestions."
---

# Tools

Their inputs are the zod schemas orval generates from the spec, so the agent sees the same fields, enums and
defaults as the SDK.

## `libretranslate_translate`

Translates one text, or a list in one call.

| Input          | What for                                                  |
| -------------- | --------------------------------------------------------- |
| `q`            | The text, or a list of texts                              |
| `target`       | The target language code                                  |
| `source`       | The source language code; `auto` (the default) detects it |
| `format`       | `text` (default) or `html`, which keeps the markup        |
| `alternatives` | How many other translations to add (default 0)            |

It answers the API's own shape: `translatedText`, plus `detectedLanguage` with `auto` and `alternatives` when asked.

## `libretranslate_translate_file`

Translates a local document and saves the result.

| Input       | What for                                                                   |
| ----------- | -------------------------------------------------------------------------- |
| `path`      | The file to translate                                                      |
| `target`    | The target language code                                                   |
| `source`    | The source language code, `auto` by default                                |
| `output`    | Where to save the translation (default: beside the original)               |
| `overwrite` | Replace an existing file (default false: an existing one is never touched) |

`report.docx` translated into `pt` becomes `report.pt.docx`. It answers `{ savedTo, bytes, translatedFileUrl }`.
The server reads and writes files on the machine it runs on, with your user's permissions.

## `libretranslate_detect`

The candidate languages of `q`, most likely first, each with a confidence from 0 to 100.

## `libretranslate_languages`

Without input, the codes and names of every language. When every language translates into every other (the usual
case), the targets are listed once instead of once per language. With `source`, the languages that one translates
into.

## `libretranslate_status`

The instance's health and settings in one answer: whether an API key is required and whether one is configured, the
character limit per request, whether file translation and suggestions are enabled, and the accepted file formats. A
good first call for an agent.

## `libretranslate_suggest`

Sends a corrected translation (`s`) of a text (`q`) back to the instance, which keeps it. The agent is told to use it
only when you ask, and it fails on instances with suggestions disabled.

## Errors the agent can act on

A tool error is text that says what to do: an instance that requires a key answers with a hint to save one with
`libretranslate mcp config`, a 403 points at the configured key, a 429 says to wait. The key itself never appears.
