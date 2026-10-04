import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { SERVER_VERSION, buildLibreTranslateMcpServer } from "../mcp/build";
import { DEFAULT_URL, clientFor } from "../mcp/config";

export interface ConnectOptions {
  /** A running `libretranslate-mcp` endpoint, e.g. `http://127.0.0.1:3768/mcp`. Without it the server runs in-process. */
  url?: string;
  /** The LibreTranslate instance for the in-process server (default `http://localhost:5000`). */
  baseUrl?: string;
  /** The API key for the in-process server, for instances that issue keys. */
  apiKey?: string;
}

export interface LibreTranslateMcpConnection {
  client: Client;
  close(): Promise<void>;
}

/**
 * An MCP client connected to the LibreTranslate MCP server: over Streamable HTTP when `url` is given,
 * otherwise to {@link buildLibreTranslateMcpServer} in this process through an in-memory pair.
 */
export async function connectLibreTranslateMcp(options: ConnectOptions): Promise<LibreTranslateMcpConnection> {
  const client = new Client({ name: "libretranslate-cli", version: SERVER_VERSION });

  if (options.url) {
    let url: URL;
    try {
      url = new URL(options.url);
    } catch {
      throw new TypeError(`--url is not a valid URL: '${options.url}'.`);
    }
    await client.connect(new StreamableHTTPClientTransport(url));
    return { client, close: () => client.close() };
  }

  const baseUrl = options.baseUrl?.trim() ?? "";
  if (baseUrl) {
    try {
      new URL(baseUrl);
    } catch {
      throw new TypeError(`--base-url is not a valid URL: '${baseUrl}'.`);
    }
  }
  const libretranslate = clientFor({ baseUrl: baseUrl || DEFAULT_URL, apiKey: options.apiKey?.trim() || undefined });
  const server = buildLibreTranslateMcpServer(libretranslate);
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  await server.connect(serverSide);
  await client.connect(clientSide);
  return {
    client,
    close: async () => {
      await client.close();
      await server.close();
    },
  };
}
