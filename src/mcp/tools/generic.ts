import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CATALOG, describeOperation, describeSchema, searchCatalog } from "../catalog";
import { invoke } from "../invoke";
import { type ToolContext, run } from "./shared";

/** `libretranslate_resources`, `libretranslate_describe` and `libretranslate_call`: the raw API through three tools. */
export function registerGenericTools(server: McpServer, context: ToolContext): void {
  const { client } = context;
  server.registerTool(
    "libretranslate_resources",
    {
      title: "List LibreTranslate API operations",
      description:
        `Discover the LibreTranslate HTTP API: ${CATALOG.operations.length} operations ` +
        `(${CATALOG.operations.map((op) => op.operationId).join(", ")}). Without a query, lists them all; with one, ` +
        "the matching ones. Use it when no dedicated libretranslate_* tool fits, then libretranslate_describe and " +
        "libretranslate_call.",
      inputSchema: { query: z.string().optional().describe("Words to match against names, paths and docs.") },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ query }) => run(async () => searchCatalog(query))
  );

  server.registerTool(
    "libretranslate_describe",
    {
      title: "Describe a LibreTranslate API operation or schema",
      description:
        "The full signature of one operation from libretranslate_resources — method, path, the body schema, an " +
        "example libretranslate_call input — or, with `schema`, one schema from the spec expanded.",
      inputSchema: {
        operation: z.string().optional().describe("The operationId (e.g. 'translate') or 'METHOD /path'."),
        schema: z.string().optional().describe("A schema name printed by a previous describe, e.g. 'Detection'."),
        depth: z
          .number()
          .int()
          .min(1)
          .max(6)
          .optional()
          .describe("How many levels of nested schemas to expand (default 3)."),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ operation, schema, depth }) =>
      run(async () => {
        if (schema) return describeSchema(schema, depth);
        if (!operation) return "Pass `operation` (or `schema`).";
        return describeOperation(operation, depth);
      })
  );

  server.registerTool(
    "libretranslate_call",
    {
      title: "Call a LibreTranslate API operation",
      description:
        "Call any operation from libretranslate_resources with its JSON `body`, as libretranslate_describe lists " +
        "it. The server adds the configured API key. Operations that write to the instance (suggest) need " +
        "confirm: true — ask the user first. Prefer the dedicated tools (libretranslate_translate, " +
        "libretranslate_detect, …) when one fits.",
      inputSchema: {
        operation: z.string().describe("The operationId, e.g. 'listLanguages'."),
        body: z.record(z.string(), z.unknown()).optional().describe("The JSON request body."),
        confirm: z.boolean().optional().describe("Must be true to run an operation that writes."),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async ({ operation, body, confirm }) => run(() => invoke(client, operation, { body, confirm }))
  );
}
