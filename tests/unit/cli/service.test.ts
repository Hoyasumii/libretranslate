import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import type { ExecResult, McpDeps, SpawnedProcess } from "../../../src/cli/mcp/deps";
import { runCli } from "../../../src/cli/run";
import { CONTAINER, DEFAULT_IMAGE, VOLUME, type ServiceDeps } from "../../../src/cli/service";
import { readEnvFile, writeEnvFile } from "../../../src/mcp/config";

/** A stand-in Docker: whether it is installed, whether its daemon runs, the container and the images. */
interface FakeDocker {
  installed: boolean;
  daemon: boolean;
  container?: { state: string; image: string; port?: number };
  images: Set<string>;
  /** Polls of /health before it answers 200. */
  bootPolls: number;
  calls: string[][];
  attached: string[][];
}

/** A clock that moves only when the code under test sleeps. */
let clock = 0;
const sleep = async (ms: number) => void (clock += ms);
const now = () => clock;

let home: string;
let configFile: string;
let docker: FakeDocker;

beforeEach(() => {
  home = fs.mkdtempSync(path.join(os.tmpdir(), "libretranslate-service-"));
  configFile = path.join(home, ".env");
  docker = { installed: true, daemon: true, images: new Set(), bootPolls: 0, calls: [], attached: [] };
});
afterEach(() => fs.rmSync(home, { recursive: true, force: true }));

const ok = (stdout = ""): ExecResult => ({ code: 0, stdout, stderr: "" });
const fail = (stderr: string, code = 1): ExecResult => ({ code, stdout: "", stderr });

async function exec(command: string, args: string[]): Promise<ExecResult> {
  if (command !== "docker") return fail("unexpected command", 127);
  docker.calls.push(args);
  if (!docker.installed) return fail("command not found: docker", 127);
  const [verb, sub] = args;
  if (verb === "--version") return ok("Docker version 27.0.0");
  if (!docker.daemon) return fail("Cannot connect to the Docker daemon");
  if (verb === "info") return ok("27.0.0");
  if (verb === "container" && sub === "inspect") {
    const c = docker.container;
    return c ? ok(`${c.state}|${c.image}|${c.port ?? ""}`) : fail("No such container");
  }
  if (verb === "image" && sub === "inspect") return docker.images.has(args[2]) ? ok("[]") : fail("No such image");
  if (verb === "run") {
    const publish = args[args.indexOf("--publish") + 1];
    const image = args[args.indexOf("--label") + 2];
    docker.container = { state: "running", image, port: Number(publish.split(":")[1]) };
    return ok("c0ffee");
  }
  if (verb === "start" && docker.container) {
    docker.container.state = "running";
    return ok(CONTAINER);
  }
  if (verb === "stop" && docker.container) {
    docker.container.state = "exited";
    return ok(CONTAINER);
  }
  if (verb === "rm") {
    docker.container = undefined;
    return ok(CONTAINER);
  }
  if (verb === "logs") return { code: 0, stdout: "", stderr: "Running on http://0.0.0.0:5000\n" };
  if (verb === "exec") return ok("1026\n12\n");
  return fail(`unexpected docker ${args.join(" ")}`);
}

function spawn(_command: string, args: string[]): SpawnedProcess {
  docker.attached.push(args);
  if (args[0] === "pull") docker.images.add(args[1]);
  return {
    pid: 1,
    unref: () => undefined,
    once: (event: string, listener: (value: never) => void) => {
      if (event === "exit") setImmediate(() => (listener as (code: number) => void)(0));
      return undefined;
    },
  } as SpawnedProcess;
}

const health: ServiceDeps["fetch"] = async () => {
  if (docker.container?.state !== "running") throw new TypeError("fetch failed");
  if (docker.bootPolls > 0) {
    docker.bootPolls--;
    throw new TypeError("fetch failed");
  }
  return Response.json({ status: "ok" });
};

