---
sidebar_position: 3
title: libretranslate service
description: "libretranslate service: rode o LibreTranslate localmente num container Docker, com up, down, status e logs."
---

# `libretranslate service`

`libretranslate service` roda uma instância do LibreTranslate na sua máquina, num container Docker, para o SDK, o
servidor MCP e a CLI terem com quem conversar.

Ele precisa do [Docker](https://docs.docker.com/get-docker/). Sem ele, o comando nem aparece em
`libretranslate --help`, e cada subcomando confere antes se o Docker está instalado e se o daemon dele responde,
dizendo o que fazer quando não.

```bash
npx libretranslate service up --languages en,pt,es   # cria e inicia, espera até responder
npx libretranslate service status                    # container, imagem, URL, saúde (sai com 3 quando não responde)
npx libretranslate service logs --follow             # o que ele está fazendo (o primeiro início baixa os modelos)
npx libretranslate service down                      # para; --remove também apaga o container
```

Diferente dos comandos de ferramentas, ele não precisa de configuração salva: é assim que uma instância local é
iniciada pela primeira vez.

## `up`

Na primeira vez, baixa a imagem (mostrando o progresso) e cria o container:

- chamado `libretranslate`, publicado só em `127.0.0.1` (porta 5000, ou `--port`);
- com os modelos de idioma no volume `libretranslate-models`, para serem baixados uma vez só;
- carregando só os `--languages` informados, o que acelera bastante o início (padrão: todos os idiomas);
- a partir de `libretranslate/libretranslate:latest`, ou `--image`.

Depois espera o `/health` responder (até 15 minutos, `--timeout <segundos>`; `--no-wait` retorna na hora) e salva
`http://localhost:<porta>` como a instância da CLI quando nenhuma está salva. Quando outra está salva, ele a mantém e
imprime a linha `libretranslate mcp config --base-url …` para trocar.

Quando o container já existe, `up` só o inicia: `--port`, `--languages` e `--image` valem na criação, então ele
avisa. Para mudá-los, rode antes `libretranslate service down --remove`.

A instância que ele roda não emite API keys, então nada mais é necessário.

## `down`

Para o container. `--remove` também o apaga; os modelos continuam no volume
(`docker volume rm libretranslate-models` os apaga).

## `status` e `logs`

`status` imprime o estado do container, a imagem, a URL e se o `/health` responde, e sai com código 3 quando não
responde. `logs` imprime as últimas 100 linhas (`--tail <n>`), ou continua imprimindo as novas com `--follow` (`-f`).
