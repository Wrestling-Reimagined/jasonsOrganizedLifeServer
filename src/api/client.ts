import { clearToken, getToken } from "../lib/storage";

const baseUrl = import.meta.env.VITE_API_URL ?? "/api";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  authenticated?: boolean;
};

export async function apiRequest<T>(path: string, options?: RequestOptions): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options?.authenticated !== false && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method: options?.method ?? "GET",
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 401) {
    clearToken();
  }

  if (!response.ok) {
    const errorData = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorData?.message ?? "Request failed.");
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}
