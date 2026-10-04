import catalogJson from "./generated/catalog.json";
import type { Catalog, CatalogOperation, JsonSchema } from "./catalog-types";

/** Every operation the generic tools reach, as `scripts/build-mcp-catalog.ts` read them off the spec. */
export const CATALOG: Catalog = catalogJson as unknown as Catalog;

const BY_NAME = new Map<string, CatalogOperation>();
for (const op of CATALOG.operations) {
  BY_NAME.set(op.operationId.toLowerCase(), op);
  BY_NAME.set(`${op.http} ${op.path}`.toLowerCase(), op);
}

/** Thrown for a request the model can fix by changing its arguments; its message is shown verbatim. */
export class ToolInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ToolInputError";
  }
}

/** An operation by operationId (`translate`) or by `METHOD /path` (`POST /translate`). */
export function findOperation(name: string): CatalogOperation {
  const found = BY_NAME.get(name.trim().toLowerCase());
  if (found) return found;
  throw new ToolInputError(
    `Unknown operation '${name}'. The operations are: ${CATALOG.operations.map((op) => op.operationId).join(", ")}.`
  );
}

function firstSentence(text: string): string {
  const match = /^(.+?[.!?])(\s|$)/.exec(text);
  const sentence = match ? match[1] : text;
  return sentence.length > 140 ? `${sentence.slice(0, 139)}…` : sentence;
}

function nameOf(op: CatalogOperation): string {
  return op.operationId;
}

/** Operations whose name, path, summary or docs match every word of `query`; every operation with none. */
export function searchCatalog(query?: string): string {
  const words = (query ?? "")
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 0);
  const matches = CATALOG.operations.filter((op) => {
    const haystack = [op.operationId, op.tag, op.path, op.summary, op.doc].join(" ").toLowerCase();
    return words.every((word) => haystack.includes(word));
  });
  if (matches.length === 0) return `No operation matches '${query}'. Try a shorter query, or none to list all.`;
  return [
    ...(words.length === 0
      ? [`${matches.length} operations (libretranslate_describe shows one's body, libretranslate_call runs it):`]
      : []),
    ...matches.map((op) => {
      const summary = op.summary || firstSentence(op.doc);
      return `- ${nameOf(op)} [${op.kind}] ${op.http} ${op.path}${summary ? ` — ${summary}` : ""}`;
    }),
  ].join("\n");
}

const MAX_RENDER_DEPTH = 6;

function refName(schema: JsonSchema): string | undefined {
  const ref = schema.$ref;
  return typeof ref === "string" ? ref.replace("#/components/schemas/", "") : undefined;
}

/**
 * A JSON Schema as a compact TypeScript-like type. `$ref`s expand up to `depth` levels; past that,
 * or on a cycle, they print as their schema name, which `libretranslate_describe` can expand on its own.
 */
export function renderSchema(schema: JsonSchema, depth = 3, indent = "", seen: readonly string[] = []): string {
  const ref = refName(schema);
  if (ref !== undefined) {
    const target = CATALOG.schemas[ref];
    if (!target || depth <= 0 || seen.includes(ref)) return ref;
    const inner = renderSchema(target, depth - 1, indent, [...seen, ref]);
    return /^[{"]/.test(inner) || inner.includes("|") ? `${inner} /* ${ref} */` : inner;
  }
  const variants = (schema.oneOf ?? schema.anyOf) as JsonSchema[] | undefined;
  if (Array.isArray(variants)) {
    const discriminator = (schema.discriminator as { propertyName?: string } | undefined)?.propertyName;
    const rendered = variants.map((v) => renderSchema(v, depth, `${indent}  `, seen));
    const head = discriminator ? `/* one of, by '${discriminator}' */ ` : "";
    return `${head}${rendered.join(`\n${indent}  | `)}`;
  }
  if (Array.isArray(schema.enum)) return (schema.enum as unknown[]).map((v) => JSON.stringify(v)).join(" | ");
  if (schema.type === "array") {
    const items = renderSchema((schema.items as JsonSchema) ?? {}, depth, indent, seen);
    return items.includes("\n") || items.includes("|") ? `Array<${items}>` : `${items}[]`;
  }
  const properties = schema.properties as Record<string, JsonSchema> | undefined;
  const additional = schema.additionalProperties as JsonSchema | boolean | undefined;
  if (properties || (additional && typeof additional === "object")) {
    const required = new Set((schema.required as string[] | undefined) ?? []);
    const lines: string[] = [];
    for (const [name, value] of Object.entries(properties ?? {})) {
      const doc = typeof value.description === "string" ? ` // ${firstSentence(value.description)}` : "";
      const type = renderSchema(value, depth, `${indent}  `, seen);
      lines.push(`${indent}  ${name}${required.has(name) ? "" : "?"}: ${type}${doc}`);
    }
    if (additional && typeof additional === "object") {
      lines.push(`${indent}  [key: string]: ${renderSchema(additional, depth, `${indent}  `, seen)}`);
    }
    if (lines.length === 0) return "{}";
    return `{\n${lines.join("\n")}\n${indent}}`;
  }
  if (schema.type === "integer" || schema.type === "number") return "number";
  if (typeof schema.type === "string") return schema.type;
  return "unknown";
}

/** Everything the model needs to call one operation through `libretranslate_call`. */
export function describeOperation(name: string, depth = 3): string {
  const op = findOperation(name);
  const lines: string[] = [`${nameOf(op)}  [${op.kind}]`, `${op.http} ${op.path}`];
  if (op.summary) lines.push("", op.summary);
  if (op.doc && op.doc !== op.summary) lines.push("", op.doc);
  if (op.body) {
    lines.push(
      "",
      `body${op.body.required ? "" : " (optional)"}:`,
      renderSchema(op.body.schema, Math.min(depth, MAX_RENDER_DEPTH)),
      "(The API key is added by the server: never pass api_key.)"
    );
  } else {
    lines.push("", "It takes no body.");
  }
  if (op.kind === "write") lines.push("", "Writes to the instance: libretranslate_call requires `confirm: true`.");
  lines.push(
    "",
    "Example libretranslate_call input:",
    JSON.stringify({
      operation: nameOf(op),
      ...(op.body?.required ? { body: {} } : {}),
      ...(op.kind === "write" ? { confirm: true } : {}),
    })
  );
  return lines.join("\n");
}

/** One schema from the spec, expanded `depth` levels. */
export function describeSchema(name: string, depth = 3): string {
  const schema = CATALOG.schemas[name];
  if (!schema) {
    const close = Object.keys(CATALOG.schemas)
      .filter((key) => key.toLowerCase().includes(name.toLowerCase()))
      .slice(0, 10);
    throw new ToolInputError(
      `Unknown schema '${name}'.${close.length > 0 ? ` Did you mean: ${close.join(", ")}?` : ""}`
    );
  }
  const doc = typeof schema.description === "string" ? `\n${schema.description}` : "";
  return `${name}${doc}\n${renderSchema(schema, Math.min(depth, MAX_RENDER_DEPTH), "", [name])}`;
}
