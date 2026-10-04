---
sidebar_position: 3
title: service libretranslate
description: "service libretranslate: lancer LibreTranslate localement dans un contenant Docker, avec haut, bas, statut et logs."
---

# `libretranslate service`

`libretranslate service` fonctionne LibreTranslate instance sur votre machine, dans un conteneur Docker, donc le SDK, le
serveur MCP et le CLI ont quelque chose à discuter.

Il a besoin [Coq](https://docs.docker.com/get-docker/). Sans elle, la commande ne s'affiche même pas dans
`libretranslate --help`, et chaque sous-commande vérifie d'abord que Docker est installé et que son démon répond, disant
quoi faire quand non.

```bash
npx libretranslate service up --languages en,pt,es   # create and start it, wait until it answers
npx libretranslate service status                    # container, image, URL, health (exit 3 when it does not answer)
npx libretranslate service logs --follow             # what it is doing (the first start downloads models)
npx libretranslate service down                      # stop it; --remove also deletes the container
```

Contrairement aux commandes de l'outil, il n'a pas besoin d'une configuration sauvegardée : c'est ainsi qu'une instance
locale commence en premier lieu.

## `up`

La première fois, il tire l'image (avec son progrès), puis crée le conteneur:

- Nommé `libretranslate`, publié le `127.0.0.1` seulement (port 5000, ou `--port`);
- avec les modèles de langage `libretranslate-models` volume, donc ils sont téléchargés une fois;
- avec seulement `--languages` donné chargé, ce qui le rend plus rapide (par défaut: chaque langue);
- de `libretranslate/libretranslate:latest`ou `--image`.

Alors il attend `/health` répondre (jusqu'à 15 minutes, `--timeout <seconds>`; `--no-wait` retourne immédiatement), et
enregistre `http://localhost:<port>` comme l'exemple du CLI quand aucun n'est encore sauvé. Quand une autre instance est
sauvegardée, elle la conserve et imprime `libretranslate mcp config --base-url …` ligne à changer.

Lorsque le conteneur existe déjà, `up` Seulement commence : `--port`, `--languages` et `--image` appliquer quand il est
créé, donc il le dit. Pour les changer, `libretranslate service down --remove` D'abord.

L'instance qu'il exécute n'a pas de clés API, donc rien d'autre n'est nécessaire.

## `down`

Arrête le conteneur. `--remove` supprime également; les modèles restent dans le volume
(`docker volume rm libretranslate-models` les supprime).

## `status` et `logs`

`status` imprime l'état, l'image, l'URL du conteneur et si `/health` répond, et sort avec le code 3 quand il ne le fait
pas. `logs` imprime les 100 dernières lignes (`--tail <n>`), ou continue d'imprimer de nouvelles `--follow` (`-f`) .
