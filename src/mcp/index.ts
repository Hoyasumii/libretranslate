/**
 * `@hoyasumii/libretranslate/mcp` — an MCP server over this SDK.
 *
 * `serveLibreTranslateMcpStdio({ baseUrl, apiKey })` serves it over stdio;
 * `startLibreTranslateMcpServer({ port, baseUrl, apiKey })` serves it over HTTP;
 * `buildLibreTranslateMcpServer(client)` gives the bare `McpServer` for any other transport.
 */
export { serveLibreTranslateMcpStdio } from "./stdio";
export type { LibreTranslateMcpStdioOptions, RunningLibreTranslateMcpStdio } from "./stdio";
export { startLibreTranslateMcpServer } from "./server";
export type { LibreTranslateMcpServerOptions, RunningLibreTranslateMcpServer } from "./server";
export { buildLibreTranslateMcpServer, SERVER_NAME, SERVER_VERSION } from "./build";
export {
  CONFIG_KEYS,
  clientFor,
  configDir,
  configFilePath,
  readEnvFile,
  resolveMcpConfig,
  writeEnvFile,
} from "./config";
export type { ConfigKey, ConfigValues, McpConfig, McpConfigFlags, LibreTranslateConnection } from "./config";
export { CATALOG, describeOperation, searchCatalog, ToolInputError } from "./catalog";
export type { Catalog, CatalogOperation, OperationKind } from "./catalog-types";
export { invoke, MAX_RESULT_CHARS } from "./invoke";
export type { InvokeOptions } from "./invoke";
