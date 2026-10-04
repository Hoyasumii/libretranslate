---
sidebar_position: 3
title: 自由翻译服务
description: "自由翻译服务: 运行 LibreTranslate 在本地的Docker容器中,有上,下,状态和日志."
---

# `libretranslate service`

`libretranslate service` 运行一个 LibreTranslate 在你的机器上,在一个Docker容器, 所以SDK,MCP服务器和CLI有话要说。

这需要 [插头](https://docs.docker.com/get-docker/)没有它,命令甚至不会显示在
`libretranslate --help`,每个子命令首先检查Docker的安装以及它的守护进程应答,并说在不安装时该做什么。

```bash
npx libretranslate service up --languages en,pt,es   # create and start it, wait until it answers
npx libretranslate service status                    # container, image, URL, health (exit 3 when it does not answer)
npx libretranslate service logs --follow             # what it is doing (the first start downloads models)
npx libretranslate service down                      # stop it; --remove also deletes the container
```

与工具命令不同的是,它不需要保存的配置:这是本地实例一开始是如何启动的.

## `up`

它第一次拉动图像(随着其进展),然后创建容器:

- 名称 `libretranslate`,发表于 `127.0.0.1` 仅(端口5000,或 `--port`(三)
- 语言模型 `libretranslate-models` 音量,所以可以下载一次;
- 仅限 `--languages` 给定加载, 使其开始得更快( 默认: 每种语言) ;
- 从 `libretranslate/libretranslate:latest`,或 `--image`。 。 。 。

然后它等着 `/health` 答复(最多15分钟, `--timeout <seconds>`· ; `--no-wait` 返回,并保存 `http://localhost:<port>` 以CLI为例,当时还没有人被拯救。
当保存另一个实例时,它会保存它并打印 `libretranslate mcp config --base-url …` 要切换的行。

当容器已经存在时, `up` 只开始它: `--port`, (中文). `--languages` 和 `--image` 当它被创建时应用,所以它这样说。 为了改变他们
`libretranslate service down --remove` 先说

它运行的实例没有 API 密钥, 所以不需要其他的 。

## `down`

停止容器。 `--remove` 也删除;模型留在音量中(`docker volume rm libretranslate-models` 删除它们)。

## `status` 和 `logs`

`status` 打印容器的状态、图像、 URL以及是否 `/health` 答案,然后在代码3没有时退出。 `logs` 打印最后的100行(`--tail <n>`),或继续用 `--follow` (单位:千美元)`-f`)
(中文(简体) ).
