const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

export const AUTH_TOKEN_KEY = "agroai_token";
export const USER_STORAGE_KEY = "agroai_user";

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
  stats: Omit<BackendTelemetry, "time">;
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
  token_type: string;
  user: BackendUser;
}

export function getStoredToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  requiresAuth = true,
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
