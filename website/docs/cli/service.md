---
sidebar_position: 3
title: libretranslate service
description: "libretranslate service: run LibreTranslate locally in a Docker container, with up, down, status and logs."
---

# `libretranslate service`

`libretranslate service` runs a LibreTranslate instance on your machine, in a Docker container, so the SDK, the MCP
server and the CLI have something to talk to.

It needs [Docker](https://docs.docker.com/get-docker/). Without it, the command does not even show in
`libretranslate --help`, and every subcommand first checks that Docker is installed and that its daemon answers,
saying what to do when not.

```bash
npx libretranslate service up --languages en,pt,es   # create and start it, wait until it answers
npx libretranslate service status                    # container, image, URL, health (exit 3 when it does not answer)
npx libretranslate service logs --follow             # what it is doing (the first start downloads models)
npx libretranslate service down                      # stop it; --remove also deletes the container
```

Unlike the tool commands, it needs no saved configuration: it is how a local instance gets started in the first
place.

## `up`

The first time, it pulls the image (with its progress), then creates the container:

- named `libretranslate`, published on `127.0.0.1` only (port 5000, or `--port`);
- with the language models in the `libretranslate-models` volume, so they are downloaded once;
- with only the `--languages` given loaded, which makes it start much faster (default: every language);
- from `libretranslate/libretranslate:latest`, or `--image`.

Then it waits for `/health` to answer (up to 15 minutes, `--timeout <seconds>`; `--no-wait` returns at once), and
saves `http://localhost:<port>` as the CLI's instance when none is saved yet. When another instance is saved, it
keeps it and prints the `libretranslate mcp config --base-url …` line to switch.

When the container already exists, `up` only starts it: `--port`, `--languages` and `--image` apply when it is
created, so it says so. To change them, `libretranslate service down --remove` first.

The instance it runs issues no API keys, so nothing else is needed.

## `down`

Stops the container. `--remove` also deletes it; the models stay in the volume
(`docker volume rm libretranslate-models` deletes them).

## `status` and `logs`

`status` prints the container's state, image, URL and whether `/health` answers, and exits with code 3 when it does
not. `logs` prints the last 100 lines (`--tail <n>`), or keeps printing new ones with `--follow` (`-f`).
