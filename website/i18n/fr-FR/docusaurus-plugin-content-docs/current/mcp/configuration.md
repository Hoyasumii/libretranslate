---
sidebar_position: 5
title: Configuration
description: "Les paramètres du serveur et du CLI lisent, où ils sont enregistrés, et l'ordre dans lequel ils sont résolus."
---

# Configuration

Chaque réglage provient d'un drapeau, puis de l'environnement, puis du fichier `libretranslate mcp config` sauvé, puis
par défaut.

| Variable                 | Pourquoi                                                           | Par défaut                     |
| ------------------------ | ------------------------------------------------------------------ | ------------------------------ |
| `LIBRETRANSLATE_URL`     | URL de l'instance                                                  | `http://localhost:5000`        |
| `LIBRETRANSLATE_API_KEY` | La clé API, pour les cas qui émettent des clés                     | aucune                         |
| `PORT`                   | Le port HTTP                                                       | `3768`                         |
| `LIBRETRANSLATE_CONFIG`  | Où la configuration sauvée vit (aussi `--config`)                  | voir ci-dessous                |
| `LIBRETRANSLATE_MCP_URL` | Pour le CLI : une course `libretranslate-mcp` à utiliser (`--url`) | serveur en cours de traitement |

Une instance auto-accueillée n'a généralement pas besoin de clé. Un hôte, comme libretranslate.com, fait: sans elle
chaque traduction répond 400. `libretranslate status` Ça dit quoi.

## Où il est sauvé

- `~/.config/libretranslate/.env` sur Linux;
- `~/Library/Application Support/libretranslate/.env` sur macOS;
- `%APPDATA%\libretranslate\.env` sous Windows;
- ou où que ce soit `LIBRETRANSLATE_CONFIG`/`--config` et des points.

Le fichier est écrit en mode 0600 (sur Windows l'ACL du dossier le protège).

La clé API n'apparaît jamais dans les erreurs, les journaux, `--help` ou le formulaire de configuration.
