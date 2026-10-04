---
sidebar_position: 4
title: Herramientas genéricas
description: "libretranslate_resources, libretranslate_describe y libretranslate_call: el crudo LibreTranslate API, operación por operación."
---

# Herramientas genéricas

Las herramientas curadas cubren lo que un agente generalmente necesita. Tres más llegan a la API cruda, operación por
operación, como la especificación lo describe:

1. **`libretranslate_resources`** enumera las operaciones (`translate`, `detect`, `listLanguages`,
   `getFrontendSettings`, `suggest`, `health`). Con un `query`Sólo los que coinciden.
2. **`libretranslate_describe`** da un método de operación, camino, esquema corporal y un ejemplo `libretranslate_call`
   entrada. Con `schema`, expande un esquema de la especificaciones (`depth` niveles profundos, por defecto 3).
3. **`libretranslate_call`** lo ejecuta: `operation` es `operationId` (G)`listLanguages`) o `METHOD /path`
   (G)`GET /languages`), y `body` es el cuerpo de solicitud JSON.

```json
{ "operation": "translate", "body": { "q": "Olá", "source": "pt", "target": "en", "alternatives": 2 } }
```

## Seguridad

- Los campos corporales desconocidos son rechazados, por lo que un tipo no deja caer silenciosamente un entorno.
- `api_key` se rechaza: el servidor envía la clave configurada en sí mismo, y los esquemas lo dejan fuera.
- Operaciones que escriben al caso (`suggest`) necesita `confirm: true`Se le dice al agente que le pregunte primero.
- La carga de archivos se deja fuera del catálogo: `libretranslate_translate_file` lo cubre de un camino local.
- Una respuesta larga es cortada a 60.000 caracteres, diciendo eso.

El catálogo se genera a partir de la misma especta de OpenAPI que el SDK`pnpm codegen:mcp`).
