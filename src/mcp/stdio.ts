import { Readable, Writable } from "node:stream";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { buildLibreTranslateMcpServer } from "./build";
import { type LibreTranslateConnection, clientFor } from "./config";
import { validateConnection } from "./server";

export interface LibreTranslateMcpStdioOptions extends LibreTranslateConnection {
  /** Where requests arrive. Default: `process.stdin`. */
  stdin?: Readable;
  /** Where responses go. Default: `process.stdout` — so nothing else may write to it. */
  stdout?: Writable;
}

export interface RunningLibreTranslateMcpStdio {
  /** Settles once the connection is over: the client closed stdin, or {@link close} was called. */
  closed: Promise<void>;
  /** Stop reading stdin and close the server. */
  close(): Promise<void>;
}

/**
 * Serve the LibreTranslate MCP server over stdio: newline-delimited JSON-RPC on stdin/stdout, the way an
 * MCP client runs a server it launched itself.
 *
 * stdout carries the protocol; log to stderr only. Resolves once connected; `closed` settles when
 * the client closes stdin.
 *
 * ```ts
 * import { serveLibreTranslateMcpStdio } from "@hoyasumii/libretranslate/mcp";
 * const mcp = await serveLibreTranslateMcpStdio({ baseUrl: "http://localhost:5000" });
 * await mcp.closed;
 * ```
 */
export async function serveLibreTranslateMcpStdio(
  options: LibreTranslateMcpStdioOptions
): Promise<RunningLibreTranslateMcpStdio> {
  validateConnection(options);
  const server = buildLibreTranslateMcpServer(clientFor(options));
  const stdin = options.stdin ?? process.stdin;
  const transport = new StdioServerTransport(stdin, options.stdout ?? process.stdout);

  let settle: () => void = () => undefined;
  const closed = new Promise<void>((resolve) => {
    settle = resolve;
  });
  const onEnd = (): void => {
    void server.close();
  };
  server.server.onclose = () => {
    stdin.off("end", onEnd);
    settle();
  };
  stdin.once("end", onEnd);
  await server.connect(transport);

  return {
    closed,
    close: async () => {
      await server.close();
      await closed;
    },
  };
}
