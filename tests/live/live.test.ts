/**
 * Against a real instance. Runs only with LIBRETRANSLATE_LIVE=1 and LIBRETRANSLATE_URL (plus
 * LIBRETRANSLATE_API_KEY when the instance issues keys), read from `.env.test`: `pnpm test:live`.
 *
 * A local instance is one command away: `docker run -p 5000:5000 libretranslate/libretranslate
 * --load-only en,pt,es`. Nothing here writes to the instance: suggestions are never sent.
 */
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createLibreTranslateClientFromEnv } from "../../src/index";
import { buildLibreTranslateMcpServer } from "../../src/mcp";

const env = process.env;
const configured = Boolean(env.LIBRETRANSLATE_LIVE === "1" && env.LIBRETRANSLATE_URL);

(configured ? describe : describe.skip)("real instance", () => {
  const libretranslate = configured ? createLibreTranslateClientFromEnv({ timeoutMs: 120_000 }) : undefined;
  let mcp: Client;

  beforeAll(async () => {
    if (!libretranslate) return;
    const server = buildLibreTranslateMcpServer(libretranslate);
    const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
    await server.connect(serverSide);
    mcp = new Client({ name: "live", version: "0" });
    await mcp.connect(clientSide);
  });
  afterAll(async () => mcp?.close());

  // oxlint-disable-next-line typescript/no-explicit-any -- the tools' JSON is walked freely
  async function call(name: string, args: Record<string, unknown> = {}): Promise<any> {
    const result = await mcp.callTool({ name, arguments: args });
    const text = (result.content as { text: string }[]).map((part) => part.text).join("");
    if (result.isError) throw new Error(`${name}: ${text}`);
    return JSON.parse(text);
  }

  test("the SDK reads the instance and its languages match the spec's shapes", async () => {
    await expect(libretranslate!.health()).resolves.toEqual({ status: "ok" });
    const settings = await libretranslate!.settings();
    expect(typeof settings.charLimit).toBe("number");
    expect(typeof settings.keyRequired).toBe("boolean");
    const languages = await libretranslate!.languages();
    expect(languages.length).toBeGreaterThan(0);
    for (const language of languages) {
      expect(language).toEqual({ code: expect.any(String), name: expect.any(String), targets: expect.any(Array) });
    }
  });

  test("translates one text and a list, detecting the source", async () => {
    const one = await libretranslate!.translate({ q: "Hello, world!", source: "en", target: "pt" });
    expect(one.translatedText.length).toBeGreaterThan(0);
    const auto = await libretranslate!.translate({ q: "Bonjour tout le monde", target: "en" });
    expect(auto.detectedLanguage?.language).toBeDefined();
    const many = await libretranslate!.translateMany({ q: ["Hello", "Goodbye"], source: "en", target: "es" });
    expect(many.translatedText).toHaveLength(2);
  });

  test("the MCP tools answer", async () => {
    const status = await call("libretranslate_status");
    expect(status.health).toBe("ok");
    const detected = await call("libretranslate_detect", { q: "Esta frase está em português." });
    expect(detected[0].language).toBeDefined();
    const translated = await call("libretranslate_translate", { q: "Good morning", source: "en", target: "pt" });
    expect(typeof translated.translatedText).toBe("string");
  });

  test("translates a .txt file end to end", async () => {
    const settings = await libretranslate!.settings();
    if (!settings.filesTranslation || !settings.supportedFilesFormat.includes(".txt")) return;
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "libretranslate-live-"));
    try {
      const input = path.join(dir, "hello.txt");
      fs.writeFileSync(input, "Hello, world!");
      const result = await call("libretranslate_translate_file", { path: input, source: "en", target: "pt" });
      expect(fs.readFileSync(result.savedTo, "utf8").length).toBeGreaterThan(0);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
