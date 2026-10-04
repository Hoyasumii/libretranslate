import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { runCli, splitGlobalFlags } from "../../../src/cli/run";
import { RunningLibreTranslateMcpServer, startLibreTranslateMcpServer } from "../../../src/mcp";
import { writeEnvFile } from "../../../src/mcp/config";
import type { McpDeps } from "../../../src/cli/mcp/deps";
import { FakeLibreTranslate } from "../fake-server";

let home: string;
let configFile: string;
let running: RunningLibreTranslateMcpServer | undefined;
let libretranslate: FakeLibreTranslate;
let BASE: string;

beforeEach(async () => {
  libretranslate = await FakeLibreTranslate.start();
  BASE = libretranslate.url;
  home = fs.mkdtempSync(path.join(os.tmpdir(), "libretranslate-cli-"));
  configFile = path.join(home, ".env");
  writeEnvFile(configFile, { LIBRETRANSLATE_API_KEY: "saved-key-0123", LIBRETRANSLATE_URL: BASE });
});
afterEach(async () => {
  await running?.close();
  running = undefined;
  await libretranslate.stop();
  fs.rmSync(home, { recursive: true, force: true });
});

async function cli(argv: string[], env: Record<string, string | undefined> = {}, deps: Partial<McpDeps> = {}) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCli(
    argv,
    {
      stdout: (text) => out.push(text),
      stderr: (text) => err.push(text),
      // Never the developer's own saved configuration.
      env: { LIBRETRANSLATE_CONFIG: configFile, ...env },
    },
    deps
  );
  return { code, stdout: out.join("\n"), stderr: err.join("\n") };
}

