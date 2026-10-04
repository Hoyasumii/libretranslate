#!/usr/bin/env node
/**
 * `libretranslate-mcp`: run the MCP server in the foreground — over stdio by default, the way an MCP
 * client launches it, or over Streamable HTTP with `--http`.
 *
 *   libretranslate-mcp                                  # stdio: the client spawns this and talks on stdin/stdout
 *   PORT=3768 libretranslate-mcp --http                 # http://127.0.0.1:3768/mcp
 *
 * Anything the environment leaves out comes from the saved configuration
 * (`libretranslate mcp config`), then the defaults.
 */
import { configFilePath, readEnvFile, resolveMcpConfig } from "./config";
import { startLibreTranslateMcpServer } from "./server";
import { serveLibreTranslateMcpStdio } from "./stdio";

export type LibreTranslateMcpMode = "stdio" | "http" | "help";

const USAGE = `Usage: libretranslate-mcp [--stdio | --http] [--help]

Run the LibreTranslate MCP server in the foreground.

  --stdio   Speak MCP on stdin/stdout, for a client that launches the server (default).
  --http    Serve Streamable HTTP at http://127.0.0.1:<PORT>/mcp (PORT defaults to 3768).
  --help    Show this help.

Settings come from the environment (LIBRETRANSLATE_URL, LIBRETRANSLATE_API_KEY, PORT), then the
configuration saved by \`libretranslate mcp config\` (LIBRETRANSLATE_CONFIG points at another file), then
the defaults (http://localhost:5000, no API key, port 3768).
`;

/** The transport the arguments ask for. `--help` wins over everything else. */
export function parseLibreTranslateMcpArgs(argv: readonly string[]): { mode: LibreTranslateMcpMode } {
  const known = new Set(["--stdio", "--http", "--help", "-h"]);
  for (const arg of argv) {
    if (!known.has(arg)) throw new TypeError(`Unknown argument '${arg}'.\n\n${USAGE}`);
  }
  if (argv.includes("--help") || argv.includes("-h")) return { mode: "help" };
  if (argv.includes("--stdio") && argv.includes("--http")) {
    throw new TypeError(`Choose either --stdio or --http, not both.\n\n${USAGE}`);
  }
  return { mode: argv.includes("--http") ? "http" : "stdio" };
}

async function main(): Promise<void> {
  const { mode } = parseLibreTranslateMcpArgs(process.argv.slice(2));
  if (mode === "help") {
    process.stdout.write(USAGE);
    return;
  }
  const configFile = configFilePath(process.env);
  const config = resolveMcpConfig({ env: process.env, file: readEnvFile(configFile) });
  const connection = config;

  if (mode === "stdio") {
    const server = await serveLibreTranslateMcpStdio(connection);
    // stdout is the protocol channel: everything else goes to stderr.
    // oxlint-disable-next-line no-console
    console.error("LibreTranslate MCP server running on stdio");
    await server.closed;
    process.exit(0);
  }

  const server = await startLibreTranslateMcpServer(connection);
  // oxlint-disable-next-line no-console -- stderr is the only channel a CLI has
  console.error(`LibreTranslate MCP server listening on ${server.url}`);
  const stop = (): void => {
    void server.close().then(() => process.exit(0));
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}

if (require.main === module) {
  main().catch((error: unknown) => {
    // oxlint-disable-next-line no-console
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
