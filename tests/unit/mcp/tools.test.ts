import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createLibreTranslateClient } from "../../../src/client";
import { buildLibreTranslateMcpServer } from "../../../src/mcp";
import { FakeLibreTranslate, json, libreTranslate } from "../fake-server";

const KEY = "lt-key-0123456789";
let libretranslate: FakeLibreTranslate;
let client: Client;
let dir: string;

async function connect(fake: FakeLibreTranslate, apiKey = KEY): Promise<Client> {
  const server = buildLibreTranslateMcpServer(createLibreTranslateClient({ baseUrl: fake.url, apiKey }));
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  await server.connect(serverSide);
  const connected = new Client({ name: "test", version: "0.0.0" });
  await connected.connect(clientSide);
  return connected;
}

beforeEach(async () => {
  libretranslate = await FakeLibreTranslate.start(libreTranslate({ requireKey: KEY }));
  client = await connect(libretranslate);
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "libretranslate-tools-"));
});
afterEach(async () => {
  await client.close();
  await libretranslate.stop();
  fs.rmSync(dir, { recursive: true, force: true });
});

async function call(name: string, args: Record<string, unknown> = {}): Promise<{ text: string; isError: boolean }> {
  const result = await client.callTool({ name, arguments: args });
  const text = (result.content as { type: string; text: string }[]).map((part) => part.text).join("");
  return { text, isError: result.isError === true };
}

const parsed = async (name: string, args: Record<string, unknown> = {}): Promise<unknown> => {
  const { text, isError } = await call(name, args);
  if (isError) throw new Error(text);
  return JSON.parse(text);
};

describe("libretranslate_translate", () => {
  it("translates one text, detecting the source by default", async () => {
    await expect(parsed("libretranslate_translate", { q: "olá mundo", target: "en" })).resolves.toEqual({
      translatedText: "[en] hello world",
      detectedLanguage: { language: "pt", confidence: 90 },
    });
    expect(libretranslate.lastJson("/translate")).toEqual({
      q: "olá mundo",
      source: "auto",
      target: "en",
      format: "text",
      alternatives: 0,
      api_key: KEY,
    });
  });

  it("translates a list in one request", async () => {
    const result = (await parsed("libretranslate_translate", { q: ["olá", "mundo"], source: "pt", target: "es" })) as {
      translatedText: string[];
    };
    expect(result.translatedText).toEqual(["[es] hello", "[es] world"]);
    expect(libretranslate.count("/translate")).toBe(1);
  });

  it("validates its input against the generated schema", async () => {
    const { text, isError } = await call("libretranslate_translate", { q: "x", target: "en", format: "pdf" });
    expect(isError).toBe(true);
    expect(text).toContain("format");
    expect(libretranslate.count("/translate")).toBe(0);
  });
});

describe("libretranslate_detect and libretranslate_languages", () => {
  it("detects", async () => {
    await expect(parsed("libretranslate_detect", { q: "olá" })).resolves.toEqual([
      { language: "pt", confidence: 90 },
      { language: "es", confidence: 10 },
    ]);
  });

  it("lists the languages compactly, and one source's targets", async () => {
    await expect(parsed("libretranslate_languages")).resolves.toEqual({
      languages: ["en (English)", "es (Spanish)", "pt (Portuguese)"],
      targets: "Every language translates into every language listed.",
    });
    await expect(parsed("libretranslate_languages", { source: "PT" })).resolves.toEqual({
      source: "pt (Portuguese)",
      targets: ["en (English)", "es (Spanish)", "pt (Portuguese)"],
    });
    const { text, isError } = await call("libretranslate_languages", { source: "xx" });
    expect(isError).toBe(true);
    expect(text).toContain("'xx' is not a source language here. Sources: en, es, pt.");
  });
});

