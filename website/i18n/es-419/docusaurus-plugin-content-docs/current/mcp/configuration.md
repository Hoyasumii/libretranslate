---
sidebar_position: 5
title: Configuración
description: "Los ajustes que el servidor y el CLI leen, donde se guardan, y el orden en el que se resuelven."
---

# Configuración

Cada configuración viene de una bandera, luego el ambiente, luego el archivo `libretranslate mcp config` guardado,
entonces el predeterminado.

| Variable                 | ¿Para qué?                                                               | Default                 |
| ------------------------ | ------------------------------------------------------------------------ | ----------------------- |
| `LIBRETRANSLATE_URL`     | La URL de instancia                                                      | `http://localhost:5000` |
| `LIBRETRANSLATE_API_KEY` | La clave de API, para casos que emiten claves                            | ninguno                 |
| `PORT`                   | El puerto HTTP                                                           | `3768`                  |
| `LIBRETRANSLATE_CONFIG`  | Donde vive la configuración guardada (también `--config`)                | véase infra             |
| `LIBRETRANSLATE_MCP_URL` | Para el CLI: un funcionamiento `libretranslate-mcp` a utilizar (`--url`) | servidor en proceso     |

Una instancia autoanfitriona generalmente no necesita llave. Un hospedador, como libretranslate.com, hace: sin ella cada
traducción responde 400. `libretranslate status` dice cuál.

## Donde se salva

- `~/.config/libretranslate/.env` en Linux;
- `~/Library/Application Support/libretranslate/.env` en macOS;
- `%APPDATA%\libretranslate\.env` en Windows;
- o donde quiera `LIBRETRANSLATE_CONFIG`/`--config` puntos.

El archivo está escrito con el modo 0600 (en Windows la carpeta ACL lo protege).

La clave API nunca aparece en errores, registros, `--help` o el formulario de configuración.
