import * as fs from "node:fs";
import { CATALOG_FILE, buildCatalog, renderCatalog } from "../../../scripts/build-mcp-catalog";
import * as endpoints from "../../../src/generated/endpoints";
import {
  CATALOG,
  describeOperation,
  describeSchema,
  findOperation,
  renderSchema,
  searchCatalog,
} from "../../../src/mcp/catalog";

describe("MCP catalog", () => {
  it("is up to date with the spec (run `pnpm codegen:mcp` when this fails)", () => {
    expect(fs.readFileSync(CATALOG_FILE, "utf8")).toBe(renderCatalog(buildCatalog()));
  });

  it("covers every generated operation but the file upload", () => {
    const generated = Object.entries(endpoints)
      .filter(([name, value]) => typeof value === "function" && !/^get.*Url$/.test(name))
      .map(([name]) => name)
      .sort();
    const reached = CATALOG.operations.map((op) => op.operationId).sort();
    expect(generated.filter((id) => !reached.includes(id))).toEqual(["translateFile"]);
    expect(reached.filter((id) => !generated.includes(id))).toEqual([]);
  });

  it("marks only suggestions as writes, and keeps api_key out of every body", () => {
    const kinds = Object.fromEntries(CATALOG.operations.map((op) => [op.operationId, op.kind]));
    expect(kinds).toEqual({
      detect: "read",
      getFrontendSettings: "read",
      health: "read",
      listLanguages: "read",
      suggest: "write",
      translate: "read",
    });
    expect(JSON.stringify(CATALOG)).not.toContain("api_key");
  });

  it("finds an operation by operationId or METHOD /path", () => {
    expect(findOperation("Translate").path).toBe("/translate");
    expect(findOperation("get /languages").operationId).toBe("listLanguages");
    expect(() => findOperation("nope")).toThrow("Unknown operation 'nope'. The operations are: detect");
  });

  it("searches by words and lists every operation without a query", () => {
    expect(searchCatalog()).toContain("6 operations");
    expect(searchCatalog("language")).toContain("- listLanguages [read] GET /languages");
    expect(searchCatalog("zzz-nothing")).toContain("No operation matches");
  });

  it("describes the body and an example call", () => {
    const text = describeOperation("translate");
    expect(text).toContain("POST /translate");
    expect(text).toContain("q: string\n    | string[]");
    expect(text).toContain('format?: "text" | "html"');
    expect(text).toContain('"operation":"translate","body":{}');
    expect(describeOperation("suggest")).toContain("libretranslate_call requires `confirm: true`");
    expect(describeOperation("health")).toContain("It takes no body.");
  });

  it("renders schemas, stopping at the requested depth", () => {
    expect(renderSchema({ type: "array", items: { type: "string" } })).toBe("string[]");
    expect(renderSchema({ $ref: "#/components/schemas/LanguageCode" }, 0)).toBe("LanguageCode");
    expect(describeSchema("TranslateRequest")).toContain("target: string");
    expect(() => describeSchema("NoSuchSchema")).toThrow("Unknown schema");
  });
});
