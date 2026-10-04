---
sidebar_position: 100
title: Contribution
description: "Configurez le dépôt, exécutez les vérifications et les tests, suivez les modifications de l'API et construisez ce site de documentation."
---

# Contribution

Le dépôt est [Hoyasumii/librétranslate](https://github.com/Hoyasumii/libretranslate), géré avec pnpm (Node.js 20 ou
plus).

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

Chaque script est multiplateforme : non `rm`, `$VAR` ou `VAR=1 cmd`. `.gitattributes` garde LF, avec `.cmd`/`.vbs` en
CRLF.

Les chèques passent localement par les crochets git. `pre-commit` pistes `check:lint` et `check:format`, `commit-msg`
exécute commitlint avec la configuration conventionnelle (`feat: …`, `fix(mcp): …`), et `pre-push` pistes `check:types`,
`check:knip` et `test:unit`.

Chaque poussée vers `main` exécute le workflow de livraison continue (`.github/workflows/cd.yml`) . Il exécute les mêmes
vérifications et la construction, puis:

- publie `package.json`version à npm lorsque cette version n'est pas encore dans le registre (par Trusted Publishing,
  avec provenance), l'étiquette `v<version>` et ouvre une GitHub libération;
- construit le site et le déploie `gh-pages` branche quand la poussée touche `website/` ou `src/` (une opération
  manuelle du workflow le déploie toujours).

Pour libérer, bosse `version` en `package.json` et fusionner à `main`.

## Code produit

```bash
pnpm codegen          # spec/openapi.yml → src/generated/ (orval) and src/mcp/generated/catalog.json
pnpm codegen:mcp      # only the MCP catalog (a unit test fails when it is stale)
```

`spec/openapi.yml` est la source unique: un OpenAPI 3.1 description des LibreTranslate API écrite pour ce paquet à
partir de la documentation publique API et les réponses d'une instance en cours d'exécution. `orval.config.ts` génère la
`fetch` fonctions (par `src/transport.ts`), les types de modèles et zod Les schémas. Ne jamais modifier `src/generated/`
à la main: changer les spécifications et courir `pnpm codegen`.

Pour suivre un changement dans l'API : mettre à jour les spécifications, lancer `pnpm codegen`, ajuster `src/client.ts`
et les outils si une méthode change, et le vérifier contre une instance réelle avec `pnpm test:live`.

Ce paquet est MIT et reste indépendant: il décrit l'API à partir de sa documentation et son comportement observable, et
ne copie jamais le code de la LibreTranslate projet ou son serveur MCP (les deux AGPL-3.0) .

## Ce site

Le site est un Docusaurus paquet espace de travail dans `website/`, en anglais et portugais (Brésil).

```bash
pnpm docs:dev                    # preview (append `--locale pt-BR` for the translation)
pnpm docs:build                  # build every locale into website/build/
pnpm docs:serve                  # serve the build (search only works on a build)
GIT_USER=<user> pnpm docs:deploy # build and push to the gh-pages branch
```

- Les guides sont simples Markdown in `website/docs/`, page miroir pour la page dans
  `website/i18n/pt-BR/docusaurus-plugin-content-docs/current/`: changer les deux ensemble.
- Les [Référence API](pathname://../docs/api) est généré à partir de `src/index.ts` et `src/mcp/index.ts` par TypeDoc
  sur chaque construction anglaise.
- `llms.txt` et `llms-full.txt` sont générés à la racine du site à partir des guides anglais sur chaque construction.
