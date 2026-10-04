import { CommandDef, defineCommand, renderUsage, runCommand } from "citty";
import { configFilePath, readEnvFile, writeEnvFile } from "../mcp/config";
import type { McpDeps } from "./mcp/deps";
import type { CliIo } from "./run";
import { CliInputError } from "./schema-args";

/** The container `libretranslate service` manages, and the volume its models persist in. */
export const CONTAINER = "libretranslate";
export const VOLUME = "libretranslate-models";
export const DEFAULT_IMAGE = "libretranslate/libretranslate:latest";
export const DEFAULT_SERVICE_PORT = 5000;
/** Where the image keeps its downloaded models, mounted on {@link VOLUME}. */
const MODELS_DIR = "/home/libretranslate/.local";
/** How often `up` reports progress while it waits. */
const PROGRESS_EVERY_MS = 15_000;
/** How long `up` waits for `/health` by default: the first start downloads the language models. */
const DEFAULT_WAIT_SECONDS = 900;
/** `docker --version` and `docker info` answer within this, or Docker counts as unavailable. */
const PROBE_TIMEOUT_MS = 10_000;

/** What `libretranslate service` needs beyond `McpDeps`: polling `/health`, waiting between polls, the clock. */
export interface ServiceDeps extends Pick<McpDeps, "exec" | "spawn" | "platform"> {
  fetch: typeof fetch;
  sleep(ms: number): Promise<void>;
  now(): number;
}

export function defaultServiceDeps(deps: McpDeps): ServiceDeps {
  return {
    exec: deps.exec,
    spawn: deps.spawn,
    platform: deps.platform,
    fetch: (input, init) => fetch(input, init),
    sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    now: () => Date.now(),
  };
}

/** Whether the `docker` CLI is installed: what decides if `libretranslate service` shows up at all. */
export async function dockerInstalled(deps: Pick<McpDeps, "exec">): Promise<boolean> {
  return (await deps.exec("docker", ["--version"], { timeoutMs: PROBE_TIMEOUT_MS })).code === 0;
}

/** Refuses with what to do when Docker is not installed. */
async function requireDockerInstalled(deps: Pick<McpDeps, "exec">): Promise<void> {
  if (!(await dockerInstalled(deps))) {
    throw new CliInputError(
      "Docker is not installed (no `docker` on the PATH). Install it from https://docs.docker.com/get-docker/ " +
        "to run LibreTranslate locally, or point the CLI at another instance with `libretranslate mcp config`."
    );
  }
}

/** Refuses with what to do when the Docker daemon does not answer. */
async function requireDockerDaemon(deps: Pick<McpDeps, "exec">): Promise<void> {
  const info = await deps.exec("docker", ["info", "--format", "{{.ServerVersion}}"], { timeoutMs: PROBE_TIMEOUT_MS });
  if (info.code !== 0) {
    throw new CliInputError(
      "Docker is installed, but its daemon is not answering: start Docker Desktop (or the docker service) and try again."
    );
  }
}

interface ContainerInfo {
  state: string;
  image: string;
  /** The host port mapped to the container's 5000, when there is one. */
  port?: number;
}

/** The managed container, or `undefined` when it does not exist. */
async function inspect(deps: ServiceDeps): Promise<ContainerInfo | undefined> {
  const result = await deps.exec("docker", [
    "container",
    "inspect",
    "--format",
    '{{.State.Status}}|{{.Config.Image}}|{{with index .HostConfig.PortBindings "5000/tcp"}}{{(index . 0).HostPort}}{{end}}',
    CONTAINER,
  ]);
  if (result.code !== 0) return undefined;
  const [state, image, port] = result.stdout.trim().split("|");
  return { state, image, port: port ? Number(port) : undefined };
}

async function healthy(deps: ServiceDeps, port: number): Promise<boolean> {
  try {
    const response = await deps.fetch(`${serviceUrl(port)}/health`, { signal: AbortSignal.timeout(3000) });
    return response.ok;
  } catch {
    return false;
  }
}

/** Runs a docker command with the terminal attached (pull progress, followed logs) and answers its exit code. */
function attached(deps: ServiceDeps, args: string[]): Promise<number> {
  return new Promise((resolve) => {
    const child = deps.spawn("docker", args, { stdio: "inherit" });
    child.once("exit", (code) => resolve(code ?? 1));
    child.once("error", () => resolve(127));
  });
}

