---
sidebar_position: 1
title: Début
description: "Un non officiel TypeScript SDK pour le LibreTranslate API, avec un serveur MCP et un CLI construit dessus : ce que chaque partie fait et comment l'installer."
slug: /intro
---

# Début

`@hoyasumii/libretranslate` est TypeScript SDK pour le [LibreTranslate](https://libretranslate.com) API HTTP, avec un
serveur MCP et un CLI en plus. Utilisez-le à partir du code, d'un agent d'IA ou de votre terminal : les trois partagent
le même client.

- **SDK**: méthodes dactylographiées pour traduire des textes et des listes, détecter des langues, traduire des fichiers
  et envoyer des suggestions. Il est généré par [orval](https://orval.dev) d'une spécification OpenAPI écrite pour ce
  paquet, et envoie votre clé API lorsque l'instance en a besoin. Commencez par [SDK](./sdk/overview.md).
- **Serveur MCP** (`@hoyasumii/libretranslate/mcp`, boîte `libretranslate-mcp`): stdio ou HTTP Streamable sur
  `127.0.0.1`. Outils pour traduire des textes et des documents, détecter les langues et vérifier l'instance, ainsi que
  des outils génériques pour l'API brute. Commencez par [Serveur MCP](./mcp/overview.md).
- **CLI** (`libretranslate`): chaque outil MCP comme sous-commande, plus `libretranslate mcp` pour configurer le
  serveur, l'exécuter en arrière-plan, le démarrer à la connexion et l'enregistrer dans Claude Code, Codex et OpenCode.
  Commence par [CLI](./cli/overview.md).

C'est un indépendant, **non officielle** client, MIT sous licence. Il parle à une LibreTranslate instance sur HTTP et ne
contient aucun code de la LibreTranslate Projet.

## A LibreTranslate instance

Vous avez besoin d'une instance pour parler à:

- **Votre propre**Avec Docker : `docker run -p 5000:5000 libretranslate/libretranslate` sert `http://localhost:5000`,
  l'URL que ce paquet utilise par défaut. Il n'a pas besoin de clé API.
- **Avec ce CLI**, lorsque Docker est installé: `libretranslate service up --languages en,pt,es` fait la même chose et
  enregistre l'URL (voir [`libretranslate service`](./cli/service.md)) .
- **Un hôte**, comme [libretranslate.com](https://libretranslate.com), qui nécessite une clé API.

## Installation

Nécessaire Node.js 20 ou plus.

```bash
npm i -g @hoyasumii/libretranslate     # or: pnpm add -g @hoyasumii/libretranslate
libretranslate mcp config              # the instance URL and, if it issues keys, an API key; saved per user
libretranslate mcp install             # registers the server (stdio) in Claude Code / Codex / OpenCode
```

Comme bibliothèque, `npm install @hoyasumii/libretranslate`.

## Un premier appel

```ts
import { createLibreTranslateClient } from "@hoyasumii/libretranslate";

const lt = createLibreTranslateClient({ baseUrl: "http://localhost:5000" });
const { translatedText, detectedLanguage } = await lt.translate({ q: "Olá, mundo!", target: "en" });
// "Hello, world!", { language: "pt", confidence: 90 }
```

Depuis le terminal, une fois `libretranslate mcp config` a enregistré une configuration :

```bash
libretranslate translate --q "Olá, mundo!" --target en
libretranslate languages --source pt
```

`libretranslate docs` ouvre ce site.
