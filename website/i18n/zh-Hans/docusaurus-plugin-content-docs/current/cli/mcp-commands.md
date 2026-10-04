---
sidebar_position: 2
title: 自由翻译 mcp
description: "libretranslate mcp:保存配置,在背景中运行服务器,在登录时启动并在您的MCP客户端注册."
---

# `libretranslate mcp`

`libretranslate mcp` 为您管理 MCP 服务器: 其保存的配置, 背景 HTTP 服务器, 登录服务, 及其在 MCP 客户端的注册 。

```bash
npx libretranslate mcp config                 # asks for the settings in the terminal and saves them
npx libretranslate mcp config --base-url http://localhost:5000 --port 4000   # no prompts (scripts, CI): saves just these
npx libretranslate mcp config --web           # the same, in a local web form
npx libretranslate mcp install                # pick Claude Code / Codex / OpenCode and register libretranslate-mcp (stdio) in them
npx libretranslate mcp install --client claude,opencode --force   # no picker (scripts, CI); --force replaces an entry
npx libretranslate mcp uninstall              # pick the clients to remove the 'libretranslate' entry from (no saved config needed)
npx libretranslate mcp start                  # start in the background (needs a saved config); prints the URL for `claude mcp add`
npx libretranslate mcp start --api-key other --port 4000   # one-off values, never saved
npx libretranslate mcp status                 # running or stopped (exit 3), URL, pid, uptime
npx libretranslate mcp stop
npx libretranslate mcp boot enable            # start at every login; `boot disable` / `boot status`
```

## `libretranslate mcp config`

写入保存 `.env` (单位:千美元)[配置](../mcp/configuration.md)) (中文(简体) ). 它有三个方法:

- **在终点站** (默认). 它要求从保存的值开始依次设定每个设置(`http://localhost:5000` 用于新建 URL). API 密钥被打入掩码: 输入保存保存的密钥( 或未保存) ,以及 `-` 清净.
- **带着旗帜** 鉴于任何 `--base-url`, (中文). `--api-key` (单位:千美元)`-` 清除)或 `--port`,它不问什么 并且只救那些。 没有终端,它需要它们。 作为旗子传来的钥匙 留在你的壳体史上
  所以更喜欢用它
- **网络形式** 与 `--web`: 本地页面,在浏览器中打开(`--no-open` 只打印其 URL 。 一个空白的秘密 保存了保存的。

如果服务器正在运行, 它会说: 重新启动它来抓取更改 。 `--config <file>` (或 `LIBRETRANSLATE_CONFIG`)写另一个文件.

## `libretranslate mcp install`

通过运行每个客户端 `--version`,然后通过客户端自己的CLI注册 stdio 服务器,名称为 `libretranslate`编号 :

| 客户端      | 命令它运行                  |
| ----------- | --------------------------- |
| Claude Code | `claude mcp add -s user`    |
| Codex       | `codex mcp add`             |
| OpenCode    | `opencode mcp add --global` |

注册命令是 `node <package>/dist/mcp/cli.js` 绝对路径, 没有证书 : 当客户端启动时, 服务器读取保存的文件( N)`LIBRETRANSLATE_CONFIG` 只有在 `--config`
命名另一个文件)。

每个发现的客户端开始勾选 。 一个已经有一个 `libretranslate` 标记条目 `already installed, reinstalls` 然后换掉 没有互动终端 `--client` 需要(`claude`, (中文).
`codex`, (中文). `opencode`; 也在 WSL 内 `claude@windows`, (中文). `codex@windows`, (中文). `opencode@windows`),加: `--force`
替换条目。 `--dry-run` 打印命令而不是运行。

两者 `install` 和 `uninstall` 每个客户端的用户级(全局)配置。 项目范围条目从不触动.

## `libretranslate mcp uninstall`

以 `libretranslate` 条目,显示是否为 `stdio` 或 `http`,并删除该名称的任何条目: `claude mcp remove -s user`, (中文). `codex mcp remove`,用于
OpenCode (没有) `remove`)编辑其全局配置文件,只删除该密钥,保留注释和布局.

这是唯一的命令之外 `libretranslate mcp config` 运行时没有保存的配置,所以可以在配置消失后清理客户端。 `--client` 和 `--dry-run` 工作情况 `install`。 。 。 。

## `libretranslate mcp start`, (中文). `stop` 和 `status`

`start` 运行 HTTP 服务器脱落, 其pid 和日志输入 `<config dir>/run/`,并打印其 URL、日志文件和 `claude mcp add` 线条以注册它。 它需要一个保存的配置. `--api-key`,
(中文). `--base-url` 和 `--port` 仅为本次运行而覆盖, 并且从未保存 。 `--foreground` 相反,在目前进程中提供了服务。

`status` 打印服务器是否在运行,包括它的 URL、 pid 和 upptime, 并在不运行时使用代码 3 退出。 `stop` 请服务器通过代号守护关闭 `POST /shutdown`,并仅在失败时表示进程。

## `libretranslate mcp boot`

`boot enable` 安装当前用户在每次登录时启动服务器的服务, 因此不需要sudo :

| 业务办 | 服务                                              |
| ------ | ------------------------------------------------- |
| 链接   | 系统化用户单元(在WSL上,启用在 `/etc/wsl.conf`页:1 |
| 马科斯 | a 发射代理                                        |
| 窗口   | 登录任务                                          |

服务只读保存的配置 。 `boot disable` 把它删除 `boot status` 报告
