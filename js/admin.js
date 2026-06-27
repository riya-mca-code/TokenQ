/* ==========================================
   QueueFlow Admin Dashboard
========================================== */

const THEME_KEY = "queueflow_theme";

const servingToken = document.getElementById("servingToken");
const waitingCustomers = document.getElementById("waitingCustomers");
const totalTokens = document.getElementById("totalTokens");
const completedTokens = document.getElementById("completedTokens");
const adminQueueTable = document.getElementById("adminQueueTable");
const nextTokenBtn = document.getElementById("nextTokenBtn");
const completeTokenBtn = document.getElementById("completeTokenBtn");
const resetQueueBtn = document.getElementById("resetQueueBtn");
const exportBtn = document.getElementById("exportBtn");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const searchResult = document.getElementById("searchResult");
const activityLogs = document.getElementById("activityLogs");
const themeToggle = document.getElementById("themeToggle");

const socket = window.QueueAPI.createSocket();
let queueCache = [];

function loadTheme() {
  if (localStorage.getItem(THEME_KEY) === "dark") document.body.classList.add("dark");
}

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
  adminQueueTable.innerHTML = "";
  queueCache.forEach((item) => {
    const statusClass =
      item.status === "serving" ? "status-serving" : item.status === "completed" ? "status-completed" : "status-waiting";
    const row = document.createElement("tr");
    row.innerHTML = `<td>${item.token}</td><td class="${statusClass}">${item.status}</td><td>${formatTime(item.createdAt)}</td>`;
    adminQueueTable.appendChild(row);
  });
  updateStats();
}

async function refresh() {
  const data = await window.QueueAPI.request("/api/queue");
  queueCache = data.queue || [];
  renderQueue();
}

async function callNextToken() {
  try {
    await window.QueueAPI.ensureAuth("Staff");
    const data = await window.QueueAPI.request("/api/queue/next", { method: "PATCH", auth: true });
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
    const data = await window.QueueAPI.request("/api/queue/complete", { method: "PATCH", auth: true });
    queueCache = data.queue || [];
    renderQueue();
    addLog(data.message || "Token completed");
  } catch (error) {
    alert(error.message);
  }
}

async function resetQueue() {
  if (!confirm("Reset complete queue?")) return;

  try {
    await window.QueueAPI.ensureAuth("Admin");
    const data = await window.QueueAPI.request("/api/queue", { method: "DELETE", auth: true });
    queueCache = data.queue || [];
    renderQueue();
    localStorage.removeItem("myToken");
    addLog(data.message || "Queue reset completed");
  } catch (error) {
    alert(error.message);
  }
}

async function exportCSV() {
  const data = await window.QueueAPI.request("/api/queue");
  const queue = data.queue || [];
  let csv = "Token,Status,CreatedAt\n";
  queue.forEach((item) => {
    csv += `${item.token},${item.status},${item.createdAt}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "queueflow-report.csv";
  a.click();
  URL.revokeObjectURL(url);
  addLog("CSV exported");
}

function searchToken() {
  const value = searchInput.value.trim().toUpperCase();
  if (!value) {
    searchResult.innerHTML = "Enter token number";
    return;
  }

  const token = queueCache.find((q) => q.token === value);
  if (!token) {
    searchResult.innerHTML = "<p>Token not found</p>";
    return;
  }

  searchResult.innerHTML = `<div><h3>${token.token}</h3><p>Status: <strong>${token.status}</strong></p><p>Created: ${formatTime(token.createdAt)}</p></div>`;
}

loadTheme();
refresh();

socket?.on("queue:update", refresh);

themeToggle?.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(THEME_KEY, document.body.classList.contains("dark") ? "dark" : "light");
});

nextTokenBtn?.addEventListener("click", callNextToken);
completeTokenBtn?.addEventListener("click", completeCurrent);
resetQueueBtn?.addEventListener("click", resetQueue);
exportBtn?.addEventListener("click", exportCSV);
searchBtn?.addEventListener("click", searchToken);

addLog("Admin dashboard loaded");

/* ==========================================
   End File
========================================== */
