---
sidebar_position: 3
title: Herramientas
description: "Las herramientas de MCP curadas: traducir textos y archivos, detectar idiomas, enumerarlos, el estado de instancia y sugerencias."
---

# Herramientas

Sus aportaciones son las zod schemas orval genera de la especificaciones, por lo que el agente ve los mismos campos,
enums y defectos que el SDK.

## `libretranslate_translate`

Traduce un texto, o una lista en una llamada.

| Input          | ¿Para qué?                                                 |
| -------------- | ---------------------------------------------------------- |
| `q`            | El texto o una lista de textos                             |
| `target`       | El código de idioma objetivo                               |
| `source`       | El código fuente de idioma; `auto` (el defecto) lo detecta |
| `format`       | `text` (por defecto) o `html`, que mantiene la marca       |
| `alternatives` | Cuantas otras traducciones añadir (por defecto 0)          |

Responde a la forma propia de la API: `translatedText`, más `detectedLanguage` con `auto` y `alternatives` cuando se le
preguntó.

## `libretranslate_translate_file`

Traduce un documento local y ahorra el resultado.

| Input       | ¿Para qué?                                                                       |
| ----------- | -------------------------------------------------------------------------------- |
| `path`      | El archivo a traducir                                                            |
| `target`    | El código de idioma objetivo                                                     |
| `source`    | El código fuente del idioma, `auto` por defecto                                  |
| `output`    | Dónde guardar la traducción (por defecto: al lado del original)                  |
| `overwrite` | Reemplazar un archivo existente (por defecto falso: uno existente nunca se toca) |

`report.docx` traducido al `pt` se convierte en `report.pt.docx`. Responde `{ savedTo, bytes, translatedFileUrl }`. El
servidor lee y escribe archivos en la máquina en la que se ejecuta, con los permisos de su usuario.

## `libretranslate_detect`

Los idiomas candidatos `q`, probablemente primero, cada uno con una confianza de 0 a 100.

## `libretranslate_languages`

Sin entrada, los códigos y nombres de cada idioma. Cuando cada idioma se traduce en cada otro (el caso habitual), los
objetivos se enumeran una vez en lugar de una vez por idioma. Con `source`, los idiomas a los que se traduce.

## `libretranslate_status`

La salud y la configuración de la instancia en una respuesta: si se requiere una clave de API y si se configura, el
límite de caracteres por solicitud, si la traducción de archivos y sugerencias están habilitadas, y los formatos de
archivo aceptados. Una buena primera llamada para un agente.

## `libretranslate_suggest`

Envia una traducción corregida (`s`) de un texto (`q`Volver al caso, que lo mantiene. Se le dice al agente que lo use
sólo cuando se lo pida, y falla en casos con sugerencias deshabilitadas.

## Errores en los que el agente puede actuar

Un error de herramienta es texto que dice qué hacer: una instancia que requiere una respuesta clave con un indicio para
guardar uno con `libretranslate mcp config`, 403 puntos en la tecla configurada, un 429 dice esperar. La llave nunca
aparece.
