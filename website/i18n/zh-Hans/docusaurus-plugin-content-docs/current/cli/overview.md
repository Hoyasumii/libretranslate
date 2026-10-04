---
sidebar_position: 1
title: CLI 概览
description: "libre translate 命令:每个 MCP 工具作为子命令,以工具的输入方案作为其旗帜."
---

# 国 际

软件包安装一个 `libretranslate` 命令。 这是MCP的客户端 [同一服务器](../mcp/overview.md):每个MCP工具成为子命令,工具的输入方案成为其旗帜.
默认情况下,服务器运行在命令内,所以没有任何东西可以先启动.

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

没什么,只是... `--help`, (中文). `--version`, (中文). `libretranslate docs`, (中文). `libretranslate mcp config` 和
`libretranslate mcp uninstall` 运行,直到保存有 URL 的配置。 `libretranslate docs` 打印此网站的链接,并在浏览器中打开。

## 从工具到命令

- 命令是工具的名称, 不包含 `libretranslate_`,以kebab为例: `libretranslate_translate_file` → `translate-file`。 。 。 。
- 每面旗帜都是kebab-case中的输入.
- 显示阵列旗 `a,b` 或JSON,对象旗取JSON,布尔旗不需要值.
- `libretranslate <command> --help` 列出命令的旗帜,并列出允许的enum输入值。

工具输出到 stdout 。 工具错误以退出码 1 进入 stderr 。

## 一次性设置和运行中的服务器

`--base-url` 和 `--api-key` 覆盖环境和保存的文件 。 用一个 `libretranslate-mcp` 已经运行在 HTTP 上,通过 `--url http://127.0.0.1:3768/mcp` 或设置
`LIBRETRANSLATE_MCP_URL`这些旗帜在命令线上任何地方都有作用。

其中没有一个代表保存的配置: CLI 拒绝在没有它的情况下运行工具, 即使当 `--url` 或 `--base-url` 给出。

## 本地实例

随着Docker的安装, `libretranslate service up` 运行 LibreTranslate 放在容器里,把CLI指向它。 见 [`libretranslate service`](./service.md)。 。
。 。

## 管理服务器

`libretranslate mcp` 在连接之前被截获。 它配置服务器,在背景中运行,在登录时启动,并在您的MCP客户端中注册. 见 [`libretranslate mcp`](./mcp-commands.md)。 。 。 。
