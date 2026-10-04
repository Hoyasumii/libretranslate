import { LibreTranslateConfigError } from "./errors";
import * as endpoints from "./generated/endpoints";
import type {
  Detection,
  FrontendSettings,
  Health,
  Language,
  SuggestRequest,
  SuggestResponse,
  TranslateFileResponse,
  TranslateRequest,
  TranslateRequestFormat,
  TranslateResponse,
} from "./generated/model";
import { type DownloadedFile, type TransportConfig, type TransportInit, fetchFile } from "./transport";

/** The default timeout per request: a long text or a file can take a while on a CPU-only instance. */
export const DEFAULT_TIMEOUT_MS = 60_000;

export interface LibreTranslateClientOptions {
  /** The instance URL, with its base path if any (e.g. `http://localhost:5000`, `https://example.com/lt`). */
  baseUrl: string;
  /** The API key, for instances that issue keys (e.g. libretranslate.com). Sent in every request body. */
  apiKey?: string;
  /** Timeout per request, in ms (default 60000; `0` or `Infinity` turn it off). */
  timeoutMs?: number;
  /** An alternative `fetch` (tests, proxy). */
  fetch?: typeof fetch;
}

/** Per-call options: an `AbortSignal` to cancel the request. */
export interface CallOptions {
  signal?: AbortSignal;
}

interface TranslateParams {
  /** The source language code, or `auto` (the default) to detect it. */
  source?: string;
  /** The target language code. */
  target: string;
  /** `html` keeps the markup and translates only its text (default `text`). */
  format?: TranslateRequestFormat;
  /** How many alternative translations to return besides the main one (default 0). */
  alternatives?: number;
}

export interface TranslateTextParams extends TranslateParams {
  /** The text to translate. */
  q: string;
}

export interface TranslateManyParams extends TranslateParams {
  /** The texts to translate, in one request. */
  q: string[];
}

/** One text's translation. */
export interface TranslateTextResult {
  translatedText: string;
  /** When `source` was `auto`. */
  detectedLanguage?: Detection;
  /** When `alternatives` was above 0. */
  alternatives?: string[];
}

/** A list's translations, in the order of `q`. */
export interface TranslateManyResult {
  translatedText: string[];
  /** When `source` was `auto`: one per text. */
  detectedLanguage?: Detection[];
  /** When `alternatives` was above 0: one list per text. */
  alternatives?: string[][];
}

export interface TranslateFileParams {
  /** The document. A `Blob` needs `filename`: the instance picks the format by its extension. */
  file: Blob;
  /** The file name, with its extension (default: the `File`'s own name). */
  filename?: string;
  /** The source language code, or `auto` (the default) to detect it. */
  source?: string;
  target: string;
}

export type SuggestParams = Omit<SuggestRequest, "api_key">;

/** The operations, by operationId, as the spec defines them: what the MCP's generic tools reach. */
export type OperationId =
  | "translate"
  | "translateFile"
  | "detect"
  | "listLanguages"
  | "getFrontendSettings"
  | "suggest"
  | "health";

export interface LibreTranslateClient {
  /** The instance's normalized URL. */
  readonly baseUrl: string;
  /** Whether requests carry an API key. */
  readonly hasApiKey: boolean;
  /** Translates one text. */
  translate(params: TranslateTextParams, options?: CallOptions): Promise<TranslateTextResult>;
  /** Translates several texts in one request. */
  translateMany(params: TranslateManyParams, options?: CallOptions): Promise<TranslateManyResult>;
  /** The candidate languages of a text, most likely first. */
  detect(text: string, options?: CallOptions): Promise<Detection[]>;
  /** Every source language with the languages it translates into. */
  languages(options?: CallOptions): Promise<Language[]>;
  /** The instance settings: key required, character limit, file formats, suggestions. */
  settings(options?: CallOptions): Promise<FrontendSettings>;
  /** `{ status: "ok" }` when the instance is up. */
  health(options?: CallOptions): Promise<Health>;
  /** Sends a better translation back (the instance must enable suggestions). */
  suggest(params: SuggestParams, options?: CallOptions): Promise<SuggestResponse>;
  /** Uploads a document to translate; download the result from `translatedFileUrl` with {@link downloadFile}. */
  translateFile(params: TranslateFileParams, options?: CallOptions): Promise<TranslateFileResponse>;
  /** Downloads a translated file (or any URL on the instance) as bytes. */
  downloadFile(url: string, options?: CallOptions): Promise<DownloadedFile>;
  /**
   * Calls one operation by operationId with its raw request body, the API key added. The typed methods
   * above are the usual way; this is what the MCP's generic tools use.
   */
  call(operationId: OperationId, body?: unknown, options?: CallOptions): Promise<unknown>;
}

