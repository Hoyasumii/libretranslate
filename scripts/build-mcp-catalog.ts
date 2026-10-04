/**
 * Builds `src/mcp/generated/catalog.json` from `spec/openapi.yml`: every operation the MCP's generic
 * tools may reach, its JSON body schema and whether it writes. Deterministic: the same spec gives the
 * same file. Run with `pnpm codegen:mcp` (`pnpm codegen` runs it too);
 * `tests/unit/mcp/catalog.test.ts` fails when the committed file is stale.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import type { Catalog, CatalogOperation, JsonSchema, OperationKind } from "../src/mcp/catalog-types";

const ROOT = join(__dirname, "..");
export const CATALOG_FILE = join(ROOT, "src/mcp/generated/catalog.json");
const SPEC_PATH = "spec/openapi.yml";

/**
 * Operations the generic tools never reach: a file upload is not JSON a model can write, so
 * `libretranslate_translate_file` (which reads a local path) covers it.
 */
const EXCLUDED = new Set<string>(["translateFile"]);

/** POSTs that only read: they send text and get a result back, keeping nothing. */
const READ_POSTS = new Set<string>(["translate", "detect"]);

// oxlint-disable-next-line typescript/no-explicit-any -- the spec is untyped YAML
type Any = any;

function kindOf(id: string, http: string): OperationKind {
  return http === "GET" || READ_POSTS.has(id) ? "read" : "write";
}

function firstLine(text: string | undefined): string {
  return (text ?? "").trim().split("\n")[0] ?? "";
}

function collectRefs(value: unknown, into: Set<string>): void {
  if (Array.isArray(value)) {
    for (const item of value) collectRefs(item, into);
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, inner] of Object.entries(value)) {
      if (key === "$ref" && typeof inner === "string") into.add(inner.replace("#/components/schemas/", ""));
      else collectRefs(inner, into);
    }
  }
}

/** A schema without the keys a model does not need, and without `api_key` (the server sends its own). */
function trimSchema(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(trimSchema);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, inner] of Object.entries(value)) {
      if (key === "example" || key === "examples") continue;
      if (key === "properties" && inner && typeof inner === "object") {
        const { api_key: _apiKey, ...rest } = inner as Record<string, unknown>;
        out[key] = trimSchema(rest);
        continue;
      }
      if (key === "required" && Array.isArray(inner)) {
        out[key] = inner.filter((name) => name !== "api_key");
        continue;
      }
      out[key] = trimSchema(inner);
    }
    return out;
  }
  return value;
}

export function buildCatalog(): Catalog {
  const spec: Any = parse(readFileSync(join(ROOT, SPEC_PATH), "utf8"));
  const operations: CatalogOperation[] = [];
  const roots = new Set<string>();

  for (const [path, item] of Object.entries<Any>(spec.paths)) {
    for (const method of ["get", "post", "put", "patch", "delete"]) {
      const o = item[method];
      if (!o) continue;
      const id = String(o.operationId);
      if (EXCLUDED.has(id)) continue;
      const http = method.toUpperCase();
      const entry: CatalogOperation = {
        operationId: id,
        tag: String(o.tags?.[0] ?? "default"),
        http,
        path,
        summary: firstLine(o.summary),
        doc: (o.description ?? "").trim(),
        kind: kindOf(id, http),
      };
      const json = o.requestBody?.content?.["application/json"];
      if (json) {
        const schema = trimSchema(json.schema ?? {}) as JsonSchema;
        collectRefs(schema, roots);
        entry.body = { required: Boolean(o.requestBody.required), schema };
      }
      operations.push(entry);
    }
  }

  // Close the set of schemas over their own references.
  const schemas: Record<string, JsonSchema> = {};
  const pending = [...roots];
  while (pending.length > 0) {
    const name = pending.pop() as string;
    if (schemas[name]) continue;
    const schema = spec.components.schemas[name];
    if (!schema) throw new Error(`schema ${name} is referenced but not defined`);
    schemas[name] = trimSchema(schema) as JsonSchema;
    const refs = new Set<string>();
    collectRefs(schemas[name], refs);
    for (const ref of refs) if (!schemas[ref]) pending.push(ref);
  }

  operations.sort((a, b) => a.operationId.localeCompare(b.operationId));
  const sortedSchemas: Record<string, JsonSchema> = {};
  for (const name of Object.keys(schemas).sort()) sortedSchemas[name] = schemas[name];
  return { generatedFrom: SPEC_PATH, operations, schemas: sortedSchemas };
}

export function renderCatalog(catalog: Catalog): string {
  return `${JSON.stringify(catalog, null, 1)}\n`;
}

if (require.main === module) {
  const catalog = buildCatalog();
  writeFileSync(CATALOG_FILE, renderCatalog(catalog));
  // oxlint-disable-next-line no-console -- the generator's report
  console.log(
    `${catalog.operations.length} operations, ${Object.keys(catalog.schemas).length} schemas → src/mcp/generated/catalog.json`
  );
}
