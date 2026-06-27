const API_BASE_URL =
  window.API_BASE_URL ||
  (["localhost", "127.0.0.1", ""].includes(window.location.hostname)
    ? window.location.origin
    : "https://tokenq-backend.onrender.com");
const AUTH_KEY = "queueflow_jwt";
const ORG_KEY = "queueflow_org";
const TENANT_KEY = "queueflow_tenant";
const SUPERADMIN_PATH = window.location.pathname.includes("superadmin.html");

function getApiUrl(path) {
  return new URL(path, API_BASE_URL || window.location.origin).toString();
}

function getCurrentOrgId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("org") || params.get("organizationId") || sessionStorage.getItem(ORG_KEY) || "";
}

async function resolveOrgId() {
  if (SUPERADMIN_PATH) return "";
  const existing = getCurrentOrgId();
  if (existing) {
    sessionStorage.setItem(ORG_KEY, existing);
    return existing;
  }

  const response = await fetch(getApiUrl("/api/public/bootstrap"));
  const data = await response.json().catch(() => ({}));
  const orgId = data.organizationId || "";
  if (orgId) sessionStorage.setItem(ORG_KEY, orgId);
  if (data.tenantToken) sessionStorage.setItem(TENANT_KEY, data.tenantToken);
  return orgId;
}

async function request(path, options = {}) {
  const headers = {};
  const token = sessionStorage.getItem(AUTH_KEY);
  const tenantToken = sessionStorage.getItem(TENANT_KEY);
  const isSuper = SUPERADMIN_PATH || path.startsWith("/api/super/");
  const skipOrg = isSuper || path.startsWith("/api/public/organizations/register") || path.startsWith("/api/public/bootstrap");
  const orgId = options.organizationId || (skipOrg ? "" : await resolveOrgId());
  const url = new URL(path, getApiUrl("/"));

  if (!options.auth && tenantToken && !isSuper && !path.startsWith("/api/auth/")) {
    headers["X-Tenant-Token"] = tenantToken;
  }

  if (orgId && !isSuper) {
    if ((options.method || "GET") === "GET") {
      url.searchParams.set("organizationId", orgId);
    } else if (path !== "/api/public/organizations/register" && path !== "/api/auth/login") {
      options.body = { ...(options.body || {}), organizationId: options.body?.organizationId || orgId };
    } else if (path === "/api/auth/login") {
      options.body = { ...(options.body || {}), organizationId: options.body?.organizationId || orgId };
    }
    headers["X-Organization-Id"] = orgId;
  }

  if (options.body) headers["Content-Type"] = "application/json";
  if (options.auth && token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url.toString(), {
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
    body: { email: username, password },
  });

  sessionStorage.setItem(AUTH_KEY, data.token);
  if (data.user?.organizationId) sessionStorage.setItem(ORG_KEY, data.user.organizationId);
  if (data.tenantToken) sessionStorage.setItem(TENANT_KEY, data.tenantToken);
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

  const email = prompt(`${roleLabel} email`);
  if (!email) return null;

  const password = prompt(`${roleLabel} password`);
  if (!password) return null;

  const data = await login(email, password);
  return data.token;
}

function createSocket() {
  if (!window.io) return null;
  return window.io(API_BASE_URL || window.location.origin, {
    path: "/socket.io",
    auth: {
      organizationId: SUPERADMIN_PATH ? "" : getCurrentOrgId(),
      role: SUPERADMIN_PATH ? "super_admin" : "customer",
    },
    transports: ["websocket", "polling"],
  });
}

async function registerOrganization(payload) {
  const data = await request("/api/public/organizations/register", {
    method: "POST",
    body: payload,
    organizationId: "",
  });
  if (data.organization?.id) sessionStorage.setItem(ORG_KEY, data.organization.id);
  if (data.token) sessionStorage.setItem(AUTH_KEY, data.token);
  if (data.tenantToken) sessionStorage.setItem(TENANT_KEY, data.tenantToken);
  return data;
}

window.QueueAPI = { request, login, ensureAuth, registerOrganization, AUTH_KEY, createSocket, getCurrentOrgId, resolveOrgId, ORG_KEY, TENANT_KEY, API_BASE_URL };
