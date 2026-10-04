import { LibreTranslateConfigError, LibreTranslateTimeoutError, apiErrorFromBody } from "./errors";

/** What one client instance sends every request with. */
export interface TransportConfig {
  /** The instance URL without a trailing slash, with its base path if any. */
  baseUrl: string;
  /** Timeout per request, in ms; `0` or `Infinity` turn it off. */
  timeoutMs: number;
  fetch: typeof fetch;
  /** Values masked in every error (the API key). */
  secrets: readonly string[];
}

/**
 * The `RequestInit` the generated functions (src/generated/endpoints.ts) pass along, plus the client's
 * {@link TransportConfig}: the client binds it into every call's options.
 */
export type TransportInit = RequestInit & { transport?: TransportConfig };

/** A downloaded file: its bytes and what the server said about them. */
export interface DownloadedFile {
  data: Uint8Array;
  /** From `Content-Disposition`, else the URL's last segment. */
  filename: string;
  contentType: string;
}

/** `path` against the base URL; an absolute URL (a translated file's) is kept as is. */
function resolveUrl(config: TransportConfig, path: string): string {
  return /^https?:\/\//i.test(path) ? path : `${config.baseUrl}${path}`;
}

function pathOf(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url.split("?")[0];
  }
}

async function send(url: string, init: TransportInit): Promise<{ response: Response; method: string; path: string }> {
  const { transport: config, ...request } = init;
  if (!config) {
    throw new LibreTranslateConfigError(
      "no transport configuration: call the operations through createLibreTranslateClient()"
    );
  }
  const target = resolveUrl(config, url);
  const method = (request.method ?? "GET").toUpperCase();
  const path = pathOf(target);
  const limited = Number.isFinite(config.timeoutMs) && config.timeoutMs > 0;
  const timeout = limited ? AbortSignal.timeout(config.timeoutMs) : undefined;
  const signal = timeout && request.signal ? AbortSignal.any([timeout, request.signal]) : (timeout ?? request.signal);
  const headers = new Headers(request.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  try {
    const response = await config.fetch(target, { ...request, method, headers, signal });
    return { response, method, path };
  } catch (error) {
    if (timeout?.aborted) throw new LibreTranslateTimeoutError(method, path, config.timeoutMs);
    throw error;
  }
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text === "") return undefined;
  if ((response.headers.get("content-type") ?? "").includes("json")) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
  return text;
}

/**
 * orval's mutator: every generated operation sends through it. It resolves the path against the
 * instance URL, applies the timeout, parses the JSON answer and throws {@link LibreTranslateApiError}
 * on a non-2xx status, with the API key masked.
 */
export async function customFetch<T>(url: string, init: TransportInit): Promise<T> {
  const { response, method, path } = await send(url, init);
  const body = await readBody(response);
  if (!response.ok) {
    throw apiErrorFromBody({ status: response.status, method, path }, body, init.transport?.secrets ?? []);
  }
  return body as T;
}

function filenameOf(response: Response, url: string): string {
  const disposition = response.headers.get("content-disposition") ?? "";
  const star = /filename\*\s*=\s*(?:UTF-8'')?([^;]+)/i.exec(disposition);
  if (star) return decodeURIComponent(star[1].trim().replace(/^"|"$/g, ""));
  const plain = /filename\s*=\s*"?([^";]+)"?/i.exec(disposition);
  if (plain) return plain[1].trim();
  return decodeURIComponent(pathOf(url).split("/").filter(Boolean).pop() ?? "download");
}

/** GETs a file (e.g. a `translatedFileUrl`) as bytes. */
export async function fetchFile(url: string, config: TransportConfig, signal?: AbortSignal): Promise<DownloadedFile> {
  const { response, method, path } = await send(url, {
    method: "GET",
    headers: { Accept: "*/*" },
    signal,
    transport: config,
  });
  if (!response.ok) {
    throw apiErrorFromBody({ status: response.status, method, path }, await readBody(response), config.secrets);
  }
  return {
    data: new Uint8Array(await response.arrayBuffer()),
    filename: filenameOf(response, url),
    contentType: response.headers.get("content-type") ?? "application/octet-stream",
  };
}
