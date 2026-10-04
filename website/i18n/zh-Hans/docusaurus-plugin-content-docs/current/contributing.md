---
sidebar_position: 100
title: 捐款
description: "设置寄存器,运行检查和测试,跟踪API更改,并构建此文档站点."
---

# 捐款

仓库是 [胡亚苏米/图书馆翻译](https://github.com/Hoyasumii/libretranslate),管理与 pnpm (单位:千美元)Node.js (第20条或以后)。

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

每个脚本都是跨平台的:没有 `rm`, (中文). `$VAR` 或 `VAR=1 cmd`。 。 。 。 `.gitattributes` 保持 LF, 与 `.cmd`页:1`.vbs` 在 CRLF 中。

支票通过钩子在当地运行。 `pre-commit` 运行 `check:lint` 和 `check:format`, (中文). `commit-msg` 使用常规配置运行承诺( R)`feat: …`, (中文).
`fix(mcp): …`),以及 `pre-push` 运行 `check:types`, (中文). `check:knip` 和 `test:unit`。 。 。 。

每一次推进 `main` 运行连续交付工作流程`.github/workflows/cd.yml`) (中文(简体) ). 它运行相同的检查和建筑,然后:

- 发表 `package.json`'版本为 npm 当该版本尚未登入登记册时(通过信任出版,有来源),标记它 `v<version>` 打开一个 GitHub 释放;
- 建立网站并将其部署到 `gh-pages` 当推力触动时,树枝 `website/` 或 `src/` (工作流程的人工运行总是部署).

要释放,碰碰 `version` 输入 `package.json` 合并到 `main`。 。 。 。

## 生成代码

```bash
pnpm codegen          # spec/openapi.yml → src/generated/ (orval) and src/mcp/generated/catalog.json
pnpm codegen:mcp      # only the MCP catalog (a unit test fails when it is stale)
```

`spec/openapi.yml` 是单一来源: OpenAPI 3.1 说明 LibreTranslate API从公开的API文档和运行中实例的答案中为这个软件包写下. `orval.config.ts` 生成 `fetch`
函数(通过 `src/transport.ts`),模型类型和 zod 计谋. 永不编辑 `src/generated/` 手动: 更改规格并运行 `pnpm codegen`。 。 。 。

要跟随 API 的更改: 更新光谱, 运行 `pnpm codegen`,调整 `src/client.ts` 和工具,如果一个方法改变,并对照一个真实实例加以核对 `pnpm test:live`。 。 。 。

这个软件包是麻省理工学院的,并且保持独立:它从文档和可观察到的行为来描述API,并且从不复制代码. LibreTranslate 工程或其 MCP 服务器( AGPL-3.0) (中文(简体) ).

## 这个网站

网站是一个 Docusaurus 工作空间软件包 `website/`,英文和葡萄牙文(巴西)。

```bash
pnpm docs:dev                    # preview (append `--locale pt-BR` for the translation)
pnpm docs:build                  # build every locale into website/build/
pnpm docs:serve                  # serve the build (search only works on a build)
GIT_USER=<user> pnpm docs:deploy # build and push to the gh-pages branch
```

- 向导是简单的Markdown在 `website/docs/`中,页面的镜像页 `website/i18n/pt-BR/docusaurus-plugin-content-docs/current/`:同时改变两个.
- 那个 [API 参考](pathname://../docs/api) 生成自 `src/index.ts` 和 `src/mcp/index.ts` 由TypeDoc在每栋英式建筑。
- `llms.txt` 和 `llms-full.txt` 由每个建筑的英文指南 产生
