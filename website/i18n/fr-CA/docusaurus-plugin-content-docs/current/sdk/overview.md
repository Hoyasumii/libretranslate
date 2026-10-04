---
sidebar_position: 1
title: Aperçu général
description: "Les LibreTranslate client: ses options, ses méthodes et comment il est généré à partir de la spécification OpenAPI par orval."
---

# SDK

```ts
import { createLibreTranslateClient } from "@hoyasumii/libretranslate";

const lt = createLibreTranslateClient({
  baseUrl: "https://libretranslate.example.com",
  apiKey: process.env.LIBRETRANSLATE_API_KEY, // only for instances that issue keys
});

const { translatedText } = await lt.translate({ q: "Bom dia", source: "pt", target: "en" });
const languages = await lt.languages();
const settings = await lt.settings();
```

`baseUrl` est l'URL de l'instance, avec son chemin de base s'il en a un (`https://example.com/translate`) .
`createLibreTranslateClientFromEnv()` lit `LIBRETRANSLATE_URL` (par défaut) `http://localhost:5000`) et
`LIBRETRANSLATE_API_KEY`.

## Options

| Option      | Pourquoi                                                                                 |
| ----------- | ---------------------------------------------------------------------------------------- |
| `baseUrl`   | URL de l'instance (obligatoire)                                                          |
| `apiKey`    | La clé API, pour les cas qui délivrent des clés ; envoyé dans le corps de chaque requête |
| `timeoutMs` | Délai par demande, par défaut 60000; `0` ou `Infinity` Éteins-le.                        |
| `fetch`     | Une alternative `fetch` (tests, proxy)                                                   |

Chaque méthode prend aussi une dernière `{ signal }` argument, pour annuler l'appel avec un `AbortSignal`.

## Méthodes

| Méthode                                                     | Pourquoi                                                            |
| ----------------------------------------------------------- | ------------------------------------------------------------------- |
| `translate({ q, source?, target, format?, alternatives? })` | Un texte ([Traduction](./translation.md))                           |
| `translateMany({ q: string[], … })`                         | Plusieurs textes en une seule demande                               |
| `detect(text)`                                              | Les langues candidates, très probablement d'abord                   |
| `languages()`                                               | Chaque langue source, avec les codes qu'elle traduit en             |
| `translateFile({ file, filename?, source?, target })`       | Télécharger un document ([Fichiers](./files.md))                    |
| `downloadFile(url)`                                         | Télécharger un fichier traduit en octets                            |
| `suggest({ q, s, source, target })`                         | Envoyer une meilleure traduction (lorsque l'instance les accepte)   |
| `settings()`                                                | Clé requise, limite de caractères, formats de fichiers, suggestions |
| `health()`                                                  | `{ status: "ok" }` lorsque l'instance est en place                  |
| `call(operationId, body?)`                                  | Toute opération effectuée par `operationId`, avec le corps brut     |

Une réponse non-2xx devient `LibreTranslateApiError` (voir [Erreurs](./errors.md)) .

## Comment il est généré

Le paquet garde son propre OpenAPI 3.1 description de l'API dans `spec/openapi.yml`, écrit à partir de la documentation
publique API. [orval](https://orval.dev) La transforme en :

- `src/generated/endpoints.ts`: une fonction par opération, toutes envoyant le paquet `fetch` wrapper, qui ajoute l'URL
  de base, le timeout et la gestion des erreurs;
- `src/generated/model/`: les types de demande et de réponse (`TranslateRequest`, `Detection`, `FrontendSettings`, ...),
  exportés du colis;
- `src/generated/zod.ts`: zod schémas de chaque demande, que les outils MCP utilisent comme entrées.

Le client ci-dessus enveloppe ces fonctions par défaut (`source: "auto"`) et la clé API. Pour chaque type et fonction
exportés, voir la [Référence API](pathname://../../docs/api).
