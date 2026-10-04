---
sidebar_position: 2
title: 翻譯
description: "翻譯文字與清單, 偵測來源語言、 HTML、 替代物、 語言碼與建議 。"
---

# 翻譯

## 一個文字

```ts
const result = await lt.translate({ q: "Olá, mundo!", target: "en" });
result.translatedText; // "Hello, world!"
result.detectedLanguage; // { language: "pt", confidence: 90 }
```

`source` 預設為 `auto`: 實體檢測到語言并說出它找到的語言 `detectedLanguage`。 `source` 當你們知道它的時候,它會更快,而且避免在短文上誤猜。

## 若干案文

`translateMany` 以相同的顺序發送一份請求和答覆清單中的清單 :

```ts
const { translatedText } = await lt.translateMany({ q: ["Bom dia", "Boa noite"], source: "pt", target: "es" });
// ["Buenos días", "Buenas noches"]
```

用 `source: "auto"`, `detectedLanguage` 也是一份清單, 每份文字一份。

## HTML 語言

`format: "html"` 保持標記並只翻譯其中的文字 :

```ts
await lt.translate({ q: '<p class="lead">Olá!</p>', source: "pt", target: "en", format: "html" });
// '<p class="lead">Hello!</p>'
```

## 替代品

`alternatives: n` 要求最多 `n` 除主要翻譯外的其他翻譯:

```ts
const { translatedText, alternatives } = await lt.translate({ q: "Olá", source: "pt", target: "it", alternatives: 2 });
// "Ciao", ["Salve", "Pronto"]
```

## 偵測

```ts
const candidates = await lt.detect("Bonjour tout le monde");
// [{ language: "fr", confidence: 92 }, …]
```

## 語言代碼

`languages()` 列出所有源语言及其翻譯的密碼。 用那些代碼做 `source` 和 `target` (其中包括地區的,例如: `pt-BR` 或 `zh-Hant`).

```ts
const languages = await lt.languages();
const portuguese = languages.find((language) => language.code === "pt");
portuguese?.targets; // ["en", "es", …]
```

## 限制

`settings()` 告訴這個例子允許的:

- `charLimit`: 要求可能携带的字元最多( )`-1` 。 分割较长的案文,例如按段落 `translateMany`.
- `keyRequired`: 是否需要 API 金鑰 。 沒有一個,案例就回答400。
- `suggestions`:是否 `suggest` 已接受。

## 建议

```ts
await lt.suggest({ q: "Olá", s: "Hi", source: "pt", target: "en" });
```

傳送更好的翻譯回樣本 。 只有有建議的情況才能接受
