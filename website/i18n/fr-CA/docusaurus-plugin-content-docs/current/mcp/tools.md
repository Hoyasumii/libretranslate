---
sidebar_position: 3
title: Outils
description: "Les outils de MCP curated : traduction de textes et de fichiers, détection des langues, liste de celles-ci, état de l'instance et suggestions."
---

# Outils

Leurs contributions sont les suivantes: zod schémas orval génère à partir de la spécification, de sorte que l'agent voit
les mêmes champs, enums et par défaut que le SDK.

## `libretranslate_translate`

Traduit un texte, ou une liste en un appel.

| Entrée         | Pourquoi                                                 |
| -------------- | -------------------------------------------------------- |
| `q`            | Le texte ou une liste de textes                          |
| `target`       | Le code de langue cible                                  |
| `source`       | le code de langue source; `auto` (par défaut) le détecte |
| `format`       | `text` (par défaut) ou `html`, qui maintient le balisage |
| `alternatives` | Combien d'autres traductions ajouter (par défaut 0)      |

Il répond à la forme propre de l'API: `translatedText`Plus `detectedLanguage` avec `auto` et `alternatives` sur demande.

## `libretranslate_translate_file`

Traduit un document local et enregistre le résultat.

| Entrée      | Pourquoi                                                                                  |
| ----------- | ----------------------------------------------------------------------------------------- |
| `path`      | Le fichier à traduire                                                                     |
| `target`    | Le code de langue cible                                                                   |
| `source`    | Le code de langue source, `auto` par défaut                                               |
| `output`    | Où enregistrer la traduction (par défaut: à côté de l'original)                           |
| `overwrite` | Remplacer un fichier existant (par défaut false: un fichier existant n'est jamais touché) |

`report.docx` traduit en `pt` devient `report.pt.docx`. Il répond `{ savedTo, bytes, translatedFileUrl }`. Le serveur
lit et écrit des fichiers sur la machine sur laquelle il fonctionne, avec les permissions de votre utilisateur.

## `libretranslate_detect`

Les langues `q`, probablement d'abord, chacun avec une confiance de 0 à 100.

## `libretranslate_languages`

Sans entrée, les codes et noms de chaque langue. Lorsque chaque langue se traduit dans les autres (le cas habituel), les
cibles sont listées une fois au lieu d'une fois par langue. Avec `source`, les langues dans lesquelles on traduit.

## `libretranslate_status`

La santé et les paramètres de l'instance dans une seule réponse : si une clé API est nécessaire et si une est
configurée, la limite de caractères par requête, si la traduction de fichier et les suggestions sont activées, et les
formats de fichier acceptés. Un bon premier appel pour un agent.

## `libretranslate_suggest`

Envoie une traduction corrigée (`s`) d'un texte (`q`) retour à l'instance, qui la garde. On dit à l'agent de ne
l'utiliser que lorsque vous demandez, et il échoue dans les cas où les suggestions sont désactivées.

## Erreurs sur lesquelles l'agent peut agir

Une erreur d'outil est un texte qui dit quoi faire : une instance qui nécessite des réponses clés avec un indice pour en
enregistrer une avec `libretranslate mcp config`, un 403 points à la clé configurée, un 429 dit attendre. La clé
elle-même n'apparaît jamais.