async function cli(argv: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const deps = { exec, spawn, platform: process.platform } as Partial<McpDeps>;
  const code = await runCli(
    argv,
    { stdout: (text) => out.push(text), stderr: (text) => err.push(text), env: { LIBRETRANSLATE_CONFIG: configFile } },
    deps,
    { fetch: health, sleep, now }
  );
  return { code, stdout: out.join("\n"), stderr: err.join("\n") };
}

describe("libretranslate service: visibility", () => {
  it("lists `service` in the usage only when Docker is installed", async () => {
    expect((await cli(["--help"])).stdout).toMatch(/`service`\s+Run LibreTranslate locally in Docker/);
    docker.installed = false;
    const usage = await cli(["--help"]);
    expect(usage.code).toBe(0);
    expect(usage.stdout).not.toContain("service");
  });

  it("checks for Docker on every subcommand, before anything else", async () => {
    docker.installed = false;
    for (const argv of [
      ["service", "up"],
      ["service", "down"],
      ["service", "status"],
      ["service", "logs"],
      ["service"],
    ]) {
      docker.calls = [];
      const result = await cli(argv);
      expect({ argv, code: result.code }).toEqual({ argv, code: 1 });
      expect(result.stderr).toContain("Docker is not installed");
      expect(docker.calls).toEqual([["--version"]]);
    }
  });

  it("says when Docker is installed but its daemon is down, and still shows the help", async () => {
    docker.daemon = false;
    const result = await cli(["service", "status"]);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("its daemon is not answering");
    const help = await cli(["service", "--help"]);
    expect(help.code).toBe(0);
    expect(help.stdout).toMatch(/`up`\s+Start LibreTranslate/);
  });

  it("needs no saved configuration", async () => {
    expect(fs.existsSync(configFile)).toBe(false);
    expect((await cli(["service", "status"])).stdout).toContain("not created");
  });
});

describe("libretranslate service up", () => {
  it("pulls the image, creates the container on 127.0.0.1, waits for /health and saves the URL", async () => {
    docker.bootPolls = 3;
    const result = await cli(["service", "up", "--languages", "en, pt,es"]);
    expect(result.stderr).toBe("");
    expect(result.code).toBe(0);
    expect(docker.attached).toEqual([["pull", DEFAULT_IMAGE]]);
    expect(docker.calls).toContainEqual([
      "run",
      "--detach",
      "--name",
      CONTAINER,
      "--publish",
      "127.0.0.1:5000:5000",
      "--volume",
      `${VOLUME}:/home/libretranslate/.local`,
      "--label",
      "io.github.hoyasumii.libretranslate=service",
      DEFAULT_IMAGE,
      "--load-only",
      "en,pt,es",
    ]);
    expect(result.stdout).toContain("LibreTranslate is up at http://127.0.0.1:5000.");
    expect(readEnvFile(configFile)).toEqual({ LIBRETRANSLATE_URL: "http://127.0.0.1:5000" });
  });

  it("reports how far the first start is while it waits, and suggests --languages", async () => {
    docker.bootPolls = 20;
    const result = await cli(["service", "up"]);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain("--languages en,pt,es starts much faster");
    expect(result.stderr).toContain(
      "Still starting (16s): 1026 MB of models downloaded, 12 language pairs, last log: Running on http://0.0.0.0:5000"
    );
    expect(result.stderr.split("\n")).toHaveLength(2);
  });

  it("moves a saved localhost URL for the same port to 127.0.0.1", async () => {
    writeEnvFile(configFile, { LIBRETRANSLATE_URL: "http://localhost:5000/" });
    docker.images.add(DEFAULT_IMAGE);
    await cli(["service", "up"]);
    expect(readEnvFile(configFile)).toEqual({ LIBRETRANSLATE_URL: "http://127.0.0.1:5000" });
  });

  it("keeps another saved instance, saying how to switch", async () => {
    writeEnvFile(configFile, { LIBRETRANSLATE_URL: "https://libretranslate.com", LIBRETRANSLATE_API_KEY: "k" });
    docker.images.add(DEFAULT_IMAGE);
    const result = await cli(["service", "up", "--port", "5100"]);
    expect(docker.attached).toEqual([]);
    expect(result.stdout).toContain("libretranslate mcp config --base-url http://127.0.0.1:5100");
    expect(readEnvFile(configFile).LIBRETRANSLATE_URL).toBe("https://libretranslate.com");
  });

  it("starts an existing stopped container, warning that creation flags no longer apply", async () => {
    docker.container = { state: "exited", image: DEFAULT_IMAGE, port: 5200 };
    const result = await cli(["service", "up", "--port", "5000"]);
    expect(docker.calls).toContainEqual(["start", CONTAINER]);
    expect(result.stderr).toContain("already exists: --port, --languages and --image apply when it is created");
    expect(result.stdout).toContain("http://127.0.0.1:5200");
  });

  it("does nothing to a running container", async () => {
    docker.container = { state: "running", image: DEFAULT_IMAGE, port: 5000 };
    const result = await cli(["service", "up", "--no-wait"]);
    expect(result.stdout).toContain("already running");
    expect(docker.calls.some((args) => args[0] === "start" || args[0] === "run")).toBe(false);
  });

  it("refuses bad flags before touching Docker's containers", async () => {
    for (const [argv, message] of [
      [["--port", "70000"], "--port must be an integer from 1 to 65535"],
      [["--languages", "en;rm -rf"], "--languages takes language codes"],
      [["--timeout", "0"], "--timeout must be an integer"],
    ] as const) {
      const result = await cli(["service", "up", ...argv]);
      expect(result.code).toBe(1);
      expect(result.stderr).toContain(message);
    }
    expect(docker.container).toBeUndefined();
  });

  it("fails when the container stops before answering", async () => {
    docker.images.add(DEFAULT_IMAGE);
    docker.bootPolls = 1;
    const err: string[] = [];
    const code = await runCli(
      ["service", "up"],
      { stdout: () => undefined, stderr: (text) => err.push(text), env: { LIBRETRANSLATE_CONFIG: configFile } },
      { exec, spawn, platform: process.platform } as Partial<McpDeps>,
      {
        // The container crashes while it boots.
        fetch: async (...args) => {
          if (docker.container) docker.container.state = "exited";
          return health(...args);
        },
        sleep,
        now,
      }
    );
    expect(code).toBe(1);
    expect(err.join("\n")).toContain("The container stopped (exited) before answering");
  });
});