async function docker(deps: ServiceDeps, args: string[], what: string): Promise<string> {
  const result = await deps.exec("docker", args);
  if (result.code !== 0) {
    throw new Error(`Could not ${what}: ${(result.stderr || result.stdout).trim() || `docker exited ${result.code}`}`);
  }
  return result.stdout.trim();
}

function parseIntFlag(value: string | undefined, name: string, min: number, max: number, fallback: number): number {
  if (value === undefined || value === "") return fallback;
  const number = /^\d+$/.test(value.trim()) ? Number(value) : Number.NaN;
  if (!Number.isInteger(number) || number < min || number > max) {
    throw new CliInputError(`--${name} must be an integer from ${min} to ${max} (received '${value}').`);
  }
  return number;
}

/** `en, pt ,es` → `en,pt,es`; refuses anything that is not a list of language codes. */
function parseLanguages(value: string | undefined): string | undefined {
  if (value === undefined || value.trim() === "") return undefined;
  const codes = value
    .split(",")
    .map((code) => code.trim())
    .filter(Boolean);
  const bad = codes.filter((code) => !/^[a-z]{2,3}(-[A-Za-z]{2,4})?$/.test(code));
  if (bad.length > 0)
    throw new CliInputError(`--languages takes language codes like en,pt,es (received ${bad.join(", ")}).`);
  return codes.join(",");
}

/**
 * The container's URL, by IPv4 address: it is published on 127.0.0.1 only, and `localhost` may resolve to `::1`
 * first, where something else can listen on the same port (macOS's AirPlay Receiver answers 403 on 5000).
 */
function serviceUrl(port: number): string {
  return `http://127.0.0.1:${port}`;
}

/** Saves the local URL as the CLI's instance when none is saved; otherwise says how to switch to it. */
function rememberUrl(io: CliIo, deps: ServiceDeps, port: number): void {
  const url = serviceUrl(port);
  const file = configFilePath(io.env, deps.platform);
  const saved = readEnvFile(file);
  const savedUrl = saved.LIBRETRANSLATE_URL?.replace(/\/+$/, "");
  if (!savedUrl || savedUrl === `http://localhost:${port}`) {
    // A `localhost` URL for this same port (as an earlier version saved it) is moved to 127.0.0.1.
    writeEnvFile(file, { ...saved, LIBRETRANSLATE_URL: url });
    io.stdout(`Saved LIBRETRANSLATE_URL=${url} to ${file}.`);
  } else if (savedUrl !== url) {
    io.stdout(
      `The saved instance is ${savedUrl}; to use this one instead: libretranslate mcp config --base-url ${url}`
    );
  }
}

/**
 * How far the first start is, read inside the container: the size of the models folder, the language
 * pairs installed, and the last log line. Every part is best effort; `undefined` when none answers.
 */
async function progress(deps: ServiceDeps): Promise<string | undefined> {
  const script =
    `du -sm ${MODELS_DIR} 2>/dev/null | cut -f1; ` +
    `ls ${MODELS_DIR}/share/argos-translate/packages 2>/dev/null | wc -l`;
  const parts: string[] = [];
  const sizes = await deps.exec("docker", ["exec", CONTAINER, "sh", "-c", script], { timeoutMs: 10_000 });
  if (sizes.code === 0) {
    const [megabytes, pairs] = sizes.stdout.trim().split(/\s+/).map(Number);
    if (Number.isFinite(megabytes)) parts.push(`${megabytes} MB of models downloaded`);
    if (Number.isFinite(pairs) && pairs > 0) parts.push(`${pairs} language pairs`);
  }
  const logs = await deps.exec("docker", ["logs", "--tail", "1", CONTAINER], { timeoutMs: 10_000 });
  const last = `${logs.stdout}\n${logs.stderr}`
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .pop();
  if (last) parts.push(`last log: ${last.length > 100 ? `${last.slice(0, 99)}…` : last}`);
  return parts.length > 0 ? parts.join(", ") : undefined;
}

