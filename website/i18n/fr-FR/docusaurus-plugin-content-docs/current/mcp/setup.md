---
sidebar_position: 2
title: Configuration
description: "Enregistrer vos paramètres une fois et enregistrer le LibreTranslate Serveur MCP dans Claude Code, Codex et OpenCode."
---

# Configuration

## La voie rapide

Enregistrez vos paramètres une fois, puis laissez le CLI enregistrer le serveur dans les clients qu'il trouve:

```bash
npx libretranslate mcp config    # asks for the instance URL, an API key if it issues keys, and a port
npx libretranslate mcp install   # finds Claude Code, Codex and OpenCode on your PATH and registers libretranslate-mcp (stdio)
```

`install` montre une liste des clients qu'il a trouvés. Cochez ceux que vous voulez, et il enregistre le serveur à
travers le CLI propre de chaque client, sous le nom `libretranslate`. La commande enregistrée lit la configuration
enregistrée lorsque le client la lance, donc aucune clé API ne se retrouve dans la configuration du client. Voir
[`libretranslate mcp install`](../cli/mcp-commands.md#libretranslate-mcp-install) pour les drapeaux.

## À la main: stdio

Laissez le client commencer `libretranslate-mcp`. Il lit la configuration enregistrée, donc la configuration du client
n'a pas besoin de clés:

```json
{
  "mcpServers": {
    "libretranslate": { "command": "npx", "args": ["-y", "-p", "@hoyasumii/libretranslate", "libretranslate-mcp"] }
  }
}
```

En Claude Code:

```bash
claude mcp add libretranslate -- npx -y -p @hoyasumii/libretranslate libretranslate-mcp
```

Sans configuration enregistrée, le serveur utilise `http://localhost:5000` et pas de clé. Pour le pointer ailleurs, ou
pour surcharger le fichier sauvegardé, donnez au client une `env` bloc (voir [Configuration](./configuration.md)) :

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

## À la main : HTTP

Exécutez un serveur en arrière-plan et pointez vos clients à son URL:

```bash
npx libretranslate mcp start          # prints the URL, http://127.0.0.1:3768/mcp by default
claude mcp add --transport http libretranslate http://127.0.0.1:3768/mcp
```

Sans le CLI, `libretranslate-mcp --http` l'exécute au premier plan avec les paramètres depuis l'environnement ou la
configuration enregistrée. `libretranslate-mcp --help` liste les drapeaux. Pour démarrer le serveur à chaque connexion,
lancez `npx libretranslate mcp boot enable` (voir
[`libretranslate mcp boot`](../cli/mcp-commands.md#libretranslate-mcp-boot)) .

## Vérification du fonctionnement

Demandez à votre agent d'appeler `libretranslate_status`, ou l'exécuter depuis le terminal:

```bash
npx libretranslate status
```

Il répond à l'URL de l'instance, si une clé est configurée et requise, la limite de caractères et les formats de
fichiers.
