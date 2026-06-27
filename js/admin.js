const servingToken = document.getElementById("servingToken");
const waitingCustomers = document.getElementById("waitingCustomers");
const totalTokens = document.getElementById("totalTokens");
const completedTokens = document.getElementById("completedTokens");
const adminQueueTable = document.getElementById("adminQueueTable");
const nextTokenBtn = document.getElementById("nextTokenBtn");
const completeTokenBtn = document.getElementById("completeTokenBtn");
const skipTokenBtn = document.getElementById("skipTokenBtn");
const resetQueueBtn = document.getElementById("resetQueueBtn");
const exportBtn = document.getElementById("exportBtn");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const searchResult = document.getElementById("searchResult");
const activityLogs = document.getElementById("activityLogs");
const staffForm = document.getElementById("staffForm");
const staffName = document.getElementById("staffName");
const staffEmail = document.getElementById("staffEmail");
const staffPhone = document.getElementById("staffPhone");
const staffPassword = document.getElementById("staffPassword");
const staffList = document.getElementById("staffList");
const counterForm = document.getElementById("counterForm");
const counterName = document.getElementById("counterName");
const counterList = document.getElementById("counterList");
const socket = window.QueueAPI.createSocket();
let queueCache = [];

function addLog(message) {
  const li = document.createElement("li");
  li.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  activityLogs.prepend(li);
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function updateStats() {
  const waiting = queueCache.filter((q) => q.status === "waiting");
  const serving = queueCache.find((q) => q.status === "serving");
  const completed = queueCache.filter((q) => q.status === "completed");

  servingToken.textContent = serving ? serving.token : "A000";
  waitingCustomers.textContent = waiting.length;
  totalTokens.textContent = queueCache.length;
  completedTokens.textContent = completed.length;
}

function renderQueue() {
  if (!queueCache.length) {
    adminQueueTable.innerHTML = '<tr class="empty-row"><td colspan="3">No queue entries yet.</td></tr>';
    updateStats();
    return;
  }

  adminQueueTable.innerHTML = "";
  queueCache.forEach((item) => {
    const statusClass =
      item.status === "serving"
        ? "status-serving"
        : item.status === "completed"
        ? "status-completed"
        : item.status === "skipped"
        ? "status-skipped"
        : item.status === "missed"
        ? "status-missed"
        : "status-waiting";
    const row = document.createElement("tr");
    row.innerHTML = `<td data-label="Token">${item.token}</td><td data-label="Status" class="${statusClass}">${item.status}</td><td data-label="Created">${formatTime(item.createdAt)}</td>`;
    adminQueueTable.appendChild(row);
  });
  updateStats();
}

async function refreshQueue() {
  adminQueueTable.innerHTML = '<tr class="empty-row"><td colspan="3">Loading queue...</td></tr>';
  const data = await window.QueueAPI.request("/api/queue");
  queueCache = data.queue || [];
  renderQueue();
}

async function refreshManagement() {
  try {
    const [staffRes, counterRes] = await Promise.all([
      window.QueueAPI.request("/api/org/staff", { auth: true }),
      window.QueueAPI.request("/api/org/counters", { auth: true }),
    ]);
    staffList.innerHTML = (staffRes.users || [])
      .map((user) => `<div class="chip">${user.name} <span>${user.email}</span></div>`)
      .join("") || "No staff yet.";
    counterList.innerHTML = (counterRes.counters || [])
      .map((counter) => `<div class="chip">${counter.name}</div>`)
      .join("") || "No counters yet.";
  } catch {
    staffList.textContent = "Login as Organization Admin to manage staff.";
    counterList.textContent = "Login as Organization Admin to manage counters.";
  }
}

async function callNextToken() {
  try {
    await window.QueueAPI.ensureAuth("Staff");
    const data = await window.QueueAPI.request("/api/org/queue/next", { method: "PATCH", auth: true });
    queueCache = data.queue || [];
    renderQueue();
    addLog(data.message || "Queue updated");
  } catch (error) {
    alert(error.message);
  }
}

async function completeCurrent() {
  try {
    await window.QueueAPI.ensureAuth("Staff");
    const data = await window.QueueAPI.request("/api/org/queue/complete", { method: "PATCH", auth: true });
    queueCache = data.queue || [];
    renderQueue();
    addLog(data.message || "Token completed");
  } catch (error) {
    alert(error.message);
  }
}

async function skipCurrent() {
  try {
    await window.QueueAPI.ensureAuth("Staff");
    const data = await window.QueueAPI.request("/api/org/queue/skip", { method: "PATCH", auth: true });
    queueCache = data.queue || [];
    renderQueue();
    addLog(data.message || "Token skipped");
  } catch (error) {
    alert(error.message);
  }
}

async function resetQueue() {
  if (!confirm("Reset complete queue?")) return;
  try {
    await window.QueueAPI.ensureAuth("Organization Admin");
    const data = await window.QueueAPI.request("/api/org/queue", { method: "DELETE", auth: true });
    queueCache = data.queue || [];
    renderQueue();
    addLog(data.message || "Queue reset completed");
  } catch (error) {
    alert(error.message);
  }
}

async function exportCSV() {
  try {
    await window.QueueAPI.ensureAuth("Organization Admin");
    const token = sessionStorage.getItem(window.QueueAPI.AUTH_KEY);
    const orgId = window.QueueAPI.getCurrentOrgId();
    const response = await fetch(`${window.QueueAPI.API_BASE_URL}/api/org/export.csv${orgId ? `?organizationId=${encodeURIComponent(orgId)}` : ""}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error("Export failed");
    const text = await response.text();
    const blob = new Blob([text], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "queue-report.csv";
    a.click();
    URL.revokeObjectURL(url);
    addLog("CSV exported");
  } catch (error) {
    alert(error.message);
  }
}

async function searchToken() {
  const value = searchInput.value.trim();
  if (!value) {
    searchResult.className = "state state-empty";
    searchResult.innerHTML = "Enter token number";
    return;
  }
  try {
    await window.QueueAPI.ensureAuth("Staff");
    const data = await window.QueueAPI.request(`/api/org/queue/search?q=${encodeURIComponent(value)}`, { auth: true });
    const token = data.item;
    searchResult.className = "state state-success";
    searchResult.innerHTML = `<div><h3>${token.token}</h3><p>Status: <strong>${token.status}</strong></p><p>Customer: ${token.customerName}</p><p>Created: ${formatTime(token.createdAt)}</p></div>`;
  } catch (error) {
    searchResult.className = "state state-error";
    searchResult.textContent = error.message;
  }
}

async function addStaff(event) {
  event.preventDefault();
  try {
    await window.QueueAPI.ensureAuth("Organization Admin");
    await window.QueueAPI.request("/api/org/staff", {
      method: "POST",
      auth: true,
      body: {
        name: staffName.value.trim(),
        email: staffEmail.value.trim(),
        phone: staffPhone.value.trim(),
        password: staffPassword.value.trim(),
      },
    });
    staffForm.reset();
    addLog("Staff added");
    refreshManagement();
  } catch (error) {
    alert(error.message);
  }
}

async function addCounter(event) {
  event.preventDefault();
  try {
    await window.QueueAPI.ensureAuth("Organization Admin");
    await window.QueueAPI.request("/api/org/counters", {
      method: "POST",
      auth: true,
      body: { name: counterName.value.trim() },
    });
    counterForm.reset();
    addLog("Counter added");
    refreshManagement();
  } catch (error) {
    alert(error.message);
  }
}

refreshQueue().catch(() => {});
refreshManagement();

socket?.on("queue:update", () => refreshQueue().catch(() => {}));

nextTokenBtn?.addEventListener("click", callNextToken);
completeTokenBtn?.addEventListener("click", completeCurrent);
skipTokenBtn?.addEventListener("click", skipCurrent);
resetQueueBtn?.addEventListener("click", resetQueue);
exportBtn?.addEventListener("click", exportCSV);
searchBtn?.addEventListener("click", searchToken);
staffForm?.addEventListener("submit", addStaff);
counterForm?.addEventListener("submit", addCounter);

addLog("Admin dashboard loaded");
