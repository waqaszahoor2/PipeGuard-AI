const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? "";
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");
export const API_BASE = API_BASE_URL; // Backward compatibility alias

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!API_BASE_URL) {
    if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
      return `http://127.0.0.1:8000${normalizedPath}`;
    }
    return normalizedPath;
  }
  return `${API_BASE_URL}${normalizedPath}`;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string = "UNKNOWN_ERROR",
    public payload?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const targetUrl = buildApiUrl(path);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(targetUrl, {
      ...init,
      credentials: "include",
      signal: init?.signal ?? controller.signal,
      headers: {
        Accept: "application/json",
        ...(init?.headers ?? {})
      }
    });

    const contentType = response.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      let code = `HTTP_${response.status}`;
      let message = "The request could not be completed.";

      if (typeof payload === "object" && payload) {
        if ("code" in payload && typeof payload.code === "string") {
          code = payload.code;
        }
        if ("message" in payload && typeof payload.message === "string") {
          message = payload.message;
        } else if ("detail" in payload) {
          message = typeof payload.detail === "string" ? payload.detail : JSON.stringify(payload.detail);
        }
      }

      if (response.status === 404) {
        code = "NOT_FOUND";
        message = "Global pipeline API endpoint is unavailable or base URL is unconfigured.";
      } else if (response.status === 429) {
        code = "RATE_LIMITED";
        message = "Location search is temporarily busy. Try again shortly.";
      } else if (response.status === 502) {
        code = "BAD_GATEWAY";
        message = "Location provider returned an error.";
      } else if (response.status === 503) {
        code = "UNAVAILABLE";
        message = "Location search is temporarily unavailable.";
      } else if (response.status === 504) {
        code = "TIMEOUT";
        message = "The location provider did not respond in time.";
      }

      throw new ApiError(message, response.status, code, payload);
    }

    return payload as T;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    if (err instanceof Error && err.name === "AbortError") {
      throw new ApiError("The location provider did not respond in time.", 504, "TIMEOUT");
    }
    throw new ApiError("Network error or backend unavailable.", 0, "NETWORK_ERROR", err);
  } finally {
    clearTimeout(timer);
  }
}

export function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${encodeURIComponent(name)}=`;
  const item = document.cookie.split("; ").find((value) => value.startsWith(prefix));
  return item ? decodeURIComponent(item.slice(prefix.length)) : null;
}
