---
sidebar_position: 1
title: Aperçu général
description: "Les LibreTranslate Serveur MCP : ses transports, ses outils et le mode HTTP."
---

# Serveur MCP

`libretranslate-mcp` donne Claude Code, Codex, OpenCode ou tout autre client MCP traduction automatique LibreTranslate -
Oui.

```bash
libretranslate-mcp            # stdio: what the MCP client runs
libretranslate-mcp --http     # http://127.0.0.1:3768/mcp (PORT changes the port)
libretranslate mcp start      # the same in the background; stop/status; boot enable to start it at login
```

## Outils

| Outil                                                                          | Pourquoi                                                                            |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `libretranslate_translate`                                                     | Un texte ou une liste, avec `auto` détection, HTML et alternatives                  |
| `libretranslate_translate_file`                                                | Un document local, enregistré à côté de l'original comme `<name>.<target><ext>`     |
| `libretranslate_detect`                                                        | Les langues candidates d'un texte                                                   |
| `libretranslate_languages`                                                     | Les codes linguistiques, ou les cibles d'une source                                 |
| `libretranslate_status`                                                        | Santé, qu'une clé soit nécessaire, la limite de caractères, les formats de fichiers |
| `libretranslate_suggest`                                                       | Envoie une meilleure traduction lorsque l'utilisateur le demande                    |
| `libretranslate_resources` / `libretranslate_describe` / `libretranslate_call` | L'API brute, opération par opération                                                |

- [Outils](./tools.md): les outils sélectionnés en détail.
- [Outils génériques](./generic-tools.md): l'API brute.

## Le mode HTTP

- Il est apatride et écoute `127.0.0.1` Seulement.
- Il refuse `Host` qui n'est pas loopback, contre la reliure DNS.
- `GET /health` réponses `{ ok, baseUrl, apiKey, version }`, `apiKey` indiquant si un est configuré.
- `POST /shutdown` avec le jeton `libretranslate mcp start` génère la ferme ; c'est ainsi que `libretranslate mcp
stop` arrête le serveur, Windows inclus.

En mode stdio, stdout porte le protocole : le serveur se connecte uniquement à stderr.

Les erreurs ne portent jamais la clé API : chaque erreur d'outil passe par le même masquage que celui du SDK.
