import { getBackendBaseUrl } from "@/lib/backend";

export async function proxyQueueRequest(path: string, method: string, token?: string, body?: unknown) {
  return fetch(`${getBackendBaseUrl()}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    cache: "no-store",
  });
}
