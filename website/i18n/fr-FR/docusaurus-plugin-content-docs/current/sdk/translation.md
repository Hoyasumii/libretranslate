---
sidebar_position: 2
title: Traduction
description: "Traduire des textes et des listes, détecter la langue source, HTML, alternatives, codes de langue et suggestions."
---

# Traduction

## Un texte

```ts
const result = await lt.translate({ q: "Olá, mundo!", target: "en" });
result.translatedText; // "Hello, world!"
result.detectedLanguage; // { language: "pt", confidence: 90 }
```

`source` par défaut à `auto`: l'instance détecte la langue et dit ce qu'elle a trouvé dans `detectedLanguage`. Donner
`source` quand vous le savez, ce qui est plus rapide et évite une mauvaise idée sur les courts textes.

## Plusieurs textes

`translateMany` envoie une liste dans une requête et des listes de réponses dans le même ordre:

```ts
const { translatedText } = await lt.translateMany({ q: ["Bom dia", "Boa noite"], source: "pt", target: "es" });
// ["Buenos días", "Buenas noches"]
```

Avec `source: "auto"`, `detectedLanguage` est aussi une liste, une par texte.

## HTML

`format: "html"` garde le balisage et ne traduit que le texte à l'intérieur:

```ts
await lt.translate({ q: '<p class="lead">Olá!</p>', source: "pt", target: "en", format: "html" });
// '<p class="lead">Hello!</p>'
```

## Solutions de remplacement

`alternatives: n` demande jusqu'à `n` autres traductions en plus de la traduction principale:

```ts
const { translatedText, alternatives } = await lt.translate({ q: "Olá", source: "pt", target: "it", alternatives: 2 });
// "Ciao", ["Salve", "Pronto"]
```

## Détection

```ts
const candidates = await lt.detect("Bonjour tout le monde");
// [{ language: "fr", confidence: 92 }, …]
```

## Codes linguistiques

`languages()` liste chaque langue source avec les codes qu'elle traduit. Utilisez ces codes comme `source` et `target`
(y compris les régions, `pt-BR` ou `zh-Hant`) .

```ts
const languages = await lt.languages();
const portuguese = languages.find((language) => language.code === "pt");
portuguese?.targets; // ["en", "es", …]
```

## Limites

`settings()` indique ce que l'instance permet :

- `charLimit`: le plus grand nombre de caractères qu'une demande peut porter (`-1` n'est pas limite). Diviser les textes
  plus longs, par exemple par paragraphe avec `translateMany`.
- `keyRequired`: si une clé API est nécessaire. Sans un, l'instance répond 400.
- `suggestions`: si `suggest` est accepté.

## Propositions

```ts
await lt.suggest({ q: "Olá", s: "Hi", source: "pt", target: "en" });
```

Envoie une meilleure traduction à l'instance, qui la garde. Seules les instances avec des suggestions activées
l'acceptent.
