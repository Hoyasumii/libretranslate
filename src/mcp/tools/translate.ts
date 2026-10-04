import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Language } from "../../generated/model";
import { DetectBody, SuggestBody, TranslateBody, TranslateFileBody } from "../../generated/zod";
import { ToolInputError } from "../catalog";
import { READ, type ToolContext, WRITE, run } from "./shared";

/** `source` defaults to `auto` in the tools (the API itself requires it). */
const source = z.string().min(1).optional().describe("The source language code, or 'auto' (the default) to detect it.");

/** Language codes with their names, for a compact listing. */
function named(codes: readonly string[], byCode: Map<string, string>): string[] {
  return codes.map((code) => (byCode.has(code) ? `${code} (${byCode.get(code)})` : code));
}

/**
 * The languages, compact: when every source translates into the same targets (the usual case), the
 * targets are listed once instead of once per language.
 */
function summarizeLanguages(languages: Language[], from: string | undefined): unknown {
  const byCode = new Map(languages.map((language) => [language.code, language.name]));
  if (from) {
    const language = languages.find((candidate) => candidate.code.toLowerCase() === from.toLowerCase());
    if (!language) {
      throw new ToolInputError(`'${from}' is not a source language here. Sources: ${[...byCode.keys()].join(", ")}.`);
    }
    return { source: `${language.code} (${language.name})`, targets: named(language.targets, byCode) };
  }
  const key = (targets: readonly string[]) => [...targets].sort().join(",");
  const shared =
    languages.length > 0 && languages.every((language) => key(language.targets) === key(languages[0].targets));
  if (shared) {
    return {
      languages: languages.map((language) => `${language.code} (${language.name})`),
      targets: "Every language translates into every language listed.",
    };
  }
  return languages.map((language) => ({
    language: `${language.code} (${language.name})`,
    targets: language.targets.join(", "),
  }));
}

/** Where a translated file goes: `<dir>/<name>.<target><ext>` beside the original, unless `output` says. */
function outputPathFor(input: string, target: string, output: string | undefined, downloaded: string): string {
  if (output) return path.resolve(output);
  const ext = path.extname(downloaded) || path.extname(input);
  const base = path.basename(input, path.extname(input));
  return path.join(path.dirname(path.resolve(input)), `${base}.${target}${ext}`);
}

async function exists(file: string): Promise<boolean> {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

/** Translation, detection, languages, files, suggestions and the instance status. */
export function registerTranslateTools(server: McpServer, context: ToolContext): void {
  const { client } = context;

  const translateShape = TranslateBody.omit({ api_key: true }).shape;
  server.registerTool(
    "libretranslate_translate",
    {
      title: "Translate text",
      description:
        "Translate a text, or a list of texts in one call, into `target`. `source` defaults to 'auto' (the answer " +
        "then says which language was detected). format 'html' keeps the markup. alternatives > 0 adds other " +
        "possible translations. Mind the instance's character limit (libretranslate_status).",
      inputSchema: { ...translateShape, source },
      annotations: READ,
    },
    async ({ q, source: from, target, format, alternatives }) =>
      run(async () => {
        const params = { source: from ?? "auto", target, format, alternatives };
        return Array.isArray(q) ? client.translateMany({ ...params, q }) : client.translate({ ...params, q });
      })
  );

  server.registerTool(
    "libretranslate_detect",
    {
      title: "Detect a text's language",
      description: "The candidate languages of a text, most likely first, each with a confidence from 0 to 100.",
      inputSchema: DetectBody.omit({ api_key: true }).shape,
      annotations: READ,
    },
    async ({ q }) => run(() => client.detect(q))
  );

  server.registerTool(
    "libretranslate_languages",
    {
      title: "List the supported languages",
      description:
        "The language codes and names the instance supports. With `source`, the languages that one translates " +
        "into. Use the codes as source/target in libretranslate_translate.",
      inputSchema: {
        source: z.string().optional().describe("A source language code, to list only the targets it supports."),
      },
      annotations: READ,
    },
    async ({ source: from }) => run(async () => summarizeLanguages(await client.languages(), from))
  );

  const fileShape = TranslateFileBody.omit({ api_key: true, file: true }).shape;
  server.registerTool(
    "libretranslate_translate_file",
    {
      title: "Translate a file",
      description:
        "Translate a local document (the formats are in libretranslate_status, e.g. .txt, .docx, .pdf, .srt) and " +
        "save the result. By default it is written beside the original as <name>.<target><ext>; an existing file " +
        "is only replaced with overwrite: true.",
      inputSchema: {
        ...fileShape,
        source,
        path: z.string().min(1).describe("The local file to translate."),
        output: z.string().optional().describe("Where to save the translated file (default: beside the original)."),
        overwrite: z.boolean().optional().describe("Replace `output` if it exists (default false)."),
      },
      annotations: WRITE,
    },
    async ({ path: input, source: from, target, output, overwrite }) =>
      run(async () => {
        let data: Buffer;
        try {
          data = await fs.readFile(input);
        } catch (error) {
          throw new ToolInputError(`Cannot read '${input}': ${(error as Error).message}`);
        }
        if (output && !overwrite && (await exists(path.resolve(output)))) {
          throw new ToolInputError(`'${output}' already exists; pass overwrite: true to replace it.`);
        }
        const file = new File([new Uint8Array(data)], path.basename(input));
        const { translatedFileUrl } = await client.translateFile({ file, source: from ?? "auto", target });
        const downloaded = await client.downloadFile(translatedFileUrl);
        const savedTo = outputPathFor(input, target, output, downloaded.filename);
        if (!overwrite && (await exists(savedTo))) {
          throw new ToolInputError(
            `'${savedTo}' already exists; pass overwrite: true or another output. The translation is at ${translatedFileUrl}.`
          );
        }
        await fs.writeFile(savedTo, downloaded.data);
        return { savedTo, bytes: downloaded.data.byteLength, translatedFileUrl };
      })
  );

  server.registerTool(
    "libretranslate_suggest",
    {
      title: "Suggest a better translation",
      description:
        "Send a corrected translation of `q` (in `s`) back to the instance, which keeps it to improve its models. " +
        "Only when the user asks for it, and only on instances with suggestions enabled (libretranslate_status).",
      inputSchema: SuggestBody.omit({ api_key: true }).shape,
      annotations: WRITE,
    },
    async (params) => run(() => client.suggest(params))
  );

  server.registerTool(
    "libretranslate_status",
    {
      title: "Check the instance",
      description:
        "The instance's health and settings: whether an API key is required (and whether one is configured), " +
        "the character limit per request, file translation and its formats, and suggestions.",
      inputSchema: {},
      annotations: READ,
    },
    async () =>
      run(async () => {
        const [health, settings] = await Promise.all([client.health(), client.settings()]);
        return { url: client.baseUrl, apiKeyConfigured: client.hasApiKey, health: health.status, ...settings };
      })
  );
}
