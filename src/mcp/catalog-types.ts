/** Shapes of `generated/catalog.json`, written by `scripts/build-mcp-catalog.ts`. */

/** `write` sends something the instance keeps (a suggestion): it needs `confirm: true`. */
export type OperationKind = "read" | "write";

/** A JSON Schema fragment as the spec writes it, `$ref`s pointing into {@link Catalog.schemas}. */
export type JsonSchema = Record<string, unknown>;

export interface CatalogOperation {
  /** The operationId, which is also the SDK's `client.call` name. */
  operationId: string;
  /** The spec's first tag, e.g. `translate`. */
  tag: string;
  http: string;
  path: string;
  summary: string;
  doc: string;
  kind: OperationKind;
  /** The JSON body, when the operation takes one. `api_key` is left out: the server adds its own. */
  body?: { required: boolean; schema: JsonSchema };
}

export interface Catalog {
  generatedFrom: string;
  operations: CatalogOperation[];
  /** Every `components.schemas` entry a body reaches, by name. */
  schemas: Record<string, JsonSchema>;
}
