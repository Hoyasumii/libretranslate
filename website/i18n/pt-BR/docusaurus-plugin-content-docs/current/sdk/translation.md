---
sidebar_position: 2
title: Tradução
description: "Traduzir textos e listas, detectar o idioma de origem, HTML, alternativas, códigos de idioma e sugestões."
---

# Tradução

## Um texto

```ts
const result = await lt.translate({ q: "Olá, mundo!", target: "en" });
result.translatedText; // "Hello, world!"
result.detectedLanguage; // { language: "pt", confidence: 90 }
```

`source` tem `auto` como padrão: a instância detecta o idioma e diz qual encontrou em `detectedLanguage`. Informe
`source` quando souber: é mais rápido e evita um palpite errado em textos curtos.

## Vários textos

`translateMany` envia uma lista numa requisição e responde listas na mesma ordem:

```ts
const { translatedText } = await lt.translateMany({ q: ["Bom dia", "Boa noite"], source: "pt", target: "es" });
// ["Buenos días", "Buenas noches"]
```

Com `source: "auto"`, `detectedLanguage` também é uma lista, uma por texto.

## HTML

`format: "html"` mantém a marcação e traduz só o texto dentro dela:

```ts
await lt.translate({ q: '<p class="lead">Olá!</p>', source: "pt", target: "en", format: "html" });
// '<p class="lead">Hello!</p>'
```

## Alternativas

`alternatives: n` pede até `n` outras traduções além da principal:

```ts
const { translatedText, alternatives } = await lt.translate({ q: "Olá", source: "pt", target: "it", alternatives: 2 });
// "Ciao", ["Salve", "Pronto"]
```

## Detecção

```ts
const candidates = await lt.detect("Bonjour tout le monde");
// [{ language: "fr", confidence: 92 }, …]
```

## Códigos de idioma

`languages()` lista cada idioma de origem com os códigos para os quais ele traduz. Use esses códigos como `source` e
`target` (há códigos regionais, como `pt-BR` ou `zh-Hant`).

```ts
const languages = await lt.languages();
const portuguese = languages.find((language) => language.code === "pt");
portuguese?.targets; // ["en", "es", …]
```

## Limites

`settings()` diz o que a instância permite:

- `charLimit`: o máximo de caracteres numa requisição (`-1` é sem limite). Divida textos maiores, por exemplo por
  parágrafo com `translateMany`.
- `keyRequired`: se uma API key é necessária. Sem ela, a instância responde 400.
- `suggestions`: se `suggest` é aceito.

## Sugestões

```ts
await lt.suggest({ q: "Olá", s: "Hi", source: "pt", target: "en" });
```

Envia uma tradução melhor de volta para a instância, que a guarda. Só instâncias com sugestões habilitadas aceitam.
