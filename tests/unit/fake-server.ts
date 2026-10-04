import { IncomingMessage, Server, createServer } from "node:http";
import { AddressInfo } from "node:net";

export interface Seen {
  method: string;
  path: string;
  search: string;
  contentType: string | null;
  body: string;
}

export type Handler = (req: Request, seen: Seen) => Response | Promise<Response>;

async function readBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks);
}

/** A local HTTP server (`node:http`) that records the requests and answers with `handler`. */
export class FakeLibreTranslate {
  readonly seen: Seen[] = [];
  handler: Handler;
  #server: Server;

  private constructor(handler: Handler) {
    this.handler = handler;
    this.#server = createServer((req, res) => {
      void (async () => {
        const url = new URL(req.url ?? "/", "http://127.0.0.1");
        const raw = await readBody(req);
        const contentType = req.headers["content-type"] ?? null;
        const seen: Seen = {
          method: req.method ?? "GET",
          path: url.pathname,
          search: url.search,
          contentType,
          body: raw.toString("utf8"),
        };
        this.seen.push(seen);
        const request = new Request(new URL(req.url ?? "/", this.url), {
          method: seen.method,
          headers: req.headers as Record<string, string>,
          body: seen.method === "GET" || seen.method === "HEAD" ? undefined : raw,
        });
        const response = await this.handler(request, seen);
        const headers: Record<string, string> = {};
        response.headers.forEach((value, key) => (headers[key] = value));
        res.writeHead(response.status, headers);
        res.end(Buffer.from(await response.arrayBuffer()));
      })().catch((error: unknown) => {
        res.writeHead(500).end(String(error));
      });
    });
  }

  /** Starts the server on a free port of 127.0.0.1. */
  static async start(handler: Handler = libreTranslate()): Promise<FakeLibreTranslate> {
    const fake = new FakeLibreTranslate(handler);
    await new Promise<void>((resolve) => fake.#server.listen(0, "127.0.0.1", resolve));
    return fake;
  }

  get url(): string {
    return `http://127.0.0.1:${(this.#server.address() as AddressInfo).port}`;
  }

  count(path: string): number {
    return this.seen.filter((s) => s.path === path).length;
  }

  /** The last JSON body sent to `path`. */
  lastJson(path: string): Record<string, unknown> {
    const hit = [...this.seen].reverse().find((s) => s.path === path);
    if (!hit) throw new Error(`no request to ${path}`);
    return JSON.parse(hit.body) as Record<string, unknown>;
  }

  stop(): Promise<void> {
    this.#server.closeAllConnections();
    return new Promise((resolve) => this.#server.close(() => resolve()));
  }
}

export const json = (body: unknown, status = 200) => Response.json(body, { status });
export const apiError = (status: number, error: string) => json({ error }, status);

export const LANGUAGES = [
  { code: "en", name: "English", targets: ["en", "es", "pt"] },
  { code: "es", name: "Spanish", targets: ["en", "es", "pt"] },
  { code: "pt", name: "Portuguese", targets: ["en", "es", "pt"] },
];

export const SETTINGS = {
  apiKeys: true,
  keyRequired: false,
  charLimit: 2000,
  filesTranslation: true,
  frontendTimeout: 500,
  suggestions: true,
  supportedFilesFormat: [".txt", ".docx"],
  language: { source: { code: "auto", name: "Auto Detect" }, target: { code: "en", name: "English" } },
};

/** A toy dictionary: enough to tell the texts apart in assertions. */
const WORDS: Record<string, string> = { olá: "hello", mundo: "world", hola: "hello" };
const translateText = (text: string, target: string) =>
  `[${target}] ${text
    .split(/\s+/)
    .map((word) => WORDS[word.toLowerCase()] ?? word)
    .join(" ")}`;

export interface FakeOptions {
  /** When set, every keyed request must carry this `api_key` (400 without, 403 when wrong). */
  requireKey?: string;
}

/**
 * A handler behaving like a LibreTranslate instance, from its documented API: translate (text and
 * lists, `auto`, alternatives), detect, languages, settings, health, suggest, translate_file and the
 * download of its result.
 */
export function libreTranslate(options: FakeOptions = {}): Handler {
  const files = new Map<string, { name: string; data: Buffer }>();
  const checkKey = (key: unknown): Response | undefined => {
    if (!options.requireKey) return undefined;
    if (!key) return apiError(400, "Visit the portal to get an API key");
    if (key !== options.requireKey) return apiError(403, "Invalid API key");
    return undefined;
  };
  return async (req, seen) => {
    if (seen.method === "GET" && seen.path === "/languages") return json(LANGUAGES);
    if (seen.method === "GET" && seen.path === "/frontend/settings") {
      return json({ ...SETTINGS, keyRequired: !!options.requireKey });
    }
    if (seen.method === "GET" && seen.path === "/health") return json({ status: "ok" });
    if (seen.method === "GET" && seen.path.startsWith("/download_file/")) {
      const file = files.get(seen.path.slice("/download_file/".length));
      if (!file) return apiError(404, "Not found");
      return new Response(file.data, {
        headers: { "content-type": "text/plain", "content-disposition": `attachment; filename="${file.name}"` },
      });
    }
    if (seen.method === "POST" && seen.path === "/translate_file") {
      const form = await req.formData();
      const denied = checkKey(form.get("api_key"));
      if (denied) return denied;
      const file = form.get("file");
      const target = String(form.get("target") ?? "");
      if (!(file instanceof Blob) || !target) return apiError(400, "Invalid request: missing file or target");
      const name = (file as File).name;
      if (!/\.(txt|docx)$/.test(name)) return apiError(400, `${name.split(".").pop()} format is not supported`);
      const id = `${files.size + 1}.${name.replace(/(\.[^.]+)$/, `.${target}$1`)}`;
      files.set(id, { name: id, data: Buffer.from(translateText(await file.text(), target)) });
      return json({ translatedFileUrl: `${new URL(req.url).origin}/download_file/${id}` });
    }
    if (seen.method !== "POST") return apiError(404, "Not found");

    const body = JSON.parse(seen.body || "{}") as Record<string, unknown>;
    const denied = checkKey(body.api_key);
    if (denied) return denied;
    if (seen.path === "/translate") {
      const { q, source, target, alternatives } = body as {
        q?: string | string[];
        source?: string;
        target?: string;
        alternatives?: number;
      };
      if (q === undefined) return apiError(400, "Invalid request: missing q parameter");
      if (!source) return apiError(400, "Invalid request: missing source parameter");
      if (!target) return apiError(400, "Invalid request: missing target parameter");
      const one = (text: string) => ({
        translatedText: translateText(text, target),
        ...(source === "auto" ? { detectedLanguage: { language: "pt", confidence: 90 } } : {}),
        ...(alternatives ? { alternatives: Array.from({ length: alternatives }, (_, i) => `alt${i + 1}`) } : {}),
      });
      if (!Array.isArray(q)) return json(one(q));
      const each = q.map(one);
      return json({
        translatedText: each.map((r) => r.translatedText),
        ...(source === "auto" ? { detectedLanguage: each.map((r) => r.detectedLanguage) } : {}),
        ...(alternatives ? { alternatives: each.map((r) => r.alternatives) } : {}),
      });
    }
    if (seen.path === "/detect") {
      if (typeof body.q !== "string") return apiError(400, "Invalid request: missing q parameter");
      return json([
        { language: "pt", confidence: 90 },
        { language: "es", confidence: 10 },
      ]);
    }
    if (seen.path === "/suggest") return json({ success: true });
    return apiError(404, "Not found");
  };
}
