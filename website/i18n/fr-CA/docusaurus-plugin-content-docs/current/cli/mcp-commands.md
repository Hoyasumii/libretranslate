---
sidebar_position: 2
title: libretranslate mcp
description: "libretranslate mcp : enregistrez la configuration, lancez le serveur en arrière-plan, démarrez-la à la connexion et enregistrez-la dans vos clients MCP."
---

# `libretranslate mcp`

`libretranslate mcp` gère le serveur MCP pour vous : sa configuration sauvegardée, un serveur HTTP de fond, un service
de connexion et son enregistrement dans vos clients MCP.

```bash
npx libretranslate mcp config                 # asks for the settings in the terminal and saves them
npx libretranslate mcp config --base-url http://localhost:5000 --port 4000   # no prompts (scripts, CI): saves just these
npx libretranslate mcp config --web           # the same, in a local web form
npx libretranslate mcp install                # pick Claude Code / Codex / OpenCode and register libretranslate-mcp (stdio) in them
npx libretranslate mcp install --client claude,opencode --force   # no picker (scripts, CI); --force replaces an entry
npx libretranslate mcp uninstall              # pick the clients to remove the 'libretranslate' entry from (no saved config needed)
npx libretranslate mcp start                  # start in the background (needs a saved config); prints the URL for `claude mcp add`
npx libretranslate mcp start --api-key other --port 4000   # one-off values, never saved
npx libretranslate mcp status                 # running or stopped (exit 3), URL, pid, uptime
npx libretranslate mcp stop
npx libretranslate mcp boot enable            # start at every login; `boot disable` / `boot status`
```

## `libretranslate mcp config`

Écrit le sauvé `.env` ([Configuration](../mcp/configuration.md)) . Il fonctionne de trois façons:

- **Dans le terminal** (par défaut). Il demande à chaque réglage à son tour, à partir des valeurs enregistrées
  (`http://localhost:5000` pour une nouvelle URL). La clé de l'API est tapée masquée : entrez garde celui qui est
  enregistré (ou ne laisse aucun), et `-` C'est clair.
- **Avec des drapeaux.** Compte tenu de `--base-url`, `--api-key` (`-` soit `--port`, il ne demande rien et sauve juste
  ceux-là. Sans terminal, il en a besoin. Une clé passée comme un drapeau reste dans votre histoire de coquille, alors
  préférez l'invite pour elle.
- **Sous une forme web** avec `--web`: page locale, ouverte dans le navigateur (`--no-open` pour imprimer seulement son
  URL). Un secret vide garde celui qui est sauvé.

Si un serveur fonctionne, il le dit : redémarrez-le pour récupérer les modifications. `--config <file>` (ou
`LIBRETRANSLATE_CONFIG`) écrit un autre fichier.

## `libretranslate mcp install`

Détecte chaque client en exécutant son `--version`, et enregistre le serveur stdio à travers le propre CLI du client,
sous le nom `libretranslate`:

| Client      | Commande qu'il exécute      |
| ----------- | --------------------------- |
| Claude Code | `claude mcp add -s user`    |
| Codex       | `codex mcp add`             |
| OpenCode    | `opencode mcp add --global` |

La commande enregistrée est : `node <package>/dist/mcp/cli.js` par chemin absolu, sans justificatif: le serveur lit le
fichier enregistré lorsque le client le lance (`LIBRETRANSLATE_CONFIG` est passé seulement lorsque `--config` Nomme un
autre fichier).

Chaque client trouvé commence à coché. Un qui a déjà `libretranslate` l'entrée est marquée
`already installed, reinstalls` et le remplace. Sans terminal interactif, `--client` est nécessaire (`claude`, `codex`,
`opencode`; dans WSL aussi `claude@windows`, `codex@windows`, `opencode@windows`), plus `--force` remplacer une entrée.
`--dry-run` imprime les commandes au lieu de les exécuter.

Les deux `install` et `uninstall` travailler sur la configuration au niveau utilisateur (global) de chaque client. Les
entrées projetées ne sont jamais touchées.

## `libretranslate mcp uninstall`

Liste les clients avec un `libretranslate` entrée, indiquant si elle est `stdio` ou `http`, et supprime toute entrée de
ce nom: `claude mcp remove -s user`, `codex mcp remove`et pour OpenCode (qui n'a pas `remove`) une modification de son
fichier de configuration global qui supprime seulement cette clé, en conservant les commentaires et la disposition.

C'est la seule commande en plus `libretranslate mcp config` qui fonctionne sans configuration sauvegardée, donc un
client peut être nettoyé après que la configuration est partie. `--client` et `--dry-run` travail `install`.

## `libretranslate mcp start`, `stop` et `status`

`start` exécute le serveur HTTP détaché, avec son pid et se connecter `<config dir>/run/`, et imprime son URL, son
fichier journal et le `claude mcp add` ligne pour l'enregistrer. Il faut une configuration sauvegardée. `--api-key`,
`--base-url` et `--port` ne le remplace que pour cette course, et ne sont jamais sauvés. `--foreground` sert plutôt dans
le processus actuel.

`status` affiche si le serveur fonctionne, avec son URL, pid et uptime, et sort avec le code 3 quand il n'est pas.
`stop` demande au serveur de fermer à travers un jeton gardé `POST /shutdown`, et ne signale le processus que si cela
échoue.

## `libretranslate mcp boot`

`boot enable` installe un service de l'utilisateur actuel qui démarre le serveur à chaque connexion, donc aucun sudo
n'est nécessaire:

| OS       | Services                                                                       |
| -------- | ------------------------------------------------------------------------------ |
| Linux    | une unité utilisateur système (sur WSL, activer systèmed dans `/etc/wsl.conf`) |
| MACOS    | un Agent de lancement                                                          |
| Fenêtres | une tâche de logon                                                             |

Le service ne lit que la configuration enregistrée. `boot disable` le retire et `boot status` le signale.
