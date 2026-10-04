---
sidebar_position: 1
title: Começar
description: "Um não oficial TypeScript SDK para o LibreTranslate API, com um servidor MCP e um CLI construído sobre ele: o que cada parte faz e como instalá-lo."
slug: /intro
---

# Começar

`@hoyasumii/libretranslate` é um TypeScript SDK para o [LibreTranslate](https://libretranslate.com) API HTTP, com um
servidor MCP e um CLI construído em cima dele. Use-o de código, de um agente de IA ou de seu terminal: todos os três
compartilham o mesmo cliente.

- **SDK**: métodos digitados para traduzir textos e listas, detectar idiomas, traduzir arquivos e enviar sugestões. É
  gerado por [orval](https://orval.dev) de uma especificação OpenAPI escrita para este pacote, e envia sua chave API
  quando a instância precisa de uma. Iniciar em [SDK](./sdk/overview.md).
- **Servidor MCP** (`@hoyasumii/libretranslate/mcp`, lixo `libretranslate-mcp`): stdio ou HTTP streamable em
  `127.0.0.1`. Ferramentas para traduzir textos e documentos, detectar idiomas e verificar a instância, além de
  ferramentas genéricas para a API em bruto. Iniciar em [Servidor MCP](./mcp/overview.md).
- **CLI** (`libretranslate`): cada ferramenta MCP como subcomando, mais `libretranslate mcp` para configurar o servidor,
  execute-o em segundo plano, inicie-o no login e registre-o em Claude Code, Codex e OpenCode. Iniciar em
  [CLI](./cli/overview.md).

Este é um independente, **não oficial** Cliente, licenciado no MIT. Fala com um LibreTranslate instância sobre HTTP e
não contém nenhum código do LibreTranslate projecto.

## A LibreTranslate instância

Você precisa de uma instância para falar com:

- **A sua própria**, com Docker: `docker run -p 5000:5000 libretranslate/libretranslate` serve `http://localhost:5000`,
  o URL que este pacote usa por padrão. Não precisa de chave API.
- **Com este CLI**, quando o Docker está instalado: `libretranslate service up --languages en,pt,es` faz o mesmo e salva
  o URL (ver [`libretranslate service`](./cli/service.md)).
- **Um hospedado**, tais como [libretranslate.com](https://libretranslate.com), que requer uma chave API.

## Instalação

Requer Node.js 20 ou mais tarde.

```bash
npm i -g @hoyasumii/libretranslate     # or: pnpm add -g @hoyasumii/libretranslate
libretranslate mcp config              # the instance URL and, if it issues keys, an API key; saved per user
libretranslate mcp install             # registers the server (stdio) in Claude Code / Codex / OpenCode
```

Como biblioteca, `npm install @hoyasumii/libretranslate`.

## Uma primeira chamada

```ts
import { createLibreTranslateClient } from "@hoyasumii/libretranslate";

const lt = createLibreTranslateClient({ baseUrl: "http://localhost:5000" });
const { translatedText, detectedLanguage } = await lt.translate({ q: "Olá, mundo!", target: "en" });
// "Hello, world!", { language: "pt", confidence: 90 }
```

Do terminal, uma vez `libretranslate mcp config` salvou uma configuração:

```bash
libretranslate translate --q "Olá, mundo!" --target en
libretranslate languages --source pt
```

`libretranslate docs` abre este site.
