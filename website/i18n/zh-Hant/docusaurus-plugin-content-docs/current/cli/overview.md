---
sidebar_position: 1
title: CLI 概述
description: "libretranslate 命令: 每個 MCP 工具作為子命令, 以工具的輸入方案為旗號 。"
---

# 中央LI

套件安裝 a `libretranslate` 命令。 這是MCP的客戶端 [同樣的伺服器](../mcp/overview.md): 每一個 MCP 工具都成為子命令, 工具的輸入方案成為它的旗號 。 假設伺服器在命令內執行,
所以沒有什麼可以先開始的 。

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

除了... `--help`, `--version`, `libretranslate docs`, `libretranslate mcp config` 和 `libretranslate mcp uninstall` 執行到有
URL 的配置被儲存 。 `libretranslate docs` 打印此網站的連結并在瀏覽器中開啟它。

## 從工具到命令

- 此命令是工具的名稱, 不包含 `libretranslate_`,以kebab案: `libretranslate_translate_file` → `translate-file`.
- 每面旗子都是 kebab 案的輸入 。
- 列旗取 `a,b` 或 JSON, 物件旗帶 JSON, 而布林旗不需要值 。
- `libretranslate <command> --help` 列出命令的旗號, 并列出 enum 輸入的允許值 。

工具輸出到 stdout 。 工具錯誤會以退出碼 1 傳到 stderr 。

## 一次性設定和執行中的伺服器

`--base-url` 和 `--api-key` 覆蓋環境與儲存的檔案, 供執行中伺服器使用 。 使用 `libretranslate-mcp` 已經在 HTTP 之上了, 通過
`--url http://127.0.0.1:3768/mcp` 或設定 `LIBRETRANSLATE_MCP_URL`這些旗子在命令線上任何地方都行

他們中沒有一個人支持儲存的設定: CLI 拒絕沒有它而執行工具, 即使當 `--url` 或 `--base-url` 提供。

## 本地案例

戴克安裝了 `libretranslate service up` 執行 LibreTranslate 放在容器里,把CLI指向它。 看 [`libretranslate service`](./service.md).

## 管理伺服器

`libretranslate mcp` 在任何連接之前被截取 。 它會設定伺服器, 在背景中執行, 從登入開始, 并在您的 MCP 客戶端中登入 。 看 [`libretranslate mcp`](./mcp-commands.md).
