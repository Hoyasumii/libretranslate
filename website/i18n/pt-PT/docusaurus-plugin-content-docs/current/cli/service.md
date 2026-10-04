---
sidebar_position: 3
title: serviço libretranslate
description: "serviço libretranslate: executar LibreTranslate localmente em um recipiente Docker, com para cima, para baixo, status e logs."
---

# `libretranslate service`

`libretranslate service` executa a LibreTranslate instância em sua máquina, em um recipiente Docker, então o SDK, o
servidor MCP e o CLI têm algo para conversar.

Precisa [Acoplamento](https://docs.docker.com/get-docker/). Sem ele, o comando nem sequer aparece em
`libretranslate --help`, e cada subcomando primeiro verifica que Docker está instalado e que seu daemon responde,
dizendo o que fazer quando não.

```bash
npx libretranslate service up --languages en,pt,es   # create and start it, wait until it answers
npx libretranslate service status                    # container, image, URL, health (exit 3 when it does not answer)
npx libretranslate service logs --follow             # what it is doing (the first start downloads models)
npx libretranslate service down                      # stop it; --remove also deletes the container
```

Ao contrário dos comandos da ferramenta, ela não precisa de configuração salva: é como uma instância local é iniciada em
primeiro lugar.

## `up`

A primeira vez, ele puxa a imagem (com o seu progresso), em seguida, cria o recipiente:

- nomeado `libretranslate`, publicado em `127.0.0.1` Unicamente (porto 5000, ou `--port`);
- com os modelos de linguagem na `libretranslate-models` volume, então eles são baixados uma vez;
- com apenas o `--languages` dado carregado, o que o torna muito mais rápido (padrão: cada idioma);
- de `libretranslate/libretranslate:latest`, ou `--image`.

Então, espera `/health` responder (até 15 minutos, `--timeout <seconds>`; `--no-wait` retorna de uma vez), e salva
`http://localhost:<port>` como exemplo do CLI quando nenhum é salvo ainda. Quando outra instância é salva, ela a mantém
e imprime o `libretranslate mcp config --base-url …` linha para mudar.

Quando o recipiente já existir, `up` só começa: `--port`, `--languages` e `--image` aplicar quando é criado, assim o
diz. Para mudá-los, `libretranslate service down --remove` Primeiro.

A instância que ele executa não tem nenhuma chave API, então nada mais é necessário.

## `down`

Para o contentor. `--remove` também apaga; os modelos permanecem no volume (`docker volume rm libretranslate-models`
apaga- os).

## `status` e `logs`

`status` imprime o estado do recipiente, imagem, URL e se `/health` respostas, e sai com o código 3 quando não o faz.
`logs` imprime as últimas 100 linhas (`--tail <n>`), ou continua a imprimir novos com `--follow` (`-f`).
