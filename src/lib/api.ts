const defaultApiBaseUrl = import.meta.env.PROD
  ? `${window.location.origin}/api`
  : "http://localhost:8000/api";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? defaultApiBaseUrl;

export const USER_STORAGE_KEY = "agroai_user";
export const AUTH_INVALIDATED_EVENT = "agroai:auth-invalidated";

let accessToken: string | null = null;

export interface BackendUser {
  id: number;
  email: string;
  first_name: string;
  last_name?: string | null;
  is_active: boolean;
}

export interface BackendTelemetry {
  time: string;
  air?: number | null;
  light?: number | null;
  humidity?: number | null;
  temperature?: number | null;
  moisture?: number | null;
  soil_water_pump?: boolean | null;
  air_water_pump?: boolean | null;
  led?: boolean | null;
  fan?: boolean | null;
  ai_mode?: boolean | null;
}

export interface BackendGreenhouse {
  id: number;
  name: string;
  ai_mode?: boolean | null;
  mqtt_topic_id?: string | null;
  stats: Omit<BackendTelemetry, "time"> & { last_updated?: string | null };
}

export interface BackendDevice {
  id: number;
  greenhouse_id: number;
  type: "SENSOR" | "ACTUATOR";
  name: string;
  topic_root: string;
  min_value?: number | null;
  max_value?: number | null;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: BackendUser;
}

export function getStoredToken(): string | null {
  return accessToken;
}

export function getWebSocketUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL.replace(/^http/, "ws")}${normalizedPath}`;
}

export function setStoredToken(token: string) {
  accessToken = token;
}

export function clearStoredToken() {
  accessToken = null;
}

export function clearStoredUser() {
  localStorage.removeItem(USER_STORAGE_KEY);
}

export function invalidateStoredSession() {
  clearStoredToken();
  clearStoredUser();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_INVALIDATED_EVENT));
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  requiresAuth = true,
): Promise<T> {
  return apiFetchInternal<T>(path, init, requiresAuth, true);
}

async function refreshAccessToken(signal?: AbortSignal | null): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    signal,
    body: JSON.stringify({}),
  });
  if (!response.ok) return false;

  const data = await response.json() as {
    access_token: string;
    refresh_token: string;
  };
  setStoredToken(data.access_token);
  return true;
}

async function apiFetchInternal<T>(
  path: string,
  init: RequestInit = {},
  requiresAuth = true,
  allowRefresh = true,
): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (requiresAuth) {
    const token = getStoredToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: init.credentials ?? "include",
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    if (requiresAuth && response.status === 401) {
      if (allowRefresh && await refreshAccessToken(init.signal)) {
        return apiFetchInternal<T>(path, init, requiresAuth, false);
      }
      invalidateStoredSession();
    }

    const detail =
      typeof data === "object" && data !== null && "detail" in data
        ? typeof data.detail === "string"
          ? data.detail
          : JSON.stringify(data.detail)
        : typeof data === "string"
          ? data
          : response.statusText;
    throw new Error(detail || "Request failed");
  }

  return data as T;
}

export { isAbortError };
