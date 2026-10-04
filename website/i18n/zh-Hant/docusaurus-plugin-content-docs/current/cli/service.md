---
sidebar_position: 3
title: 自由翻譯服務
description: "自由翻譯服務: 執行 LibreTranslate 本地在 Docker 容器中, 上面, 下面, 狀態和日志 。"
---

# `libretranslate service`

`libretranslate service` 執行 LibreTranslate 所以SDK、MCP伺服器和CLI有話要說

它需要 [嵌入器](https://docs.docker.com/get-docker/)沒有它,命令甚至不顯示在 `libretranslate --help`, 每個子命令首先檢查 Docker 已安裝, 並且檢查它的守护程序會回答,
并說在沒有時該怎麼做 。

```bash
npx libretranslate service up --languages en,pt,es   # create and start it, wait until it answers
npx libretranslate service status                    # container, image, URL, health (exit 3 when it does not answer)
npx libretranslate service logs --follow             # what it is doing (the first start downloads models)
npx libretranslate service down                      # stop it; --remove also deletes the container
```

和工具命令不同的是, 它不需要儲存的設定: 這是當地實體最初是如何開始的 。

## `up`

它第一次拉動影像(隨其進展),

- 命名 `libretranslate`,出版于 `127.0.0.1` 只(端口5000,或 `--port`;
- 使用 `libretranslate-models` 音量,所以可以下載一次;
- 只有 `--languages` 已載入, 讓它開始得更快( 預設: 每種語言 ) ;
- 從 `libretranslate/libretranslate:latest`,或 `--image`.

那就等著吧 `/health` (最多15分鐘) `--timeout <seconds>`; `--no-wait` 返回一次),并保存 `http://localhost:<port>` 以CLI為例, 當其他實體被儲存時,
它會保留它并打印 `libretranslate mcp config --base-url …` 要切換的行。

當容器已經存在時 `up` 只開始它: `--port`, `--languages` 和 `--image` 當它被建立時就應用,所以它說是的。 為了改變他們 `libretranslate service down --remove`
先

它的實驗沒有 API 金鑰, 所以不需要其他的 。

## `down`

停止容器。 `--remove` 也刪除它; 模型留在音量中(`docker volume rm libretranslate-models` 刪除它們)。

## `status` 和 `logs`

`status` 列印容器的狀態、影像、網址以及是否 `/health` 答案, 否則以代碼 3 退出 。 `logs` 打印最后100行( E)`--tail <n>`),或用 `--follow` (`-f`).
