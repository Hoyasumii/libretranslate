---
sidebar_position: 100
title: Contributing
description: "Set up the repository, run the checks and the tests, follow API changes, and build this documentation site."
---

# Contributing

The repository is [Hoyasumii/libretranslate](https://github.com/Hoyasumii/libretranslate), managed with pnpm (Node.js 20 or later).

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

Every script is cross-platform: no `rm`, `$VAR` or `VAR=1 cmd`. `.gitattributes` keeps LF, with `.cmd`/`.vbs` in
CRLF.

There is no CI: the checks run locally through git hooks. `pre-commit` runs `check:lint` and `check:format`,
`commit-msg` runs commitlint with the conventional config (`feat: …`, `fix(mcp): …`), and `pre-push` runs
`check:types`, `check:knip` and `test:unit`.

After a push of `main` to `origin` that touches `website/` or `src/`, `pre-push` also starts
`scripts/deploy-site.mjs` in the background. It waits for the push to land, checks the pushed commit out in a
worktree of its own and runs `pnpm docs:deploy` there, so the site follows `main` without holding up the push. Its
log is `site-deploy/deploy.log` under the git directory; `LIBRETRANSLATE_SKIP_SITE_DEPLOY=1` skips it for one push.

## Generated code

```bash
pnpm codegen          # spec/openapi.yml → src/generated/ (orval) and src/mcp/generated/catalog.json
pnpm codegen:mcp      # only the MCP catalog (a unit test fails when it is stale)
```

`spec/openapi.yml` is the single source: an OpenAPI 3.1 description of the LibreTranslate API written for this
package from the public API documentation and the answers of a running instance. `orval.config.ts` generates the
`fetch` functions (through `src/transport.ts`), the model types and the zod schemas. Never edit `src/generated/` by
hand: change the spec and run `pnpm codegen`.

To follow a change in the API: update the spec, run `pnpm codegen`, adjust `src/client.ts` and the tools if a method
changes, and check it against a real instance with `pnpm test:live`.

This package is MIT and stays independent: it describes the API from its documentation and observable behavior,
and never copies code from the LibreTranslate project or its MCP server (both AGPL-3.0).

## This site

The site is a Docusaurus workspace package in `website/`, in English and Portuguese (Brazil).

```bash
pnpm docs:dev                    # preview (append `--locale pt-BR` for the translation)
pnpm docs:build                  # build every locale into website/build/
pnpm docs:serve                  # serve the build (search only works on a build)
GIT_USER=<user> pnpm docs:deploy # build and push to the gh-pages branch
```

- The guides are plain Markdown in `website/docs/`, mirrored page for page in
  `website/i18n/pt-BR/docusaurus-plugin-content-docs/current/`: change both together.
- The [API reference](pathname://../docs/api) is generated from `src/index.ts` and `src/mcp/index.ts` by TypeDoc
  on every English build.
- `llms.txt` and `llms-full.txt` are generated at the site's root from the English guides on every build.
