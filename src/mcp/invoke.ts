import type { LibreTranslateClient, OperationId } from "../client";
import { CATALOG, ToolInputError, findOperation } from "./catalog";

/** Characters of JSON a tool result carries before it is cut, to keep the model's context usable. */
export const MAX_RESULT_CHARS = 60_000;

export interface InvokeOptions {
  /** The JSON request body, as libretranslate_describe lists it. */
  body?: unknown;
  /** Required for operations that write to the instance (suggestions). */
  confirm?: boolean;
}

/**
 * Calls one catalog operation through `client.call`.
 *
 * Only catalog operations can be reached (file upload is not in it), a body is refused where the
 * operation takes none, `api_key` is refused (the client adds the configured one), unknown body
 * fields are refused, and writes need `confirm: true`.
 */
export async function invoke(
  client: LibreTranslateClient,
  operation: string,
  options: InvokeOptions = {}
): Promise<unknown> {
  const op = findOperation(operation);
  const name = op.operationId;
  const { body } = options;

  if (op.kind === "write" && options.confirm !== true) {
    throw new ToolInputError(`${name} writes to the instance; call again with confirm: true once the user has agreed.`);
  }
  if (!op.body) {
    if (body !== undefined) throw new ToolInputError(`${name} takes no body.`);
  } else {
    if (op.body.required && body === undefined) {
      throw new ToolInputError(`${name} needs a body. Use libretranslate_describe for its schema.`);
    }
    if (body !== undefined) {
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw new ToolInputError(`${name}'s body is a JSON object.`);
      }
      if ("api_key" in body) {
        throw new ToolInputError("Do not pass api_key: the server sends the configured key.");
      }
      checkFields(name, body as Record<string, unknown>, op.body.schema);
    }
  }
  const result = await client.call(name as OperationId, body);
  return result === undefined ? { ok: true } : result;
}

/** Refuses fields the body schema does not declare, and missing required ones. */
function checkFields(name: string, body: Record<string, unknown>, schema: Record<string, unknown>): void {
  const target = resolveRef(schema);
  const properties = target.properties as Record<string, unknown> | undefined;
  if (!properties) return;
  const known = Object.keys(properties);
  const unknown = Object.keys(body).filter((key) => !known.includes(key));
  if (unknown.length > 0) {
    throw new ToolInputError(
      `Unknown body field(s) for ${name}: ${unknown.join(", ")}. Expected: ${known.join(", ")}.`
    );
  }
  const missing = ((target.required as string[] | undefined) ?? []).filter(
    (key) => body[key] === undefined || body[key] === null || body[key] === ""
  );
  if (missing.length > 0) throw new ToolInputError(`${name} needs body.${missing.join(", body.")}.`);
}

function resolveRef(schema: Record<string, unknown>): Record<string, unknown> {
  const ref = typeof schema.$ref === "string" ? schema.$ref.replace("#/components/schemas/", "") : undefined;
  return ref ? (CATALOG.schemas[ref] ?? schema) : schema;
}

/** JSON for a tool result, cut at {@link MAX_RESULT_CHARS}. */
export function toResultText(value: unknown): string {
  const text = typeof value === "string" ? value : (JSON.stringify(value, null, 1) ?? "null");
  if (text.length <= MAX_RESULT_CHARS) return text;
  return (
    `${text.slice(0, MAX_RESULT_CHARS)}\n…[truncated: ${text.length} characters in total. ` +
    "Translate less text per call.]"
  );
}
