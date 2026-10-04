---
sidebar_position: 100
title: Contribución
description: "Configura el repositorio, ejecuta los cheques y las pruebas, sigue los cambios de API y construye este sitio de documentación."
---

# Contribución

El repositorio es [Hoyasumii/libretranslate](https://github.com/Hoyasumii/libretranslate), manejado con pnpm (G)Node.js
20 o más tarde).

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

Cada script es multiplataforma: no `rm`, `$VAR` o `VAR=1 cmd`. `.gitattributes` mantiene LF, con `.cmd`/`.vbs` en CRLF.

Los cheques funcionan localmente a través de ganchos de git. `pre-commit` carreras `check:lint` y `check:format`,
`commit-msg` ejecuta compromiso con el config convencional (`feat: …`, `fix(mcp): …`), y `pre-push` carreras
`check:types`, `check:knip` y `test:unit`.

Cada empujón `main` ejecuta el flujo de trabajo de entrega continua (`.github/workflows/cd.yml`). Corre los mismos
cheques y la construcción, entonces:

- publica `package.json`'s versión a npm cuando esa versión aún no está en el registro (a través de Trusted Publishing,
  con procedencia), lo etiqueta `v<version>` y abre una GitHub liberación;
- construye el sitio y lo implementa al `gh-pages` rama cuando el empuje toca `website/` o `src/` (una ejecución manual
  del flujo de trabajo siempre lo despliega).

Para soltar, golpe `version` dentro `package.json` y fusionarse `main`.

## Código generado

```bash
pnpm codegen          # spec/openapi.yml → src/generated/ (orval) and src/mcp/generated/catalog.json
pnpm codegen:mcp      # only the MCP catalog (a unit test fails when it is stale)
```

`spec/openapi.yml` es la única fuente: un OpenAPI 3.1 descripción de la LibreTranslate API escrita para este paquete de
la documentación de la API pública y las respuestas de una instancia de ejecución. `orval.config.ts` genera el `fetch`
funciones (mediante `src/transport.ts`), los tipos de modelo y los zod esquemas. Nunca editar `src/generated/` a mano:
cambiar la especificaciones y correr `pnpm codegen`.

Para seguir un cambio en la API: actualizar la especificaciones, ejecutar `pnpm codegen`, ajuste `src/client.ts` y las
herramientas si un método cambia, y comprobarlo contra una instancia real con `pnpm test:live`.

Este paquete es MIT y se mantiene independiente: describe la API de su documentación y comportamiento observable, y
nunca copia código del LibreTranslate proyecto o su servidor MCP (tanto AGPL-3.0).

## Este sitio

El sitio es un Docusaurus paquete de espacio de trabajo en `website/`, en inglés y portugués (Brasil).

```bash
pnpm docs:dev                    # preview (append `--locale pt-BR` for the translation)
pnpm docs:build                  # build every locale into website/build/
pnpm docs:serve                  # serve the build (search only works on a build)
GIT_USER=<user> pnpm docs:deploy # build and push to the gh-pages branch
```

- Los guías son simples Markdown en `website/docs/`, página espejo para página en
  `website/i18n/pt-BR/docusaurus-plugin-content-docs/current/`- cambiar ambos juntos.
- El [Referencia de API](pathname://../docs/api) se genera desde `src/index.ts` y `src/mcp/index.ts` por TypeDoc en cada
  compilación inglesa.
- `llms.txt` y `llms-full.txt` se generan en la raíz del sitio de las guías inglesas en cada construcción.