function normalizeBaseUrl(value: unknown): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new LibreTranslateConfigError("baseUrl is required (the LibreTranslate instance URL)");
  }
  const trimmed = value.trim();
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();
  } catch {
    throw new LibreTranslateConfigError(`invalid baseUrl: ${trimmed}`);
  }
  return trimmed.replace(/\/+$/, "");
}

/** Operations that take a request body; every one of them also takes `api_key` in it. */
const WITH_BODY = new Set<OperationId>(["translate", "translateFile", "detect", "suggest"]);

/**
 * Creates the client.
 *
 * ```ts
 * const lt = createLibreTranslateClient({ baseUrl: "http://localhost:5000" });
 * const { translatedText } = await lt.translate({ q: "Olá, mundo", source: "pt", target: "en" });
 * ```
 */
export function createLibreTranslateClient(options: LibreTranslateClientOptions): LibreTranslateClient {
  const baseUrl = normalizeBaseUrl(options?.baseUrl);
  const apiKey = options.apiKey?.trim() || undefined;
  const config: TransportConfig = {
    baseUrl,
    timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    fetch: options.fetch ?? ((input, init) => fetch(input, init)),
    secrets: apiKey ? [apiKey] : [],
  };
  const init = (call?: CallOptions): TransportInit => ({ transport: config, signal: call?.signal });
  const keyed = <T extends object>(body: T): T =>
    apiKey && !("api_key" in body) ? { ...body, api_key: apiKey } : body;

  const translateRaw = (params: TranslateParams & { q: string | string[] }, call?: CallOptions) => {
    const body: TranslateRequest = { ...params, source: params.source ?? "auto" };
    return endpoints.translate(keyed(body), init(call));
  };

  const fileOf = (params: TranslateFileParams): File => {
    const own = typeof File !== "undefined" && params.file instanceof File ? params.file.name : undefined;
    const name = params.filename ?? own;
    if (!name) throw new LibreTranslateConfigError("translateFile needs a filename (with its extension) for a Blob");
    return own === name ? (params.file as File) : new File([params.file], name, { type: params.file.type });
  };

  const client: LibreTranslateClient = {
    baseUrl,
    hasApiKey: apiKey !== undefined,
    translate: async (params, call) => (await translateRaw(params, call)) as TranslateResponse & TranslateTextResult,
    translateMany: async (params, call) =>
      (await translateRaw(params, call)) as TranslateResponse & TranslateManyResult,
    detect: (text, call) => endpoints.detect(keyed({ q: text }), init(call)),
    languages: (call) => endpoints.listLanguages(init(call)),
    settings: (call) => endpoints.getFrontendSettings(init(call)),
    health: (call) => endpoints.health(init(call)),
    suggest: (params, call) => endpoints.suggest(keyed({ ...params }), init(call)),
    translateFile: async (params, call) =>
      endpoints.translateFile(
        keyed({ file: fileOf(params), source: params.source ?? "auto", target: params.target }),
        init(call)
      ),
    downloadFile: (url, call) => fetchFile(url, config, call?.signal),
    call: (operationId, body, call) => {
      const fn = endpoints[operationId] as (...args: unknown[]) => Promise<unknown>;
      if (typeof fn !== "function") throw new LibreTranslateConfigError(`unknown operation '${operationId}'`);
      if (!WITH_BODY.has(operationId)) return fn(init(call));
      return fn(body && typeof body === "object" ? keyed(body as object) : body, init(call));
    },
  };
  return client;
}

/**
 * Creates the client from `LIBRETRANSLATE_URL` (default `http://localhost:5000`) and the optional
 * `LIBRETRANSLATE_API_KEY`.
 */
export function createLibreTranslateClientFromEnv(
  options: Partial<LibreTranslateClientOptions> & { env?: Record<string, string | undefined> } = {}
): LibreTranslateClient {
  const env = options.env ?? process.env;
  return createLibreTranslateClient({
    ...options,
    baseUrl: options.baseUrl ?? (env.LIBRETRANSLATE_URL || "http://localhost:5000"),
    apiKey: options.apiKey ?? env.LIBRETRANSLATE_API_KEY,
  });
}
