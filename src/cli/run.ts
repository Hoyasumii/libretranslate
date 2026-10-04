import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ArgsDef, CommandDef, defineCommand, renderUsage, runCommand } from "citty";
import { DOCS_URL, SERVER_VERSION } from "../mcp/build";
import { configFilePath } from "../mcp/config";
import { ConnectOptions, LibreTranslateMcpConnection, connectLibreTranslateMcp } from "./connect";
import { requireSavedConfig, runMcpCli } from "./mcp";
import { McpDeps, defaultMcpDeps } from "./mcp/deps";
import { CliInputError, ToolInputSchema, argsFromSchema, commandName, toolArguments } from "./schema-args";
import { defaultServiceDeps, dockerInstalled, runServiceCli, type ServiceDeps } from "./service";

export interface CliIo {
  stdout(text: string): void;
  stderr(text: string): void;
  env: Record<string, string | undefined>;
}

/** Connection flags, accepted anywhere on the command line and removed before citty parses the rest. */
const GLOBAL_FLAGS: Record<string, keyof ConnectOptions> = {
  "--url": "url",
  "--base-url": "baseUrl",
  "--api-key": "apiKey",
};

const GLOBAL_ARGS: ArgsDef = {
  url: {
    type: "string",
    description: "A running libretranslate-mcp endpoint (env LIBRETRANSLATE_MCP_URL). Default: in-process server.",
  },
  "base-url": {
    type: "string",
    description: "LibreTranslate instance for the in-process server (env LIBRETRANSLATE_URL).",
  },
  "api-key": {
    type: "string",
    description: "LibreTranslate API key for the in-process server (env LIBRETRANSLATE_API_KEY).",
  },
};

export function splitGlobalFlags(argv: string[]): { options: ConnectOptions; rest: string[] } {
  const options: ConnectOptions = {};
  const rest: string[] = [];
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    const [flag, inline] = arg.split(/=(.*)/s, 2);
    const key = GLOBAL_FLAGS[flag];
    if (key === undefined) {
      rest.push(arg);
      continue;
    }
    const value = inline ?? argv[++index];
    if (value === undefined) throw new CliInputError(`${flag} needs a value.`);
    options[key] = value;
  }
  return { options, rest };
}

function textOf(content: unknown): string {
  return ((content as { type: string; text?: string }[] | undefined) ?? [])
    .map((part) => (part.type === "text" ? (part.text ?? "") : `[${part.type} content]`))
    .join("\n");
}

/**
 * `brief` describes the tool by its title, for the root usage: citty pads every column to its widest
 * cell, so one full description there would pad every line past the terminal's width.
 */
function toolCommand(connection: LibreTranslateMcpConnection, tool: Tool, io: CliIo, brief: boolean): CommandDef {
  const schema = tool.inputSchema as ToolInputSchema;
  const description = brief ? (tool.title ?? tool.description) : (tool.description ?? tool.title);
  return defineCommand({
    meta: { name: commandName(tool.name), description: description ?? tool.name },
    args: argsFromSchema(schema),
    async run({ args }) {
      const toolArgs = toolArguments(schema, args);
      const result = await connection.client.callTool({ name: tool.name, arguments: toolArgs });
      const text = textOf(result.content);
      // The tool's own error text is already the message to show; the outer catch prints it.
      if (result.isError) throw new Error(text);
      io.stdout(text);
    },
  });
}

/**
 * `withService` lists `libretranslate service` in the usage: only when Docker is installed, so
 * whoever cannot run it never sees it.
 */
function buildMain(
  connection: LibreTranslateMcpConnection,
  tools: Tool[],
  io: CliIo,
  brief = false,
  withService = false
): CommandDef {
  const subCommands: Record<string, CommandDef> = {
    tools: defineCommand({
      meta: { name: "tools", description: "List the tools the LibreTranslate MCP server offers, as CLI commands." },
      run() {
        const width = Math.max(...tools.map((tool) => commandName(tool.name).length));
        io.stdout(
          tools
            .map((tool) => `${commandName(tool.name).padEnd(width)}  ${tool.title ?? tool.description ?? ""}`)
            .join("\n")
        );
      },
    }),
  };
  for (const tool of tools) subCommands[commandName(tool.name)] = toolCommand(connection, tool, io, brief);
  return defineCommand({
    meta: {
      name: "libretranslate",
      version: SERVER_VERSION,
      description: "LibreTranslate from the terminal, through the LibreTranslate MCP server's tools.",
    },
    args: GLOBAL_ARGS,
    subCommands: {
      mcp: defineCommand({
        meta: {
          name: "mcp",
          description:
            "Run and configure the LibreTranslate MCP server: config, start, stop, status, boot, install, uninstall.",
        },
      }),
      docs: defineCommand({
        meta: { name: "docs", description: `Open the documentation (${DOCS_URL}) in the browser.` },
      }),
      ...(withService
        ? {
            service: defineCommand({
              meta: { name: "service", description: "Run LibreTranslate locally in Docker: up, down, status, logs." },
            }),
          }
        : {}),
      ...subCommands,
    },
  });
}

