/**
 * AIRIS API client.
 *
 * Single place where the FastAPI base URL is resolved. When
 * NEXT_PUBLIC_API_BASE_URL is empty the whole app runs against the mock
 * services in src/lib/mock — every api module branches on `mockMode`.
 */

export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  wsUrl: process.env.NEXT_PUBLIC_WS_URL ?? "",
  get mockMode(): boolean {
    return this.baseUrl === "";
  },
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
}

/** Typed fetch wrapper for the future FastAPI endpoints. */
export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const res = await fetch(`${apiConfig.baseUrl}${path}`, {
    method: opts.method ?? "GET",
    headers: { "Content-Type": "application/json" },
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    signal: opts.signal,
    cache: "no-store",
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const data = (await res.json()) as { detail?: string };
      if (data?.detail) message = String(data.detail);
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, message);
  }

  return (await res.json()) as T;
}

/** Simulated network latency so loading states are exercised in demo mode. */
export function mockLatency<T>(value: T | PromiseLike<T>, ms?: number): Promise<T> {
  const delay = ms ?? 220 + Math.random() * 260;
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      Promise.resolve(value).then(resolve, reject);
    }, delay);
  });
}
