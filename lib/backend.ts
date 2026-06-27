const apiBaseUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function getBackendBaseUrl() {
  return apiBaseUrl.replace(/\/$/, "");
}

export async function backendFetch(path: string, init: RequestInit = {}, token?: string) {
  return fetch(`${getBackendBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
}
