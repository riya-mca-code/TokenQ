const superLoginForm = document.getElementById("superLoginForm");
const superEmail = document.getElementById("superEmail");
const superPassword = document.getElementById("superPassword");
const superLoginState = document.getElementById("superLoginState");
const superDashboard = document.getElementById("superDashboard");
const superDashboardBody = document.getElementById("superDashboardBody");
const superAdminBody = document.getElementById("superAdminBody");
const superLogs = document.getElementById("superLogs");
const orgList = document.getElementById("orgList");
const adminForm = document.getElementById("adminForm");
const adminOrgId = document.getElementById("adminOrgId");
const adminName = document.getElementById("adminName");
const adminEmail = document.getElementById("adminEmail");
const adminPhone = document.getElementById("adminPhone");
const adminPassword = document.getElementById("adminPassword");
const adminList = document.getElementById("adminList");
const auditLogs = document.getElementById("auditLogs");
const sysOrganizations = document.getElementById("sysOrganizations");
const sysUsers = document.getElementById("sysUsers");
const sysQueueItems = document.getElementById("sysQueueItems");
const sysAuditLogs = document.getElementById("sysAuditLogs");

function setState(type, message) {
  superLoginState.className = `state state-${type}`;
  superLoginState.textContent = message;
}

function showDashboard() {
  superDashboard.classList.remove("hidden");
  superDashboardBody.classList.remove("hidden");
  superAdminBody.classList.remove("hidden");
  superLogs.classList.remove("hidden");
}

async function loadDashboard() {
  const [orgs, analytics, logs] = await Promise.all([
    window.QueueAPI.request("/api/super/organizations", { auth: true }),
    window.QueueAPI.request("/api/super/analytics", { auth: true }),
    window.QueueAPI.request("/api/super/audit-logs", { auth: true }),
  ]);

  const organizations = orgs.organizations || [];
  orgList.innerHTML =
    organizations
      .map(
        (org) => `
        <div class="chip">
          <span>${org.businessName} · ${org.status}</span>
          <button class="btn btn-primary" data-org="${org.id}" data-action="toggle">Suspend/Activate</button>
        </div>
      `
      )
      .join("") || "No organizations yet.";

  sysOrganizations.textContent = analytics.totals.organizations;
  sysUsers.textContent = analytics.totals.users;
  sysQueueItems.textContent = analytics.totals.queueItems;
  sysAuditLogs.textContent = analytics.totals.auditLogs;

  adminList.innerHTML =
    (await window.QueueAPI.request("/api/super/admins", { auth: true })).admins
      .map((admin) => `<div class="chip">${admin.name} <span>${admin.email}</span></div>`)
      .join("") || "No admins yet.";

  auditLogs.innerHTML =
    (logs.logs || [])
      .map((log) => `<li>${log.action}</li>`)
      .join("") || "<li>No audit logs.</li>";

  orgList.querySelectorAll("button[data-org]").forEach((button) => {
    button.addEventListener("click", async () => {
      await window.QueueAPI.request(`/api/super/organizations/${button.dataset.org}/suspend`, {
        method: "PATCH",
        auth: true,
      });
      loadDashboard();
    });
  });
}

adminForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await window.QueueAPI.request("/api/super/admins", {
      method: "POST",
      auth: true,
      body: {
        organizationId: adminOrgId.value.trim(),
        name: adminName.value.trim(),
        email: adminEmail.value.trim(),
        phone: adminPhone.value.trim(),
        password: adminPassword.value.trim(),
      },
    });
    adminForm.reset();
    loadDashboard();
  } catch (error) {
    alert(error.message);
  }
});

superLoginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    setState("loading", "Signing in...");
    await window.QueueAPI.login(superEmail.value.trim(), superPassword.value.trim());
    setState("success", "Signed in");
    showDashboard();
    loadDashboard();
  } catch (error) {
    setState("error", error.message);
  }
});

if (sessionStorage.getItem(window.QueueAPI.AUTH_KEY)) {
  showDashboard();
  loadDashboard().catch(() => {});
}
