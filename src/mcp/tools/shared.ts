import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { LibreTranslateClient } from "../../client";
import { errorResult } from "../errors";
import { toResultText } from "../invoke";

/** What every tool module needs. */
export interface ToolContext {
  client: LibreTranslateClient;
}

export const READ = { readOnlyHint: true, openWorldHint: true } as const;
export const WRITE = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: true,
} as const;

/** Runs a tool body, answering its result as JSON text or its error as text the model can act on. */
export async function run(work: () => Promise<unknown>): Promise<CallToolResult> {
  try {
    return { content: [{ type: "text", text: toResultText(await work()) }] };
  } catch (error) {
    return errorResult(error);
  }
}
