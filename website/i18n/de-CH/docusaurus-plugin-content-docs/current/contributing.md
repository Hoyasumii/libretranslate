---
sidebar_position: 100
title: Beitrag
description: "Richten Sie das Repository ein, führen Sie die Prüfungen und Tests aus, folgen Sie den API-Änderungen und erstellen Sie diese Dokumentationsseite."
---

# Beitrag

Das Repository ist [Hoyasumii/libretranslat](https://github.com/Hoyasumii/libretranslate), verwaltet mit pnpm ()Node.js
20 oder später.

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

Jedes Skript ist plattformübergreifend: nein `rm`, `$VAR` oder `VAR=1 cmd`. `.gitattributes` hält LF, mit `.cmd`/`.vbs`
in CRLF.

Die Kontrollen laufen lokal über Git-Hooks. `pre-commit` Läufe `check:lint` und `check:format`, `commit-msg` läuft
commitlint mit der konventionellen config ()`feat: …`, `fix(mcp): …`, und `pre-push` Läufe `check:types`, `check:knip`
und `test:unit`.

Jeder Push auf `main` führt den Continuous Delivery Workflow aus ()`.github/workflows/cd.yml`. Es läuft die gleichen
Prüfungen und der Build, dann:

- veröffentlicht `package.json`Version von npm wenn diese Version noch nicht in der Registry ist (über Trusted
  Publishing, mit Provenienz), taggt sie `v<version>` und öffnet eine GitHub Freigabe;
- Erstellt die Website und setzt sie auf die `gh-pages` Verzweigung, wenn der Push berührt `website/` oder `src/` (Ein
  manueller Ablauf des Workflows stellt ihn immer bereit).

Lösen, Beule `version` in `package.json` und verschmelzen mit `main`.

## Generierter Code

```bash
pnpm codegen          # spec/openapi.yml → src/generated/ (orval) and src/mcp/generated/catalog.json
pnpm codegen:mcp      # only the MCP catalog (a unit test fails when it is stale)
```

`spec/openapi.yml` ist die Single Source: ein OpenAPI 3.1 Beschreibung der LibreTranslate API, die für dieses Paket aus
der öffentlichen API-Dokumentation und den Antworten einer laufenden Instanz geschrieben wurde. `orval.config.ts`
erzeugt die `fetch` Funktionen (durch) `src/transport.ts`), die Modelltypen und die zod Schemata. Niemals bearbeiten
`src/generated/` von Hand: Ändern Sie die Spec und laufen `pnpm codegen`.

Um einer Änderung in der API zu folgen: Aktualisieren Sie die Spezifikation, führen Sie `pnpm codegen`, justieren
`src/client.ts` und die Werkzeuge, wenn sich eine Methode ändert, und überprüfen Sie sie mit einer realen Instanz mit
`pnpm test:live`.

Dieses Paket ist MIT und bleibt unabhängig: Es beschreibt die API aus ihrer Dokumentation und ihrem beobachtbaren
Verhalten und kopiert niemals Code aus dem LibreTranslate Projekt oder dessen MCP-Server (beide AGPL-)3.0.

## Diese Website

Die Website ist eine Docusaurus Workspace Paket in `website/`, in englischer und portugiesischer Sprache (Brasilien).

```bash
pnpm docs:dev                    # preview (append `--locale pt-BR` for the translation)
pnpm docs:build                  # build every locale into website/build/
pnpm docs:serve                  # serve the build (search only works on a build)
GIT_USER=<user> pnpm docs:deploy # build and push to the gh-pages branch
```

- Die Guides sind schlicht Markdown in `website/docs/`Seite für Seite in
  `website/i18n/pt-BR/docusaurus-plugin-content-docs/current/`Ändern Sie beide zusammen.
- Die [API-Referenz](pathname://../docs/api) erzeugt wird aus `src/index.ts` und `src/mcp/index.ts` von TypeDoc auf
  jedem englischen Build.
- `llms.txt` und `llms-full.txt` werden an der Wurzel der Website von den englischen Guides bei jedem Build generiert.
