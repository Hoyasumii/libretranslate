import { createLibreTranslateClient } from "../../../src/client";
import { MAX_RESULT_CHARS, invoke, toResultText } from "../../../src/mcp/invoke";
import { FakeLibreTranslate, LANGUAGES } from "../fake-server";

const KEY = "lt-key-0123456789";
let server: FakeLibreTranslate;
beforeEach(async () => {
  server = await FakeLibreTranslate.start();
});
afterEach(async () => server.stop());

const client = () => createLibreTranslateClient({ baseUrl: server.url, apiKey: KEY });

describe("invoke", () => {
  it("calls an operation without a body, by operationId or METHOD /path", async () => {
    await expect(invoke(client(), "listLanguages")).resolves.toEqual(LANGUAGES);
    await expect(invoke(client(), "GET /health")).resolves.toEqual({ status: "ok" });
  });

  it("sends the body with the configured key added", async () => {
    const result = await invoke(client(), "translate", { body: { q: "olá", source: "pt", target: "en" } });
    expect(result).toEqual({ translatedText: "[en] hello" });
    expect(server.lastJson("/translate")).toEqual({ q: "olá", source: "pt", target: "en", api_key: KEY });
  });

  it("refuses a write without confirm, and runs it with", async () => {
    const body = { q: "olá", s: "hi", source: "pt", target: "en" };
    await expect(invoke(client(), "suggest", { body })).rejects.toThrow("writes to the instance");
    expect(server.seen).toEqual([]);
    await expect(invoke(client(), "suggest", { body, confirm: true })).resolves.toEqual({ success: true });
  });

  it("refuses bad bodies before any request", async () => {
    await expect(invoke(client(), "translate")).rejects.toThrow("needs a body");
    await expect(invoke(client(), "translate", { body: { q: "x", target: "en" } })).rejects.toThrow(
      "translate needs body.source."
    );
    await expect(
      invoke(client(), "translate", { body: { q: "x", source: "auto", target: "en", other: 1 } })
    ).rejects.toThrow("Unknown body field(s) for translate: other");
    await expect(invoke(client(), "detect", { body: { q: "x", api_key: "mine" } })).rejects.toThrow(
      "Do not pass api_key"
    );
    await expect(invoke(client(), "health", { body: {} })).rejects.toThrow("takes no body");
    await expect(invoke(client(), "translateFile")).rejects.toThrow("Unknown operation");
    expect(server.seen).toEqual([]);
  });
});

describe("toResultText", () => {
  it("passes strings through and cuts long results", () => {
    expect(toResultText("plain")).toBe("plain");
    const long = toResultText({ text: "x".repeat(MAX_RESULT_CHARS + 10) });
    expect(long).toContain("[truncated:");
  });
});
