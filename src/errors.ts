/** Keys whose value never leaves the SDK in an error, a log or an exposed `body`. */
const SECRET_KEYS = new Set(["api_key", "apikey", "authorization", "token"]);
const MASK = "***";

/**
 * Minimum length of a secret for its literal occurrences to be masked: a short value (e.g. `k` in a
 * test) would erase bits of any message. Real API keys are much longer.
 */
const MIN_LITERAL_SECRET = 8;

/**
 * Copies `value`, replacing with `***` the values of sensitive keys and any literal occurrence of
 * the known secrets (`secrets`), inside strings too.
 */
export function redact(value: unknown, secrets: readonly string[] = []): unknown {
  const known = secrets.filter((s) => s.length >= MIN_LITERAL_SECRET);
  const walk = (v: unknown): unknown => {
    if (typeof v === "string") {
      let out = v;
      for (const s of known) out = out.split(s).join(MASK);
      return out;
    }
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object") {
      const out: Record<string, unknown> = {};
      for (const [k, inner] of Object.entries(v)) {
        out[k] = SECRET_KEYS.has(k.toLowerCase()) && inner != null ? MASK : walk(inner);
      }
      return out;
    }
    return v;
  };
  return walk(value);
}

interface LibreTranslateApiErrorInit {
  status: number;
  method: string;
  path: string;
  message: string;
  body?: unknown;
}

/** A non-2xx answer from the instance. LibreTranslate answers `{ "error": "<message>" }`. */
export class LibreTranslateApiError extends Error {
  override readonly name: string = "LibreTranslateApiError";
  readonly status: number;
  readonly method: string;
  /** The path without the query string. */
  readonly path: string;
  /** The response body, with the API key already masked. */
  readonly body?: unknown;

  constructor(init: LibreTranslateApiErrorInit) {
    super(`${init.method} ${init.path} → ${init.status}: ${init.message}`);
    this.status = init.status;
    this.method = init.method;
    this.path = init.path;
    this.body = init.body;
  }
}

/** Invalid configuration (missing URL, malformed URL). */
export class LibreTranslateConfigError extends Error {
  override readonly name = "LibreTranslateConfigError";
}

/** The request exceeded `timeoutMs`. */
export class LibreTranslateTimeoutError extends Error {
  override readonly name = "LibreTranslateTimeoutError";
  constructor(
    readonly method: string,
    readonly path: string,
    readonly timeoutMs: number
  ) {
    super(`${method} ${path}: no response within ${timeoutMs}ms`);
  }
}

/** Builds the error from the body of a non-2xx response: `{ error }`, or plain text. */
export function apiErrorFromBody(
  base: { status: number; method: string; path: string },
  body: unknown,
  secrets: readonly string[]
): LibreTranslateApiError {
  let message: string | undefined;
  if (body && typeof body === "object") {
    const error = (body as Record<string, unknown>).error;
    if (typeof error === "string") message = error;
  } else if (typeof body === "string" && body.trim()) {
    message = body.trim().slice(0, 500);
  }
  return new LibreTranslateApiError({
    ...base,
    message: redact(message ?? `HTTP ${base.status}`, secrets) as string,
    body: redact(body, secrets),
  });
}
