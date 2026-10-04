---
sidebar_position: 4
title: Erreurs
description: "LibreTrailApiError et les autres classes d'erreur, les statuts d'une instance répondent, et comment la clé API est masquée."
---

# Erreurs

| Classe                       | Quand                                                  |
| ---------------------------- | ------------------------------------------------------ |
| `LibreTranslateApiError`     | Une réponse non-2xx                                    |
| `LibreTranslateConfigError`  | Configuration non valide : URL manquante ou mal formée |
| `LibreTranslateTimeoutError` | Aucune réponse `timeoutMs`                             |

`LibreTranslateApiError` porte `status`, `method`, `path` (sans la chaîne de requête) et la réponse `body`.
LibreTranslate répond aux erreurs comme `{ "error": "<message>" }`, et ce message est celui de l'erreur.

| État | Habituellement                                                                         |
| ---- | -------------------------------------------------------------------------------------- |
| 400  | Un paramètre manquant ou invalide, un fichier non pris en charge ou une clé est requis |
| 403  | La clé API est invalide, ou le client est interdit                                     |
| 429  | Trop de demandes : attendez et réessayez                                               |
| 500  | La traduction a échoué sur l'instance                                                  |

```ts
import { LibreTranslateApiError } from "@hoyasumii/libretranslate";

try {
  await lt.translate({ q: "Olá", target: "en" });
} catch (error) {
  if (error instanceof LibreTranslateApiError && error.status === 429) {
    // back off and retry
  } else throw error;
}
```

## La clé API ne s'affiche jamais

Chaque message d'erreur et `body` Passez par `redact`: les valeurs des clés telles que `api_key` devenir `***`, ainsi
que toute occurrence littérale de la propre clé du client, à l'intérieur des chaînes aussi. `redact` est exporté pour
vos propres grumes:

```ts
import { redact } from "@hoyasumii/libretranslate";

console.log(redact(payload, [process.env.LIBRETRANSLATE_API_KEY!]));
```
