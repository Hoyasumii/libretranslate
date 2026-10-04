---
sidebar_position: 2
title: Traducción
description: "Traducir textos y listas, detectar el lenguaje fuente, HTML, alternativas, códigos de idiomas y sugerencias."
---

# Traducción

## Texto

```ts
const result = await lt.translate({ q: "Olá, mundo!", target: "en" });
result.translatedText; // "Hello, world!"
result.detectedLanguage; // { language: "pt", confidence: 90 }
```

`source` predeterminados a `auto`: el caso detecta el lenguaje y dice lo que encontró en `detectedLanguage`. `source`
cuando lo sabes, que es más rápido y evita una conjetura equivocada en textos cortos.

## Varios textos

`translateMany` envía una lista en una solicitud y respuestas listas en el mismo orden:

```ts
const { translatedText } = await lt.translateMany({ q: ["Bom dia", "Boa noite"], source: "pt", target: "es" });
// ["Buenos días", "Buenas noches"]
```

Con `source: "auto"`, `detectedLanguage` es una lista también, uno por texto.

## HTML

`format: "html"` mantiene el marcado y traduce sólo el texto dentro de él:

```ts
await lt.translate({ q: '<p class="lead">Olá!</p>', source: "pt", target: "en", format: "html" });
// '<p class="lead">Hello!</p>'
```

## Alternativas

`alternatives: n` pide hasta `n` otras traducciones además de la principal:

```ts
const { translatedText, alternatives } = await lt.translate({ q: "Olá", source: "pt", target: "it", alternatives: 2 });
// "Ciao", ["Salve", "Pronto"]
```

## Detección

```ts
const candidates = await lt.detect("Bonjour tout le monde");
// [{ language: "fr", confidence: 92 }, …]
```

## Códigos de idioma

`languages()` lista cada idioma fuente con los códigos a los que se traduce. Use esos códigos como `source` y `target`
(incluidos los regionales, como `pt-BR` o `zh-Hant`).

```ts
const languages = await lt.languages();
const portuguese = languages.find((language) => language.code === "pt");
portuguese?.targets; // ["en", "es", …]
```

## Limits

`settings()` dice lo que la instancia permite:

- `charLimit`: los más caracteres que una solicitud puede llevar (`-1` no es límite). Dividir textos más largos, por
  ejemplo por párrafo con `translateMany`.
- `keyRequired`: si se necesita una clave de API. Sin uno, la instancia responde 400.
- `suggestions`: si `suggest` es aceptado.

## Propuestas

```ts
await lt.suggest({ q: "Olá", s: "Hi", source: "pt", target: "en" });
```

Envía una mejor traducción al caso, que lo mantiene. Sólo los casos con sugerencias permitieron aceptarlo.