function buildServiceCommand(io: CliIo, deps: ServiceDeps, exit: { code: number }): CommandDef {
  const up = defineCommand({
    meta: {
      name: "up",
      description:
        "Start LibreTranslate in a Docker container, on 127.0.0.1, and wait until it answers. The first start " +
        "downloads the language models, kept in a volume for the next ones.",
    },
    args: {
      port: { type: "string", description: `Host port, on 127.0.0.1. Default: ${DEFAULT_SERVICE_PORT}.` },
      languages: {
        type: "string",
        description: "Load only these languages, e.g. en,pt,es (faster to start). Default: every language.",
      },
      image: { type: "string", description: `The image to run. Default: ${DEFAULT_IMAGE}.` },
      wait: { type: "boolean", default: true, description: "Wait for /health (--no-wait returns at once)." },
      timeout: { type: "string", description: `Seconds to wait for /health. Default: ${DEFAULT_WAIT_SECONDS}.` },
    },
    async run({ args }) {
      const port = parseIntFlag(args.port, "port", 1, 65535, DEFAULT_SERVICE_PORT);
      const timeout = parseIntFlag(args.timeout, "timeout", 1, 86_400, DEFAULT_WAIT_SECONDS);
      const languages = parseLanguages(args.languages);
      const image = args.image?.trim() || DEFAULT_IMAGE;

      const existing = await inspect(deps);
      let hostPort = port;
      if (existing) {
        hostPort = existing.port ?? port;
        const given = args.port !== undefined || args.languages !== undefined || args.image !== undefined;
        if (given) {
          io.stderr(
            `The '${CONTAINER}' container already exists: --port, --languages and --image apply when it is created. ` +
              "To recreate it: libretranslate service down --remove"
          );
        }
        if (existing.state === "running") {
          io.stdout(`LibreTranslate is already running at ${serviceUrl(hostPort)}.`);
        } else {
          await docker(deps, ["start", CONTAINER], `start the '${CONTAINER}' container`);
          io.stdout(`Started the existing '${CONTAINER}' container.`);
        }
      } else {
        if ((await deps.exec("docker", ["image", "inspect", image])).code !== 0) {
          io.stdout(`Pulling ${image}…`);
          if ((await attached(deps, ["pull", image])) !== 0) throw new Error(`Could not pull ${image}.`);
        }
        await docker(
          deps,
          [
            "run",
            "--detach",
            "--name",
            CONTAINER,
            "--publish",
            `127.0.0.1:${port}:5000`,
            "--volume",
            `${VOLUME}:${MODELS_DIR}`,
            "--label",
            "io.github.hoyasumii.libretranslate=service",
            image,
            ...(languages ? ["--load-only", languages] : []),
          ],
          `create the '${CONTAINER}' container`
        );
        io.stdout(`Created the '${CONTAINER}' container (${image}, models in the '${VOLUME}' volume).`);
      }

      rememberUrl(io, deps, hostPort);
      if (!args.wait) {
        io.stdout("Not waiting: follow it with `libretranslate service logs --follow`.");
        return;
      }
      io.stdout(`Waiting for ${serviceUrl(hostPort)}/health (the first start downloads the models)…`);
      if (!existing && !languages) {
        io.stdout(
          "Every language is loaded: the first start downloads several GB and can take a while. " +
            "--languages en,pt,es starts much faster (libretranslate service down --remove first, to recreate it)."
        );
      }
      const started = deps.now();
      const deadline = started + timeout * 1000;
      let reported = started;
      while (!(await healthy(deps, hostPort))) {
        const container = await inspect(deps);
        if (!container || container.state !== "running") {
          throw new Error(
            `The container stopped (${container?.state ?? "removed"}) before answering; see libretranslate service logs.`
          );
        }
        if (deps.now() >= deadline) {
          throw new Error(
            `No answer from /health within ${timeout}s. It may still be downloading models: ` +
              "libretranslate service logs --follow, then libretranslate service status."
          );
        }
        if (deps.now() - reported >= PROGRESS_EVERY_MS) {
          reported = deps.now();
          const elapsed = Math.round((reported - started) / 1000);
          const detail = await progress(deps);
          io.stderr(`Still starting (${elapsed}s)${detail ? `: ${detail}` : "…"}`);
        }
        await deps.sleep(2000);
      }
      io.stdout(`LibreTranslate is up at ${serviceUrl(hostPort)}.`);
    },
  });

  const down = defineCommand({
    meta: {
      name: "down",
      description: "Stop the LibreTranslate container. --remove also deletes it (the models volume is kept).",
    },
    args: {
      remove: { type: "boolean", description: "Delete the container after stopping it." },
    },
    async run({ args }) {
      const existing = await inspect(deps);
      if (!existing) {
        io.stdout(`There is no '${CONTAINER}' container.`);
        return;
      }
      if (existing.state === "running") {
        await docker(deps, ["stop", CONTAINER], `stop the '${CONTAINER}' container`);
        io.stdout(`Stopped the '${CONTAINER}' container.`);
      } else {
        io.stdout(`The '${CONTAINER}' container is not running (${existing.state}).`);
      }
      if (args.remove) {
        await docker(deps, ["rm", CONTAINER], `remove the '${CONTAINER}' container`);
        io.stdout(`Removed it. The models stay in the '${VOLUME}' volume (docker volume rm ${VOLUME} deletes them).`);
      }
    },
  });

  const status = defineCommand({
    meta: {
      name: "status",
      description:
        "Whether the LibreTranslate container exists, runs and answers (exit code 3 when it does not answer).",
    },
    async run() {
      const existing = await inspect(deps);
      if (!existing) {
        io.stdout(`not created  (libretranslate service up creates the '${CONTAINER}' container)`);
        exit.code = 3;
        return;
      }
      const port = existing.port;
      const answers = existing.state === "running" && port !== undefined && (await healthy(deps, port));
      io.stdout(
        [
          `container   ${CONTAINER} (${existing.state})`,
          `image       ${existing.image}`,
          `url         ${port === undefined ? "no published port" : serviceUrl(port)}`,
          `health      ${answers ? "ok" : existing.state === "running" ? "not answering yet" : "down"}`,
        ].join("\n")
      );
      if (!answers) exit.code = 3;
    },
  });

  const logs = defineCommand({
    meta: { name: "logs", description: "Print the LibreTranslate container's logs." },
    args: {
      follow: { type: "boolean", alias: "f", description: "Keep printing new lines (Ctrl+C to stop)." },
      tail: { type: "string", description: "How many of the last lines to print. Default: 100." },
    },
    async run({ args }) {
      const tail = parseIntFlag(args.tail, "tail", 0, 1_000_000, 100);
      if (!(await inspect(deps))) throw new CliInputError(`There is no '${CONTAINER}' container.`);
      const dockerArgs = ["logs", "--tail", String(tail), ...(args.follow ? ["--follow"] : []), CONTAINER];
      if (args.follow) {
        exit.code = await attached(deps, dockerArgs);
        return;
      }
      const result = await deps.exec("docker", dockerArgs);
      // The image logs to stderr; both streams are the log.
      const text = [result.stdout, result.stderr]
        .filter((part) => part.trim())
        .join("\n")
        .trimEnd();
      if (text) io.stdout(text);
      exit.code = result.code;
    },
  });

  return defineCommand({
    meta: {
      name: "service",
      description: "Run LibreTranslate locally in Docker: up, down, status, logs.",
    },
    subCommands: { up, down, status, logs },
  });
}

