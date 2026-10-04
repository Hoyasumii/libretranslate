import {
  LibreTranslateApiError,
  LibreTranslateConfigError,
  LibreTranslateTimeoutError,
  createLibreTranslateClient,
  createLibreTranslateClientFromEnv,
} from "../../src";
import { FakeLibreTranslate, json, libreTranslate } from "./fake-server";

const KEY = "lt-key-0123456789";

describe("createLibreTranslateClient", () => {
  let fake: FakeLibreTranslate;
  afterEach(() => fake?.stop());

  it("refuses a missing or malformed URL", () => {
    expect(() => createLibreTranslateClient({ baseUrl: "" })).toThrow(LibreTranslateConfigError);
    expect(() => createLibreTranslateClient({ baseUrl: "ftp://x" })).toThrow(/invalid baseUrl/);
  });

  it("trims the trailing slash and keeps a base path", async () => {
    fake = await FakeLibreTranslate.start();
    const lt = createLibreTranslateClient({ baseUrl: `${fake.url}/` });
    expect(lt.baseUrl).toBe(fake.url);
    await lt.health();
    expect(fake.seen[0].path).toBe("/health");
  });

  it("translates one text as JSON, defaulting source to auto", async () => {
    fake = await FakeLibreTranslate.start();
    const lt = createLibreTranslateClient({ baseUrl: fake.url });
    const result = await lt.translate({ q: "olá mundo", target: "en" });
    expect(result).toEqual({
      translatedText: "[en] hello world",
      detectedLanguage: { language: "pt", confidence: 90 },
    });
    expect(fake.seen[0].contentType).toBe("application/json");
    expect(fake.lastJson("/translate")).toEqual({ q: "olá mundo", source: "auto", target: "en" });
  });

  it("translates a list in one request, in order, with alternatives", async () => {
    fake = await FakeLibreTranslate.start();
    const lt = createLibreTranslateClient({ baseUrl: fake.url });
    const result = await lt.translateMany({ q: ["olá", "mundo"], source: "pt", target: "en", alternatives: 1 });
    expect(result.translatedText).toEqual(["[en] hello", "[en] world"]);
    expect(result.alternatives).toEqual([["alt1"], ["alt1"]]);
    expect(fake.count("/translate")).toBe(1);
  });

  it("sends the API key in every keyed body, and never otherwise", async () => {
    fake = await FakeLibreTranslate.start(libreTranslate({ requireKey: KEY }));
    const lt = createLibreTranslateClient({ baseUrl: fake.url, apiKey: ` ${KEY} ` });
    expect(lt.hasApiKey).toBe(true);
    await lt.translate({ q: "olá", source: "pt", target: "en" });
    await lt.detect("olá");
    await lt.suggest({ q: "olá", s: "hi", source: "pt", target: "en" });
    for (const path of ["/translate", "/detect", "/suggest"]) expect(fake.lastJson(path).api_key).toBe(KEY);
    await lt.languages();
    expect(fake.seen.find((s) => s.path === "/languages")?.search).toBe("");
  });

  it("throws LibreTranslateApiError with the server's message, masking the key", async () => {
    fake = await FakeLibreTranslate.start(() => json({ error: `Invalid API key ${KEY}` }, 403));
    const lt = createLibreTranslateClient({ baseUrl: fake.url, apiKey: KEY });
    const error = await lt.detect("x").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(LibreTranslateApiError);
    expect((error as LibreTranslateApiError).status).toBe(403);
    expect((error as Error).message).toBe("POST /detect → 403: Invalid API key ***");
    expect(JSON.stringify((error as LibreTranslateApiError).body)).not.toContain(KEY);
  });

  it("reports the instance's missing-key answer", async () => {
    fake = await FakeLibreTranslate.start(libreTranslate({ requireKey: KEY }));
    const lt = createLibreTranslateClient({ baseUrl: fake.url });
    await expect(lt.translate({ q: "x", target: "en" })).rejects.toMatchObject({ status: 400 });
  });

  it("times out", async () => {
    fake = await FakeLibreTranslate.start(
      () => new Promise<Response>((resolve) => setTimeout(() => resolve(json({})), 500))
    );
    const lt = createLibreTranslateClient({ baseUrl: fake.url, timeoutMs: 50 });
    await expect(lt.health()).rejects.toBeInstanceOf(LibreTranslateTimeoutError);
  });

  it("uploads a file as multipart, named, and downloads the result", async () => {
    fake = await FakeLibreTranslate.start(libreTranslate({ requireKey: KEY }));
    const lt = createLibreTranslateClient({ baseUrl: fake.url, apiKey: KEY });
    const { translatedFileUrl } = await lt.translateFile({
      file: new Blob(["olá mundo"]),
      filename: "note.txt",
      source: "pt",
      target: "en",
    });
    expect(fake.seen[0].contentType).toMatch(/^multipart\/form-data/);
    expect(fake.seen[0].body).toContain(`name="api_key"\r\n\r\n${KEY}`);
    const file = await lt.downloadFile(translatedFileUrl);
    expect(file.filename).toBe("1.note.en.txt");
    expect(new TextDecoder().decode(file.data)).toBe("[en] hello world");
  });

  it("refuses a Blob without a filename", async () => {
    const lt = createLibreTranslateClient({ baseUrl: "http://127.0.0.1:9" });
    await expect(lt.translateFile({ file: new Blob(["x"]), target: "en" })).rejects.toThrow(/filename/);
  });

  it("calls an operation by operationId", async () => {
    fake = await FakeLibreTranslate.start(libreTranslate({ requireKey: KEY }));
    const lt = createLibreTranslateClient({ baseUrl: fake.url, apiKey: KEY });
    await expect(lt.call("listLanguages")).resolves.toHaveLength(3);
    await expect(lt.call("detect", { q: "olá" })).resolves.toHaveLength(2);
    expect(fake.lastJson("/detect").api_key).toBe(KEY);
  });
});

describe("createLibreTranslateClientFromEnv", () => {
  it("reads LIBRETRANSLATE_URL and LIBRETRANSLATE_API_KEY, defaulting to localhost:5000", () => {
    expect(createLibreTranslateClientFromEnv({ env: {} }).baseUrl).toBe("http://localhost:5000");
    const lt = createLibreTranslateClientFromEnv({
      env: { LIBRETRANSLATE_URL: "https://lt.example.com", LIBRETRANSLATE_API_KEY: KEY },
    });
    expect(lt.baseUrl).toBe("https://lt.example.com");
    expect(lt.hasApiKey).toBe(true);
  });
});
