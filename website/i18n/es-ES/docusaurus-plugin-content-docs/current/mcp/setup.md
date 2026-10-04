---
sidebar_position: 2
title: Configuración
description: "Guarde su configuración una vez y registre LibreTranslate Servidor MCP en Claude Code, Codex y OpenCode."
---

# Configuración

## El camino rápido

Guarda tus ajustes una vez, deja que el CLI registre el servidor en los clientes que encuentre:

```bash
npx libretranslate mcp config    # asks for the instance URL, an API key if it issues keys, and a port
npx libretranslate mcp install   # finds Claude Code, Codex and OpenCode on your PATH and registers libretranslate-mcp (stdio)
```

`install` muestra una lista de clientes que encontró. Ataque los que quieras, y registra el servidor a través del propio
CLI de cada cliente, bajo el nombre `libretranslate`. El comando registrado lee la configuración guardada cuando el
cliente la lanza, por lo que ninguna clave de API termina en el config del cliente. See
[`libretranslate mcp install`](../cli/mcp-commands.md#libretranslate-mcp-install) para las banderas.

## A mano: stdio

Deja que el cliente empiece `libretranslate-mcp`. Lee la configuración guardada, por lo que el config cliente no
necesita claves:

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

Sin una configuración guardada, el servidor utiliza `http://localhost:5000` y ninguna llave. Para señalarlo en otro
lugar, o para anular el archivo guardado, dar al cliente un `env` bloque (ver [Configuración](./configuration.md)):

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

## A mano: HTTP

Ejecutar un servidor en el fondo y señalar a sus clientes en su URL:

```bash
npx libretranslate mcp start          # prints the URL, http://127.0.0.1:3768/mcp by default
claude mcp add --transport http libretranslate http://127.0.0.1:3768/mcp
```

Sin el CLI, `libretranslate-mcp --http` lo ejecuta en primer plano con la configuración del entorno o la configuración
guardada. `libretranslate-mcp --help` lista las banderas. Para iniciar el servidor en cada login, ejecutar
`npx libretranslate mcp boot enable` (ver [`libretranslate mcp boot`](../cli/mcp-commands.md#libretranslate-mcp-boot)).

## Comprobando que funciona

Pide a tu agente que llame `libretranslate_status`, o ejecutarlo desde el terminal:

```bash
npx libretranslate status
```

Responde a la URL de instancia, si una clave está configurada y requerida, el límite de caracteres y los formatos de
archivo.
