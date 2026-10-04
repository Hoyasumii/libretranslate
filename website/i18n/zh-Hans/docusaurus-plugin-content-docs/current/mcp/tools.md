---
sidebar_position: 3
title: 工具
description: "所编译的MCP工具:翻译文本和文件,检测语言,列出语言,实例状态和建议."
---

# 工具

他们的投入是: zod 计划 orval 从 spec 生成,所以代理机会看到与 SDK 相同的字段,enum 和默认值.

## `libretranslate_translate`

翻译一个文本,或一个调用中的清单。

| 投入           | 为什么                          |
| -------------- | ------------------------------- |
| `q`            | 文本,或文本列表                 |
| `target`       | 目标语言代码                    |
| `source`       | 源语言代码; `auto` 发现它,      |
| `format`       | `text` (违约)或 `html`,保持标记 |
| `alternatives` | 需要添加多少其他翻译( 默认 0)   |

它回答API自己的形状: `translatedText`外加时 `detectedLanguage` 与 `auto` 和 `alternatives` 当问.

## `libretranslate_translate_file`

翻译本地文档并保存结果。

| 投入        | 为什么                                        |
| ----------- | --------------------------------------------- |
| `path`      | 要翻译的文件                                  |
| `target`    | 目标语言代码                                  |
| `source`    | 源语言代码, `auto` 默认                       |
| `output`    | 何处保存翻译( 默认: 在原件旁边)               |
| `overwrite` | 替换已有文件( 默认错误: 已存在的文件从未触碰) |

`report.docx` 翻译为 `pt` 变成 `report.pt.docx`它回答问题 `{ savedTo, bytes, translatedFileUrl }`。服务器在其运行的机器上读写文件,并获得用户权限。

## `libretranslate_detect`

候选语言 `q`,最有可能的是,每个都有从0到100的自信.

## `libretranslate_languages`

没有输入,每种语言的代码和名称. 当每种语言翻译成其他每一种语言(通常的情况)时,目标被列出一次,而不是每个语言一次. 与 `source`翻译为的语言。

## `libretranslate_status`

实例在一个答案中的健康和设置:是否需要API密钥以及是否配置了密钥,每个请求的字符限制,文件翻译和建议是否启用,以及被接受的文件格式. 第一次打给经纪人

## `libretranslate_suggest`

发送更正的译文( E)`s`案文(`q`)回到案例,它保持它。 该代理只有在您询问时才被告知使用, 并且它失败于禁用建议的情况 。

## 代理服务器可操作的错误

工具错误是文本, 表达要做什么: 需要带有提示的密钥答案 `libretranslate mcp config`,在配置的密钥上一个403分,一个429分表示等待. 钥匙本身从未出现。
