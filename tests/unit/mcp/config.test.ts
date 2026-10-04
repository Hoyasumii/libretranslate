import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  clientFor,
  configDir,
  configFilePath,
  parseEnv,
  readEnvFile,
  resolveMcpConfig,
  stateDir,
  writeEnvFile,
} from "../../../src/mcp/config";
import { FakeLibreTranslate } from "../fake-server";

let dir: string;
beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "libretranslate-config-"));
});
afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

describe("config locations", () => {
  it("uses the per-user config directory of each platform, with its separators", () => {
    expect(configDir({ HOME: "/home/ada" }, "linux")).toBe("/home/ada/.config/libretranslate");
    expect(configDir({ HOME: "/home/ada", XDG_CONFIG_HOME: "/xdg" }, "linux")).toBe("/xdg/libretranslate");
    expect(configDir({ HOME: "/Users/ada" }, "darwin")).toBe("/Users/ada/Library/Application Support/libretranslate");
    expect(configDir({ APPDATA: "C:\\Users\\ada\\AppData\\Roaming" }, "win32")).toBe(
      "C:\\Users\\ada\\AppData\\Roaming\\libretranslate"
    );
    expect(configDir({ USERPROFILE: "C:\\Users\\ada" }, "win32")).toBe(
      "C:\\Users\\ada\\AppData\\Roaming\\libretranslate"
    );
  });

  it("puts the .env in it unless LIBRETRANSLATE_CONFIG says otherwise, and the run dir beside it", () => {
    expect(configFilePath({ HOME: "/home/ada" }, "linux")).toBe("/home/ada/.config/libretranslate/.env");
    expect(configFilePath({ APPDATA: "C:\\AppData" }, "win32")).toBe("C:\\AppData\\libretranslate\\.env");
    expect(configFilePath({ HOME: "/home/ada", LIBRETRANSLATE_CONFIG: "/etc/x.env" }, "linux")).toBe(
      path.resolve("/etc/x.env")
    );
    expect(stateDir("/home/ada/.config/libretranslate/.env")).toBe(
      path.join("/home/ada/.config/libretranslate", "run")
    );
  });
});

describe(".env files", () => {
  it("parses comments, export, quotes, inline comments and CRLF", () => {
    expect(
      parseEnv(
        [
          "# comment",
          "",
          "export LIBRETRANSLATE_API_KEY=abc",
          'LIBRETRANSLATE_URL="https://x.test" ',
          "OTHER='kept # not a comment'",
          "PORT=4000 # inline",
          "not a line",
        ].join("\r\n")
      )
    ).toEqual({
      LIBRETRANSLATE_API_KEY: "abc",
      LIBRETRANSLATE_URL: "https://x.test",
      OTHER: "kept # not a comment",
      PORT: "4000",
    });
  });

  it("reads a missing file as empty and keeps only the known, non-empty keys", () => {
    const file = path.join(dir, ".env");
    expect(readEnvFile(file)).toEqual({});
    fs.writeFileSync(file, "LIBRETRANSLATE_API_KEY=k\nLIBRETRANSLATE_URL=\nOTHER=1\n");
    expect(readEnvFile(file)).toEqual({ LIBRETRANSLATE_API_KEY: "k" });
  });

  it("writes an owner-only file that reads back the same, with no temp file left", () => {
    const file = path.join(dir, "nested", ".env");
    const values = {
      LIBRETRANSLATE_API_KEY: 'a"b\\c d',
      LIBRETRANSLATE_URL: "https://x.test",
      PORT: "4000",
    };
    writeEnvFile(file, values);
    expect(readEnvFile(file)).toEqual(values);
    if (process.platform !== "win32") expect(fs.statSync(file).mode & 0o777).toBe(0o600);
    expect(fs.readdirSync(path.dirname(file))).toEqual([".env"]);
  });
});

describe("resolveMcpConfig", () => {
  const file = { LIBRETRANSLATE_API_KEY: "file", LIBRETRANSLATE_URL: "https://file.test", PORT: "1111" };

  it("takes flag over environment over file over default", () => {
    expect(resolveMcpConfig({})).toEqual({ baseUrl: "http://localhost:5000", apiKey: "", port: 3768 });
    expect(resolveMcpConfig({ file })).toEqual({ apiKey: "file", baseUrl: "https://file.test", port: 1111 });
    expect(
      resolveMcpConfig({ file, env: { LIBRETRANSLATE_API_KEY: "env", PORT: "2222", LIBRETRANSLATE_URL: "" } })
    ).toEqual({ apiKey: "env", baseUrl: "https://file.test", port: 2222 });
    expect(
      resolveMcpConfig({ file, env: { LIBRETRANSLATE_API_KEY: "env" }, flags: { apiKey: "flag", port: "0" } })
    ).toMatchObject({ apiKey: "flag", port: 0 });
  });

  it("refuses a bad port or base URL", () => {
    expect(() => resolveMcpConfig({ flags: { port: "70000" } })).toThrow("PORT must be an integer");
    expect(() => resolveMcpConfig({ flags: { port: "12a" } })).toThrow("PORT must be an integer");
    expect(() => resolveMcpConfig({ flags: { baseUrl: "ftp://x" } })).toThrow("LIBRETRANSLATE_URL is not a valid");
  });
});

describe("clientFor", () => {
  let server: FakeLibreTranslate | undefined;
  afterEach(async () => server?.stop());

  it("builds a client with the key when there is one, and without it otherwise", async () => {
    server = await FakeLibreTranslate.start();
    expect(clientFor({ baseUrl: server.url, apiKey: "lt-key-0123456789" }).hasApiKey).toBe(true);
    const keyless = clientFor({ baseUrl: server.url, apiKey: "" });
    expect(keyless.hasApiKey).toBe(false);
    await keyless.detect("olá");
    expect(server.lastJson("/detect")).toEqual({ q: "olá" });
  });
});
