---
sidebar_position: 3
title: servicio de libre traducción
description: "libretranslated service: run LibreTranslate localmente en un contenedor Docker, con arriba, abajo, estado y registros."
---

# `libretranslate service`

`libretranslate service` corre a LibreTranslate instancia en su máquina, en un contenedor Docker, por lo que el SDK, el
servidor MCP y el CLI tienen algo que hablar.

Necesita [Docker](https://docs.docker.com/get-docker/). Sin ella, el comando ni siquiera aparece
`libretranslate --help`, y cada subcomandante primero comprueba que Docker está instalado y que su daemon responde,
diciendo qué hacer cuando no.

```bash
npx libretranslate service up --languages en,pt,es   # create and start it, wait until it answers
npx libretranslate service status                    # container, image, URL, health (exit 3 when it does not answer)
npx libretranslate service logs --follow             # what it is doing (the first start downloads models)
npx libretranslate service down                      # stop it; --remove also deletes the container
```

A diferencia de los comandos de la herramienta, no necesita configuración guardada: es como se inicia una instancia
local en primer lugar.

## `up`

La primera vez, tira la imagen (con su progreso), crea el contenedor:

- llamado `libretranslate`, publicado en `127.0.0.1` sólo (puerto 5000, o `--port`);
- con los modelos de idiomas `libretranslate-models` volumen, por lo que se descargan una vez;
- con sólo el `--languages` dado cargado, lo que hace que comience mucho más rápido (por defecto: cada idioma);
- desde `libretranslate/libretranslate:latest`o `--image`.

Entonces espera por `/health` para responder (hasta 15 minutos, `--timeout <seconds>`; `--no-wait` regresa a la vez), y
salva `http://localhost:<port>` como el caso del CLI cuando ninguno se salva todavía. Cuando se salva otra instancia, la
guarda e imprime `libretranslate mcp config --base-url …` línea para cambiar.

Cuando el contenedor ya existe, `up` sólo comienza: `--port`, `--languages` y `--image` aplicar cuando se crea, así que
lo dice. Para cambiarlos, `libretranslate service down --remove` primero.

La instancia que ejecuta no tiene claves de API, así que nada más es necesario.

## `down`

Detiene el contenedor. `--remove` también lo elimina; los modelos permanecen en el volumen
(`docker volume rm libretranslate-models` eliminarlos).

## `status` y `logs`

`status` imprime el estado, imagen, URL del contenedor y si `/health` respuestas y salidas con el código 3 cuando no lo
hace. `logs` imprime las últimas 100 líneas (`--tail <n>`), o sigue imprimiendo nuevos con `--follow` (G)`-f`).
