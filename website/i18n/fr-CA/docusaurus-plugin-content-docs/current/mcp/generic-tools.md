---
sidebar_position: 4
title: Outils génériques
description: "libretranslate_resources, libretranslate_describe et libretranslate_call: le brut LibreTranslate API, opération par opération."
---

# Outils génériques

Les outils curés couvrent ce dont un agent a habituellement besoin. Trois autres atteignent l'API brute, opération par
opération, comme la spécification le décrit:

1. **`libretranslate_resources`** liste les opérations (`translate`, `detect`, `listLanguages`, `getFrontendSettings`,
   `suggest`, `health`) . Avec `query`, seulement ceux qui correspondent.
2. **`libretranslate_describe`** donne la méthode d'une opération, le chemin, le schéma du corps et un exemple
   `libretranslate_call` Entrée. Avec `schema`, il élargit un schéma de la spécification (`depth` niveaux profonds, par
   défaut 3).
3. **`libretranslate_call`** exécute : `operation` est le `operationId` (`listLanguages`) ou `METHOD /path`
   (`GET /languages`), et `body` est le corps de demande JSON.

```json
{ "operation": "translate", "body": { "q": "Olá", "source": "pt", "target": "en", "alternatives": 2 } }
```

## Sécurité

- Les champs de corps inconnus sont refusés, de sorte qu'une typographie ne laisse pas tomber silencieusement un
  réglage.
- `api_key` est refusé : le serveur envoie lui-même la clé configurée, et les schémas la quittent.
- Opérations qui écrivent à l'instance (`suggest`) besoin `confirm: true`L'agent doit te demander d'abord.
- Le téléchargement de fichier est laissé hors du catalogue : `libretranslate_translate_file` couvre d'un chemin local.
- Une longue réponse est coupée à 60 000 caractères, le disant.

Le catalogue est généré à partir de la même spécification OpenAPI que le SDK (`pnpm codegen:mcp`) .
