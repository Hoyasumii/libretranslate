---
sidebar_position: 5
title: 配置
description: "服务器和 CLI 读取的设置, 保存的位置, 以及解决顺序 。"
---

# 配置

每个设置来自旗帜,然后是环境,然后是文件 `libretranslate mcp config` 保存,然后是默认值。

| 变量                     | 为什么                                           | 默认                    |
| ------------------------ | ------------------------------------------------ | ----------------------- |
| `LIBRETRANSLATE_URL`     | 实例 URL                                         | `http://localhost:5000` |
| `LIBRETRANSLATE_API_KEY` | API 密钥, 用于发布密钥的实例                     | 无                      |
| `PORT`                   | HTTP 端口                                        | `3768`                  |
| `LIBRETRANSLATE_CONFIG`  | 保存的配置所居住的地方( 也) `--config`页:1       | 见下文                  |
| `LIBRETRANSLATE_MCP_URL` | 为CLI:运行 `libretranslate-mcp` 用于(`--url`页:1 | 正在处理的服务器        |

自主办实例通常不需要密钥. 主办单位,例如 libretranslate.com,有:没有它,每个翻译回答400。 `libretranslate status` 告诉谁。

## 在它保存的地方

- `~/.config/libretranslate/.env` 在 Linux 上;
- `~/Library/Application Support/libretranslate/.env` 关于macOS的;
- `%APPDATA%\libretranslate\.env` 窗口上;
- 或在何处 `LIBRETRANSLATE_CONFIG`页:1`--config` 点。

文件是用0600模式(在Windows上文件夹的ACL保护它)写的.

API 密钥从不出现错误,日志, `--help` 或配置表单。
