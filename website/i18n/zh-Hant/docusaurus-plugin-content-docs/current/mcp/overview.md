---
sidebar_position: 1
title: 概述
description: "其 LibreTranslate MCP伺服器:它的傳輸器,工具,以及HTTP模式."
---

# MCP 伺服器

`libretranslate-mcp` 給 Claude Code, Codex, OpenCode 或其他 MCP 用戶端機翻譯 LibreTranslate 例子。

```bash
libretranslate-mcp            # stdio: what the MCP client runs
libretranslate-mcp --http     # http://127.0.0.1:3768/mcp (PORT changes the port)
libretranslate mcp start      # the same in the background; stop/status; boot enable to start it at login
```

## 工具

| 工具                                                                           | 為什麼                                        |
| ------------------------------------------------------------------------------ | --------------------------------------------- |
| `libretranslate_translate`                                                     | 文字或清單,附 `auto` 偵測、 HTML 和替代程式   |
| `libretranslate_translate_file`                                                | 本地文件, 保存在原件旁 `<name>.<target><ext>` |
| `libretranslate_detect`                                                        | 文稿的候选語言                                |
| `libretranslate_languages`                                                     | 語言代碼或一個來源的目標                      |
| `libretranslate_status`                                                        | 健康, 是否需要金鑰, 字元限制, 文件格式        |
| `libretranslate_suggest`                                                       | 當使用者要求時, 傳回更好的翻譯                |
| `libretranslate_resources` / `libretranslate_describe` / `libretranslate_call` | 原始 API, 按操作操作                          |

- [工具](./tools.md): 精細的整理工具.
- [一般工具](./generic-tools.md):生的API.

## HTTP 模式

- 無國籍,聽著 `127.0.0.1` 只有
- 它拒絕了 `Host` 而不是反轉 DNS 重新捆綁。
- `GET /health` 答案 `{ ok, baseUrl, apiKey, version }`, `apiKey` 表示是否已設定 。
- `POST /shutdown` 與符號 `libretranslate mcp start` 產生關閉它; `libretranslate mcp stop`
  就是這樣停止伺服器的,包括 Windows。

在 stdio 模式下, stdout 帶有協議: 伺服器紀錄只限 stderr 。

錯誤從不携带 API 金鑰 : 每一個工具錯誤都經過 SDK 相同的遮罩 。
