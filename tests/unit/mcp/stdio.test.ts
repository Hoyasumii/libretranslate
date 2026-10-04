import { PassThrough, Readable, Writable } from "node:stream";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { ReadBuffer, serializeMessage } from "@modelcontextprotocol/sdk/shared/stdio.js";
import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";
import { RunningLibreTranslateMcpStdio, serveLibreTranslateMcpStdio } from "../../../src/mcp";
import { parseLibreTranslateMcpArgs } from "../../../src/mcp/cli";
import { FakeLibreTranslate } from "../fake-server";

/** The client end of a stdio pipe: newline-delimited JSON-RPC over a pair of streams. */
class StreamClientTransport implements Transport {
  onmessage?: (message: JSONRPCMessage) => void;
  onclose?: () => void;
  onerror?: (error: Error) => void;
  private readonly buffer = new ReadBuffer();

  constructor(
    private readonly input: Readable,
    private readonly output: Writable
  ) {}

  async start(): Promise<void> {
    this.input.on("data", (chunk: Buffer) => {
      this.buffer.append(chunk);
      for (let message = this.buffer.readMessage(); message; message = this.buffer.readMessage()) {
        this.onmessage?.(message);
      }
    });
  }

  async send(message: JSONRPCMessage): Promise<void> {
    this.output.write(serializeMessage(message));
  }

  async close(): Promise<void> {
    this.onclose?.();
  }
}

let running: RunningLibreTranslateMcpStdio | undefined;
let libretranslate: FakeLibreTranslate;
beforeEach(async () => {
  libretranslate = await FakeLibreTranslate.start();
});
afterEach(async () => {
  await running?.close();
  running = undefined;
  await libretranslate.stop();
});

async function serve(): Promise<{ client: Client; stdin: PassThrough }> {
  const stdin = new PassThrough();
  const stdout = new PassThrough();
  running = await serveLibreTranslateMcpStdio({
    baseUrl: libretranslate.url,
    apiKey: "lt-key-0123456789",
    stdin,
    stdout,
  });
  const client = new Client({ name: "test", version: "0.0.0" });
  await client.connect(new StreamClientTransport(stdout, stdin));
  return { client, stdin };
}

function text(result: Awaited<ReturnType<Client["callTool"]>>): string {
  return (result.content as { type: string; text: string }[]).map((part) => part.text).join("");
}

describe("serveLibreTranslateMcpStdio", () => {
  it("serves the tools over stdin/stdout and calls LibreTranslate with the given key", async () => {
    const { client } = await serve();
    const names = (await client.listTools()).tools.map((tool) => tool.name);
    expect(names).toEqual(
      expect.arrayContaining(["libretranslate_translate", "libretranslate_detect", "libretranslate_call"])
    );
    expect(client.getInstructions()).toContain(libretranslate.url);

    const result = await client.callTool({ name: "libretranslate_detect", arguments: { q: "olá" } });
    expect(result.isError).toBeFalsy();
    expect(text(result)).toContain('"language": "pt"');
    expect(libretranslate.lastJson("/detect").api_key).toBe("lt-key-0123456789");
  });

  it("settles `closed` when the client closes stdin", async () => {
    const { stdin } = await serve();
    stdin.end();
    await expect(running?.closed).resolves.toBeUndefined();
  });

  it("rejects a bad base URL before touching the streams", async () => {
    const stdin = new PassThrough();
    const stdout = new PassThrough();
    await expect(serveLibreTranslateMcpStdio({ baseUrl: "", stdin, stdout })).rejects.toThrow("baseUrl is required");
    await expect(serveLibreTranslateMcpStdio({ baseUrl: "nope", stdin, stdout })).rejects.toThrow(
      "baseUrl is not a valid URL"
    );
    expect(stdin.listenerCount("data")).toBe(0);
  });
});

describe("parseLibreTranslateMcpArgs", () => {
  it("defaults to stdio and takes --http, --stdio and --help", () => {
    expect(parseLibreTranslateMcpArgs([])).toEqual({ mode: "stdio" });
    expect(parseLibreTranslateMcpArgs(["--stdio"])).toEqual({ mode: "stdio" });
    expect(parseLibreTranslateMcpArgs(["--http"])).toEqual({ mode: "http" });
    expect(parseLibreTranslateMcpArgs(["-h"])).toEqual({ mode: "help" });
    expect(parseLibreTranslateMcpArgs(["--http", "--help"])).toEqual({ mode: "help" });
  });

  it("refuses an unknown argument and both transports at once", () => {
    expect(() => parseLibreTranslateMcpArgs(["--port"])).toThrow("Unknown argument '--port'");
    expect(() => parseLibreTranslateMcpArgs(["--http", "--stdio"])).toThrow("either --stdio or --http");
  });
});
