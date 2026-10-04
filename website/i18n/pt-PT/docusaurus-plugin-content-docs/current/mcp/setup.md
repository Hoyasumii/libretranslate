---
sidebar_position: 2
title: Configurar
description: "Salve suas configurações uma vez e registre o LibreTranslate Servidor MCP em Claude Code, Codex e OpenCode."
---

# Configurar

## A maneira rápida

Salve suas configurações uma vez e, em seguida, deixe o CLI registrar o servidor nos clientes que ele encontra:

```bash
npx libretranslate mcp config    # asks for the instance URL, an API key if it issues keys, and a port
npx libretranslate mcp install   # finds Claude Code, Codex and OpenCode on your PATH and registers libretranslate-mcp (stdio)
```

`install` mostra uma lista de verificação dos clientes que encontrou. Assinale os que desejar e regista o servidor
através do CLI de cada cliente, sob o nome `libretranslate`O comando registrado lê a configuração salva quando o cliente
a lança, então nenhuma chave API termina na configuração do cliente. Ver
[`libretranslate mcp install`](../cli/mcp-commands.md#libretranslate-mcp-install) para as bandeiras.

## À mão: stdio

Deixar o cliente começar `libretranslate-mcp`. Ele lê a configuração salva, então a configuração do cliente não precisa
de chaves:

```json
{
  "mcpServers": {
    "libretranslate": { "command": "npx", "args": ["-y", "-p", "@hoyasumii/libretranslate", "libretranslate-mcp"] }
  }
}
```

In Claude Code:

```bash
claude mcp add libretranslate -- npx -y -p @hoyasumii/libretranslate libretranslate-mcp
```

Sem uma configuração salva, o servidor usa `http://localhost:5000` e nenhuma chave. Para apontá-lo para outro lugar, ou
para substituir o arquivo salvo, dê ao cliente um `env` bloco (ver [Configuração](./configuration.md)):

```json
{
  "mcpServers": {
    "libretranslate": {
      "command": "npx",
      "args": ["-y", "-p", "@hoyasumii/libretranslate", "libretranslate-mcp"],
      "env": { "LIBRETRANSLATE_URL": "https://libretranslate.com", "LIBRETRANSLATE_API_KEY": "your-api-key" }
    }
  }
}
```

## À mão: HTTP

Execute um servidor em segundo plano e aponte seus clientes para sua URL:

```bash
npx libretranslate mcp start          # prints the URL, http://127.0.0.1:3768/mcp by default
claude mcp add --transport http libretranslate http://127.0.0.1:3768/mcp
```

Sem o CLI, `libretranslate-mcp --http` executa- o em primeiro plano com as configurações do ambiente ou da configuração
salva. `libretranslate-mcp --help` lista as bandeiras. Para iniciar o servidor em cada login, execute
`npx libretranslate mcp boot enable` (ver [`libretranslate mcp boot`](../cli/mcp-commands.md#libretranslate-mcp-boot)).

## Verificando se funciona

Peça ao seu agente para ligar `libretranslate_status`, ou executá-lo a partir do terminal:

```bash
npx libretranslate status
```

Ele responde ao URL da instância, se uma chave está configurada e necessária, o limite de caracteres e os formatos de
arquivo.
