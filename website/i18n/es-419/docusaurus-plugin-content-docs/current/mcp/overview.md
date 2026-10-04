---
sidebar_position: 1
title: Sinopsis
description: "El LibreTranslate Servidor MCP: sus transportes, sus herramientas y el modo HTTP."
---

# MCP server

`libretranslate-mcp` da Claude Code, Codex, OpenCode o cualquier otra traducción de la máquina cliente MCP a través de
LibreTranslate instancia.

```bash
libretranslate-mcp            # stdio: what the MCP client runs
libretranslate-mcp --http     # http://127.0.0.1:3768/mcp (PORT changes the port)
libretranslate mcp start      # the same in the background; stop/status; boot enable to start it at login
```

## Herramientas

| Herramienta                                                                    | ¿Para qué?                                                                        |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| `libretranslate_translate`                                                     | Un texto o una lista, con `auto` detección, HTML y alternativas                   |
| `libretranslate_translate_file`                                                | Un documento local, guardado al lado del original como `<name>.<target><ext>`     |
| `libretranslate_detect`                                                        | Los idiomas candidatos de un texto                                                |
| `libretranslate_languages`                                                     | Los códigos de idioma, o los objetivos de una fuente                              |
| `libretranslate_status`                                                        | Salud, si se requiere una clave, el límite de caracteres, los formatos de archivo |
| `libretranslate_suggest`                                                       | Envía una mejor traducción de nuevo, cuando el usuario lo solicite                |
| `libretranslate_resources` / `libretranslate_describe` / `libretranslate_call` | La API cruda, operación por operación                                             |

- [Herramientas](./tools.md): las herramientas curadas en detalle.
- [Herramientas genéricas](./generic-tools.md): la API cruda.

## El modo HTTP

- Es apátridas y escucha `127.0.0.1` Sólo.
- Se niega a `Host` eso no es retroceso, contra la rebinación de DNS.
- `GET /health` respuestas `{ ok, baseUrl, apiKey, version }`, `apiKey` diciendo si uno está configurado.
- `POST /shutdown` con la ficha `libretranslate mcp start` genera lo cierra; así es como `libretranslate mcp stop`
  detiene el servidor, Windows incluido.

En modo stdio, stdout lleva el protocolo: los registros del servidor a stderr solamente.

Los errores nunca llevan la clave de API: cada error de herramienta pasa por el mismo enmascaramiento que el SDK.
