# Contributing

Thanks for helping. The full guide — building from source, the tests, following API changes, and the
docs site — is at <https://hoyasumii.github.io/libretranslate/docs/contributing>. The short version:

- You need Node.js 20 or later and pnpm. Run `pnpm install` first: it also installs the git hooks. There is no CI,
  so the hooks are the only checks a change goes through. `pre-commit` runs `check:lint` and
  `check:format`, and `pre-push` runs `check:types`, `check:knip` and `test:unit`, then
  publishes the docs site in the background after a push of `main` to `origin` that touches `website/` or `src/`
  (`LIBRETRANSLATE_SKIP_SITE_DEPLOY=1` skips that).
- Commit messages follow Conventional Commits (`feat: …`, `fix(mcp): …`), enforced by commitlint.
- Every script must run on Windows too: no `rm`, `$VAR` or `VAR=1 cmd`.
- `src/generated/` (orval) and `src/mcp/generated/catalog.json` come from `spec/openapi.yml` through `pnpm codegen`:
  never edit them by hand.
- Never copy code from the LibreTranslate project or its MCP server (AGPL-3.0). This package is MIT and describes the
  API only from its public documentation and observable behavior.
- A docs change goes in both languages: `website/docs/` and its mirror under
  `website/i18n/pt-BR/docusaurus-plugin-content-docs/current/`.
- Never log a credential; tool errors go through `describeError` (`src/mcp/errors.ts`).

Report security problems privately, as [SECURITY.md](SECURITY.md) describes, and not in a public issue.
Everyone taking part is expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
