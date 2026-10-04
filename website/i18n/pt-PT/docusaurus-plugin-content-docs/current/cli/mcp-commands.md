---
sidebar_position: 2
title: libretranslate mcp
description: "libretranslate mcp: salve a configuração, execute o servidor em segundo plano, inicie-o no login e registre-o em seus clientes MCP."
---

# `libretranslate mcp`

`libretranslate mcp` gerencia o servidor MCP para você: sua configuração salva, um servidor HTTP de fundo, um serviço de
login e seu registro em seus clientes MCP.

```bash
npx libretranslate mcp config                 # asks for the settings in the terminal and saves them
npx libretranslate mcp config --base-url http://localhost:5000 --port 4000   # no prompts (scripts, CI): saves just these
npx libretranslate mcp config --web           # the same, in a local web form
npx libretranslate mcp install                # pick Claude Code / Codex / OpenCode and register libretranslate-mcp (stdio) in them
npx libretranslate mcp install --client claude,opencode --force   # no picker (scripts, CI); --force replaces an entry
npx libretranslate mcp uninstall              # pick the clients to remove the 'libretranslate' entry from (no saved config needed)
npx libretranslate mcp start                  # start in the background (needs a saved config); prints the URL for `claude mcp add`
npx libretranslate mcp start --api-key other --port 4000   # one-off values, never saved
npx libretranslate mcp status                 # running or stopped (exit 3), URL, pid, uptime
npx libretranslate mcp stop
npx libretranslate mcp boot enable            # start at every login; `boot disable` / `boot status`
```

## `libretranslate mcp config`

Grava o gravado `.env` ([Configuração](../mcp/configuration.md)). Funciona de três maneiras:

- **No terminal** (o padrão). Ele pede para cada configuração por sua vez, começando a partir dos valores salvos
  (`http://localhost:5000` para um novo URL). A chave API é digitada mascarada: enter mantém o salvo (ou não deixa
  nenhum), e `-` Limpa.
- **Com bandeiras.** Dado qualquer um dos `--base-url`, `--api-key` (`-` limpa) ou `--port`, não pede nada e salva
  apenas aqueles. Sem um terminal, precisa deles. Uma chave passada como uma bandeira permanece em seu histórico shell,
  então prefira o prompt para ele.
- **Em formato web** com `--web`: uma página local, aberta no navegador (`--no-open` para imprimir apenas o seu URL). Um
  segredo em branco mantém o salvo.

Se um servidor estiver em execução, ele diz: reinicie-o para pegar as alterações. `--config <file>` (ou
`LIBRETRANSLATE_CONFIG`) escreve outro arquivo.

## `libretranslate mcp install`

Detecta cada cliente executando o seu `--version`, e registra o servidor stdio através do próprio CLI do cliente, sob o
nome `libretranslate`:

| Cliente     | Comando que executa         |
| ----------- | --------------------------- |
| Claude Code | `claude mcp add -s user`    |
| Codex       | `codex mcp add`             |
| OpenCode    | `opencode mcp add --global` |

O comando registado é `node <package>/dist/mcp/cli.js` por caminho absoluto, sem credencial: o servidor lê o arquivo
salvo quando o cliente o lança (`LIBRETRANSLATE_CONFIG` é passado apenas quando `--config` nomeia outro arquivo).

Todos os clientes encontrados começam a funcionar. Um que já tem um `libretranslate` a entrada está marcada
`already installed, reinstalls` e vai substituí-lo. Sem um terminal interactivo, `--client` é necessário (`claude`,
`codex`, `opencode`; dentro da WSL também `claude@windows`, `codex@windows`, `opencode@windows`), mais `--force` para
substituir uma entrada. `--dry-run` imprime os comandos em vez de executá-los.

Ambos `install` e `uninstall` trabalhar na configuração de cada cliente em nível de usuário (global). Entradas de
projeto nunca são tocadas.

## `libretranslate mcp uninstall`

Lista os clientes com `libretranslate` entrada, mostrando se é `stdio` ou `http`, e remove qualquer entrada desse nome:
`claude mcp remove -s user`, `codex mcp remove`, e OpenCode (que não tem `remove`) uma edição de seu arquivo global de
configuração que exclui apenas essa chave, mantendo comentários e layout.

É o único comando além de `libretranslate mcp config` que é executado sem uma configuração salva, para que um cliente
possa ser limpo após a configuração desaparecer. `--client` e `--dry-run` trabalhar como em `install`.

## `libretranslate mcp start`, `stop` e `status`

`start` executa o servidor HTTP desconectado, com seu pid e log in `<config dir>/run/`, e imprime sua URL, seu arquivo
de log e o `claude mcp add` linha para registrá-lo. Precisa de uma configuração salva. `--api-key`, `--base-url` e
`--port` substitui-o apenas para esta execução, e nunca são salvos. `--foreground` serve no processo atual.

`status` imprime se o servidor está em execução, com sua URL, pid e uptime, e sai com o código 3 quando não está. `stop`
pede ao servidor para desligar através de um token-guarded `POST /shutdown`, e sinaliza o processo apenas se isso
falhar.

## `libretranslate mcp boot`

`boot enable` instala um serviço do usuário atual que inicia o servidor em cada login, então não é necessário sudo:

| SO      | Serviço                                                                          |
| ------- | -------------------------------------------------------------------------------- |
| Linux   | uma unidade de utilizador systemd (no WSL, activar o sistema em `/etc/wsl.conf`) |
| macOS   | um Agente de Lançamento                                                          |
| Janelas | uma tarefa de logon                                                              |

O serviço lê apenas a configuração gravada. `boot disable` remove- o e `boot status` informa.
