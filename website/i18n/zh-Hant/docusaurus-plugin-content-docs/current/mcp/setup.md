---
sidebar_position: 2
title: 設定
description: "儲存您的設定值一次並登記 LibreTranslate MCP 伺服器在 Claude Code, Codex 和 OpenCode."
---

# 設定

## 快速的路

儲存您的設定值一次, 然后讓 CLI 在它找到的客戶端中登記伺服器 :

```bash
npx libretranslate mcp config    # asks for the instance URL, an API key if it issues keys, and a port
npx libretranslate mcp install   # finds Claude Code, Codex and OpenCode on your PATH and registers libretranslate-mcp (stdio)
```

`install` 顯示它找到的客戶清單 。 勾選您想要的, 它會通過每個客戶端的 CLI 登記伺服器, 名為 `libretranslate`。註冊命令在客戶端啟動時會讀取儲存的設定, 所以沒有 API 金鑰會在客戶端的設定中結束 。 看
[`libretranslate mcp install`](../cli/mcp-commands.md#libretranslate-mcp-install) 為了旗子

## 按手: stdio

讓客戶端開始 `libretranslate-mcp`。它會讀取儲存的設定, 所以客戶端配置不需要按鍵 :

```json
{
  "mcpServers": {
    "libretranslate": { "command": "npx", "args": ["-y", "-p", "@hoyasumii/libretranslate", "libretranslate-mcp"] }
  }
}
```

在 Claude Code:

```bash
claude mcp add libretranslate -- npx -y -p @hoyasumii/libretranslate libretranslate-mcp
```

沒有儲存的設定, 伺服器使用 `http://localhost:5000` 沒有鑰匙 要將它指向別處, 或是覆蓋已儲存的檔案, 請給客戶端一個 `env` 區塊( 见 [配置](./configuration.md):

```json
{
  "mcpServers": {
    "libretranslate": {
      "command": "npx",
      "args": ["-y", "-p", "@hoyasumii/libretranslate", "libretranslate-mcp"],
      "env": { "LIBRETRANSLATE_URL": "https://libretranslate.com", "LIBRETRANSLATE_API_KEY": "your-api-key" }
    }
  }
}
```

## 手: HTTP

在背景中執行一個伺服器, 將您的客戶端指向它的網址 :

```bash
npx libretranslate mcp start          # prints the URL, http://127.0.0.1:3768/mcp by default
claude mcp add --transport http libretranslate http://127.0.0.1:3768/mcp
```

沒有CLI, `libretranslate-mcp --http` 以環境的設定或儲存的設定在前景中執行 。 `libretranslate-mcp --help` 列出旗子。 每次登入時啟動伺服器, 執行
`npx libretranslate mcp boot enable` (看 [`libretranslate mcp boot`](../cli/mcp-commands.md#libretranslate-mcp-boot)).

## 檢查有用

叫你的經紀人打電話 `libretranslate_status`,或從終點執行它:

```bash
npx libretranslate status
```

它會回答實例 URL, 是否設定和需要金鑰, 字元限制與檔案格式 。
