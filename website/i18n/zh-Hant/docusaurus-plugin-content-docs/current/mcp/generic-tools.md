---
sidebar_position: 4
title: 一般工具
description: "libretranslate_resources, libretranslate_describe 和 libretranslate_call: 未生 LibreTranslate API,按操作操作."
---

# 一般工具

經典工具能涵盖代理商通常需要的 如Spec描述:

1. **`libretranslate_resources`** 列出操作( E)`translate`, `detect`, `listLanguages`, `getFrontendSettings`, `suggest`,
   `health`). 有 `query`只有匹配的
2. **`libretranslate_describe`** 提供一個操作的方法、路徑、身體設計和示例 `libretranslate_call` 輸入。 用 `schema`,它從光谱中擴展出一個方案(`depth` 深度, 默认值
   3 。
3. **`libretranslate_call`** 執行它 : `operation` 是 `operationId` (`listLanguages`或 `METHOD /path` (`GET /languages`),和
   `body` 是JSON要求的身體

```json
{ "operation": "translate", "body": { "q": "Olá", "source": "pt", "target": "en", "alternatives": 2 } }
```

## 安全

- 未知的身體字段被拒絕, 所以打字不會悄悄地掉下設定值 。
- `api_key` 被拒絕 : 伺服器自己傳送已設定的金鑰, 而圖案將它留出 。
- 寫入實體的操作( E)`suggest`需要 `confirm: true`經紀人要先問你
- 檔案上傳不在目錄中 : `libretranslate_translate_file` 從當地的路遮住它
- 一個很長的答案是六萬個字,

此目錄由與 SDK (SDK) 相同的 OpenAPI spec 產生(`pnpm codegen:mcp`).
