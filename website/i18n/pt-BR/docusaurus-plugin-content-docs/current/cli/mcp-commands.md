---
sidebar_position: 2
title: libretranslate mcp
description: "libretranslate mcp: salve a configuração, rode o servidor em segundo plano, inicie-o no login e registre-o nos seus clientes MCP."
---

# `libretranslate mcp`

`libretranslate mcp` gerencia o servidor MCP para você: a configuração salva, um servidor HTTP em segundo plano, um serviço
de login e o registro nos seus clientes MCP.

```bash
npx libretranslate mcp config                 # pede as configurações no terminal e as salva
npx libretranslate mcp config --base-url http://localhost:5000 --port 4000   # sem perguntas (scripts, CI): salva só estas
npx libretranslate mcp config --web           # o mesmo, num formulário web local
npx libretranslate mcp install                # escolha Claude Code / Codex / OpenCode e registre o libretranslate-mcp (stdio) neles
npx libretranslate mcp install --client claude,opencode --force   # sem seletor (scripts, CI); --force substitui uma entrada
npx libretranslate mcp uninstall              # escolha de quais clientes remover a entrada 'libretranslate' (sem config salva)
npx libretranslate mcp start                  # inicia em segundo plano (precisa de config salva); imprime a URL para `claude mcp add`
npx libretranslate mcp start --api-key outra --port 4000   # valores avulsos, nunca salvos
npx libretranslate mcp status                 # rodando ou parado (saída 3), URL, pid, tempo no ar
npx libretranslate mcp stop
npx libretranslate mcp boot enable            # inicia a cada login; `boot disable` / `boot status`
```

## `libretranslate mcp config`

Grava o `.env` salvo ([Configuração](../mcp/configuration.md)). Funciona de três jeitos:

- **No terminal** (o padrão). Pede cada configuração por vez, a partir dos valores salvos (`http://localhost:5000`
  para uma URL nova). A API key é digitada mascarada: enter mantém a salva (ou fica sem nenhuma), e `-` a apaga.
- **Com flags.** Com qualquer uma de `--base-url`, `--api-key` (`-` a apaga) ou `--port`, não pergunta nada e salva
  só essas. Sem um terminal, elas são necessárias. Uma chave passada como flag fica no histórico do shell, então
  prefira o prompt para ela.
- **Num formulário web** com `--web`: uma página local, aberta no navegador (`--no-open` para só imprimir a URL). Uma
  chave em branco mantém a salva.

Se um servidor estiver rodando, ele avisa: reinicie-o para pegar as mudanças. `--config <arquivo>` (ou
`LIBRETRANSLATE_CONFIG`) grava outro arquivo.

## `libretranslate mcp install`

Detecta cada cliente rodando seu `--version` e registra o servidor stdio pela CLI do próprio cliente, com o nome
`libretranslate`:

| Cliente     | Comando que roda            |
| ----------- | --------------------------- |
| Claude Code | `claude mcp add -s user`    |
| Codex       | `codex mcp add`             |
| OpenCode    | `opencode mcp add --global` |

O comando registrado é `node <pacote>/dist/mcp/cli.js` por caminho absoluto, sem credencial: o servidor lê o arquivo
salvo quando o cliente o inicia (`LIBRETRANSLATE_CONFIG` só é passado quando `--config` indica outro arquivo).

Todo cliente encontrado começa marcado. Um que já tem uma entrada `libretranslate` aparece como
`already installed, reinstalls` e a tem substituída. Sem um terminal interativo, `--client` é obrigatório
(`claude`, `codex`, `opencode`; dentro do WSL também `claude@windows`, `codex@windows`, `opencode@windows`), mais
`--force` para substituir uma entrada. `--dry-run` imprime os comandos em vez de rodá-los.

`install` e `uninstall` trabalham na configuração de nível de usuário (global) de cada cliente. Entradas de escopo de
projeto nunca são tocadas.

## `libretranslate mcp uninstall`

Lista os clientes com uma entrada `libretranslate`, mostrando se é `stdio` ou `http`, e remove qualquer entrada com esse
nome: `claude mcp remove -s user`, `codex mcp remove` e, no OpenCode (que não tem `remove`), uma edição do arquivo
de configuração global que apaga só essa chave, mantendo comentários e layout.

É o único comando, além de `libretranslate mcp config`, que roda sem uma configuração salva, para que um cliente possa ser
limpo depois que a configuração sumiu. `--client` e `--dry-run` funcionam como no `install`.

## `libretranslate mcp start`, `stop` e `status`

`start` roda o servidor HTTP destacado, com pid e log em `<pasta de config>/run/`, e imprime a URL, o arquivo de log
e a linha `claude mcp add` para registrá-lo. Precisa de uma configuração salva. `--api-key`, `--base-url` e
`--port` a sobrescrevem só nessa execução, e nunca são salvos. `--foreground` serve no processo atual.

`status` imprime se o servidor está rodando, com URL, pid e tempo no ar, e sai com código 3 quando não está. `stop`
pede ao servidor que encerre por um `POST /shutdown` protegido por token, e só sinaliza o processo se isso falhar.

## `libretranslate mcp boot`

`boot enable` instala um serviço do usuário atual que inicia o servidor a cada login, então não precisa de sudo:

| SO      | Serviço                                                                     |
| ------- | --------------------------------------------------------------------------- |
| Linux   | uma unit systemd de usuário (no WSL, habilite o systemd em `/etc/wsl.conf`) |
| macOS   | um LaunchAgent                                                              |
| Windows | uma tarefa de logon                                                         |

O serviço lê só a configuração salva. `boot disable` o remove e `boot status` o informa.
