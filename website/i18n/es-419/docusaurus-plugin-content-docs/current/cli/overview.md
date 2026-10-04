---
sidebar_position: 1
title: CLI Overview
description: "El comando libretranslate: cada herramienta MCP como subcommand, con el esquema de entrada de la herramienta como sus banderas."
---

# CLI

El paquete instala a `libretranslate` Comando. Es un cliente MCP del [mismo servidor](../mcp/overview.md): cada
herramienta MCP se convierte en un subcomando, y el esquema de entrada de la herramienta se convierte en sus banderas.
Por defecto el servidor se ejecuta dentro del comando, por lo que no hay nada que empezar primero.

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

Nada más que nada `--help`, `--version`, `libretranslate docs`, `libretranslate mcp config` y
`libretranslate mcp uninstall` se ejecuta hasta que se guarde una configuración con una URL. `libretranslate docs`
imprime el enlace a este sitio web y lo abre en el navegador.

## De herramientas a comandos

- El comando es el nombre de la herramienta sin `libretranslate_`, en kebab-case: `libretranslate_translate_file` →
  `translate-file`.
- Cada bandera es una entrada en kebab-case.
- Array flags take `a,b` o JSON, las banderas de objetos toman JSON, y las banderas booleanas no necesitan valor.
- `libretranslate <command> --help` lista las banderas de un comando, con los valores permitidos de entradas de enum.

La salida de la herramienta va a stdout. Un error de herramienta va a stderr con código de salida 1.

## Ajustes únicos y un servidor en funcionamiento

`--base-url` y `--api-key` anular el medio ambiente y el archivo guardado para una ejecución del servidor en proceso.
Para usar un `libretranslate-mcp` que ya está corriendo sobre HTTP en lugar, pasar `--url http://127.0.0.1:3768/mcp` o
conjunto `LIBRETRANSLATE_MCP_URL`Estas banderas funcionan en cualquier lugar de la línea de comandos.

Ninguno de ellos se interpone en la configuración guardada: el CLI se niega a ejecutar herramientas sin ella, incluso
cuando `--url` o `--base-url` se da.

## Una instancia local

Con Docker instalado, `libretranslate service up` carreras LibreTranslate en un contenedor y apunta el CLI en él. See
[`libretranslate service`](./service.md).

## Gestión del servidor

`libretranslate mcp` es interceptado antes de que se haga cualquier conexión. Configura el servidor, lo ejecuta en el
fondo, lo inicia en el login y lo registra en sus clientes MCP. See [`libretranslate mcp`](./mcp-commands.md).
