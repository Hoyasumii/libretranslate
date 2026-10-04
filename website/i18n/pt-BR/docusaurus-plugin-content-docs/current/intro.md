---
sidebar_position: 1
title: Primeiros passos
description: "Um SDK TypeScript não oficial para a API do LibreTranslate, com um servidor MCP e uma CLI construídos sobre ele: o que cada parte faz e como instalar."
slug: /intro
---

# Primeiros passos

`@hoyasumii/libretranslate` é um SDK TypeScript para a API HTTP do [LibreTranslate](https://libretranslate.com), com
um servidor MCP e uma CLI construídos sobre ele. Use-o no código, a partir de um agente de IA ou no terminal: os três
compartilham o mesmo cliente.

- **SDK**: métodos tipados para traduzir textos e listas, detectar idiomas, traduzir arquivos e enviar sugestões. É
  gerado pelo [orval](https://orval.dev) a partir de uma spec OpenAPI escrita para este pacote, e envia a sua API key
  quando a instância pede uma. Comece em [SDK](./sdk/overview.md).
- **Servidor MCP** (`@hoyasumii/libretranslate/mcp`, bin `libretranslate-mcp`): stdio ou Streamable HTTP em
  `127.0.0.1`. Ferramentas para traduzir textos e documentos, detectar idiomas e verificar a instância, mais
  ferramentas genéricas para a API crua. Comece em [Servidor MCP](./mcp/overview.md).
- **CLI** (`libretranslate`): cada ferramenta MCP como um subcomando, mais `libretranslate mcp` para configurar o
  servidor, rodá-lo em segundo plano, iniciá-lo no login e registrá-lo no Claude Code, no Codex e no OpenCode. Comece
  em [CLI](./cli/overview.md).

Este é um cliente independente e **não oficial**, com licença MIT. Ele conversa com uma instância do LibreTranslate
por HTTP e não contém código do projeto LibreTranslate.

## Uma instância do LibreTranslate

Você precisa de uma instância para conversar:

- **A sua**, com Docker: `docker run -p 5000:5000 libretranslate/libretranslate` serve `http://localhost:5000`, a URL
  que este pacote usa por padrão. Não precisa de API key.
- **Com esta CLI**, quando o Docker está instalado: `libretranslate service up --languages en,pt,es` faz o
  mesmo e salva a URL (veja [`libretranslate service`](./cli/service.md)).
- **Uma hospedada**, como a [libretranslate.com](https://libretranslate.com), que exige uma API key.

## Instalação

Requer Node.js 20 ou mais recente.

```bash
npm i -g @hoyasumii/libretranslate     # ou: pnpm add -g @hoyasumii/libretranslate
libretranslate mcp config              # a URL da instância e, se ela emite chaves, uma API key; salvas por usuário
libretranslate mcp install             # registra o servidor (stdio) no Claude Code / Codex / OpenCode
```

Como biblioteca, `npm install @hoyasumii/libretranslate`.

## Uma primeira chamada

```ts
import { createLibreTranslateClient } from "@hoyasumii/libretranslate";

const lt = createLibreTranslateClient({ baseUrl: "http://localhost:5000" });
const { translatedText, detectedLanguage } = await lt.translate({ q: "Olá, mundo!", target: "en" });
// "Hello, world!", { language: "pt", confidence: 90 }
```

No terminal, depois que `libretranslate mcp config` salvou uma configuração:

```bash
libretranslate translate --q "Olá, mundo!" --target en
libretranslate languages --source pt
```

`libretranslate docs` abre este site.
