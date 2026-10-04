---
sidebar_position: 2
title: Tradução
description: "Traduzindo textos e listas, detectando a língua de origem, HTML, alternativas, códigos de linguagem e sugestões."
---

# Tradução

## Um texto

```ts
const result = await lt.translate({ q: "Olá, mundo!", target: "en" });
result.translatedText; // "Hello, world!"
result.detectedLanguage; // { language: "pt", confidence: 90 }
```

`source` por omissão a `auto`: a instância detecta a língua e diz em que `detectedLanguage`Dá-me `source` Quando você
sabe, que é mais rápido e evita um palpite errado em textos curtos.

## Vários textos

`translateMany` envia uma lista em um pedido e listas de respostas na mesma ordem:

```ts
const { translatedText } = await lt.translateMany({ q: ["Bom dia", "Boa noite"], source: "pt", target: "es" });
// ["Buenos días", "Buenas noches"]
```

Com `source: "auto"`, `detectedLanguage` é uma lista também, uma por texto.

## HTML

`format: "html"` mantém a marcação e traduz apenas o texto dentro dele:

```ts
await lt.translate({ q: '<p class="lead">Olá!</p>', source: "pt", target: "en", format: "html" });
// '<p class="lead">Hello!</p>'
```

## Alternativas

`alternatives: n` pede para até `n` outras traduções além da principal:

```ts
const { translatedText, alternatives } = await lt.translate({ q: "Olá", source: "pt", target: "it", alternatives: 2 });
// "Ciao", ["Salve", "Pronto"]
```

## Detecção

```ts
const candidates = await lt.detect("Bonjour tout le monde");
// [{ language: "fr", confidence: 92 }, …]
```

## Códigos linguísticos

`languages()` lista todas as línguas de origem com os códigos em que se traduz. Use esses códigos como `source` e
`target` (incluem as regionais, tais como `pt-BR` ou `zh-Hant`).

```ts
const languages = await lt.languages();
const portuguese = languages.find((language) => language.code === "pt");
portuguese?.targets; // ["en", "es", …]
```

## Limites

`settings()` diz o que a instância permite:

- `charLimit`: a maioria dos caracteres que um pedido pode conter (`-1` não existe limite). Dividir textos mais longos,
  por exemplo por parágrafo com `translateMany`.
- `keyRequired`: se uma chave API é necessária. Sem um, o exemplo responde 400.
- `suggestions`: se `suggest` é aceite.

## Sugestões

```ts
await lt.suggest({ q: "Olá", s: "Hi", source: "pt", target: "en" });
```

Envia uma tradução melhor para a instância, que a mantém. Apenas as instâncias com sugestões habilitadas o aceitam.
