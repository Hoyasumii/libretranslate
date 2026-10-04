---
sidebar_position: 1
title: 概览
description: "那个 LibreTranslate MCP服务器:它的传输,工具,以及HTTP模式."
---

# MCP 服务器

`libretranslate-mcp` 给 Claude Code, (中文). Codex, (中文). OpenCode 或任何其它 MCP 客户端机翻译 LibreTranslate 举个例子。

```bash
libretranslate-mcp            # stdio: what the MCP client runs
libretranslate-mcp --http     # http://127.0.0.1:3768/mcp (PORT changes the port)
libretranslate mcp start      # the same in the background; stop/status; boot enable to start it at login
```

## 工具

| 工具                                                                           | 为什么                                              |
| ------------------------------------------------------------------------------ | --------------------------------------------------- |
| `libretranslate_translate`                                                     | 文本或列表,带有 `auto` 检测、 HTML 和选项           |
| `libretranslate_translate_file`                                                | 本地文档, 保存在原始文件旁边 `<name>.<target><ext>` |
| `libretranslate_detect`                                                        | 案文的候选语文                                      |
| `libretranslate_languages`                                                     | 语言代码或一个源的目标                              |
| `libretranslate_status`                                                        | 健康, 是否需要密钥, 字符限制, 文件格式              |
| `libretranslate_suggest`                                                       | 当用户要求翻译时, 发送更好的翻译回来                |
| `libretranslate_resources` / `libretranslate_describe` / `libretranslate_call` | 原始的API, 按操作操作                               |

- [工具](./tools.md):详细整理的工具.
- [通用工具](./generic-tools.md):生的API.

## HTTP 模式

- 这是无国籍的,听 `127.0.0.1` 仅此而已。
- 它拒绝一个 `Host` 这不是回转,与 DNS 重新绑定。
- `GET /health` 回复 `{ ok, baseUrl, apiKey, version }`, (中文). `apiKey` 表示是否已经配置 。
- `POST /shutdown` 带标志 `libretranslate mcp start` 生成关闭它;`libretranslate mcp stop`
  就是这样停止服务器的,包括 Windows。

在stdio模式下,stdout携带协议:服务器日志仅用于stderr.

错误从不携带API密钥:每个工具错误都通过与SDK相同的遮罩.
