---
sidebar_position: 3
title: libretranslate Service
description: "libretranslate service: run LibreTranslate lokal in einem Docker-Container mit Up, Down, Status und Logs."
---

# `libretranslate service`

`libretranslate service` läuft a LibreTranslate Instanz auf Ihrem Computer, in einem Docker-Container, so dass das SDK,
der MCP-Server und die CLI etwas zu sprechen haben.

Es braucht [Docker](https://docs.docker.com/get-docker/)Ohne sie zeigt sich der Befehl nicht einmal in
`libretranslate --help`, und jeder unterbefehl überprüft zuerst, dass docker installiert ist und dass sein daemon
antwortet und sagt, was zu tun ist, wenn nicht.

```bash
npx libretranslate service up --languages en,pt,es   # create and start it, wait until it answers
npx libretranslate service status                    # container, image, URL, health (exit 3 when it does not answer)
npx libretranslate service logs --follow             # what it is doing (the first start downloads models)
npx libretranslate service down                      # stop it; --remove also deletes the container
```

Im Gegensatz zu den Tool-Befehlen benötigt es keine gespeicherte Konfiguration: So wird eine lokale Instanz überhaupt
gestartet.

## `up`

Das erste Mal zieht es das Bild (mit seinem Fortschritt) und erstellt dann den Container:

- Name `libretranslate`, veröffentlicht am `127.0.0.1` nur (Port 5000) oder `--port`;
- Mit den Sprachmodellen im `libretranslate-models` Volume, so dass sie einmal heruntergeladen werden;
- Nur mit dem `--languages` geladen gegeben, wodurch es viel schneller startet (Standard: jede Sprache);
- von `libretranslate/libretranslate:latest`, oder `--image`.

Dann wartet es auf `/health` Antwort (bis zu 15 Minuten), `--timeout <seconds>`; `--no-wait` Sie kehrt sofort zurück und
spart `http://localhost:<port>` als Instanz der CLI, wenn noch keine gespeichert ist. Wenn eine andere Instanz
gespeichert wird, behält sie sie und druckt die `libretranslate mcp config --base-url …` Linie zum Switch.

Wenn der Container bereits vorhanden ist, `up` erst beginnt: `--port`, `--languages` und `--image` wenn es erstellt
wird, so sagt es so. Um sie zu verändern, `libretranslate service down --remove` zuerst.

Die Instanz, die es ausführt, gibt keine API-Schlüssel aus, so dass nichts anderes benötigt wird.

## `down`

Stoppt den Container. `--remove` auch löscht; die Modelle bleiben im Volume ()`docker volume rm libretranslate-models`
löscht sie.

## `status` und `logs`

`status` druckt den Zustand des Containers, Bild, URL und ob `/health` Antworten und verlassen mit code 3, wenn dies
nicht der fall ist. `logs` Druckt die letzten 100 Zeilen ()`--tail <n>`), oder druckt neue mit `--follow` ()`-f`.