/**
 * The subcommand the first non-flag argument names, for usage output; the root lists the tools by
 * `briefMain`'s titles. Trailing padding is dropped, since citty pads the last column too.
 */
async function usageFor(main: CommandDef, briefMain: CommandDef, argv: string[]): Promise<string> {
  const name = argv.find((arg) => !arg.startsWith("-"));
  const subCommands = (main.subCommands ?? {}) as Record<string, CommandDef>;
  const sub = name === undefined ? undefined : subCommands[name];
  const usage = sub ? await renderUsage(sub, main) : await renderUsage(briefMain);
  return usage.replace(/[ \t]+$/gm, "");
}

/**
 * Run the `libretranslate` CLI and answer its exit code. Every MCP tool becomes a subcommand
 * (`libretranslate_translate` → `translate`) whose flags come from the tool's input schema;
 * `libretranslate mcp …` manages the server itself (see `./mcp`), `libretranslate service …` runs LibreTranslate in
 * Docker when Docker is installed (see `./service`), and `libretranslate docs` opens the documentation site.
 *
 * The in-process server takes each setting from the flag, then the environment, then the
 * configuration `libretranslate mcp config` saved.
 */
export async function runCli(
  argv: string[],
  io: CliIo,
  deps: Partial<McpDeps> = {},
  serviceDeps: Partial<ServiceDeps> = {}
): Promise<number> {
  let connection: LibreTranslateMcpConnection | undefined;
  try {
    const { options, rest } = splitGlobalFlags(argv);
    const commandAt = rest.findIndex((arg) => !arg.startsWith("-"));
    if (rest[commandAt] === "mcp") {
      const mcpArgs = [...rest.slice(0, commandAt), ...rest.slice(commandAt + 1)];
      return await runMcpCli(mcpArgs, options, io, { ...defaultMcpDeps(), ...deps });
    }
    // Like `docs`, it needs no saved configuration: it is how a local instance gets started in the first place.
    if (rest[commandAt] === "service") {
      const allDeps = { ...defaultMcpDeps(), ...deps };
      const serviceArgs = [...rest.slice(0, commandAt), ...rest.slice(commandAt + 1)];
      return await runServiceCli(serviceArgs, io, { ...defaultServiceDeps(allDeps), ...serviceDeps });
    }
    const helpFlag = rest.includes("--help") || rest.includes("-h");
    // Like usage, the documentation needs no saved configuration and no server.
    if (rest[commandAt] === "docs" && !helpFlag) {
      io.stdout(DOCS_URL);
      const openBrowser = deps.openBrowser ?? defaultMcpDeps().openBrowser;
      await openBrowser(DOCS_URL).catch(() => io.stderr("Could not open a browser; open the link above."));
      return 0;
    }
    const wantsUsage = helpFlag || rest.length === 0 || (rest.length === 1 && rest[0] === "--version");
    // Nothing but usage runs before `libretranslate mcp config` has saved a configuration, whatever flags or
    // environment say; the check comes before connecting, so not even `--url` reaches a server.
    const configFile = configFilePath(io.env, deps.platform);
    const saved = wantsUsage ? {} : requireSavedConfig(configFile);
    connection = await connectLibreTranslateMcp({
      url: options.url ?? io.env.LIBRETRANSLATE_MCP_URL,
      baseUrl: options.baseUrl ?? (io.env.LIBRETRANSLATE_URL || saved.LIBRETRANSLATE_URL),
      apiKey: options.apiKey ?? (io.env.LIBRETRANSLATE_API_KEY || saved.LIBRETRANSLATE_API_KEY),
    });
    const { tools } = await connection.client.listTools();
    // Probing Docker costs a process spawn: only the usage, which is where `service` would show, pays it.
    const withService = wantsUsage && (await dockerInstalled({ ...defaultMcpDeps(), ...deps }));
    const main = buildMain(connection, tools, io, false, withService);
    const briefMain = buildMain(connection, tools, io, true, withService);

    if (rest.includes("--help") || rest.includes("-h") || rest.length === 0) {
      io.stdout(await usageFor(main, briefMain, rest));
      return 0;
    }
    if (rest.length === 1 && rest[0] === "--version") {
      io.stdout(SERVER_VERSION);
      return 0;
    }
    try {
      await runCommand(main, { rawArgs: rest });
      return 0;
    } catch (error) {
      // citty's own usage errors (unknown command, missing required flag); its class is not exported.
      if (error instanceof Error && error.name === "CLIError") {
        io.stderr(`${await usageFor(main, briefMain, rest)}\n\n${error.message}`);
        return 1;
      }
      throw error;
    }
  } catch (error) {
    io.stderr(error instanceof Error ? error.message : String(error));
    return 1;
  } finally {
    await connection?.close();
  }
}
