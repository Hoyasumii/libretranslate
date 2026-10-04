import * as fs from "node:fs";
import * as path from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { LibreTranslateClient } from "../client";
import { CATALOG } from "./catalog";
import { registerGenericTools } from "./tools/generic";
import { registerTranslateTools } from "./tools/translate";

export const SERVER_NAME = "libretranslate";
/** The package's own version, read at runtime: `src/mcp/` and `dist/mcp/` both sit two levels below `package.json`. */
const PACKAGE_JSON = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "package.json"), "utf8")) as {
  version: string;
  homepage: string;
};
export const SERVER_VERSION = PACKAGE_JSON.version;
/** The documentation site, the package's `homepage`. */
export const DOCS_URL = PACKAGE_JSON.homepage;

/**
 * An MCP server exposing a LibreTranslate instance, with no transport attached.
 *
 * Curated tools translate text and files, detect languages, list them, send suggestions and report
 * the instance's status; `libretranslate_resources` / `libretranslate_describe` / `libretranslate_call`
 * reach the raw API. Connect it to any transport — {@link startLibreTranslateMcpServer} serves it over
 * HTTP, {@link serveLibreTranslateMcpStdio} over stdio.
 */
export function buildLibreTranslateMcpServer(client: LibreTranslateClient): McpServer {
  const server = new McpServer(
    { name: SERVER_NAME, version: SERVER_VERSION },
    {
      instructions:
        `Machine translation through LibreTranslate (${client.baseUrl}). Translate with libretranslate_translate ` +
        "(one text or a list; source 'auto' detects the language), documents with libretranslate_translate_file, " +
        "detect a language with libretranslate_detect. Language codes come from libretranslate_languages; the " +
        "character limit, file formats and whether a key is needed from libretranslate_status. For anything else " +
        `(${CATALOG.operations.length} operations), use libretranslate_resources, libretranslate_describe and ` +
        "libretranslate_call. Send a suggestion (libretranslate_suggest) only when the user asks for it.",
    }
  );
  const context = { client };
  registerTranslateTools(server, context);
  registerGenericTools(server, context);
  return server;
}
