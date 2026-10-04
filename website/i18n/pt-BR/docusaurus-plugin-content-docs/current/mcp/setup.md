---
sidebar_position: 2
title: Configuração inicial
description: "Salve suas configurações uma vez e registre o servidor MCP do LibreTranslate no Claude Code, no Codex e no OpenCode."
---

# Configuração inicial

## O jeito rápido

Salve suas configurações uma vez e deixe a CLI registrar o servidor nos clientes que encontrar:

```bash
npx libretranslate mcp config    # pede a URL da instância, uma API key se ela emitir chaves, e uma porta
npx libretranslate mcp install   # encontra Claude Code, Codex e OpenCode no PATH e registra o libretranslate-mcp (stdio)
```

`install` mostra uma lista dos clientes encontrados. Marque os que quiser, e ele registra o servidor pela CLI de cada
cliente, com o nome `libretranslate`. O comando registrado lê a configuração salva quando o cliente o inicia, então
nenhuma API key vai parar na config do cliente. Veja
[`libretranslate mcp install`](../cli/mcp-commands.md#libretranslate-mcp-install) para as flags.

## À mão: stdio

Deixe o cliente iniciar o `libretranslate-mcp`. Ele lê a configuração salva, então a config do cliente não precisa de
chaves:

```json
{
  "mcpServers": {
    "libretranslate": { "command": "npx", "args": ["-y", "-p", "@hoyasumii/libretranslate", "libretranslate-mcp"] }
  }
}
```

No Claude Code:

```bash
claude mcp add libretranslate -- npx -y -p @hoyasumii/libretranslate libretranslate-mcp
```

Sem uma configuração salva, o servidor usa `http://localhost:5000` e nenhuma chave. Para apontá-lo para outro lugar,
ou sobrescrever o arquivo salvo, dê ao cliente um bloco `env` (veja [Configuração](./configuration.md)):

```json
{
  "mcpServers": {
    "libretranslate": {
      "command": "npx",
      "args": ["-y", "-p", "@hoyasumii/libretranslate", "libretranslate-mcp"],
      "env": { "LIBRETRANSLATE_URL": "https://libretranslate.com", "LIBRETRANSLATE_API_KEY": "sua-api-key" }
    }
  }
}
```

## À mão: HTTP

Rode um servidor em segundo plano e aponte seus clientes para a URL dele:

```bash
npx libretranslate mcp start          # imprime a URL, http://127.0.0.1:3768/mcp por padrão
claude mcp add --transport http libretranslate http://127.0.0.1:3768/mcp
```

Sem a CLI, `libretranslate-mcp --http` o roda em primeiro plano com as configurações do ambiente ou da configuração
salva. `libretranslate-mcp --help` lista as flags. Para iniciar o servidor a cada login, rode
`npx libretranslate mcp boot enable` (veja [`libretranslate mcp boot`](../cli/mcp-commands.md#libretranslate-mcp-boot)).

## Conferindo que funciona

Peça ao seu agente para chamar `libretranslate_status`, ou rode no terminal:

```bash
npx libretranslate status
```

Ele responde a URL da instância, se há uma chave configurada e se ela é exigida, o limite de caracteres e os formatos
de arquivo.
