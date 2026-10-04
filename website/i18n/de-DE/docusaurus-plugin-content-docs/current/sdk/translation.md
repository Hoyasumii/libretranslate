---
sidebar_position: 2
title: Übersetzung
description: "Übersetzung von Texten und Listen, Erkennung der Ausgangssprache, HTML, Alternativen, Sprachcodes und Vorschläge."
---

# Übersetzung

## Ein Text

```ts
const result = await lt.translate({ q: "Olá, mundo!", target: "en" });
result.translatedText; // "Hello, world!"
result.detectedLanguage; // { language: "pt", confidence: 90 }
```

`source` Ausfälle bis `auto`Die Instanz erkennt die Sprache und sagt, welche sie in `detectedLanguage`. Geben `source`
wenn Sie es wissen, was schneller ist und eine falsche Vermutung bei kurzen Texten vermeidet.

## Mehrere Texte

`translateMany` sendet eine Liste in einer Anfrage und beantwortet Listen in der gleichen Reihenfolge:

```ts
const { translatedText } = await lt.translateMany({ q: ["Bom dia", "Boa noite"], source: "pt", target: "es" });
// ["Buenos días", "Buenas noches"]
```

mit `source: "auto"`, `detectedLanguage` ist auch eine Liste, eine pro Text.

## HTML

`format: "html"` behält das Markup und übersetzt nur den Text darin:

```ts
await lt.translate({ q: '<p class="lead">Olá!</p>', source: "pt", target: "en", format: "html" });
// '<p class="lead">Hello!</p>'
```

## Alternativen

`alternatives: n` fragt bis zu `n` andere Übersetzungen außer der Hauptübersetzung:

```ts
const { translatedText, alternatives } = await lt.translate({ q: "Olá", source: "pt", target: "it", alternatives: 2 });
// "Ciao", ["Salve", "Pronto"]
```

## Detektion

```ts
const candidates = await lt.detect("Bonjour tout le monde");
// [{ language: "fr", confidence: 92 }, …]
```

## Sprachcodes

`languages()` listet jede Quellsprache mit den Codes auf, in die sie übersetzt. Verwenden Sie diese Codes als `source`
und `target` (Sie umfassen regionale, wie z.B. `pt-BR` oder `zh-Hant`.

```ts
const languages = await lt.languages();
const portuguese = languages.find((language) => language.code === "pt");
portuguese?.targets; // ["en", "es", …]
```

## Grenzwerte

`settings()` sagt, was die Instanz erlaubt:

- `charLimit`: die meisten Zeichen, die eine Anfrage tragen kann`-1` ist kein Limit. Teilen Sie längere Texte, zum
  Beispiel nach Absatz mit `translateMany`.
- `keyRequired`ob ein API-Schlüssel benötigt wird. Ohne einen beantwortet die Instanz 400.
- `suggestions`: ob `suggest` akzeptiert wird.

## Vorschläge

```ts
await lt.suggest({ q: "Olá", s: "Hi", source: "pt", target: "en" });
```

Sendet eine bessere Übersetzung zurück an die Instanz, die sie behält. Nur Instanzen mit aktivierten Vorschlägen
akzeptieren es.
