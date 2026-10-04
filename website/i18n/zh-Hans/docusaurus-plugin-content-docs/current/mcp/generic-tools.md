---
sidebar_position: 4
title: 通用工具
description: "libretranslate_resources, (中文). libretranslate_describe 和 libretranslate_call: 原始数据 LibreTranslate API,按操作操作."
---

# 通用工具

配制的工具涵盖了经纪人通常需要的东西. 还有3个到达原始API,按操作操作,如Spec描述:

1. **`libretranslate_resources`** 列出操作( E)`translate`, (中文). `detect`, (中文). `listLanguages`, (中文).
   `getFrontendSettings`, (中文). `suggest`, (中文). `health`) (中文(简体) ). 与一个 `query`,只有对应的。
2. **`libretranslate_describe`** 给出一个操作的方法、路径、身体图和实例 `libretranslate_call` 输入。 与 `schema`,它从光谱中扩展了一个图案(`depth` 深层,默认值 3。
3. **`libretranslate_call`** 运行它 : `operation` 这是 `operationId` (单位:千美元)`listLanguages`(a) 或 `METHOD /path`
   (单位:千美元)`GET /languages`),以及 `body` 是JSON请求机构。

```json
{ "operation": "translate", "body": { "q": "Olá", "source": "pt", "target": "en", "alternatives": 2 } }
```

## 安全问题

- 未知的身体字段被拒绝,所以一个类型不会默不作声地放弃一个设置.
- `api_key` 拒绝 : 服务器自己发送已配置的密钥, 而计划将其排除在外。
- 写入实例的操作( O)`suggest`需求 `confirm: true`特工被告知先问你
- 文件上传在目录中被忽略 : `libretranslate_translate_file` 以本地路径覆盖。
- 一个很长的答案是切到6万个字符,这么说.

该目录由与SDK相同的OpenAPI spec生成(`pnpm codegen:mcp`) (中文(简体) ).
