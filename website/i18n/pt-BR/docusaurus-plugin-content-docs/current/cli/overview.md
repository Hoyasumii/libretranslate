---
sidebar_position: 1
title: Visão geral da CLI
description: "O comando libretranslate: cada ferramenta MCP como um subcomando, com o schema de entrada da ferramenta como flags."
---

# CLI

O pacote instala um comando `libretranslate`. Ele é um cliente MCP do [mesmo servidor](../mcp/overview.md): cada
ferramenta MCP vira um subcomando, e o schema de entrada da ferramenta vira as flags dele. Por padrão o servidor roda
dentro do comando, então não há nada para iniciar antes.

```bash
npx libretranslate mcp config                          # uma vez: a URL da instância e, se ela emitir chaves, uma API key
npx libretranslate tools                               # todos os comandos, um por ferramenta MCP
npx libretranslate status
npx libretranslate translate --q "Olá, mundo!" --target en
npx libretranslate translate --q '["Bom dia","Boa noite"]' --source pt --target es
npx libretranslate translate --q "<b>Olá</b>" --target en --format html --alternatives 2
npx libretranslate translate-file --path relatorio.docx --target en
npx libretranslate detect --q "Bonjour tout le monde"
npx libretranslate languages --source pt
npx libretranslate call --operation getFrontendSettings
```

Nada além de `--help`, `--version`, `libretranslate docs`, `libretranslate mcp config` e `libretranslate mcp
uninstall` roda até que uma configuração com uma URL seja salva. `libretranslate docs` imprime o link deste site e o
abre no navegador.

## De ferramentas para comandos

- O comando é o nome da ferramenta sem `libretranslate_`, em kebab-case: `libretranslate_translate_file` →
  `translate-file`.
- Cada flag é uma entrada em kebab-case.
- Flags de array aceitam `a,b` ou JSON, flags de objeto aceitam JSON, e flags booleanas não precisam de valor.
- `libretranslate <comando> --help` lista as flags de um comando, com os valores permitidos das entradas enum.

A saída da ferramenta vai para o stdout. Um erro de ferramenta vai para o stderr com código de saída 1.

## Configurações avulsas e um servidor rodando

`--base-url` e `--api-key` sobrescrevem o ambiente e o arquivo salvo numa execução do servidor em processo. Para usar
um `libretranslate-mcp` que já está rodando por HTTP, passe `--url http://127.0.0.1:3768/mcp` ou defina
`LIBRETRANSLATE_MCP_URL`. Essas flags funcionam em qualquer posição da linha de comando.

Nenhuma delas substitui a configuração salva: a CLI se recusa a rodar ferramentas sem ela, mesmo com `--url` ou
`--base-url`.

## Uma instância local

Com o Docker instalado, `libretranslate service up` roda o LibreTranslate num container e aponta a CLI para ele.
Veja [`libretranslate service`](./service.md).

## Gerenciando o servidor

`libretranslate mcp` é interceptado antes de qualquer conexão. Ele configura o servidor, o roda em segundo plano, o
inicia no login e o registra nos seus clientes MCP. Veja [`libretranslate mcp`](./mcp-commands.md).
