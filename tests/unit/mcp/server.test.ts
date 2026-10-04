import { createServer, request } from "node:http";
import { AddressInfo } from "node:net";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { RunningLibreTranslateMcpServer, SERVER_VERSION, startLibreTranslateMcpServer } from "../../../src/mcp";
import { hostAllowed } from "../../../src/mcp/server";
import { FakeLibreTranslate, libreTranslate } from "../fake-server";

const KEY = "lt-key-0123456789";
let running: RunningLibreTranslateMcpServer | undefined;
let libretranslate: FakeLibreTranslate;
let BASE: string;
beforeEach(async () => {
  libretranslate = await FakeLibreTranslate.start(libreTranslate({ requireKey: KEY }));
  BASE = libretranslate.url;
});
afterEach(async () => {
  await running?.close();
  running = undefined;
  await libretranslate.stop();
});

async function connect(url: string): Promise<Client> {
  const client = new Client({ name: "test", version: "0.0.0" });
  await client.connect(new StreamableHTTPClientTransport(new URL(url)));
  return client;
}

function text(result: Awaited<ReturnType<Client["callTool"]>>): string {
  return (result.content as { type: string; text: string }[]).map((part) => part.text).join("");
}

describe("startLibreTranslateMcpServer", () => {
  it("serves the tools over Streamable HTTP and calls LibreTranslate with the given key", async () => {
    running = await startLibreTranslateMcpServer({ port: 0, baseUrl: BASE, apiKey: KEY });
    expect(running.url).toBe(`http://127.0.0.1:${running.port}/mcp`);

    const client = await connect(running.url);
    const names = (await client.listTools()).tools.map((tool) => tool.name);
    expect(names.sort()).toEqual([
      "libretranslate_call",
      "libretranslate_describe",
      "libretranslate_detect",
      "libretranslate_languages",
      "libretranslate_resources",
      "libretranslate_status",
      "libretranslate_suggest",
      "libretranslate_translate",
      "libretranslate_translate_file",
    ]);

    const result = await client.callTool({
      name: "libretranslate_translate",
      arguments: { q: "olá mundo", target: "en" },
    });
    expect(result.isError).toBeFalsy();
    expect(text(result)).toContain('"translatedText": "[en] hello world"');
    expect(libretranslate.lastJson("/translate").api_key).toBe(KEY);
    await client.close();
  });

  it("reports API errors as tool errors, with what to check, never the key", async () => {
    running = await startLibreTranslateMcpServer({ port: 0, baseUrl: BASE, apiKey: "wrong-key-0123456789" });
    const client = await connect(running.url);
    const result = await client.callTool({ name: "libretranslate_detect", arguments: { q: "olá" } });
    expect(result.isError).toBe(true);
    expect(text(result)).toContain("LibreTranslate answered 403");
    expect(text(result)).toContain("check LIBRETRANSLATE_API_KEY");
    expect(text(result)).not.toContain("wrong-key-0123456789");
    await client.close();
  });

  it("rejects bad arguments and a port already in use, but needs no key", async () => {
    await expect(startLibreTranslateMcpServer({ port: 70000, baseUrl: BASE })).rejects.toThrow("port must be");
    await expect(startLibreTranslateMcpServer({ port: 0, baseUrl: "" })).rejects.toThrow("baseUrl is required");
    await expect(startLibreTranslateMcpServer({ port: 0, baseUrl: "not a url" })).rejects.toThrow("not a valid URL");

    const blocker = createServer();
    await new Promise<void>((resolve) => blocker.listen(0, "127.0.0.1", resolve));
    const { port } = blocker.address() as AddressInfo;
    await expect(startLibreTranslateMcpServer({ port, baseUrl: BASE })).rejects.toThrow(/EADDRINUSE/);
    await new Promise<void>((resolve) => blocker.close(() => resolve()));

    running = await startLibreTranslateMcpServer({ port: 0, baseUrl: BASE });
    expect(running.port).toBeGreaterThan(0);
  });

  it("refuses a Host other than loopback (DNS rebinding)", async () => {
    running = await startLibreTranslateMcpServer({ port: 0, baseUrl: BASE, apiKey: KEY });
    const status = await new Promise<number>((resolve, reject) => {
      const req = request(
        { host: "127.0.0.1", port: running!.port, path: "/mcp", method: "POST", headers: { host: "evil.example" } },
        (res) => {
          res.resume();
          resolve(res.statusCode ?? 0);
        }
      );
      req.on("error", reject);
      req.end("{}");
    });
    expect(status).toBe(403);
    expect(hostAllowed("localhost:3768")).toBe(true);
    expect(hostAllowed("127.0.0.1")).toBe(true);
    expect(hostAllowed("[::1]:3768")).toBe(true);
    expect(hostAllowed("127.0.0.1.evil.example")).toBe(false);
    expect(hostAllowed(undefined)).toBe(false);
  });

  it("answers GET /health with the instance and whether a key is set", async () => {
    running = await startLibreTranslateMcpServer({ port: 0, baseUrl: BASE, apiKey: KEY });
    const response = await fetch(running.url.replace("/mcp", "/health"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      baseUrl: BASE,
      apiKey: true,
      version: SERVER_VERSION,
    });
  });

  it("answers 404 off the endpoint and 405 for GET", async () => {
    running = await startLibreTranslateMcpServer({ port: 0, baseUrl: BASE, apiKey: KEY });
    expect((await fetch(running.url.replace("/mcp", "/other"))).status).toBe(404);
    expect((await fetch(running.url)).status).toBe(405);
  });
});

describe("POST /shutdown", () => {
  async function post(url: string, token?: string): Promise<number> {
    const response = await fetch(new URL("/shutdown", url), {
      method: "POST",
      headers: token === undefined ? {} : { "X-LibreTranslate-Shutdown": token },
    });
    return response.status;
  }

  it("answers 202 and calls onShutdown for the right token, 403 for any other", async () => {
    let shutdowns = 0;
    running = await startLibreTranslateMcpServer({
      port: 0,
      baseUrl: BASE,
      apiKey: "k",
      shutdownToken: "s3cret",
      onShutdown: () => shutdowns++,
    });
    expect(await post(running.url)).toBe(403);
    expect(await post(running.url, "wrong")).toBe(403);
    expect(await post(running.url, "s3cret-and-more")).toBe(403);
    expect(shutdowns).toBe(0);
    expect(await post(running.url, "s3cret")).toBe(202);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(shutdowns).toBe(1);
  });

  it("closes the server itself when given a token and no onShutdown", async () => {
    running = await startLibreTranslateMcpServer({ port: 0, baseUrl: BASE, apiKey: "k", shutdownToken: "s3cret" });
    expect(await post(running.url, "s3cret")).toBe(202);
    await new Promise((resolve) => setTimeout(resolve, 50));
    await expect(fetch(new URL("/health", running.url))).rejects.toThrow();
  });

  it("refuses every request when the server has no token", async () => {
    running = await startLibreTranslateMcpServer({ port: 0, baseUrl: BASE, apiKey: "k" });
    expect(await post(running.url, "")).toBe(403);
    expect(await post(running.url, "anything")).toBe(403);
  });
});