async function usageFor(main: CommandDef, argv: string[]): Promise<string> {
  const name = argv.find((arg) => !arg.startsWith("-"));
  const sub = name === undefined ? undefined : ((main.subCommands ?? {}) as Record<string, CommandDef>)[name];
  const usage = sub ? await renderUsage(sub, main) : await renderUsage(main);
  return usage.replace(/[ \t]+$/gm, "");
}

/**
 * `libretranslate service …`: LibreTranslate in a local Docker container. Everything, help included,
 * first checks that Docker is installed; every subcommand also checks that its daemon answers.
 */
export async function runServiceCli(argv: string[], io: CliIo, deps: ServiceDeps): Promise<number> {
  await requireDockerInstalled(deps);
  const exit = { code: 0 };
  const main = buildServiceCommand(io, deps, exit);
  if (argv.includes("--help") || argv.includes("-h") || argv.filter((arg) => !arg.startsWith("-")).length === 0) {
    io.stdout(await usageFor(main, argv));
    return 0;
  }
  await requireDockerDaemon(deps);
  try {
    await runCommand(main, { rawArgs: argv });
    return exit.code;
  } catch (error) {
    if (error instanceof Error && error.name === "CLIError") {
      io.stderr(`${await usageFor(main, argv)}\n\n${error.message}`);
      return 1;
    }
    throw error;
  }
}
