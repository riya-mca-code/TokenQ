async function enforceRole(loginLabel, allowedRoles) {
  try {
    await window.QueueAPI.ensureAuth(loginLabel);
    const data = await window.QueueAPI.request("/api/auth/me", { auth: true });
    if (!allowedRoles.includes(data.user?.role)) {
      sessionStorage.removeItem(window.QueueAPI.AUTH_KEY);
      window.location.href = "index.html";
    }
  } catch {
    window.location.href = "index.html";
  }
}

window.RouteGuard = { enforceRole };
