---
sidebar_position: 5
title: 配置
description: "設定伺服器與 CLI 讀取的設定, 它們被儲存的位置, 以及它們被解析的顺序 。"
---

# 配置

每個設定都來自旗子,然後是環境,然後是檔案 `libretranslate mcp config` 已儲存, 然後是預設值 。

| 變數                     | 為什麼                                               | 默认                    |
| ------------------------ | ---------------------------------------------------- | ----------------------- |
| `LIBRETRANSLATE_URL`     | 实例 URL                                             | `http://localhost:5000` |
| `LIBRETRANSLATE_API_KEY` | API 金鑰, 用于發出金鑰的事件                         | 無                      |
| `PORT`                   | HTTP 端口                                            | `3768`                  |
| `LIBRETRANSLATE_CONFIG`  | 保存的配置所在( 也是) `--config`)                    | 见下文                  |
| `LIBRETRANSLATE_MCP_URL` | 對 CLI: 執行 `libretranslate-mcp` 要使用( N)`--url`) | 正在處理伺服器          |

通常不需要鑰匙。 主持者,例如 libretranslate.com沒有它,所有的翻譯都回答400。 `libretranslate status` 告訴誰

## 保存的地方

- `~/.config/libretranslate/.env` 在 Linux 上;
- `~/Library/Application Support/libretranslate/.env` 在 macOS 上;
- `%APPDATA%\libretranslate\.env` 視窗上;
- 或任何地方 `LIBRETRANSLATE_CONFIG`/`--config` 分。

檔案以 0600 模式寫成( 在 Windows 上, 資料夾的ACL 保護它) 。

API 按鍵從不出現錯誤,日志, `--help` 或配置表單。
