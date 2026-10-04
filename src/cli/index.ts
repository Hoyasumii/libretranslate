#!/usr/bin/env node
/**
 * `libretranslate`: the LibreTranslate MCP server's tools as terminal commands.
 *
 *   libretranslate translate --q "Olá, mundo" --target en
 *   libretranslate --url http://127.0.0.1:3768/mcp languages
 */
import { runCli } from "./run";

runCli(process.argv.slice(2), {
  // oxlint-disable-next-line no-console -- a CLI's output is the console
  stdout: (text) => console.log(text),
  // oxlint-disable-next-line no-console
  stderr: (text) => console.error(text),
  env: process.env,
}).then((code) => {
  process.exitCode = code;
});
