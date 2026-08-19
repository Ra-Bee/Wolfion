import { Capacitor, CapacitorHttp } from "@capacitor/core";

// Production API origin.
//
// On the web the app is served from wolfion.website and `/api/*` is a
// same-origin path that vercel.json proxies to the Render API, so plain
// relative URLs work. Inside the installed native app (Capacitor) the
// page origin is `https://localhost`, so a relative `/api/...` request
// hits nothing and every backend call silently fails (no Firebase token
// -> no cloud data). Native builds must therefore call the deployed API
// host directly. Those requests are sent via CapacitorHttp (the native
// HTTP layer), so they are NOT subject to browser CORS restrictions.
const NATIVE_API_ORIGIN = "https://wolfion-api-fqmu.onrender.com";

/** Build a full API URL for the current platform. */
export function apiUrl(path: string): string {
  const rel = `${import.meta.env.BASE_URL}api/${path.replace(/^\//, "")}`;
  return Capacitor.isNativePlatform() ? `${NATIVE_API_ORIGIN}${rel}` : rel;
}

export interface ApiResponse {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}

export interface ApiRequestInit {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
}

/**
 * Platform-aware fetch for the Wolfion backend. Uses the browser `fetch`
 * on the web and the native `CapacitorHttp` client inside the installed
 * app (which targets the deployed API and bypasses CORS). The returned
 * shape is a minimal subset of the `Response` API the callers rely on.
 */
export async function apiFetch(
  path: string,
  init: ApiRequestInit = {},
): Promise<ApiResponse> {
  const url = apiUrl(path);

  if (Capacitor.isNativePlatform()) {
    const res = await CapacitorHttp.request({
      url,
      method: init.method ?? "GET",
      headers: init.headers,
      data: init.body ? JSON.parse(init.body) : undefined,
    });
    return {
      ok: res.status >= 200 && res.status < 300,
      status: res.status,
      json: async () =>
        typeof res.data === "string" ? JSON.parse(res.data) : res.data,
    };
  }

  const res = await fetch(url, {
    method: init.method,
    headers: init.headers,
    body: init.body,
    signal: init.signal,
  });
  return {
    ok: res.ok,
    status: res.status,
    json: () => res.json() as Promise<unknown>,
  };
}