describe("libretranslate_translate_file", () => {
  it("uploads the file, downloads the translation and saves it beside the original", async () => {
    const input = path.join(dir, "note.txt");
    fs.writeFileSync(input, "olá mundo");
    const result = (await parsed("libretranslate_translate_file", { path: input, target: "en" })) as {
      savedTo: string;
    };
    expect(result.savedTo).toBe(path.join(dir, "note.en.txt"));
    expect(fs.readFileSync(result.savedTo, "utf8")).toBe("[en] hello world");
  });

  it("never replaces a file without overwrite", async () => {
    const input = path.join(dir, "note.txt");
    const output = path.join(dir, "out.txt");
    fs.writeFileSync(input, "olá");
    fs.writeFileSync(output, "keep me");
    const { text, isError } = await call("libretranslate_translate_file", { path: input, target: "en", output });
    expect(isError).toBe(true);
    expect(text).toContain("already exists; pass overwrite: true");
    expect(libretranslate.count("/translate_file")).toBe(0);
    await parsed("libretranslate_translate_file", { path: input, target: "en", output, overwrite: true });
    expect(fs.readFileSync(output, "utf8")).toBe("[en] hello");
  });

  it("explains an unreadable path and an unsupported format", async () => {
    const missing = await call("libretranslate_translate_file", { path: path.join(dir, "nope.txt"), target: "en" });
    expect(missing.text).toContain("Cannot read");
    const pdf = path.join(dir, "x.pdf");
    fs.writeFileSync(pdf, "%PDF");
    const unsupported = await call("libretranslate_translate_file", { path: pdf, target: "en" });
    expect(unsupported.isError).toBe(true);
    expect(unsupported.text).toContain(
      "LibreTranslate answered 400: POST /translate_file → 400: pdf format is not supported"
    );
  });
});

describe("libretranslate_suggest and libretranslate_status", () => {
  it("sends a suggestion", async () => {
    await expect(
      parsed("libretranslate_suggest", { q: "olá", s: "hi there", source: "pt", target: "en" })
    ).resolves.toEqual({ success: true });
    expect(libretranslate.lastJson("/suggest")).toMatchObject({ s: "hi there", api_key: KEY });
  });

  it("reports the instance's health and settings, and whether a key is configured", async () => {
    await expect(parsed("libretranslate_status")).resolves.toMatchObject({
      url: libretranslate.url,
      apiKeyConfigured: true,
      health: "ok",
      keyRequired: true,
      charLimit: 2000,
      supportedFilesFormat: [".txt", ".docx"],
    });
  });
});

describe("errors", () => {
  it("tells the model to configure a key when the instance requires one", async () => {
    const keyless = await connect(libretranslate, "");
    const result = await keyless.callTool({ name: "libretranslate_detect", arguments: { q: "x" } });
    const text = (result.content as { text: string }[])[0].text;
    expect(result.isError).toBe(true);
    expect(text).toContain("LibreTranslate answered 400 (this instance requires an API key");
    await keyless.close();
  });

  it("says when something other than LibreTranslate answers, rather than blaming the key", async () => {
    libretranslate.handler = () => new Response("", { status: 403, headers: { server: "AirTunes/980.77.5" } });
    const { text } = await call("libretranslate_detect", { q: "x" });
    expect(text).toContain("this answer is not LibreTranslate's: check LIBRETRANSLATE_URL");
    expect(text).not.toContain("the API key was refused");
  });

  it("explains rate limits", async () => {
    libretranslate.handler = () => json({ error: "Too many requests" }, 429);
    const { text } = await call("libretranslate_detect", { q: "x" });
    expect(text).toContain("rate limited");
  });
});

describe("generic tools", () => {
  it("lists, describes and calls the raw API", async () => {
    expect((await call("libretranslate_resources")).text).toContain("- listLanguages [read] GET /languages");
    expect((await call("libretranslate_describe", { operation: "detect" })).text).toContain("POST /detect");
    await expect(parsed("libretranslate_call", { operation: "getFrontendSettings" })).resolves.toMatchObject({
      charLimit: 2000,
    });
    const refused = await call("libretranslate_call", {
      operation: "suggest",
      body: { q: "a", s: "b", source: "pt", target: "en" },
    });
    expect(refused.text).toContain("confirm: true");
  });
});
