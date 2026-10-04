---
sidebar_position: 100
title: 捐款
description: "建立寄存器, 執行檢查和測試, 追隨 API 變更, 並建立此文件網站 。"
---

# 捐款

主目錄是 [Hoyasumii/ libre translate](https://github.com/Hoyasumii/libretranslate)管理 pnpm (Node.js )

```bash
pnpm install          # dependencies, plus the git hooks (husky)
pnpm build            # tsc → dist/ (CommonJS + .d.ts)
pnpm test:unit        # jest, with a fake LibreTranslate on node:http (no network)
pnpm test:live        # against a real instance (.env.test, from env.example)
pnpm check:types      # tsc --noEmit over src, tests and scripts
pnpm check:lint       # oxlint (`pnpm fix:lint` fixes what it can)
pnpm check:format     # oxfmt, 120 columns (`pnpm fix:format` rewrites)
pnpm check:knip       # unused files, exports and dependencies
```

每個文稿都是跨平台的: 不 `rm`, `$VAR` 或 `VAR=1 cmd`. `.gitattributes` 保持 LF,与 `.cmd`/`.vbs` 在CRLF。

支票是當地的通訊 `pre-commit` 執行 `check:lint` 和 `check:format`, `commit-msg` 使用傳統設定值執行輸入( R)`feat: …`, `fix(mcp): …`),和
`pre-push` 執行 `check:types`, `check:knip` 和 `test:unit`.

每次推到 `main` 執行連續交付工作流程( E)`.github/workflows/cd.yml`). 它做同樣的支票和建築 然後:

- 出版 `package.json`版本到 npm 當版本尚未登入登記錄時( 通过信任的出版, 有來源) , 標籤它 `v<version>` 開啟 GitHub 释放;
- 建立網站并将其部署到 `gh-pages` 推動觸碰時的分枝 `website/` 或 `src/` (工作流程的人工操作總是部署).

要釋放,碰碰 `version` in `package.json` 合并到 `main`.

## 產生的代碼

```bash
pnpm codegen          # spec/openapi.yml → src/generated/ (orval) and src/mcp/generated/catalog.json
pnpm codegen:mcp      # only the MCP catalog (a unit test fails when it is stale)
```

`spec/openapi.yml` 是單一來源: OpenAPI 3.1 描述 LibreTranslate API 從公開的 API 文件中為此套件寫入, 以及正在執行的實體的答案 。 `orval.config.ts` 產生
`fetch` 函數( 通过) `src/transport.ts`),模型型態和 zod 計划 永不編輯 `src/generated/` 手動: 變更字串並執行 `pnpm codegen`.

要跟隨 API 的變更: 更新字串, 執行 `pnpm codegen`调整 `src/client.ts` 和工具,如果方法變更,用實例檢查 `pnpm test:live`.

此套件是 MIT 且保持獨立性: 它從文件描述 API 以及可觀察的行為, 從來不複製 。 LibreTranslate 專案或它的 MCP 伺服器( AGPL-3.0).

## 這個網站

這個網站是 Docusaurus 工作空間套件 `website/`,英文和葡萄牙文(巴西)。

```bash
pnpm docs:dev                    # preview (append `--locale pt-BR` for the translation)
pnpm docs:build                  # build every locale into website/build/
pnpm docs:serve                  # serve the build (search only works on a build)
GIT_USER=<user> pnpm docs:deploy # build and push to the gh-pages branch
```

- 指導者是普通的馬克頓 `website/docs/`中的頁面 `website/i18n/pt-BR/docusaurus-plugin-content-docs/current/`:一起改變。
- 其 [API 參考](pathname://../docs/api) 產生自 `src/index.ts` 和 `src/mcp/index.ts` 由TypeDoc在每座英式建筑。
- `llms.txt` 和 `llms-full.txt` 根據每座建築的英文導覽,
