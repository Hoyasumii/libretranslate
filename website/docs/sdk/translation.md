---
sidebar_position: 2
title: Translation
description: "Translating texts and lists, detecting the source language, HTML, alternatives, language codes and suggestions."
---

# Translation

## One text

```ts
const result = await lt.translate({ q: "Olá, mundo!", target: "en" });
result.translatedText; // "Hello, world!"
result.detectedLanguage; // { language: "pt", confidence: 90 }
```

`source` defaults to `auto`: the instance detects the language and says which it found in `detectedLanguage`. Give
`source` when you know it, which is faster and avoids a wrong guess on short texts.

## Several texts

`translateMany` sends a list in one request and answers lists in the same order:

```ts
const { translatedText } = await lt.translateMany({ q: ["Bom dia", "Boa noite"], source: "pt", target: "es" });
// ["Buenos días", "Buenas noches"]
```

With `source: "auto"`, `detectedLanguage` is a list too, one per text.

## HTML

`format: "html"` keeps the markup and translates only the text inside it:

```ts
await lt.translate({ q: '<p class="lead">Olá!</p>', source: "pt", target: "en", format: "html" });
// '<p class="lead">Hello!</p>'
```

## Alternatives

`alternatives: n` asks for up to `n` other translations besides the main one:

```ts
const { translatedText, alternatives } = await lt.translate({ q: "Olá", source: "pt", target: "it", alternatives: 2 });
// "Ciao", ["Salve", "Pronto"]
```

## Detection

```ts
const candidates = await lt.detect("Bonjour tout le monde");
// [{ language: "fr", confidence: 92 }, …]
```

## Language codes

`languages()` lists every source language with the codes it translates into. Use those codes as `source` and
`target` (they include regional ones, such as `pt-BR` or `zh-Hant`).

```ts
const languages = await lt.languages();
const portuguese = languages.find((language) => language.code === "pt");
portuguese?.targets; // ["en", "es", …]
```

## Limits

`settings()` tells what the instance allows:

- `charLimit`: the most characters one request may carry (`-1` is no limit). Split longer texts, for instance by
  paragraph with `translateMany`.
- `keyRequired`: whether an API key is needed. Without one, the instance answers 400.
- `suggestions`: whether `suggest` is accepted.

## Suggestions

```ts
await lt.suggest({ q: "Olá", s: "Hi", source: "pt", target: "en" });
```

Sends a better translation back to the instance, which keeps it. Only instances with suggestions enabled accept it.
