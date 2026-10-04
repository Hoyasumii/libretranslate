---
sidebar_position: 1
title: Aperçu général de la CLI
description: "La commande libretranslate : chaque outil MCP en tant que sous-commande, avec le schéma d'entrée de l'outil comme drapeau."
---

# CLI

Le paquet installe un `libretranslate` commande. Il s'agit d'un client MCP du [même serveur](../mcp/overview.md): chaque
outil MCP devient une sous-commande, et le schéma d'entrée de l'outil devient ses drapeaux. Par défaut, le serveur
fonctionne dans la commande, il n'y a donc rien à commencer.

```bash
npx libretranslate mcp config                          # once: the instance URL and, if it issues keys, an API key
npx libretranslate tools                               # every command, one per MCP tool
npx libretranslate status
npx libretranslate translate --q "Olá, mundo!" --target en
npx libretranslate translate --q '["Bom dia","Boa noite"]' --source pt --target es
npx libretranslate translate --q "<b>Olá</b>" --target en --format html --alternatives 2
npx libretranslate translate-file --path report.docx --target pt
npx libretranslate detect --q "Bonjour tout le monde"
npx libretranslate languages --source pt
npx libretranslate call --operation getFrontendSettings
```

Rien que `--help`, `--version`, `libretranslate docs`, `libretranslate mcp config` et `libretranslate mcp uninstall`
exécute jusqu'à ce qu'une configuration avec une URL soit enregistrée. `libretranslate docs` imprime le lien vers ce
site et l'ouvre dans le navigateur.

## Des outils aux commandes

- La commande est le nom de l'outil sans `libretranslate_`, en kébab: `libretranslate_translate_file` →
  `translate-file`.
- Chaque drapeau est une entrée en kebab-case.
- Prise de drapeaux d'array `a,b` ou JSON, les drapeaux d'objet prennent JSON, et les drapeaux booléens n'ont pas besoin
  de valeur.
- `libretranslate <command> --help` liste les drapeaux d'une commande, avec les valeurs autorisées des entrées enum.

La sortie de l'outil va à stdout. Une erreur d'outil va à stderr avec le code de sortie 1.

## Paramètres uniques et serveur en cours d'exécution

`--base-url` et `--api-key` remplacer l'environnement et le fichier sauvegardé pour une seule exécution du serveur en
cours de traitement. Pour utiliser un `libretranslate-mcp` qui est déjà en cours d'exécution sur HTTP à la place, passez
`--url http://127.0.0.1:3768/mcp` ou ensemble `LIBRETRANSLATE_MCP_URL`. Ces drapeaux fonctionnent n'importe où sur la
ligne de commande.

Aucun d'entre eux ne correspond à la configuration enregistrée : le CLI refuse d'exécuter des outils sans elle, même
lorsque `--url` ou `--base-url` est donné.

## Une instance locale

Avec Docker installé, `libretranslate service up` pistes LibreTranslate dans un conteneur et pointe le CLI à lui. Voir
[`libretranslate service`](./service.md).

## Gestion du serveur

`libretranslate mcp` est intercepté avant toute connexion. Il configure le serveur, l'exécute en arrière-plan, le
démarre à la connexion et l'enregistre dans vos clients MCP. Voir [`libretranslate mcp`](./mcp-commands.md).
