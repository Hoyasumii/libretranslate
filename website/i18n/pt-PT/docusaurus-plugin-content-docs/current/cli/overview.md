---
sidebar_position: 1
title: Visão geral do CLI
description: "O comando libretranslate: cada ferramenta MCP como subcomando, com o esquema de entrada da ferramenta como sinalizadores."
---

# CLI

O pacote instala um `libretranslate` Comando. É um cliente MCP da [mesmo servidor](../mcp/overview.md): cada ferramenta
MCP se torna um subcomando, e o esquema de entrada da ferramenta torna-se suas bandeiras. Por padrão, o servidor é
executado dentro do comando, então não há nada para começar primeiro.

```bash
npx libretranslate mcp config                          # once: the instance URL and, if it issues keys, an API key
npx libretranslate tools                               # every command, one per MCP tool
npx libretranslate status
npx libretranslate translate --q "Olá, mundo!" --target en
npx libretranslate translate --q '["Bom dia","Boa noite"]' --source pt --target es
npx libretranslate translate --q "<b>Olá</b>" --target en --format html --alternatives 2
npx libretranslate translate-file --path report.docx --target pt
npx libretranslate detect --q "Bonjour tout le monde"
npx libretranslate languages --source pt
npx libretranslate call --operation getFrontendSettings
```

Nada além de... `--help`, `--version`, `libretranslate docs`, `libretranslate mcp config` e
`libretranslate mcp uninstall` roda até que uma configuração com um URL seja salva. `libretranslate docs` imprime o link
para este site e o abre no navegador.

## De ferramentas para comandos

- O comando é o nome da ferramenta sem `libretranslate_`, em caso de kebab: `libretranslate_translate_file` →
  `translate-file`.
- Cada bandeira é uma entrada em kebab-case.
- Array bandeiras tomar `a,b` ou JSON, bandeiras de objetos tomam JSON, e bandeiras booleanas não precisam de valor.
- `libretranslate <command> --help` lista as bandeiras de um comando, com os valores permitidos de entradas de enum.

A saída da ferramenta vai para stdout. Um erro de ferramenta vai para o stderr com código de saída 1.

## Configuração única e um servidor em execução

`--base-url` e `--api-key` sobrepor o ambiente e o arquivo salvo para uma execução do servidor em processo. Para usar um
`libretranslate-mcp` que já está rodando sobre HTTP, passe `--url http://127.0.0.1:3768/mcp` ou definido
`LIBRETRANSLATE_MCP_URL`Estas bandeiras funcionam em qualquer lugar na linha de comando.

Nenhum deles representa a configuração salva: o CLI se recusa a executar ferramentas sem ela, mesmo quando `--url` ou
`--base-url` é administrado.

## Uma instância local

Com o Docker instalado, `libretranslate service up` executa LibreTranslate num contentor e aponta o CLI para ele. Ver
[`libretranslate service`](./service.md).

## Gerenciando o servidor

`libretranslate mcp` é interceptado antes de qualquer ligação ser feita. Ele configura o servidor, executa-o em segundo
plano, inicia-o no login e registra-o em seus clientes MCP. Ver [`libretranslate mcp`](./mcp-commands.md).
