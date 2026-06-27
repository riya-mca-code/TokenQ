const API_BASE_URL =
  window.API_BASE_URL ||
  (["localhost", "127.0.0.1", ""].includes(window.location.hostname)
    ? window.location.origin
    : "https://tokenq-backend.onrender.com");
const AUTH_KEY = "queueflow_jwt";

function getApiUrl(path) {
  return new URL(path, API_BASE_URL || window.location.origin).toString();
}

async function request(path, options = {}) {
  const headers = {};
  const token = sessionStorage.getItem(AUTH_KEY);

  if (options.body) headers["Content-Type"] = "application/json";
  if (options.auth && token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(getApiUrl(path), {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

async function login(username, password) {
  const data = await request("/api/auth/login", {
    method: "POST",
    body: { username, password },
  });

  sessionStorage.setItem(AUTH_KEY, data.token);
  return data;
}

async function ensureAuth(roleLabel) {
  if (sessionStorage.getItem(AUTH_KEY)) {
    try {
      await request("/api/auth/me", { auth: true });
      return sessionStorage.getItem(AUTH_KEY);
    } catch {
      sessionStorage.removeItem(AUTH_KEY);
    }
  }

  const username = prompt(`${roleLabel} username`);
  if (!username) return null;

  const password = prompt(`${roleLabel} password`);
  if (!password) return null;

  const data = await login(username, password);
  return data.token;
}

function createSocket() {
  if (!window.io) return null;
  return window.io(API_BASE_URL || window.location.origin, {
    path: "/socket.io",
    transports: ["websocket", "polling"],
  });
}

window.QueueAPI = { request, login, ensureAuth, AUTH_KEY, createSocket };
