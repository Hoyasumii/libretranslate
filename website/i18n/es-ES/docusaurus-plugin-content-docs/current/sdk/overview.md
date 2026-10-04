---
sidebar_position: 1
title: Sinopsis
description: "El LibreTranslate cliente: sus opciones, sus métodos, y cómo se genera a partir de la especificaciones OpenAPI por orval."
---

# SDK

```ts
import { createLibreTranslateClient } from "@hoyasumii/libretranslate";

const lt = createLibreTranslateClient({
  baseUrl: "https://libretranslate.example.com",
  apiKey: process.env.LIBRETRANSLATE_API_KEY, // only for instances that issue keys
});

const { translatedText } = await lt.translate({ q: "Bom dia", source: "pt", target: "en" });
const languages = await lt.languages();
const settings = await lt.settings();
```

`baseUrl` es la URL de instancia, con su ruta base si tiene uno (`https://example.com/translate`).
`createLibreTranslateClientFromEnv()` lecturas `LIBRETRANSLATE_URL` (default) `http://localhost:5000`) y
`LIBRETRANSLATE_API_KEY`.

## Opciones

| Opción      | ¿Para qué?                                                                            |
| ----------- | ------------------------------------------------------------------------------------- |
| `baseUrl`   | La URL de instancia (requiere)                                                        |
| `apiKey`    | La clave de API, para casos que emiten claves; enviado en el cuerpo de cada solicitud |
| `timeoutMs` | Timeout per request, default 60000; `0` o `Infinity` Apágalo.                         |
| `fetch`     | Una alternativa `fetch` (pruebas, un proxy)                                           |

Cada método también toma un último `{ signal }` argumento, para cancelar la llamada con un `AbortSignal`.

## Métodos

| Método                                                      | ¿Para qué?                                                              |
| ----------------------------------------------------------- | ----------------------------------------------------------------------- |
| `translate({ q, source?, target, format?, alternatives? })` | Un texto ([Traducción](./translation.md))                               |
| `translateMany({ q: string[], … })`                         | Varios textos en una sola solicitud                                     |
| `detect(text)`                                              | Los idiomas candidatos, probablemente primero                           |
| `languages()`                                               | Cada idioma fuente, con los códigos que se traduce en                   |
| `translateFile({ file, filename?, source?, target })`       | Subir un documento ([Archivos](./files.md))                             |
| `downloadFile(url)`                                         | Descargar un archivo traducido como bytes                               |
| `suggest({ q, s, source, target })`                         | Enviar una traducción mejor (cuando el caso los acepta)                 |
| `settings()`                                                | Clave requerida, límite de caracteres, formatos de archivo, sugerencias |
| `health()`                                                  | `{ status: "ok" }` cuando el caso está levantado                        |
| `call(operationId, body?)`                                  | Cualquier operación por su `operationId`, con el cuerpo crudo           |

Una respuesta no-2x se convierte en `LibreTranslateApiError` (ver [Errores](./errors.md)).

## Cómo se genera

El paquete mantiene su propio OpenAPI 3.1 descripción de la API en `spec/openapi.yml`, escrito de la documentación de
API pública. [orval](https://orval.dev) lo convierte en:

- `src/generated/endpoints.ts`: una función por operación, todo el envío a través del paquete `fetch` envoltorio, que
  añade la URL base, el tiempo y el manejo de errores;
- `src/generated/model/`: los tipos de solicitud y respuesta (`TranslateRequest`, `Detection`, `FrontendSettings`, ...),
  exportado del paquete;
- `src/generated/zod.ts`: zod esquemas de cada solicitud, que las herramientas MCP utilizan como sus insumos.

El cliente arriba envuelve esas funciones con defectos (`source: "auto"`) y la clave de API. Para cada tipo exportado y
función, vea el [Referencia de API](pathname://../../docs/api).
