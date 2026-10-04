---
sidebar_position: 3
title: 工具
description: "MCP 工具:翻譯文字與檔案, 探測語言, 列出、例數狀態及建議。"
---

# 工具

他們的投入是: zod 方案 orval 從 spec 產生, 因此代理會看到與 SDK 相同的字段、 enum 和預設值 。

## `libretranslate_translate`

翻譯一個文字, 或是一個呼叫中的清單 。

| 投入           | 為什麼                         |
| -------------- | ------------------------------ |
| `q`            | 文字, 或文字清單               |
| `target`       | 目標語言代碼                   |
| `source`       | 源碼; `auto` 察覺它            |
| `format`       | `text` (默认)或 `html`保持標記 |
| `alternatives` | 要新增多少其他翻譯( 預設 0)    |

它回答API自己的形狀: `translatedText`附加 `detectedLanguage` 與 `auto` 和 `alternatives` 當被問到時

## `libretranslate_translate_file`

翻譯本地文件並儲存結果 。

| 投入        | 為什麼                                           |
| ----------- | ------------------------------------------------ |
| `path`      | 要翻譯的檔案                                     |
| `target`    | 目標語言代碼                                     |
| `source`    | 源语言代碼, `auto` 默认                          |
| `output`    | 在哪里儲存翻譯( 預設: 在原件旁)                  |
| `overwrite` | 取代已存在的檔案( 假設: 已存在的檔案從未觸碰過 ) |

`report.docx` 翻譯成 `pt` 變成 `report.pt.docx`答案 `{ savedTo, bytes, translatedFileUrl }`。伺服器在您的使用者權限下讀取並寫入它啟動的機器上的檔案 。

## `libretranslate_detect`

候选語言 `q`最有可能的是 每個人都有從0到100的自信

## `libretranslate_languages`

沒有輸入 每個語言的代碼和名稱 當每種語言翻譯成其他語言(通常的例), 用 `source`人所翻譯的語言

## `libretranslate_status`

此實驗的健康和設定在一個答案中 : 是否需要 API 金鑰, 是否配置了 API 金鑰, 每個要求的字元限制, 檔案翻譯與建議是否開啟, 以及接受的檔案格式 。 第一次打來找特工

## `libretranslate_suggest`

傳送更正的翻譯( N)`s`文字( )`q`回到案例,它保持它。 代理伺服器只有在您要求時才能使用, 並且無法使用建議。 Name

## 代理伺服器可操作的錯誤

工具錯誤是說要做什麼的文字: 一個需要有提示的關鍵答案的實驗 `libretranslate mcp config`429 表示等待。 鑰匙本身從未出現