describe("libretranslate CLI", () => {
  it("refuses every command until `libretranslate mcp config` has saved a configuration", async () => {
    fs.rmSync(configFile);
    running = await startLibreTranslateMcpServer({ port: 0, baseUrl: BASE });
    for (const argv of [
      ["tools"],
      ["status"],
      ["status", "--api-key", "k"],
      ["status", "--url", running.url],
      ["mcp", "stop"],
      ["mcp", "status"],
      ["mcp", "boot", "status"],
    ]) {
      const result = await cli(argv, { LIBRETRANSLATE_URL: BASE });
      expect({ argv, code: result.code }).toEqual({ argv, code: 1 });
      expect(result.stderr).toContain(
        `No saved configuration at ${configFile}: run \`libretranslate mcp config\` first.`
      );
      expect(result.stdout).toBe("");
    }
    expect(libretranslate.seen).toEqual([]);
  });

  it("still prints help and the version before anything is configured", async () => {
    fs.rmSync(configFile);
    for (const argv of [[], ["--help"], ["translate", "--help"], ["mcp"], ["mcp", "config", "--help"], ["--version"]]) {
      const result = await cli(argv);
      expect({ argv, code: result.code, stderr: result.stderr }).toEqual({ argv, code: 0, stderr: "" });
    }
  });

  it("opens the documentation site with `libretranslate docs`, configured or not", async () => {
    fs.rmSync(configFile);
    const opened: string[] = [];
    const result = await cli(["docs"], {}, { openBrowser: async (url) => void opened.push(url) });
    expect(result).toEqual({ code: 0, stdout: "https://hoyasumii.github.io/libretranslate/", stderr: "" });
    expect(opened).toEqual(["https://hoyasumii.github.io/libretranslate/"]);
  });

  it("still prints the link when `libretranslate docs` cannot open a browser", async () => {
    const result = await cli(["docs"], {}, { openBrowser: () => Promise.reject(new Error("no browser")) });
    expect(result).toEqual({
      code: 0,
      stdout: "https://hoyasumii.github.io/libretranslate/",
      stderr: "Could not open a browser; open the link above.",
    });
  });

  it("describes `libretranslate docs` in the usage without opening anything", async () => {
    const opened: string[] = [];
    const openBrowser = async (url: string) => void opened.push(url);
    expect((await cli(["--help"], {}, { openBrowser })).stdout).toMatch(/`docs`\s+Open the documentation/);
    expect((await cli(["docs", "--help"], {}, { openBrowser })).code).toBe(0);
    expect(opened).toEqual([]);
  });

  it("needs a saved URL, but no API key", async () => {
    writeEnvFile(configFile, { LIBRETRANSLATE_API_KEY: "k" });
    const refused = await cli(["tools"], { LIBRETRANSLATE_URL: BASE });
    expect(refused.code).toBe(1);
    expect(refused.stderr).toContain("run `libretranslate mcp config` first");

    writeEnvFile(configFile, { LIBRETRANSLATE_URL: BASE });
    const result = await cli(["detect", "--q", "olá"]);
    expect(result).toMatchObject({ code: 0, stderr: "" });
    expect(libretranslate.lastJson("/detect")).toEqual({ q: "olá" });
  });

  it("lists the MCP tools as commands once configured", async () => {
    const result = await cli(["tools"]);
    expect(result.code).toBe(0);
    expect(result.stdout).toMatch(/^translate\s+Translate text$/m);
    expect(result.stdout).toMatch(/^translate-file\s+Translate a file$/m);
    expect(result.stdout).toMatch(/^languages\s+/m);
    expect(result.stdout).toMatch(/^call\s+/m);
  });

  it("lists each tool by its title in the root help, with no padding for the terminal to wrap", async () => {
    const root = await cli(["--help"]);
    expect(root.code).toBe(0);
    expect(root.stdout).toMatch(/`translate`\s+Translate text$/m);
    expect(root.stdout).not.toMatch(/[ \t]$/m);

    const tool = await cli(["translate", "--help"]);
    expect(tool.stdout).toContain("Translate a text, or a list of texts in one call");
    expect(tool.stdout).not.toMatch(/[ \t]$/m);
  });

  it("translates with the saved key, coercing flags into the tool's arguments", async () => {
    const result = await cli([
      "translate",
      "--q",
      "olá mundo",
      "--source",
      "pt",
      "--target",
      "en",
      "--alternatives",
      "2",
    ]);
    expect(result).toMatchObject({ code: 0, stderr: "" });
    expect(result.stdout).toContain('"translatedText": "[en] hello world"');
    expect(libretranslate.lastJson("/translate")).toMatchObject({
      q: "olá mundo",
      source: "pt",
      alternatives: 2,
      api_key: "saved-key-0123",
    });
  });

  it("lets the environment and then a flag override the saved key for one run", async () => {
    await cli(["detect", "--q", "x"], { LIBRETRANSLATE_API_KEY: "env-key-0123" });
    expect(libretranslate.lastJson("/detect").api_key).toBe("env-key-0123");
    await cli(["detect", "--q", "x", "--api-key", "flag-key-0123"], { LIBRETRANSLATE_API_KEY: "env-key-0123" });
    expect(libretranslate.lastJson("/detect").api_key).toBe("flag-key-0123");
  });

  it("reports tool errors on stderr with exit code 1", async () => {
    const result = await cli([
      "call",
      "--operation",
      "suggest",
      "--body",
      '{"q":"a","s":"b","source":"pt","target":"en"}',
    ]);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("writes to the instance; call again with confirm: true");
    expect(libretranslate.seen).toEqual([]);
  });

  it("prints usage for a missing required flag or an unknown command", async () => {
    const missing = await cli(["detect"]);
    expect(missing.code).toBe(1);
    expect(missing.stderr).toContain("Missing required argument: --q");
    expect(missing.stderr).toContain("USAGE");

    const unknown = await cli(["nope"]);
    expect(unknown.code).toBe(1);
    expect(unknown.stderr).toContain("Unknown command `nope`");
  });

  it("connects to a running libretranslate-mcp with --url", async () => {
    running = await startLibreTranslateMcpServer({ port: 0, baseUrl: BASE, apiKey: "server-key-0123" });
    const result = await cli(["status", "--url", running.url]);
    expect(result).toMatchObject({ code: 0, stderr: "" });
    expect(result.stdout).toContain('"apiKeyConfigured": true');
    await cli(["detect", "--q", "x", "--url", running.url]);
    expect(libretranslate.lastJson("/detect").api_key).toBe("server-key-0123");
  });

  it("takes the connection flags from anywhere on the line", () => {
    expect(splitGlobalFlags(["--url=http://x/mcp", "translate", "--api-key", "k", "--target", "en"])).toEqual({
      options: { url: "http://x/mcp", apiKey: "k" },
      rest: ["translate", "--target", "en"],
    });
    expect(() => splitGlobalFlags(["status", "--base-url"])).toThrow("--base-url needs a value.");
  });
});