describe("libretranslate service down, status and logs", () => {
  it("reports status with exit code 3 unless it answers", async () => {
    const missing = await cli(["service", "status"]);
    expect(missing.code).toBe(3);
    docker.container = { state: "running", image: DEFAULT_IMAGE, port: 5000 };
    const running = await cli(["service", "status"]);
    expect(running.code).toBe(0);
    expect(running.stdout).toContain("url         http://127.0.0.1:5000");
    expect(running.stdout).toContain("health      ok");
    docker.container.state = "exited";
    expect((await cli(["service", "status"])).code).toBe(3);
  });

  it("stops, and with --remove deletes the container but keeps the models", async () => {
    docker.container = { state: "running", image: DEFAULT_IMAGE, port: 5000 };
    expect((await cli(["service", "down"])).stdout).toContain("Stopped");
    expect(docker.container?.state).toBe("exited");
    const removed = await cli(["service", "down", "--remove"]);
    expect(removed.stdout).toContain(`The models stay in the '${VOLUME}' volume`);
    expect(docker.container).toBeUndefined();
    expect((await cli(["service", "down"])).stdout).toContain("There is no");
  });

  it("prints the logs, or follows them attached to the terminal", async () => {
    docker.container = { state: "running", image: DEFAULT_IMAGE, port: 5000 };
    const logs = await cli(["service", "logs", "--tail", "5"]);
    expect(logs.stdout).toBe("Running on http://0.0.0.0:5000");
    expect(docker.calls).toContainEqual(["logs", "--tail", "5", CONTAINER]);
    expect((await cli(["service", "logs", "-f"])).code).toBe(0);
    expect(docker.attached).toEqual([["logs", "--tail", "100", "--follow", CONTAINER]]);
  });
});
