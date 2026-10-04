---
sidebar_position: 4
title: Errores
description: "LibreTranslateApiError y las otras clases de errores, los estados que una instancia responde, y cómo se enmascara la clave de API."
---

# Errores

| Clase                        | Cuando                                                |
| ---------------------------- | ----------------------------------------------------- |
| `LibreTranslateApiError`     | A non-2xx                                             |
| `LibreTranslateConfigError`  | Configuración inválida: una URL faltante o malformada |
| `LibreTranslateTimeoutError` | No hay respuesta dentro `timeoutMs`                   |

`LibreTranslateApiError` transporte `status`, `method`, `path` (sin la cadena de consulta) y la respuesta `body`.
LibreTranslate respuestas errores como `{ "error": "<message>" }`Y ese mensaje es el error.

| Situación | Por lo general                                                                      |
| --------- | ----------------------------------------------------------------------------------- |
| 400       | Un parámetro faltante o inválido, un archivo no soportado, o una clave es necesaria |
| 403       | La clave de API es inválida, o el cliente está prohibido                            |
| 429       | Demasiadas solicitudes: espera y reingresa                                          |
| 500       | La traducción falló en el caso                                                      |

```ts
import { LibreTranslateApiError } from "@hoyasumii/libretranslate";

try {
  await lt.translate({ q: "Olá", target: "en" });
} catch (error) {
  if (error instanceof LibreTranslateApiError && error.status === 429) {
    // back off and retry
  } else throw error;
}
```

## La clave de API nunca muestra

Cada mensaje de error y `body` pasar `redact`: los valores de las teclas tales como `api_key` se convirtió en `***`, y
también cualquier ocurrencia literal de la propia llave del cliente, dentro de las cuerdas también. `redact` se exporta
para sus propios registros:

```ts
import { redact } from "@hoyasumii/libretranslate";

console.log(redact(payload, [process.env.LIBRETRANSLATE_API_KEY!]));
```
