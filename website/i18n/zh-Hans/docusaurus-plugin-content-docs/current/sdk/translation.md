---
sidebar_position: 2
title: 翻译
description: "翻译文本和列表,检测源语言,HTML,替代语言代码和建议."
---

# 翻译

## 一个文本

```ts
const result = await lt.translate({ q: "Olá, mundo!", target: "en" });
result.translatedText; // "Hello, world!"
result.detectedLanguage; // { language: "pt", confidence: 90 }
```

`source` 默认为 `auto`: 实例检测语言, 并说它在 `detectedLanguage`。给出 `source` 当你知道它,它更快 避免错误的猜测 在短文本。

## 若干案文

`translateMany` 以同一顺序发送一个请求和答复列表中的列表:

```ts
const { translatedText } = await lt.translateMany({ q: ["Bom dia", "Boa noite"], source: "pt", target: "es" });
// ["Buenos días", "Buenas noches"]
```

与 `source: "auto"`, (中文). `detectedLanguage` 也是一个列表,每个文本一个。

## HTML 语句

`format: "html"` 保留标记并只翻译其中的文本 :

```ts
await lt.translate({ q: '<p class="lead">Olá!</p>', source: "pt", target: "en", format: "html" });
// '<p class="lead">Hello!</p>'
```

## 替代品

`alternatives: n` 请求最多 `n` 除主要翻译外的其他翻译:

```ts
const { translatedText, alternatives } = await lt.translate({ q: "Olá", source: "pt", target: "it", alternatives: 2 });
// "Ciao", ["Salve", "Pronto"]
```

## 检测

```ts
const candidates = await lt.detect("Bonjour tout le monde");
// [{ language: "fr", confidence: 92 }, …]
```

## 语言代码

`languages()` 列出所有源语言,并附有其翻译的代码。 使用这些代码作为 `source` 和 `target` (它们包括区域性的,例如: `pt-BR` 或 `zh-Hant`) (中文(简体) ).

```ts
const languages = await lt.languages();
const portuguese = languages.find((language) => language.code === "pt");
portuguese?.targets; // ["en", "es", …]
```

## 限制

`settings()` 说明实例允许什么:

- `charLimit`:一个请求可能携带的字符最多(`-1` (无限制)。 将较长的案文分开,例如按段落分列 `translateMany`。 。 。 。
- `keyRequired`:是否需要 API 密钥。 如果没有一个,这个案例就回答400。
- `suggestions`:是否为 `suggest` 现予接受。

## 建议

```ts
await lt.suggest({ q: "Olá", s: "Hi", source: "pt", target: "en" });
```

发送更好的翻译回例,保存它. 只有有建议的地方才允许接受。
