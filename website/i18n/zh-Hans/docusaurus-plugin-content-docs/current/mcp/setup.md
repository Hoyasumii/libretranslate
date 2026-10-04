---
sidebar_position: 2
title: 设置
description: "保存一次设置并注册 LibreTranslate MCP 服务器在 Claude Code, (中文). Codex 和 OpenCode。 。 。 。"
---

# 设置

## 快速前进

保存您的设置一次, 然后让 CLI 在它找到的客户端中注册服务器 :

```bash
npx libretranslate mcp config    # asks for the instance URL, an API key if it issues keys, and a port
npx libretranslate mcp install   # finds Claude Code, Codex and OpenCode on your PATH and registers libretranslate-mcp (stdio)
```

`install` 显示它找到的客户的核对表。 选中您想要的, 它通过每个客户端的 CLI 注册服务器, 名称为 `libretranslate`。注册命令在客户端启动时读取保存的配置,所以没有 API 密钥最终会出现在客户端的配置中. 见
[`libretranslate mcp install`](../cli/mcp-commands.md#libretranslate-mcp-install) 为旗帜。

## 通过手: stdio

让客户开始 `libretranslate-mcp`它读取保存的配置,所以客户端配置不需要密钥 :

```json
{
  "mcpServers": {
    "libretranslate": { "command": "npx", "args": ["-y", "-p", "@hoyasumii/libretranslate", "libretranslate-mcp"] }
  }
}
```

内 Claude Code编号 :

```bash
claude mcp add libretranslate -- npx -y -p @hoyasumii/libretranslate libretranslate-mcp
```

没有保存的配置, 服务器使用 `http://localhost:5000` 没有钥匙 要将其指向其它地方,或覆盖保存的文件,请给客户端一个 `env` 块( 参见 [配置](./configuration.md):

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

## 亲手: HTTP

在背景中运行一个服务器,并将客户端指向它的URL:

```bash
npx libretranslate mcp start          # prints the URL, http://127.0.0.1:3768/mcp by default
claude mcp add --transport http libretranslate http://127.0.0.1:3768/mcp
```

没有CLI, `libretranslate-mcp --http` 以环境或保存的配置设置在前景中运行 。 `libretranslate-mcp --help` 列出旗帜。 要在每次登录时启动服务器, 请运行
`npx libretranslate mcp boot enable` (见 [`libretranslate mcp boot`](../cli/mcp-commands.md#libretranslate-mcp-boot))
(中文(简体) ).

## 检查它的工作

叫你的经纪人打电话 `libretranslate_status`,或从终端运行它:

```bash
npx libretranslate status
```

它回答实例 URL, 是否配置和需要一个密钥, 字符限制和文件格式 。
