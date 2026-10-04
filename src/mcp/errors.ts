import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { LibreTranslateApiError, LibreTranslateConfigError, LibreTranslateTimeoutError } from "../errors";
import { ToolInputError } from "./catalog";

/** Whether the body has LibreTranslate's error shape, `{ "error": "<message>" }`. */
function fromLibreTranslate(error: LibreTranslateApiError): boolean {
  const body = error.body as { error?: unknown } | undefined;
  return typeof body === "object" && body !== null && typeof body.error === "string";
}

/** What to do about a status the model cannot fix by changing arguments. */
function hintFor(error: LibreTranslateApiError): string {
  if (!fromLibreTranslate(error) && error.status !== 429 && error.status < 500) {
    return (
      " (this answer is not LibreTranslate's: check LIBRETRANSLATE_URL. On macOS, the AirPlay Receiver answers on " +
      "port 5000 of `localhost`; use http://127.0.0.1:5000, or another port)"
    );
  }
  if (error.status === 400 && /api key/i.test(error.message)) {
    return " (this instance requires an API key: save one with `libretranslate mcp config`)";
  }
  if (error.status === 403) return " (the API key was refused: check LIBRETRANSLATE_API_KEY)";
  if (error.status === 429) return " (rate limited: wait a little and try again)";
  return "";
}

/** A thrown error as text the model can act on. */
export function describeError(error: unknown): string {
  if (error instanceof LibreTranslateApiError) {
    return `LibreTranslate answered ${error.status}${hintFor(error)}: ${error.message}`;
  }
  if (error instanceof LibreTranslateTimeoutError) return `${error.message} (send less text per call)`;
  if (error instanceof LibreTranslateConfigError) return error.message;
  if (error instanceof ToolInputError) return error.message;
  if (error instanceof TypeError && /fetch failed/i.test(error.message)) {
    const cause = (error as { cause?: { message?: string } }).cause?.message;
    return `Could not reach the LibreTranslate server: ${cause ?? error.message}`;
  }
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  return String(error);
}

export function errorResult(error: unknown): CallToolResult {
  return { isError: true, content: [{ type: "text", text: describeError(error) }] };
}
